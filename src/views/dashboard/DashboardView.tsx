import { motion } from "framer-motion";
import { ActiveProcessCard } from "./ActiveProcessCard";
import { ServiceCard } from "./ServiceCard";
import type { ActiveProcess } from "../../controllers/dashboard/DashboardController";
import type { ServiceMeta } from "../../data/services";
import type { DashboardLabels } from "../../controllers/dashboard/DashboardController";

interface DashboardViewProps {
  trulyActiveProcesses: ActiveProcess[];
  availableServices: ServiceMeta[];
  ownedSlugs: Set<string>;
  activeServices: Record<string, boolean>;
  isLoading: boolean;
  labels: DashboardLabels;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="h-64 bg-slate-100 rounded-[32px] animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-96 bg-slate-100 rounded-[32px] animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export function DashboardView({
  trulyActiveProcesses,
  availableServices,
  ownedSlugs,
  activeServices,
  isLoading,
  labels,
}: DashboardViewProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-16 sm:space-y-20">
      {trulyActiveProcesses.length > 0 && (
        <section>
          <div className="mb-8 sm:mb-12">
            <h2 className="font-display font-black text-slate-800 text-2xl sm:text-3xl tracking-tight">
              {labels.sections.activeCases}
            </h2>
            <p className="text-slate-500 mt-2">{labels.sections.activeCasesDesc}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trulyActiveProcesses.map((item, index) => (
              <ActiveProcessCard
                key={item.proc.id}
                proc={item.proc}
                service={item.service}
                progress={item.progress}
                isApproved={item.isApproved}
                isDenied={item.isDenied}
                isFinalized={item.isFinalized}
                labels={labels}
                index={index}
              />
            ))}
          </div>
        </section>
      )}

      {trulyActiveProcesses.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200"
        >
          <p className="text-slate-400 font-bold">{labels.sections.noActiveCases}</p>
          <p className="text-slate-400 mt-2 text-sm">{labels.sections.noActiveCasesDesc}</p>
        </motion.div>
      )}

      <section>
        <div className="mb-8 sm:mb-12">
          <h2 className="font-display font-black text-slate-800 text-2xl sm:text-3xl tracking-tight">
            {labels.sections.getCases}
          </h2>
          <p className="text-slate-500 mt-2">{labels.sections.getCasesDesc}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {availableServices.map((service, index) => (
            <ServiceCard
              key={service.slug}
              service={service}
              isOwned={ownedSlugs.has(service.slug)}
              isActive={activeServices[service.slug]}
              hasActiveProcess={trulyActiveProcesses.length > 0}
              labels={labels}
              index={index}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
