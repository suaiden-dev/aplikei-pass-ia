import { supabase } from "@shared/lib/supabase";

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

export interface FinanceRoleAction {
  role: "seller" | "vendor" | "manager";
  count: number;
}

export interface FinanceRoleActorMetric {
  userId: string;
  name: string;
  role: "seller" | "manager";
  count: number;
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
  async getMonthlyAnalytics(months = 6, officeId?: string): Promise<FinanceMonthlyAnalytics[]> {
    const safeMonths = Number.isFinite(months) ? Math.min(Math.max(Math.trunc(months), 1), 24) : 6;

    const { data, error } = await supabase.rpc("get_finance_analytics", {
      p_months: safeMonths,
      p_office_id: officeId || null,
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

  async getRecentTransactions(limit = 50, officeId?: string): Promise<FinanceTransaction[]> {
    const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(Math.trunc(limit), 1), 200) : 50;

    let query = supabase
      .from("v_finance_analytics_transactions")
      .select("id, created_at, client_name, client_email, office_name, product_slug, total_price_usd, payment_method, payment_status")
      .order("created_at", { ascending: false })
      .limit(safeLimit);

    if (officeId) {
      query = query.eq("office_id", officeId);
    }

    const { data, error } = await query;

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

  async getRoleActions(officeId?: string): Promise<FinanceRoleAction[]> {
    let query = supabase
      .from("orders")
      .select("user_id")
      .order("created_at", { ascending: false })
      .limit(500);

    if (officeId) {
      query = query.eq("office_id", officeId);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Erro ao carregar ações por perfil: ${error.message}`);
    }

    const counters: Record<FinanceRoleAction["role"], number> = {
      seller: 0,
      vendor: 0,
      manager: 0,
    };

    const userIds = Array.from(
      new Set(
        ((data ?? []) as Array<{ user_id?: string | null }>)
          .map((row) => row.user_id)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    if (userIds.length === 0) {
      return [
        { role: "seller", count: counters.seller },
        { role: "vendor", count: counters.vendor },
        { role: "manager", count: counters.manager },
      ];
    }

    const { data: usersData, error: usersError } = await supabase
      .from("user_accounts")
      .select("id, role")
      .in("id", userIds);

    if (usersError) {
      throw new Error(`Erro ao carregar perfis dos usuários: ${usersError.message}`);
    }

    for (const user of ((usersData ?? []) as Array<{ role?: string | null }>)) {
      const rawRole = String(user.role ?? "").toLowerCase();
      if (rawRole === "seller") counters.seller += 1;
      if (rawRole === "manager") counters.manager += 1;
      if (rawRole === "admin_lawyer" || rawRole === "vendor") counters.vendor += 1;
    }

    return [
      { role: "seller", count: counters.seller },
      { role: "vendor", count: counters.vendor },
      { role: "manager", count: counters.manager },
    ];
  },

  async getRoleActorMetrics(
    role: "seller" | "manager",
    officeId?: string,
  ): Promise<FinanceRoleActorMetric[]> {
    let query = supabase
      .from("orders")
      .select("user_id")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (officeId) {
      query = query.eq("office_id", officeId);
    }

    const { data: ordersData, error: ordersError } = await query;
    if (ordersError) {
      throw new Error(`Erro ao carregar métricas por usuário: ${ordersError.message}`);
    }

    const userIds = ((ordersData ?? []) as Array<{ user_id?: string | null }>)
      .map((row) => row.user_id)
      .filter((id): id is string => Boolean(id));

    if (userIds.length === 0) return [];

    const uniqueUserIds = Array.from(new Set(userIds));
    const { data: usersData, error: usersError } = await supabase
      .from("user_accounts")
      .select("id, role, full_name, email")
      .in("id", uniqueUserIds);

    if (usersError) {
      throw new Error(`Erro ao carregar usuários das métricas: ${usersError.message}`);
    }

    const usersById = new Map(
      ((usersData ?? []) as Array<{ id: string; role?: string | null; full_name?: string | null; email?: string | null }>).map((u) => [
        u.id,
        {
          role: String(u.role ?? "").toLowerCase(),
          name: (u.full_name || u.email || "Unknown").trim(),
        },
      ]),
    );

    const counters = new Map<string, number>();
    for (const userId of userIds) {
      const user = usersById.get(userId);
      if (!user) continue;
      if (user.role !== role) continue;
      counters.set(userId, (counters.get(userId) ?? 0) + 1);
    }

    return Array.from(counters.entries())
      .map(([userId, count]) => {
        const user = usersById.get(userId);
        return {
          userId,
          name: user?.name ?? "Unknown",
          role,
          count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  },
};
