import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function mockMatchData() {
  console.log('🔄 Starting mock match data generation...');

  // 1. Lock all day 1 teams so the animation can play
  console.log('🔒 Locking all Day 1 fantasy teams...');
  const { error: lockError } = await supabase
    .from('fantasy_teams')
    .update({ locked: true })
    .eq('tournament_day', 1);

  if (lockError) {
    console.error('Failed to lock teams:', lockError);
  }

  // 2. Get some players
  const { data: teams } = await supabase.from('fantasy_teams').select('players').eq('tournament_day', 1);
  let playerIds = new Set();
  
  if (teams && teams.length > 0) {
    teams.forEach(t => t.players?.forEach(p => playerIds.add(p)));
  }

  let playersToUse = Array.from(playerIds);
  if (playersToUse.length < 10) {
    const { data: allPlayers } = await supabase.from('players').select('id').limit(10);
    if (allPlayers) {
      allPlayers.forEach(p => playerIds.add(p.id));
      playersToUse = Array.from(playerIds).slice(0, 10);
    }
  }

  if (playersToUse.length === 0) {
    console.error('❌ No players found in the database!');
    return;
  }

  console.log(`👥 Simulating match for ${playersToUse.length} players...`);

  // 3. Create a match
  const { data: match, error: matchError } = await supabase
    .from('match_history')
    .insert({
      game_id: Math.floor(Math.random() * 10000000000),
      game_duration: 1800 + Math.floor(Math.random() * 600),
      game_mode: 'CLASSIC',
      game_type: 'CUSTOM_GAME'
    })
    .select()
    .single();

  if (matchError) {
    console.error('❌ Failed to create match:', matchError);
    return;
  }

  console.log(`✅ Match created: ${match.id}`);

  // 3.5 Get some champions for mock data
  const { data: championsData, error: champsError } = await supabase
    .from('champions')
    .select('id')
    .limit(10);
    
  if (champsError || !championsData || championsData.length === 0) {
    console.error('❌ Failed to get champions:', champsError);
    return;
  }
  
  // 4. Create match participants with random stats
  const participants = playersToUse.map((playerId, index) => {
    const isWinner = index < 5;
    const randomChamp = championsData[Math.floor(Math.random() * championsData.length)];
    return {
      match_id: match.id,
      player_id: playerId,
      champion_id: randomChamp.id,
      kills: Math.floor(Math.random() * 15),
      deaths: Math.floor(Math.random() * 10),
      assists: Math.floor(Math.random() * 20),
      total_damage_dealt_to_champions: 15000 + Math.floor(Math.random() * 25000),
      win: isWinner,
      first_blood_kill: index === 0,
      total_time_spent_dead: Math.floor(Math.random() * 200),
      vision_score: 20 + Math.floor(Math.random() * 50),
      wards_placed: 10 + Math.floor(Math.random() * 20),
      gold_earned: 10000 + Math.floor(Math.random() * 5000),
      total_minions_killed: 150 + Math.floor(Math.random() * 150),
      largest_killing_spree: Math.floor(Math.random() * 8),
      team_id: isWinner ? 100 : 200,
    };
  });

  const { error: partError } = await supabase.from('match_participants').insert(participants);
  if (partError) {
    console.error('❌ Failed to insert participants:', partError);
    return;
  }
  
  console.log('✅ Participants inserted! Data is now available in /stats');

  // 5. Update fantasy scores for these players (add random points)
  console.log('📈 Updating fantasy scores to trigger animation...');
  for (const playerId of playersToUse) {
    const { data: currentScore } = await supabase
      .from('fantasy_player_scores')
      .select('score')
      .eq('player_id', playerId)
      .eq('tournament_day', 1)
      .single();

    const oldScore = currentScore?.score || 0;
    const addedPoints = 10 + Math.floor(Math.random() * 20);
    const newScore = oldScore + addedPoints;

    const { error: scoreError } = await supabase
      .from('fantasy_player_scores')
      .upsert({
        player_id: playerId,
        tournament_day: 1,
        score: newScore,
        validated: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'player_id,tournament_day' });
      
    if (scoreError) {
      console.error(`Failed to update score for ${playerId}:`, scoreError);
    }
  }

  console.log('✅ Fantasy scores updated!');
  console.log('\n🎉 ALL DONE! Go to the browser and:');
  console.log('1. Check /stats to see the new match data');
  console.log('2. Check /fantasy to see the score reveal animation (if you have an active team)');
}

mockMatchData();