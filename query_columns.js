import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  // Try to use REST API to query a fake table, wait, we can't query information_schema from REST API without RPC.
  // Instead, let's try to fetch user_accounts and see if it fails.
  const { data, error } = await supabase.from('user_accounts').select('*').limit(1);
  console.log("user_accounts:", data, error);
}
main();
