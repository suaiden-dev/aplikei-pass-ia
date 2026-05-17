import { motion } from "framer-motion";
import { RiBarChartGroupedLine } from "react-icons/ri";
import type { FinanceTransaction } from "@features/admin/services/financeAnalyticsService";

interface FinanceAnalyticsLawyerChartProps {
  transactions: FinanceTransaction[];
  title?: string;
}

function normalizeProductName(raw: string): string {
  const value = String(raw || "").trim();
  const key = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const bySlug: Record<string, string> = {
    "visto-b1-b2": "B1/B2 Visa",
    "visa-b1b2": "B1/B2 Visa",
    "visto-b1-b2-reaplicacao": "B1/B2 Reapplication",
    "visto-f1": "F-1 Visa",
    "visto-f1-reaplicacao": "F-1 Reapplication",
    "extensao-status": "Extension of Status",
    "troca-status": "Change of Status",
    "mentoria-individual": "Bronze Mentoring",
    "mentoria-bronze": "Silver Mentoring",
    "mentoria-silver": "Silver Mentoring (F-1)",
    "mentoria-gold": "Gold Mentoring",
    "mentoria-negativa-consular": "Consular Refusal Analysis",
    "consultoria-f1-negativa": "F-1 Refusal Consulting",
    "consultoria-especialista": "Specialist Consulting",
  };

  const byName: Record<string, string> = {
    "visto b1/b2": "B1/B2 Visa",
    "reaplicacao b1/b2": "B1/B2 Reapplication",
    "visto f-1": "F-1 Visa",
    "reaplicacao f-1": "F-1 Reapplication",
    "extensao de status": "Extension of Status",
    "troca de status": "Change of Status",
    "mentoria individual": "Bronze Mentoring",
    "mentoria bronze": "Silver Mentoring",
    "mentoria silver": "Silver Mentoring (F-1)",
    "mentoria gold": "Gold Mentoring",
    "analise de recusa": "Consular Refusal Analysis",
    "consultoria f-1 negativa": "F-1 Refusal Consulting",
    "consultoria especialista": "Specialist Consulting",
  };

  if (bySlug[key]) return bySlug[key];
  if (byName[key]) return byName[key];

  // Fallback by semantic match for free-text product names from DB
  if (key.includes("b1") && key.includes("b2") && key.includes("reaplic")) return "B1/B2 Reapplication";
  if (key.includes("b1") && key.includes("b2")) return "B1/B2 Visa";
  if (key.includes("f-1") && key.includes("reaplic")) return "F-1 Reapplication";
  if (key.includes("f1") && key.includes("reaplic")) return "F-1 Reapplication";
  if (key.includes("f-1") || key.includes("f1")) return "F-1 Visa";
  if (key.includes("extensao") && key.includes("status")) return "Extension of Status";
  if (key.includes("troca") && key.includes("status")) return "Change of Status";
  if (key.includes("mentoria") && key.includes("individual")) return "Bronze Mentoring";
  if (key.includes("mentoria") && key.includes("bronze")) return "Silver Mentoring";
  if (key.includes("mentoria") && key.includes("silver")) return "Silver Mentoring (F-1)";
  if (key.includes("mentoria") && key.includes("gold")) return "Gold Mentoring";
  if (key.includes("recusa") || key.includes("negativa consular")) return "Consular Refusal Analysis";
  if (key.includes("consultoria") && key.includes("f1") && key.includes("negativa")) return "F-1 Refusal Consulting";
  if (key.includes("consultoria") && key.includes("especialista")) return "Specialist Consulting";

  return value.toUpperCase();
}

export function FinanceAnalyticsLawyerChart({
  transactions,
  title = "Top Selling Products",
}: FinanceAnalyticsLawyerChartProps) {
  const rows = transactions.reduce<Record<string, { count: number; amount: number }>>((acc, tx) => {
    const key = normalizeProductName(tx.productName || "GENERAL");
    if (!acc[key]) acc[key] = { count: 0, amount: 0 };
    acc[key].count += 1;
    acc[key].amount += Number(tx.amount || 0);
    return acc;
  }, {});

  const topProducts = Object.entries(rows)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.count - a.count || b.amount - a.amount)
    .slice(0, 6);

  const maxCount = topProducts.length > 0 ? Math.max(...topProducts.map((p) => p.count)) : 1;

  return (
    <div className="bg-card rounded-3xl border border-border p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-black uppercase tracking-widest text-text flex items-center gap-2">
          <RiBarChartGroupedLine className="text-success" />
          {title}
        </h3>
      </div>

      {topProducts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs font-bold text-text-muted uppercase tracking-widest">
          No product sales yet
        </div>
      ) : (
        <div className="space-y-3">
          {topProducts.map((product, index) => (
            <div key={product.name} className="space-y-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black text-text uppercase truncate">{product.name}</p>
                <p className="text-[10px] font-black text-text-muted uppercase">{product.count} sales</p>
              </div>
              <div className="h-2 rounded-full bg-bg-subtle overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(product.count / maxCount) * 100}%` }}
                  transition={{ delay: index * 0.06 }}
                  className="h-full bg-success rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
