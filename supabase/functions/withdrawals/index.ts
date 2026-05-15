import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { corsHeaders, err, json, options } from "../_shared/cors.ts";

type UserRole = "master" | "admin_lawyer" | "manager" | "seller" | "customer";

interface AuthContext {
  userId: string;
  role: UserRole;
  officeId: string | null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function asAmount(value: unknown): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : Number.NaN;
}

async function getAuthContext(
  supabase: ReturnType<typeof createClient>,
  token: string,
): Promise<AuthContext> {
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    throw new Error("Unauthorized");
  }

  const userId = userData.user.id;
  const { data: account, error: accountError } = await supabase
    .from("user_accounts")
    .select("id, role, office_id")
    .eq("id", userId)
    .maybeSingle();

  if (accountError || !account) {
    throw new Error("Account not found");
  }

  return {
    userId,
    role: (account.role ?? "customer") as UserRole,
    officeId: account.office_id ?? null,
  };
}

async function resolveOfficeIdForUser(
  supabase: ReturnType<typeof createClient>,
  user: AuthContext,
  requestedOfficeId: string | null,
): Promise<string> {
  const officeId = requestedOfficeId ?? user.officeId;

  if (user.role === "master") {
    if (!officeId) throw new Error("office_id is required for master");
    return officeId;
  }

  // Non-master can only request for own office (or office they own if office_id is null on account)
  if (officeId && officeId === user.officeId) {
    return officeId;
  }

  const { data: ownedOffice, error: ownedOfficeError } = await supabase
    .from("offices")
    .select("id")
    .eq("owner_id", user.userId)
    .maybeSingle();

  if (ownedOfficeError) throw ownedOfficeError;
  if (!ownedOffice?.id) throw new Error("No office associated with this account");
  if (officeId && officeId !== ownedOffice.id) throw new Error("Forbidden for this office");

  return ownedOffice.id;
}

async function calculateAvailableBalance(
  supabase: ReturnType<typeof createClient>,
  officeId: string,
): Promise<number> {
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("office_net_amount_usd, created_at, payment_status, subscription_available_after_minutes")
    .eq("office_id", officeId);

  if (ordersError) throw ordersError;

  const nowMs = Date.now();
  const paidOrders = (orders ?? []).filter((o) =>
    ["paid", "approved", "complete", "succeeded", "completed"].includes(
      String(o.payment_status ?? "").toLowerCase(),
    ),
  );

  const maturedBalance = paidOrders
    .filter((o) => {
      const createdMs = o.created_at ? new Date(o.created_at).getTime() : 0;
      const delayMin = Math.max(1, Number(o.subscription_available_after_minutes) || 20160);
      return createdMs + delayMin * 60 * 1000 <= nowMs;
    })
    .reduce((sum, o) => sum + (Number(o.office_net_amount_usd) || 0), 0);

  const { data: withdrawals, error: withdrawalsError } = await supabase
    .from("office_withdrawals")
    .select("amount, status")
    .eq("office_id", officeId);

  if (withdrawalsError) throw withdrawalsError;

  const reserved = (withdrawals ?? [])
    .filter((w) =>
      ["pending", "approved", "processing", "completed", "paid"].includes(
        String(w.status ?? "").toLowerCase(),
      ),
    )
    .reduce((sum, w) => sum + (Number(w.amount) || 0), 0);

  return Math.max(0, maturedBalance - reserved);
}

async function handleRequest(
  supabase: ReturnType<typeof createClient>,
  user: AuthContext,
  payload: Record<string, unknown>,
) {
  if (!["admin_lawyer", "manager", "master"].includes(user.role)) {
    return err("Forbidden", 403);
  }

  const requestedOfficeId = asString(payload.office_id);
  const officeId = await resolveOfficeIdForUser(supabase, user, requestedOfficeId);
  const amount = asAmount(payload.amount);
  const method = asString(payload.method) ?? "stripe";
  const paymentLink = asString(payload.payment_link);

  if (!Number.isFinite(amount) || amount <= 0) {
    return err("Invalid amount. It must be greater than zero.", 400);
  }

  const availableBalance = await calculateAvailableBalance(supabase, officeId);
  if (amount > availableBalance) {
    return err(`Amount exceeds available balance (${availableBalance.toFixed(2)}).`, 400);
  }

  const { data: created, error: insertError } = await supabase
    .from("office_withdrawals")
    .insert({
      office_id: officeId,
      amount,
      method,
      payment_link: method === "stripe" ? paymentLink : null,
      status: "pending",
    })
    .select("*")
    .single();

  if (insertError) return err(insertError.message, 400);
  return json({ success: true, withdrawal: created, availableBalance });
}

async function handleApprove(
  supabase: ReturnType<typeof createClient>,
  user: AuthContext,
  payload: Record<string, unknown>,
) {
  if (user.role !== "master") return err("Forbidden", 403);

  const withdrawalId = asString(payload.withdrawal_id);
  const status = asString(payload.status);
  if (!withdrawalId) return err("withdrawal_id is required.", 400);
  if (status !== "approved" && status !== "rejected") {
    return err("status must be 'approved' or 'rejected'.", 400);
  }

  const { data: existing, error: existingError } = await supabase
    .from("office_withdrawals")
    .select("id, office_id, amount, status, payment_link")
    .eq("id", withdrawalId)
    .maybeSingle();

  if (existingError) return err(existingError.message, 400);
  if (!existing) return err("Withdrawal not found.", 404);

  if (String(existing.status ?? "").toLowerCase() !== "pending") {
    return err("Only pending withdrawals can be approved/rejected.", 400);
  }

  if (status === "approved") {
    const availableBalance = await calculateAvailableBalance(supabase, existing.office_id);
    if ((Number(existing.amount) || 0) > availableBalance) {
      return err(`Withdrawal amount exceeds current available balance (${availableBalance.toFixed(2)}).`, 400);
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from("office_withdrawals")
    .update({ status })
    .eq("id", withdrawalId)
    .select("*")
    .single();

  if (updateError) return err(updateError.message, 400);
  return json({ success: true, withdrawal: updated });
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
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const user = await getAuthContext(supabase, token);
    const payload = (await req.json()) as Record<string, unknown>;
    const action = asString(payload.action);

    if (action === "request") return await handleRequest(supabase, user, payload);
    if (action === "approve") return await handleApprove(supabase, user, payload);

    return err("Invalid action. Use 'request' or 'approve'.", 400);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
