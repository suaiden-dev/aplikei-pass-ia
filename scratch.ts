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

if (!supabaseUrl || !supabaseKey) throw new Error("No env");

const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
  const { data, error } = await supabase
    .from("user_services")
    .select("id, step_data, status, current_step")
    .in("service_slug", ["troca-status", "extensao-status"])
    .eq("status", "completed")
    .order("created_at", { ascending: false });
    
  if (error) {
    console.error(error);
    return;
  }
  
  for (const proc of data || []) {
    const sd = proc.step_data as any || {};
    if (sd.workflow_status === "awaiting_proposal" || sd.workflow_status === "in_progress" || sd.workflow_status === "not_started" || sd.workflow_status === "waitingProposal") {
      console.log(`Fixing process ${proc.id} (status: ${sd.workflow_status})`);
      await supabase.from("user_services").update({ status: "active" }).eq("id", proc.id);
    }
  }
  console.log("Done");
}

fix();
