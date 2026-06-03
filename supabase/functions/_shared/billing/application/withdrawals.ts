// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;
export type UserRole = "master" | "admin_lawyer" | "manager" | "seller" | "customer";

export interface AuthContext {
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

export async function getWithdrawalAuthContext(
  supabase: SupabaseClient,
  token: string,
): Promise<AuthContext> {
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) throw new Error("Unauthorized");

  const { data: account, error: accountError } = await supabase
    .from("user_accounts")
    .select("id, role, office_id")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (accountError || !account) throw new Error("Account not found");

  return {
    userId: userData.user.id,
    role: (account.role ?? "customer") as UserRole,
    officeId: account.office_id ?? null,
  };
}

async function resolveOfficeIdForUser(
  supabase: SupabaseClient,
  user: AuthContext,
  requestedOfficeId: string | null,
) {
  const officeId = requestedOfficeId ?? user.officeId;
  if (user.role === "master") {
    if (!officeId) throw new Error("office_id is required for master");
    return officeId;
  }
  if (officeId && officeId === user.officeId) return officeId;

  const { data: ownedOffice, error } = await supabase
    .from("offices")
    .select("id")
    .eq("owner_id", user.userId)
    .maybeSingle();

  if (error) throw error;
  if (!ownedOffice?.id) throw new Error("No office associated with this account");
  if (officeId && officeId !== ownedOffice.id) throw new Error("Forbidden for this office");
  return ownedOffice.id;
}

async function calculateAvailableBalance(
  supabase: SupabaseClient,
  officeId: string,
  options?: { excludeWithdrawalId?: string },
) {
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("office_net_amount_usd, created_at, payment_status, subscription_available_after_minutes")
    .eq("office_id", officeId);
  if (ordersError) throw ordersError;

  const nowMs = Date.now();
  const maturedBalance = (orders ?? [])
    .filter((order: Record<string, unknown>) =>
      ["paid", "approved", "complete", "succeeded", "completed"].includes(
        String(order.payment_status ?? "").toLowerCase(),
      )
    )
    .filter((order: Record<string, unknown>) => {
      const createdMs = order.created_at ? new Date(order.created_at as string).getTime() : 0;
      const delayMin = Math.max(1, Number(order.subscription_available_after_minutes) || 20160);
      return createdMs + delayMin * 60 * 1000 <= nowMs;
    })
    .reduce((sum: number, order: Record<string, unknown>) => sum + (Number(order.office_net_amount_usd) || 0), 0);

  const { data: withdrawals, error: withdrawalsError } = await supabase
    .from("office_withdrawals")
    .select("id, amount, status")
    .eq("office_id", officeId);
  if (withdrawalsError) throw withdrawalsError;

  const excludeWithdrawalId = options?.excludeWithdrawalId ?? null;
  const reserved = (withdrawals ?? [])
    .filter((withdrawal: Record<string, unknown>) =>
      !excludeWithdrawalId ||
      String(withdrawal.id ?? "") !== excludeWithdrawalId,
    )
    .filter((withdrawal: Record<string, unknown>) =>
      ["pending", "approved", "processing", "completed", "paid"].includes(
        String(withdrawal.status ?? "").toLowerCase(),
      )
    )
    .reduce((sum: number, withdrawal: Record<string, unknown>) => sum + (Number(withdrawal.amount) || 0), 0);

  return Math.max(0, maturedBalance - reserved);
}

export async function requestWithdrawal(
  supabase: SupabaseClient,
  user: AuthContext,
  payload: Record<string, unknown>,
) {
  if (!["admin_lawyer", "manager", "master"].includes(user.role)) throw new Error("Forbidden");
  const officeId = await resolveOfficeIdForUser(supabase, user, asString(payload.office_id));
  const amount = asAmount(payload.amount);
  const method = asString(payload.method) ?? "stripe";
  const paymentLink = asString(payload.payment_link);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Invalid amount. It must be greater than zero.");

  const availableBalance = await calculateAvailableBalance(supabase, officeId);
  if (amount > availableBalance) throw new Error(`Amount exceeds available balance (${availableBalance.toFixed(2)}).`);

  const { data, error } = await supabase.from("office_withdrawals").insert({
    office_id:    officeId,
    amount,
    method,
    payment_link: method === "stripe" ? paymentLink : null,
    status:       "pending",
    requested_by: user.userId,
  }).select("*").single();
  if (error) throw error;
  return { success: true, withdrawal: data, availableBalance };
}

export async function approveWithdrawal(
  supabase: SupabaseClient,
  user: AuthContext,
  payload: Record<string, unknown>,
) {
  if (user.role !== "master") throw new Error("Forbidden");
  const withdrawalId = asString(payload.withdrawal_id);
  const status = asString(payload.status);
  if (!withdrawalId) throw new Error("withdrawal_id is required.");
  if (status !== "approved" && status !== "rejected") throw new Error("status must be 'approved' or 'rejected'.");

  const { data: existing, error: existingError } = await supabase
    .from("office_withdrawals")
    .select("id, office_id, amount, status, payment_link, requested_by")
    .eq("id", withdrawalId)
    .maybeSingle();
  if (existingError) throw existingError;
  if (!existing) throw new Error("Withdrawal not found.");
  if (String(existing.status ?? "").toLowerCase() !== "pending") {
    throw new Error("Only pending withdrawals can be approved/rejected.");
  }

  if (status === "approved") {
    const availableBalance = await calculateAvailableBalance(supabase, existing.office_id, {
      excludeWithdrawalId: existing.id,
    });
    if ((Number(existing.amount) || 0) > availableBalance) {
      throw new Error(`Withdrawal amount exceeds current available balance (${availableBalance.toFixed(2)}).`);
    }
  }

  const { data: reviewerAccount } = await supabase
    .from("user_accounts")
    .select("full_name, name, email")
    .eq("id", user.userId)
    .maybeSingle();

  const reviewedByName =
    String(reviewerAccount?.full_name || reviewerAccount?.name || reviewerAccount?.email || user.userId);

  const { data, error } = await supabase
    .from("office_withdrawals")
    .update({
      status,
      reviewed_by_id: user.userId,
      reviewed_by_name: reviewedByName,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", withdrawalId)
    .select("*")
    .single();
  if (error) throw error;
  return { success: true, withdrawal: data };
}
