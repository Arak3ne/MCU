import { describe, expect, it } from 'vitest'
import { fantasyPointsFromParticipantStats } from './fantasyMatchPoints'

describe('fantasyMatchPoints (barème léger)', () => {
  it('match correct typique ≈ 9 pts', () => {
    const pts = fantasyPointsFromParticipantStats({
      kills: 1,
      deaths: 1,
      assists: 2,
      total_minions_killed: 80,
      win: true,
      vision_score: 10,
      total_damage_dealt_to_champions: 8000,
      gold_earned: 9000,
    })
    expect(pts).toBeCloseTo(10.8, 0)
  })

  it('dégâts élevés ne dominent pas le score', () => {
    const pts = fantasyPointsFromParticipantStats({
      kills: 2,
      deaths: 3,
      assists: 4,
      total_minions_killed: 180,
      win: true,
      vision_score: 25,
      total_damage_dealt_to_champions: 18000,
      gold_earned: 12000,
    })
    expect(pts).toBeLessThan(25)
    expect(pts).toBeGreaterThan(10)
  })
})
