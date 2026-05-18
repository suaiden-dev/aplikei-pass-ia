import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { err, json, options } from "../_shared/core/http.ts";
import {
  approveWithdrawal,
  getWithdrawalAuthContext,
  requestWithdrawal,
} from "../_shared/billing/application/withdrawals.ts";

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return options();
  if (req.method !== "POST") return err("Method not allowed", 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) return err("Supabase configuration missing.", 500);

    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return err("Unauthorized", 401);

    const token = authHeader.replace("Bearer ", "").trim();
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const user = await getWithdrawalAuthContext(supabase, token);
    const payload = await req.json() as Record<string, unknown>;
    const action = asString(payload.action);

    if (action === "request") return json(await requestWithdrawal(supabase, user, payload));
    if (action === "approve") return json(await approveWithdrawal(supabase, user, payload));
    return err("Invalid action. Use 'request' or 'approve'.", 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized"
      ? 401
      : message === "Forbidden"
      ? 403
      : message === "Withdrawal not found."
      ? 404
      : 400;
    return err(message, status);
  }
});
