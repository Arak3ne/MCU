import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('Testing insert...');
  
  const { data: teams } = await supabase.from('teams').select('id').limit(6);
  if (!teams || teams.length < 6) {
    console.log('Not enough teams', teams);
    return;
  }
  const teamIds = teams.map(t => t.id);
  
  // Create a dummy match
  const matches = [{
    id: crypto.randomUUID(),
    stage: 'championship',
    round: 1,
    match_order: 1,
    team1_id: teamIds[0],
    team2_id: teamIds[1]
  }];
  
  console.log('Matches to insert:', matches);

  const { error: deleteError } = await supabase.from('playoff_matches').delete().eq('stage', 'championship');
  console.log('Delete error:', deleteError);

  const { data, error } = await supabase.from('playoff_matches').insert(matches).select('*');
  console.log('Insert result:', data, error);
}

main()