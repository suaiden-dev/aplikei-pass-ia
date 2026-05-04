import { motion } from "framer-motion";
import { useT } from "../../i18n";
import type { ServiceDistribution } from "../../features/admin/hooks/useAdminOverview";

interface ProductDistributionSectionProps {
  data: ServiceDistribution[];
}

export function ProductDistributionSection({ data }: ProductDistributionSectionProps) {
  const t = useT("admin");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.6 }}
      className="bg-card rounded-2xl border border-border shadow-sm p-6"
    >
      <h2 className="font-display font-semibold text-text text-base mb-6 text-left">
        {t.overview.sections.productDistribution}
      </h2>

      <div className="space-y-6">
        {data.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-text">{item.label}</span>
              <span className="text-text-muted">{item.percent}%</span>
            </div>
            <div className="h-2 w-full bg-bg-subtle rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.percent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
