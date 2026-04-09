import { useState, useRef, useEffect } from "react";
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
  RiProgress3Line,
} from "react-icons/ri";
import { toast } from "sonner";
import { InlineWidget, useCalendlyEventListener } from "react-calendly";
import { useAuth } from "../../../../hooks/useAuth";
import { supabase } from "../../../../lib/supabase";
import { calendlyService } from "../../../../services/calendly.service";

interface B1B2FinalPreparationStepProps {
  procId: string;
  stepData: Record<string, unknown>;
  onComplete: () => void;
}

type PreparationModule = "guide" | "ai" | "specialist";

export function B1B2FinalPreparationStep({ procId, stepData, onComplete }: B1B2FinalPreparationStepProps) {
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

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<{ id: string, role: "user" | "bot", text: string }[]>([
    { id: "1", role: "bot", text: "Olá! Eu sou o assistente virtual da Aplikei. Estou aqui para te ajudar a praticar para sua entrevista consular. Podemos começar?" }
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
      const { data, error: _error } = await supabase
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
        .eq("service_slug", "consultoria-b1-negativa")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log("[DEBUG B1B2FinalPreparationStep] Mentorship query result:", data, "Consultation:", consultationData);

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
        toast.success("Consultoria Pós-Negativa agendada com sucesso!");
        return;
      }

      if (!purchasedMentorship || !isScheduling) return;
      const stepData = (purchasedMentorship.step_data as any) || {};
      const nextCount = (stepData.scheduled_count || 0) + 1;
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
        toast.success(`Sessão ${nextCount} agendada com sucesso!`);
        setIsScheduling(false);
      }
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
          ds160: freshStepData
        })
      });

      if (!response.ok) throw new Error("Erro de comunicação com o assistente.");

      const data = await response.json();
      const botResponse = data.output || data.response || data.text || "Desculpe, não consegui processar sua mensagem agora.";

      setChatMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "bot", text: botResponse }]);
    } catch (error) {
      console.error("Chat Error:", error);
      toast.error("Erro ao enviar mensagem.");
    } finally {
      setIsBotTyping(false);
    }
  };

  const PLANS = [
    { id: "mentoria-bronze", name: "Bronze", price: 197, interviews: 1, features: ["1 Mock Interview standard", "Plano de Estudo"] },
    { id: "mentoria-silver", name: "Prata", price: 397, interviews: 2, features: ["2 Mock Interviews", "Análise de Perfil", "Feedback Detalhado"] },
    { id: "mentoria-gold", name: "Ouro", price: 697, interviews: 3, features: ["3 Mock Interviews", "Suporte VIP WhatsApp", "Estratégia Completa"], best: true },
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

  // New Interview Result Logic
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const isInterviewDayOrPast = (casvDate && casvDate <= todayStr) || (consuladoDate && consuladoDate <= todayStr);
  const alreadyReported = !!(freshStepData as any)?.interview_outcome;

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

      setFreshStepData(prev => ({
        ...prev,
        interview_outcome: outcome,
        reported_at: new Date().toISOString()
      }));

      toast.success(outcome === 'approved' ? "Parabéns pela aprovação! 🎉" : "Resultado registrado. Estamos aqui para ajudar.");

      if (outcome === 'approved') {
        onComplete();
      }
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const RenderPreparationGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
      <button
        onClick={() => setActiveModule("guide")}
        className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-primary transition-all text-left flex flex-col gap-3 group"
      >
        <RiBookOpenLine className="text-2xl text-slate-400 group-hover:text-primary transition-colors" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">Interview Guide</span>
      </button>
      <button
        onClick={() => setActiveModule("ai")}
        className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-primary transition-all text-left flex flex-col gap-3 group"
      >
        <RiRobotLine className="text-2xl text-slate-400 group-hover:text-primary transition-colors" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">Entrevista IA</span>
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
              {allScheduled ? "Tudo Agendado" : `Agendar ${scheduledCount + 1}ª Entrevista`}
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
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">Especialista</span>
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {isAwaitingAdmin ? (
        <div className="text-center py-12 px-6 bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
          {purchasedMentorship && (
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(scheduledCount / totalInterviews) * 100}%` }}
                className="h-full bg-emerald-500"
              />
            </div>
          )}
          <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-[28px] flex items-center justify-center mx-auto mb-8 shadow-inner">
            <RiLoader4Line className="text-4xl animate-spin" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-4 uppercase">Aguardando Agendamento Final</h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-md mx-auto mb-4">
            Nossa equipe está processando o agendamento final no CASV e Consulado com base nas suas preferências.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mb-8 px-6 py-2 rounded-xl border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 mx-auto"
          >
            <RiProgress3Line className="text-lg" /> Recarregar Dados
          </button>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-md mx-auto mb-8">
            Enquanto isso, prepare-se para sua entrevista usando os recursos abaixo!
          </p>
          <RenderPreparationGrid />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Tudo Pronto!</h2>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Confira os detalhes da sua convocação</p>

            <button
              onClick={() => window.location.reload()}
              className="px-4 py-1.5 rounded-lg border border-slate-100 text-[9px] font-black text-slate-300 uppercase tracking-widest hover:text-primary transition-all flex items-center gap-2 mx-auto"
            >
              <RiProgress3Line /> Recarregar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center">
                  <RiInformationLine className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">CASV</h3>
                  <p className="text-lg font-black text-slate-800">{new Date(casvDate + "T12:00:00").toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Horário</p>
                  <p className="text-sm font-bold text-slate-800">{freshStepData.final_casv_time as string}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Local</p>
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
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Consulado</h3>
                  <p className="text-lg font-black text-slate-800">{new Date(consuladoDate + "T12:00:00").toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Horário</p>
                  <p className="text-sm font-bold text-slate-800">{freshStepData.final_consulado_time as string}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Local</p>
                  <p className="text-sm font-bold text-slate-800 leading-tight">{freshStepData.final_consulado_location as string}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-12 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40">
            <div className="text-center mb-8">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Recursos de Preparação</h3>
              <p className="text-sm text-slate-500 font-medium">Use nossos treinamentos para garantir sua aprovação</p>
            </div>
            <RenderPreparationGrid />
          </div>

          {isInterviewDayOrPast ? (
            <div className="p-10 bg-slate-900 rounded-[40px] text-center space-y-8 shadow-2xl border border-primary/20 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

              {/* Lógica de Telas Pós-Resultado */}
              {alreadyReported ? (
                <div className="animate-in fade-in zoom-in duration-500 space-y-8">
                  {freshStepData.interview_outcome === 'approved' ? (
                    <div className="space-y-6">
                      <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                        <RiCheckLine className="text-5xl" />
                      </div>
                      <h4 className="text-3xl font-black text-white uppercase tracking-tight">Visto Aprovado! 🥳</h4>
                      <p className="text-slate-400 font-medium max-w-sm mx-auto">Parabéns por essa conquista! Estamos muito felizes em fazer parte da sua jornada para os EUA.</p>
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full h-14 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-xl"
                      >
                        Ir para o Dashboard
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="w-20 h-20 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <RiCloseLine className="text-4xl" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-2xl font-black text-white uppercase tracking-tight">Não foi dessa vez...</h4>
                        <p className="text-sm text-slate-400 font-medium max-w-sm mx-auto">Sentimos muito pela negativa, mas isso não é o fim. O que você deseja fazer agora?</p>
                      </div>

                      <div className="grid grid-cols-1 gap-4 pt-4">
                        <button
                          onClick={() => navigate('/checkout/visto-b1-b2')}
                          className="p-6 bg-white/5 border border-white/10 rounded-3xl text-left hover:bg-white/10 transition-all group/opt relative overflow-hidden"
                        >
                          <div className="relative z-10">
                            <h5 className="text-white font-black uppercase text-xs tracking-widest mb-1 group-hover/opt:text-primary transition-colors">Recomeçar Processo</h5>
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Adquira um novo guia completo e inicie uma nova aplicação do zero com dados atualizados.</p>
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
                                <h5 className="text-emerald-400 font-black uppercase text-xs tracking-widest mb-1">Consultoria Ativa!</h5>
                                <p className="text-[10px] text-emerald-100/70 font-medium leading-relaxed">Clique aqui para agendar seu horário na agenda de nossos especialistas.</p>
                              </div>
                              <RiCalendarCheckLine className="text-4xl text-emerald-400/50" />
                            </div>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              console.log("[DEBUG] Clicked Consultoria Especialista. purchasedMentorship state:", purchasedMentorship);
                              navigate('/checkout/consultoria-b1-negativa');
                            }}
                            className="p-6 bg-primary/10 border border-primary/20 rounded-3xl text-left hover:bg-primary/20 transition-all group/opt relative overflow-hidden"
                          >
                            <div className="relative z-10">
                              <h5 className="text-primary font-black uppercase text-xs tracking-widest mb-1">Consultoria Especializada Pós-Negativa</h5>
                              <p className="text-[10px] text-slate-300 font-medium leading-relaxed">Sessão estratégica exclusiva para analisar erros na DS-160 e na entrevista para reverter sua negativa de forma oficial.</p>
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
                        Voltar ao Início
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative">
                    <h4 className="text-2xl font-black text-white uppercase tracking-tight mb-2">O Grande Dia Chegou! 🇺🇸</h4>
                    <p className="text-sm text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
                      Esperamos que tenha corrido tudo bem na sua entrevista. Como foi o resultado?
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 relative">
                    <button
                      disabled={loading}
                      onClick={() => handleReportOutcome('approved')}
                      className="h-16 bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                      {loading ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> Fui Aprovado! 🎉</>}
                    </button>
                    <button
                      disabled={loading}
                      onClick={() => handleReportOutcome('rejected')}
                      className="h-16 bg-white/10 text-white border border-white/10 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                      {loading ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCloseLine className="text-xl" /> Fui Reprovado 😔</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 bg-slate-900 rounded-[32px] text-center space-y-4">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Próximos Passos</h4>
              <p className="text-xs text-slate-300 font-medium">Compareça aos locais indicados com 15 minutos de antecedência.</p>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {isSchedulingConsultation && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden relative max-h-[95vh] flex flex-col">
              <button onClick={() => setIsSchedulingConsultation(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all z-10">
                <RiCloseLine className="text-xl" />
              </button>
              <div className="p-4 pt-16">
                <div className="rounded-3xl overflow-hidden border h-[700px]">
                  <InlineWidget url={consultationUrl} styles={{ height: '700px' }} prefill={{ email: user?.email, name: user?.fullName }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {activeModule && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
              <button onClick={() => setActiveModule(null)} className="absolute top-8 right-8 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all z-10">
                <RiCloseLine className="text-xl" />
              </button>
              <div className="p-8 md:p-12 overflow-y-auto">
                {activeModule === "guide" && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center"><RiBookOpenLine className="text-2xl" /></div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Interview Guide</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sua aprovação começa aqui</p>
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
                        Baixar Guia PDF Completo <RiArrowRightLine />
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
                      <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Treinamento com IA</h3>
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
                        <input type="text" placeholder="Digite sua resposta..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()} className="flex-1 px-4 py-3 bg-slate-100 rounded-xl text-xs font-bold" />
                        <button onClick={handleSendChatMessage} className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center"><RiSendPlane2Fill /></button>
                      </div>
                    </div>
                  </div>
                )}
                {activeModule === "specialist" && (
                  <div className="space-y-8">
                    {isScheduling ? (
                      <div className="relative">
                        <button onClick={() => setIsScheduling(false)} className="absolute -top-12 right-0 text-[10px] font-black uppercase text-slate-400"><RiCloseLine /> Voltar</button>
                        <div className="rounded-3xl overflow-hidden border h-[500px]"><InlineWidget url={calendlyUrl} styles={{ height: '500px' }} prefill={{ email: user?.email, name: user?.fullName }} /></div>
                      </div>
                    ) : purchasedMentorship ? (
                      <div className="text-center space-y-6 py-8">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto"><RiProgress3Line className="text-4xl" /></div>
                        <div>
                          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Mentoria Ativa</h3>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{scheduledCount} de {totalInterviews} agendadas</p>
                        </div>
                        {!allScheduled ? (
                          <button onClick={() => setIsScheduling(true)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Agendar {scheduledCount + 1}ª Entrevista</button>
                        ) : (
                          <div className="p-4 bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase rounded-2xl">Todas as sessões agendadas!</div>
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
                              <button onClick={() => handleSelectPlan(plan)} className={`mt-6 py-3 rounded-xl text-[10px] font-black uppercase ${plan.best ? "bg-primary text-white" : "bg-white border text-slate-800"}`}>Contratar</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
