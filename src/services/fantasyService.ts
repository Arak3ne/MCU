import { supabase } from '../lib/supabase'
import type { FantasyTeam, FantasyLeaderboardEntry } from '../types/fantasy'

export const fantasyService = {
  /**
   * Fetch a user's fantasy team for a specific tournament day
   */
  async getTeam(userId: string, tournamentDay: 1 | 2): Promise<FantasyTeam | null> {
    const { data: teamData, error: teamError } = await supabase
      .from('fantasy_teams')
      .select('*, fantasy_picks(*)')
      .eq('user_id', userId)
      .eq('tournament_day', tournamentDay)
      .single()

    if (teamError && teamError.code !== 'PGRST116') { // PGRST116 is "Row not found"
      console.error('Error fetching fantasy team:', teamError)
      throw teamError
    }

    if (!teamData) return null

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
      isLocked: teamData.is_locked || false,
      totalPoints: teamData.total_points || 0,
      transfersMade: teamData.transfers_made || 0,
      penaltyPoints: teamData.penalty_points || 0,
      carriedOverBudget: teamData.carried_over_budget || 0,
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
    if (team.carriedOverBudget !== undefined) {
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
      isLocked: teamData.is_locked || false,
      totalPoints: teamData.total_points || 0,
      transfersMade: teamData.transfers_made || 0,
      penaltyPoints: teamData.penalty_points || 0,
      carriedOverBudget: teamData.carried_over_budget || 0,
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
  async getPlayerScores(tournamentDay: 1 | 2): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('fantasy_player_scores')
      .select('player_id, score')
      .eq('tournament_day', tournamentDay)
      .eq('validated', true) // Only validated scores
      
    if (error) {
      console.error('Error fetching player scores:', error)
      throw error
    }

    const scoresMap: Record<string, number> = {}
    if (data) {
      data.forEach(row => {
        scoresMap[row.player_id] = row.score
      })
    }
    
    return scoresMap
  },

  /**
   * Get match stats for players on a specific tournament day
   * Returns only the most recent game for each player.
   */
  async getPlayerMatchStats(playerIds: string[]): Promise<Record<string, any>> {
    if (!playerIds || playerIds.length === 0) return {}

    // Fetch all match participants for these players
    const { data, error } = await supabase
      .from('match_participants')
      .select(`
        player_id,
        kills,
        deaths,
        assists,
        win,
        champion_id,
        total_minions_killed,
        vision_score,
        total_damage_dealt_to_champions,
        match_history!inner(game_creation, game_duration)
      `)
      .in('player_id', playerIds)

    if (error) {
      console.error('Error fetching player match stats:', error)
      return {}
    }

    const statsMap: Record<string, any> = {}
    
    if (data) {
      // Sort data in JavaScript by game_creation descending to ensure we process the newest matches first
      // Note: match_history is an object because of the foreign key relationship
      const sortedData = [...data].sort((a, b) => {
        const dateA = new Date((a as any).match_history?.game_creation || 0).getTime();
        const dateB = new Date((b as any).match_history?.game_creation || 0).getTime();
        return dateB - dateA;
      });

      sortedData.forEach(row => {
        const pid = row.player_id
        
        // We only want the most recent game (the first one we encounter since we ordered desc)
        if (!statsMap[pid]) {
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
            championIds: row.champion_id ? new Set<number>([row.champion_id]) : new Set<number>()
          }
        }
      })
    }

    // Convert Sets to Arrays for easier usage
    const finalStats: Record<string, any> = {}
    for (const [pid, s] of Object.entries(statsMap)) {
      finalStats[pid] = {
        ...s,
        championIds: Array.from(s.championIds),
        kda: s.deaths === 0 ? (s.kills + s.assists) : ((s.kills + s.assists) / s.deaths).toFixed(2)
      }
    }

    return finalStats
  },

  /**
   * Get global leaderboard (sum of all days)
   */
  async getGlobalLeaderboard(): Promise<FantasyLeaderboardEntry[]> {
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

    // Group by user_id to sum points across days
    const userMap = new Map<string, FantasyLeaderboardEntry>()

    for (const row of (data || [])) {
      const userId = row.user_id
      const points = row.total_points || 0
      
      if (userMap.has(userId)) {
        const existing = userMap.get(userId)!
        existing.totalPoints += points
        // We keep the picks from the most recent day (or just any day, but let's say day 2 if available)
        if (row.tournament_day === 2) {
          existing.picks = (row.fantasy_picks || []).map((p: any) => ({
            playerId: p.player_id,
            isCaptain: p.is_captain,
            score: 0,
            pseudo: ''
          }))
          existing.teamName = row.name // Update to latest team name
        }
      } else {
        userMap.set(userId, {
          userId: row.user_id,
          teamId: row.id,
          teamName: row.name,
          tournamentDay: row.tournament_day as 1 | 2,
          totalPoints: points,
          picks: (row.fantasy_picks || []).map((p: any) => ({
            playerId: p.player_id,
            isCaptain: p.is_captain,
            score: 0,
            pseudo: ''
          }))
        })
      }
    }

    // Convert map to array and sort by total points
    return Array.from(userMap.values())
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 100)
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
