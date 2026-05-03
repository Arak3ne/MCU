import { supabase } from '../lib/supabase'
import type { FantasyTeam, FantasyLeaderboardEntry } from '../types/fantasy'
import { fantasyPointsBreakdown } from '../utils/fantasyMatchPoints'

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

    return {
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
      query = supabase.from('fantasy_teams').insert(teamPayload).select()
    }

    const { data: teamData, error: teamError } = await query.single()

    if (teamError) {
      console.error('Error saving fantasy team:', teamError)
      throw teamError
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
  async updateTeamName(teamId: string, userId: string, name: string): Promise<void> {
    const trimmed = name.trim().slice(0, 64)
    const finalName =
      trimmed.length > 0 ? trimmed : `Team ${userId.substring(0, 5)}`
    const { error } = await supabase
      .from('fantasy_teams')
      .update({ name: finalName, updated_at: new Date().toISOString() })
      .eq('id', teamId)
      .eq('user_id', userId)
    if (error) {
      console.error('Error updating team name:', error)
      throw error
    }
  },

  /**
   * Get all validated scores for a specific tournament day
   */
  async getPlayerScores(tournamentDay: 1 | 2 | 'all'): Promise<Record<string, number>> {
    let query = supabase
      .from('fantasy_player_scores')
      .select('player_id, score')
    
    if (tournamentDay !== 'all') {
      query = query.eq('tournament_day', tournamentDay)
    }
      
    const { data, error } = await query
      
    if (error) {
      console.error('Error fetching player scores:', error)
      throw error
    }

    const scoresMap: Record<string, number> = {}
    if (data) {
      data.forEach(row => {
        const pid = row.player_id
        scoresMap[pid] = (scoresMap[pid] || 0) + (row.score || 0)
      })
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
        tournament_day,
        fantasy_picks(player_id, is_captain)
      `)
      .order('total_points', { ascending: false })

    if (error) {
      console.error('Error fetching leaderboard:', error)
      throw error
    }

    type TeamRow = {
      id: string
      user_id: string
      name: string
      total_points: number | null
      tournament_day: number
      fantasy_picks?: { player_id: string; is_captain: boolean }[]
    }

    type UserAgg = { totalPoints: number; day1?: TeamRow; day2?: TeamRow }
    const byUser = new Map<string, UserAgg>()

    for (const row of (data || []) as TeamRow[]) {
      const userId = row.user_id
      const points = row.total_points || 0
      let agg = byUser.get(userId)
      if (!agg) {
        agg = { totalPoints: points }
        byUser.set(userId, agg)
      } else {
        agg.totalPoints += points
      }
      if (row.tournament_day === 1) agg.day1 = row
      if (row.tournament_day === 2) agg.day2 = row
    }

    const picksCount = (r: TeamRow | undefined) => r?.fantasy_picks?.length ?? 0

    const entries: FantasyLeaderboardEntry[] = []
    for (const [userId, agg] of byUser) {
      // Avoid relying on row iteration order (global sort by points): pick roster explicitly.
      const { day1, day2 } = agg
      const rosterRow =
        picksCount(day2) > 0 ? day2! : picksCount(day1) > 0 ? day1! : day2 ?? day1
      if (!rosterRow) continue

      entries.push({
        userId,
        teamId: rosterRow.id,
        teamName: rosterRow.name,
        tournamentDay: rosterRow.tournament_day as 1 | 2,
        totalPoints: agg.totalPoints,
        picks: mapRowPicks(rosterRow.fantasy_picks)
      })
    }

    return entries.sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 100)
  },

  /**
   * Get leaderboard for a specific day
   */
  async getLeaderboard(tournamentDay: 1 | 2): Promise<FantasyLeaderboardEntry[]> {
    // We fetch teams and their picks so we can display rosters
    const { data, error } = await supabase
      .from('fantasy_teams')
      .select(`
        id, 
        user_id, 
        name, 
        total_points,
        fantasy_picks(player_id, is_captain)
      `)
      .eq('tournament_day', tournamentDay)
      .order('total_points', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Error fetching leaderboard:', error)
      throw error
    }

    return (data || []).map(row => {
      const picks = (row.fantasy_picks || []).map((p: any) => ({
        playerId: p.player_id,
        isCaptain: p.is_captain,
        score: 0,
        pseudo: ''
      }))
      
      return {
        userId: row.user_id,
        teamId: row.id,
        teamName: row.name,
        tournamentDay,
        totalPoints: row.total_points || 0,
        picks
      }
    })
  }
}
