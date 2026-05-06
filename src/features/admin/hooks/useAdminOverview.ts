import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../shared/lib/supabase";

export interface DashboardStats {
  customersCount: number;
  revenueTotal: number;
  pendingPayments: number;
  activeSellers: number;
  pendingPartners: number;
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
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const [
        { count: customersCount },
        { count: pendingZelle },
      ] = await Promise.all([
        supabase.from("user_accounts").select("id", { count: "exact", head: true }),
        supabase.from("zelle_payments").select("*", { count: "exact", head: true }).eq("status", "pending_verification"),
      ]);

      // Revenue calculation logic (simplified for now, following current implementation)
      const [
        { data: zellePayments },
        { data: stripeOrders },
      ] = await Promise.all([
        supabase.from("zelle_payments").select("amount, created_at, status"),
        supabase.from("orders").select("total_price_usd, created_at, payment_status"),
      ]);

      const approvedZelle = (zellePayments || []).filter(p => p.status === "approved");
      const paidStripe = (stripeOrders || []).filter(o => ["paid", "complete", "succeeded", "completed"].includes(o.payment_status));

      let totalAllTime = 0;
      [...approvedZelle, ...paidStripe].forEach((p: any) => {
        totalAllTime += Number(p.amount || p.total_price_usd) || 0;
      });

      return {
        customersCount: customersCount || 0,
        revenueTotal: totalAllTime,
        pendingPayments: pendingZelle || 0,
        activeSellers: 0, // Placeholder
        pendingPartners: 0, // Placeholder
      };
    },
  });

  const { data: monthlyRevenue = [], isLoading: isLoadingRevenue } = useQuery({
    queryKey: ["admin-monthly-revenue"],
    queryFn: async () => {
      const now = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 5);
      sixMonthsAgo.setDate(1);

      const [
        { data: zellePayments },
        { data: stripeOrders },
      ] = await Promise.all([
        supabase.from("zelle_payments").select("amount, created_at, status").gte("created_at", sixMonthsAgo.toISOString()),
        supabase.from("orders").select("total_price_usd, created_at, payment_status").gte("created_at", sixMonthsAgo.toISOString()),
      ]);

      const approvedZelle = (zellePayments || []).filter(p => p.status === "approved");
      const paidStripe = (stripeOrders || []).filter(o => ["paid", "complete", "succeeded", "completed"].includes(o.payment_status));

      const monthlyMap: Record<string, number> = {};
      for (let i = 0; i < 6; i++) {
        const d = new Date();
        d.setMonth(now.getMonth() - i);
        const monthKey = d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
        monthlyMap[monthKey] = 0;
      }

      [...approvedZelle, ...paidStripe].forEach((p: any) => {
        const val = Number(p.amount || p.total_price_usd) || 0;
        const pDate = new Date(p.created_at);
        const mKey = pDate.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
        if (monthlyMap[mKey] !== undefined) monthlyMap[mKey] += val;
      });

      return Object.entries(monthlyMap).map(([month, value]) => ({ month, value })).reverse();
    },
  });

  const { data: serviceDistribution = [], isLoading: isLoadingDistribution } = useQuery({
    queryKey: ["admin-service-distribution"],
    queryFn: async () => {
      const { data: services } = await supabase.from("user_services").select("service_slug, status");
      
      const dist: Record<string, number> = { "B1/B2": 0, "F-1": 0, "COS": 0, "EOS": 0 };
      let totalServicesCount = 0;

      services?.forEach(s => {
        if (s.status === "cancelled") return;
        const slug = s.service_slug.toLowerCase();
        
        let matched = false;
        if (slug.includes("b1-b2")) { dist["B1/B2"]++; matched = true; }
        else if (slug.includes("f1")) { dist["F-1"]++; matched = true; }
        else if (slug.includes("troca-status")) { dist["COS"]++; matched = true; }
        else if (slug.includes("extensao-status")) { dist["EOS"]++; matched = true; }
        
        if (matched) totalServicesCount++;
      });

      return Object.entries(dist).map(([label, count], i) => ({
        label,
        percent: totalServicesCount > 0 ? Math.round((count / totalServicesCount) * 100) : 0,
        color: ["#1a56db", "#6366f1", "#0ea5e9", "#06b6d4"][i]
      })).filter(d => d.percent > 0);
    },
  });

  const { data: recentActivity = [], isLoading: isLoadingActivity } = useQuery({
    queryKey: ["admin-recent-activity"],
    queryFn: async () => {
      const { data: notifs } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);

      return (notifs || []).map(n => ({
        action: n.title,
        detail: n.message,
        time: new Date(n.created_at).toLocaleDateString(),
        dot: n.type === "payment" ? "bg-green-500" : n.type === "new_user" ? "bg-blue-500" : "bg-amber-500"
      }));
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
