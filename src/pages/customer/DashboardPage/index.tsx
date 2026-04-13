import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MdLanguage, MdSchool, MdHistory, MdSyncAlt, MdTimer } from "react-icons/md";
import {
  RiBriefcaseLine,
  RiArrowRightLine,
  RiCheckboxCircleFill,
  RiFileTextLine,
  RiFlashlightFill,
  RiCheckLine,
  RiCloseLine,
} from "react-icons/ri";
import { useAuth } from "../../../hooks/useAuth";
import { supabase } from "../../../lib/supabase";
import { servicesData } from "../../../data/services";
import { processService, type UserService } from "../../../services/process.service";
import { cn } from "../../../utils/cn";
import { toast } from "sonner";
import { useT } from "../../../i18n/LanguageContext";

// ─── Display config per slug ──────────────────────────────────────────────────

const serviceIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MdLanguage,
  MdSchool,
  MdHistory,
  MdSyncAlt,
};

const slugConfig: Record<string, {
  bg: string; icon: string; accent: string;
  label: string; category: string;
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

function calculatePhaseProgress(proc: UserService, totalSteps: number): number {
  const step = proc.current_step ?? 0;
  const isCOS = proc.service_slug === 'troca-status' || proc.service_slug === 'extensao-status';

  // Se o status for completed, sempre 100%
  if (proc.status === 'completed') return 100;

  if (!isCOS) {
    const isConsular = proc.service_slug.startsWith("visto-b1-b2") || proc.service_slug.startsWith("visto-f1");
    const rawProgress = Math.round((step / (totalSteps || 1)) * 100);
    // Cap B1/B2 and F1 at 95% until completed
    if (isConsular) {
      return Math.min(95, rawProgress);
    }
    return Math.min(99, rawProgress);
  }

  /**
   * Lógica de Pesos para COS (Total 25 passos):
   * 0-12 (Envio Inicial): 0% a 60%
   * 13-18 (RFE): 60% a 85%
   * 19-24 (Motion): 85% a 99%
   */
  if (step <= 12) {
    return Math.max(0, Math.min(60, Math.round((step / 12) * 60)));
  }
  
  if (step >= 13 && step <= 18) {
    const rfeProgress = (step - 13) / 5;
    return Math.max(60, Math.min(85, 60 + Math.round(rfeProgress * 25)));
  }

  if (step >= 19 && step <= 24) {
    const motionProgress = (step - 19) / 5;
    return Math.max(85, Math.min(99, 85 + Math.round(motionProgress * 15)));
  }

  return 99;
}

// ─── Active Process Card ───────────────────────────────────────────────────────

function ActiveProcessCard({ proc, index, t }: { proc: UserService; index: number; t: any }) {
  const cfg = slugConfig[proc.service_slug] ?? { bg: "bg-slate-50", icon: "text-slate-400", label: proc.service_slug.toUpperCase(), category: "" };
  const iconName = heroIconNameBySlug[proc.service_slug] ?? "MdLanguage";
  const Icon = serviceIconMap[iconName] ?? RiFileTextLine;
  
  const service = servicesData.find(s => s.slug === proc.service_slug);
  const totalSteps = service?.steps.length ?? 1;
  const currentStep = proc.current_step ?? 0;
  const stepData = proc.step_data || {};
  
  // Lógica de Resultado Final across all phases
  const uscisResult = stepData.uscis_official_result as string;
  const rfeResult = stepData.uscis_rfe_result as string;
  const motionResult = stepData.motion_final_result as string;

  const interviewResult = stepData.interview_outcome as string;

  const isApproved = uscisResult === 'approved' || rfeResult === 'approved' || motionResult === 'approved' || interviewResult === 'approved';
  // Denied só é "Final" se o usuário não tiver seguido para RFE ou Motion (ou se o Motion negou)
  const isDenied = motionResult === 'denied' || 
                   interviewResult === 'denied' ||
                   (rfeResult === 'denied' && currentStep >= 18 && !uscisResult) || 
                   (uscisResult === 'denied' && currentStep >= 12 && !rfeResult && !motionResult);

  const isFinalized = proc.status === 'completed' || isApproved || isDenied;
  const progress = isFinalized ? 100 : calculatePhaseProgress(proc, totalSteps);
  
  // Label customizado baseado no resultado USCIS
  const getBadgeLabel = () => {
    if (isApproved) return t.dashboard.badges.approved;
    if (isDenied) return t.dashboard.badges.denied;
    if (isFinalized) return t.dashboard.badges.finished;
    return t.dashboard.badges.active;
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
        <div className="flex items-start justify-between mb-6 sm:mb-10">
          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl ${cfg.bg} flex items-center justify-center border border-black/5`}>
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
          {t.dashboard.products[proc.service_slug]?.label || cfg.label}
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
            {isApproved ? t.dashboard.status.uscisApproved : 
             isDenied ? t.dashboard.status.deniedEncerrado : 
             uscisResult === 'rfe' ? t.dashboard.status.awaitingRfe :
             t.dashboard.status.inProgress}
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between font-black">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">{t.dashboard.progress}</span>
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


// ─── Service Card ─────────────────────────────────────────────────────────────

function ServiceCard({
  service,
  index,
  isOwned,
  isActive,
  hasActiveProcess,
  t,
}: {
  service: (typeof servicesData)[0];
  index: number;
  isOwned: boolean;
  isActive?: boolean;
  hasActiveProcess?: boolean;
  t: any;
}) {
  const Icon = serviceIconMap[service.heroIconName] ?? MdLanguage;
  const cfg = slugConfig[service.slug] ?? { bg: "bg-blue-50", icon: "text-blue-500", accent: "from-blue-400 to-blue-600", label: "", category: "" };

  const features = service.included.slice(0, 3).map((item) =>
    item.split(":")[0].replace(/Guia |Checklist |Pacote /, "").trim()
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2 + index * 0.07 }}
      className={cn(
        "flex flex-col rounded-[32px] border bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group",
        isOwned ? "border-emerald-200" : "border-slate-100"
      )}
    >
      {/* Accent bar */}
      <div className={cn("h-2 w-full bg-gradient-to-r", isOwned ? "from-emerald-400 to-emerald-600" : cfg.accent)} />

      <div className="flex flex-col flex-1 p-6 sm:p-10">
        {/* Header */}
        <div className="flex items-start gap-4 sm:gap-6 mb-8">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-[24px] ${cfg.bg} flex items-center justify-center border border-black/5 group-hover:scale-105 transition-transform duration-300`}>
            <Icon className={`text-3xl sm:text-5xl ${cfg.icon}`} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <h3 className="font-display font-black text-slate-800 text-xl leading-tight uppercase tracking-tight">
                {t.dashboard.products[service.slug]?.label || service.title}
              </h3>
              {isOwned ? (
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-widest shrink-0 flex items-center gap-1">
                  <RiCheckLine className="text-[12px]" />
                  {t.dashboard.badges.active}
                </span>
              ) : isActive === false ? (
                <span className="text-[10px] font-black text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full uppercase tracking-widest shrink-0 flex items-center gap-1">
                  <RiCloseLine className="text-[12px]" />
                  {t.dashboard.badges.soldOut}
                </span>
              ) : (
                <span className="text-[10px] font-black text-primary bg-primary/5 border border-primary/20 px-3 py-1 rounded-full uppercase tracking-widest shrink-0 flex items-center gap-1">
                  <RiFlashlightFill className="text-[12px]" />
                  {t.dashboard.badges.available}
                </span>
              )}
            </div>
            <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">
              {t.dashboard.products[service.slug]?.category || cfg.category}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-[14px] text-slate-500 font-medium leading-relaxed mb-10">
          {service.subtitle}
        </p>

        {/* Features */}
        <div className="rounded-3xl bg-slate-50/80 p-6 sm:p-8 mb-10 flex-1 border border-slate-100">
          <div className="text-[11px] font-black text-slate-400 tracking-widest uppercase mb-5 flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", isOwned ? "bg-emerald-500" : "bg-primary")} />
            {t.dashboard.serviceCard.includedFeatures}
          </div>
          <ul className="space-y-4">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <RiCheckboxCircleFill className={cn("text-[20px] shrink-0", isOwned ? "text-emerald-500" : "text-primary")} />
                <span className="text-[13px] text-slate-600 font-bold uppercase tracking-tight">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        {isOwned ? (
          <Link
            to={`/dashboard/processes/${service.slug}`}
            className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-[14px] font-black uppercase tracking-[0.1em] transition-all shadow-lg shadow-emerald-500/20"
          >
            {t.dashboard.serviceCard.accessProcess}
            <RiArrowRightLine className="text-xl" />
          </Link>
        ) : isActive === false ? (
          <button
            disabled
            className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-slate-100 text-slate-400 text-[14px] font-black uppercase tracking-[0.1em] cursor-not-allowed border border-slate-200"
          >
            {t.dashboard.serviceCard.unavailable}
            <MdTimer className="text-xl" />
          </button>
        ) : (
          <div className="group/btn relative w-full">
            <Link
              to={hasActiveProcess ? "#" : `/checkout/${service.slug}`}
              className={cn(
                "flex items-center justify-center gap-3 w-full py-5 rounded-2xl text-[14px] font-black uppercase tracking-[0.1em] transition-all shadow-lg",
                hasActiveProcess 
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none pointer-events-none" 
                  : "bg-primary hover:bg-primary-hover text-white shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
              )}
            >
              {t.dashboard.serviceCard.startNow}
              <RiArrowRightLine className="text-xl" />
            </Link>
            {hasActiveProcess && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-max px-3 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none shadow-xl">
                {t.dashboard.serviceCard.finishCurrentFirst}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const t = useT("dashboard");
  const [userServices, setUserServices] = useState<UserService[]>([]);
  const [activeServices, setActiveServices] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const loadData = async () => {
      try {
        // --- PAYMENT RECOVERY LOGIC ---
        const recoverySlug = localStorage.getItem("checkout_slug");
        if (recoverySlug && user) {
          console.log("[Dashboard] Recovery detected for slug:", recoverySlug);
          const recoveryDeps = parseInt(localStorage.getItem("checkout_dependents") || "0", 10);
          const recoveryParentId = localStorage.getItem("checkout_parent_id");
          const isExtraDependent = recoverySlug.startsWith("dependente-adicional-");
          
          try {
            if (isExtraDependent && recoveryParentId) {
              // Get current slots and add
              const { data: proc } = await supabase
                .from("user_services")
                .select("step_data")
                .eq("id", recoveryParentId)
                .single();
              
              if (proc) {
                const oldData = (proc.step_data || {}) as any;
                const currentSlots = parseInt(String(oldData.paid_dependents || 0), 10);
                await supabase
                  .from("user_services")
                  .update({
                    step_data: {
                      ...oldData,
                      paid_dependents: currentSlots + recoveryDeps
                    }
                  })
                  .eq("id", recoveryParentId);
              }
            } else {
              await processService.activateService(user.id, recoverySlug, recoveryDeps);
            }
            
            toast.success("Pagamento confirmado! Seu processo foi atualizado.");
            localStorage.removeItem("checkout_slug");
            localStorage.removeItem("checkout_dependents");
            localStorage.removeItem("checkout_parent_id");
          } catch (recoveryErr) {
            console.error("[Dashboard] Recovery failed:", recoveryErr);
          }
        }
        // ------------------------------

        const [services, { data: prices }] = await Promise.all([
          processService.getUserServices(user.id),
          supabase.from("services_prices").select("service_id, is_active")
        ]);

        setUserServices(services);
        
        const availabilityMap: Record<string, boolean> = {};
        (prices as { service_id: string; is_active: boolean }[] | null)?.forEach((p) => {
          availabilityMap[p.service_id] = p.is_active;
        });
        setActiveServices(availabilityMap);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const activeStatuses = ["active", "awaiting_review"];
  
  // 1. Filter only base products (exclude consultancies, etc) and Sort by date DESC
  const baseProducts = userServices
    .filter(s => 
      !s.service_slug.toLowerCase().startsWith("analise-") &&
      !s.service_slug.toLowerCase().startsWith("mentoria-") &&
      !s.service_slug.toLowerCase().startsWith("consultoria-") &&
      !s.service_slug.toLowerCase().startsWith("dependente-adicional-")
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const newestActiveSlugs = new Set<string>();

  // 2. Determine which ones are "History"
  const others = baseProducts.filter((s) => {
    const stepData = (s.step_data || {}) as Record<string, any>;
    const isB1B2 = s.service_slug.startsWith("visto-b1-b2");
    const isF1 = s.service_slug.startsWith("visto-f1");
    const isCOS = s.service_slug === 'troca-status' || s.service_slug === 'extensao-status';
    
    if (['completed', 'rejected', 'denied', 'cancelled'].includes(s.status)) return true;
    if ((isB1B2 || isF1) && stepData.interview_outcome) return true;
    if (isCOS && (s.current_step ?? 0) >= 19) return true;

    if (activeStatuses.includes(s.status)) {
       if (newestActiveSlugs.has(s.service_slug)) return true;
       newestActiveSlugs.add(s.service_slug);
    }
    return false;
  });

  // 3. The rest are "Truly Active"
  const trulyActiveProcesses = baseProducts.filter((s) =>
    activeStatuses.includes(s.status) &&
    !others.find(o => o.id === s.id) &&
    servicesData.some(sd => sd.slug === s.service_slug) &&
    !s.service_slug.toLowerCase().startsWith("analise-") &&
    !s.service_slug.toLowerCase().startsWith("mentoria-") &&
    !s.service_slug.toLowerCase().startsWith("consultoria-") &&
    !s.service_slug.toLowerCase().startsWith("dependente-adicional-")
  );
  const ownedSlugs = new Set(trulyActiveProcesses.map((s) => s.service_slug));

  return (
    <div className="p-6 md:p-12 max-w-[1400px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-8 md:mb-12"
      >
        <h1 className="font-display font-black text-2xl md:text-[32px] text-slate-900 leading-tight tracking-tight">
          {t.dashboard.title}
        </h1>
        <p className="text-base font-medium text-slate-500 mt-2">
          {t.dashboard.welcome.split('!')[0]}
          {user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}! 
          {t.dashboard.welcome.split('!')[1]}
        </p>
      </motion.div>

      {/* ── Your Active Processes ── */}
      <section className="mb-16">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/10">
            <RiBriefcaseLine className="text-2xl text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-display font-black text-slate-800 text-lg uppercase tracking-tight">
                {t.dashboard.sections.activeCases}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-sm font-black">
                {trulyActiveProcesses.length}
              </span>
            </div>
            <p className="text-[13px] font-medium text-slate-400 mt-0.5 italic">
              {t.dashboard.sections.activeCasesDesc}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : trulyActiveProcesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-slate-100 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
              <RiBriefcaseLine className="text-4xl text-slate-200" />
            </div>
            <p className="text-lg font-bold text-slate-400">{t.dashboard.sections.noActiveCases}</p>
            <p className="text-sm font-medium text-slate-300 mt-1">
              {t.dashboard.sections.noActiveCasesDesc}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {trulyActiveProcesses.map((proc, i) => (
              <ActiveProcessCard key={proc.id} proc={proc} index={i} t={t} />
            ))}
          </div>
        )}
      </section>

      {/* ── Get Processes ── */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/10">
            <RiFlashlightFill className="text-2xl text-white rotate-12" />
          </div>
          <div>
            <h2 className="font-display font-black text-slate-800 text-lg uppercase tracking-tight">
              {t.dashboard.sections.getCases}
            </h2>
            <p className="text-[13px] font-medium text-slate-400 mt-0.5 italic">
              {t.dashboard.sections.getCasesDesc}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {isLoading ? (
            // Skeleton loaders for services
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[400px] rounded-[32px] bg-slate-50 animate-pulse border border-slate-100" />
            ))
          ) : (
            servicesData
              .filter(s =>
                !s.slug.toLowerCase().startsWith("analise-") &&
                !s.slug.toLowerCase().startsWith("mentoria-") &&
                !s.slug.toLowerCase().startsWith("consultoria-") &&
                !s.slug.toLowerCase().startsWith("dependente-adicional-") &&
                s.slug !== "visto-b1-b2-reaplicacao" &&
                s.slug !== "visto-f1-reaplicacao" &&
                !ownedSlugs.has(s.slug)
              )
              .map((service, index) => (
                <ServiceCard
                  key={service.slug}
                  service={service}
                  index={index}
                  isOwned={false}
                  isActive={activeServices[service.slug]}
                  hasActiveProcess={false}
                  t={t}
                />
              ))
          )}
        </div>
      </section>
    </div>
  );
}
