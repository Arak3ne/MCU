import { supabase } from '../lib/supabase'
import type { FantasyTeam, FantasyLeaderboardEntry } from '../types/fantasy'
import { computeFantasyTeamTotal } from '../utils/fantasyLeaderboard'
import { effectiveFantasyPlayerScore, fantasyPointsBreakdown } from '../utils/fantasyMatchPoints'

/** Colonne numeric / string PostgREST → nombre fini uniquement si la valeur existe en base. */
function parseCarriedOverBudget(raw: unknown): number | undefined {
  if (raw == null || raw === '') return undefined
  const n = typeof raw === 'string' ? parseFloat(raw.trim()) : Number(raw)
  return Number.isFinite(n) ? n : undefined
}

/** Logs détail barème (console) : toujours en dev ; en prod ajoute localStorage.setItem('mcu_fantasy_log_last_match','1') */
function shouldLogFantasyLastMatchBreakdown(): boolean {
  if (import.meta.env.DEV) return true
  try {
    return globalThis.localStorage?.getItem('mcu_fantasy_log_last_match') === '1'
  } catch {
    return false
  }
}

function normalizeFantasyTeamName(userId: string, name: string): string {
  const trimmed = name.trim().slice(0, 64)
  return trimmed.length > 0 ? trimmed : `Team ${userId.substring(0, 5)}`
}

/** Nom d'équipe unique par joueur : synchronise J1 et J2 (le leaderboard global affiche souvent la ligne J2). */
type FantasyTeamRow = {
  id: string
  user_id: string
  name: string
  tournament_day: number
  total_points?: number | null
  penalty_points?: number | null
  locked?: boolean | null
  is_locked?: boolean | null
  transfers_made?: number | null
  carried_over_budget?: unknown
  created_at: string
  updated_at: string
  fantasy_picks?: { player_id: string; is_captain: boolean }[]
}

function teamPointsInputFromRow(row: FantasyTeamRow): Pick<
  FantasyTeam,
  'tournamentDay' | 'captainId' | 'playerIds' | 'penaltyPoints'
> {
  const picks = row.fantasy_picks ?? []
  const captainPick = picks.find((p) => p.is_captain)
  return {
    tournamentDay: row.tournament_day as 1 | 2,
    playerIds: picks.map((p) => p.player_id),
    captainId: captainPick?.player_id ?? '',
    penaltyPoints: row.penalty_points ?? 0,
  }
}

async function syncFantasyTeamNameForUser(userId: string, name: string): Promise<void> {
  const finalName = normalizeFantasyTeamName(userId, name)
  const { error } = await supabase
    .from('fantasy_teams')
    .update({ name: finalName, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
  if (error) {
    console.error('Error syncing team name:', error)
    throw error
  }
}

export const fantasyService = {
  /**
   * Fetch a user's fantasy team for a specific tournament day
   */
  async getTeam(userId: string, tournamentDay: 1 | 2): Promise<FantasyTeam | null> {
    const { data: teamDataList, error: teamError } = await supabase
      .from('fantasy_teams')
      .select('*, fantasy_picks(*)')
      .eq('user_id', userId)
      .eq('tournament_day', tournamentDay)
      .order('created_at', { ascending: false })
      .limit(1)

    if (teamError) {
      console.error('Error fetching fantasy team:', teamError)
      throw teamError
    }

    if (!teamDataList || teamDataList.length === 0) return null
    const teamData = teamDataList[0] as any
    const rawCarry =
      teamData.carried_over_budget
      ?? (teamData as Record<string, unknown>).carriedOverBudget

    const picks = teamData.fantasy_picks || []
    const playerIds = picks.map((p: any) => p.player_id)
    const captainPick = picks.find((p: any) => p.is_captain)
    const captainId = captainPick ? captainPick.player_id : ''

    const team: FantasyTeam = {
      id: teamData.id,
      userId: teamData.user_id,
      name: teamData.name,
      tournamentDay: teamData.tournament_day as 1 | 2,
      playerIds,
      captainId,
      isLocked: teamData.locked || teamData.is_locked || false,
      totalPoints: teamData.total_points || 0,
      transfersMade: teamData.transfers_made || 0,
      penaltyPoints: teamData.penalty_points || 0,
      carriedOverBudget: parseCarriedOverBudget(rawCarry),
      createdAt: teamData.created_at,
      updatedAt: teamData.updated_at
    }

    const pointsInput = teamPointsInputFromRow({
      ...teamData,
      fantasy_picks: picks,
    } as FantasyTeamRow)

    if (tournamentDay === 1) {
      const day1Scores = await this.getPlayerScores(1)
      team.totalPoints = computeFantasyTeamTotal(pointsInput, day1Scores, 0)
    } else {
      const [day1Scores, day2Scores] = await Promise.all([
        this.getPlayerScores(1),
        this.getPlayerScores(2),
      ])
      const day1Base = await this.getDay1BaseTotal(teamData.user_id, day1Scores)
      team.totalPoints = computeFantasyTeamTotal(pointsInput, day2Scores, day1Base)
    }

    return team
  },

  async getDay1BaseTotal(
    userId: string,
    day1Scores?: Record<string, number>,
  ): Promise<number> {
    const { data, error } = await supabase
      .from('fantasy_teams')
      .select('penalty_points, tournament_day, fantasy_picks(player_id, is_captain)')
      .eq('user_id', userId)
      .eq('tournament_day', 1)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data) return 0

    const scores = day1Scores ?? (await this.getPlayerScores(1))
    return computeFantasyTeamTotal(teamPointsInputFromRow(data as FantasyTeamRow), scores, 0)
  },

  /**
   * Save a user's fantasy team
   */
  async saveTeam(team: Partial<FantasyTeam> & { userId: string, tournamentDay: 1 | 2 }): Promise<FantasyTeam> {
    const teamPayload: any = {
      user_id: team.userId,
      tournament_day: team.tournamentDay,
      name: team.name || `Team ${team.userId.substring(0, 5)}`,
      updated_at: new Date().toISOString()
    }

    if (team.transfersMade !== undefined) {
      teamPayload.transfers_made = team.transfersMade
    }
    if (team.penaltyPoints !== undefined) {
      teamPayload.penalty_points = team.penaltyPoints
    }
    // Ne pas réécrire le reliquat serveur à chaque save jour 2 (snapshot lock / initialize_day2_teams).
    const isDay2Existing = team.tournamentDay === 2 && team.id
    if (team.carriedOverBudget !== undefined && !isDay2Existing) {
      teamPayload.carried_over_budget = team.carriedOverBudget
    }

    let query
    if (team.id) {
      query = supabase.from('fantasy_teams').update(teamPayload).eq('id', team.id).select()
    } else {
      if (team.tournamentDay === 2) {
        const day1Team = await this.getTeam(team.userId, 1)
        teamPayload.total_points = day1Team?.totalPoints ?? 0
      }
      query = supabase.from('fantasy_teams').insert(teamPayload).select()
    }

    const { data: teamData, error: teamError } = await query.single()

    if (teamError) {
      console.error('Error saving fantasy team:', teamError)
      throw teamError
    }

    if (team.name !== undefined) {
      await syncFantasyTeamNameForUser(team.userId, teamPayload.name)
    }

    const savedCarryRaw = (teamData as Record<string, unknown>).carried_over_budget
      ?? (teamData as Record<string, unknown>).carriedOverBudget

    // Save picks
    if (team.playerIds) {
      // First delete old picks
      await supabase.from('fantasy_picks').delete().eq('fantasy_team_id', teamData.id)

      if (team.playerIds.length > 0) {
        const picksPayload = team.playerIds.map(pid => ({
          fantasy_team_id: teamData.id,
          player_id: pid,
          is_captain: pid === team.captainId
        }))
  
        const { error: picksError } = await supabase.from('fantasy_picks').insert(picksPayload)
        
        if (picksError) {
          console.error('Error saving fantasy picks:', picksError)
          throw picksError
        }
      }
    }

    return {
      id: teamData.id,
      userId: teamData.user_id,
      name: teamData.name,
      tournamentDay: teamData.tournament_day as 1 | 2,
      playerIds: team.playerIds || [],
      captainId: team.captainId || '',
      isLocked: teamData.locked || teamData.is_locked || false,
      totalPoints: teamData.total_points || 0,
      transfersMade: teamData.transfers_made || 0,
      penaltyPoints: teamData.penalty_points || 0,
      carriedOverBudget: parseCarriedOverBudget(savedCarryRaw),
      createdAt: teamData.created_at,
      updatedAt: teamData.updated_at
    }
  },

  /**
   * Met à jour uniquement le nom d'une équipe (roster inchangé). Utile quand is_locked.
   */
  async updateTeamName(_teamId: string, userId: string, name: string): Promise<void> {
    await syncFantasyTeamNameForUser(userId, name)
  },

  /**
   * Nombre de matchs jour 2 par joueur (match_history.tournament_day = 2).
   */
  async getPlayerDay2MatchCounts(playerIds?: string[]): Promise<Record<string, number>> {
    let query = supabase
      .from('match_participants')
      .select('player_id, match_history!inner(tournament_day)')
      .eq('match_history.tournament_day', 2)

    if (playerIds?.length) {
      query = query.in('player_id', playerIds)
    }

    const { data, error } = await query
    if (error) {
      console.error('Error fetching day 2 match counts:', error)
      throw error
    }

    const counts: Record<string, number> = {}
    for (const row of data ?? []) {
      const pid = row.player_id as string
      if (!pid) continue
      counts[pid] = (counts[pid] || 0) + 1
    }
    return counts
  },

  /**
   * Get all validated scores for a specific tournament day.
   * Jour 2 : score effectif = (total brut / nb matchs) × 4.
   */
  async getPlayerScores(tournamentDay: 1 | 2 | 'all'): Promise<Record<string, number>> {
    let query = supabase
      .from('fantasy_player_scores')
      .select('player_id, score, tournament_day')

    if (tournamentDay !== 'all') {
      query = query.eq('tournament_day', tournamentDay)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching player scores:', error)
      throw error
    }

    const rawByPlayerDay = new Map<string, number>()
    for (const row of data ?? []) {
      const pid = row.player_id as string
      const day = row.tournament_day as number
      const key = `${pid}:${day}`
      rawByPlayerDay.set(key, (rawByPlayerDay.get(key) || 0) + (row.score || 0))
    }

    const needsDay2 =
      tournamentDay === 2 ||
      tournamentDay === 'all' ||
      [...rawByPlayerDay.keys()].some((k) => k.endsWith(':2'))

    const day2PlayerIds = [...rawByPlayerDay.keys()]
      .filter((k) => k.endsWith(':2'))
      .map((k) => k.split(':')[0]!)

    const matchCounts =
      needsDay2 && day2PlayerIds.length > 0
        ? await this.getPlayerDay2MatchCounts(day2PlayerIds)
        : {}

    const scoresMap: Record<string, number> = {}

    if (tournamentDay === 'all') {
      for (const [key, raw] of rawByPlayerDay) {
        const [pid, dayStr] = key.split(':')
        const day = Number(dayStr) as 1 | 2
        const effective = effectiveFantasyPlayerScore(
          raw,
          day,
          day === 2 ? (matchCounts[pid!] || 0) : 0,
        )
        scoresMap[pid!] = (scoresMap[pid!] || 0) + effective
      }
      return scoresMap
    }

    for (const [key, raw] of rawByPlayerDay) {
      const [pid] = key.split(':')
      const effective = effectiveFantasyPlayerScore(
        raw,
        tournamentDay,
        tournamentDay === 2 ? (matchCounts[pid!] || 0) : 0,
      )
      scoresMap[pid!] = effective
    }

    return scoresMap
  },

  /**
   * Stats du dernier match connu par joueur (tri match_history.game_creation desc).
   * Ajoute fantasyPoints et loggue le détail du barème si dev ou si localStorage `mcu_fantasy_log_last_match=1`.
   */
  async getPlayerMatchStats(playerIds: string[]): Promise<Record<string, any>> {
    if (!playerIds || playerIds.length === 0) return {}

    const { data, error } = await supabase
      .from('match_participants')
      .select(`
        player_id,
        kills,
        deaths,
        assists,
        win,
        first_blood_kill,
        champion_id,
        total_minions_killed,
        vision_score,
        total_damage_dealt_to_champions,
        gold_earned,
        match_history!inner(game_creation, game_duration)
      `)
      .in('player_id', playerIds)

    if (error) {
      console.error('Error fetching player match stats:', error)
      return {}
    }

    const statsMap: Record<string, any> = {}

    if (data) {
      const sortedData = [...data].sort((a, b) => {
        const tA = new Date((a as any).match_history?.game_creation ?? 0).getTime()
        const tB = new Date((b as any).match_history?.game_creation ?? 0).getTime()
        return tB - tA
      })

      const shouldLogBreakdown = shouldLogFantasyLastMatchBreakdown()

      sortedData.forEach((row: any) => {
        const pid = row.player_id
        if (statsMap[pid]) return

        const gameDurationSec =
          typeof row.match_history?.game_duration === 'number'
            ? row.match_history.game_duration
            : 0

        const breakdownInput = {
          kills: row.kills,
          deaths: row.deaths,
          assists: row.assists,
          total_minions_killed: row.total_minions_killed,
          win: row.win,
          first_blood_kill: row.first_blood_kill,
          vision_score: row.vision_score,
          total_damage_dealt_to_champions: row.total_damage_dealt_to_champions,
          gold_earned: row.gold_earned
        }
        const { fantasyPoints: fp, lines } = fantasyPointsBreakdown(breakdownInput)

        if (shouldLogBreakdown) {
          const table = lines.map((l) => ({
            critere: l.critere,
            contribution:
              Number.isInteger(l.contribution) || Math.abs(l.contribution) >= 100
                ? l.contribution
                : Number(l.contribution.toFixed(6))
          }))
          console.groupCollapsed(`[MCU fantasy] dernier match — joueur ${pid}`)
          console.table(table)
          const sumCheck = lines.reduce((acc, l) => acc + l.contribution, 0)
          console.log('Total fantasyPoints', fp, '| somme lignes', sumCheck)
          console.groupEnd()
        }

        statsMap[pid] = {
          kills: row.kills || 0,
          deaths: row.deaths || 0,
          assists: row.assists || 0,
          wins: row.win ? 1 : 0,
          losses: row.win ? 0 : 1,
          games: 1,
          total_minions_killed: row.total_minions_killed || 0,
          vision_score: row.vision_score || 0,
          damage_dealt: row.total_damage_dealt_to_champions || 0,
          game_duration_sec: gameDurationSec,
          championIds: row.champion_id ? [row.champion_id] : [],
          kda:
            row.deaths === 0
              ? row.kills + row.assists
              : ((row.kills + row.assists) / row.deaths).toFixed(2),
          fantasyPoints: fp
        }
      })
    }

    return statsMap
  },

  /**
   * Get global leaderboard (sum of all days)
   */
  async getGlobalLeaderboard(): Promise<FantasyLeaderboardEntry[]> {
    const mapRowPicks = (rowPicks: unknown) =>
      (Array.isArray(rowPicks) ? rowPicks : []).map((p: any) => ({
        playerId: p.player_id,
        isCaptain: p.is_captain,
        score: 0,
        pseudo: ''
      }))

    // We fetch all teams and group them by user to sum their points
    const { data, error } = await supabase
      .from('fantasy_teams')
      .select(`
        id, 
        user_id, 
        name, 
        total_points,
        penalty_points,
        tournament_day,
        updated_at,
        fantasy_picks(player_id, is_captain)
      `)
      .order('total_points', { ascending: false })

    if (error) {
      console.error('Error fetching leaderboard:', error)
      throw error
    }

    const [day1Scores, day2Scores] = await Promise.all([
      this.getPlayerScores(1),
      this.getPlayerScores(2),
    ])

    type TeamRow = {
      id: string
      user_id: string
      name: string
      total_points: number | null
      penalty_points?: number | null
      tournament_day: number
      updated_at?: string
      fantasy_picks?: { player_id: string; is_captain: boolean }[]
    }

    const pickDisplayName = (day1?: TeamRow, day2?: TeamRow, fallback?: TeamRow): string => {
      const rows = [day1, day2].filter(Boolean) as TeamRow[]
      if (rows.length === 0) return fallback?.name ?? ''
      const latest = rows.reduce((best, row) => {
        const bestTs = best.updated_at ? new Date(best.updated_at).getTime() : 0
        const rowTs = row.updated_at ? new Date(row.updated_at).getTime() : 0
        return rowTs >= bestTs ? row : best
      })
      return latest.name
    }

    type UserAgg = { day1?: TeamRow; day2?: TeamRow }
    const byUser = new Map<string, UserAgg>()

    for (const row of (data || []) as TeamRow[]) {
      const userId = row.user_id
      let agg = byUser.get(userId)
      if (!agg) {
        agg = {}
        byUser.set(userId, agg)
      }
      if (row.tournament_day === 1) agg.day1 = row
      if (row.tournament_day === 2) agg.day2 = row
    }

    const picksCount = (r: TeamRow | undefined) => r?.fantasy_picks?.length ?? 0

    const entries: FantasyLeaderboardEntry[] = []
    for (const [userId, agg] of byUser) {
      const { day1, day2 } = agg
      const rosterRow =
        picksCount(day2) > 0 ? day2! : picksCount(day1) > 0 ? day1! : day2 ?? day1
      if (!rosterRow) continue

      const day1Base = day1
        ? computeFantasyTeamTotal(
            teamPointsInputFromRow(day1 as FantasyTeamRow),
            day1Scores,
            0,
          )
        : 0

      const cumulativeTotal = day2
        ? computeFantasyTeamTotal(
            teamPointsInputFromRow(day2 as FantasyTeamRow),
            day2Scores,
            day1Base,
          )
        : day1Base

      entries.push({
        userId,
        teamId: rosterRow.id,
        teamName: pickDisplayName(day1, day2, rosterRow),
        tournamentDay: rosterRow.tournament_day as 1 | 2,
        totalPoints: cumulativeTotal,
        picks: mapRowPicks(rosterRow.fantasy_picks)
      })
    }

    return entries.sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 100)
  },

  /**
   * Get leaderboard for a specific day
   */
  async getLeaderboard(tournamentDay: 1 | 2): Promise<FantasyLeaderboardEntry[]> {
    const [day1Scores, day2Scores] = await Promise.all([
      this.getPlayerScores(1),
      this.getPlayerScores(2),
    ])

    // We fetch teams and their picks so we can display rosters
    const { data, error } = await supabase
      .from('fantasy_teams')
      .select(`
        id, 
        user_id, 
        name, 
        total_points,
        penalty_points,
        tournament_day,
        fantasy_picks(player_id, is_captain)
      `)
      .eq('tournament_day', tournamentDay)
      .order('total_points', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Error fetching leaderboard:', error)
      throw error
    }

    const day1TotalsByUser = new Map<string, number>()
    if (tournamentDay === 2) {
      const { data: day1Teams } = await supabase
        .from('fantasy_teams')
        .select(`
          user_id,
          penalty_points,
          tournament_day,
          fantasy_picks(player_id, is_captain)
        `)
        .eq('tournament_day', 1)

      for (const row of day1Teams ?? []) {
        day1TotalsByUser.set(
          row.user_id,
          computeFantasyTeamTotal(
            teamPointsInputFromRow(row as FantasyTeamRow),
            day1Scores,
            0,
          ),
        )
      }
    }

    return (data || []).map((row) => {
      const picks = (row.fantasy_picks || []).map((p: any) => ({
        playerId: p.player_id,
        isCaptain: p.is_captain,
        score: 0,
        pseudo: ''
      }))

      const scoresForDay = tournamentDay === 2 ? day2Scores : day1Scores
      const day1Base = tournamentDay === 2 ? (day1TotalsByUser.get(row.user_id) ?? 0) : 0
      const totalPoints = computeFantasyTeamTotal(
        teamPointsInputFromRow(row as FantasyTeamRow),
        scoresForDay,
        day1Base,
      )

      return {
        userId: row.user_id,
        teamId: row.id,
        teamName: row.name,
        tournamentDay,
        totalPoints,
        picks
      }
    }).sort((a, b) => b.totalPoints - a.totalPoints)
  }
}
