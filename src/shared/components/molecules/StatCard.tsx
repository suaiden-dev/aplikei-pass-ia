import { motion } from "framer-motion";
import { cn } from "@shared/utils/cn";

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
      className="bg-card rounded-2xl border border-border shadow-sm p-5 flex flex-col gap-4 group hover:border-primary/50 transition-colors overflow-hidden h-full"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-tight">
          {label}
        </span>
        <span className={cn("p-2 rounded-xl transition-transform group-hover:scale-110 shrink-0", iconBg)}>
          <Icon className={cn("text-lg", iconColor)} />
        </span>
      </div>
      
      <div className="mt-auto space-y-4">
        <div className="text-left min-w-0">
          <p className="text-2xl font-bold font-display text-text leading-tight truncate">
            {value}
          </p>
          {subtitle && (
            <p className="text-[10px] text-text-muted mt-1 font-bold uppercase tracking-tighter opacity-60 line-clamp-1">
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
            className="w-full px-3 py-2 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95 shadow-xl shadow-primary/20"
          >
            {action.label}
          </button>
        )}
      </div>
    </motion.div>


  );
}
