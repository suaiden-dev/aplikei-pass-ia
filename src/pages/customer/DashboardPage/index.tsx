import { motion } from "framer-motion";
import { useAuth } from "../../../hooks/useAuth";
import { useT } from "../../../i18n";
import { LogoLoader } from "../../../components/ui/LogoLoader";
import {
  useDashboardController,
  type DashboardLabels,
} from "../../../controllers/dashboard/DashboardController";
import { DashboardView } from "../../../views/dashboard/DashboardView";

type TranslationMap = Record<string, unknown>;

function asMap(value: unknown): TranslationMap {
  return typeof value === "object" && value !== null ? (value as TranslationMap) : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function buildLabels(t: TranslationMap): DashboardLabels {
  const d = asMap(t.dashboard ?? t);
  const sections = asMap(d.sections);
  const badges = asMap(d.badges);
  const status = asMap(d.status);
  const serviceCard = asMap(d.serviceCard);
  const products = asMap(d.products) as Record<string, { label: string; category: string }>;

  return {
    title: asString(d.title),
    welcome: asString(d.welcome),
    sections: {
      activeCases: asString(sections.activeCases),
      activeCasesDesc: asString(sections.activeCasesDesc),
      noActiveCases: asString(sections.noActiveCases),
      noActiveCasesDesc: asString(sections.noActiveCasesDesc),
      getCases: asString(sections.getCases),
      getCasesDesc: asString(sections.getCasesDesc),
    },
    products,
    badges: {
      approved: asString(badges.approved),
      denied: asString(badges.denied),
      finished: asString(badges.finished),
      active: asString(badges.active),
      soldOut: asString(badges.soldOut),
      available: asString(badges.available),
    },
    status: {
      uscisApproved: asString(status.uscisApproved),
      deniedEncerrado: asString(status.deniedEncerrado),
      awaitingRfe: asString(status.awaitingRfe),
      inProgress: asString(status.inProgress),
    },
    serviceCard: {
      includedFeatures: asString(serviceCard.includedFeatures),
      accessProcess: asString(serviceCard.accessProcess),
      unavailable: asString(serviceCard.unavailable),
      startNow: asString(serviceCard.startNow),
      finishCurrentFirst: asString(serviceCard.finishCurrentFirst),
    },
    progress: asString(d.progress),
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
        <h1 className="font-display font-black text-2xl md:text-[32px] text-text leading-tight tracking-tight">
          {labels.title}
        </h1>
        <p className="text-base font-medium text-text-muted mt-2">
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
