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
