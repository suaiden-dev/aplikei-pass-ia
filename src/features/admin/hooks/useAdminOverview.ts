import { useQuery } from "@tanstack/react-query";
import { supabase } from "@shared/lib/supabase";
import { useLocale } from "@app/app/i18n";
import { adminQueryKeys } from "@features/admin/lib/queryKeys";

export interface DashboardStats {
  revenueTotal: number;
  lawyersCount: number;
  customersCount: number;
  processesCount: number;
  zellePaymentsCount: number;
  requestedPaymentsCount: number;
}

export interface MonthlyRevenue {
  month: string;
  value: number;
}

export interface ServiceDistribution {
  label: string;
  percent: number;
  color: string;
}

export interface RecentActivity {
  action: string;
  detail: string;
  time: string;
  dot: string;
}

export function useAdminOverview() {
  const { lang } = useLocale();
  const localeCode = lang === 'pt' ? 'pt-BR' : 'en-US';

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: adminQueryKeys.adminDashboardStats(),
    queryFn: async () => {
      const [
        { count: lawyersCount },
        { count: customersCount },
        { count: processesCount },
        { count: zellePaymentsCount },
        { count: requestedPaymentsCount },
      ] = await Promise.all([
        supabase.from("user_accounts").select("id", { count: "exact" }).or("role.eq.admin_lawyer,role.eq.manager"),
        supabase.from("user_accounts").select("id", { count: "exact" }).eq("role", "customer"),
        supabase.from("user_services").select("id", { count: "exact" }),
        supabase.from("zelle_payments").select("id", { count: "exact" }),
        supabase.from("zelle_payments").select("id", { count: "exact" }).eq("status", "pending_verification"),
      ]);

      // Revenue calculation (orders only to avoid duplication with approved Zelle mirrored into orders)
      const { data: paidOrders } = await supabase
        .from("orders")
        .select("total_price_usd, payment_status");

      const totalRevenue = (paidOrders || [])
        .filter(o => ["paid", "complete", "succeeded", "completed"].includes(String(o.payment_status || "").toLowerCase()))
        .reduce((sum, o) => sum + (Number(o.total_price_usd) || 0), 0);

      return {
        revenueTotal: totalRevenue,
        lawyersCount: lawyersCount || 0,
        customersCount: customersCount || 0,
        processesCount: processesCount || 0,
        zellePaymentsCount: zellePaymentsCount || 0,
        requestedPaymentsCount: requestedPaymentsCount || 0,
      };
    },
  });

  const { data: monthlyRevenue = [], isLoading: isLoadingRevenue } = useQuery({
    queryKey: adminQueryKeys.adminMonthlyRevenue(lang),
    queryFn: async () => {
      const now = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 5);
      sixMonthsAgo.setDate(1);

      const { data: paidOrders } = await supabase
        .from("orders")
        .select("total_price_usd, created_at, payment_status")
        .gte("created_at", sixMonthsAgo.toISOString());

      const monthlyMap: Record<string, number> = {};
      for (let i = 0; i < 6; i++) {
        const d = new Date();
        d.setMonth(now.getMonth() - i);
        const monthKey = d.toLocaleString(localeCode, { month: 'short' }).replace('.', '');
        monthlyMap[monthKey] = 0;
      }

      (paidOrders || [])
        .filter((o) => ["paid", "complete", "succeeded", "completed"].includes(String(o.payment_status || "").toLowerCase()))
        .forEach((p) => {
        const val = Number(p.total_price_usd) || 0;
        const pDate = new Date(p.created_at);
        const mKey = pDate.toLocaleString(localeCode, { month: 'short' }).replace('.', '');
        if (monthlyMap[mKey] !== undefined) monthlyMap[mKey] += val;
      });

      return Object.entries(monthlyMap).map(([month, value]) => ({ month, value })).reverse();
    },
  });

  const { data: serviceDistribution = [], isLoading: isLoadingDistribution } = useQuery({
    queryKey: adminQueryKeys.adminServiceDistribution(),
    queryFn: async () => {
      const { data: services } = await supabase.from("user_services").select("service_slug, status");
      const normalizeProductGroup = (slugRaw: string): "B1/B2" | "F-1" | "COS" | "EOS" | null => {
        const slug = slugRaw.toLowerCase();
        if (
          slug.includes("b1-b2") ||
          slug.includes("b1b2") ||
          slug.includes("visa-b1b2") ||
          slug.includes("visto-b1-b2")
        ) return "B1/B2";
        if (
          slug.includes("f1") ||
          slug.includes("f-1") ||
          slug.includes("visa-f1") ||
          slug.includes("visto-f1")
        ) return "F-1";
        if (slug.includes("troca-status") || slug.includes("cos") || slug.includes("visa-cos")) return "COS";
        if (slug.includes("extensao-status") || slug.includes("eos") || slug.includes("visa-eos")) return "EOS";
        return null;
      };
      
      const dist: Record<string, number> = { "B1/B2": 0, "F-1": 0, "COS": 0, "EOS": 0 };
      let totalServicesCount = 0;

      services?.forEach(s => {
        if (s.status === "cancelled") return;
        const group = normalizeProductGroup(String(s.service_slug || ""));
        if (!group) return;
        dist[group] += 1;
        totalServicesCount += 1;
      });

      return Object.entries(dist).map(([label, count], i) => ({
        label,
        percent: totalServicesCount > 0 ? Math.round((count / totalServicesCount) * 100) : 0,
        color: ["#1a56db", "#6366f1", "#0ea5e9", "#06b6d4"][i]
      })).filter(d => d.percent > 0);
    },
  });

  const { data: recentActivity = [], isLoading: isLoadingActivity } = useQuery({
    queryKey: adminQueryKeys.adminRecentActivity(),
    queryFn: async () => {
      const { data: msgs } = await supabase
        .from("notifications_messages")
        .select("action, metadata, category, created_at")
        .order("created_at", { ascending: false })
        .limit(6);

      return (msgs || []).map(n => {
        const meta = (n.metadata || {}) as Record<string, any>;
        let detail = meta.message || meta.description || meta.reason || "";
        if (!detail) {
          if (n.action === "payment_approved") {
            detail = `Payment approved for ${meta.service_name || "service"}${meta.amount ? ` (${meta.amount})` : ""}`;
          } else if (n.action === "payment_rejected") {
            detail = `Payment rejected: ${meta.reason || "No reason provided"}`;
          } else if (n.action === "step_approved") {
            detail = `Step "${meta.step_name || ""}" approved`;
          } else if (n.action === "step_rejected") {
            detail = `Step "${meta.step_name || ""}" rejected: ${meta.feedback || ""}`;
          } else {
            detail = n.action ?? "";
          }
        }

        const actionLabel = (n.action ?? "")
          .split("_")
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        return {
          action: actionLabel,
          detail: String(detail),
          time: new Date(n.created_at).toLocaleDateString(localeCode),
          dot: n.category === "payment" ? "bg-green-500" : n.category === "admin" ? "bg-blue-500" : "bg-amber-500",
        };
      });
    },
  });

  return {
    stats,
    monthlyRevenue,
    serviceDistribution,
    recentActivity,
    isLoading: isLoadingStats || isLoadingRevenue || isLoadingDistribution || isLoadingActivity
  };
}
