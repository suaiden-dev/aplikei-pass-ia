import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MdLanguage, MdSchool, MdHistory, MdSyncAlt } from "react-icons/md";
import {
  RiArrowLeftLine,
  RiCheckboxCircleFill,
  RiTimeLine,
  RiArrowRightLine,
  RiInformationLine,
  RiCheckboxBlankCircleLine,
  RiPlayFill,
  RiLoader4Line,
  RiErrorWarningLine,
  RiBookOpenLine,
  RiUserVoiceLine,
  RiUserStarLine,
  RiFlagLine
} from "react-icons/ri";
import { useAuth } from "../../../hooks/useAuth";
import { processService, type UserService } from "../../../services/process.service";
import { getServiceBySlug } from "../../../data/services";
import { supabase } from "../../../lib/supabase";
import { toast } from "sonner";
import PhotoUploadOverlay from "../../../components/PhotoUploadOverlay";
import { cn } from "../../../utils/cn";
import { useT } from "../../../i18n";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "../../../components/ui/skeleton";

const serviceIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MdLanguage,
  MdSchool,
  MdHistory,
  MdSyncAlt,
};

const slugConfig: Record<string, {
  bg: string; icon: string; gradient: string; label: string; category: string; iconName: string;
}> = {
  "visto-b1-b2":             { bg: "bg-sky-50",    icon: "text-sky-500",    gradient: "from-sky-400 to-sky-600",       label: "B1/B2 VISA",         category: "TOURISM/BUSINESS",  iconName: "MdLanguage" },
  "visto-b1-b2-reaplicacao": { bg: "bg-sky-50",    icon: "text-sky-500",    gradient: "from-sky-400 to-sky-600",       label: "B1/B2 REAPLICAÇÃO",  category: "TOURISM/BUSINESS",  iconName: "MdLanguage" },
  "visto-f1":                { bg: "bg-violet-50", icon: "text-violet-500", gradient: "from-violet-400 to-violet-600", label: "F-1 VISA",           category: "STUDENT/ACADEMIC",  iconName: "MdSchool" },
  "visto-f1-reaplicacao":    { bg: "bg-violet-50", icon: "text-violet-500", gradient: "from-violet-400 to-violet-600", label: "F-1 REAPLICAÇÃO", category: "STUDENT/ACADEMIC",  iconName: "MdSchool" },
  "extensao-status":         { bg: "bg-blue-50",   icon: "text-blue-500",   gradient: "from-blue-400 to-blue-600",     label: "EXTENSÃO STATUS",    category: "EXTEND STAY",       iconName: "MdHistory" },
  "troca-status":            { bg: "bg-indigo-50", icon: "text-indigo-500", gradient: "from-indigo-400 to-indigo-600", label: "TROCA STATUS",       category: "CHANGE OF STATUS",  iconName: "MdSyncAlt" },
};
function calculatePhaseProgress(proc: UserService, totalSteps: number, isCOS: boolean): number {
  const step = proc.current_step ?? 0;

  // Se o status for completed, sempre 100%
  if (proc.status === 'completed') return 100;

  if (!isCOS) {
    const isSpecialVisa = proc.service_slug?.startsWith("visto-b1-b2") || proc.service_slug?.startsWith("visto-f1");
    // Cap at 95% for B1B2/F1 because they only finalize after client interview outcome
    const maxProgress = isSpecialVisa ? 95 : 99;
    return Math.min(maxProgress, Math.round((step / (totalSteps || 1)) * 100));
  }

  /**
   * Lógica de Pesos para COS (Total 25 passos):
   * 0-12 (Engajamento Inicial/Aplicação): 0% a 95%
   * 13-18 (RFE - Condicional): 95% a 97%
   * 19-24 (Motion - Condicional): 97% a 99%
   */
  if (step <= 12) {
    return Math.max(0, Math.min(95, Math.round((step / 12) * 95)));
  }
  
  if (step >= 13 && step <= 18) {
    const rfeProgress = (step - 13) / 5;
    return Math.max(95, Math.min(97, 95 + Math.round(rfeProgress * 2)));
  }

  if (step >= 19 && step <= 24) {
    const motionProgress = (step - 19) / 5;
    return Math.max(97, Math.min(99, 97 + Math.round(motionProgress * 2)));
  }

  return 99;
}

export default function ProcessDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const t = useT("visas");
  const { user, refreshAccount } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isUpdating, setIsUpdating] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(false);

  useEffect(() => {
    if (user?.passportPhotoUrl || user?.avatarUrl) {
      setHasPhoto(true);
    }
  }, [user]);

  const service = slug ? getServiceBySlug(slug) : null;
  const cfg = slug ? slugConfig[slug] : null;
  const Icon = cfg ? (serviceIconMap[cfg.iconName] ?? MdLanguage) : MdLanguage;

  const { data: proc, isLoading, refetch } = useQuery({
    queryKey: ['process-detail', slug, searchParams.get("id")],
    queryFn: async () => {
      if (!user || !slug) return null;
      const idParam = searchParams.get("id");
      const data = idParam 
        ? await processService.getServiceById(idParam) 
        : await processService.getUserServiceBySlug(user.id, slug);

      if (data && (data.user_id !== user.id || (idParam && data.service_slug !== slug))) {
        return null;
      }
      return data;
    },
    enabled: !!user && !!slug,
  });

  const { data: hasConsultation = false } = useQuery({
    queryKey: ['mentoria-negativa', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const consult = await processService.getUserServiceBySlug(user.id, "mentoria-negativa-consular");
      return !!consult && consult.status !== "cancelled";
    },
    enabled: !!user && (slug.startsWith("visto-b1-b2") || slug.startsWith("visto-f1")),
  });

  useEffect(() => {
    if (!user || !proc) return;

    // REALTIME SUBSCRIPTION
    const channel = supabase
      .channel(`process-realtime-${proc.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_services',
          filter: `id=eq.${proc.id}`
        },
        () => {
          console.log("[ProcessDetail] Realtime update detected, refetching...");
          queryClient.invalidateQueries({ queryKey: ['process-detail', slug, searchParams.get("id")] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, proc, slug, searchParams, queryClient]);

  const handleCompleteStep = async () => {
    if (!proc) return;
    setIsUpdating(true);
    try {
      await processService.requestStepReview(proc.id);
      toast.success(t.processDetail.successRequestReview);
      await refetch();
    } catch {
      toast.error(t.processDetail.errorRequestReview);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 max-w-[1200px]">
        <div className="flex items-center gap-6 mb-12">
          <Skeleton className="w-16 h-16 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-3xl" />
            <Skeleton className="h-32 w-full rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!service || !proc) {
    return (
      <div className="p-12 text-center">
        <h1 className="text-2xl font-bold text-slate-800">{t.processDetail.processNotFound}</h1>
        <Link to="/dashboard/processes" className="text-primary font-bold mt-4 inline-block">{t.processDetail.back}</Link>
      </div>
    );
  }

  const currentStepIndexInFull = proc.current_step ?? 0;
  const fullSteps = service.steps;
  
  // Filter steps for COS conditional logic
  const isCOS = slug === "troca-status" || slug === "extensao-status";
  const prefix = slug === "extensao-status" ? "eos_" : "cos_";
  
  const stepData = proc.step_data || {};
  const targetVisa = stepData.targetVisa as string;
  const showF1Steps = isCOS ? (targetVisa === "F1") : true;
  
  const stepsToSkip = [`${prefix}i20_upload`, `${prefix}sevis_fee`, `${prefix}analysis_i20_sevis`];
  const motionSteps = [
    `${prefix}motion_explanation`, 
    `${prefix}motion_instruction`, 
    `${prefix}motion_proposal`, 
    `${prefix}motion_accept_proposal`, 
    `${prefix}motion_final_ship`, 
    `${prefix}motion_end`
  ];

  const uscisResult = stepData.uscis_official_result as string;
  const showMotionSteps = isCOS && uscisResult === 'denied';

  const rfeSteps = [
    `${prefix}rfe_explanation`,
    `${prefix}rfe_instruction`,
    `${prefix}rfe_proposal`,
    `${prefix}rfe_accept_proposal`,
    `${prefix}rfe_final_ship`,
    `${prefix}rfe_end`
  ];

  const showRfeSteps = isCOS && uscisResult === 'rfe';

  const steps = fullSteps.filter(s => {
    if (isCOS && !showF1Steps && stepsToSkip.includes(s.id)) return false;
    if (isCOS && !showRfeSteps && rfeSteps.includes(s.id)) return false;
    if (isCOS && !showMotionSteps && motionSteps.includes(s.id)) return false;
    return true;
  });

  // Calculate current index in the filtered list
  const currentStepId = fullSteps[currentStepIndexInFull]?.id;
  let currentStepIndex = steps.findIndex(s => s.id === currentStepId);
  
  if (currentStepIndex === -1 && currentStepIndexInFull >= steps.length) {
    currentStepIndex = steps.length;
  }

  // Se o processo está marcado como finalizado E com sucesso, forçamos o índice para o fim
  if (proc.status === 'completed') {
    currentStepIndex = steps.length;
  }

  // --- LOGICA DE RESULTADO FINAL (Sincronizada) ---
  const rfeResult = stepData.uscis_rfe_result as string;
  const motionResult = stepData.motion_final_result as string;

  const interviewOutcome = stepData.interview_outcome as string;
  const isDenied = proc.status === 'rejected' ||
                   interviewOutcome === 'rejected' ||
                   interviewOutcome === 'denied' ||
                   motionResult === 'denied' ||
                   (rfeResult === 'denied' && currentStepIndexInFull >= 18 && !uscisResult) ||
                   (uscisResult === 'denied' && currentStepIndexInFull >= 12 && !rfeResult && !motionResult);

  const isApproved = uscisResult === 'approved' || 
                     rfeResult === 'approved' || 
                     motionResult === 'approved' || 
                     interviewOutcome === 'approved' || 
                     interviewOutcome === 'granted' ||
                     (proc.status === 'completed' && !isDenied && !uscisResult?.includes('denied'));

  const isFinalized = proc.status === 'completed' || isApproved || isDenied;
  const progressPercent = isFinalized ? 100 : calculatePhaseProgress(proc, fullSteps.length, isCOS);

  return (
    <div className="p-12 max-w-[1200px]">
      {/* Back */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="mb-8"
      >
        <Link
          to="/dashboard/processes"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors"
        >
          <RiArrowLeftLine />
          {t.processDetail.myCases}
        </Link>
      </motion.div>

      {/* Success / Approved Banner */}
      {isApproved && (
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="mb-12 p-10 rounded-[40px] bg-emerald-500 text-white shadow-2xl shadow-emerald-500/30 overflow-hidden relative"
        >
          {/* Decorative stuff logic */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 rounded-[28px] bg-white text-emerald-500 flex items-center justify-center shrink-0 shadow-xl">
              <RiCheckboxCircleFill className="text-5xl" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-black uppercase tracking-tight mb-2">{t.processDetail.approvedBannerTitle}</h2>
              <p className="text-emerald-50 font-medium text-sm leading-relaxed max-w-xl">
                {t.processDetail.approvedBannerDesc}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Rejection Feedback Alert */}
      {proc?.status === 'active' && !!stepData.admin_feedback && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 rounded-[24px] bg-red-50 border border-red-100 flex items-start gap-4 shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20">
            <RiErrorWarningLine className="text-xl" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-black text-red-900 uppercase tracking-tight mb-1">{t.processDetail.actionRequired}</h3>
            <p className="text-sm text-red-700 font-medium leading-relaxed italic mb-3">"{String(stepData.admin_feedback)}"</p>
            
            {Array.isArray(stepData.rejected_items) && (stepData.rejected_items as string[]).length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {(stepData.rejected_items as string[]).map((item: string) => (
                  <span key={item} className="px-2 py-1 rounded-lg bg-white border border-red-200 text-red-700 text-[9px] font-black uppercase tracking-tight shadow-sm">
                    {item.replace('docs.', 'DOC: ').replace(/([A-Z])/g, ' $1')}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-3">
               <button 
                onClick={() => {
                  const currentIdx = proc.current_step ?? 0;
                  const currentStep = fullSteps[currentIdx];
                  // If we are currently on an admin-review step, go back one step to the form the user just filled
                  const targetIdx = currentStep?.type === 'admin_action' ? currentIdx - 1 : currentIdx;
                  navigate(`/dashboard/processes/${slug}/onboarding?step=${targetIdx}`);
                }}
                className="px-6 py-2.5 rounded-xl bg-red-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all border-none flex items-center gap-2"
               >
                 <RiPlayFill className="text-base" /> {t.processDetail.fixProblems}
               </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Denial Recovery Banner */}
      {(slug?.startsWith("visto-b1-b2") || slug?.startsWith("visto-f1")) && isDenied && (
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="mb-12 p-10 rounded-[40px] bg-slate-900 text-white overflow-hidden relative group"
        >
           {/* Decoration */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32" />
           
           <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
             <div className="flex-1 text-center lg:text-left">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest mb-6">
                 <RiFlagLine className="text-sm" /> Status: {t.processDetail.visaDenied}
               </div>
               
               {hasConsultation ? (
                 <>
                   <h2 className="font-display font-black text-3xl sm:text-4xl leading-tight tracking-tight mb-4" dangerouslySetInnerHTML={{ 
                     __html: t.processDetail.denialBanner?.consultationConfirmed.replace('{highlight}', `<span className="text-primary">${t.processDetail.denialBanner?.consultationConfirmedHighlight}</span>`) || `Consulta <span className="text-primary">Confirmada</span>.`
                   }} />
                   <p className="text-slate-400 text-base font-medium max-w-xl">
                     {t.processDetail.denialBanner?.consultationConfirmedDesc}
                   </p>
                 </>
               ) : (
                 <>
                   <h2 className="font-display font-black text-3xl sm:text-4xl leading-tight tracking-tight mb-4" dangerouslySetInnerHTML={{
                     __html: t.processDetail.denialTitle.replace('{highlight}', `<span className="text-primary">${t.processDetail.denialTitleHighlight}</span>`)
                   }} />
                   <p className="text-slate-400 text-base font-medium max-w-xl">
                     {t.processDetail.denialDesc.replace('{slug}', slug.includes("f1") ? "F-1" : "B1/B2")}
                   </p>
                 </>
               )}
             </div>
             
             <div className="shrink-0 w-full lg:w-auto flex flex-col gap-4">
               {!hasConsultation && (
                 <div>
                   <Link
                     to="/checkout/mentoria-negativa-consular"
                     className="flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98]"
                   >
                     <RiUserVoiceLine className="text-xl" />
                     {t.processDetail.scheduleConsultation.replace('{price}', " ($97)")}
                     <RiArrowRightLine className="text-xl" />
                   </Link>
                   <p className="text-center text-[10px] text-slate-500 mt-4 uppercase font-bold tracking-widest">
                     {t.processDetail.limitedSlots}
                   </p>
                 </div>
               )}
               <Link
                 to={slug.includes("f1") ? "/checkout/visto-f1-reaplicacao" : "/checkout/visto-b1-b2-reaplicacao"}
                 className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-black uppercase tracking-widest transition-all"
               >
                 {t.processDetail.restartProcess}
                 <RiArrowRightLine className="text-xl" />
               </Link>
             </div>
           </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-6 mb-12"
          >
            <div className={`w-16 h-16 rounded-2xl ${cfg?.bg ?? "bg-slate-50"} flex items-center justify-center border border-black/5 shadow-sm`}>
              <Icon className={`text-3xl ${cfg?.icon ?? "text-slate-400"}`} />
            </div>
            <div>
              <h1 className="font-display font-black text-[28px] text-slate-900 leading-tight tracking-tight">
                {t.processDetail.services?.[slug]?.label || cfg?.label || service.title}
              </h1>
              <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mt-1">
                {t.processDetail.services?.[slug]?.category || cfg?.category || "Guia Completo"}
              </p>
            </div>
          </motion.div>

          {/* Steps List */}
          <div className="space-y-4">
            {steps.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isConsular = slug.startsWith("visto-b1-b2") || slug.startsWith("visto-f1");
              // Re-ajuste isCurrent para não fixar no último passo se o processo já estiver COMPLETED (status final de histórico)
              const isCurrent = (idx === currentStepIndex) || (isConsular && idx === (slug.includes("f1") ? 11 : 10) && isFinalized && proc.status !== 'completed');
              // const isLocked = idx > currentStepIndex;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`relative flex items-start gap-5 p-6 rounded-2xl border transition-all ${
                    isCurrent 
                      ? "bg-white border-primary shadow-lg shadow-primary/5 ring-1 ring-primary/20" 
                      : isCompleted
                      ? "bg-slate-50/50 border-slate-100 opacity-80"
                      : "bg-white border-slate-100 opacity-50"
                  }`}
                >
                  <div className="mt-1">
                    {isCompleted ? (
                      <RiCheckboxCircleFill className="text-2xl text-emerald-500" />
                    ) : isCurrent ? (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] text-white font-black shadow-lg shadow-primary/20">
                        {idx + 1}
                      </div>
                    ) : (
                      <RiCheckboxBlankCircleLine className="text-2xl text-slate-200" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-bold uppercase tracking-tight mb-1 ${
                      isCurrent ? "text-primary" : "text-slate-700"
                    }`}>
                      {t.processSteps?.[step.id]?.title || step.title}
                    </h3>
                    <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                      {t.processSteps?.[step.id]?.description || step.description}
                    </p>

                    {/* Show View button for completed steps or for the final preparation step in B1/B2/F1 */}
                    {(((isCompleted || (isConsular && idx === (slug.includes("f1") ? 11 : 10))) && (step.type === "form" || step.type === "upload" || (isConsular && idx === (slug.includes("f1") ? 11 : 10))))) && (
                      <button
                        onClick={() => navigate(`/dashboard/processes/${slug}/onboarding?id=${proc.id}&step=${fullSteps.indexOf(step)}`)}
                        className={`mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                          idx === (slug.includes("f1") ? 11 : 10) && !isCompleted && !isCurrent
                            ? "border-emerald-200 text-emerald-500 hover:bg-emerald-50"
                            : "border-slate-200 text-slate-400 hover:border-primary hover:text-primary bg-white"
                        }`}
                      >
                        {idx === (slug.includes("f1") ? 11 : 10) ? <RiUserStarLine className="text-sm" /> : <RiInformationLine className="text-sm" />}
                        {idx === (slug.includes("f1") ? 11 : 10) ? t.processDetail.prepareForInterview : t.processDetail.viewStep}
                      </button>
                    )}

                    {isCurrent && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-6 rounded-xl bg-slate-50 border border-slate-200"
                      >
                        {/* Consular or COS products: specialized onboarding flow */}
                        {isCOS || slug.startsWith("visto-b1-b2") || slug.startsWith("visto-f1") ? (
                          (step as { type?: string }).type === "admin_action" ? (
                             proc.status === 'active' && stepData.admin_feedback ? (
                               <div className="space-y-4">
                                 <div className="flex items-start gap-3">
                                   <RiErrorWarningLine className="text-red-500 text-xl shrink-0 mt-0.5" />
                                   <p className="text-xs text-red-600 font-bold leading-normal">
                                     {t.processDetail.waitingCorrectionsDesc}
                                   </p>
                                 </div>
                                 <button
                                   onClick={() => {
                                     const actualIdx = fullSteps.indexOf(step);
                                     const targetIdx = step.id === 'b1b2_admin_analysis' ? 0 : (step.type === 'admin_action' ? actualIdx - 1 : actualIdx);
                                     navigate(`/dashboard/processes/${slug}/onboarding?step=${targetIdx}`);
                                   }}
                                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all border-none"
                                 >
                                   <RiPlayFill className="text-lg" />
                                   {t.processDetail.fixProblems}
                                 </button>
                               </div>
                             ) : (
                                <div className="space-y-6">
                                  <div className="flex items-start gap-3">
                                    <RiTimeLine className="text-primary text-xl shrink-0 mt-0.5" />
                                    <p className="text-xs text-slate-600 font-medium leading-normal">
                                      {slug.startsWith("visto-b1-b2") && idx === 6 
                                        ? t.processDetail.accountCreationNoticeDesc
                                        : slug.startsWith("visto-b1-b2") && idx === 8
                                        ? t.processDetail.taxGenerationNoticeDesc
                                        : slug.startsWith("visto-b1-b2") && idx === 10
                                        ? isFinalized 
                                          ? t.processDetail.schedulingConfirmedDesc
                                          : t.processDetail.waitingSchedulingDesc
                                        : t.processDetail.underReviewDesc}
                                    </p>
                                  </div>
                                  {isConsular && idx === (slug.includes("f1") ? 11 : 10) && (
                                    <button
                                      onClick={() => navigate(`/dashboard/processes/${slug}/onboarding?step=${slug.includes("f1") ? 11 : 10}`)}
                                      className="w-full py-3 rounded-xl border-2 border-primary/20 text-primary font-black text-[11px] uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center justify-center gap-2 shadow-sm"
                                    >
                                       <RiBookOpenLine className="text-base" /> {t.processDetail.prepareForInterview}
                                    </button>
                                  )}
                                </div>
                             )
                          ) : (
                            <>
                              <div className="flex items-start gap-3 mb-5">
                                 <RiInformationLine className="text-primary text-xl shrink-0 mt-0.5" />
                                 <p className="text-xs text-slate-600 font-medium leading-normal">
                                    {isConsular && idx === 0 
                                      ? t.processDetail.step0Desc
                                      : slug.includes("f1") && idx === 1 
                                      ? t.processDetail.step1F1Desc
                                      : isConsular && idx === (slug.includes("f1") ? 4 : 3)
                                      ? t.processDetail.stepReviewSignDesc
                                      : isConsular && idx === (slug.includes("f1") ? 6 : 5)
                                      ? t.processDetail.stepCasvDesc
                                      : isConsular && idx === (slug.includes("f1") ? 8 : 7)
                                      ? t.processDetail.stepConfirmEmailDesc
                                      : isConsular && idx === (slug.includes("f1") ? 10 : 9)
                                      ? t.processDetail.stepPaymentDesc
                                      : isConsular && idx === (slug.includes("f1") ? 11 : 10)
                                      ? t.processDetail.stepFinalSchedulingDesc
                                      : t.processDetail.genericStepDesc}
                                 </p>
                               </div>
                              <button
                                onClick={() => {
                                  navigate(`/dashboard/processes/${slug}/onboarding?step=${fullSteps.indexOf(step)}`);
                                }}
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all"
                              >
                                 <RiPlayFill className="text-lg" />
                                 {isConsular && idx === 0 
                                   ? t.processDetail.startStep1 
                                   : slug.includes("f1") && idx === 1
                                   ? t.processDetail.uploadI20
                                   : isConsular && idx === (slug.includes("f1") ? 8 : 7) 
                                   ? t.processDetail.confirmEmail
                                   : isConsular && idx === (slug.includes("f1") ? 10 : 9)
                                   ? t.processDetail.makePayment
                                   : isConsular && idx === (slug.includes("f1") ? 11 : 10)
                                   ? t.processDetail.viewSummons
                                   : t.processDetail.goToStep.replace("{n}", (idx + 1).toString())}
                               </button>
                            </>
                          )
                        ) : (
                          /* All other products: original inline action */
                          <>
                            <div className="flex items-start gap-3 mb-6">
                              <RiInformationLine className="text-primary text-xl shrink-0 mt-0.5" />
                              <p className="text-xs text-slate-600 font-medium leading-normal">
                                {proc.status === "awaiting_review"
                                  ? t.processDetail.awaitingReviewDesc
                                  : t.processDetail.completeStepDesc}
                              </p>
                            </div>
                            <button
                              onClick={handleCompleteStep}
                              disabled={isUpdating || proc.status === "awaiting_review"}
                              className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                                proc.status === "awaiting_review"
                                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                                  : "bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20"
                              }`}
                            >
                              {isUpdating ? (
                                <RiLoader4Line className="animate-spin text-lg" />
                              ) : proc.status === "awaiting_review" ? (
                                <>
                                  <RiTimeLine className="text-lg" />
                                  {t.processDetail.awaitingReview}
                                </>
                              ) : (
                                <>
                                  <RiPlayFill className="text-lg" />
                                  {t.processDetail.completeStep.replace("{n}", (idx + 1).toString())}
                                </>
                              )}
                            </button>
                          </>
                        )}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Status */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-3xl bg-slate-900 text-white shadow-xl"
          >
            <div className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-4">
              {t.processDetail.processStatus}
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className={cn(
                "w-3 h-3 rounded-full animate-pulse",
                isApproved ? "bg-emerald-400" : 
                isDenied ? "bg-red-400" :
                isFinalized ? "bg-emerald-400" : "bg-primary"
              )} />
              <span className={cn(
                "text-lg font-black uppercase tracking-tight",
                isApproved ? "text-emerald-400" :
                isDenied ? "text-red-400" : ""
              )}>
                {isApproved ? t.processDetail.approved : 
                  isDenied ? t.processDetail.denied :
                  proc.status === "active" ? t.processDetail.inProgress : 
                  proc.status === "awaiting_review" ? t.processDetail.inReview : 
                  proc.status === "completed" ? t.processDetail.finalized : proc.status}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t.processDetail.progressLabel}</span>
                <span className={cn(
                  "text-2xl font-black tabular-nums",
                  isApproved ? "text-emerald-400" : isDenied ? "text-red-400" : ""
                )}>
                  {progressPercent}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className={cn(
                    "h-full",
                    isApproved ? "bg-emerald-500" : isDenied ? "bg-red-500" : "bg-primary"
                  )}
                />
              </div>
            </div>
          </motion.div>

          <div className="p-8 rounded-3xl border border-slate-100 bg-white">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-4">{t.processDetail.needHelp}</h4>
            <p className="text-[13px] text-slate-500 font-medium leading-relaxed mb-6">
              {t.processDetail.supportDesc}
            </p>
            <Link
              to="/dashboard/support"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-slate-100 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              {t.processDetail.talkToConsultant}
              <RiArrowRightLine />
            </Link>
          </div>
        </div>
      </div>
      {user && proc && !hasPhoto && (proc.current_step ?? 0) === 0 && (
        <PhotoUploadOverlay
          userId={user.id}
          onSuccess={() => {
            setHasPhoto(true);
            if (refreshAccount) refreshAccount();
          }}
          onClose={() => navigate("/dashboard")}
        />
      )}
    </div>
  );
}
