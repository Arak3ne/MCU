import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase
    .from('players')
    .select('id, pseudo, discord, riot_id');
    
  if (error) {
    console.error('Error fetching players:', error);
    return;
  }
  
  console.log('--- PLAYERS IN DATABASE ---');
  console.table(data);
  console.log('---------------------------');
}

test();