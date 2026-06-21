import type { FantasyPlayer } from '../types/fantasy'

/** Rentabilité match J1 : score brut / prix d'achat (sans bonus capitaine). */
export function matchRentability(score: number, priceDay1: number): number {
  if (priceDay1 <= 0) return 0
  return score / priceDay1
}

export function calculateMedian(scores: number[]): number {
  if (scores.length === 0) return 0
  const sorted = [...scores].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2
  }
  return sorted[mid]
}

export function computeTierMedians(
  players: FantasyPlayer[],
  scoresDay1: Record<string, number>
): Record<number, number> {
  const tierScores: Record<number, number[]> = {}
  
  // Group virtual scores by tier (fantasyPriceDay1)
  players.forEach((player) => {
    const price = player.fantasyPriceDay1
    if (!tierScores[price]) {
      tierScores[price] = []
    }
    const score = scoresDay1[player.id]
    if (score !== undefined) {
      // Ramener virtuellement les scores négatifs à 0
      tierScores[price].push(Math.max(0, score))
    }
  })

  const medians: Record<number, number> = {}
  for (const [priceStr, scores] of Object.entries(tierScores)) {
    const price = Number(priceStr)
    medians[price] = calculateMedian(scores)
  }
  return medians
}

export function computeAlpha(score: number | undefined, tierMedian: number): number {
  if (score === undefined) return 1
  const virtualScore = Math.max(0, score)
  const safeMedian = Math.max(1, tierMedian)
  return virtualScore / safeMedian
}

export function computeAllMercatoDay2Prices(
  players: FantasyPlayer[],
  scoresDay1: Record<string, number>
): FantasyPlayer[] {
  const medians = computeTierMedians(players, scoresDay1)

  return players.map((player) => {
    const score = scoresDay1[player.id]
    if (score === undefined) {
      return {
        ...player,
        price: player.fantasyPriceDay1,
        fantasyPriceDay2: player.fantasyPriceDay1,
      }
    }
    
    const tierMedian = medians[player.fantasyPriceDay1] || 0
    const alpha = computeAlpha(score, tierMedian)
    
    const newPrice = Math.max(1, Math.round(player.fantasyPriceDay1 * alpha))
    
    return {
      ...player,
      price: newPrice,
      fantasyPriceDay2: newPrice,
    }
  })
}

export function getMercatoPriceChange(priceDay2: number, priceDay1: number): number {
  return priceDay2 - priceDay1
}

export function rostersMatch(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const setB = new Set(b)
  return a.every((id) => setB.has(id))
}

/**
 * Source de vérité des picks affichés en mercato J2.
 * Tant qu'aucun transfert n'est enregistré, le roster J1 fait foi (l'intro et le mercato restent alignés).
 */
export function resolveMercatoRosterPlayerIds(
  day1PlayerIds: string[],
  day2Team: { playerIds: string[]; isLocked: boolean; transfersMade: number } | null,
): string[] {
  if (!day2Team || day2Team.playerIds.length === 0) {
    return day1PlayerIds
  }
  if (day2Team.isLocked) {
    return day2Team.playerIds
  }
  if ((day2Team.transfersMade ?? 0) === 0 && !rostersMatch(day1PlayerIds, day2Team.playerIds)) {
    return day1PlayerIds
  }
  return day2Team.playerIds
}
