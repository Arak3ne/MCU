import type { Database } from '../types/supabase'
import type { FantasyPlayer, Tier } from '../types/fantasy'

type DbPlayer = Database['public']['Tables']['players']['Row'] & {
  fantasy_cost?: number;
  fantasy_enabled?: boolean;
}

// Default prices if not provided in DB
export const TIER_PRICES: Record<string, number> = {
  'S': 30,
  'A': 25,
  'B': 20,
  'C': 15,
  'D': 10
}

export function mapDbPlayerToFantasy(dbPlayer: DbPlayer): FantasyPlayer {
  const rank = (dbPlayer.rank || 'C').toUpperCase() as Tier
  const price = dbPlayer.fantasy_cost ?? (TIER_PRICES[rank] || 15)
  const isEnabled = dbPlayer.fantasy_enabled ?? true // Assume true if not specified, though rules say "only fantasy_enabled players"

  return {
    id: dbPlayer.id,
    pseudo: dbPlayer.pseudo,
    rank,
    roles: [dbPlayer.primary_role, dbPlayer.secondary_role].filter((r): r is string => Boolean(r)),
    price,
    fantasyEnabled: isEnabled
  }
}

export function filterAvailableFantasyPlayers(players: FantasyPlayer[]): FantasyPlayer[] {
  return players.filter(p => p.fantasyEnabled)
}
