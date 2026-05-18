import { motion } from "framer-motion";
import { RiBuilding2Line } from "react-icons/ri";
import type { MasterTopOffice } from "@features/admin/hooks/useMasterOverview";

interface TopOfficesProps {
  data: MasterTopOffice[];
  title?: string;
}

function fmtCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export function TopOffices({ data, title = "Top Offices" }: TopOfficesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.5 }}
      className="bg-card rounded-2xl border border-border shadow-sm p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-semibold text-text text-base">{title}</h2>
        <RiBuilding2Line className="text-primary text-xl" />
      </div>

      <div className="space-y-4">
        {data.length === 0 ? (
          <div className="rounded-xl border border-border bg-bg-subtle/40 p-3 text-xs font-bold text-text-muted">
            No office sales yet.
          </div>
        ) : (
          data.map((office) => (
            <div key={office.officeName} className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                {office.officeName.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text truncate">{office.officeName}</p>
                <p className="text-[11px] text-text-muted">{office.processes} processes</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-text">{fmtCurrency(office.revenue)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
