import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase
    .from('players')
    .update({ riot_id: 'Arak#1234' })
    .eq('id', '677125ab-8e2e-4a77-a502-3df37fbaa2c9')
    .select('*')
    .single();
    
  console.log('Update result:', { data, error });
}

test();