import { ref, computed, readonly, watch } from 'vue'
import type { Ref } from 'vue'
import type { FantasyTeam, FantasyPlayer } from '../types/fantasy'
import { validateFantasyTeam, MAX_BUDGET } from '../utils/fantasyValidation'
import { resolveMercatoRosterPlayerIds } from '../utils/fantasyMercato'
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

  /** Valeur J2 du roster J1 figée à l'ouverture du mercato. */
  const initialMercatoRosterValue = ref(0)

  const snapshotInitialMercatoRosterValue = (allPlayers: FantasyPlayer[]) => {
    if (tournamentDay.value !== 2 || !previousTeam.value?.playerIds?.length) {
      initialMercatoRosterValue.value = 0
      return
    }
    initialMercatoRosterValue.value = previousTeam.value.playerIds.reduce((sum, id) => {
      const p = allPlayers.find((player) => player.id === id)
      return sum + (p?.price ?? 0)
    }, 0)
  }

  const mercatoBasePlafond = computed(() => {
    const pen = validationResult.value?.penaltyPoints ?? 0
    return Math.max(0, carriedOverBudget.value + initialMercatoRosterValue.value - pen)
  })

  const projectedBudgetUsed = (player: FantasyPlayer): number => {
    const primaryRole = player.roles[0]?.toLowerCase()
    const currentUsed = selectedPlayers.value.reduce((sum, p) => sum + p.price, 0)
    if (!primaryRole) return currentUsed + player.price
    const existing = selectedPlayers.value.find(
      (p) => p.roles[0]?.toLowerCase() === primaryRole,
    )
    if (existing) return currentUsed - existing.price + player.price
    return currentUsed + player.price
  }

  const loadTeam = async () => {
    if (!userId.value) return
    
    isLoading.value = true
    error.value = null
    try {
      // Always try to load Day 1 team to have it as reference for Day 2 transfers/budget
      previousTeam.value = await fantasyService.getTeam(userId.value, 1)

      let fetchedTeam = await fantasyService.getTeam(userId.value, tournamentDay.value)
      if (!fetchedTeam && tournamentDay.value === 2 && previousTeam.value) {
        fetchedTeam = await fantasyService.ensureDay2TeamForUser(userId.value)
      }

      if (fetchedTeam) {
        team.value = fetchedTeam
        captainId.value = fetchedTeam.captainId
        teamName.value = fetchedTeam.name
      } else {
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

  const storedCarried = (t: FantasyTeam | null): number | undefined => {
    if (!t?.id) return undefined
    const raw = t.carriedOverBudget
    if (raw === undefined || raw === null) return undefined
    const n = Number(raw)
    return Number.isFinite(n) ? n : undefined
  }

  /**
   * Reliquat mercato : fusionne les sources car la ligne jour 2 peut avoir `carried_over_budget = 0`
   * alors que le snapshot SQL ne met à jour que le jour 1 — on prend le max des valeurs cohérentes.
   */
  const carriedOverBudget = computed(() => {
    if (tournamentDay.value !== 2)
      return 0

    const candidates: number[] = []
    const d1 = storedCarried(previousTeam.value)
    const d2 = team.value?.id ? storedCarried(team.value) : undefined
    if (d1 !== undefined)
      candidates.push(d1)
    if (d2 !== undefined)
      candidates.push(d2)

    if (
      previousTeam.value?.playerIds?.length
      && knownPlayers.value.length > 0
    ) {
      const day1Cost = previousTeam.value.playerIds.reduce((sum, id) => {
        const p = knownPlayers.value.find(player => player.id === id)
        return sum + (p?.fantasyPriceDay1 ?? 0)
      }, 0)
      candidates.push(Math.max(0, 100 - day1Cost))
    }

    if (candidates.length === 0)
      return 0
    return Math.max(...candidates)
  })

  const validate = () => {
    let previousTeamRoster: string[] = []

    if (tournamentDay.value === 2 && previousTeam.value) {
      previousTeamRoster = previousTeam.value.playerIds
    }

    validationResult.value = validateFantasyTeam(
      selectedPlayers.value,
      captainId.value,
      tournamentDay.value,
      previousTeamRoster,
      carriedOverBudget.value,
      initialMercatoRosterValue.value,
    )
  }

  const knownPlayers = ref<FantasyPlayer[]>([])

  // Hydrate selected players (called by component after fetching players list)
  const hydratePlayers = (allPlayers: FantasyPlayer[]) => {
    knownPlayers.value = allPlayers

    let rosterIds: string[] = []
    if (tournamentDay.value === 2 && previousTeam.value) {
      rosterIds = resolveMercatoRosterPlayerIds(
        previousTeam.value.playerIds,
        team.value
          ? {
              playerIds: team.value.playerIds,
              isLocked: team.value.isLocked,
              transfersMade: team.value.transfersMade ?? 0,
            }
          : null,
      )
    } else if (team.value?.playerIds?.length) {
      rosterIds = team.value.playerIds
    }

    selectedPlayers.value = rosterIds
      .map((id) => allPlayers.find((p) => p.id === id))
      .filter((p): p is FantasyPlayer => p !== undefined)

    if (tournamentDay.value === 2 && previousTeam.value) {
      const preferCaptain =
        rosterIds.includes(previousTeam.value.captainId)
          ? previousTeam.value.captainId
          : team.value?.captainId && rosterIds.includes(team.value.captainId)
            ? team.value.captainId
            : null
      if (preferCaptain) captainId.value = preferCaptain
    } else if (team.value?.captainId && rosterIds.includes(team.value.captainId)) {
      captainId.value = team.value.captainId
    }

    snapshotInitialMercatoRosterValue(allPlayers)
    validate()
  }

  const previousRosterValue = computed(() => initialMercatoRosterValue.value)

  const budgetUsed = computed(() =>
    selectedPlayers.value.reduce((sum, p) => sum + p.price, 0),
  )

  /** Jour 2 : reliquat + valeur roster J1 (snapshot) − pénalités. Les ventes libèrent via budgetUsed. */
  const maxBudget = computed(() => {
    if (tournamentDay.value === 2 && previousTeam.value) {
      return mercatoBasePlafond.value
    }
    return validationResult.value?.maxBudget ?? MAX_BUDGET
  })

  const budgetRemaining = computed(() => maxBudget.value - budgetUsed.value)

  const canAffordPlayer = (player: FantasyPlayer): boolean => {
    if (tournamentDay.value !== 2) return true
    return projectedBudgetUsed(player) <= maxBudget.value
  }

  const canAddPlayer = (player: FantasyPlayer): boolean => {
    if (team.value?.isLocked || !player.fantasyEnabled) return false
    if (selectedPlayers.value.some((p) => p.id === player.id)) return false
    const primaryRole = player.roles[0]?.toLowerCase()
    const hasSameRole =
      Boolean(primaryRole)
      && selectedPlayers.value.some((p) => p.roles[0]?.toLowerCase() === primaryRole)
    if (selectedPlayers.value.length >= 5 && !hasSameRole) return false
    return canAffordPlayer(player)
  }

  watch(selectedPlayers, () => {
    if (knownPlayers.value.length === 0) return
    validate()
  }, { deep: true })

  /** Resync validation quand carry ou snapshot roster changent. */
  watch([carriedOverBudget, initialMercatoRosterValue, tournamentDay], () => {
    if (knownPlayers.value.length === 0)
      return
    validate()
  })
  const transfersMade = computed(() => validationResult.value?.transfersMade ?? 0)
  const penaltyPoints = computed(() => validationResult.value?.penaltyPoints ?? 0)

  // Actions
  const addPlayer = (player: FantasyPlayer) => {
    if (team.value?.isLocked) return
    if (selectedPlayers.value.some(p => p.id === player.id)) return

    const primaryRole = player.roles[0]?.toLowerCase()
    const nextSelection = [...selectedPlayers.value]

    if (primaryRole) {
      const sameRoleIndex = nextSelection.findIndex(
        (p) => p.roles[0]?.toLowerCase() === primaryRole,
      )
      if (sameRoleIndex >= 0) {
        nextSelection.splice(sameRoleIndex, 1)
      } else if (nextSelection.length >= 5) {
        return
      }
    } else if (nextSelection.length >= 5) {
      return
    }

    if (tournamentDay.value === 2 && projectedBudgetUsed(player) > maxBudget.value) {
      return
    }

    nextSelection.push(player)
    selectedPlayers.value = nextSelection
    validate()
  }

  const removePlayer = (playerId: string) => {
    if (team.value?.isLocked) return
    selectedPlayers.value = selectedPlayers.value.filter(p => p.id !== playerId)
    if (captainId.value === playerId) {
      captainId.value = null
    }
    validate()
  }

  const setCaptain = (playerId: string) => {
    if (team.value?.isLocked) return
    if (selectedPlayers.value.some(p => p.id === playerId)) {
      captainId.value = playerId
    }
    validate()
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
      validate()
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
      if (previousTeam.value) {
        previousTeam.value = { ...previousTeam.value, name: finalName }
      }
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
    mercatoBasePlafond,
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
    getLivePoints,
    canAffordPlayer,
    canAddPlayer,
  }
}
