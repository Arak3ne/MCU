/**
 * Fantasy points pour un match brut (participant).
 * À garder aligné avec la logique POINTS_CALC dans
 * supabase/functions/sync-match-results/index.ts (bloc après lecture des stats LCU).
 */
export type ParticipantStatsLike = {
  kills?: number | null
  deaths?: number | null
  assists?: number | null
  total_minions_killed?: number | null
  win?: boolean | null
  first_blood_kill?: boolean | null
  vision_score?: number | null
  total_damage_dealt_to_champions?: number | null
  gold_earned?: number | null
}

export type FantasyPointsBreakdownLine = {
  critere: string
  contribution: number
}

export type FantasyPointsBreakdown = {
  /** Somme des contributions (même résultat que l’ancien calcul en une passe). */
  fantasyPoints: number
  lines: FantasyPointsBreakdownLine[]
}

/**
 * Détail critère par critère (vérif console / QA).
 */
export function fantasyPointsBreakdown(s: ParticipantStatsLike): FantasyPointsBreakdown {
  const kills = Number(s.kills) || 0
  const deaths = Number(s.deaths) || 0
  const assists = Number(s.assists) || 0
  const cs = Number(s.total_minions_killed) || 0
  const win = Boolean(s.win)
  const firstBlood = Boolean(s.first_blood_kill)
  const vision = Number(s.vision_score) || 0
  const damage = Number(s.total_damage_dealt_to_champions) || 0
  const gold = Number(s.gold_earned) || 0

  const lines: FantasyPointsBreakdownLine[] = []

  lines.push({ critere: `Kills (${kills} × 2)`, contribution: kills * 2 })
  lines.push({ critere: `Assists (${assists} × 1)`, contribution: assists * 1 })
  lines.push({ critere: `Deaths (${deaths} × −2)`, contribution: -deaths * 2 })
  lines.push({ critere: `Sbires (${cs} × 0.02)`, contribution: cs * 0.02 })
  lines.push({
    critere: win ? 'Victoire (+5)' : 'Défaite (−3)',
    contribution: win ? 5 : -3
  })
  lines.push({
    critere: firstBlood ? 'First blood (+2)' : 'First blood (0)',
    contribution: firstBlood ? 2 : 0
  })
  lines.push({ critere: `Vision (${vision} × 0.05)`, contribution: vision * 0.05 })
  lines.push({ critere: `Dégâts (${damage} × 0.0001)`, contribution: damage * 0.0001 })
  lines.push({ critere: `Or (${gold} × 0.0001)`, contribution: gold * 0.0001 })

  if (deaths >= 10) {
    lines.push({ critere: 'Malus INTER (≥10 deaths, −18)', contribution: -18 })
  }

  if (kills === 0 && assists === 0 && deaths > 0) {
    lines.push({ critere: 'Malus 007 (K/A nuls avec morts, −8)', contribution: -8 })
  } else if (kills + assists < deaths) {
    lines.push({
      critere: 'Malus boulet (K+A < deaths, −8)',
      contribution: -8
    })
  }

  if (kills >= 10) {
    lines.push({ critere: 'Bonus carry (≥10 kills, +3)', contribution: 3 })
  }

  const fantasyPoints = lines.reduce((acc, row) => acc + row.contribution, 0)
  return { fantasyPoints, lines }
}

export function fantasyPointsFromParticipantStats(s: ParticipantStatsLike): number {
  return fantasyPointsBreakdown(s).fantasyPoints
}

/** Même arrondi que calculateTeamPoints (fantasyLeaderboard.ts). */
export function roundFantasyDecimal(n: number): number {
  return Math.round(n * 10) / 10
}
