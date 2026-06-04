import { useQuery } from "@tanstack/react-query";
import { supabase } from "@shared/lib/supabase";
import { useLocale } from "@app/app/i18n";

export interface MasterDashboardStats {
    revenueTotal: number;
    lawyersCount: number;
    customersCount: number;
    processesCount: number;
    zellePaymentsCount: number;
    requestedPaymentsCount: number;
}

export interface MasterMonthlyRevenue {
    month: string;
    value: number;
}

export interface MasterServiceDistribution {
    label: string;
    percent: number;
    color: string;
}

export interface MasterRecentActivity {
    action: string;
    detail: string;
    time: string;
    dot: string;
}

export interface MasterTopOffice {
    officeName: string;
    revenue: number;
    processes: number;
}

const PAID_ORDER_STATUSES = ["paid", "approved", "complete", "completed", "succeeded"];

export function useMasterOverview() {
    const { lang } = useLocale();
    const localeCode = lang === "pt" ? "pt-BR" : "en-US";

    const statsQuery = useQuery({
        queryKey: ["master-overview-stats-v1"],
        queryFn: async () => {
            const [
                { count: lawyersCount },
                { count: customersCount },
                { count: processesCount },
                { count: zellePaymentsCount },
                { count: requestedPaymentsCount },
            ] = await Promise.all([
                supabase.from("user_accounts").select("id", { count: "exact", head: true }).eq("role", "admin_lawyer"),
                supabase.from("user_accounts").select("id", { count: "exact", head: true }).eq("role", "customer"),
                supabase.from("user_services").select("id", { count: "exact", head: true }),
                supabase.from("zelle_payments").select("id", { count: "exact", head: true }),
                supabase.from("office_withdrawals").select("id", { count: "exact", head: true }).eq("status", "pending"),
            ]);

            const { data: orders } = await supabase
                .from("orders")
                .select("total_price_usd, payment_status");

            const paidOrdersTotal = (orders || [])
                .filter((o) => PAID_ORDER_STATUSES.includes(String(o.payment_status || "").toLowerCase()))
                .reduce((sum, o) => sum + (Number(o.total_price_usd) || 0), 0);

            return {
                revenueTotal: paidOrdersTotal,
                lawyersCount: lawyersCount || 0,
                customersCount: customersCount || 0,
                processesCount: processesCount || 0,
                zellePaymentsCount: zellePaymentsCount || 0,
                requestedPaymentsCount: requestedPaymentsCount || 0,
            } as MasterDashboardStats;
        },
    });

    const monthlyRevenueQuery = useQuery({
        queryKey: ["master-overview-monthly-revenue-v1", lang],
        queryFn: async () => {
            const now = new Date();
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(now.getMonth() - 5);
            sixMonthsAgo.setDate(1);

            const { data: orders } = await supabase
                .from("orders")
                .select("total_price_usd, created_at, payment_status")
                .gte("created_at", sixMonthsAgo.toISOString());

            const monthlyMap: Record<string, number> = {};
            for (let i = 0; i < 6; i += 1) {
                const d = new Date();
                d.setMonth(now.getMonth() - i);
                const monthKey = d.toLocaleString(localeCode, { month: "short" }).replace(".", "");
                monthlyMap[monthKey] = 0;
            }

            (orders || [])
                .filter((o) => PAID_ORDER_STATUSES.includes(String(o.payment_status || "").toLowerCase()))
                .forEach((o) => {
                    const mKey = new Date(o.created_at).toLocaleString(localeCode, { month: "short" }).replace(".", "");
                    if (monthlyMap[mKey] !== undefined) monthlyMap[mKey] += Number(o.total_price_usd) || 0;
                });

            return Object.entries(monthlyMap).map(([month, value]) => ({ month, value })).reverse() as MasterMonthlyRevenue[];
        },
    });

    const distributionQuery = useQuery({
        queryKey: ["master-overview-service-distribution-v1"],
        queryFn: async () => {
            const { data: orders } = await supabase
                .from("orders")
                .select("product_slug, payment_status, office_id");

            const dist: Record<string, number> = {
                "B1/B2": 0,
                "F-1": 0,
                COS: 0,
                EOS: 0,
                Others: 0,
            };

            const normalizeProductGroup = (slugRaw: string): keyof typeof dist => {
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
                if (slug.includes("troca-status") || slug.includes("cos")) return "COS";
                if (slug.includes("extensao-status") || slug.includes("eos")) return "EOS";
                return "Others";
            };

            (orders || [])
                .filter((order) => PAID_ORDER_STATUSES.includes(String(order.payment_status || "").trim().toLowerCase()))
                .forEach((order) => {
                    const slug = String(order.product_slug || "").trim();
                    if (!slug) {
                        dist.Others += 1;
                        return;
                    }
                    dist[normalizeProductGroup(slug)] += 1;
                });

            const totalSalesCount = Object.values(dist).reduce((sum, value) => sum + value, 0);

            return Object.entries(dist)
                .map(([label, count], i) => ({
                    label,
                    percent: totalSalesCount > 0 ? Math.round((count / totalSalesCount) * 100) : 0,
                    color: ["#1a56db", "#6366f1", "#0ea5e9", "#06b6d4", "#64748b"][i],
                }))
                .filter((item) => item.percent > 0) as MasterServiceDistribution[];
        },
    });

    const recentActivityQuery = useQuery({
        queryKey: ["master-overview-recent-activity-v1", lang],
        queryFn: async () => {
            const { data: msgs } = await supabase
                .from("notifications_messages")
                .select("action, metadata, category, created_at")
                .order("created_at", { ascending: false })
                .limit(6);

            return (msgs || []).map((n) => {
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
                    dot:
                        n.category === "payment"
                            ? "bg-green-500"
                            : n.category === "admin"
                                ? "bg-blue-500"
                                : "bg-amber-500",
                };
            }) as MasterRecentActivity[];
        },
    });

    const topOfficesQuery = useQuery({
        queryKey: ["master-overview-top-offices-v1"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("v_master_office_stats")
                .select("office_name, total_revenue, process_count")
                .order("total_revenue", { ascending: false })
                .limit(5);

            if (error) throw error;

            return (data || []).map((item) => ({
                officeName: String(item.office_name || "Office"),
                revenue: Number(item.total_revenue) || 0,
                processes: Number(item.process_count) || 0,
            })) as MasterTopOffice[];
        },
    });

    return {
        stats: statsQuery.data,
        monthlyRevenue: monthlyRevenueQuery.data ?? [],
        serviceDistribution: distributionQuery.data ?? [],
        topOffices: topOfficesQuery.data ?? [],
        recentActivity: recentActivityQuery.data ?? [],
        isLoading:
            statsQuery.isLoading ||
            monthlyRevenueQuery.isLoading ||
            distributionQuery.isLoading ||
            topOfficesQuery.isLoading ||
            recentActivityQuery.isLoading,
        isError:
            statsQuery.isError ||
            monthlyRevenueQuery.isError ||
            distributionQuery.isError ||
            topOfficesQuery.isError ||
            recentActivityQuery.isError,
        refetchAll: async () => {
            await Promise.all([
                statsQuery.refetch(),
                monthlyRevenueQuery.refetch(),
                distributionQuery.refetch(),
                topOfficesQuery.refetch(),
                recentActivityQuery.refetch(),
            ]);
        },
    };
}
