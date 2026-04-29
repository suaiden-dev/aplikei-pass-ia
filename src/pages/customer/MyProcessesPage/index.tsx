import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MdLanguage, MdSchool, MdHistory, MdSyncAlt } from "react-icons/md";
import {
  RiBriefcaseLine,
  RiArrowRightLine,
  RiFlashlightFill,
  RiTimeLine,
} from "react-icons/ri";
import { useAuth } from "../../../hooks/useAuth";
import { servicesData } from "../../../data/services";
import { calculateProcessProgress } from "../../../services/process.service";
import { cn } from "../../../utils/cn";
import { useT } from "../../../i18n";
import { LogoLoader } from "../../../components/ui/LogoLoader";
import { useMyProcessesController } from "../../../controllers/MyProcesses/MyProcessesController";
import type { UserService } from "../../../models";

const serviceIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MdLanguage,
  MdSchool,
  MdHistory,
  MdSyncAlt,
};

const slugConfig: Record<string, {
  bg: string; icon: string; accent: string; label: string; category: string;
}> = {
  "visto-b1-b2":             { bg: "bg-primary/10",   icon: "text-primary",    accent: "bg-primary",     label: "B1/B2 VISA",         category: "TOURISM/BUSINESS" },
  "visto-b1-b2-reaplicacao": { bg: "bg-primary/10",   icon: "text-primary",    accent: "bg-primary",     label: "B1/B2 REAPLICAÇÃO",  category: "TOURISM/BUSINESS" },
  "visto-f1":                { bg: "bg-violet-500/10", icon: "text-violet-500", accent: "bg-violet-500",  label: "F-1 VISA",           category: "STUDENT/ACADEMIC" },
  "extensao-status":         { bg: "bg-blue-500/10",   icon: "text-blue-500",   accent: "bg-blue-500",    label: "EXTENSÃO STATUS",    category: "EXTEND STAY" },
  "troca-status":            { bg: "bg-indigo-500/10", icon: "text-indigo-500", accent: "bg-indigo-500",  label: "TROCA STATUS",       category: "CHANGE OF STATUS" },
};

const heroIconNameBySlug: Record<string, string> = {
  "visto-b1-b2": "MdLanguage",
  "visto-f1":    "MdSchool",
  "extensao-status": "MdHistory",
  "troca-status": "MdSyncAlt",
};

function ProcessRow({ proc, index }: { proc: UserService; index: number }) {
  const tVisas = useT("visas");
  const t = useT("dashboard");
  const cfgBase = slugConfig[proc.service_slug] ?? {
    bg: "bg-bg-subtle", icon: "text-text-muted", accent: "bg-text-muted",
    label: proc.service_slug.toUpperCase(), category: "",
  };
  const cfg = {
    ...cfgBase,
    label: tVisas.services?.[proc.service_slug]?.label || cfgBase.label,
    category: tVisas.services?.[proc.service_slug]?.category || cfgBase.category,
  };
  const iconName = heroIconNameBySlug[proc.service_slug] ?? "MdLanguage";
  const Icon = serviceIconMap[iconName] ?? MdLanguage;

  const service = servicesData.find(s => s.slug === proc.service_slug);
  const totalSteps = service?.steps.length ?? 1;
  const stepData = (proc.step_data || {}) as Record<string, unknown>;

  const uscisResult = stepData.uscis_official_result as string;
  const rfeResult = stepData.uscis_rfe_result as string;
  const motionResult = stepData.motion_final_result as string;
  const interviewResult = stepData.interview_outcome as string;

  const isApproved = uscisResult === 'approved' || rfeResult === 'approved' || motionResult === 'approved' || interviewResult === 'approved';
  const isDenied = proc.status === 'rejected' ||
                   motionResult === 'denied' ||
                   motionResult === 'rejected' ||
                   interviewResult === 'denied' ||
                   interviewResult === 'rejected';

  const isFinalized = proc.status === 'completed' || proc.status === 'rejected' || isApproved || isDenied;
  const progressPercent = isFinalized ? 100 : calculateProcessProgress(proc, totalSteps);

  const statusKey = isFinalized ? 'completed' : proc.status;
  const displayLabel = isApproved ? t.dashboard.myCases.status.approved :
                       isDenied ? t.dashboard.myCases.status.denied :
                       (t.dashboard.myCases.status[statusKey] || t.dashboard.myCases.status.pending);

  const getStatusColor = () => {
    if (isApproved) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (isDenied) return "text-red-500 bg-red-500/10 border-red-500/20";
    switch (statusKey) {
      case 'active': return "text-primary bg-primary/10 border-primary/20";
      case 'pending': return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case 'completed': return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case 'cancelled': return "text-red-500 bg-red-500/10 border-red-500/20";
      default: return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    }
  };

  const getDotColor = () => {
    if (isApproved) return "bg-emerald-500";
    if (isDenied) return "bg-red-500";
    switch (statusKey) {
      case 'active': return "bg-primary";
      case 'pending': return "bg-amber-500";
      case 'completed': return "bg-emerald-500";
      case 'cancelled': return "bg-red-400";
      default: return "bg-amber-500";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 bg-card rounded-3xl border border-border p-5 sm:px-6 sm:py-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group"
    >
      <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
        <div className={`w-12 h-12 shrink-0 rounded-2xl ${cfg.bg} flex items-center justify-center border border-black/5`}>
          <Icon className={`text-2xl ${cfg.icon}`} />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-display font-black text-text text-[15px] tracking-tight leading-none uppercase">
              {t.dashboard.products[proc.service_slug]?.label || cfg.label}
            </h3>
            <span className={cn(
              "text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest flex items-center gap-1",
              getStatusColor()
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full", getDotColor())} />
              {displayLabel}
            </span>
          </div>
          <p className="text-[11px] font-bold text-text-muted tracking-widest uppercase">
            {t.dashboard.products[proc.service_slug]?.category || cfg.category}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <div className="flex flex-col items-end gap-2 w-full sm:w-36">
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] sm:text-[11px] font-bold text-text-muted uppercase tracking-widest">{t.dashboard.myCases.progress}</span>
            <span className={cn(
              "text-[12px] sm:text-[13px] font-black tabular-nums",
              isApproved ? "text-emerald-500" : isDenied ? "text-red-500" : "text-primary"
            )}>{progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-bg-subtle rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.9, delay: 0.4 + index * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "h-full rounded-full",
                isApproved ? "bg-emerald-500" : isDenied ? "bg-red-500" : cfg.accent
              )}
            />
          </div>
        </div>

        <Link
          to={`/dashboard/processes/${proc.service_slug}?id=${proc.id}`}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl bg-primary text-white text-[12px] font-black uppercase tracking-wider transition-all hover:bg-primary-hover shadow-lg shadow-primary/20 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-x-2 sm:group-hover:translate-x-0 duration-200"
        >
          {t.dashboard.myCases.accessCase}
          <RiArrowRightLine className="text-base" />
        </Link>
      </div>
    </motion.div>
  );
}

export default function MyProcessesPage() {
  const t = useT("dashboard");
  const { user } = useAuth();

  const { activeProcesses, historyProcesses, userServices, isLoading } = useMyProcessesController(user?.id);

  return (
    <div className="p-6 md:p-12 max-w-[1200px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-8 md:mb-12 text-left"
      >
        <h1 className="font-display font-black text-2xl md:text-[32px] text-text leading-tight tracking-tight uppercase">
          {t.dashboard.myCases.title}
        </h1>
        <p className="text-sm md:text-base font-medium text-text-muted mt-2 italic">
          {t.dashboard.myCases.subtitle}
        </p>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <LogoLoader />
        </div>
      ) : userServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-card rounded-[32px] border border-border shadow-sm">
          <div className="w-20 h-20 rounded-full bg-bg-subtle flex items-center justify-center mb-6">
            <RiBriefcaseLine className="text-4xl text-text-muted" />
          </div>
          <p className="text-lg font-bold text-text">{t.dashboard.myCases.noCases}</p>
          <p className="text-sm font-medium text-text-muted mt-1">
            {t.dashboard.myCases.noCasesDesc}
          </p>
          <Link
            to="/dashboard"
            className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-black uppercase tracking-wider hover:bg-primary-hover transition-all shadow-sm shadow-primary/20"
          >
            {t.dashboard.myCases.goDashboard}
            <RiArrowRightLine />
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {activeProcesses.length > 0 && (
            <section className="text-left">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <RiFlashlightFill className="text-primary text-base rotate-12" />
                </div>
                <h2 className="font-display font-black text-text text-base uppercase tracking-tight">
                  {t.dashboard.myCases.active}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-black">
                  {activeProcesses.length}
                </span>
              </div>
              <div className="space-y-3">
                {activeProcesses.map((proc, i) => (
                  <ProcessRow key={proc.id} proc={proc} index={i} />
                ))}
              </div>
            </section>
          )}

          {historyProcesses.length > 0 && (
            <section className="text-left">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-bg-subtle flex items-center justify-center">
                  <RiTimeLine className="text-text-muted text-base" />
                </div>
                <h2 className="font-display font-black text-text text-base uppercase tracking-tight">
                  {t.dashboard.myCases.history}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-bg-subtle text-text-muted text-xs font-black">
                  {historyProcesses.length}
                </span>
              </div>
              <div className="space-y-3">
                {historyProcesses.map((proc, i) => (
                  <ProcessRow key={proc.id} proc={proc} index={activeProcesses.length + i} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
