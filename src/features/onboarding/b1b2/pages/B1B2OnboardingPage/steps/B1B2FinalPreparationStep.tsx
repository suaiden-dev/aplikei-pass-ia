import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiBookOpenLine,
  RiRobotLine,
  RiUserStarLine,
  RiArrowRightLine,
  RiCheckLine,
  RiCalendarCheckLine,
  RiInformationLine,
  RiLoader4Line,
  RiCloseLine,
  RiSendPlane2Fill,
  RiHistoryLine,
} from "react-icons/ri";
import { toast } from "sonner";
import { InlineWidget, useCalendlyEventListener } from "react-calendly";
import { useAuth } from "@shared/hooks/useAuth";
import { supabase } from "@shared/lib/supabase";
import { useT, useLocale } from "@app/app/i18n";
import { useInterviewTrainingController } from "@features/onboarding/hooks/useInterviewTrainingController";
import { getCanonicalSlug } from "@shared/data/services";

interface B1B2FinalPreparationStepProps {
  procId: string;
  stepData: Record<string, unknown>;
  onComplete: () => void;
}

type PreparationModule = "guide" | "ai" | "specialist";

function extractProcessPurchaseSlugs(stepData: Record<string, unknown> | null): Set<string> {
  const purchases = Array.isArray(stepData?.purchases)
    ? (stepData?.purchases as Array<Record<string, unknown>>)
    : [];

  const slugs = new Set<string>();
  purchases.forEach((purchase) => {
    const candidates = [
      purchase.slug,
      purchase.service_slug,
      purchase.product_slug,
      purchase.productSlug,
      purchase.serviceSlug,
    ];
    candidates.forEach((candidate) => {
      const raw = String(candidate || "").trim();
      if (!raw) return;
      slugs.add(raw);
      slugs.add(getCanonicalSlug(raw));
    });
  });
  return slugs;
}

export function B1B2FinalPreparationStep({ procId, stepData, onComplete }: B1B2FinalPreparationStepProps) {
  const t = useT("visas");
  const { lang } = useLocale();
  const [activeModule, setActiveModule] = useState<PreparationModule | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fresh Data State
  const [freshStepData, setFreshStepData] = useState<Record<string, unknown>>(stepData);
  const [isAdminConfirmed, setIsAdminConfirmed] = useState(false);

  // Mentorship State
  const [purchasedMentorship, setPurchasedMentorship] = useState<Record<string, unknown> | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [calendlyUrl, setCalendlyUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [planPrices, setPlanPrices] = useState<Record<string, number>>({});

  // Consultation State
  const [purchasedConsultation, setPurchasedConsultation] = useState<Record<string, unknown> | null>(null);
  const [hasConsultationInCurrentProcess, setHasConsultationInCurrentProcess] = useState(false);

  const {
    messages: chatMessages,
    input: chatInput,
    setInput: setChatInput,
    isSending: isBotTyping,
    scrollRef,
    sendMessage: handleSendChatMessage,
  } = useInterviewTrainingController({
    initialMessage: t.onboardingPage.aiInterviewChat.initialMessage,
    processId: procId,
    userId: user?.id,
    lang,
    ds160: freshStepData,
    visaType: "B1/B2",
    errorMessage: t.onboardingPage.aiInterviewChat.errorConnecting,
  });

  useEffect(() => {
    async function checkMentorship() {
      if (!user || !procId) return;
      const mentorshipSlugs = [
        "mentoring-bronze",
        "mentoring-silver",
        "mentoring-gold",
        "mentoria-individual",
        "mentoria-bronze",
        "mentoria-silver",
        "mentoria-gold",
        "consultoria-especialista",
      ];
      const consultationSlugs = ["consultancy-negative-b1b2", "mentoria-negativa-consular"];

      setPurchasedMentorship(null);
      setPurchasedConsultation(null);
      setHasConsultationInCurrentProcess(false);

      // Query mentorship globally under user
      const { data: activeMentorship } = await supabase
        .from("user_services")
        .select("*")
        .eq("user_id", user.id)
        .in("service_slug", mentorshipSlugs)
        .neq("status", "cancelled")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (activeMentorship) {
        setPurchasedMentorship(activeMentorship);
      }
      let mentorshipData = (activeMentorship as Record<string, unknown> | null) ?? null;
      if (!mentorshipData) {
        const { data } = await supabase
          .from("user_services")
          .select("*")
          .eq("user_id", user.id)
          .in("service_slug", mentorshipSlugs)
          .neq("status", "cancelled")
          .contains("step_data", { parent_process_id: procId })
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        mentorshipData = (data as Record<string, unknown> | null) ?? null;
      }
      if (mentorshipData) setPurchasedMentorship(mentorshipData);

      // Query active consultation globally under user
      const { data: activeConsultation } = await supabase
        .from("user_services")
        .select("*")
        .eq("user_id", user.id)
        .in("service_slug", consultationSlugs)
        .neq("status", "cancelled")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (activeConsultation) {
        setPurchasedConsultation(activeConsultation);
        setHasConsultationInCurrentProcess(true);
      } else {
        const { data: currentProcess } = await supabase
          .from("user_services")
          .select("step_data")
          .eq("id", procId)
          .maybeSingle();

        const processStepData = (currentProcess?.step_data as Record<string, unknown> | null) ?? null;
        const purchaseSlugs = extractProcessPurchaseSlugs(processStepData);
        const hasConsultationInProcess = consultationSlugs.some((slug) => purchaseSlugs.has(slug) || purchaseSlugs.has(getCanonicalSlug(slug)));
        setHasConsultationInCurrentProcess(hasConsultationInProcess);
      }
    }

    async function loadFreshData() {
      if (!procId) return;
      try {
        const { data, error } = await supabase
          .from("user_services")
          .select("step_data")
          .eq("id", procId)
          .single();

        if (!error && data?.step_data) {
          const sd = data.step_data as Record<string, unknown>;
          setFreshStepData(sd);
          if (sd.final_casv_date || sd.final_scheduling_notified_at) {
            setIsAdminConfirmed(true);
          }
        }
      } catch (err) {
        console.error("[B1B2FinalPreparationStep] Error loading fresh data:", err);
      }
    }

    checkMentorship();
    loadFreshData();
  }, [user, procId]);

  useEffect(() => {
    async function loadPlanPrices() {
      if (!user?.officeId) return;

      const slugsToResolve = [
        "mentoring-bronze",
        "mentoring-silver",
        "mentoring-gold",
        "mentoria-individual",
        "mentoria-bronze",
        "mentoria-silver",
        "mentoria-gold",
        "consultancy-negative-b1b2",
        "mentoria-negativa-consular",
      ];

      const { data: services } = await supabase
        .from("services")
        .select("id, slug")
        .in("slug", slugsToResolve);

      if (!services?.length) return;

      const serviceIds = services.map((s) => s.id);
      const { data: officePrices } = await supabase
        .from("user_service_prices")
        .select("service_id, price, is_active")
        .eq("office_id", user.officeId)
        .in("service_id", serviceIds)
        .or("is_active.is.true,is_active.is.null");

      if (!officePrices?.length) return;

      const slugById = new Map(services.map((s) => [s.id, s.slug]));
      const priceBySlug = new Map<string, number>();
      officePrices.forEach((row) => {
        const slug = slugById.get(row.service_id);
        if (slug) priceBySlug.set(slug, Number(row.price));
      });

      setPlanPrices({
        "mentoring-bronze":
          priceBySlug.get("mentoring-bronze") ??
          priceBySlug.get("mentoria-individual") ??
          197,
        "mentoring-silver":
          priceBySlug.get("mentoring-silver") ??
          priceBySlug.get("mentoria-bronze") ??
          priceBySlug.get("mentoria-silver") ??
          397,
        "mentoring-gold":
          priceBySlug.get("mentoring-gold") ??
          priceBySlug.get("mentoria-gold") ??
          697,
        "mentoria-negativa-consular":
          priceBySlug.get("consultancy-negative-b1b2") ??
          priceBySlug.get("mentoria-negativa-consular") ?? 97,
      });
    }

    loadPlanPrices();
  }, [user?.officeId]);

  // Mentoria now starts via support chat with manager, so no Calendly lookup here.

  useCalendlyEventListener({
    onEventScheduled: async () => {
      if (!purchasedMentorship || !isScheduling) return;
      const stepData = (purchasedMentorship.step_data as Record<string, unknown>) || {};
      const nextCount = ((stepData.scheduled_count as number) || 0) + 1;
      const { error } = await supabase
        .from("user_services")
        .update({
          step_data: {
            ...stepData,
            scheduled_count: nextCount
          }
        })
        .eq("id", purchasedMentorship.id);

      if (!error) {
        setPurchasedMentorship({
          ...purchasedMentorship,
          step_data: { ...stepData, scheduled_count: nextCount }
        });
        toast.success(t.onboardingPage.specialistTraining.sessionScheduledToast);
        setIsScheduling(false);
      }
    },
  });

  const interviewOutcome = freshStepData?.interview_outcome as string | undefined;
  const isDenied = interviewOutcome === 'rejected' || interviewOutcome === 'denied';

  const basePlans = [
    { id: "mentoring-bronze", name: t.onboardingPage.specialistTraining.bronzePackage, price: planPrices["mentoring-bronze"] ?? 197, interviews: 1, features: [t.onboardingPage.specialistTraining.trainingSession, t.onboardingPage.specialistTraining.interviewSim] },
    { id: "mentoring-silver", name: t.onboardingPage.specialistTraining.silverPackage, price: planPrices["mentoring-silver"] ?? 397, interviews: 2, features: [t.onboardingPage.specialistTraining.sessions2Training, t.onboardingPage.specialistTraining.deepProfileAnalysis, t.onboardingPage.specialistTraining.immediateFeedback] },
    { id: "mentoring-gold", name: t.onboardingPage.specialistTraining.goldPackage, price: planPrices["mentoring-gold"] ?? 697, interviews: 3, features: [t.onboardingPage.specialistTraining.sessions3Training, t.onboardingPage.specialistTraining.vipSupport, t.onboardingPage.specialistTraining.responseStrategy], best: !isDenied },
  ];

  const negativePlan = {
    id: "consultancy-negative-b1b2",
    name: t.onboardingPage.specialistTraining.reviewTopic,
    price: planPrices["mentoria-negativa-consular"] ?? 97,
    interviews: 1,
    features: [
      t.onboardingPage.specialistTraining.detailedRefusalAnalysis,
      t.onboardingPage.specialistTraining.specialistMentoring45,
      t.onboardingPage.specialistTraining.customActionPlan
    ],
    best: isDenied
  };

  const PLANS = isDenied ? [negativePlan, ...basePlans] : basePlans;

  const handleSelectPlan = (plan: typeof PLANS[0]) => {
    const query = new URLSearchParams();
    if (user?.officeId) query.set("office_id", user.officeId);
    if (procId) query.set("proc_id", procId);
    navigate(`/checkout/${plan.id}${query.toString() ? `?${query.toString()}` : ""}`);
  };

  const [isLoadingChat, setIsLoadingChat] = useState(false);

  const handleOpenSpecialistSupport = async () => {
    if (isLoadingChat) return;
    if (!user?.id || !purchasedMentorship?.id) {
      navigate("/dashboard/support");
      return;
    }

    setIsLoadingChat(true);
    try {
      const processId = String(purchasedMentorship.id);

      // 1. Tenta buscar conversa ativa existente
      const { data: active } = await supabase
        .from("conversations")
        .select("id")
        .eq("process_id", processId)
        .eq("is_closed", false)
        .maybeSingle();

      let conversationId = active?.id;

      // 2. Se não existir, cria a nova conversa
      if (!conversationId) {
        const { data: created, error: createError } = await supabase
          .from("conversations")
          .insert({
            process_id: processId,
            customer_id: user.id,
            office_id: purchasedMentorship?.office_id ?? user.officeId ?? null,
            is_closed: false,
          })
          .select("id")
          .single();

        if (createError) throw createError;
        conversationId = created?.id;
      }

      // 3. Verifica se já existem mensagens na conversa
      const { count } = await supabase
        .from("conversation_messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", conversationId);

      // 4. Insere a mensagem inicial caso não haja histórico
      if ((count ?? 0) === 0) {
        await supabase.from("conversation_messages").insert({
          conversation_id: conversationId,
          content: "Olá, comprei o pacote Specialist Mentoring e quero iniciar meu atendimento com o manager.",
          sender_id: user.id,
          sender_role: "customer",
          created_at: new Date().toISOString(),
        });
      }

      navigate(`/dashboard/support?processId=${processId}`);
    } catch (err) {
      console.error("[B1B2] open support chat failed:", err);
      navigate("/dashboard/support");
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleOpenConsultationSupport = async () => {
    if (isLoadingChat) return;
    if (!user?.id) {
      navigate("/dashboard/support");
      return;
    }

    setIsLoadingChat(true);
    try {
      const processId = String(purchasedConsultation?.id ?? procId);

      // 1. Tenta buscar conversa ativa existente
      const { data: active } = await supabase
        .from("conversations")
        .select("id")
        .eq("process_id", processId)
        .eq("is_closed", false)
        .maybeSingle();

      let conversationId = active?.id;

      // 2. Se não existir, cria a nova conversa
      if (!conversationId) {
        const { data: created, error: createError } = await supabase
          .from("conversations")
          .insert({
            process_id: processId,
            customer_id: user.id,
            office_id: purchasedConsultation?.office_id ?? user.officeId ?? null,
            is_closed: false,
          })
          .select("id")
          .single();

        if (createError) throw createError;
        conversationId = created?.id;
      }

      // 3. Verifica se já existem mensagens na conversa
      const { count } = await supabase
        .from("conversation_messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", conversationId);

      // 4. Insere a mensagem inicial caso não haja histórico
      if ((count ?? 0) === 0) {
        await supabase.from("conversation_messages").insert({
          conversation_id: conversationId,
          content: "Olá, comprei a consultoria pós-negativa e quero iniciar meu atendimento com o manager.",
          sender_id: user.id,
          sender_role: "customer",
          created_at: new Date().toISOString(),
        });
      }

      navigate(`/dashboard/support?processId=${processId}`);
    } catch (err) {
      console.error("[B1B2] open consultation support chat failed:", err);
      navigate("/dashboard/support");
    } finally {
      setIsLoadingChat(false);
    }
  };


  const purchaseSlugs = extractProcessPurchaseSlugs(freshStepData);
  const hasMentorshipInPurchases = Array.from(purchaseSlugs).some(s =>
    [
      "mentoring-bronze",
      "mentoring-silver",
      "mentoring-gold",
      "mentoria-individual",
      "mentoria-bronze",
      "mentoria-silver",
      "mentoria-gold",
      "consultoria-especialista"
    ].includes(s)
  );

  const hasMentorship = !!purchasedMentorship || hasMentorshipInPurchases;

  const purchasedMentorshipSlug = purchasedMentorship?.service_slug as string | undefined || Array.from(purchaseSlugs).find(s =>
    [
      "mentoring-bronze",
      "mentoring-silver",
      "mentoring-gold",
      "mentoria-individual",
      "mentoria-bronze",
      "mentoria-silver",
      "mentoria-gold",
      "consultoria-especialista"
    ].includes(s)
  );

  const scheduledCount = ((purchasedMentorship?.step_data as Record<string, unknown>)?.scheduled_count as number | undefined) || 0;
  const totalInterviews =
    purchasedMentorshipSlug === "mentoring-gold" || purchasedMentorshipSlug === "mentoria-gold"
      ? 3
      : purchasedMentorshipSlug === "mentoring-silver" ||
        purchasedMentorshipSlug === "mentoria-silver" ||
        purchasedMentorshipSlug === "mentoria-bronze"
        ? 2
        : 1;

  const casvDate = freshStepData?.final_casv_date as string;
  const consuladoDate = freshStepData?.final_consulado_date as string;
  const isAwaitingAdmin = !isAdminConfirmed && !casvDate;

  // New Interview Result Logic
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const isInterviewDayOrPast = (casvDate && casvDate <= todayStr) || (consuladoDate && consuladoDate <= todayStr);
  const alreadyReported = !!freshStepData?.interview_outcome;

  const handleReportOutcome = async (outcome: 'approved' | 'rejected') => {
    try {
      setLoading(true);
      const outcomeStatus = outcome === 'approved' ? 'completed' : 'rejected';

      const { error } = await supabase
        .from('user_services')
        .update({
          status: outcomeStatus,
          step_data: {
            ...(freshStepData || {}),
            interview_outcome: outcome,
            reported_at: new Date().toISOString()
          }
        })
        .eq('id', procId);

      if (error) throw error;

      setFreshStepData(prev => ({
        ...prev,
        interview_outcome: outcome,
        reported_at: new Date().toISOString()
      }));

      toast.success(outcome === 'approved' ? t.onboardingPage.processingStatus.outcomeApproved : t.onboardingPage.processingStatus.outcomeRejected);

      if (outcome === 'approved') {
        onComplete();
      }
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const preparationGrid = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
      <button
        onClick={() => setActiveModule("guide")}
        className="p-6 rounded-3xl bg-bg-subtle border border-border hover:border-primary transition-all text-left flex flex-col gap-3 group"
      >
        <RiBookOpenLine className="text-2xl text-text-muted group-hover:text-primary transition-colors" />
        <span className="text-[10px] font-black uppercase tracking-widest text-text">{t.onboardingPage.awaitingInterview.tools.guide.title}</span>
      </button>
      <button
        onClick={() => setActiveModule("ai")}
        className="p-6 rounded-3xl bg-bg-subtle border border-border hover:border-primary transition-all text-left flex flex-col gap-3 group"
      >
        <RiRobotLine className="text-2xl text-text-muted group-hover:text-primary transition-colors" />
        <span className="text-[10px] font-black uppercase tracking-widest text-text">{t.onboardingPage.awaitingInterview.tools.ai.title}</span>
      </button>
      <button
        onClick={() => hasMentorship ? handleOpenSpecialistSupport() : setActiveModule("specialist")}
        className={`p-6 rounded-3xl border transition-all text-left flex flex-col gap-3 group relative overflow-hidden ${hasMentorship ? "bg-emerald-50 border-emerald-100 hover:border-emerald-300" : "bg-bg-subtle border-border hover:border-primary"
          }`}
      >
        {hasMentorship ? (
          <>
            <RiCalendarCheckLine className="text-2xl text-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800">
              Falar com especialista
            </span>
            <div className="mt-1 flex gap-1">
              {[...Array(totalInterviews)].map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i < scheduledCount ? "bg-emerald-500" : "bg-emerald-200"}`} />
              ))}
            </div>
          </>
        ) : (
          <>
            <RiUserStarLine className="text-2xl text-text-muted group-hover:text-primary transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-widest text-text">{t.onboardingPage.awaitingInterview.tools.specialist.title}</span>
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">      {isAwaitingAdmin && (
      <div className="p-8 bg-primary/5 border border-primary/10 rounded-[40px] text-center space-y-4 shadow-xl shadow-primary/5 animate-in slide-in-from-top-4 duration-500">
        <div className="w-12 h-12 bg-card text-primary rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <RiLoader4Line className="text-2xl animate-spin" />
        </div>
        <div>
          <h2 className="text-xl font-black text-text uppercase tracking-tight">{t.onboardingPage.awaitingInterview.awaitingFinalScheduling}</h2>
          <p className="text-xs text-text-muted font-medium max-w-sm mx-auto mt-1">
            {t.onboardingPage.awaitingInterview.awaitingFinalSchedulingDesc}
          </p>
        </div>
      </div>
    )}

      {/* Main Tools Section - Always Visible */}
      <div className="bg-card p-12 rounded-[40px] border border-border shadow-xl shadow-border/10">
        <div className="text-center mb-10">
          <h3 className="text-2xl font-black text-text uppercase tracking-tight">{t.onboardingPage.awaitingInterview.preparationResources}</h3>
          <p className="text-sm text-text-muted font-medium max-w-md mx-auto mt-2">
            {t.onboardingPage.awaitingInterview.preparationResourcesDesc}
          </p>
        </div>
        {preparationGrid}
      </div>

      {!isAwaitingAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CASV/CONSULATE DATES DETAILS (Original content moved here) */}
          <div className="bg-card p-8 rounded-[40px] border border-border shadow-xl shadow-border/10 relative overflow-hidden">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center">
                <RiInformationLine className="text-2xl" />
              </div>
              <div>
                <h3 className="text-xs font-black text-text-muted uppercase tracking-widest">{t.onboardingPage.awaitingInterview.casv}</h3>
                <p className="text-lg font-black text-text">{new Date(casvDate + "T12:00:00").toLocaleDateString(lang === "pt" ? "pt-BR" : lang === "es" ? "es-ES" : "en-US", { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
              <div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{t.onboardingPage.awaitingInterview.time}</p>
                <p className="text-sm font-bold text-text">{freshStepData.final_casv_time as string}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{t.onboardingPage.awaitingInterview.location}</p>
                <p className="text-sm font-bold text-text leading-tight">{freshStepData.final_casv_location as string}</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-8 rounded-[40px] border border-border shadow-xl shadow-border/10 relative overflow-hidden">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center">
                <RiCalendarCheckLine className="text-2xl" />
              </div>
              <div>
                <h3 className="text-xs font-black text-text-muted uppercase tracking-widest">{t.onboardingPage.awaitingInterview.consulate}</h3>
                <p className="text-lg font-black text-text">{new Date(consuladoDate + "T12:00:00").toLocaleDateString(lang === "pt" ? "pt-BR" : lang === "es" ? "es-ES" : "en-US", { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
              <div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{t.onboardingPage.awaitingInterview.time}</p>
                <p className="text-sm font-bold text-text">{freshStepData.final_consulado_time as string}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{t.onboardingPage.awaitingInterview.location}</p>
                <p className="text-sm font-bold text-text leading-tight">{freshStepData.final_consulado_location as string}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Outcome Section if applicable */}
      {isInterviewDayOrPast && (
        <div className="p-10 bg-bg-subtle rounded-[40px] text-center space-y-8 shadow-2xl border border-primary/20 relative overflow-hidden group">
          {/* outcome logic remains as it was inside this block */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

          {/* Lógica de Telas Pós-Resultado */}
          {alreadyReported ? (
            <div className="animate-in fade-in zoom-in duration-500 space-y-8">
              {freshStepData.interview_outcome === 'approved' ? (
                <div className="space-y-6">
                  <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                    <RiCheckLine className="text-5xl" />
                  </div>
                  <h4 className="text-3xl font-black text-text uppercase tracking-tight">{t.onboardingPage.processingStatus.outcomeApproved}</h4>
                  <p className="text-text-muted font-medium max-w-sm mx-auto">{t.onboardingPage.processingStatus.outcomeApprovedDesc}</p>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full h-14 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl"
                  >
                    {t.onboardingPage.processingStatus.backToStart}
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="w-20 h-20 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RiCloseLine className="text-4xl" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-black text-white uppercase tracking-tight">{t.onboardingPage.processingStatus.outcomeRejected}</h4>
                    <p className="text-sm text-text-muted font-medium max-w-sm mx-auto">{t.onboardingPage.processingStatus.outcomeRejectedDesc}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 pt-4">
                    <button
                      onClick={() => navigate(`/checkout/visa-b1b2${user?.officeId ? `?office_id=${user.officeId}` : ""}`)}
                      className="p-6 bg-card border border-border rounded-3xl text-left hover:border-primary transition-all group/opt relative overflow-hidden"
                    >
                      <div className="relative z-10">
                        <h5 className="text-text font-black uppercase text-xs tracking-widest mb-1 group-hover/opt:text-primary transition-colors">{t.onboardingPage.processingStatus.restartProcess}</h5>
                        <p className="text-[10px] text-text-muted font-medium leading-relaxed">{t.onboardingPage.processingStatus.restartProcessDesc}</p>
                      </div>
                      <RiArrowRightLine className="absolute right-6 top-1/2 -translate-y-1/2 text-text-muted group-hover/opt:text-primary group-hover/opt:translate-x-1 transition-all" />
                    </button>

                    {(hasConsultationInCurrentProcess || purchasedConsultation) ? (
                      <button
                        onClick={handleOpenConsultationSupport}
                        className="p-6 bg-emerald-500/20 border border-emerald-500/30 rounded-3xl text-left hover:bg-emerald-500/30 transition-all group/opt relative overflow-hidden"
                      >
                        <div className="relative z-10 flex justify-between items-center">
                          <div>
                            <h5 className="text-emerald-400 font-black uppercase text-xs tracking-widest mb-1">{t.onboardingPage.processingStatus.consultationActive}</h5>
                            <p className="text-[10px] text-emerald-100/70 font-medium leading-relaxed">{t.onboardingPage.processingStatus.consultationActiveDesc}</p>
                          </div>
                          <RiCalendarCheckLine className="text-4xl text-emerald-400/50" />
                        </div>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const query = new URLSearchParams();
                          if (user?.officeId) query.set("office_id", user.officeId);
                          if (procId) query.set("proc_id", procId);
                          navigate(`/checkout/consultancy-negative-b1b2${query.toString() ? `?${query.toString()}` : ""}`);
                        }}
                        className="p-6 bg-primary/5 border border-primary/20 rounded-3xl text-left hover:bg-primary/10 transition-all group/opt relative overflow-hidden"
                      >
                        <div className="relative z-10">
                          <h5 className="text-primary font-black uppercase text-xs tracking-widest mb-1">{t.onboardingPage.processingStatus.consultationSpecialist}</h5>
                          <p className="text-[10px] text-text-muted font-medium leading-relaxed">{t.onboardingPage.processingStatus.consultationSpecialistDesc}</p>
                        </div>
                        <div className="absolute top-4 right-4 bg-primary text-[8px] font-black px-2 py-0.5 rounded-full text-white uppercase tracking-tighter">Recomendado</div>
                        <RiArrowRightLine className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/40 group-hover/opt:text-primary group-hover/opt:translate-x-1 transition-all" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => navigate('/dashboard')}
                    className="text-[10px] font-black text-text-muted uppercase tracking-widest hover:text-primary transition-colors"
                  >
                    {t.onboardingPage.processingStatus.backToStart}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <h4 className="text-2xl font-black text-text uppercase tracking-tight mb-2">{t.onboardingPage.processingStatus.theBigDay}</h4>
                <p className="text-sm text-text-muted font-medium max-w-md mx-auto leading-relaxed">
                  {t.onboardingPage.processingStatus.howWasOutcome}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 relative">
                <button
                  disabled={loading}
                  onClick={() => handleReportOutcome('approved')}
                  className="h-16 bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                >
                  {loading ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> {t.onboardingPage.processingStatus.iWasApproved}</>}
                </button>
                <button
                  disabled={loading}
                  onClick={() => handleReportOutcome('rejected')}
                  className="h-16 bg-bg-subtle text-text border border-border rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-bg-subtle/80 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                >
                  {loading ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCloseLine className="text-xl" /> {t.onboardingPage.processingStatus.iWasRefused}</>}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {activeModule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-card md:bg-bg/60 md:backdrop-blur-md overflow-hidden"
          >
            <div className="bg-card w-full h-full md:h-auto md:max-w-2xl md:rounded-[40px] shadow-2xl relative flex flex-col pt-16 md:pt-0 md:max-h-[90vh]">
              <button
                onClick={() => setActiveModule(null)}
                className="fixed md:absolute top-4 right-4 md:top-8 md:right-8 w-10 h-10 rounded-full bg-bg-subtle flex items-center justify-center text-text-muted hover:text-red-500 transition-all z-[60]"
              >
                <RiCloseLine className="text-xl" />
              </button>
              <div className="flex-1 overflow-y-auto p-4 md:p-12">
                {activeModule === "guide" && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center"><RiBookOpenLine className="text-2xl" /></div>
                      <div>
                        <h3 className="text-2xl font-black text-text uppercase tracking-tight">{t.onboardingPage.awaitingInterview.tools.guide.title}</h3>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{t.onboardingPage.awaitingInterview.tools.guide.desc}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { q: "Qual o objetivo da sua viagem?", a: "Seja específico. Mencione cidades e locais que pretende visitar." },
                        { q: "Onde você vai se hospedar?", a: "Tenha o endereço do hotel ou da casa de amigos/parentes em mãos." },
                        { q: "Quem vai pagar pela sua viagem?", a: "Se for você, demonstre estabilidade. Se for um sponsor, explique a relação." }
                      ].map((item, i) => (
                        <div key={i} className="p-4 bg-bg-subtle rounded-2xl border border-border">
                          <p className="text-[11px] font-black text-text mb-1">{item.q}</p>
                          <p className="text-[10px] text-text-muted font-medium">{item.a}</p>
                        </div>
                      ))}
                    </div>
                    <div className="pt-8 border-t border-border text-center">
                      <a href="/guides/b1b2-interview-guide.pdf" target="_blank" className="inline-flex items-center gap-3 px-10 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
                        {t.onboardingPage.specialistTraining.downloadGuide} <RiArrowRightLine />
                      </a>
                    </div>
                  </div>
                )}
                {activeModule === "ai" && (
                  <div className="flex flex-col h-[550px]">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center relative">
                        <RiRobotLine className="text-2xl" />
                        <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></div>
                      </div>
                      <h3 className="text-2xl font-black text-text uppercase tracking-tight">{t.onboardingPage.aiInterviewChat.practiceTitle}</h3>
                    </div>
                    <div className="flex-1 bg-bg-subtle rounded-[32px] overflow-hidden flex flex-col relative shadow-inner border border-border/80">
                      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                        {chatMessages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[85%] p-4 rounded-3xl text-xs font-bold ${msg.role === "user" ? "bg-primary text-white rounded-tr-none" : "bg-card text-text rounded-tl-none border border-border/80"}`}>
                              {msg.text}
                            </div>
                          </div>
                        ))}
                        {isBotTyping && <div className="flex justify-start"><div className="bg-card p-4 rounded-3xl rounded-tl-none shadow-sm flex gap-1"><span className="w-1.5 h-1.5 bg-text-muted/30 rounded-full animate-bounce" /><span className="w-1.5 h-1.5 bg-text-muted/30 rounded-full animate-bounce [animation-delay:0.2s]" /><span className="w-1.5 h-1.5 bg-text-muted/30 rounded-full animate-bounce [animation-delay:0.4s]" /></div></div>}
                      </div>
                      <div className="p-4 bg-card border-t border-border/80 relative flex gap-2">
                        <input type="text" placeholder={t.onboardingPage.aiInterviewChat.placeholder} value={chatInput || ""} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()} className="flex-1 px-4 py-3 bg-bg-subtle rounded-xl text-xs font-bold" />
                        <button onClick={handleSendChatMessage} className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center"><RiSendPlane2Fill /></button>
                      </div>
                    </div>
                  </div>
                )}
                {activeModule === "specialist" && (
                  <div className="space-y-8">
                    {!isScheduling && (
                      <>
                        {hasMentorship ? (
                          <div className="text-center space-y-6 py-8">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto"><RiHistoryLine className="text-4xl" /></div>
                            <div>
                              <h3 className="text-2xl font-black text-text uppercase tracking-tight">{t.onboardingPage.specialistTraining.mentoringTitle}</h3>
                              <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Converse direto com o manager para iniciar sua mentoria</p>
                            </div>
                            <button onClick={handleOpenSpecialistSupport} className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest">
                              Ir para o chat
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="text-center"><h3 className="text-2xl font-black text-text uppercase tracking-tight">{t.onboardingPage.specialistTraining.mentoringTitle}</h3></div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {PLANS.map(plan => (
                                <div key={plan.id} className={`p-6 rounded-[32px] border flex flex-col ${plan.best ? "bg-primary/5 border-primary/20" : "bg-bg-subtle"}`}>
                                  <span className={`text-[10px] font-black uppercase mb-1 ${plan.best ? "text-primary" : "text-text-muted"}`}>{plan.name}</span>
                                  <span className={`text-2xl font-black mb-4 ${plan.best ? "text-text" : "text-text"}`}>R$ {plan.price}</span>
                                  <div className="space-y-2 flex-1">
                                    {plan.features.map(f => (
                                      <div key={f} className="flex gap-2 text-[9px] font-bold text-text-muted"><RiCheckLine className="text-emerald-500" /> {f}</div>
                                    ))}
                                  </div>
                                  <button onClick={() => handleSelectPlan(plan)} className={`mt-6 py-3 rounded-xl text-[10px] font-black uppercase ${plan.best ? "bg-primary text-white" : "bg-card border text-text"}`}>{t.onboardingPage.specialistTraining.chooseThis}</button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendly Full-screen Overlay - Dedicated to avoid scroll/click issues on mobile */}
      {isScheduling && calendlyUrl && (
        <div className="fixed inset-0 bg-card z-[200] flex flex-col animate-in fade-in duration-300">
          <div className="h-20 flex items-center justify-between px-8 border-b bg-card">
            <div>
              <h3 className="text-lg font-black text-text uppercase tracking-tight">{t.onboardingPage.specialistTraining.mentoringTitle}</h3>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{scheduledCount + 1}ª {t.onboardingPage.specialistTraining.interviewLabel}</p>
            </div>
            <button
              onClick={() => setIsScheduling(false)}
              className="w-12 h-12 rounded-full bg-bg-subtle flex items-center justify-center text-text-muted hover:text-rose-500 transition-all shadow-sm"
            >
              <RiCloseLine className="text-2xl" />
            </button>
          </div>
          <div className="flex-1 w-full overflow-hidden bg-bg-subtle">
            <InlineWidget
              url={calendlyUrl}
              styles={{ height: '100%', width: '100%' }}
              prefill={{ email: user?.email, name: user?.fullName }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
