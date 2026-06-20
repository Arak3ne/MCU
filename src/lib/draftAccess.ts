import type { Router } from 'vue-router'
import { supabase } from './supabase'

export type DraftAccessPlayer = {
  id: string
  team_id?: string | null
  can_spectate_drafts?: boolean | null
}

export type DraftMatchTeams = {
  id?: string
  is_completed?: boolean
  team1?: { id: string } | null
  team2?: { id: string } | null
}

export function playerCanSpectateAllDrafts(player: DraftAccessPlayer | null | undefined): boolean {
  return player?.can_spectate_drafts === true
}

export function playerIsInDraftMatch(
  player: DraftAccessPlayer | null | undefined,
  team1Id: string,
  team2Id: string,
): boolean {
  const teamId = player?.team_id
  if (!teamId) return false
  return teamId === team1Id || teamId === team2Id
}

export function draftButtonLabel(
  player: DraftAccessPlayer | null | undefined,
  match: DraftMatchTeams,
): 'Draft' | 'Spectate' {
  if (!match.team1 || !match.team2) return 'Draft'
  if (
    playerCanSpectateAllDrafts(player)
    && !playerIsInDraftMatch(player, match.team1.id, match.team2.id)
  ) {
    return 'Spectate'
  }
  return 'Draft'
}

async function loadCurrentPlayerForDraft(): Promise<DraftAccessPlayer | null> {
  const userStr = localStorage.getItem('mcu_user')
  if (!userStr) return null

  try {
    const user = JSON.parse(userStr) as DraftAccessPlayer & Record<string, unknown>
    const { data: latestUser } = await supabase
      .from('players')
      .select('id, team_id, can_spectate_drafts')
      .eq('id', user.id)
      .single()

    if (latestUser) {
      user.team_id = latestUser.team_id
      user.can_spectate_drafts = latestUser.can_spectate_drafts
      localStorage.setItem('mcu_user', JSON.stringify(user))
      return latestUser
    }
    return user
  } catch {
    return null
  }
}

export async function refreshDraftSpectatorFlag(): Promise<boolean> {
  const player = await loadCurrentPlayerForDraft()
  return playerCanSpectateAllDrafts(player)
}

export async function openDraftRoomForMatch(
  router: Router,
  match: DraftMatchTeams,
  options: {
    roundOk?: boolean
    onError: (message: string) => void
  },
): Promise<void> {
  if (!match.team1 || !match.team2) return

  if (match.is_completed) {
    options.onError('Ce match est déjà terminé. Impossible de lancer une nouvelle draft.')
    return
  }

  const player = await loadCurrentPlayerForDraft()
  if (!player?.id) {
    options.onError('Vous devez être connecté pour lancer une draft.')
    return
  }

  const canSpectateAll = playerCanSpectateAllDrafts(player)
  const inMatch = playerIsInDraftMatch(player, match.team1.id, match.team2.id)

  if (!canSpectateAll) {
    if (options.roundOk === false) {
      options.onError(
        'Vous ne pouvez pas lancer la draft pour ce round tant que les matchs des rounds précédents ne sont pas terminés.',
      )
      return
    }
    if (!inMatch) {
      options.onError('Vous ne pouvez lancer la draft que pour les matchs de votre équipe.')
      return
    }
  }

  if (!match.id) return
  await router.push({ name: 'draft-room', params: { sessionId: match.id } })
}
