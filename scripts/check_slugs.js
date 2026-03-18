import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://bxhaxvtzwxywytzryfxx.supabase.co"; // You might need the actual URL from env if known, let's just use the server's env
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "YOUR_KEY";

// wait, I can just use a node script to query if I load the .env.
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from("user_services").select("service_slug");
  if (error) console.error(error);
  else {
    const slugs = new Set(data.map(d => d.service_slug));
    console.log("Distinct service_slugs:", Array.from(slugs));
  }
}
run();
