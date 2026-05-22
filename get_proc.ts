import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envStr = fs.readFileSync(".env", "utf-8");
const env: Record<string, string> = {};
envStr.split("\n").forEach(line => {
  if (line.trim().startsWith("VITE_SUPABASE")) {
    const [key, ...rest] = line.split("=");
    env[key.trim()] = rest.join("=").trim().replace(/^"|"$/g, '');
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase
    .from("user_services")
    .select("id, status, current_step, step_data, user_id")
    .in("service_slug", ["troca-status", "extensao-status"])
    .gte("current_step", 19)
    .order("created_at", { ascending: false })
    .limit(5);
    
  if (error) {
    console.error(error);
    return;
  }
  
  data.forEach(p => {
    console.log(`Process: ${p.id}`);
    console.log(`Status: ${p.status}`);
    console.log(`Current Step: ${p.current_step}`);
    console.log(`Workflow Status: ${(p.step_data as any)?.workflow_status}`);
    console.log(`Motion Reason: ${(p.step_data as any)?.motion_reason ? 'YES' : 'NO'}`);
    console.log(`Motion Initial Paid: ${(p.step_data as any)?.motion_initial_paid}`);
    console.log(`---`);
  });
}

check();
