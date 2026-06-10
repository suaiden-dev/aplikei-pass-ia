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
  officeNetAmount: number;
  platformFeeAmount: number;
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

export interface OfficeSalesMetric {
  officeId: string;
  officeName: string;
  grossRevenue: number;
  officeNetRevenue: number;
  platformFeeRevenue: number;
  salesCount: number;
}

function normalizeProductName(slug?: string | null) {
  if (!slug) return "General";
  return slug.replace(/-/g, " ").toUpperCase();
}

function normalizeOfficeName(name?: string | null) {
  if (!name) return "UNASSIGNED OFFICE";
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

    const rows = (data ?? []) as FinanceTransactionViewRow[];
    const ids = rows.map((row) => row.id).filter(Boolean);
    const orderNetById = new Map<string, { gross: number; net: number }>();
    const orderOfficeIdById = new Map<string, string>();
    const officeNameById = new Map<string, string>();

    if (ids.length > 0) {
      const { data: ordersData } = await supabase
        .from("orders")
        .select("id, total_price_usd, office_net_amount_usd, office_id, seller_id, user_id")
        .in("id", ids);

      const orders = (ordersData ?? []) as Array<{
        id: string;
        total_price_usd?: number | string | null;
        office_net_amount_usd?: number | string | null;
        office_id?: string | null;
        seller_id?: string | null;
        user_id?: string | null;
      }>;

      const missingOfficeOrders = orders.filter((order) => !order.office_id);
      const ownerIds = Array.from(new Set(
        missingOfficeOrders
          .flatMap((order) => [order.seller_id, order.user_id])
          .filter((ownerId): ownerId is string => Boolean(ownerId)),
      ));

      const inferredOfficeByOwnerId = new Map<string, string>();
      if (ownerIds.length > 0) {
        const { data: ownersData } = await supabase
          .from("user_accounts")
          .select("id, office_id")
          .in("id", ownerIds);

        ((ownersData ?? []) as Array<{ id: string; office_id?: string | null }>)
          .forEach((owner) => {
            if (owner?.id && owner?.office_id) inferredOfficeByOwnerId.set(owner.id, owner.office_id);
          });
      }

      const inferredUpdates: Array<{ id: string; office_id: string }> = [];
      orders.forEach((order) => {
        if (order.office_id) return;
        const inferredOfficeId =
          (order.seller_id && inferredOfficeByOwnerId.get(order.seller_id)) ||
          (order.user_id && inferredOfficeByOwnerId.get(order.user_id));
        if (inferredOfficeId) {
          order.office_id = inferredOfficeId;
          inferredUpdates.push({ id: order.id, office_id: inferredOfficeId });
        }
      });

      if (inferredUpdates.length > 0) {
        await Promise.all(
          inferredUpdates.map((item) =>
            supabase.from("orders").update({ office_id: item.office_id }).eq("id", item.id),
          ),
        );
      }

      const officeIds = Array.from(new Set(
        orders.map((order) => order.office_id).filter((office): office is string => Boolean(office)),
      ));
      if (officeIds.length > 0) {
        const { data: officesData } = await supabase
          .from("offices")
          .select("id, name")
          .in("id", officeIds);
        ((officesData ?? []) as Array<{ id: string; name?: string | null }>)
          .forEach((office) => {
            if (office?.id) officeNameById.set(office.id, office.name ?? "UNASSIGNED OFFICE");
          });
      }

      orders
        .forEach((order) => {
          const gross = Number(order.total_price_usd ?? 0);
          const net = Number(order.office_net_amount_usd ?? gross);
          orderNetById.set(order.id, { gross, net });
          if (order.office_id) orderOfficeIdById.set(order.id, order.office_id);
        });
    }

    return rows.map((row) => {
      const fallbackGross = Number(row.total_price_usd ?? 0);
      const orderAmounts = orderNetById.get(row.id);
      const gross = orderAmounts?.gross ?? fallbackGross;
      const net = orderAmounts?.net ?? fallbackGross;
      const inferredOfficeId = orderOfficeIdById.get(row.id);
      const normalizedOfficeName =
        inferredOfficeId
          ? (officeNameById.get(inferredOfficeId) ?? "UNASSIGNED OFFICE")
          : normalizeOfficeName(row.office_name);
      return {
      id: row.id,
      clientName: row.client_name || "Guest",
      clientEmail: row.client_email || "",
      officeName: normalizedOfficeName,
      productName: normalizeProductName(row.product_slug),
      amount: gross,
      officeNetAmount: net,
      platformFeeAmount: Math.max(0, gross - net),
      method: normalizeMethod(row.payment_method),
      createdAt: row.created_at || new Date(0).toISOString(),
      status: row.payment_status || "unknown",
    };
    });
  },

  async getOfficeSalesMetricsByDateRange(
    startDate?: string,
    endDate?: string,
  ): Promise<OfficeSalesMetric[]> {
    let query = supabase
      .from("orders")
      .select("office_id, total_price_usd, office_net_amount_usd, payment_status, created_at")
      .in("payment_status", ["paid", "approved", "complete", "completed", "succeeded"]);

    if (startDate) {
      query = query.gte("created_at", `${startDate}T00:00:00.000Z`);
    }
    if (endDate) {
      query = query.lte("created_at", `${endDate}T23:59:59.999Z`);
    }

    const { data: orders, error } = await query;
    if (error) {
      throw new Error(`Erro ao carregar vendas por office: ${error.message}`);
    }

    const officeIds = Array.from(
      new Set(
        ((orders ?? []) as Array<{ office_id?: string | null }>)
          .map((row) => row.office_id)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    const officeNameById = new Map<string, string>();
    if (officeIds.length > 0) {
      const { data: offices } = await supabase
        .from("offices")
        .select("id, name")
        .in("id", officeIds);
      (offices ?? []).forEach((office) => {
        if (office?.id) officeNameById.set(office.id, (office as { id: string; name?: string | null }).name ?? "Office");
      });
    }

    const grouped = new Map<string, OfficeSalesMetric>();
    ((orders ?? []) as Array<{ office_id?: string | null; total_price_usd?: number | string | null; office_net_amount_usd?: number | string | null }>).forEach((row) => {
      const officeId = String(row.office_id || "");
      if (!officeId) return;
      const gross = Number(row.total_price_usd ?? 0);
      const net = Number(row.office_net_amount_usd ?? row.total_price_usd ?? 0);
      const fee = Math.max(0, gross - net);
      const current = grouped.get(officeId) ?? {
        officeId,
        officeName: officeNameById.get(officeId) ?? "Office",
        grossRevenue: 0,
        officeNetRevenue: 0,
        platformFeeRevenue: 0,
        salesCount: 0,
      };
      current.grossRevenue += gross;
      current.officeNetRevenue += net;
      current.platformFeeRevenue += fee;
      current.salesCount += 1;
      grouped.set(officeId, current);
    });

    return Array.from(grouped.values()).sort((a, b) => b.grossRevenue - a.grossRevenue);
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
