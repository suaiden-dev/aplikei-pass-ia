import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiBookOpenLine,
  RiRobotLine,
  RiUserStarLine,
  RiArrowRightLine,
  RiCheckLine,
  RiLoader4Line,
  RiCloseLine,
  RiSendPlane2Fill,
  RiProgress3Line,
} from "react-icons/ri";
import { toast } from "sonner";
import { InlineWidget, useCalendlyEventListener } from "react-calendly";
import { useAuth } from "../../../../hooks/useAuth";
import { supabase } from "../../../../lib/supabase";
import { calendlyService } from "../../../../services/calendly.service";
import { useT, useLocale } from "../../../../i18n";

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
        .eq("service_slug", "consultoria-f1-negativa")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) setPurchasedMentorship(data);
      if (consultationData) setPurchasedConsultation(consultationData);
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
    async function fetchCalendlyLink() {
      if (!purchasedMentorship) return;
      const planName = purchasedMentorship.service_slug === "mentoria-gold" ? "Ouro" :
        purchasedMentorship.service_slug === "mentoria-silver" ? "Prata" :
          purchasedMentorship.service_slug === "consultoria-especialista" ? "Especialista" : "Bronze";

      const event = await calendlyService.findEventByName(
        purchasedMentorship.service_slug === "consultoria-especialista" ? "Consultoria Especialista" : `Mentoria ${planName}`
      );
      if (event) setCalendlyUrl(event.scheduling_url);
      else setCalendlyUrl("https://calendly.com/infothefutureimmigration/treinamento-entrevista");
    }
    fetchCalendlyLink();
  }, [purchasedMentorship]);

  useEffect(() => {
    async function fetchConsultationLink() {
      if (!purchasedConsultation) return;
      const event = await calendlyService.findEventByName("Consultoria Especialista");
      if (event) {
        // We don't have a specific state for this URL but we could add it if needed.
        // For now just avoiding unused state error.
      }
    }
    fetchConsultationLink();
  }, [purchasedConsultation]);

  useCalendlyEventListener({
    onEventScheduled: async () => {
      if (isSchedulingConsultation && purchasedConsultation) {
        setIsSchedulingConsultation(false);
        toast.success(t.onboardingPage.specialistTraining.paymentProcessed); 
        return;
      }

      if (!purchasedMentorship || !isScheduling) return;
      const stepData = (purchasedMentorship.step_data as any) || {};
      const nextCount = (stepData.scheduled_count || 0) + 1;
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
    } catch (error) {
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
            ...((freshStepData as any) || {}),
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
    { id: "mentoria-bronze", name: "Bronze", price: 197, interviews: 1, features: ["1 Mock Interview individual", "Plano de Estudo Personalizado", "Material de Apoio PDF"] },
    { id: "mentoria-silver", name: "Prata", price: 397, interviews: 2, features: ["2 Mock Interviews individuais", "Análise de Perfil Acadêmico", "Feedback em Vídeo Detalhado", "Suporte p/ Dúvidas SEVIS"] },
    { id: "mentoria-gold", name: "Ouro", price: 697, interviews: 3, features: ["3 Mock Interviews individuais", "Estratégia VIP p/ Vínculos", "Suporte Direto WhatsApp", "Simulado em Inglês + Português"], best: true },
  ];

  const handleSelectPlan = (plan: typeof PLANS[0]) => {
    navigate(`/checkout/${plan.id}`);
  };

  const scheduledCount = ((purchasedMentorship?.step_data as any)?.scheduled_count as number) || 0;
  const totalInterviews = purchasedMentorship?.service_slug === "mentoria-gold" ? 3 : purchasedMentorship?.service_slug === "mentoria-silver" ? 2 : 1;
  const allScheduled = scheduledCount >= totalInterviews;

  const casvDate = freshStepData?.final_casv_date as string;
  const consuladoDate = freshStepData?.final_consulado_date as string;
  const isAwaitingAdmin = !isAdminConfirmed && !casvDate;
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isInterviewDayOrPast = (casvDate && casvDate <= todayStr) || (consuladoDate && consuladoDate <= todayStr);
  const alreadyReported = !!(freshStepData as any)?.interview_outcome;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {isAwaitingAdmin ? (
        <div className="text-center py-12 px-6 bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
          <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-[28px] flex items-center justify-center mx-auto mb-8 shadow-inner">
            <RiLoader4Line className="text-4xl animate-spin" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-4 uppercase">{t.onboardingPage.f1.awaitingSchedulingF1}</h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-md mx-auto mb-8">
            {t.onboardingPage.f1.awaitingSchedulingF1Desc}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <button onClick={() => setActiveModule("guide")} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-primary flex flex-col gap-3 group">
              <RiBookOpenLine className="text-2xl text-slate-400 group-hover:text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">{t.onboardingPage.awaitingInterview.tools.guide.title}</span>
            </button>
            <button onClick={() => setActiveModule("ai")} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-primary flex flex-col gap-3 group">
              <RiRobotLine className="text-2xl text-slate-400 group-hover:text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">{t.onboardingPage.awaitingInterview.tools.ai.title}</span>
            </button>
            <button onClick={() => setActiveModule("specialist")} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-primary flex flex-col gap-3 group">
              <RiUserStarLine className="text-2xl text-slate-400 group-hover:text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">{t.onboardingPage.awaitingInterview.tools.specialist.title}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">{t.onboardingPage.f1.reportingTitle}</h2>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">{t.onboardingPage.f1.reportingSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.onboardingPage.f1.casvBiometrics}</span>
               <p className="text-xl font-black text-slate-800 mt-1">{new Date(casvDate + "T12:00:00").toLocaleDateString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
               <div className="mt-4 pt-4 border-t border-slate-50 flex gap-6">
                 <div><span className="text-[9px] font-black text-slate-400 uppercase">{t.onboardingPage.f1.hour}</span><p className="text-xs font-bold">{freshStepData.final_casv_time as string}</p></div>
                 <div><span className="text-[9px] font-black text-slate-400 uppercase">{t.onboardingPage.f1.location}</span><p className="text-xs font-bold">{freshStepData.final_casv_location as string}</p></div>
               </div>
            </div>
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.onboardingPage.f1.consulateDate}</span>
               <p className="text-xl font-black text-slate-800 mt-1">{new Date(consuladoDate + "T12:00:00").toLocaleDateString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
               <div className="mt-4 pt-4 border-t border-slate-50 flex gap-6">
                 <div><span className="text-[9px] font-black text-slate-400 uppercase">{t.onboardingPage.f1.hour}</span><p className="text-xs font-bold">{freshStepData.final_consulado_time as string}</p></div>
                 <div><span className="text-[9px] font-black text-slate-400 uppercase">{t.onboardingPage.f1.location}</span><p className="text-xs font-bold">{freshStepData.final_consulado_location as string}</p></div>
               </div>
            </div>
          </div>

          <div className="p-10 bg-slate-900 rounded-[40px] text-center space-y-8 shadow-2xl">
            {alreadyReported ? (
              <div className="space-y-6">
                 {freshStepData.interview_outcome === 'approved' ? (
                   <div className="text-white">
                     <RiCheckLine className="text-5xl text-emerald-500 mx-auto mb-4" />
                     <h4 className="text-2xl font-black uppercase text-white">{t.onboardingPage.processingStatus.outcomeApproved}</h4>
                     <button onClick={() => navigate('/dashboard')} className="mt-6 px-10 py-3 bg-primary rounded-xl font-black uppercase text-xs tracking-widest text-white">{t.onboardingPage.processingStatus.backToStart}</button>
                   </div>
                 ) : (
                   <div className="text-white space-y-6">
                     <RiCloseLine className="text-5xl text-rose-500 mx-auto mb-4" />
                     <h4 className="text-xl font-black uppercase text-white">{t.onboardingPage.processingStatus.outcomeRejected}</h4>
                     <div className="flex flex-col gap-3 max-w-sm mx-auto">
                        <button onClick={() => navigate('/checkout/consultoria-f1-negativa')} className="py-4 bg-primary rounded-xl font-black uppercase text-xs tracking-widest text-white">{t.onboardingPage.processingStatus.consultationSpecialist}</button>
                        <button onClick={() => navigate('/checkout/visto-f1-reaplicacao')} className="py-4 bg-white/10 rounded-xl font-black uppercase text-xs tracking-widest text-white">{t.onboardingPage.processingStatus.restartProcess}</button>
                     </div>
                   </div>
                 )}
              </div>
            ) : isInterviewDayOrPast ? (
              <div className="space-y-6">
                 <h4 className="text-xl font-black text-white uppercase">{t.onboardingPage.processingStatus.howWasOutcome}</h4>
                 <div className="flex gap-4 max-w-sm mx-auto">
                   <button onClick={() => handleReportOutcome('approved')} disabled={loading} className="flex-1 h-14 bg-emerald-500 text-white rounded-xl font-black uppercase">{t.onboardingPage.processingStatus.iWasApproved}</button>
                   <button onClick={() => handleReportOutcome('rejected')} disabled={loading} className="flex-1 h-14 bg-white/10 text-white rounded-xl font-black uppercase">{t.onboardingPage.processingStatus.iWasRefused}</button>
                 </div>
              </div>
            ) : (
                             <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{t.onboardingPage.processingStatus.nextSteps}</p>

            )}
          </div>
        </div>
      )}

      {/* Modals para Guide, AI, Specialist (similares ao B1/B2) */}
      <AnimatePresence>
        {activeModule && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl p-10 relative">
               <button onClick={() => setActiveModule(null)} className="absolute top-8 right-8 text-slate-400"><RiCloseLine className="text-2xl"/></button>
                {activeModule === "guide" && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center"><RiBookOpenLine className="text-2xl" /></div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{t.onboardingPage.f1.interviewGuideF1}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.onboardingPage.f1.interviewGuideF1Desc}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {(t.onboardingPage.f1.interviewQuestions as {q: string, a: string}[] || []).map((item, i) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[11px] font-black text-slate-700 mb-1">{item.q}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{item.a}</p>
                        </div>
                      ))}
                    </div>
                    <div className="pt-8 border-t border-slate-100 text-center">
                      <a href="/guides/f1-interview-guide.pdf" target="_blank" className="inline-flex items-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
                        {t.onboardingPage.f1.downloadGuide} <RiArrowRightLine />
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
                      <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{t.onboardingPage.f1.trainingAI}</h3>
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
                        <button onClick={handleSendChatMessage} className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-black"><RiSendPlane2Fill /></button>
                      </div>
                    </div>
                  </div>
                )}
                {activeModule === "specialist" && (
                  <div className="space-y-8">
                    {isScheduling ? (
                      <div className="relative">
                        <button onClick={() => setIsScheduling(false)} className="absolute -top-12 right-0 text-[10px] font-black uppercase text-slate-400 flex items-center gap-1"><RiCloseLine /> {t.onboardingPage.backToDashboard}</button>
                        <div className="rounded-3xl overflow-hidden border h-[500px]"><InlineWidget url={calendlyUrl} styles={{ height: '500px' }} prefill={{ email: user?.email, name: user?.fullName }} /></div>
                      </div>
                    ) : purchasedMentorship ? (
                      <div className="text-center space-y-6 py-8">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto"><RiProgress3Line className="text-4xl" /></div>
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
                        <div className="text-center"><h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Mentoria com Especialista</h3></div>
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
                  </div>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
