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
