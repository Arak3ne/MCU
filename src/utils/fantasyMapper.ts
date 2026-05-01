import type { Database } from '../types/supabase'
import type { FantasyPlayer, Tier } from '../types/fantasy'

type DbPlayer = Database['public']['Tables']['players']['Row'] & {
  fantasy_price?: number;
  fantasy_price_day2?: number;
  fantasy_enabled?: boolean;
}

// Default prices if not provided in DB
const TIER_PRICES: Record<string, number> = {
  'S': 28,
  'A': 22,
  'B': 18,
  'C': 12,
  'D': 8
}

export function mapDbPlayerToFantasy(dbPlayer: DbPlayer): FantasyPlayer {
  const rank = (dbPlayer.rank || 'C').toUpperCase() as Tier
  const price = dbPlayer.fantasy_price ?? (TIER_PRICES[rank] || 15)
  const isEnabled = dbPlayer.fantasy_enabled ?? true // Assume true if not specified, though rules say "only fantasy_enabled players"

  return {
    id: dbPlayer.id,
    pseudo: dbPlayer.pseudo,
    rank,
    roles: [dbPlayer.primary_role, dbPlayer.secondary_role].filter((r): r is string => Boolean(r)),
    price,
    priceDay2: dbPlayer.fantasy_price_day2 ?? undefined,
    fantasyEnabled: isEnabled
  }
}

export function filterAvailableFantasyPlayers(players: FantasyPlayer[]): FantasyPlayer[] {
  return players.filter(p => p.fantasyEnabled)
}
