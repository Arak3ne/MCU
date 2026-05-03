import type { Database } from '../types/supabase'
import type { FantasyPlayer, Tier } from '../types/fantasy'

type DbPlayer = Database['public']['Tables']['players']['Row'] & {
  fantasy_cost?: number | null;
  /** Ancien nom en base ; fallback lecture seule si migration pas encore rejouée. */
  fantasy_price?: number | null;
  fantasy_cost_day2?: number | null;
  fantasy_price_day2?: number | null;
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

export function mapDbPlayerToFantasy(dbPlayer: DbPlayer, tournamentDay: 1 | 2 = 1): FantasyPlayer {
  const rank = (dbPlayer.rank || 'C').toUpperCase() as Tier
  const tierFallback = TIER_PRICES[rank] || 15
  const fantasyPriceDay1 = Number(
    dbPlayer.fantasy_cost ?? dbPlayer.fantasy_price ?? tierFallback,
  )
  const rawDay2 = dbPlayer.fantasy_cost_day2 ?? dbPlayer.fantasy_price_day2
  const day2 = rawDay2 != null ? Number(rawDay2) : fantasyPriceDay1
  const price = tournamentDay === 2 ? day2 : fantasyPriceDay1
  const isEnabled = dbPlayer.fantasy_enabled ?? true

  return {
    id: dbPlayer.id,
    pseudo: dbPlayer.pseudo,
    rank,
    roles: [dbPlayer.primary_role, dbPlayer.secondary_role].filter((r): r is string => Boolean(r)),
    price,
    fantasyPriceDay1,
    fantasyEnabled: isEnabled,
  }
}

export function filterAvailableFantasyPlayers(players: FantasyPlayer[]): FantasyPlayer[] {
  return players.filter(p => p.fantasyEnabled)
}
