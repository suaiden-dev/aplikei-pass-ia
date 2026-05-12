import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  index: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
  index,
  action,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="bg-card rounded-2xl border border-border shadow-sm p-5 flex flex-col gap-3 group hover:border-primary/50 transition-colors"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
          {label}
        </span>
        <span className={cn("p-2 rounded-xl transition-transform group-hover:scale-110", iconBg)}>
          <Icon className={cn("text-lg", iconColor)} />
        </span>
      </div>
      <div className="flex items-end justify-between gap-4">
        <div className="text-left">
          <p className="text-2xl font-bold font-display text-text leading-none">
            {value}
          </p>
          {subtitle && (
            <p className="text-[10px] text-text-muted mt-1 leading-tight font-medium uppercase tracking-tighter opacity-60">
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
            }}
            className="px-3 py-1.5 rounded-lg bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20 shrink-0"
          >
            {action.label}
          </button>
        )}
      </div>
    </motion.div>
  );
}
