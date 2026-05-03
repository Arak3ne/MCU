import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('fantasy_player_scores').select('*').limit(1);
  if (error) {
    console.error('Error fetching fantasy_player_scores:', error);
  } else if (data && data.length > 0) {
    console.log('fantasy_player_scores columns:', Object.keys(data[0]));
  } else {
    // Try to insert a dummy to get an error about required columns or just see it fail
    const { error: insErr } = await supabase.from('fantasy_player_scores').insert([{ player_id: '123' }]);
    console.log('Insert error for fantasy_player_scores:', insErr);
  }
  
  const { data: data2, error: err2 } = await supabase.from('match_participants').select('*').limit(1);
  if (err2) {
    console.error('Error fetching match_participants:', err2);
  } else if (data2 && data2.length > 0) {
    console.log('match_participants columns:', Object.keys(data2[0]));
  } else {
    const { error: insErr2 } = await supabase.from('match_participants').insert([{ match_id: '123' }]);
    console.log('Insert error for match_participants:', insErr2);
  }
}
check();