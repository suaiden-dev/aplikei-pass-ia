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

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatCard {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const defaultStats: StatCard[] = [
  {
    label: "Clientes",
    value: 0,
    icon: RiTeamLine,
    iconBg: "bg-blue-50",
    iconColor: "text-primary",
  },
  {
    label: "Receita Total",
    value: "$0.00",
    subtitle: "Pedidos com status paid",
    icon: RiMoneyDollarCircleLine,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    label: "Pagamentos Pendentes",
    value: 0,
    subtitle: "Aguardando verificação",
    icon: RiBankCardLine,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    label: "Sellers Ativos",
    value: 0,
    icon: RiLineChartLine,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    label: "Parceiros Pendentes",
    value: 0,
    subtitle: "Aguardando aprovação",
    icon: RiTimeLine,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
  },
];

const monthlyRevenue = [
  { month: "Jan", value: 1200 },
  { month: "Fev", value: 2100 },
  { month: "Mar", value: 1800 },
  { month: "Abr", value: 3400 },
  { month: "Mai", value: 2900 },
  { month: "Jun", value: 4328 },
];

const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.value));

const serviceDistribution = [
  { label: "B1/B2", percent: 45, color: "#1a56db" },
  { label: "F-1", percent: 30, color: "#6366f1" },
  { label: "EOS", percent: 15, color: "#0ea5e9" },
  { label: "COS", percent: 10, color: "#06b6d4" },
];

// ─── Donut chart (SVG) ────────────────────────────────────────────────────────

function DonutChart() {
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

// ─── Bar Chart (CSS) ──────────────────────────────────────────────────────────

function BarChart() {
  return (
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
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OverviewPage() {
  const [clientesCount, setClientesCount] = useState<number>(0);
  const [receitaTotal, setReceitaTotal] = useState<number>(0);
  const [pagamentosPendentes, setPagamentosPendentes] = useState<number>(0);

  useEffect(() => {
    async function fetchData() {
      // Clientes
      const { count: customersCount } = await supabase
        .from("user_accounts")
        .select("*", { count: "exact", head: true });
      setClientesCount(customersCount || 0);

      // Pagamentos Pendentes
      const { count: pendingZelle } = await supabase
        .from("zelle_payments")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending_verification");
      
      const { count: pendingStripe } = await supabase
         .from("visa_orders")
         .select("*", { count: "exact", head: true })
         .eq("payment_status", "pending")
         .in("product_slug", ["visto-b1-b2", "visto-f1", "extensao-status", "troca-status", "analise-especialista-cos"]);

      setPagamentosPendentes((pendingZelle || 0) + (pendingStripe || 0));

      // Receita Total
      const { data: zelleData } = await supabase
        .from("zelle_payments")
        .select("amount")
        .eq("status", "approved");
      
      const { data: stripeData } = await supabase
        .from("visa_orders")
        .select("total_price_usd")
        .in("payment_status", ["paid", "complete", "succeeded", "completed"])
        .in("product_slug", ["visto-b1-b2", "visto-f1", "extensao-status", "troca-status", "analise-especialista-cos"]);

      let total = 0;
      zelleData?.forEach(row => {
         total += Number(row.amount) || 0;
      });
      stripeData?.forEach(row => {
         let val = row.total_price_usd;
         if (typeof val === "string") val = parseFloat(val);
         total += Number(val) || 0;
      });

      setReceitaTotal(total);
    }
    fetchData();
  }, []);

  const stats: StatCard[] = defaultStats.map(stat => {
    if (stat.label === "Clientes") return { ...stat, value: clientesCount };
    if (stat.label === "Receita Total") return { ...stat, value: `$${receitaTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` };
    if (stat.label === "Pagamentos Pendentes") return { ...stat, value: pagamentosPendentes };
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
              key={card.label}
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
              <div>
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
            <div>
              <h2 className="font-display font-semibold text-slate-800 text-base">
                Receita Mensal
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Jan – Jun 2026</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              +14% vs último mês
            </span>
          </div>
          <BarChart />
        </motion.div>

        {/* Donut chart — Distribuição de Serviços */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.4 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col"
        >
          <h2 className="font-display font-semibold text-slate-800 text-base mb-1">
            Distribuição de Serviços
          </h2>
          <p className="text-xs text-slate-400 mb-4">Por tipo de visto</p>

          <div className="flex flex-col items-center gap-4 flex-1 justify-center">
            <div className="relative">
              <DonutChart />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xl font-bold font-display text-slate-800 leading-none">
                    100%
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Total</p>
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
        <h2 className="font-display font-semibold text-slate-800 text-base mb-4">
          Atividade Recente
        </h2>
        <div className="flex flex-col gap-3">
          {[
            { action: "Pagamento recebido", detail: "Zelle – John D. — $1,200.00", time: "há 2 horas", dot: "bg-green-500" },
            { action: "Novo cliente cadastrado", detail: "Maria Silva — maria@email.com", time: "há 5 horas", dot: "bg-blue-500" },
            { action: "Processo atualizado", detail: "B1/B2 Visa — #PROC-0041", time: "ontem", dot: "bg-amber-500" },
            { action: "Pagamento pendente", detail: "Zelle – Carlos R. — $850.00", time: "ontem", dot: "bg-red-400" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 py-2.5 border-b border-slate-50 last:border-0">
              <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${item.dot}`} />
              <div className="flex-1 min-w-0">
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
