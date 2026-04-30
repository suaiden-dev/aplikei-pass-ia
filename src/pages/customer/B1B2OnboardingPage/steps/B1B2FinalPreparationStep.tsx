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
import { useAuth } from "../../../../hooks/useAuth";
import { supabase } from "../../../../lib/supabase";
import { calendlyService } from "../../../../services/calendly.service";
import { useT, useLocale } from "../../../../i18n";
import { useInterviewTrainingController } from "../../../../controllers/shared/useInterviewTrainingController";

interface B1B2FinalPreparationStepProps {
  procId: string;
  stepData: Record<string, unknown>;
  onComplete: () => void;
}

type PreparationModule = "guide" | "ai" | "specialist";

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

  // Consultation State
  const [purchasedConsultation, setPurchasedConsultation] = useState<Record<string, unknown> | null>(null);
  const [isSchedulingConsultation, setIsSchedulingConsultation] = useState(false);
  const [consultationUrl, setConsultationUrl] = useState<string>("");

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
      if (!user) return;
      const { data } = await supabase
        .from("user_services")
        .select("*")
        .eq("user_id", user.id)
        .in("service_slug", ["mentoria-bronze", "mentoria-silver", "mentoria-gold", "consultoria-especialista"])
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: consultationData } = await supabase
        .from("user_services")
        .select("*")
        .eq("user_id", user.id)
        .eq("service_slug", "mentoria-negativa-consular")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();


      if (data) {
        setPurchasedMentorship(data);
      }
      if (consultationData) {
        setPurchasedConsultation(consultationData);
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
    async function fetchCalendlyLink() {
      if (!purchasedMentorship) return;
      const planName = purchasedMentorship.service_slug === "mentoria-gold" ? "Ouro" :
        purchasedMentorship.service_slug === "mentoria-silver" ? "Prata" :
          purchasedMentorship.service_slug === "consultoria-especialista" ? "Especialista" : "Bronze";

      const event = await calendlyService.findEventByName(
        purchasedMentorship.service_slug === "consultoria-especialista" ? "Consultoria Especialista" : `Mentoria ${planName}`
      );
      if (event) {
        setCalendlyUrl(event.scheduling_url);
      } else {
        setCalendlyUrl("https://calendly.com/infothefutureimmigration/treinamento-entrevista");
      }
    }
    fetchCalendlyLink();
  }, [purchasedMentorship]);

  useEffect(() => {
    async function fetchConsultationLink() {
      if (!purchasedConsultation) return;
      const event = await calendlyService.findEventByName("Consultoria Especialista");
      if (event) {
        setConsultationUrl(event.scheduling_url);
      } else {
        setConsultationUrl("https://calendly.com/infothefutureimmigration/treinamento-entrevista");
      }
    }
    fetchConsultationLink();
  }, [purchasedConsultation]);

  useCalendlyEventListener({
    onEventScheduled: async () => {
      if (isSchedulingConsultation && purchasedConsultation) {
        setIsSchedulingConsultation(false);
        toast.success(t.onboardingPage.specialistTraining.paymentProcessed); // Reuse success msg for scheduling
        return;
      }

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
    { id: "mentoria-individual", name: t.onboardingPage.specialistTraining.bronzePackage, price: 197, interviews: 1, features: [t.onboardingPage.specialistTraining.trainingSession, t.onboardingPage.specialistTraining.interviewSim] },
    { id: "mentoria-bronze", name: t.onboardingPage.specialistTraining.silverPackage, price: 397, interviews: 2, features: [t.onboardingPage.specialistTraining.sessions2Training, t.onboardingPage.specialistTraining.deepProfileAnalysis, t.onboardingPage.specialistTraining.immediateFeedback] },
    { id: "mentoria-gold", name: t.onboardingPage.specialistTraining.goldPackage, price: 697, interviews: 3, features: [t.onboardingPage.specialistTraining.sessions3Training, t.onboardingPage.specialistTraining.vipSupport, t.onboardingPage.specialistTraining.responseStrategy], best: !isDenied },
  ];

  const negativePlan = {
    id: "mentoria-negativa-consular",
    name: t.onboardingPage.specialistTraining.reviewTopic,
    price: 97,
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
    navigate(`/checkout/${plan.id}`);
  };

  const scheduledCount = ((purchasedMentorship?.step_data as Record<string, unknown>)?.scheduled_count as number | undefined) || 0;
  const totalInterviews = purchasedMentorship?.service_slug === "mentoria-gold" ? 3 : purchasedMentorship?.service_slug === "mentoria-bronze" ? 2 : 1;
  const allScheduled = scheduledCount >= totalInterviews;

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
        className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-primary transition-all text-left flex flex-col gap-3 group"
      >
        <RiBookOpenLine className="text-2xl text-slate-400 group-hover:text-primary transition-colors" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">{t.onboardingPage.awaitingInterview.tools.guide.title}</span>
      </button>
      <button
        onClick={() => setActiveModule("ai")}
        className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-primary transition-all text-left flex flex-col gap-3 group"
      >
        <RiRobotLine className="text-2xl text-slate-400 group-hover:text-primary transition-colors" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">{t.onboardingPage.awaitingInterview.tools.ai.title}</span>
      </button>
      <button
        onClick={() => setActiveModule("specialist")}
        className={`p-6 rounded-3xl border transition-all text-left flex flex-col gap-3 group relative overflow-hidden ${purchasedMentorship ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100 hover:border-primary"
          }`}
      >
        {purchasedMentorship ? (
          <>
            <RiCalendarCheckLine className="text-2xl text-emerald-500" />
             <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800">
              {allScheduled ? t.onboardingPage.specialistTraining.allScheduled : t.onboardingPage.specialistTraining.scheduleNow}
            </span>
            <div className="mt-1 flex gap-1">
              {[...Array(totalInterviews)].map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i < scheduledCount ? "bg-emerald-500" : "bg-emerald-200"}`} />
              ))}
            </div>
          </>
        ) : (
          <>
            <RiUserStarLine className="text-2xl text-slate-400 group-hover:text-primary transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">{t.onboardingPage.awaitingInterview.tools.specialist.title}</span>
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">      {isAwaitingAdmin && (
        <div className="p-8 bg-blue-50 border border-blue-100 rounded-[40px] text-center space-y-4 shadow-xl shadow-blue-500/5 animate-in slide-in-from-top-4 duration-500">
          <div className="w-12 h-12 bg-white text-blue-500 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <RiLoader4Line className="text-2xl animate-spin" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{t.onboardingPage.awaitingInterview.awaitingFinalScheduling}</h2>
            <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto mt-1">
              {t.onboardingPage.awaitingInterview.awaitingFinalSchedulingDesc}
            </p>
          </div>
        </div>
      )}

      {/* Main Tools Section - Always Visible */}
      <div className="bg-white p-12 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40">
        <div className="text-center mb-10">
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{t.onboardingPage.awaitingInterview.preparationResources}</h3>
          <p className="text-sm text-slate-500 font-medium max-w-md mx-auto mt-2">
            {t.onboardingPage.awaitingInterview.preparationResourcesDesc}
          </p>
        </div>
        {preparationGrid}
      </div>

      {!isAwaitingAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CASV/CONSULATE DATES DETAILS (Original content moved here) */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center">
                <RiInformationLine className="text-2xl" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.onboardingPage.awaitingInterview.casv}</h3>
                <p className="text-lg font-black text-slate-800">{new Date(casvDate + "T12:00:00").toLocaleDateString(lang === "pt" ? "pt-BR" : lang === "es" ? "es-ES" : "en-US", { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.onboardingPage.awaitingInterview.time}</p>
                <p className="text-sm font-bold text-slate-800">{freshStepData.final_casv_time as string}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.onboardingPage.awaitingInterview.location}</p>
                <p className="text-sm font-bold text-slate-800 leading-tight">{freshStepData.final_casv_location as string}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center">
                <RiCalendarCheckLine className="text-2xl" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.onboardingPage.awaitingInterview.consulate}</h3>
                <p className="text-lg font-black text-slate-800">{new Date(consuladoDate + "T12:00:00").toLocaleDateString(lang === "pt" ? "pt-BR" : lang === "es" ? "es-ES" : "en-US", { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.onboardingPage.awaitingInterview.time}</p>
                <p className="text-sm font-bold text-slate-800">{freshStepData.final_consulado_time as string}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.onboardingPage.awaitingInterview.location}</p>
                <p className="text-sm font-bold text-slate-800 leading-tight">{freshStepData.final_consulado_location as string}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Outcome Section if applicable */}
      {isInterviewDayOrPast && (
        <div className="p-10 bg-slate-900 rounded-[40px] text-center space-y-8 shadow-2xl border border-primary/20 relative overflow-hidden group">
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
                      <h4 className="text-3xl font-black text-white uppercase tracking-tight">{t.onboardingPage.processingStatus.outcomeApproved}</h4>
                      <p className="text-slate-400 font-medium max-w-sm mx-auto">{t.onboardingPage.processingStatus.outcomeApprovedDesc}</p>
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full h-14 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-xl"
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
                        <p className="text-sm text-slate-400 font-medium max-w-sm mx-auto">{t.onboardingPage.processingStatus.outcomeRejectedDesc}</p>
                      </div>

                      <div className="grid grid-cols-1 gap-4 pt-4">
                        <button
                          onClick={() => navigate('/checkout/visto-b1-b2')}
                          className="p-6 bg-white/5 border border-white/10 rounded-3xl text-left hover:bg-white/10 transition-all group/opt relative overflow-hidden"
                        >
                          <div className="relative z-10">
                            <h5 className="text-white font-black uppercase text-xs tracking-widest mb-1 group-hover/opt:text-primary transition-colors">{t.onboardingPage.processingStatus.restartProcess}</h5>
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{t.onboardingPage.processingStatus.restartProcessDesc}</p>
                          </div>
                          <RiArrowRightLine className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 group-hover/opt:text-primary group-hover/opt:translate-x-1 transition-all" />
                        </button>

                        {purchasedConsultation ? (
                          <button
                            onClick={() => setIsSchedulingConsultation(true)}
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
                              navigate('/checkout/mentoria-negativa-consular');
                            }}
                            className="p-6 bg-primary/10 border border-primary/20 rounded-3xl text-left hover:bg-primary/20 transition-all group/opt relative overflow-hidden"
                          >
                            <div className="relative z-10">
                              <h5 className="text-primary font-black uppercase text-xs tracking-widest mb-1">{t.onboardingPage.processingStatus.consultationSpecialist}</h5>
                              <p className="text-[10px] text-slate-300 font-medium leading-relaxed">{t.onboardingPage.processingStatus.consultationSpecialistDesc}</p>
                            </div>
                            <div className="absolute top-4 right-4 bg-primary text-[8px] font-black px-2 py-0.5 rounded-full text-white uppercase tracking-tighter">Recomendado</div>
                            <RiArrowRightLine className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/40 group-hover/opt:text-primary group-hover/opt:translate-x-1 transition-all" />
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => navigate('/dashboard')}
                        className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                      >
                        {t.onboardingPage.processingStatus.backToStart}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative">
                    <h4 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{t.onboardingPage.processingStatus.theBigDay}</h4>
                    <p className="text-sm text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
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
                      className="h-16 bg-white/10 text-white border border-white/10 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                      {loading ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCloseLine className="text-xl" /> {t.onboardingPage.processingStatus.iWasRefused}</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

      <AnimatePresence>
        {isSchedulingConsultation && consultationUrl && (
          <div className="fixed inset-0 bg-white z-[200] flex flex-col animate-in fade-in duration-300">
            <div className="h-20 flex items-center justify-between px-8 border-b bg-white">
              <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{t.onboardingPage.specialistTraining.bronzePackage}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.onboardingPage.processingStatus.outcomeRejected}</p>
              </div>
              <button 
                onClick={() => setIsSchedulingConsultation(false)} 
                className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all shadow-sm"
              >
                <RiCloseLine className="text-2xl" />
              </button>
            </div>
            <div className="flex-1 w-full overflow-hidden bg-slate-50">
              <InlineWidget 
                url={consultationUrl} 
                styles={{ height: '100%', width: '100%' }} 
                prefill={{ email: user?.email, name: user?.fullName }} 
              />
            </div>
          </div>
        )}

        {activeModule && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-start justify-center bg-white md:bg-slate-900/60 md:backdrop-blur-md overflow-hidden"
          >
            <div className="bg-white w-full h-full md:h-auto md:max-w-2xl md:rounded-[40px] shadow-2xl relative flex flex-col pt-16 md:pt-0 md:max-h-[90vh]">
              <button 
                onClick={() => setActiveModule(null)} 
                className="fixed md:absolute top-4 right-4 md:top-8 md:right-8 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all z-[60]"
              >
                <RiCloseLine className="text-xl" />
              </button>
              <div className="flex-1 overflow-y-auto p-4 md:p-12">
                {activeModule === "guide" && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center"><RiBookOpenLine className="text-2xl" /></div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{t.onboardingPage.awaitingInterview.tools.guide.title}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.onboardingPage.awaitingInterview.tools.guide.desc}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { q: "Qual o objetivo da sua viagem?", a: "Seja específico. Mencione cidades e locais que pretende visitar." },
                        { q: "Onde você vai se hospedar?", a: "Tenha o endereço do hotel ou da casa de amigos/parentes em mãos." },
                        { q: "Quem vai pagar pela sua viagem?", a: "Se for você, demonstre estabilidade. Se for um sponsor, explique a relação." }
                      ].map((item, i) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[11px] font-black text-slate-700 mb-1">{item.q}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{item.a}</p>
                        </div>
                      ))}
                    </div>
                    <div className="pt-8 border-t border-slate-100 text-center">
                      <a href="/guides/b1b2-interview-guide.pdf" target="_blank" className="inline-flex items-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
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
                      <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{t.onboardingPage.aiInterviewChat.practiceTitle}</h3>
                    </div>
                    <div className="flex-1 bg-slate-100 rounded-[32px] overflow-hidden flex flex-col relative shadow-inner border border-slate-200">
                      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                        {chatMessages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[85%] p-4 rounded-3xl text-xs font-bold ${msg.role === "user" ? "bg-primary text-white rounded-tr-none" : "bg-white text-slate-700 rounded-tl-none border border-slate-200"}`}>
                              {msg.text}
                            </div>
                          </div>
                        ))}
                        {isBotTyping && <div className="flex justify-start"><div className="bg-white p-4 rounded-3xl rounded-tl-none shadow-sm flex gap-1"><span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" /><span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" /><span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" /></div></div>}
                      </div>
                      <div className="p-4 bg-white border-t border-slate-200 relative flex gap-2">
                        <input type="text" placeholder={t.onboardingPage.aiInterviewChat.placeholder} value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()} className="flex-1 px-4 py-3 bg-slate-100 rounded-xl text-xs font-bold" />
                        <button onClick={handleSendChatMessage} className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center"><RiSendPlane2Fill /></button>
                      </div>
                    </div>
                  </div>
                )}
                {activeModule === "specialist" && (
                   <div className="space-y-8">
                     {!isScheduling && (
                       <>
                        {purchasedMentorship ? (
                          <div className="text-center space-y-6 py-8">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto"><RiHistoryLine className="text-4xl" /></div>
                            <div>
                              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{t.onboardingPage.specialistTraining.mentoringTitle}</h3>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{scheduledCount} {t.onboardingPage.stepOf} {totalInterviews} {t.onboardingPage.specialistTraining.scheduledLabel}</p>
                            </div>
                            {!allScheduled ? (
                              <button onClick={() => setIsScheduling(true)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">{t.onboardingPage.specialistTraining.scheduleNow} {scheduledCount + 1}ª {t.onboardingPage.specialistTraining.interviewLabel}</button>
                            ) : (
                              <div className="p-4 bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase rounded-2xl">{t.onboardingPage.specialistTraining.allScheduled}</div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="text-center"><h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{t.onboardingPage.specialistTraining.mentoringTitle}</h3></div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {PLANS.map(plan => (
                                <div key={plan.id} className={`p-6 rounded-[32px] border flex flex-col ${plan.best ? "bg-slate-900 border-slate-900 text-white" : "bg-slate-50"}`}>
                                  <span className="text-[10px] font-black uppercase mb-1">{plan.name}</span>
                                  <span className="text-2xl font-black mb-4">R$ {plan.price}</span>
                                  <div className="space-y-2 flex-1">
                                    {plan.features.map(f => (
                                      <div key={f} className="flex gap-2 text-[9px] font-bold text-slate-400"><RiCheckLine className="text-emerald-500" /> {f}</div>
                                    ))}
                                  </div>
                                  <button onClick={() => handleSelectPlan(plan)} className={`mt-6 py-3 rounded-xl text-[10px] font-black uppercase ${plan.best ? "bg-primary text-white" : "bg-white border text-slate-800"}`}>{t.onboardingPage.specialistTraining.chooseThis}</button>
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
        <div className="fixed inset-0 bg-white z-[200] flex flex-col animate-in fade-in duration-300">
          <div className="h-20 flex items-center justify-between px-8 border-b bg-white">
            <div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{t.onboardingPage.specialistTraining.mentoringTitle}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{scheduledCount + 1}ª {t.onboardingPage.specialistTraining.interviewLabel}</p>
            </div>
            <button 
              onClick={() => setIsScheduling(false)} 
              className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all shadow-sm"
            >
              <RiCloseLine className="text-2xl" />
            </button>
          </div>
          <div className="flex-1 w-full overflow-hidden bg-slate-50">
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
