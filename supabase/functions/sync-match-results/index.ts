// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Initialiser le client Supabase avec les variables d'environnement
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Server misconfigured: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    const supabase = createClient(supabaseUrl, supabaseKey)

    let matchData: Record<string, unknown>
    try {
      matchData = await req.json()
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const gameId = matchData.gameId as string | number | undefined
    if (gameId === undefined || gameId === null || gameId === '') {
      return new Response(JSON.stringify({ error: 'Missing gameId in payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`Received match data for game: ${gameId}`)

    // On vérifie si le match existe déjà (.maybeSingle: pas d'erreur si 0 ligne)
    const { data: existingMatch } = await supabase
      .from('match_history')
      .select('id')
      .eq('game_id', gameId)
      .maybeSingle()

    if (existingMatch) {
      return new Response(
        JSON.stringify({ success: true, message: `Match ${gameId} already processed.` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      )
    }

    // Récupération des joueurs de la DB pour matcher les Riot IDs
    const { data: playersDb } = await supabase
      .from('players')
      .select('id, riot_id')

    const playersMap = new Map()
    if (playersDb) {
      for (const p of playersDb) {
        if (p.riot_id) {
          playersMap.set(p.riot_id.toLowerCase(), p.id)
        }
      }
    }

    // Insert match_history
    const gameCreation = matchData.gameCreation ? new Date(matchData.gameCreation).toISOString() : new Date().toISOString()
    const { data: insertedMatch, error: matchError } = await supabase
      .from('match_history')
      .insert({
        game_id: gameId,
        game_creation: gameCreation,
        game_duration: matchData.gameDuration,
        game_mode: matchData.gameMode,
        game_type: matchData.gameType
      })
      .select('id')
      .single()

    if (matchError || !insertedMatch) {
      throw new Error(`Failed to insert match: ${matchError?.message}`)
    }

    const matchId = insertedMatch.id

    const participants = (matchData.participants as unknown[]) || []
    const identities = (matchData.participantIdentities as any[]) || []

    const participantRecords = []
    const playerScoresToUpdate = []

    for (let i = 0; i < participants.length; i++) {
      const p = participants[i] as {
        participantId?: number
        championId?: number
        teamId?: number
        stats?: Record<string, unknown>
      }
      if (!p?.stats) continue

      const identity = identities.find((id: any) => id.participantId === p.participantId)
      const s = p.stats

      const gameName = identity?.player?.gameName || identity?.player?.summonerName
      const tagLine = identity?.player?.tagLine || 'EUW'
      const riotId = `${gameName}#${tagLine}`
      
      const playerId = playersMap.get(riotId.toLowerCase())

      // Points calcul
      const kills = Number(s.kills) || 0
      const deaths = Number(s.deaths) || 0
      const assists = Number(s.assists) || 0
      const cs = Number(s.totalMinionsKilled) || 0
      const win = Boolean(s.win)
      const firstBlood = Boolean(s.firstBloodKill)
      const vision = Number(s.visionScore) || 0
      const damage = Number(s.totalDamageDealtToChampions) || 0
      const gold = Number(s.goldEarned) || 0
      const timeDead = Number(s.totalTimeSpentDead) || 0

      let points = 
        (kills * 3) + 
        (assists * 2) - 
        (deaths * 1) + 
        (cs * 0.02) + 
        (win ? 5 : -2) + 
        (firstBlood ? 2 : 0) + 
        (vision * 0.1) + 
        (damage * 0.001) + 
        (gold * 0.001) - 
        (timeDead * 0.02)

      // Trash-talk / Punitive bonuses & penalties
      if (deaths >= 10) {
        points -= 10; // "Inter" penalty
      }
      
      if (kills === 0 && assists === 0 && deaths > 0) {
        points -= 5; // "Agent 007" or completely useless penalty
      }
      
      if (kills >= 10) {
        points += 3; // "Carry" bonus
      }

      const participantRecord = {
        match_id: matchId,
        player_id: playerId || null, // null if player is not in our database
        champion_id: p.championId,
        kills: kills,
        deaths: deaths,
        assists: assists,
        total_damage_dealt_to_champions: damage,
        win: win,
        first_blood_kill: firstBlood,
        total_time_spent_dead: timeDead,
        total_damage_dealt: Number(s.totalDamageDealt) || 0,
        total_damage_taken: Number(s.totalDamageTaken) || 0,
        damage_self_mitigated: Number(s.damageSelfMitigated) || 0,
        vision_score: vision,
        wards_placed: Number(s.wardsPlaced) || 0,
        wards_killed: Number(s.wardsKilled) || 0,
        gold_earned: gold,
        total_minions_killed: cs,
        largest_killing_spree: Number(s.largestKillingSpree) || 0,
        team_id: p.teamId
      }

      participantRecords.push(participantRecord)

      if (playerId) {
        playerScoresToUpdate.push({
          playerId: playerId,
          points: points,
          tournamentDay: 1 // Defaulting to 1 for now
        })
      }
    }

    // Insert participants
    const { error: partError } = await supabase
      .from('match_participants')
      .insert(participantRecords)

    if (partError) {
      console.error(`Failed to insert participants: ${partError.message}`)
    }

    // Update fantasy_player_scores
    for (const update of playerScoresToUpdate) {
      const { data: existingScore, error: scoreLookupError } = await supabase
        .from('fantasy_player_scores')
        .select('id, score')
        .eq('player_id', update.playerId)
        .eq('tournament_day', update.tournamentDay)
        .maybeSingle()

      if (scoreLookupError) {
        console.error(`fantasy_player_scores lookup: ${scoreLookupError.message}`)
        continue
      }

      if (existingScore) {
        const newScore = parseFloat(existingScore.score) + update.points
        await supabase
          .from('fantasy_player_scores')
          .update({ score: newScore })
          .eq('id', existingScore.id)
      } else {
        await supabase
          .from('fantasy_player_scores')
          .insert({
            player_id: update.playerId,
            tournament_day: update.tournamentDay,
            score: update.points,
            validated: false // Let admins validate at the end if needed, or keep false to let the trigger work anyway
          })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Match ${gameId} processed successfully!`,
        players_found: playerScoresToUpdate.length
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    )

  } catch (error) {
    console.error(error)
    const message = error instanceof Error ? error.message : String(error)
    return new Response(
      JSON.stringify({ error: message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      }
    )
  }
})
