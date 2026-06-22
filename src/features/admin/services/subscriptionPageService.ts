import { supabase } from "@shared/lib/supabase";

export interface DBPlan {
  id: string;
  name: string;
  description: string;
  type: "FIXED" | "PERCENTAGE" | "HYBRID";
  version: number;
  billing_model: "prepaid" | "postpaid" | "hybrid" | string;
  fixed_fee: number;
  percentage_fee: number;
  min_fee_per_transaction_usd?: number | null;
  min_monthly_fee?: number | null;
  max_monthly_fee?: number | null;
  rules?: Record<string, unknown> | null;
  effective_from?: string | null;
  effective_to?: string | null;
  features: string[];
  is_active: boolean;
  is_exclusive: boolean;
}

export interface BillingHistoryItem {
  id: string;
  planName: string;
  amountLabel: string;
  signedAt: string | null;
  effectiveTo: string | null;
  planVersion: number;
  billingModel: string;
}

export async function fetchOfficeName(officeId: string): Promise<string> {
  const { data, error } = await supabase
    .from("offices")
    .select("name")
    .eq("id", officeId)
    .maybeSingle();

  if (error) throw Error(error.message);
  return data?.name ?? "";
}

export async function fetchActiveSubscriptionPlans(): Promise<DBPlan[]> {
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("id, name, description, type, version, billing_model, fixed_fee, percentage_fee, min_fee_per_transaction_usd, min_monthly_fee, max_monthly_fee, effective_from, effective_to, features, is_active, is_exclusive")
    .eq("is_active", true)
    .limit(20);

  if (error) throw Error(error.message);
  return (data ?? []) as DBPlan[];
}

export async function fetchActiveSubscriptionPlansWithRules(): Promise<DBPlan[]> {
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("id, name, description, type, version, billing_model, fixed_fee, percentage_fee, min_fee_per_transaction_usd, min_monthly_fee, max_monthly_fee, rules, effective_from, effective_to, features, is_active, is_exclusive")
    .eq("is_active", true)
    .limit(20);

  if (error) throw Error(error.message);
  return (data ?? []) as DBPlan[];
}

interface SubscriptionHistoryRow {
  id: string;
  created_at: string;
  current_period_start: string | null;
  effective_to: string | null;
  plan_version: number | null;
  billing_model: string | null;
  plan_name: string | null;
  plan_type: string | null;
  fixed_fee: number | null;
  percentage_fee: number | null;
  min_fee_per_transaction_usd: number | null;
}

export async function fetchBillingHistory(
  officeId: string,
  noPlanLabel: string,
): Promise<BillingHistoryItem[]> {
  const { data, error } = await supabase
    .from("v_office_subscription_history")
    .select("id, created_at, current_period_start, effective_to, plan_version, billing_model, plan_name, plan_type, fixed_fee, percentage_fee, min_fee_per_transaction_usd")
    .eq("office_id", officeId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw Error(error.message);

  return ((data ?? []) as unknown as SubscriptionHistoryRow[]).map((row) => {
    const amountLabel = row.plan_type === "PERCENTAGE"
      ? `${row.percentage_fee ?? 0}%`
      : row.plan_type === "HYBRID"
        ? `$ ${row.fixed_fee ?? 0} + ${row.percentage_fee ?? 0}%`
        : `$ ${row.fixed_fee ?? 0}`;

    return {
      id: row.id,
      planName: row.plan_name || noPlanLabel,
      amountLabel,
      signedAt: row.current_period_start || row.created_at || null,
      effectiveTo: row.effective_to,
      planVersion: row.plan_version ?? 1,
      billingModel: row.billing_model ?? "prepaid",
    };
  });
}

export function normalizePlanName(name: string): string {
  const key = String(name || "").trim().toLowerCase();
  if (key === "crescimento (variável)" || key === "crescimento (variavel)") return "Scalable Plan";
  if (key === "plano fixo") return "Fixed Plan";
  return name;
}

export function normalizePlanDescription(description: string, type: DBPlan["type"], lang: string): string {
  const raw = String(description || "").trim();
  if (lang === "en") {
    if (raw.toLowerCase() === "pague apenas uma porcentagem do que faturar.") return "Pay only a percentage of what you bill.";
    if (type === "PERCENTAGE" && raw) return raw;
  }
  return raw;
}

export function getPlanColor(type: string): "primary" | "secondary" | "warning" {
  if (type === "FIXED") return "primary";
  if (type === "PERCENTAGE") return "secondary";
  if (type === "HYBRID") return "warning";
  return "primary";
}

export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

export function replaceAmount(text: string, value: number): string {
  return text.split("{{amount}}").join(formatUsd(value));
}

export async function cancelOfficeSubscription(officeId: string): Promise<void> {
  const { error } = await supabase
    .from("office_subscriptions")
    .update({
      status: "canceled",
      canceled_at: new Date().toISOString(),
      effective_to: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("office_id", officeId)
    .filter("status", "in", '("active","trialing")');

  if (error) throw Error(error.message);
}

export async function activateOfficeSubscription(params: {
  officeId: string;
  plan: DBPlan;
}): Promise<void> {
  const periodEnd = new Date();
  periodEnd.setDate(periodEnd.getDate() + 30);

  const { error } = await supabase
    .from("office_subscriptions")
    .upsert({
      office_id: params.officeId,
      plan_id: params.plan.id,
      plan_version: params.plan.version,
      billing_model: params.plan.billing_model ?? "prepaid",
      rules_snapshot: params.plan.rules ?? {},
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: periodEnd.toISOString(),
      effective_from: new Date().toISOString(),
      effective_to: periodEnd.toISOString(),
      canceled_at: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "office_id" });

  if (error) throw Error(error.message);
}
