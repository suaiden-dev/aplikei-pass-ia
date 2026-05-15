import { motion } from "framer-motion";
import { useT } from "../../i18n";
import type { MonthlyRevenue } from "../../features/admin/hooks/useAdminOverview";

interface RevenueTrajectoryProps {
  data: MonthlyRevenue[];
}

export function RevenueTrajectory({ data }: RevenueTrajectoryProps) {
  const t = useT("admin");
  const fallbackMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const chartData = data.length > 0 ? data : fallbackMonths.map((month) => ({ month, value: 0 }));
  const computedMaxRevenue = chartData.length > 0 ? Math.max(...chartData.map((m) => m.value)) : 0;
  const maxRevenue = Math.max(computedMaxRevenue, 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.3 }}
      className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm p-6"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="text-left">
          <h2 className="font-display font-semibold text-text text-base">
            {t.overview.sections.revenueTrajectory}
          </h2>
          <p className="text-xs text-text-muted mt-0.5">{t.overview.charts.last6Months}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success bg-success/10 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
          {t.overview.charts.growth.replace('{{percent}}', '14')}
        </span>
      </div>

      <div className="flex items-end gap-3 h-48 mt-6">
        {chartData.map((item, i) => {
          const heightPct = (item.value / maxRevenue) * 100;
          return (
            <div key={item.month} className="flex flex-col items-center justify-end gap-2 flex-1 h-full">
              <div className="relative w-full h-40 flex items-end justify-center group">
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.07, ease: "easeOut" }}
                  style={{ height: `${Math.max(heightPct, 5)}%`, minHeight: 10, transformOrigin: "bottom" }}
                  className="w-full max-w-[40px] rounded-t-lg bg-primary group-hover:bg-primary group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all cursor-default relative"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                    ${(item.value / 1000).toFixed(1)}k
                  </div>
                </motion.div>
              </div>
              <span className="text-[11px] text-text-muted font-medium">{item.month}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
