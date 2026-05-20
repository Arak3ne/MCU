import type { FantasyPlayer } from '../types/fantasy'

/** Bornes prix mercato jour 2 (alignées sur calculate_day2_prices en base). */
export const MERCATO_PRICE_MIN = 5
export const MERCATO_PRICE_MAX = 35

/** Rentabilité match J1 : score brut / prix d'achat (sans bonus capitaine). */
export function matchRentability(score: number, priceDay1: number): number {
  if (priceDay1 <= 0) return 0
  return Math.max(0, score) / priceDay1
}

/**
 * Prix J2 = prix J1 × rentabilité, plafonné.
 * Équivaut à round(score J1) quand score ≥ 0.
 */
export function computeMercatoDay2Price(score: number, priceDay1: number): number {
  if (priceDay1 <= 0) return MERCATO_PRICE_MIN
  const effectiveScore = Math.max(0, score)
  const raw = Math.round(priceDay1 * (effectiveScore / priceDay1))
  return Math.max(MERCATO_PRICE_MIN, Math.min(MERCATO_PRICE_MAX, raw))
}

export function getMercatoPriceChange(priceDay2: number, priceDay1: number): number {
  return priceDay2 - priceDay1
}

/** Applique le prix J2 calculé à partir du score J1 validé. */
export function withMercatoDay2Price(
  player: FantasyPlayer,
  scoreDay1: number | undefined,
): FantasyPlayer {
  if (scoreDay1 === undefined) return player
  const day2 = computeMercatoDay2Price(scoreDay1, player.fantasyPriceDay1)
  return { ...player, price: day2, fantasyPriceDay2: day2 }
}
