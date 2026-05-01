import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Helper to execute LCU API requests
 */
async function lcuRequest(endpoint, port, token) {
  const url = `https://127.0.0.1:${port}${endpoint}`;
  const auth = Buffer.from(`riot:${token}`).toString('base64');
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`LCU Error: ${response.status} ${response.statusText} on ${url}`);
  }
  
  return await response.json();
}

function normalizeStatKey(key) {
  return String(key).replace(/_/g, '').toLowerCase();
}

/** LCU peut exposer totalTimeSpentDead dans stats ou à plat sur le participant (variants camel/snake). */
function readTotalTimeSpentDead(stats, participant) {
  const explicitKeys = [
    'totalTimeSpentDead',
    'total_time_spent_dead',
    'TotalTimeSpentDead',
    'totalTimeDead',
    'total_time_dead',
  ];
  const objs = [stats || {}, participant || {}];
  for (const key of explicitKeys) {
    for (const obj of objs) {
      const v = obj[key];
      if (v !== undefined && v !== null && v !== '') {
        const n = Number(v);
        if (!Number.isNaN(n) && Number.isFinite(n)) return Math.max(0, Math.round(n));
      }
    }
  }
  const target = 'totaltimespentdead';
  for (const obj of objs) {
    if (!obj || typeof obj !== 'object') continue;
    for (const [k, v] of Object.entries(obj)) {
      if (normalizeStatKey(k) === target) {
        const n = Number(v);
        if (!Number.isNaN(n) && Number.isFinite(n)) return Math.max(0, Math.round(n));
      }
    }
  }
  return 0;
}

/**
 * Main script logic
 */
async function run() {
  console.log("Starting LCU test script...");

  // 1. Find League Client Lockfile
  const lockfilePath = 'C:\\Riot Games\\League of Legends\\lockfile';
  
  if (!fs.existsSync(lockfilePath)) {
    console.error(`\n[ERROR] League of Legends lockfile not found at: ${lockfilePath}`);
    console.error("Make sure League of Legends is running! Since you don't have it on this PC, you will need to run this later.");
    return;
  }

  const lockfileContent = fs.readFileSync(lockfilePath, 'utf8');
  // Format: LeagueClient:pid:port:password:protocol
  const parts = lockfileContent.split(':');
  if (parts.length < 5) {
    console.error("Invalid lockfile format");
    return;
  }

  const port = parts[2];
  const token = parts[3];
  
  console.log(`Connected to LCU on port ${port}`);

  try {
    // 2. Get Current Summoner
    console.log("Fetching current summoner...");
    const summoner = await lcuRequest('/lol-summoner/v1/current-summoner', port, token);
    const puuid = summoner.puuid;
    console.log(`Summoner found: ${summoner.gameName}#${summoner.tagLine} (PUUID: ${puuid})`);

    // 3. Fetch Last 10 Matches (bypassing custom game filter for testing)
    console.log("Fetching last 10 games from history...");
    // 0 to 9 are 10 games
    const history = await lcuRequest(`/lol-match-history/v1/products/lol/${puuid}/matches?begIndex=0&endIndex=9`, port, token);
    
    const games = history.games?.games || [];
    if (games.length === 0) {
      console.log("No games found in match history.");
      return;
    }
    
    console.log(`Found ${games.length} games. Processing...`);

    // 3.5 Get champions map
    const { data: championsData } = await supabase.from('champions').select('id, ddragon_key');
    const championsMap = new Map();
    if (championsData) {
      championsData.forEach(c => {
        if (c.ddragon_key) championsMap.set(Number(c.ddragon_key), c.id);
      });
    }

    // 4. Process each game
    for (const game of games) {
      const gameId = game.gameId;
      console.log(`\n--- Processing Game ${gameId} ---`);
      
      // Check if match already exists to avoid duplicate work
      const { data: existingMatch } = await supabase
        .from('match_history')
        .select('id')
        .eq('game_id', gameId)
        .single();
        
      if (existingMatch) {
        console.log(`Game ${gameId} already exists in Supabase. Skipping.`);
        continue;
      }
      
      // Fetch full match details
      const matchDetails = await lcuRequest(`/lol-match-history/v1/games/${gameId}`, port, token);
      
      // Insert into match_history
      const { data: insertedMatch, error: matchError } = await supabase
        .from('match_history')
        .insert({
          game_id: gameId,
          game_creation: new Date(matchDetails.gameCreation).toISOString(),
          game_duration: matchDetails.gameDuration,
          game_mode: matchDetails.gameMode,
          game_type: matchDetails.gameType
        })
        .select()
        .single();
        
      if (matchError) {
        console.error("Error inserting match:", matchError.message);
        continue;
      }
      
      const dbMatchId = insertedMatch.id;
      
      const participants = matchDetails.participants || [];
      const identities = matchDetails.participantIdentities || [];

      // Process participants
      for (const p of participants) {
        const identity = identities.find(id => id.participantId === p.participantId);
        if (!identity || !identity.player) continue;
        
        const playerInfo = identity.player;
        const riotId = `${playerInfo.gameName || playerInfo.summonerName}#${playerInfo.tagLine || 'EUW'}`;
        
        // 5. Check if player exists in 'players' table
        let { data: dbPlayer } = await supabase
          .from('players')
          .select('id, pseudo')
          .eq('pseudo', riotId)
          .single();
          
        if (!dbPlayer) {
          console.log(`Player ${riotId} not found in DB. Creating new fake profile...`);
          // Create fake player (using a unique string for the discord ID to satisfy UNIQUE constraint)
          const fakeDiscord = `fake_discord_${Math.random().toString(36).substr(2, 9)}`;
          const { data: newPlayer, error: playerError } = await supabase
            .from('players')
            .insert({
              pseudo: riotId,
              discord: fakeDiscord,
              primary_role: 'top',
              secondary_role: 'jungle',
              champion_pool: [],
              champion_signature: 'None',
              rank: 'Unranked',
              playstyle: 'Unknown',
              mindset: 'Unknown'
            })
            .select()
            .single();
            
          if (playerError) {
            console.error(`Error creating player ${riotId}:`, playerError.message);
            continue;
          }
          dbPlayer = newPlayer;
        }
        
        // 6. Insert participant stats
        const stats = p.stats;
        const { error: partError } = await supabase
          .from('match_participants')
          .insert({
            match_id: dbMatchId,
            player_id: dbPlayer.id,
            champion_id: championsMap.get(Number(p.championId)) || null,
            kills: stats.kills,
            deaths: stats.deaths,
            assists: stats.assists,
            total_damage_dealt_to_champions: stats.totalDamageDealtToChampions,
            win: stats.win,
            first_blood_kill: stats.firstBloodKill,
            total_time_spent_dead: readTotalTimeSpentDead(stats, p),
            total_damage_dealt: stats.totalDamageDealt,
            total_damage_taken: stats.totalDamageTaken,
            damage_self_mitigated: stats.damageSelfMitigated,
            vision_score: stats.visionScore,
            wards_placed: stats.wardsPlaced,
            wards_killed: stats.wardsKilled,
            gold_earned: stats.goldEarned,
            total_minions_killed: stats.totalMinionsKilled,
            largest_killing_spree: stats.largestKillingSpree
          });
          
        if (partError) {
          console.error(`Error inserting stats for ${riotId}:`, partError.message);
        } else {
          console.log(`Inserted stats for ${riotId} (${stats.kills}/${stats.deaths}/${stats.assists})`);
        }
      }
      
      console.log(`Game ${gameId} successfully saved to Supabase!`);
    }
    
    console.log("\nAll done! You can check your Supabase dashboard to see the populated data.");

  } catch (error) {
    console.error("An error occurred during execution:", error);
  }
}

// Ignore TLS errors for LCU's self-signed certs in native Node fetch
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

run();