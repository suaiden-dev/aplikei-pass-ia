import { supabase } from "../shared/lib/supabase";

export interface FinanceMonthlyAnalytics {
  month: string;
  revenue: number;
  profit: number;
}

export interface FinanceTransaction {
  id: string;
  clientName: string;
  clientEmail: string;
  officeName: string;
  productName: string;
  amount: number;
  method: string;
  createdAt: string;
  status: string;
}

interface FinanceMonthlyAnalyticsRpcRow {
  month: string;
  revenue_usd: number | string | null;
  profit_usd: number | string | null;
}

interface FinanceTransactionViewRow {
  id: string;
  created_at: string | null;
  client_name: string;
  client_email: string;
  office_name: string | null;
  product_slug: string;
  total_price_usd: number | string;
  payment_method: string;
  payment_status: string;
}

function normalizeProductName(slug?: string | null) {
  if (!slug) return "General";
  return slug.replace(/-/g, " ").toUpperCase();
}

function normalizeOfficeName(name?: string | null) {
  if (!name) return "Direct";
  return name;
}

function normalizeMethod(method?: string | null) {
  if (!method) return "STRIPE";
  return method.toUpperCase();
}

export const financeAnalyticsService = {
  async getMonthlyAnalytics(months = 6): Promise<FinanceMonthlyAnalytics[]> {
    const safeMonths = Number.isFinite(months) ? Math.min(Math.max(Math.trunc(months), 1), 24) : 6;

    const { data, error } = await supabase.rpc("get_finance_analytics_master", {
      p_months: safeMonths,
    });

    if (error) {
      throw new Error(`Erro ao carregar analytics mensais: ${error.message}`);
    }

    return ((data ?? []) as FinanceMonthlyAnalyticsRpcRow[]).map((item) => ({
      month: item.month,
      revenue: Number(item.revenue_usd ?? 0),
      profit: Number(item.profit_usd ?? 0),
    }));
  },

  async getRecentTransactions(limit = 50): Promise<FinanceTransaction[]> {
    const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(Math.trunc(limit), 1), 200) : 50;

    const { data, error } = await supabase
      .from("v_finance_transactions_master")
      .select("id, created_at, client_name, client_email, office_name, product_slug, total_price_usd, payment_method, payment_status")
      .order("created_at", { ascending: false })
      .limit(safeLimit);

    if (error) {
      throw new Error(`Erro ao carregar transações recentes: ${error.message}`);
    }

    return ((data ?? []) as FinanceTransactionViewRow[]).map((row) => ({
      id: row.id,
      clientName: row.client_name || "Guest",
      clientEmail: row.client_email || "",
      officeName: normalizeOfficeName(row.office_name),
      productName: normalizeProductName(row.product_slug),
      amount: Number(row.total_price_usd ?? 0),
      method: normalizeMethod(row.payment_method),
      createdAt: row.created_at || new Date(0).toISOString(),
      status: row.payment_status || "unknown",
    }));
  },
};
