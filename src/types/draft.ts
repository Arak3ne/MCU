export type DraftPhase =
  | "lobby"
  | "choose_side_team"
  | "choose_side_color"
  | "choose_first_pick"
  | "pick_phase_1"
  | "wait_before_pick_phase_2"
  | "pick_phase_2"
  | "completed";

export type DraftTurn = {
  teamId: string;
  slot: number;
};

export type DraftPick = {
  championId: string;
  championName: string;
  teamId: string;
  slot: number;
  lockedByPlayerId: string;
  createdAt: number;
};

export type DraftSessionState = {
  sessionId: string;
  createdAt: number;
  createdByPlayerId: string;
  team1Id: string;
  team2Id: string;
  team1Name: string;
  team2Name: string;
  sideChooserTeamId: string;
  firstPickTeamId: string;
  selectedSide: "blue" | "red" | null;
  sideTeamVotes: Record<string, string>;
  captainTeam1PlayerId: string;
  captainTeam2PlayerId: string;
  readyTeamIds: string[];
  phase: DraftPhase;
  turnIndex: number;
  turnOrder: DraftTurn[];
  picks: DraftPick[];
  pickTurnStartedAt: number | null;
  pickTurnDurationSec: number;
  waitPhaseStartedAt: number | null;
  waitPhaseDurationSec: number;
  hasCompletedMidDraftPause: boolean;
  version: number;
};

export type DraftPresence = {
  playerId: string;
  pseudo: string;
  teamId: string | null;
  isCaptain: boolean;
};

export type DraftAction =
  | { type: "sync_state"; state: DraftSessionState }
  | { type: "toggle_ready"; teamId: string; playerId: string }
  | { type: "pick_champion"; championId: string; championName: string; teamId: string; playerId: string }
  | { type: "advance_phase"; phase: DraftPhase; turnIndex?: number }
  | { type: "heartbeat" };
