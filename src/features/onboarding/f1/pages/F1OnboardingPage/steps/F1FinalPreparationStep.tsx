import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiBookOpenLine,
  RiRobotLine,
  RiUserStarLine,
  RiCalendarCheckLine,
  RiArrowRightLine,
  RiCheckLine,
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
import { getCanonicalSlug } from "@shared/data/services";

interface F1FinalPreparationStepProps {
  procId: string;
  stepData: Record<string, unknown>;
  onComplete: () => void;
}

type PreparationModule = "guide" | "ai" | "specialist";

export function F1FinalPreparationStep({ procId, stepData, onComplete }: F1FinalPreparationStepProps) {
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
  const [isSchedulingConsultation, setIsSchedulingConsultation] = useState(false);

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<{ id: string, role: "user" | "bot", text: string }[]>([
    { id: "1", role: "bot", text: t.onboardingPage.aiInterviewChat.initialMessage }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(2, 11));
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, isBotTyping]);

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

      const { data: currentProcess } = await supabase
        .from("user_services")
        .select("step_data")
        .eq("id", procId)
        .maybeSingle();

      const processStepData = (currentProcess?.step_data as Record<string, unknown> | null) ?? null;
      const purchases = Array.isArray(processStepData?.purchases)
        ? (processStepData?.purchases as Array<{ slug?: string }>)
        : [];
      const purchaseSlugs = new Set<string>();
      purchases.forEach((purchase) => {
        const raw = String(purchase.slug || "").trim();
        if (!raw) return;
        purchaseSlugs.add(raw);
        purchaseSlugs.add(getCanonicalSlug(raw));
      });
      const consultationSlugs = ["consultoria-f1-negativa", "consultancy-negative-f1"];

      const hasMentorshipInProcess = mentorshipSlugs.some((slug) => purchaseSlugs.has(slug));
      const hasConsultationInProcess = consultationSlugs.some((slug) => purchaseSlugs.has(slug) || purchaseSlugs.has(getCanonicalSlug(slug)));

      setPurchasedMentorship(null);
      setPurchasedConsultation(null);

      if (hasMentorshipInProcess) {
        const { data } = await supabase
          .from("user_services")
          .select("*")
          .eq("user_id", user.id)
          .in("service_slug", mentorshipSlugs)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data) setPurchasedMentorship(data);
      }

      if (hasConsultationInProcess) {
        const { data: consultationData } = await supabase
          .from("user_services")
          .select("*")
          .eq("user_id", user.id)
          .in("service_slug", consultationSlugs)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (consultationData) setPurchasedConsultation(consultationData);
      }
    }

    async function loadFreshData() {
      if (!procId) return;
      try {
        const { data } = await supabase
          .from("user_services")
          .select("step_data")
          .eq("id", procId)
          .single();

        if (data?.step_data) {
          const sd = data.step_data as Record<string, unknown>;
          setFreshStepData(sd);
          if (sd.final_casv_date || sd.final_scheduling_notified_at) {
            setIsAdminConfirmed(true);
          }
        }
      } catch (err) {
        console.error("[F1FinalPreparationStep] Error loading data:", err);
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
      });
    }

    loadPlanPrices();
  }, [user?.officeId]);

  // Mentoria now starts via support chat with manager, so no Calendly lookups here.

  useCalendlyEventListener({
    onEventScheduled: async () => {
      if (isSchedulingConsultation && purchasedConsultation) {
        setIsSchedulingConsultation(false);
        toast.success(t.onboardingPage.specialistTraining.paymentProcessed); 
        return;
      }

      if (!purchasedMentorship || !isScheduling) return;
      const stepData = (purchasedMentorship.step_data as Record<string, unknown>) || {};
      const nextCount = ((stepData.scheduled_count as number) || 0) + 1;
      await supabase
        .from("user_services")
        .update({
          step_data: { ...stepData, scheduled_count: nextCount }
        })
        .eq("id", purchasedMentorship.id);

      setPurchasedMentorship({
        ...purchasedMentorship,
        step_data: { ...stepData, scheduled_count: nextCount }
      });
      toast.success(t.onboardingPage.specialistTraining.sessionScheduledToast);
      setIsScheduling(false);
    },
  });

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isBotTyping) return;
    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { id: Date.now().toString(), role: "user", text: userMessage }]);
    setIsBotTyping(true);

    try {
      const response = await fetch(import.meta.env.VITE_N8N_BOT_INTERVIEW, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          userId: user?.id,
          processId: procId,
          lang: "pt",
          sessionId: sessionId,
          ds160: freshStepData,
          visaType: "F1"
        })
      });
      const data = await response.json();
      const botResponse = data.output || data.response || "Desculpe, tive um problema.";
      setChatMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "bot", text: botResponse }]);
    } catch {
      toast.error(t.onboardingPage.aiInterviewChat.errorConnecting);
    } finally {
      setIsBotTyping(false);
    }
  };

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
      setFreshStepData(prev => ({ ...prev, interview_outcome: outcome }));
      toast.success(outcome === 'approved' ? t.onboardingPage.f1.approvedToast : t.onboardingPage.f1.rejectedToast);
      if (outcome === 'approved') onComplete();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const PLANS = [
    { id: "mentoring-bronze", name: "Bronze", price: planPrices["mentoring-bronze"] ?? 197, interviews: 1, features: ["1 Mock Interview individual", "Plano de Estudo Personalizado", "Material de Apoio PDF"] },
    { id: "mentoring-silver", name: "Prata", price: planPrices["mentoring-silver"] ?? 397, interviews: 2, features: ["2 Mock Interviews individuais", "Análise de Perfil Acadêmico", "Feedback em Vídeo Detalhado", "Suporte p/ Dúvidas SEVIS"] },
    { id: "mentoring-gold", name: "Ouro", price: planPrices["mentoring-gold"] ?? 697, interviews: 3, features: ["3 Mock Interviews individuais", "Estratégia VIP p/ Vínculos", "Suporte Direto WhatsApp", "Simulado em Inglês + Português"], best: true },
  ];

  const handleSelectPlan = (plan: typeof PLANS[0]) => {
    const query = new URLSearchParams();
    if (user?.officeId) query.set("office_id", user.officeId);
    if (procId) query.set("proc_id", procId);
    navigate(`/checkout/${plan.id}${query.toString() ? `?${query.toString()}` : ""}`);
  };

  const handleOpenSpecialistSupport = async () => {
    if (!user?.id || !purchasedMentorship?.id) {
      navigate("/dashboard/support");
      return;
    }

    try {
      const processId = String(purchasedMentorship.id);
      const { data: lastMessage } = await supabase
        .from("chat_messages")
        .select("id")
        .eq("process_id", processId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!lastMessage) {
        await supabase.from("chat_messages").insert({
          process_id: processId,
          content: "Olá, comprei o pacote Specialist Mentoring e quero iniciar meu atendimento com o manager.",
          sender_id: user.id,
          sender_role: "customer",
          created_at: new Date().toISOString(),
        });
      }

      navigate(`/dashboard/support?processId=${processId}`);
    } catch (err) {
      console.error("[F1] open support chat failed:", err);
      navigate("/dashboard/support");
    }
  };

  const handleOpenConsultationSupport = async () => {
    if (!user?.id) {
      navigate("/dashboard/support");
      return;
    }

    try {
      const processId = String(purchasedConsultation?.id ?? procId);
      const { data: lastMessage } = await supabase
        .from("chat_messages")
        .select("id")
        .eq("process_id", processId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!lastMessage) {
        await supabase.from("chat_messages").insert({
          process_id: processId,
          content: "Olá, comprei a consultoria pós-negativa e quero iniciar meu atendimento com o manager.",
          sender_id: user.id,
          sender_role: "customer",
          created_at: new Date().toISOString(),
        });
      }

      navigate(`/dashboard/support?processId=${processId}`);
    } catch (err) {
      console.error("[F1] open consultation support chat failed:", err);
      navigate("/dashboard/support");
    }
  };

  const scheduledCount = ((purchasedMentorship?.step_data as Record<string, unknown>)?.scheduled_count as number | undefined) || 0;
  const totalInterviews =
    purchasedMentorship?.service_slug === "mentoring-gold" || purchasedMentorship?.service_slug === "mentoria-gold"
      ? 3
      : purchasedMentorship?.service_slug === "mentoring-silver" || purchasedMentorship?.service_slug === "mentoria-silver"
        ? 2
        : 1;
  const allScheduled = scheduledCount >= totalInterviews;

  const casvDate = freshStepData?.final_casv_date as string;
  const consuladoDate = freshStepData?.final_consulado_date as string;
  const isAwaitingAdmin = !isAdminConfirmed && !casvDate;
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isInterviewDayOrPast = (casvDate && casvDate <= todayStr) || (consuladoDate && consuladoDate <= todayStr);
  const alreadyReported = !!freshStepData?.interview_outcome;

  const preparationGrid = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
      <button onClick={() => setActiveModule("guide")} className="p-6 rounded-3xl bg-bg-subtle border border-border hover:border-primary transition-all text-left flex flex-col gap-3 group">
        <RiBookOpenLine className="text-2xl text-text-muted group-hover:text-primary transition-colors" />
        <span className="text-[10px] font-black uppercase tracking-widest text-text">{t.onboardingPage.awaitingInterview.tools.guide.title}</span>
      </button>
      <button onClick={() => setActiveModule("ai")} className="p-6 rounded-3xl bg-bg-subtle border border-border hover:border-primary transition-all text-left flex flex-col gap-3 group">
        <RiRobotLine className="text-2xl text-text-muted group-hover:text-primary transition-colors" />
        <span className="text-[10px] font-black uppercase tracking-widest text-text">{t.onboardingPage.awaitingInterview.tools.ai.title}</span>
      </button>
      <button
        onClick={() => setActiveModule("specialist")}
        className={`p-6 rounded-3xl border transition-all text-left flex flex-col gap-3 group relative overflow-hidden ${
          purchasedMentorship ? "bg-emerald-50 border-emerald-100" : "bg-bg-subtle border-border hover:border-primary"
        }`}
      >
        {purchasedMentorship ? (
          <>
            <RiCalendarCheckLine className="text-2xl text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800">
              Chat com manager disponível
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-card p-12 rounded-[40px] border border-border shadow-xl shadow-border/10">
        <div className="text-center mb-10">
          <h3 className="text-2xl font-black text-text uppercase tracking-tight">{t.onboardingPage.awaitingInterview.preparationResources}</h3>
          <p className="text-sm text-text-muted font-medium max-w-md mx-auto mt-2">
            {t.onboardingPage.awaitingInterview.preparationResourcesDesc}
          </p>
        </div>
        {preparationGrid}
      </div>

      {isAwaitingAdmin ? (
        <div className="text-center py-12 px-6 bg-card rounded-[40px] border border-border shadow-xl shadow-border/10 relative overflow-hidden">
          <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-[28px] flex items-center justify-center mx-auto mb-8 shadow-inner">
            <RiLoader4Line className="text-4xl animate-spin" />
          </div>
          <h2 className="text-2xl font-black text-text tracking-tight mb-4 uppercase">{t.onboardingPage.f1.awaitingSchedulingF1}</h2>
          <p className="text-sm text-text-muted font-medium leading-relaxed max-w-md mx-auto mb-8">
            {t.onboardingPage.f1.awaitingSchedulingF1Desc}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-text tracking-tight uppercase">{t.onboardingPage.f1.reportingTitle}</h2>
            <p className="text-sm font-medium text-text-muted uppercase tracking-widest">{t.onboardingPage.f1.reportingSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card p-8 rounded-[40px] border border-border shadow-xl shadow-border/10 relative overflow-hidden">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center">
                  <RiInformationLine className="text-2xl" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{t.onboardingPage.f1.casvBiometrics}</span>
                  <p className="text-xl font-black text-text mt-1">{new Date(casvDate + "T12:00:00").toLocaleDateString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/50 flex gap-6">
                <div><span className="text-[9px] font-black text-text-muted uppercase">{t.onboardingPage.f1.hour}</span><p className="text-xs font-bold text-text">{freshStepData.final_casv_time as string}</p></div>
                <div><span className="text-[9px] font-black text-text-muted uppercase">{t.onboardingPage.f1.location}</span><p className="text-xs font-bold text-text">{freshStepData.final_casv_location as string}</p></div>
              </div>
            </div>
            <div className="bg-card p-8 rounded-[40px] border border-border shadow-xl shadow-border/10 relative overflow-hidden">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center">
                  <RiCalendarCheckLine className="text-2xl" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{t.onboardingPage.f1.consulateDate}</span>
                  <p className="text-xl font-black text-text mt-1">{new Date(consuladoDate + "T12:00:00").toLocaleDateString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/50 flex gap-6">
                <div><span className="text-[9px] font-black text-text-muted uppercase">{t.onboardingPage.f1.hour}</span><p className="text-xs font-bold text-text">{freshStepData.final_consulado_time as string}</p></div>
                <div><span className="text-[9px] font-black text-text-muted uppercase">{t.onboardingPage.f1.location}</span><p className="text-xs font-bold text-text">{freshStepData.final_consulado_location as string}</p></div>
              </div>
            </div>
          </div>

          <div className="p-10 bg-bg-subtle rounded-[40px] text-center space-y-8 shadow-2xl border border-border">
            {alreadyReported ? (
              <div className="space-y-6">
                 {freshStepData.interview_outcome === 'approved' ? (
                   <div className="text-text">
                     <RiCheckLine className="text-5xl text-emerald-500 mx-auto mb-4" />
                     <h4 className="text-2xl font-black uppercase text-text">{t.onboardingPage.processingStatus.outcomeApproved}</h4>
                     <button onClick={() => navigate('/dashboard')} className="mt-6 px-10 py-3 bg-primary rounded-xl font-black uppercase text-xs tracking-widest text-white">{t.onboardingPage.processingStatus.backToStart}</button>
                   </div>
                 ) : (
                   <div className="text-text space-y-6">
                     <RiCloseLine className="text-5xl text-rose-500 mx-auto mb-4" />
                     <h4 className="text-xl font-black uppercase text-text">{t.onboardingPage.processingStatus.outcomeRejected}</h4>
                     <div className="flex flex-col gap-3 max-w-sm mx-auto">
                        {purchasedConsultation ? (
                          <button
                            onClick={handleOpenConsultationSupport}
                            className="py-4 bg-emerald-600 rounded-xl font-black uppercase text-xs tracking-widest text-white"
                          >
                            Ir para o chat
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              const query = new URLSearchParams();
                              if (user?.officeId) query.set("office_id", user.officeId);
                              if (procId) query.set("proc_id", procId);
                              navigate(`/checkout/consultoria-f1-negativa${query.toString() ? `?${query.toString()}` : ""}`);
                            }}
                            className="py-4 bg-primary rounded-xl font-black uppercase text-xs tracking-widest text-white"
                          >
                            {t.onboardingPage.processingStatus.consultationSpecialist}
                          </button>
                        )}
                        <button onClick={() => navigate(`/checkout/visto-f1-reaplicacao${user?.officeId ? `?office_id=${user.officeId}` : ""}`)} className="py-4 bg-card border border-border rounded-xl font-black uppercase text-xs tracking-widest text-text">{t.onboardingPage.processingStatus.restartProcess}</button>
                     </div>
                   </div>
                 )}
              </div>
            ) : isInterviewDayOrPast ? (
              <div className="space-y-6">
                 <h4 className="text-xl font-black text-text uppercase">{t.onboardingPage.processingStatus.howWasOutcome}</h4>
                 <div className="flex gap-4 max-w-sm mx-auto">
                   <button onClick={() => handleReportOutcome('approved')} disabled={loading} className="flex-1 h-14 bg-emerald-500 text-white rounded-xl font-black uppercase">{t.onboardingPage.processingStatus.iWasApproved}</button>
                   <button onClick={() => handleReportOutcome('rejected')} disabled={loading} className="flex-1 h-14 bg-card border border-border text-text rounded-xl font-black uppercase">{t.onboardingPage.processingStatus.iWasRefused}</button>
                 </div>
              </div>
            ) : (
                             <p className="text-text-muted text-xs font-black uppercase tracking-widest">{t.onboardingPage.processingStatus.nextSteps}</p>

            )}
          </div>
        </div>
      )}

      {/* Modals para Guide, AI, Specialist (similares ao B1/B2) */}
      <AnimatePresence>
        {activeModule && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/70 backdrop-blur-md">
            <div className="bg-card w-full max-w-2xl rounded-[40px] shadow-2xl p-10 relative border border-border">
               <button onClick={() => setActiveModule(null)} className="absolute top-8 right-8 text-text-muted"><RiCloseLine className="text-2xl"/></button>
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
                        { q: "Qual o objetivo acadêmico do seu curso?", a: "Explique curso, instituição e conexão com seu plano de carreira." },
                        { q: "Como você vai custear seus estudos e estadia?", a: "Detalhe fonte financeira, documentos e estabilidade econômica." },
                        { q: "Quais vínculos você mantém com seu país de origem?", a: "Mostre laços familiares, profissionais e plano de retorno." }
                      ].map((item, i) => (
                        <div key={i} className="p-4 bg-bg-subtle rounded-2xl border border-border">
                          <p className="text-[11px] font-black text-text mb-1">{item.q}</p>
                          <p className="text-[10px] text-text-muted font-medium">{item.a}</p>
                        </div>
                      ))}
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
                      <h3 className="text-2xl font-black text-text uppercase tracking-tight">{t.onboardingPage.f1.trainingAI}</h3>
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
                        <input type="text" placeholder={t.onboardingPage.aiInterviewChat.placeholder} value={chatInput || ""} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()} className="flex-1 px-4 py-3 bg-bg-subtle rounded-xl text-xs font-bold text-text" />
                        <button onClick={handleSendChatMessage} className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-black"><RiSendPlane2Fill /></button>
                      </div>
                    </div>
                  </div>
                )}
                {activeModule === "specialist" && (
                  <div className="space-y-8">
                    {isScheduling ? (
                      <div className="relative">
                        <button onClick={() => setIsScheduling(false)} className="absolute -top-12 right-0 text-[10px] font-black uppercase text-text-muted flex items-center gap-1"><RiCloseLine /> {t.onboardingPage.backToDashboard}</button>
                        <div className="rounded-3xl overflow-hidden border h-[500px]"><InlineWidget url={calendlyUrl} styles={{ height: '500px' }} prefill={{ email: user?.email, name: user?.fullName }} /></div>
                      </div>
                    ) : purchasedMentorship ? (
                      <div className="text-center space-y-6 py-8">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto"><RiHistoryLine className="text-4xl" /></div>
                        <div>
                          <h3 className="text-2xl font-black text-text uppercase tracking-tight">{t.onboardingPage.specialistTraining.mentoringTitle}</h3>
                          <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Converse direto com o manager para iniciar sua mentoria</p>
                        </div>
                        <button onClick={handleOpenSpecialistSupport} className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest">
                          Abrir chat com manager
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="text-center"><h3 className="text-2xl font-black text-text uppercase tracking-tight">{t.onboardingPage.specialistTraining.mentoringTitle}</h3></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {PLANS.map(plan => (
                            <div key={plan.id} className={`p-6 rounded-[32px] border flex flex-col ${plan.best ? "bg-primary/5 border-primary/20" : "bg-bg-subtle"}`}>
                              <span className={`text-[10px] font-black uppercase mb-1 ${plan.best ? "text-primary" : "text-text-muted"}`}>{plan.name}</span>
                              <span className="text-2xl font-black mb-4 text-text">R$ {plan.price}</span>
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
                  </div>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
