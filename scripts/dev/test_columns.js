import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dqoixaksmbdmbkbtphpt.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb2l4YWtzbWJkbWJrYnRwaHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1Mjg2NjksImV4cCI6MjA5MzEwNDY2OX0.NDVtX2Hgfq-W0L6JfuzW9PS7zz7moS9Z5V_oLHKRW_o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('fantasy_teams').select('*').limit(1);
  console.log(data, error);
}

run();