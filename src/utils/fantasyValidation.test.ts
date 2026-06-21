import { describe, expect, it } from 'vitest'
import type { FantasyPlayer } from '../types/fantasy'
import { validateFantasyTeam } from './fantasyValidation'

function fp(id: string, price: number, role = 'mid'): FantasyPlayer {
  return {
    id,
    pseudo: id,
    rank: 'B',
    roles: [role],
    price,
    fantasyPriceDay1: price,
    fantasyPriceDay2: price,
    fantasyEnabled: true,
  }
}

describe('validateFantasyTeam jour 2 mercato', () => {
  const j1Roster = ['p1', 'p2', 'p3', 'p4', 'p5']
  const carry = 1
  const rosterValue = 100

  it('roster incomplet après vente : budget restant recalculé', () => {
    const fourPlayers = [
      fp('p1', 20, 'top'),
      fp('p2', 20, 'jungle'),
      fp('p3', 20, 'mid'),
      fp('p4', 20, 'adc'),
    ]
    const result = validateFantasyTeam(fourPlayers, 'p1', 2, j1Roster, carry, rosterValue, 20)
    expect(result.totalCost).toBe(80)
    expect(result.maxBudget).toBe(121)
    expect(result.totalCost).toBeLessThan(result.maxBudget)
  })

  it('crédit vente permet un remplacement plus cher', () => {
    const team = [
      fp('p1', 20, 'top'),
      fp('p2', 20, 'jungle'),
      fp('p3', 20, 'mid'),
      fp('p4', 20, 'adc'),
      fp('x9', 35, 'support'),
    ]
    const result = validateFantasyTeam(team, 'p1', 2, j1Roster, carry, rosterValue, 20)
    expect(result.totalCost).toBe(115)
    expect(result.maxBudget).toBe(121)
    expect(result.isValid).toBe(true)
  })

  it('dépasse le plafond même avec crédit vente', () => {
    const team = [
      fp('p1', 20, 'top'),
      fp('p2', 20, 'jungle'),
      fp('p3', 20, 'mid'),
      fp('p4', 20, 'adc'),
      fp('x9', 45, 'support'),
    ]
    const result = validateFantasyTeam(team, 'p1', 2, j1Roster, carry, rosterValue, 20)
    expect(result.totalCost).toBe(125)
    expect(result.isValid).toBe(false)
  })
})
