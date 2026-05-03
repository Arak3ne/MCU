import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)
async function main() {
  console.log('Inserting teams...');
  const { data, error } = await supabase.from('teams').insert([
    { name: 'Team Alpha', wins: 0, losses: 0, points: 0 },
    { name: 'Team Beta', wins: 0, losses: 0, points: 0 },
    { name: 'Team Gamma', wins: 0, losses: 0, points: 0 },
    { name: 'Team Delta', wins: 0, losses: 0, points: 0 },
    { name: 'Team Epsilon', wins: 0, losses: 0, points: 0 },
    { name: 'Team Omega', wins: 0, losses: 0, points: 0 }
  ]).select('*');
  console.log('Inserted teams:', data);
  if (error) console.error('Error:', error);
}
main()