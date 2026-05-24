import type { DraftPhase, DraftPick, DraftSessionState, DraftTurn } from "../types/draft";

export const WAIT_PHASE_DURATION_SECONDS = 45;
export const PICK_TURN_DURATION_SECONDS = 30;
export const PICK_COUNT_PER_TEAM = 5;
const PICKS_IN_PHASE_1_PER_TEAM = 3;

function buildSerpentineOrder(firstPickTeamId: string, otherTeamId: string, picksPerTeam: number): DraftTurn[] {
  if (picksPerTeam !== 5) {
    throw new Error("Unsupported picksPerTeam. Expected 5.");
  }
  // LoL snake-like order for 5 picks each:
  // A, B, B, A, A, B, B, A, A, B
  const sliced = [
    firstPickTeamId,
    otherTeamId,
    otherTeamId,
    firstPickTeamId,
    firstPickTeamId,
    otherTeamId,
    otherTeamId,
    firstPickTeamId,
    firstPickTeamId,
    otherTeamId,
  ];
  const slotsByTeam = new Map<string, number>();
  return sliced.map((teamId) => {
    const slot = (slotsByTeam.get(teamId) ?? 0) + 1;
    slotsByTeam.set(teamId, slot);
    return { teamId, slot };
  });
}

export function buildTurnOrder(firstPickTeamId: string, team1Id: string, team2Id: string): DraftTurn[] {
  const otherTeamId = firstPickTeamId === team1Id ? team2Id : team1Id;
  return buildSerpentineOrder(firstPickTeamId, otherTeamId, PICK_COUNT_PER_TEAM);
}

export function createInitialDraftState(params: {
  sessionId: string;
  createdByPlayerId: string;
  team1Id: string;
  team2Id: string;
  team1Name: string;
  team2Name: string;
  sideChooserTeamId: string;
  firstPickTeamId: string;
  captainTeam1PlayerId: string;
  captainTeam2PlayerId: string;
}): DraftSessionState {
  return {
    sessionId: params.sessionId,
    createdAt: Date.now(),
    createdByPlayerId: params.createdByPlayerId,
    team1Id: params.team1Id,
    team2Id: params.team2Id,
    team1Name: params.team1Name,
    team2Name: params.team2Name,
    sideChooserTeamId: params.sideChooserTeamId,
    firstPickTeamId: params.firstPickTeamId,
    selectedSide: null,
    sideTeamVotes: {},
    captainTeam1PlayerId: params.captainTeam1PlayerId,
    captainTeam2PlayerId: params.captainTeam2PlayerId,
    readyTeamIds: [],
    phase: "lobby",
    turnIndex: 0,
    turnOrder: [],
    picks: [],
    pickTurnStartedAt: null,
    pickTurnDurationSec: PICK_TURN_DURATION_SECONDS,
    waitPhaseStartedAt: null,
    waitPhaseDurationSec: WAIT_PHASE_DURATION_SECONDS,
    hasCompletedMidDraftPause: false,
    version: 1,
  };
}

function getPhaseFromPickCount(currentPicks: number): DraftPhase {
  if (currentPicks < PICKS_IN_PHASE_1_PER_TEAM * 2) {
    return "pick_phase_1";
  }
  if (currentPicks < PICK_COUNT_PER_TEAM * 2) {
    return "pick_phase_2";
  }
  return "completed";
}

export function canTeamActThisTurn(state: DraftSessionState, teamId: string): boolean {
  if (state.phase !== "pick_phase_1" && state.phase !== "pick_phase_2") return false;
  const turn = state.turnOrder[state.turnIndex];
  return !!turn && turn.teamId === teamId;
}

export function startDraftIfReady(state: DraftSessionState): DraftSessionState {
  if (state.phase !== "lobby") return state;
  const bothReady =
    state.readyTeamIds.includes(state.team1Id) && state.readyTeamIds.includes(state.team2Id);
  if (!bothReady) return state;
  return {
    ...state,
    phase: "choose_side_team",
    turnIndex: 0,
    pickTurnStartedAt: null,
    version: state.version + 1,
  };
}

export function toggleReady(state: DraftSessionState, teamId: string): DraftSessionState {
  const hasReady = state.readyTeamIds.includes(teamId);
  const readyTeamIds = hasReady
    ? state.readyTeamIds.filter((id) => id !== teamId)
    : [...state.readyTeamIds, teamId];
  return startDraftIfReady({
    ...state,
    readyTeamIds,
    version: state.version + 1,
  });
}

export function lockChampionPick(
  state: DraftSessionState,
  pick: Omit<DraftPick, "slot" | "createdAt">,
): DraftSessionState {
  if (!canTeamActThisTurn(state, pick.teamId)) return state;
  if (state.picks.some((p) => p.championId === pick.championId)) return state;

  const turn = state.turnOrder[state.turnIndex];
  if (!turn) return state;

  const nextPick: DraftPick = {
    ...pick,
    slot: turn.slot,
    createdAt: Date.now(),
  };
  const picks = [...state.picks, nextPick];
  const nextTurnIndex = state.turnIndex + 1;
  const nextPhase = getPhaseFromPickCount(picks.length);

  if (nextPhase === "pick_phase_1" || nextPhase === "pick_phase_2") {
    return {
      ...state,
      picks,
      turnIndex: nextTurnIndex,
      phase: nextPhase,
      pickTurnStartedAt: Date.now(),
      version: state.version + 1,
    };
  }

  if (nextPhase === "completed") {
    return {
      ...state,
      picks,
      phase: "completed",
      turnIndex: state.turnOrder.length,
      pickTurnStartedAt: null,
      version: state.version + 1,
    };
  }

  return state;
}

export function enterWaitPhase(state: DraftSessionState): DraftSessionState {
  if (state.phase === "completed" || state.phase === "wait_before_pick_phase_2") return state;
  if (state.hasCompletedMidDraftPause) return state;
  const phase1PickCount = PICKS_IN_PHASE_1_PER_TEAM * 2;
  if (state.picks.length < phase1PickCount) return state;
  if (state.picks.length >= PICK_COUNT_PER_TEAM * 2) return state;
  return {
    ...state,
    phase: "wait_before_pick_phase_2",
    pickTurnStartedAt: null,
    waitPhaseStartedAt: Date.now(),
    version: state.version + 1,
  };
}

export function maybeExitWaitPhase(state: DraftSessionState, now = Date.now()): DraftSessionState {
  if (state.phase !== "wait_before_pick_phase_2" || !state.waitPhaseStartedAt) return state;
  const elapsedMs = now - state.waitPhaseStartedAt;
  if (elapsedMs < state.waitPhaseDurationSec * 1000) return state;
  return {
    ...state,
    phase: "pick_phase_2",
    turnIndex: state.picks.length,
    pickTurnStartedAt: Date.now(),
    waitPhaseStartedAt: null,
    hasCompletedMidDraftPause: true,
    version: state.version + 1,
  };
}

export function maybeAutoSkipTurn(state: DraftSessionState, now = Date.now()): DraftSessionState {
  if (state.phase !== "pick_phase_1" && state.phase !== "pick_phase_2") return state;
  if (!state.pickTurnStartedAt) return state;

  const elapsedMs = now - state.pickTurnStartedAt;
  if (elapsedMs < state.pickTurnDurationSec * 1000) return state;

  const timeoutChampionId = `__empty_pick__${state.turnIndex}`;
  return lockChampionPick(state, {
    championId: timeoutChampionId,
    championName: "VIDE",
    teamId: state.turnOrder[state.turnIndex]?.teamId ?? "",
    lockedByPlayerId: "__timeout__",
  });
}

export function setSideTeamVote(
  state: DraftSessionState,
  captainPlayerId: string,
  chosenTeamId: string,
): DraftSessionState {
  if (state.phase !== "choose_side_team") return state;
  if (chosenTeamId !== state.team1Id && chosenTeamId !== state.team2Id) return state;
  const isCaptain =
    captainPlayerId === state.captainTeam1PlayerId || captainPlayerId === state.captainTeam2PlayerId;
  if (!isCaptain) return state;

  const sideTeamVotes = { ...state.sideTeamVotes, [captainPlayerId]: chosenTeamId };
  const vote1 = sideTeamVotes[state.captainTeam1PlayerId];
  const vote2 = sideTeamVotes[state.captainTeam2PlayerId];
  const hasConsensus = !!vote1 && !!vote2 && vote1 === vote2;

  if (!hasConsensus) {
    return {
      ...state,
      sideTeamVotes,
      version: state.version + 1,
    };
  }

  return {
    ...state,
    sideTeamVotes,
    sideChooserTeamId: vote1,
    phase: "choose_side_color",
    version: state.version + 1,
  };
}

export function setSideColor(
  state: DraftSessionState,
  captainPlayerId: string,
  side: "blue" | "red",
): DraftSessionState {
  if (state.phase !== "choose_side_color") return state;
  const sideChooserTeamId = state.sideChooserTeamId;
  if (!sideChooserTeamId) return state;
  const expectedCaptain =
    sideChooserTeamId === state.team1Id ? state.captainTeam1PlayerId : state.captainTeam2PlayerId;
  if (captainPlayerId !== expectedCaptain) return state;

  return {
    ...state,
    selectedSide: side,
    phase: "choose_first_pick",
    version: state.version + 1,
  };
}

export function setSecondCaptainFirstPickDecision(
  state: DraftSessionState,
  captainPlayerId: string,
  wantsFirstPick: boolean,
): DraftSessionState {
  if (state.phase !== "choose_first_pick") return state;
  if (!state.sideChooserTeamId) return state;

  const secondCaptainId =
    state.sideChooserTeamId === state.team1Id ? state.captainTeam2PlayerId : state.captainTeam1PlayerId;
  const secondCaptainTeamId =
    state.sideChooserTeamId === state.team1Id ? state.team2Id : state.team1Id;
  if (captainPlayerId !== secondCaptainId) return state;

  const firstPickTeamId = wantsFirstPick ? secondCaptainTeamId : state.sideChooserTeamId;
  const turnOrder = buildTurnOrder(firstPickTeamId, state.team1Id, state.team2Id);
  return {
    ...state,
    firstPickTeamId,
    turnOrder,
    turnIndex: 0,
    phase: "pick_phase_1",
    pickTurnStartedAt: Date.now(),
    version: state.version + 1,
  };
}

export function getCurrentTurn(state: DraftSessionState): DraftTurn | null {
  if (state.phase !== "pick_phase_1" && state.phase !== "pick_phase_2") return null;
  return state.turnOrder[state.turnIndex] ?? null;
}
