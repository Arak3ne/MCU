import type { FantasyTeam } from '../types/fantasy'

/**
 * Calculates the total points for a given fantasy team based on the player scores.
 * The captain receives a 1.5x multiplier on their score.
 * 
 * @param team The fantasy team
 * @param playerScores A map of playerId -> validated score
 * @returns The total calculated points for the team
 */
export function calculateTeamPoints(
  team: FantasyTeam,
  playerScores: Record<string, number>
): number {
  let totalPoints = 0

  for (const playerId of team.playerIds) {
    const score = playerScores[playerId] || 0
    const isCaptain = playerId === team.captainId
    
    // Captain gets 1.5x points
    const pointsToAdd = isCaptain ? score * 1.5 : score
    totalPoints += pointsToAdd
  }

  // Use Math.round to avoid floating point issues if necessary,
  // or return the raw decimal if the fantasy league uses fractional points.
  return Math.round(totalPoints * 10) / 10
}

type TeamPointsInput = Pick<
  FantasyTeam,
  'tournamentDay' | 'captainId' | 'playerIds' | 'penaltyPoints'
>

/**
 * Total équipe = somme des scores roster (capitaine ×1.5) − pénalités mercato.
 * Jour 2 : on additionne le total jour 1 (déjà net de pénalités J1).
 */
export function computeFantasyTeamTotal(
  team: TeamPointsInput,
  playerScores: Record<string, number>,
  day1BaseTotal = 0,
): number {
  const rosterPoints = calculateTeamPoints(
    {
      id: '',
      userId: '',
      name: '',
      tournamentDay: team.tournamentDay,
      playerIds: team.playerIds,
      captainId: team.captainId,
      isLocked: false,
      transfersMade: 0,
      penaltyPoints: team.penaltyPoints ?? 0,
      createdAt: '',
      updatedAt: '',
    },
    playerScores,
  )
  const penalty = team.penaltyPoints ?? 0

  if (team.tournamentDay === 2) {
    return Math.round((day1BaseTotal + rosterPoints - penalty) * 10) / 10
  }

  return Math.round((rosterPoints - penalty) * 10) / 10
}

type LeaderboardPickRow = { player_id: string; is_captain: boolean }

function captainMultiplier(isCaptain: boolean): number {
  return isCaptain ? 1.5 : 1
}

/**
 * Score affiché par encadré joueur sur le leaderboard.
 * J1 : score J1 × capitaine.
 * J2 (classement global / cumul) : contribution J1 (si encore dans l'équipe J1) + score J2 normalisé × capitaine J2.
 */
export function computeLeaderboardPickScore(
  pick: { playerId: string; isCaptain: boolean },
  rosterDay: 1 | 2,
  day1Picks: LeaderboardPickRow[] | undefined,
  scoresDay1: Record<string, number>,
  scoresDay2: Record<string, number>,
): number {
  if (rosterDay === 1) {
    return Math.round((scoresDay1[pick.playerId] || 0) * captainMultiplier(pick.isCaptain) * 10) / 10
  }

  const j2Part = (scoresDay2[pick.playerId] || 0) * captainMultiplier(pick.isCaptain)
  const j1Pick = day1Picks?.find((p) => p.player_id === pick.playerId)
  if (!j1Pick) {
    return Math.round(j2Part * 10) / 10
  }

  const j1Part = (scoresDay1[pick.playerId] || 0) * captainMultiplier(j1Pick.is_captain)
  return Math.round((j1Part + j2Part) * 10) / 10
}
