import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('Select error:', error);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log('No players found');
    return;
  }
  
  console.log('Found player:', data[0].id);
  
  const { data: updateData, error: updateError } = await supabase
    .from('players')
    .update({ riot_id: 'Test#1234' })
    .eq('id', data[0].id)
    .select('*')
    .single();
    
  console.log('Update result:', { data: updateData, error: updateError });
}

test();