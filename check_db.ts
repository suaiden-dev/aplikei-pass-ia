
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: accounts, error: accountsErr, count: accountsCount } = await supabase
    .from("user_accounts")
    .select("*", { count: "exact" });
    
  console.log("User Accounts Error:", accountsErr);
  console.log("User Accounts Count:", accountsCount);
  console.log("User Accounts Sample:", accounts?.slice(0, 2));

  const { data: services, error: servicesErr, count: servicesCount } = await supabase
    .from("user_services")
    .select("*", { count: "exact" });

  console.log("User Services Error:", servicesErr);
  console.log("User Services Count:", servicesCount);
  console.log("User Services Sample:", services?.slice(0, 2));
}

check();
