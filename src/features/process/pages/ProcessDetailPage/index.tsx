import { useState, useEffect, useMemo } from "react";
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
  RiBuilding2Line,
  RiGitBranchLine,
  RiUser3Line,
} from "react-icons/ri";
import { useAuth } from "@shared/hooks/useAuth";
import { calculateProcessProgress } from "@features/process/utils";
import * as processService from "@features/process/services/processOps";
import { getServiceBySlug, isSameService, getServiceSlugs } from "@shared/data/services";
import {
  getCosOnboardingStepTargetFromStepId,
  getCosVisualStepIndexForProcessStep,
  isCosInitialAnalysisStep,
} from "@shared/data/cosWorkflow";
import { supabase } from "@shared/lib/supabase";
import { toast } from "sonner";
import PhotoUploadOverlay from "@shared/components/organisms/PhotoUploadOverlay";
import { cn } from "@shared/utils/cn";
import { useT } from "@app/app/i18n";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { StepConfig } from "@shared/components/templates/ServiceDetailTemplate";
import { MOTION_STEPS_TEMPLATE, RFE_STEPS_TEMPLATE } from "@shared/data/workflowTemplates";
import { Skeleton } from "@shared/components/atoms/skeleton";
import { shouldPromptForIdentityPhoto } from "./identityPhotoPrompt";
import type { UserService } from "@shared/types/process.model";
import { normalizeLegacyFinalShipSteps } from "@shared/utils/legacyWorkflow";

const serviceIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MdLanguage,
  MdSchool,
  MdHistory,
  MdSyncAlt,
};

const slugConfig: Record<string, {
  bg: string; icon: string; gradient: string; label: string; category: string; iconName: string;
}> = {
  "visto-b1-b2": { bg: "bg-sky-50", icon: "text-sky-500", gradient: "from-sky-400 to-sky-600", label: "B1/B2 VISA", category: "TOURISM/BUSINESS", iconName: "MdLanguage" },
  "visto-b1-b2-reaplicacao": { bg: "bg-sky-50", icon: "text-sky-500", gradient: "from-sky-400 to-sky-600", label: "B1/B2 REAPLICAÇÃO", category: "TOURISM/BUSINESS", iconName: "MdLanguage" },
  "visa-b1b2": { bg: "bg-sky-50", icon: "text-sky-500", gradient: "from-sky-400 to-sky-600", label: "B1/B2 VISA", category: "TOURISM/BUSINESS", iconName: "MdLanguage" },
  "visa-b1b2-reaplicacao": { bg: "bg-sky-50", icon: "text-sky-500", gradient: "from-sky-400 to-sky-600", label: "B1/B2 REAPLICAÇÃO", category: "TOURISM/BUSINESS", iconName: "MdLanguage" },
  "visto-f1": { bg: "bg-violet-50", icon: "text-violet-500", gradient: "from-violet-400 to-violet-600", label: "F-1 VISA", category: "STUDENT/ACADEMIC", iconName: "MdSchool" },
  "visto-f1-reaplicacao": { bg: "bg-violet-50", icon: "text-violet-500", gradient: "from-violet-400 to-violet-600", label: "F-1 REAPLICAÇÃO", category: "STUDENT/ACADEMIC", iconName: "MdSchool" },
  "visa-f1": { bg: "bg-violet-50", icon: "text-violet-500", gradient: "from-violet-400 to-violet-600", label: "F-1 VISA", category: "STUDENT/ACADEMIC", iconName: "MdSchool" },
  "extensao-status": { bg: "bg-blue-50", icon: "text-blue-500", gradient: "from-blue-400 to-blue-600", label: "EXTENSÃO STATUS", category: "EXTEND STAY", iconName: "MdHistory" },
  "troca-status": { bg: "bg-indigo-50", icon: "text-indigo-500", gradient: "from-indigo-400 to-indigo-600", label: "TROCA STATUS", category: "CHANGE OF STATUS", iconName: "MdSyncAlt" },
};
function calculatePhaseProgress(proc: UserService, totalSteps: number, isCOS: boolean): number {
  const step = proc.current_step ?? 0;

  if (proc.status === 'completed') return 100;

  const isSpecialVisa = !isCOS && (proc.service_slug?.startsWith("visto-") || proc.service_slug?.startsWith("visa-"));
  const maxProgress = isSpecialVisa ? 95 : 99;
  return Math.min(maxProgress, Math.round((step / (totalSteps || 1)) * 100));
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
  const hasPhotoResolved = hasPhoto || Boolean(user?.passportPhotoUrl || user?.avatarUrl);

  const service = slug ? getServiceBySlug(slug) : null;
  const cfg = slug ? slugConfig[slug] : null;
  const Icon = cfg ? (serviceIconMap[cfg.iconName] ?? MdLanguage) : MdLanguage;

  const { data: proc, isLoading, refetch } = useQuery({
    queryKey: ['process-detail', slug, searchParams.get("id")],
    queryFn: async () => {
      if (!user || !slug) return null;
      let procData: any;
      const idParam = searchParams.get("id");

      if (idParam) {
        const { data, error } = await supabase
          .from("user_services")
          .select("*")
          .eq("id", idParam)
          .single();
        if (error || !data) return null;
        if (data.user_id !== user.id || !isSameService(data.service_slug, slug)) return null;
        procData = data;
      } else {
        const { data } = await supabase
          .from("user_services")
          .select("*")
          .eq("user_id", user.id)
          .in("service_slug", getServiceSlugs(slug))
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        procData = data ?? null;
      }

      // Always try to resolve the office logo: process office_id first, then user's own office
      if (!procData) return null;

      const officeIdToFetch = procData.office_id || user?.officeId;
      if (procData && officeIdToFetch) {
        const { data: officeData } = await supabase
          .from("offices")
          .select("name, logo_url, landing_page_config")
          .eq("id", officeIdToFetch)
          .single();
        if (officeData) {
          procData.officeName = officeData.name;
          procData.officeLogoUrl = officeData.logo_url || (officeData.landing_page_config as any)?.logoUrl;
        }
      }

      return procData;
    },
    enabled: !!user && !!slug,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const childId = searchParams.get("childId");
  const workflowType = searchParams.get("workflowType");
  const { data: childProc } = useQuery({
    queryKey: ["process-child-context", childId, proc?.id],
    enabled: !!user && !!proc?.id && !!childId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_services")
        .select("*")
        .eq("id", childId)
        .maybeSingle();
      if (error || !data) return null;
      if (data.user_id !== user?.id) return null;
      const parentId = String((data.step_data as any)?.parent_process_id || "").trim();
      if (parentId && parentId !== proc?.id) return null;
      return data as UserService;
    },
  });

  const { data: recoveryChildren = [] } = useQuery({
    queryKey: ["process-recovery-children", proc?.id],
    enabled: !!user && !!proc?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_services")
        .select("*")
        .eq("user_id", user!.id)
        .contains("step_data", { parent_process_id: proc!.id })
        .order("created_at", { ascending: false });
      if (error) return [] as UserService[];
      return (data ?? []) as UserService[];
    },
  });
  const dedupedRecoveryChildren = useMemo(() => {
    const seen = new Set<string>();
    return recoveryChildren.filter((child) => {
      const childStepData = (child.step_data || {}) as Record<string, unknown>;
      const flowRaw = String(childStepData.workflow_type || "").toLowerCase();
      const flow =
        flowRaw === "motion" || flowRaw === "rfe"
          ? flowRaw
          : (child.service_slug.toLowerCase().includes("motion") ? "motion" : "rfe");
      const key = `${child.service_slug.toLowerCase()}::${flow}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [recoveryChildren]);

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
        <h1 className="text-2xl font-bold text-text">{t.processDetail.processNotFound}</h1>
        <Link to="/dashboard/processes" className="text-primary font-bold mt-4 inline-block">{t.processDetail.back}</Link>
      </div>
    );
  }

  const isCOS = slug === "troca-status" || slug === "extensao-status";
  const isChildRecoveryView = Boolean(childId && childProc && (workflowType === "motion" || workflowType === "rfe"));
  const currentStepIndexInFull = isChildRecoveryView ? (childProc?.current_step ?? 0) : (proc.current_step ?? 0);
  const processDisplayLabel = isChildRecoveryView
    ? workflowType === "motion"
      ? "Motion"
      : "RFE"
    : (t.processDetail.services?.[slug]?.label || cfg?.label || service.title);
  const processDisplayCategory = isChildRecoveryView
    ? "Recovery Flow"
    : (t.processDetail.services?.[slug]?.category || cfg?.category || "Guia Completo");
  const getOnboardingStepForView = (originalIdx: number, stepId?: string) => {
    if (!isChildRecoveryView) {
      return getCosOnboardingStepTargetFromStepId(originalIdx, stepId || "");
    }
    return workflowType === "motion" ? 19 + originalIdx : 13 + originalIdx;
  };
  const goToOnboardingStep = (originalIdx: number, stepId?: string) => {
    const targetStep = getOnboardingStepForView(originalIdx, stepId);
    const params = new URLSearchParams();
    params.set("id", proc.id);
    params.set("step", String(targetStep));
    if (isChildRecoveryView && childId && workflowType) {
      params.set("childId", childId);
      params.set("workflowType", workflowType);
    }
    navigate(`/dashboard/processes/${slug}/onboarding?${params.toString()}`);
  };

  const stepData = (proc.step_data as any) || {};
  const uscisResult = stepData.uscis_official_result as string;

  // Base steps
  const steps = isChildRecoveryView
    ? [...(workflowType === "motion" ? MOTION_STEPS_TEMPLATE : RFE_STEPS_TEMPLATE)]
    : [...service.steps];

  // Append dynamic cycle steps from step_data.history (parent flow only)
  const history = Array.isArray(stepData.history)
    ? (stepData.history as Array<{ type?: string; steps?: StepConfig[] }>)
    : [];
  if (!isChildRecoveryView) {
    history.forEach((cycle, cIdx) => {
      let baseTemplate = cycle.steps || [];
      if (!baseTemplate.length || !baseTemplate[0]?.id) {
        baseTemplate = cycle.type === 'motion' ? MOTION_STEPS_TEMPLATE : RFE_STEPS_TEMPLATE;
      }
      const template = normalizeLegacyFinalShipSteps(baseTemplate as StepConfig[]);
      template.forEach((s: StepConfig) => {
        steps.push({ ...s, id: `${s.id}_cycle_${cIdx}` });
      });
    });
  }

  // currentStepIndex = position of current_step inside the expanded steps array
  let currentStepIndex = !isChildRecoveryView && isCOS
    ? getCosVisualStepIndexForProcessStep(
        currentStepIndexInFull,
        service.steps.length,
        history,
        steps.length,
      )
    : Math.min(currentStepIndexInFull, Math.max(steps.length - 1, 0));

  // Se o processo está marcado como finalizado E com sucesso, forçamos o índice para o fim
  if (!isChildRecoveryView && proc.status === 'completed') {
    currentStepIndex = steps.length - 1;
  }

  const visibleSteps = steps
    .map((step, originalIdx) => ({ step, originalIdx }))
    .filter(({ step }) => (step as { type?: string }).type !== "admin_action");
  const currentVisibleStepIdx = visibleSteps.findIndex(
    ({ originalIdx }) => originalIdx === currentStepIndex,
  );
  const fallbackVisibleStepIdx = (() => {
    for (let i = visibleSteps.length - 1; i >= 0; i -= 1) {
      if (visibleSteps[i].originalIdx < currentStepIndex) return i;
    }
    return -1;
  })();
  const visibleCurrentIdx =
    currentVisibleStepIdx >= 0 ? currentVisibleStepIdx : fallbackVisibleStepIdx;

  // --- LOGICA DE RESULTADO FINAL (Sincronizada) ---
  const rfeResult = String(stepData.uscis_rfe_result || '').toLowerCase();
  const motionResult = String(stepData.motion_final_result || '').toLowerCase();
  const uscisResultNormalized = String(uscisResult || '').toLowerCase();
  const interviewOutcome = String(stepData.interview_outcome || '').toLowerCase();
  const procStatusNormalized = String(proc.status || '').toLowerCase();

  const childWorkflowLabel = (() => {
    if (workflowType === "motion") return "Motion";
    if (workflowType === "rfe") return "RFE";
    if (childProc?.service_slug?.toLowerCase().includes("motion")) return "Motion";
    if (childProc?.service_slug?.toLowerCase().includes("rfe")) return "RFE";
    return "Recovery";
  })();
  const isDenied = procStatusNormalized === 'rejected' ||
    interviewOutcome === 'rejected' ||
    interviewOutcome === 'denied' ||
    motionResult === 'denied' ||
    motionResult === 'rejected' ||
    rfeResult === 'denied' ||
    rfeResult === 'rejected' ||
    uscisResultNormalized === 'denied' ||
    uscisResultNormalized === 'rejected';

  const isApproved = !isDenied && (
    uscisResultNormalized === 'approved' ||
    rfeResult === 'approved' ||
    motionResult === 'approved' ||
    interviewOutcome === 'approved' ||
    interviewOutcome === 'granted' ||
    (procStatusNormalized === 'completed' && !uscisResultNormalized.includes('denied') && !uscisResultNormalized.includes('rejected'))
  );

  const workflowStatus = String(stepData.workflow_status || '').toLowerCase();
  const isRecovering = ['not_started', 'in_progress', 'rfeinit', 'awaiting_payment', 'awaiting_proposal', 'waitingproposal'].includes(workflowStatus);
  const isUnderAnalysis =
    proc.status === "awaiting_review" ||
    (steps[currentStepIndex] as { type?: string } | undefined)?.type === "admin_action";

  const isFinalized = (procStatusNormalized === 'completed' || isApproved || isDenied) && !isRecovering;
      const progressPercent = isFinalized ? 100 : calculatePhaseProgress(proc, steps.length, isCOS);

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
          to={isChildRecoveryView ? `/dashboard/processes/${slug}?id=${proc.id}` : "/dashboard/processes"}
          className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-text transition-colors"
        >
          <RiArrowLeftLine />
          {t.processDetail.myCases}
        </Link>
      </motion.div>

      {childId && childProc && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
            Recovery Context
          </p>
          <p className="mt-1 text-sm font-bold text-text">
            {childWorkflowLabel} - {childProc.service_slug}
          </p>
        </motion.div>
      )}

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
                  const currentStep = steps[currentIdx];
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

      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-6 mb-12"
          >
            <div className={`w-16 h-16 rounded-2xl ${cfg?.bg ?? "bg-bg-subtle/50"} flex items-center justify-center border border-black/5 shadow-sm overflow-hidden shrink-0`}>
              {(proc as any)?.officeLogoUrl ? (
                <img src={(proc as any).officeLogoUrl} alt={(proc as any).officeName} className="w-full h-full object-contain p-1" />
              ) : (
                <Icon className={`text-3xl ${cfg?.icon ?? "text-text-muted"}`} />
              )}
            </div>
            <div>
              <h1 className="font-display font-black text-[28px] text-text leading-tight tracking-tight">
                {processDisplayLabel}
              </h1>
              <div className="flex items-center flex-wrap gap-2 mt-1">
                <p className="text-[11px] font-bold text-text-muted tracking-widest uppercase">
                  {processDisplayCategory}
                </p>
                {(proc as any)?.officeName && (
                  <>
                    <span className="text-border text-xs">•</span>
                    <p className="text-[11px] font-black text-primary tracking-widest uppercase flex items-center gap-1">
                      <RiBuilding2Line />
                      {(proc as any).officeName}
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Steps List */}
          <div className="space-y-4">
            {visibleSteps.map(({ step, originalIdx }, idx) => {
              const isCompleted = originalIdx < currentStepIndex;
              const isConsular = slug.startsWith("visto-b1-b2") || slug.startsWith("visto-f1") || slug.startsWith("visa-b1b2") || slug.startsWith("visa-f1");
              const isB1B2 = slug.includes("b1-b2") || slug.includes("b1b2");
              const baseStepId = step.id.replace(/_cycle_\d+$/, "").replace(/_final_ship$/, "_end");
              const isCosInitialAnalysisStepCard =
                isCOS && isCosInitialAnalysisStep(baseStepId);
              // Re-ajuste isCurrent para não fixar no último passo se o processo já estiver COMPLETED (status final de histórico)
              const isCurrent = (idx === visibleCurrentIdx) || (isConsular && originalIdx === (slug.includes("f1") ? 11 : 10) && isFinalized && proc.status !== 'completed');
              // const isLocked = idx > currentStepIndex;

              return (

                <motion.div
                  key={`${step.id}-${originalIdx}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`relative flex items-start gap-5 p-6 rounded-2xl border transition-all ${isCurrent
                      ? "bg-card border-primary shadow-lg shadow-primary/5 ring-1 ring-primary/20"
                      : isCompleted
                        ? "bg-bg-subtle/50 border-border opacity-80"
                        : "bg-card border-border opacity-50"
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
                    <h3 className={`text-sm font-bold uppercase tracking-tight mb-1 ${isCurrent ? "text-primary" : "text-text"
                      }`}>
                      {t.processSteps?.[step.id]?.title || step.title}
                    </h3>
                    <p className="text-[13px] text-text-muted font-medium leading-relaxed">
                      {t.processSteps?.[step.id]?.description || step.description}
                    </p>

                    {isCOS &&
                      (isCurrent || isCompleted) &&
                      baseStepId !== "cos_final_package" &&
                      baseStepId !== "eos_final_package" && (
                      <button
                        onClick={() => {
                          goToOnboardingStep(originalIdx, step.id);
                        }}
                        className="mt-3 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-text-muted hover:border-primary hover:text-primary bg-card text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        <RiInformationLine className="text-sm" />
                        Visualizar Step
                      </button>
                    )}

                    {/* Botão de Preparação para Vistos Consulares (Sempre visível se for a etapa final) */}
                    {isConsular && originalIdx === (slug.includes("f1") ? 11 : 10) && (
                      <button
                        onClick={() => navigate(`/dashboard/processes/${slug}/onboarding?id=${proc.id}&step=${originalIdx}`)}
                        className={`mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${isCurrent
                            ? "border-primary text-primary hover:bg-primary/5 shadow-sm"
                            : "border-border text-text-muted hover:border-primary hover:text-primary bg-card"
                          }`}
                      >
                        <RiBookOpenLine className="text-sm" />
                        {t.processDetail.prepareForInterview}
                      </button>
                    )}

                    {/* Show View button for COS motion result step (different logic) */}
                    {(isCurrent && isCOS && baseStepId === "cos_motion_end") && (
                        <button
                          onClick={() => goToOnboardingStep(originalIdx, step.id)}
                          className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-text-muted hover:border-primary hover:text-primary bg-card text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          <RiInformationLine className="text-sm" />
                          Ver resultado
                        </button>
                      )}

                    {isCurrent && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-6 rounded-xl bg-bg-subtle border border-border"
                      >
                        {(() => {
                          const suppressUnderAnalysis =
                            isChildRecoveryView &&
                            (baseStepId === "cos_motion_accept_proposal" || baseStepId === "cos_rfe_accept_proposal");
                          return isUnderAnalysis && !suppressUnderAnalysis;
                        })() && (
                          <div className="mb-5 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-warning">
                              Em análise
                            </p>
                            <p className="mt-1 text-xs font-semibold text-text">
                              Sua etapa foi enviada e está em análise pela equipe responsável.
                            </p>
                          </div>
                        )}

                        {(() => {
                          const suppressUnderAnalysis =
                            isChildRecoveryView &&
                            (baseStepId === "cos_motion_accept_proposal" || baseStepId === "cos_rfe_accept_proposal");
                          if (isUnderAnalysis && !suppressUnderAnalysis) {
                            return (
                              <button
                                onClick={() => {
                                  goToOnboardingStep(originalIdx, step.id);
                                }}
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-card border border-border text-text hover:border-primary hover:text-primary transition-all"
                              >
                                <RiInformationLine className="text-base" />
                                {t.processDetail.viewStep || "Visualizar Etapa"}
                              </button>
                            );
                          }

                          if (isCOS || isConsular) {
                            return (
                              <>
                                <div className="flex items-start gap-3 mb-5">
                                  <RiInformationLine className="text-primary text-xl shrink-0 mt-0.5" />
                                  <p className="text-xs text-text-muted font-medium leading-normal">
                                    {isConsular && originalIdx === 0
                                      ? t.processDetail.step0Desc
                                      : slug.includes("f1") && originalIdx === 1
                                        ? t.processDetail.step1F1Desc
                                        : isConsular && originalIdx === (slug.includes("f1") ? 4 : 3)
                                          ? t.processDetail.stepReviewSignDesc
                                          : isConsular && originalIdx === (slug.includes("f1") ? 6 : 5)
                                            ? t.processDetail.stepCasvDesc
                                            : isConsular && originalIdx === (slug.includes("f1") ? 8 : 7)
                                              ? t.processDetail.stepConfirmEmailDesc
                                              : isConsular && originalIdx === (slug.includes("f1") ? 10 : 9)
                                                ? t.processDetail.stepPaymentDesc
                                                : isConsular && originalIdx === (slug.includes("f1") ? 11 : 10)
                                                  ? t.processDetail.stepFinalSchedulingDesc
                                                  : t.processDetail.genericStepDesc}
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    goToOnboardingStep(originalIdx, step.id);
                                  }}
                                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all"
                                >
                                  <RiPlayFill className="text-lg" />
                                  {isConsular && originalIdx === 0
                                    ? t.processDetail.startStep1
                                    : slug.includes("f1") && originalIdx === 1
                                      ? t.processDetail.uploadI20
                                      : isConsular && originalIdx === (slug.includes("f1") ? 8 : 7)
                                        ? t.processDetail.confirmEmail
                                        : isConsular && originalIdx === (slug.includes("f1") ? 10 : 9)
                                          ? t.processDetail.makePayment
                                          : isConsular && originalIdx === (slug.includes("f1") ? 11 : 10)
                                            ? t.processDetail.viewSummons
                                            : t.processDetail.goToStep.replace("{n}", (idx + 1).toString())}
                                </button>
                              </>
                            );
                          }

                          return (
                            <>
                              <div className="flex items-start gap-3 mb-6">
                                <RiInformationLine className="text-primary text-xl shrink-0 mt-0.5" />
                                <p className="text-xs text-text-muted font-medium leading-normal">
                                  {proc.status === "awaiting_review"
                                    ? t.processDetail.awaitingReviewDesc
                                    : t.processDetail.completeStepDesc}
                                </p>
                              </div>
                              <button
                                onClick={handleCompleteStep}
                                disabled={isUpdating || proc.status === "awaiting_review"}
                                className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${proc.status === "awaiting_review"
                                    ? "bg-border/30 text-text-muted cursor-not-allowed"
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
                          );
                        })()}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
            {!isChildRecoveryView && dedupedRecoveryChildren.length > 0 && (
              <div className="rounded-2xl border border-border bg-bg-subtle p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-text-muted">
                  Recovery Products
                </p>
                <div className="mt-3 space-y-2">
                  {dedupedRecoveryChildren.map((child) => {
                    const childStepData = (child.step_data || {}) as Record<string, unknown>;
                    const childFlow = String(
                      childStepData.workflow_type ||
                      (child.service_slug.toLowerCase().includes("motion") ? "motion" : "rfe"),
                    ).toLowerCase();
                    const childService = getServiceBySlug(child.service_slug);
                    const childCurrentStep = Math.max(0, Number(child.current_step ?? 0));
                    const childStepType = childService?.steps?.[childCurrentStep]?.type;
                    const needsCustomerAction = child.status === "active" && (childStepType === "form" || childStepType === "upload");
                    const motionResult = String(childStepData.motion_final_result || "").toLowerCase();
                    const rfeResult = String(childStepData.uscis_rfe_result || childStepData.rfe_final_result || "").toLowerCase();
                    const isRejected =
                      motionResult === "rejected" ||
                      motionResult === "denied" ||
                      rfeResult === "rejected" ||
                      rfeResult === "denied";
                    const isApproved =
                      !isRejected && (motionResult === "approved" || rfeResult === "approved");
                    const statusLabel = isApproved ? "Aprovado" : isRejected ? "Reprovado" : "Em andamento";
                    const statusClass = isApproved
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : isRejected
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-amber-50 text-amber-700 border-amber-200";

                    return (
                      <button
                        key={child.id}
                        onClick={() => {
                          navigate(
                            `/dashboard/processes/${slug}?id=${proc.id}&childId=${child.id}&workflowType=${childFlow}`,
                          );
                        }}
                        className="w-full flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-left hover:border-primary/40 hover:bg-primary/5 transition-all"
                      >
                        <div>
                          <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-text">
                            <RiGitBranchLine className="text-primary" />
                            {childFlow === "motion" ? "Motion" : "RFE"}
                          </p>
                          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                            {child.service_slug}
                          </p>
                          <span className={`mt-2 inline-flex rounded-lg border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${statusClass}`}>
                            {statusLabel}
                          </span>
                          {needsCustomerAction && (
                            <span className="ml-2 mt-2 inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-primary">
                              <RiUser3Line className="text-[10px]" />
                              Sua ação
                            </span>
                          )}
                        </div>
                        <RiArrowRightLine className="text-text-muted" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Status */}
        <div className="space-y-6">
          {!isChildRecoveryView && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 rounded-3xl border border-border bg-card text-text shadow-xl"
            >
              <div className="text-[10px] font-black text-text-muted tracking-widest uppercase mb-4">
                {t.processDetail.processStatus}
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className={cn(
                  "w-3 h-3 rounded-full animate-pulse",
                  isApproved ? "bg-success" :
                    isDenied ? "bg-danger" :
                      isFinalized ? "bg-success" : "bg-primary"
                )} />
                <span className={cn(
                  "text-lg font-black uppercase tracking-tight",
                  isApproved ? "text-success" :
                    isDenied ? "text-danger" : "text-primary"
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
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest">{t.processDetail.progressLabel}</span>
                  <span className={cn(
                    "text-2xl font-black tabular-nums",
                    isApproved ? "text-success" : isDenied ? "text-danger" : "text-primary"
                  )}>
                    {progressPercent}%
                  </span>
                </div>
                <div className="h-2 w-full bg-bg-subtle rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className={cn(
                      "h-full",
                      isApproved ? "bg-success" : isDenied ? "bg-danger" : "bg-primary"
                    )}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {(() => {
            const stepData = (proc.step_data || {}) as Record<string, unknown>;
            const purchases = Array.isArray(stepData.purchases)
              ? (stepData.purchases as Array<{ slug?: string }>)
              : [];
            const hasPaidProposal = purchases.some(p =>
              p.slug === "analysis-rfe-cos" ||
              p.slug === "analysis-rfe-eos" ||
              p.slug === "consultancy-motion-cos" ||
              p.slug === "consultancy-motion-eos" ||
              p.slug === "proposta-rfe-motion" ||
              p.slug === "apoio-rfe-motion-inicio" ||
              p.slug === "analise-rfe-cos" ||
              p.slug === "apoio-rfe-cos" ||
              p.slug === "analise-especialista-cos" ||
              p.slug === "analise-especialista-rfe"
            );

            if (!hasPaidProposal) return null;

            return (
              <div className="p-8 rounded-3xl border border-border bg-card">
                <h4 className="text-sm font-black text-text uppercase tracking-tight mb-4">{t.processDetail.needHelp}</h4>
                <p className="text-[13px] text-text-muted font-medium leading-relaxed mb-6">
                  {t.processDetail.supportDesc}
                </p>
                <Link
                  to="/dashboard/support"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-border text-text-muted font-black text-xs uppercase tracking-widest hover:bg-bg-subtle/50 transition-all"
                >
                  {t.processDetail.talkToConsultant}
                  <RiArrowRightLine />
                </Link>
              </div>
            );
          })()}
        </div>
      </div>
      {user && proc && !hasPhotoResolved && (proc.current_step ?? 0) === 0 && (
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
