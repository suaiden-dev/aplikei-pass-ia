import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ActiveProcessCard } from "./ActiveProcessCard";
import { ServiceCard } from "./ServiceCard";
import type { ActiveProcess, DashboardLabels } from "@features/process/hooks/useDashboard";
import type { ServiceMeta } from "@shared/data/services";
import { Card } from "../atoms/card";
import { SectionHeader } from "../molecules/SectionHeader";

const PAGE_SIZE = 4;

interface DashboardViewProps {
  trulyActiveProcesses: ActiveProcess[];
  availableServices: ServiceMeta[];
  ownedSlugs: Set<string>;
  activeServices: Record<string, boolean>;
  isLoading: boolean;
  labels: DashboardLabels;
  officeId?: string | null;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="h-64 animate-pulse border-border/70 bg-bg-subtle" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-96 animate-pulse border-border/70 bg-bg-subtle" />
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
  officeId,
}: DashboardViewProps) {
  const [activePage, setActivePage] = useState(1);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const activeTotalPages = Math.max(1, Math.ceil(trulyActiveProcesses.length / PAGE_SIZE));
  const pagedActiveProcesses = useMemo(() => {
    const start = (activePage - 1) * PAGE_SIZE;
    return trulyActiveProcesses.slice(start, start + PAGE_SIZE);
  }, [activePage, trulyActiveProcesses]);

  return (
    <div className="space-y-16 sm:space-y-20">
      {trulyActiveProcesses.length > 0 && (
        <section>
          <SectionHeader
            title={labels.sections.activeCases}
            description={labels.sections.activeCasesDesc}
            className="mb-8 sm:mb-12"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pagedActiveProcesses.map((item, index) => (
              <ActiveProcessCard
                key={item.proc.id}
                proc={item.proc}
                displaySlug={item.displaySlug}
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
          {activeTotalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setActivePage((prev) => Math.max(1, prev - 1))}
                disabled={activePage === 1}
                className="px-3 py-1.5 rounded-lg border border-border text-sm font-bold text-text disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                {activePage}/{activeTotalPages}
              </span>
              <button
                type="button"
                onClick={() => setActivePage((prev) => Math.min(activeTotalPages, prev + 1))}
                disabled={activePage === activeTotalPages}
                className="px-3 py-1.5 rounded-lg border border-border text-sm font-bold text-text disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </section>
      )}

      {trulyActiveProcesses.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-dashed border-border bg-bg-subtle px-6 py-20 text-center"
        >
          <p className="text-text-muted font-bold">{labels.sections.noActiveCases}</p>
          <p className="text-text-muted mt-2 text-sm">{labels.sections.noActiveCasesDesc}</p>
        </motion.div>
      )}

      {/* 
      <section>
        <SectionHeader
          title={labels.sections.getCases}
          description={labels.sections.getCasesDesc}
          className="mb-8 sm:mb-12"
        />
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
              officeId={officeId}
            />
          ))}
        </div>
      </section> 
      */}
    </div>
  );
}
