import { ref, computed, readonly } from 'vue'
import type { Ref } from 'vue'
import type { FantasyTeam, FantasyPlayer } from '../types/fantasy'
import { validateFantasyTeam } from '../utils/fantasyValidation'
import { fantasyService } from '../services/fantasyService'
import { calculateTeamPoints } from '../utils/fantasyLeaderboard'

export function useFantasyTeam(userId: Ref<string | null>, tournamentDay: Ref<1 | 2>) {
  const team = ref<FantasyTeam | null>(null)
  const previousTeam = ref<FantasyTeam | null>(null)
  const selectedPlayers = ref<FantasyPlayer[]>([])
  const captainId = ref<string | null>(null)
  const teamName = ref<string>('MON ÉQUIPE')
  
  const isLoading = ref(false)
  const isSaving = ref(false)
  const isSavingName = ref(false)
  const error = ref<string | null>(null)
  const validationResult = ref<ReturnType<typeof validateFantasyTeam> | null>(null)
  const validationErrors = computed(() => validationResult.value?.errors || [])

  // Load team on initialization
  const loadTeam = async () => {
    if (!userId.value) return
    
    isLoading.value = true
    error.value = null
    try {
      // Always try to load Day 1 team to have it as reference for Day 2 transfers/budget
      previousTeam.value = await fantasyService.getTeam(userId.value, 1)

      const fetchedTeam = await fantasyService.getTeam(userId.value, tournamentDay.value)
      if (fetchedTeam) {
        team.value = fetchedTeam
        captainId.value = fetchedTeam.captainId
        teamName.value = fetchedTeam.name
      } else {
        // If Day 2 team doesn't exist but Day 1 does, we might want to initialize it or just show empty
        // The initialize_day2_teams() SQL function handles the migration, but we can also handle the fallback here
        team.value = null
        selectedPlayers.value = []
        captainId.value = null
        teamName.value = previousTeam.value?.name || 'MON ÉQUIPE'
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to load team'
    } finally {
      isLoading.value = false
    }
  }

  // Validation
  const isValid = computed(() => {
    // We need to calculate the value of the previous roster using Day 2 prices
    // But we don't have the Day 2 prices of the previous roster here unless we map them.
    // Wait, `selectedPlayers` has the current players. Where do we get the previous roster's Day 2 prices?
    // Let's assume the component will pass `allPlayers` to `hydratePlayers`, and we can keep a reference to `allPlayers` to find prices.
    return validationResult.value?.isValid ?? false
  })

  const carriedOverBudget = computed(() => {
    if (tournamentDay.value === 2) {
      if (team.value) {
        return team.value.carriedOverBudget ?? 0
      } else if (previousTeam.value) {
        const day1Cost = previousTeam.value.playerIds.reduce((sum, id) => {
          const p = knownPlayers.value.find(player => player.id === id)
          return sum + (p ? p.price : 0)
        }, 0)
        return 100 - day1Cost
      }
    }
    return 0
  })

  const validate = (allPlayers: FantasyPlayer[]) => {
    let previousRosterValue = 0
    let carriedOverBudgetVal = carriedOverBudget.value
    let previousTeamRoster: string[] = []

    if (tournamentDay.value === 2 && previousTeam.value) {
      previousTeamRoster = previousTeam.value.playerIds
      previousRosterValue = previousTeamRoster.reduce((sum, id) => {
        const p = allPlayers.find(player => player.id === id)
        return sum + (p ? (p.priceDay2 ?? p.price) : 0)
      }, 0)
    }

    validationResult.value = validateFantasyTeam(
      selectedPlayers.value,
      captainId.value,
      tournamentDay.value,
      previousTeamRoster,
      carriedOverBudgetVal,
      previousRosterValue
    )
  }

  const knownPlayers = ref<FantasyPlayer[]>([])

  // Hydrate selected players (called by component after fetching players list)
  const hydratePlayers = (allPlayers: FantasyPlayer[]) => {
    knownPlayers.value = allPlayers
    if (!team.value) {
      // If we are on Day 2 and have no Day 2 team yet, initialize selectedPlayers with Day 1 roster
      if (tournamentDay.value === 2 && previousTeam.value) {
        selectedPlayers.value = previousTeam.value.playerIds
          .map(id => allPlayers.find(p => p.id === id))
          .filter((p): p is FantasyPlayer => p !== undefined)
        captainId.value = previousTeam.value.captainId
      } else {
        selectedPlayers.value = []
      }
      validate(allPlayers)
      return
    }
    
    selectedPlayers.value = team.value.playerIds
      .map(id => allPlayers.find(p => p.id === id))
      .filter((p): p is FantasyPlayer => p !== undefined)
    
    validate(allPlayers)
  }

  const previousRosterValue = computed(() => {
    if (tournamentDay.value === 2 && previousTeam.value) {
      return previousTeam.value.playerIds.reduce((sum, id) => {
        const p = knownPlayers.value.find(player => player.id === id)
        return sum + (p ? (p.priceDay2 ?? p.price) : 0)
      }, 0)
    }
    return 0
  })

  // Budget info
  const budgetUsed = computed(() => validationResult.value?.totalCost ?? 0)
  const budgetRemaining = computed(() => (validationResult.value?.maxBudget ?? 100) - budgetUsed.value)
  const maxBudget = computed(() => validationResult.value?.maxBudget ?? 100)
  const transfersMade = computed(() => validationResult.value?.transfersMade ?? 0)
  const penaltyPoints = computed(() => validationResult.value?.penaltyPoints ?? 0)

  // Actions
  const addPlayer = (player: FantasyPlayer) => {
    if (team.value?.isLocked) return
    if (selectedPlayers.value.length >= 5) return
    if (selectedPlayers.value.some(p => p.id === player.id)) return
    
    // Enforce role limit on add to prevent UI confusion
    const primaryRole = player.roles[0]?.toLowerCase()
    if (primaryRole) {
      const hasRole = selectedPlayers.value.some(p => p.roles[0]?.toLowerCase() === primaryRole)
      if (hasRole) {
        // Automatically remove the existing player with the same role
        selectedPlayers.value = selectedPlayers.value.filter(p => p.roles[0]?.toLowerCase() !== primaryRole)
      }
    }
    
    selectedPlayers.value.push(player)
    validate(knownPlayers.value)
  }

  const removePlayer = (playerId: string) => {
    if (team.value?.isLocked) return
    selectedPlayers.value = selectedPlayers.value.filter(p => p.id !== playerId)
    if (captainId.value === playerId) {
      captainId.value = null
    }
    validate(knownPlayers.value)
  }

  const setCaptain = (playerId: string) => {
    if (team.value?.isLocked) return
    if (selectedPlayers.value.some(p => p.id === playerId)) {
      captainId.value = playerId
    }
    validate(knownPlayers.value)
  }

  const saveTeam = async () => {
    if (!userId.value) {
      error.value = 'User not authenticated'
      return false
    }
    
    if (!isValid.value) {
      error.value = 'Team is invalid'
      return false
    }

    if (team.value?.isLocked) {
      error.value = 'Team is locked and cannot be edited'
      return false
    }

    isSaving.value = true
    error.value = null

    try {
      const saved = await fantasyService.saveTeam({
        id: team.value?.id,
        userId: userId.value,
        tournamentDay: tournamentDay.value,
        name: teamName.value,
        playerIds: selectedPlayers.value.map(p => p.id),
        captainId: captainId.value!,
        transfersMade: transfersMade.value,
        penaltyPoints: penaltyPoints.value,
        carriedOverBudget: carriedOverBudget.value
      })
      team.value = saved
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to save team'
      return false
    } finally {
      isSaving.value = false
    }
  }

  /** Enregistre uniquement le nom (classement / affichage), y compris si l'équipe est verrouillée. */
  const saveTeamName = async (): Promise<boolean> => {
    if (!userId.value || !team.value?.id) {
      error.value = 'Équipe introuvable'
      return false
    }
    isSavingName.value = true
    error.value = null
    try {
      await fantasyService.updateTeamName(team.value.id, userId.value, teamName.value)
      const trimmed = teamName.value.trim().slice(0, 64)
      const finalName =
        trimmed.length > 0 ? trimmed : `Team ${userId.value.substring(0, 5)}`
      teamName.value = finalName
      team.value = { ...team.value, name: finalName }
      return true
    } catch (err: any) {
      error.value = err.message || 'Impossible de mettre à jour le nom'
      return false
    } finally {
      isSavingName.value = false
    }
  }

  // Points calculation helper (useful for previewing points if scores are available)
  const getLivePoints = (playerScores: Record<string, number>) => {
    if (!team.value) return 0
    return calculateTeamPoints(team.value, playerScores)
  }

  return {
    team,
    previousTeam: readonly(previousTeam),
    selectedPlayers,
    captainId: readonly(captainId),
    teamName,
    isLoading: readonly(isLoading),
    isSaving: readonly(isSaving),
    isSavingName: readonly(isSavingName),
    error: readonly(error),
    validationErrors: readonly(validationErrors),
    isValid,
    budgetUsed,
    budgetRemaining,
    maxBudget,
    carriedOverBudget,
    previousRosterValue,
    transfersMade,
    penaltyPoints,
    loadTeam,
    hydratePlayers,
    addPlayer,
    removePlayer,
    setCaptain,
    saveTeam,
    saveTeamName,
    getLivePoints
  }
}
