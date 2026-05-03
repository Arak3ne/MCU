import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

function generateId() {
  return crypto.randomUUID();
}

function generateChampionship(teamIds) {
  const matches = [];
  const teams = [...teamIds];
  if (teams.length % 2 !== 0) teams.push('BYE');
  const numRounds = teams.length - 1;
  const halfSize = teams.length / 2;

  for (let round = 0; round < numRounds; round++) {
    let matchOrder = 1;
    for (let i = 0; i < halfSize; i++) {
      const team1 = teams[i];
      const team2 = teams[teams.length - 1 - i];

      if (team1 !== 'BYE' && team2 !== 'BYE') {
        matches.push({
          id: generateId(),
          stage: 'championship',
          round: round + 1,
          match_order: matchOrder++,
          team1_id: team1,
          team2_id: team2,
        });
      }
    }
    const first = teams.shift();
    const last = teams.pop();
    teams.unshift(first, last);
  }
  return matches;
}

async function main() {
  const { data: teams } = await supabase.from('teams').select('id').limit(6);
  if (!teams || teams.length < 6) {
    console.log('Not enough teams'); return;
  }
  const teamIds = teams.map(t => t.id);
  
  const matches = generateChampionship(teamIds);
  console.log('Matches to insert length:', matches.length);

  console.log('Clearing existing...');
  let query = supabase.from("playoff_matches").delete().neq("id", "00000000-0000-0000-0000-000000000000").eq("stage", "championship");
  const { data: delData, error: deleteError } = await query.select(); // force select to see rows deleted
  console.log('Delete error:', deleteError, 'Deleted rows:', delData?.length);

  console.log('Inserting...');
  const { error: insertError } = await supabase
    .from("playoff_matches")
    .insert(matches);
  console.log('Insert error:', insertError);
}

main()