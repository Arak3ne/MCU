import type { FantasyPlayer } from '../types/fantasy'

export interface FantasyValidationResult {
  isValid: boolean
  errors: string[]
  transfersMade: number
  penaltyPoints: number
  maxBudget: number
  totalCost: number
}

const MAX_BUDGET = 100
const MAX_TEAM_SIZE = 5
const MAX_S_TIER = 1
const MAX_S_AND_A_TIER = 3

export function validateFantasyTeam(
  selectedPlayers: FantasyPlayer[],
  captainId: string | null,
  tournamentDay: 1 | 2 = 1,
  previousTeamRoster: string[] = [],
  carriedOverBudget: number = 0,
  previousRosterValue: number = 0
): FantasyValidationResult {
  const errors: string[] = []
  let transfersMade = 0
  let penaltyPoints = 0
  let maxBudget = MAX_BUDGET
  let totalCost = 0

  // Rule: 5 players per team
  if (selectedPlayers.length !== MAX_TEAM_SIZE) {
    errors.push(`Team must have exactly ${MAX_TEAM_SIZE} players. Currently: ${selectedPlayers.length}`)
  }

  // Calculate Budget and Transfers
  if (tournamentDay === 1) {
    totalCost = selectedPlayers.reduce((sum, p) => sum + p.price, 0)
    if (totalCost > maxBudget) {
      errors.push(`Budget exceeded. Max is ${maxBudget}, used ${totalCost}`)
    }
  } else if (tournamentDay === 2) {
    totalCost = selectedPlayers.reduce((sum, p) => sum + p.price, 0)
    
    // Calculate transfers made
    const currentRosterIds = selectedPlayers.map(p => p.id)
    transfersMade = currentRosterIds.filter(id => !previousTeamRoster.includes(id)).length
    
    if (transfersMade > 2) {
      penaltyPoints = (transfersMade - 2) * 20
    }

    maxBudget = carriedOverBudget + previousRosterValue
    if (totalCost > maxBudget) {
      errors.push(`Budget exceeded. Max is ${maxBudget}, used ${totalCost}`)
    }
  }

  // Rule: 1 captain
  if (!captainId) {
    errors.push('A captain must be selected')
  } else {
    const isCaptainInTeam = selectedPlayers.some(p => p.id === captainId)
    if (!isCaptainInTeam) {
      errors.push('Captain must be one of the selected team members')
    }
  }

  // Rule: Only fantasy_enabled players
  const disabledPlayers = selectedPlayers.filter(p => !p.fantasyEnabled)
  if (disabledPlayers.length > 0) {
    errors.push(`Some players are not available for Morue-verse: ${disabledPlayers.map(p => p.pseudo).join(', ')}`)
  }

  // Rule: 1 player per role
  const rolesCount: Record<string, number> = {
    'top': 0,
    'jungle': 0,
    'mid': 0,
    'adc': 0,
    'support': 0
  }
  
  selectedPlayers.forEach(p => {
    // We assume the first role in the array is the primary role they are drafted for
    const primaryRole = p.roles[0]?.toLowerCase()
    if (primaryRole && rolesCount[primaryRole] !== undefined) {
      rolesCount[primaryRole]++
    }
  })

  Object.entries(rolesCount).forEach(([role, count]) => {
    if (count > 1) {
      errors.push(`Maximum 1 player allowed for role: ${role.toUpperCase()}. Currently: ${count}`)
    }
  })

  // Rule: Max 1 S tier, Max 3 S/A tier
  let sCount = 0
  let saCount = 0

  selectedPlayers.forEach(p => {
    if (p.rank === 'S') {
      sCount++
      saCount++
    } else if (p.rank === 'A') {
      saCount++
    }
  })

  if (sCount > MAX_S_TIER) {
    errors.push(`Maximum ${MAX_S_TIER} S-tier player allowed. Currently: ${sCount}`)
  }

  if (saCount > MAX_S_AND_A_TIER) {
    errors.push(`Maximum ${MAX_S_AND_A_TIER} S/A-tier players allowed. Currently: ${saCount}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    transfersMade,
    penaltyPoints,
    maxBudget,
    totalCost
  }
}
