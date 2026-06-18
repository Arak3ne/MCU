import { describe, expect, it } from 'vitest'
import type { FantasyPlayer } from '../types/fantasy'
import {
  calculateMedian,
  computeAllMercatoDay2Prices,
  computeAlpha,
  computeTierMedians,
  getMercatoPriceChange,
  matchRentability,
} from './fantasyMercato'

function player(id: string, priceDay1: number): FantasyPlayer {
  return {
    id,
    pseudo: id,
    rank: 'S',
    roles: ['top'],
    price: priceDay1,
    fantasyPriceDay1: priceDay1,
    fantasyPriceDay2: priceDay1,
    fantasyEnabled: true,
  }
}

describe('fantasyMercato', () => {
  it('matchRentability allows negative scores', () => {
    expect(matchRentability(-4, 15)).toBeCloseTo(-4 / 15)
    expect(matchRentability(24, 12)).toBe(2)
  })

  it('calculateMedian', () => {
    expect(calculateMedian([30, 45, 50, 52, 60, 200])).toBe(51)
    expect(calculateMedian([])).toBe(0)
  })

  it('computeAlpha uses virtual score floor at 0', () => {
    expect(computeAlpha(-10, 50)).toBe(0)
    expect(computeAlpha(100, 50)).toBe(2)
    expect(computeAlpha(undefined, 50)).toBe(1)
  })

  it('computeAllMercatoDay2Prices scales by tier median', () => {
    const players = [
      player('a', 28),
      player('b', 28),
      player('c', 8),
    ]
    const scores = { a: 100, b: 50, c: 16 }
    const medians = computeTierMedians(players, scores)
    expect(medians[28]).toBe(75)

    const updated = computeAllMercatoDay2Prices(players, scores)
    const byId = Object.fromEntries(updated.map((p) => [p.id, p.price]))
    expect(byId.a).toBe(Math.round(28 * (100 / 75)))
    expect(byId.b).toBe(Math.round(28 * (50 / 75)))
    expect(byId.c).toBe(8)
  })

  it('resets to day1 price when score is missing', () => {
    const players = [player('a', 22)]
    const updated = computeAllMercatoDay2Prices(players, {})
    expect(updated[0].price).toBe(22)
    expect(updated[0].fantasyPriceDay2).toBe(22)
  })

  it('getMercatoPriceChange', () => {
    expect(getMercatoPriceChange(24, 12)).toBe(12)
    expect(getMercatoPriceChange(8, 28)).toBe(-20)
  })
})
