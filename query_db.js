import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase.rpc('get_table_info', { table_name: 'user_accounts' });
  if (error) {
    console.error("RPC Error:", error);
    // Let's try inserting/updating to see the exact error
  } else {
    console.log(data);
  }
}
main();
