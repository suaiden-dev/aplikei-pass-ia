import { motion } from "framer-motion";
import { useAuth } from "../../../hooks/useAuth";
import { useT } from "../../../i18n";
import { LogoLoader } from "../../../components/ui/LogoLoader";
import {
  useDashboardController,
  type DashboardLabels,
} from "../../../controllers/dashboard/DashboardController";
import { DashboardView } from "../../../views/dashboard/DashboardView";

function buildLabels(t: Record<string, any>): DashboardLabels {
  const d = t.dashboard || t;
  return {
    title: d.title,
    welcome: d.welcome,
    sections: d.sections,
    products: d.products,
    badges: d.badges,
    status: d.status,
    serviceCard: d.serviceCard,
    progress: d.progress,
  };
}

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const t = useT("dashboard");
  const labels = buildLabels(t);

  const {
    trulyActiveProcesses,
    availableServices,
    ownedSlugs,
    activeServices,
    isLoading,
  } = useDashboardController({
    userId: user?.id,
    labels,
  });

  return (
    <div className="p-6 md:p-12 max-w-[1400px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-8 md:mb-12"
      >
        <h1 className="font-display font-black text-2xl md:text-[32px] text-slate-900 leading-tight tracking-tight">
          {labels.title}
        </h1>
        <p className="text-base font-medium text-slate-500 mt-2">
          {labels.welcome.split("!")[0]}
          {user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}!
          {labels.welcome.split("!")[1]}
        </p>
      </motion.div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LogoLoader />
        </div>
      ) : (
        <DashboardView
          trulyActiveProcesses={trulyActiveProcesses}
          availableServices={availableServices}
          ownedSlugs={ownedSlugs}
          activeServices={activeServices}
          isLoading={false}
          labels={labels}
        />
      )}
    </div>
  );
}
