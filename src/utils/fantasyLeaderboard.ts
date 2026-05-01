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

  // Deduct penalty points
  if (team.penaltyPoints) {
    totalPoints -= team.penaltyPoints
  }

  // Use Math.round to avoid floating point issues if necessary,
  // or return the raw decimal if the fantasy league uses fractional points.
  return Math.round(totalPoints * 10) / 10 
}
