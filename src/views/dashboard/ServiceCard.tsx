import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MdLanguage, MdSchool, MdHistory, MdSyncAlt, MdTimer } from "react-icons/md";
import {
  RiCheckboxCircleFill,
  RiArrowRightLine,
  RiFlashlightFill,
  RiCloseLine,
  RiCheckLine,
} from "react-icons/ri";
import type { ServiceMeta } from '../../data/services';
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

interface ServiceCardProps {
  service: ServiceMeta;
  isOwned: boolean;
  isActive?: boolean;
  hasActiveProcess?: boolean;
  labels: {
    badges: {
      active: string;
      soldOut: string;
      available: string;
    };
    products: Record<string, { label: string; category: string }>;
    serviceCard: {
      includedFeatures: string;
      accessProcess: string;
      unavailable: string;
      startNow: string;
      finishCurrentFirst: string;
    };
  };
  index: number;
}

export function ServiceCard({
  service,
  isOwned,
  isActive,
  hasActiveProcess,
  labels,
  index,
}: ServiceCardProps) {
  const Icon = serviceIconMap[service.heroIconName] ?? MdLanguage;
  const cfg = slugConfig[service.slug] ?? {
    bg: "bg-blue-50",
    icon: "text-blue-500",
    accent: "from-blue-400 to-blue-600",
    label: "",
    category: "",
  };

  const features = service.included.slice(0, 3).map((item) =>
    item.split(":")[0].replace(/Guia |Checklist |Pacote /, "").trim()
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2 + index * 0.07 }}
      className={cn(
        "flex flex-col rounded-[32px] border bg-card shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group",
        isOwned ? "border-emerald-500/30" : "border-border"
      )}
    >
      <div className={cn("h-2 w-full bg-gradient-to-r", isOwned ? "from-emerald-400 to-emerald-600" : cfg.accent)} />

      <div className="flex flex-col flex-1 p-6 sm:p-10">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-8 w-full">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-[24px] ${cfg.bg} flex items-center justify-center border border-black/5 group-hover:scale-105 transition-transform duration-300`}>
            <Icon className={`text-3xl sm:text-5xl ${cfg.icon}`} />
          </div>
          <div className="min-w-0 flex-1 w-full">
            <div className="flex flex-col xl:flex-row flex-wrap items-start justify-between gap-3 mb-1.5">
              <h3 className="font-display font-black text-text text-xl leading-tight uppercase tracking-tight break-words">
                {labels.products[service.slug]?.label || service.title}
              </h3>
              {isOwned ? (
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-widest shrink-0 flex items-center gap-1">
                  <RiCheckLine className="text-[12px]" />
                  {labels.badges.active}
                </span>
              ) : isActive === false ? (
                <span className="text-[10px] font-black text-text-muted bg-bg-subtle border border-border px-3 py-1 rounded-full uppercase tracking-widest shrink-0 flex items-center gap-1">
                  <RiCloseLine className="text-[12px]" />
                  {labels.badges.soldOut}
                </span>
              ) : (
                <span className="text-[10px] font-black text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full uppercase tracking-widest shrink-0 flex items-center gap-1">
                  <RiFlashlightFill className="text-[12px]" />
                  {labels.badges.available}
                </span>
              )}
            </div>
            <p className="text-[11px] font-bold text-text-muted tracking-widest uppercase">
              {labels.products[service.slug]?.category || cfg.category}
            </p>
          </div>
        </div>

        <p className="text-[14px] text-text-muted font-medium leading-relaxed mb-10">
          {service.subtitle}
        </p>

        <div className="rounded-3xl bg-bg-subtle/80 p-6 sm:p-8 mb-10 flex-1 border border-border">
          <div className="text-[11px] font-black text-text-muted tracking-widest uppercase mb-5 flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", isOwned ? "bg-emerald-500" : "bg-primary")} />
            {labels.serviceCard.includedFeatures}
          </div>
          <ul className="space-y-4">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <RiCheckboxCircleFill className={cn("text-[20px] shrink-0", isOwned ? "text-emerald-500" : "text-primary")} />
                <span className="text-[13px] text-text font-bold uppercase tracking-tight">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {isOwned ? (
          <Link
            to={`/dashboard/processes/${service.slug}`}
            className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-[14px] font-black uppercase tracking-[0.1em] transition-all shadow-lg shadow-emerald-500/20"
          >
            {labels.serviceCard.accessProcess}
            <RiArrowRightLine className="text-xl" />
          </Link>
        ) : isActive === false ? (
          <button
            disabled
            className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-bg-subtle text-text-muted text-[14px] font-black uppercase tracking-[0.1em] cursor-not-allowed border border-border"
          >
            {labels.serviceCard.unavailable}
            <MdTimer className="text-xl" />
          </button>
        ) : (
          <div className="group/btn relative w-full">
            <Link
              to={hasActiveProcess ? "#" : `/checkout/${service.slug}`}
              className={cn(
                "flex items-center justify-center gap-3 w-full py-5 rounded-2xl text-[14px] font-black uppercase tracking-[0.1em] transition-all shadow-lg",
                hasActiveProcess
                  ? "bg-bg-subtle text-text-muted cursor-not-allowed border border-border shadow-none pointer-events-none"
                  : "bg-primary hover:bg-primary-hover text-white shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
              )}
            >
              {labels.serviceCard.startNow}
              <RiArrowRightLine className="text-xl" />
            </Link>
            {hasActiveProcess && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-max px-3 py-1.5 bg-highlight text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none shadow-xl border border-border">
                {labels.serviceCard.finishCurrentFirst}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-highlight" />
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
