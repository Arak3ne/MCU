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
  const plafond = carry + rosterValue

  it('roster incomplet après vente : budget restant = plafond − coût actuel (pas de double crédit)', () => {
    const fourPlayers = [
      fp('p1', 20, 'top'),
      fp('p2', 20, 'jungle'),
      fp('p3', 20, 'mid'),
      fp('p4', 20, 'adc'),
    ]
    const result = validateFantasyTeam(fourPlayers, 'p1', 2, j1Roster, carry, rosterValue)
    expect(result.totalCost).toBe(80)
    expect(result.maxBudget).toBe(plafond)
    expect(result.maxBudget - result.totalCost).toBe(21)
  })

  it('vente ne double pas le reliquat (−30 → 0 en vendant un joueur à 30)', () => {
    const fullRoster = [
      fp('p1', 20, 'top'),
      fp('p2', 20, 'jungle'),
      fp('p3', 30, 'mid'),
      fp('p4', 15, 'adc'),
      fp('p5', 15, 'support'),
    ]
    const basePlafond = 70
    const before = validateFantasyTeam(fullRoster, 'p1', 2, j1Roster, 0, basePlafond)
    expect(before.totalCost).toBe(100)
    expect(before.maxBudget - before.totalCost).toBe(-30)

    const afterSale = [
      fp('p1', 20, 'top'),
      fp('p2', 20, 'jungle'),
      fp('p4', 15, 'adc'),
      fp('p5', 15, 'support'),
    ]
    const after = validateFantasyTeam(afterSale, 'p1', 2, j1Roster, 0, basePlafond)
    expect(after.totalCost).toBe(70)
    expect(after.maxBudget - after.totalCost).toBe(0)
  })

  it('remplacement plus cher dépasse le plafond fixe', () => {
    const team = [
      fp('p1', 20, 'top'),
      fp('p2', 20, 'jungle'),
      fp('p3', 20, 'mid'),
      fp('p4', 20, 'adc'),
      fp('x9', 35, 'support'),
    ]
    const result = validateFantasyTeam(team, 'p1', 2, j1Roster, carry, rosterValue)
    expect(result.totalCost).toBe(115)
    expect(result.maxBudget).toBe(plafond)
    expect(result.isValid).toBe(false)
  })

  it('swap équivalent reste dans le plafond', () => {
    const team = [
      fp('p1', 20, 'top'),
      fp('p2', 20, 'jungle'),
      fp('p3', 20, 'mid'),
      fp('p4', 20, 'adc'),
      fp('x9', 20, 'support'),
    ]
    const result = validateFantasyTeam(team, 'p1', 2, j1Roster, carry, rosterValue)
    expect(result.totalCost).toBe(100)
    expect(result.maxBudget).toBe(plafond)
    expect(result.isValid).toBe(true)
  })
})
