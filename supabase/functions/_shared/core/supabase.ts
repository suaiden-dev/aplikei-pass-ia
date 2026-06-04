import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

// When `supabase gen types typescript` is run, replace this with:
//   import type { Database } from "./database.ts";
//   export type Supabase = SupabaseClient<Database>;
// For now, use the unparameterized client as the canonical type.
export type Supabase = SupabaseClient;

type ClientOptions = Parameters<typeof createClient>[2];

export function createAdminClient(options?: ClientOptions) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase configuration missing.");
  }

  return createClient(supabaseUrl, serviceRoleKey, options);
}

// Schema "aplikei" is a custom Supabase schema — cast needed because the unparameterized
// SupabaseClient type restricts `schema` to `undefined` without a Database generic.
export const supabaseAdmin = createAdminClient({
  db: { schema: "aplikei" as unknown as undefined },
});
