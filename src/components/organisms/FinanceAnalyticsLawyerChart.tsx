import { motion } from "framer-motion";
import { RiBarChartGroupedLine } from "react-icons/ri";
import type { FinanceTransaction } from "../../services/finance-analytics.service";

interface FinanceAnalyticsLawyerChartProps {
  transactions: FinanceTransaction[];
  title?: string;
}

export function FinanceAnalyticsLawyerChart({
  transactions,
  title = "Produtos Mais Vendidos",
}: FinanceAnalyticsLawyerChartProps) {
  const rows = transactions.reduce<Record<string, { count: number; amount: number }>>((acc, tx) => {
    const key = tx.productName || "GENERAL";
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
