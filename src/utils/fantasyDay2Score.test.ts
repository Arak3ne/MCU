import { describe, expect, it } from 'vitest'
import { effectiveFantasyPlayerScore, FANTASY_DAY2_REFERENCE_MATCHES } from './fantasyMatchPoints'

describe('fantasyDay2Score', () => {
  it('jour 1 : score brut inchangé', () => {
    expect(effectiveFantasyPlayerScore(42, 1, 5)).toBe(42)
  })

  it('jour 2 : moyenne × 4', () => {
    expect(effectiveFantasyPlayerScore(30, 2, 2)).toBe(60)
    expect(effectiveFantasyPlayerScore(40, 2, 4)).toBe(40)
  })

  it('jour 2 sans matchs taggés : fallback brut', () => {
    expect(effectiveFantasyPlayerScore(25, 2, 0)).toBe(25)
  })

  it('expose la constante de référence', () => {
    expect(FANTASY_DAY2_REFERENCE_MATCHES).toBe(4)
  })
})
