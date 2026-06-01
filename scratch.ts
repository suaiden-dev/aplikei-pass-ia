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

async function inspectServices() {
  const { data: services, error } = await supabase
    .from("user_services")
    .select("*")
    .limit(1);

  if (error) {
    console.error("Services Error:", error);
  } else {
    console.log("=== ONE USER_SERVICE ROW ALL FIELDS ===");
    if (services && services.length > 0) {
      console.log(Object.keys(services[0]));
      console.log(services[0]);
    } else {
      console.log("No services found");
    }
  }
}

inspectServices();
