import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MdLanguage, MdSchool, MdHistory, MdSyncAlt } from "react-icons/md";
import {
  RiCheckboxCircleFill,
  RiFileTextLine,
  RiFlashlightFill,
} from "react-icons/ri";
import type { ServiceMeta } from '../../data/services';
import type { UserService } from '../../models';
import { cn } from '../../utils/cn';

const serviceIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MdLanguage,
  MdSchool,
  MdHistory,
  MdSyncAlt,
};

const slugConfig: Record<string, {
  bg: string;
  icon: string;
  accent: string;
  label: string;
  category: string;
}> = {
  "visto-b1-b2":             { bg: "bg-sky-50",     icon: "text-sky-500",    accent: "from-sky-400 to-sky-600",         label: "B1/B2 VISA",         category: "TOURISM/BUSINESS" },
  "visto-b1-b2-reaplicacao": { bg: "bg-sky-50",     icon: "text-sky-500",    accent: "from-sky-400 to-sky-600",         label: "B1/B2 REAPLICAÇÃO",  category: "TOURISM/BUSINESS" },
  "visto-f1":                { bg: "bg-violet-50",  icon: "text-violet-500", accent: "from-violet-400 to-violet-600",   label: "F-1 VISA",           category: "STUDENT/ACADEMIC" },
  "extensao-status":         { bg: "bg-blue-50",    icon: "text-blue-500",   accent: "from-blue-400 to-blue-600",       label: "EXTENSÃO STATUS",    category: "EXTEND STAY" },
  "troca-status":            { bg: "bg-indigo-50",  icon: "text-indigo-500", accent: "from-indigo-400 to-indigo-600",   label: "TROCA STATUS",       category: "CHANGE OF STATUS" },
};

const heroIconNameBySlug: Record<string, string> = {
  "visto-b1-b2":             "MdLanguage",
  "visto-b1-b2-reaplicacao": "MdLanguage",
  "visto-f1":                "MdSchool",
  "extensao-status":         "MdHistory",
  "troca-status":            "MdSyncAlt",
};

interface ActiveProcessCardProps {
  proc: UserService;
  service: ServiceMeta | undefined;
  progress: number;
  isApproved: boolean;
  isDenied: boolean;
  isFinalized: boolean;
  labels: {
    badges: {
      approved: string;
      denied: string;
      finished: string;
      active: string;
    };
    status: {
      uscisApproved: string;
      deniedEncerrado: string;
      awaitingRfe: string;
      inProgress: string;
    };
    progress: string;
    products: Record<string, { label: string }>;
  };
  index: number;
}

export function ActiveProcessCard({
  proc,
  service: _service,
  progress,
  isApproved,
  isDenied,
  isFinalized,
  labels,
  index,
}: ActiveProcessCardProps) {
  const cfg = slugConfig[proc.service_slug] ?? {
    bg: "bg-slate-50",
    icon: "text-slate-400",
    label: proc.service_slug.toUpperCase(),
    category: "",
  };
  const iconName = heroIconNameBySlug[proc.service_slug] ?? "MdLanguage";
  const Icon = serviceIconMap[iconName] ?? RiFileTextLine;

  const getBadgeLabel = () => {
    if (isApproved) return labels.badges.approved;
    if (isDenied) return labels.badges.denied;
    if (isFinalized) return labels.badges.finished;
    return labels.badges.active;
  };

  return (
    <Link to={`/dashboard/processes/${proc.service_slug}?id=${proc.id}`} className="w-full h-full">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.08 }}
        className={cn(
          "relative w-full rounded-[32px] border-2 bg-white p-6 sm:p-10 shadow-xl shadow-primary/5 transition-all hover:shadow-2xl hover:shadow-primary/10 cursor-pointer",
          isApproved ? "border-emerald-500 shadow-emerald-500/5" :
          isDenied ? "border-red-500 shadow-red-500/5" : "border-primary"
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6 sm:mb-10">
          <div className={`w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-2xl ${cfg.bg} flex items-center justify-center border border-black/5`}>
            <Icon className={`text-2xl sm:text-4xl ${cfg.icon}`} />
          </div>
          <span className={cn(
            "text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border",
            isApproved ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
            isDenied ? "text-red-700 bg-red-50 border-red-200" :
            isFinalized ? "text-emerald-600 bg-emerald-50 border-emerald-200" :
            "text-primary bg-primary/5 border-primary/20"
          )}>
            {getBadgeLabel()}
          </span>
        </div>

        <h3 className="font-display font-black text-slate-800 text-lg sm:text-xl leading-none tracking-tight mb-3">
          {labels.products[proc.service_slug]?.label || cfg.label}
        </h3>

        <div className="flex items-center gap-2 mb-8">
          {isApproved ? (
            <RiCheckboxCircleFill className="text-emerald-500 text-base" />
          ) : isDenied ? (
            <RiCheckboxCircleFill className="text-red-500 text-base rotate-180" />
          ) : (
            <RiFlashlightFill className="text-slate-400 text-base rotate-12" />
          )}
          <span className={cn(
            "text-[12px] font-bold tracking-widest uppercase",
            isApproved ? "text-emerald-600" : isDenied ? "text-red-600" : "text-slate-500"
          )}>
            {isApproved ? labels.status.uscisApproved :
             isDenied ? labels.status.deniedEncerrado :
             labels.status.inProgress}
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between font-black">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">{labels.progress}</span>
            <span className="text-xl text-slate-800">{progress}%</span>
          </div>
          <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={cn(
                "absolute top-0 left-0 h-full rounded-full transition-all duration-1000",
                isApproved ? "bg-emerald-500" : isDenied ? "bg-red-500" : "bg-primary"
              )}
            />
          </div>
          <span className={cn(
            "text-lg font-black shrink-0 tabular-nums",
            isApproved ? "text-emerald-600" :
            isDenied ? "text-red-600" :
            isFinalized ? 'text-emerald-600' : 'text-primary'
          )}>{progress}%</span>
        </div>
      </motion.div>
    </Link>
  );
}
