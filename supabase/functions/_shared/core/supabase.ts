import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

type ClientOptions = Parameters<typeof createClient>[2];

export function createAdminClient(options?: ClientOptions) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase configuration missing.");
  }

  return createClient(supabaseUrl, serviceRoleKey, options);
}

export const supabaseAdmin = createAdminClient({
  db: {
    schema: "aplikei",
  },
});
