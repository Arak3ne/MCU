import { supabase } from '../lib/supabase'

export type PlayerAvatarConfigRow = {
  player_id: string
  dicebear_version: string
  style: string
  seed: string
  options: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export async function fetchPlayerAvatarConfig(playerId: string): Promise<PlayerAvatarConfigRow | null> {
  const { data, error } = await supabase
    .from('player_avatar_config')
    .select('*')
    .eq('player_id', playerId)
    .maybeSingle()

  if (error) throw error
  return data as PlayerAvatarConfigRow | null
}

export async function fetchPlayerAvatarConfigsByIds(playerIds: string[]): Promise<PlayerAvatarConfigRow[]> {
  if (playerIds.length === 0) return []
  const { data, error } = await supabase.from('player_avatar_config').select('*').in('player_id', playerIds)
  if (error) throw error
  return (data ?? []) as PlayerAvatarConfigRow[]
}

export async function upsertPlayerAvatarConfig(payload: {
  player_id: string
  seed: string
  options: Record<string, unknown>
}): Promise<void> {
  const { error } = await supabase.from('player_avatar_config').upsert(
    {
      player_id: payload.player_id,
      dicebear_version: '9.x',
      style: 'avataaars',
      seed: payload.seed,
      options: payload.options,
    },
    { onConflict: 'player_id' }
  )
  if (error) throw error
}
