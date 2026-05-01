import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', '975d21fa-6470-4f86-a4d4-6ea51004e70d');
    
  console.log('Select result:', { data, error });
}

test();