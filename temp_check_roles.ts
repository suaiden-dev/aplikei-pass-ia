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

async function run() {
  const { data: messages, error } = await supabase
    .from("chat_messages")
    .select("id, process_id, sender_role, content, created_at")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching messages:", error);
    return;
  }
  console.log("Total legacy messages:", messages?.length);
  console.log("Legacy messages details:", messages);
}

run();
