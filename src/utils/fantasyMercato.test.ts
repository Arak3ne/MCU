import { describe, expect, it } from 'vitest'
import {
  computeMercatoDay2Price,
  getMercatoPriceChange,
  matchRentability,
  MERCATO_PRICE_MAX,
  MERCATO_PRICE_MIN,
} from './fantasyMercato'

describe('fantasyMercato', () => {
  it('matchRentability ignores negative scores', () => {
    expect(matchRentability(-4, 15)).toBe(0)
    expect(matchRentability(24, 12)).toBe(2)
  })

  it('computeMercatoDay2Price equals rounded score when positive', () => {
    expect(computeMercatoDay2Price(24, 12)).toBe(24)
    expect(computeMercatoDay2Price(8, 28)).toBe(8)
  })

  it('clamps day2 price', () => {
    expect(computeMercatoDay2Price(50, 12)).toBe(MERCATO_PRICE_MAX)
    expect(computeMercatoDay2Price(-4, 15)).toBe(MERCATO_PRICE_MIN)
  })

  it('getMercatoPriceChange', () => {
    expect(getMercatoPriceChange(24, 12)).toBe(12)
    expect(getMercatoPriceChange(8, 28)).toBe(-20)
  })
})
