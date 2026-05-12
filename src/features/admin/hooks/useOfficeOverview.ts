import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../shared/lib/supabase";
import { useAuth } from "../../../hooks/useAuth";
import { useLocale } from "../../../i18n";

export interface OfficeStats {
  revenueTotal: number;
  feesTotal: number;
  activeProcesses: number;
  totalProcesses: number;
  finishedProcesses: number;
  availableBalance: number;
  monthlyRevenue: { month: string; value: number }[];
  serviceDistribution: { label: string; percent: number; color: string }[];
}

export function useOfficeOverview() {
  const { user } = useAuth();
  const { lang } = useLocale();
  const officeId = user?.officeId;
  const localeCode = lang === 'pt' ? 'pt-BR' : 'en-US';

  return useQuery({
    queryKey: ["office-overview-stats", officeId, user?.id, lang],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return null;

      let resolvedOfficeId = officeId ?? null;
      if (!resolvedOfficeId) {
        const { data: ownedOffice } = await supabase
          .from("offices")
          .select("id")
          .eq("owner_id", user.id)
          .maybeSingle();
        resolvedOfficeId = ownedOffice?.id ?? null;
      }

      if (!resolvedOfficeId) return null;

      // 1. Process Counts & Distribution
      const { data: services } = await supabase
        .from("user_services")
        .select("id, status, service_slug")
        .eq("office_id", resolvedOfficeId);

      const totalProcesses = services?.length || 0;
      const activeProcesses = services?.filter(s => !['finished', 'cancelled'].includes(s.status)).length || 0;
      const finishedProcesses = services?.filter(s => s.status === 'finished').length || 0;

      // Distribution logic
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
      let totalValidServices = 0;

      services?.forEach(s => {
        if (s.status === "cancelled") return;
        const group = normalizeProductGroup(String(s.service_slug || ""));
        if (!group) return;
        dist[group] += 1;
        totalValidServices += 1;
      });

      const serviceDistribution = Object.entries(dist).map(([label, count], i) => ({
        label,
        percent: totalValidServices > 0 ? Math.round((count / totalValidServices) * 100) : 0,
        color: ["#1a56db", "#6366f1", "#0ea5e9", "#06b6d4"][i]
      })).filter(d => d.percent > 0);

      // 2. Revenue & Monthly Trajectory (Orders)
      const now = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 5);
      sixMonthsAgo.setDate(1);

      const { data: orders } = await supabase
        .from("orders")
        .select("total_price_usd, created_at, payment_status, office_fee_amount_usd, office_net_amount_usd, subscription_available_after_minutes")
        .eq("office_id", resolvedOfficeId);

      const paidOrders = (orders || []).filter(o =>
        ["paid", "approved", "complete", "succeeded", "completed"].includes(o.payment_status?.toLowerCase())
      );

      const totalRevenue = paidOrders.reduce((sum, o) => sum + (Number(o.total_price_usd) || 0), 0);
      
      // Monthly Revenue Map
      const monthlyMap: Record<string, number> = {};
      for (let i = 0; i < 6; i++) {
        const d = new Date();
        d.setMonth(now.getMonth() - i);
        const monthKey = d.toLocaleString(localeCode, { month: 'short' }).replace('.', '');
        monthlyMap[monthKey] = 0;
      }

      paidOrders.forEach(o => {
        const pDate = new Date(o.created_at);
        if (pDate >= sixMonthsAgo) {
          const mKey = pDate.toLocaleString(localeCode, { month: 'short' }).replace('.', '');
          if (monthlyMap[mKey] !== undefined) monthlyMap[mKey] += (Number(o.total_price_usd) || 0);
        }
      });

      const monthlyRevenue = Object.entries(monthlyMap).map(([month, value]) => ({ month, value })).reverse();

      const nowMs = Date.now();
      const availableBalance = paidOrders
        .filter((o) => {
          const createdMs = o.created_at ? new Date(o.created_at).getTime() : 0;
          const delayMin = Math.max(1, Number(o.subscription_available_after_minutes) || 20160);
          return createdMs + delayMin * 60 * 1000 <= nowMs;
        })
        .reduce((sum, o) => sum + (Number(o.office_net_amount_usd) || 0), 0);

      const totalFees = paidOrders.reduce((sum, o) => sum + (Number(o.office_fee_amount_usd) || 0), 0);

      const { data: withdrawals } = await supabase
        .from("office_withdrawals")
        .select("amount, status")
        .eq("office_id", resolvedOfficeId);

      const reservedOrPaidWithdrawals = (withdrawals || [])
        .filter((w) => ["pending", "approved", "processing", "completed", "paid"].includes(String(w.status || "").toLowerCase()))
        .reduce((sum, w) => sum + (Number(w.amount) || 0), 0);

      const availableBalanceNet = Math.max(0, availableBalance - reservedOrPaidWithdrawals);

      return {
        revenueTotal: totalRevenue,
        feesTotal: totalFees,
        activeProcesses: activeProcesses,
        totalProcesses: totalProcesses,
        finishedProcesses: finishedProcesses,
        availableBalance: availableBalanceNet,
        monthlyRevenue,
        serviceDistribution,
      } as OfficeStats;
    },
  });
}
