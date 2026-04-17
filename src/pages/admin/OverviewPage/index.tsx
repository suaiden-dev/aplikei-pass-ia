import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../../lib/supabase";
import {
  RiTeamLine,
  RiMoneyDollarCircleLine,
  RiBankCardLine,
  RiLineChartLine,
  RiTimeLine,
} from "react-icons/ri";
import { useT } from "../../../i18n";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatCard {
  id: string;
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OverviewPage() {
  const t = useT("admin");
  const [clientesCount, setClientesCount] = useState<number>(0);
  const [receitaTotal, setReceitaTotal] = useState<number>(0);
  const [pagamentosPendentes, setPagamentosPendentes] = useState<number>(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<{ month: string, value: number }[]>([]);
  const [serviceDistribution, setServiceDistribution] = useState<{ label: string, percent: number, color: string }[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const defaultStats: StatCard[] = [
    {
      id: "customers",
      label: t.overview.stats.customers,
      value: 0,
      icon: RiTeamLine,
      iconBg: "bg-blue-50",
      iconColor: "text-primary",
    },
    {
      id: "revenue",
      label: t.overview.stats.totalRevenue,
      value: "$0.00",
      subtitle: t.overview.stats.revenueSubtitle,
      icon: RiMoneyDollarCircleLine,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      id: "pending_payments",
      label: t.overview.stats.pendingPayments,
      value: 0,
      subtitle: t.overview.stats.pendingSubtitle,
      icon: RiBankCardLine,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      id: "sellers",
      label: t.overview.stats.activeSellers,
      value: 0,
      icon: RiLineChartLine,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      id: "partners",
      label: t.overview.stats.pendingPartners,
      value: 0,
      subtitle: t.overview.stats.partnersSubtitle,
      icon: RiTimeLine,
      iconBg: "bg-rose-50",
      iconColor: "text-rose-500",
    },
  ];

  // ... (Data fetching logic in useEffect)

  useEffect(() => {
    async function fetchData() {
      const now = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 5);
      sixMonthsAgo.setDate(1);

      const [
        { count: customersCount },
        { count: pendingZelle },
        { data: zellePayments },
        { data: stripeOrders },
        { data: services }
      ] = await Promise.all([
        supabase.from("user_accounts").select("*", { count: "exact", head: true }),
        supabase.from("zelle_payments").select("*", { count: "exact", head: true }).eq("status", "pending_verification"),
        supabase.from("zelle_payments").select("amount, created_at, status"),
        supabase.from("visa_orders").select("total_price_usd, created_at, payment_status"),
        supabase.from("user_services").select("service_slug, status")
      ]);

      setClientesCount(customersCount || 0);
      setPagamentosPendentes(pendingZelle || 0);

      // --- REVENUE CALCULATION ---
      const approvedZelle = (zellePayments || []).filter(p => p.status === "approved");
      const paidStripe = (stripeOrders || []).filter(o => ["paid", "complete", "succeeded", "completed"].includes(o.payment_status));

      let totalAllTime = 0;
      const monthlyMap: Record<string, number> = {};

      for (let i = 0; i < 6; i++) {
        const d = new Date();
        d.setMonth(now.getMonth() - i);
        const monthKey = d.toLocaleString('en-US', { month: 'short' });
        monthlyMap[monthKey] = 0;
      }

      [...approvedZelle, ...paidStripe].forEach(p => {
        const val = Number(p.amount || p.total_price_usd) || 0;
        totalAllTime += val;
        const pDate = new Date(p.created_at);
        if (pDate >= sixMonthsAgo) {
          const mKey = pDate.toLocaleString('en-US', { month: 'short' });
          if (monthlyMap[mKey] !== undefined) monthlyMap[mKey] += val;
        }
      });

      setReceitaTotal(totalAllTime);
      setMonthlyRevenue(Object.entries(monthlyMap).map(([month, value]) => ({ month, value })).reverse());

      // --- SERVICE DISTRIBUTION ---
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

      const distArray = Object.entries(dist).map(([label, count], i) => ({
        label,
        percent: totalServicesCount > 0 ? Math.round((count / totalServicesCount) * 100) : 0,
        color: ["#1a56db", "#6366f1", "#0ea5e9", "#06b6d4"][i]
      })).filter(d => d.percent > 0);
      
      setServiceDistribution(distArray);

      // --- RECENT ACTIVITY ---
      const { data: notifs, error: notifError } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);

      if (notifs && !notifError) {
        setRecentActivity(notifs.map(n => ({
          action: n.title,
          detail: n.message,
          time: new Date(n.created_at).toLocaleDateString(),
          dot: n.type === "payment" ? "bg-green-500" : n.type === "new_user" ? "bg-blue-500" : "bg-amber-500"
        })));
      }
    }
    fetchData();
  }, []);

  const maxRevenue = monthlyRevenue.length > 0 ? Math.max(...monthlyRevenue.map((m) => m.value)) : 1000;

  const stats: StatCard[] = defaultStats.map(stat => {
    if (stat.id === "customers") return { ...stat, value: clientesCount };
    if (stat.id === "revenue") return { ...stat, value: `$${receitaTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` };
    if (stat.id === "pending_payments") return { ...stat, value: pagamentosPendentes };
    return stat;
  });

  return (
    <div className="p-8 space-y-8">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {card.label}
                </span>
                <span className={`p-2 rounded-xl ${card.iconBg}`}>
                  <Icon className={`text-lg ${card.iconColor}`} />
                </span>
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold font-display text-slate-800 leading-none">
                  {card.value}
                </p>
                {card.subtitle && (
                  <p className="text-xs text-slate-400 mt-1 leading-snug">{card.subtitle}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart — Receita Mensal */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="text-left">
              <h2 className="font-display font-semibold text-slate-800 text-base">
                {t.overview.charts.monthlyRevenue}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Jan – Jun 2026</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              {t.overview.charts.growth.replace('{{percent}}', '14')}
            </span>
          </div>
          
          <div className="flex items-end gap-3 h-40 mt-4">
            {monthlyRevenue.map((item, i) => {
              const heightPct = (item.value / maxRevenue) * 100;
              return (
                <div key={item.month} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-[10px] text-slate-400 font-medium">
                    ${(item.value / 1000).toFixed(1)}k
                  </span>
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.5, delay: i * 0.07, ease: "easeOut" }}
                    style={{ height: `${heightPct}%`, originY: 1 }}
                    className="w-full rounded-t-md bg-primary opacity-80 hover:opacity-100 transition-opacity cursor-default"
                  />
                  <span className="text-[11px] text-slate-500">{item.month}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Donut chart — Distribuição de Serviços */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.4 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col"
        >
          <h2 className="font-display font-semibold text-slate-800 text-base mb-1 text-left">
            {t.overview.charts.serviceDistribution}
          </h2>
          <p className="text-xs text-slate-400 mb-4 text-left">{t.overview.charts.byVisaType}</p>

          <div className="flex flex-col items-center gap-4 flex-1 justify-center">
            <div className="relative">
              <DonutChart serviceDistribution={serviceDistribution} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xl font-bold font-display text-slate-800 leading-none">
                    100%
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{t.overview.charts.total}</p>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full">
              {serviceDistribution.map((seg) => (
                <div key={seg.label} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="text-xs text-slate-600 font-medium">{seg.label}</span>
                  <span className="text-xs text-slate-400 ml-auto">{seg.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent activity placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.5 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
      >
        <h2 className="font-display font-semibold text-slate-800 text-base mb-4 text-left">
          {t.overview.recentActivity.title}
        </h2>
        <div className="flex flex-col gap-3">
          {recentActivity.map((item, i) => (
            <div key={i} className="flex items-start gap-4 py-2.5 border-b border-slate-50 last:border-0">
              <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${item.dot}`} />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-slate-700">{item.action}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.detail}</p>
              </div>
              <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">{item.time}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function DonutChart({ serviceDistribution }: { serviceDistribution: any[] }) {
  const size = 160;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const segments = serviceDistribution.map((seg, i) => {
    const dash = (seg.percent / 100) * circumference;
    const gap = circumference - dash;
    const offset = serviceDistribution
      .slice(0, i)
      .reduce((sum, s) => sum + (s.percent / 100) * circumference, 0);
    return { ...seg, dash, gap, offset };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
      {/* Track */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#f1f5f9"
        strokeWidth={strokeWidth}
      />
      {/* Segments */}
      {segments.map((seg) => (
        <circle
          key={seg.label}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={seg.color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${seg.dash} ${seg.gap}`}
          strokeDashoffset={-seg.offset}
          strokeLinecap="butt"
        />
      ))}
    </svg>
  );
}
