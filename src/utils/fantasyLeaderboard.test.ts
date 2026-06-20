import { describe, expect, it } from 'vitest'
import { calculateTeamPoints, computeFantasyTeamTotal } from './fantasyLeaderboard'
import type { FantasyTeam } from '../types/fantasy'

const baseTeam = (overrides: Partial<FantasyTeam>): FantasyTeam => ({
  id: 't1',
  userId: 'u1',
  name: 'Team',
  tournamentDay: 1,
  playerIds: ['p1', 'p2'],
  captainId: 'p1',
  isLocked: true,
  transfersMade: 0,
  penaltyPoints: 0,
  createdAt: '',
  updatedAt: '',
  ...overrides,
})

describe('computeFantasyTeamTotal', () => {
  it('jour 1 : somme roster (cap ×1.5) − pénalités', () => {
    const team = baseTeam({ tournamentDay: 1, penaltyPoints: 10 })
    const scores = { p1: 20, p2: 10 }

    expect(calculateTeamPoints(team, scores)).toBe(40)
    expect(computeFantasyTeamTotal(team, scores, 0)).toBe(30)
  })

  it('jour 2 : total J1 + roster J2 − pénalités J2', () => {
    const team = baseTeam({ tournamentDay: 2, penaltyPoints: 5 })
    const scores = { p1: 10, p2: 10 }

    expect(computeFantasyTeamTotal(team, scores, 316.7)).toBe(336.7)
  })

  it('jour 2 sans matchs J2 : conserve le total J1', () => {
    const team = baseTeam({ tournamentDay: 2, playerIds: ['p1', 'p2', 'p3', 'p4', 'p5'] })
    expect(computeFantasyTeamTotal(team, {}, 316.7)).toBe(316.7)
  })
})
