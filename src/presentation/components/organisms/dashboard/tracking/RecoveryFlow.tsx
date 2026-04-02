
import React, { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { 
  CheckCircle2, 
  XCircle, 
  Plus, 
  FileText, 
  Clock, 
  ExternalLink,
  Loader2,
  AlertTriangle,
  Send,
  Download,
  Info,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { Button } from "@/presentation/components/atoms/button";
import { Badge } from "@/presentation/components/atoms/badge";
import { UserProcess } from "@/domain/user/UserEntities";
import { supabase } from "@/integrations/supabase/client";
import { FormTextarea } from "@/presentation/components/atoms/form/FormFields";
import { cn } from "@/lib/utils";

interface RecoveryFlowProps {
  process: UserProcess;
  recoveryCase: any;
  explanation: string;
  setExplanation: (v: string) => void;
  isUpdatingStatus: boolean;
  handleSubmitAnalysis: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fetchProcess: () => void;
  handleManualRefresh: () => void;
  setSelectedOutcome: (v: string) => void;
  setIsConfirmOpen: (v: boolean) => void;
  navigate: (path: string) => void;
  loading?: boolean;
  userEmail?: string;
}

export const RecoveryFlow: React.FC<RecoveryFlowProps> = (props) => {
  const { 
    process, 
    recoveryCase, 
    explanation, 
    setExplanation, 
    isUpdatingStatus, 
    handleSubmitAnalysis, 
    handleFileUpload,
    fetchProcess,
    handleManualRefresh,
    setSelectedOutcome,
    setIsConfirmOpen,
    navigate,
    loading,
    userEmail
  } = props;

  const isEos = process.serviceSlug === "extensao-status";
  const serviceName = isEos ? "Extensão de Status" : "Troca de Status (COS)";

  const handleAutoSkip = async (nextStatus: string) => {
    try {
      const { error: updateError } = await supabase
        .from("user_services")
        .update({ status: nextStatus })
        .eq("id", process.id);
      
      if (updateError) throw updateError;
      fetchProcess();
    } catch (err) {
      console.error("[RecoveryFlow] Error in auto-skip:", err);
    }
  };

  const getRecoveryType = () => {
    // Robust detection order
    if (status?.includes("_RFE")) return "rfe";
    if (recoveryCase?.recovery_type === "rfe") return "rfe";
    
    const metadata = process?.service_metadata as any;
    if (metadata?.recovery_type === "rfe") return "rfe";
    
    // Fallback to what TrackingTab says or default to motion
    return process?.data?.recovery_type || "motion";
  };

  const getRecoveryLabel = () => {
    return getRecoveryType() === "rfe" ? "RFE" : "Motion";
  };

  const getRecoveryTitle = () => {
    return getRecoveryType() === "rfe" ? "Apoio ao RFE" : "Motion de Reconsideração";
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const status = process.status;
  console.log(`[RecoveryFlow] Status: ${status}, Case:`, recoveryCase);
  
  // Define status flags at the top level
  const isRfeStatus = status.includes("RFE") || getRecoveryType() === "rfe";
  const isRfeType = getRecoveryType() === "rfe";
  const isRfeFlow = isRfeType;


  // Backup verification: check if user already paid but webhook failed/delayed
  useEffect(() => {
    let isSubscribed = true;
    
    // Check for payments when in these specific states
    const shouldCheck = 
      isRfeFlow ||
      status.includes("ANALISE_CONCLUIDA") ||
      status.includes("CASE_FORM") ||
      status.includes("_IN_PROGRESS") ||
      (status.endsWith("_REJECTED") && !recoveryCase) ||
      recoveryCase?.status === 'proposal_sent' ||
      recoveryCase?.status === 'accepted';

    if (shouldCheck) {
      const verifyPayment = async () => {
        try {
          const { data, error } = await supabase
            .from("visa_orders")
            .select("id, user_id, client_email, payment_metadata, payment_status")
            .or(`user_id.eq.${process.userId}${userEmail ? `,client_email.eq.${userEmail}` : ""}`)
            .eq("payment_status", "paid")
            .order("created_at", { ascending: false })
            .limit(10);
            
          if (!error && data && isSubscribed) {
             console.log(`[RecoveryFlow] Found ${data.length} recent paid orders for ${userEmail || process.userId}. Checking matches for process ${process.id}...`);
             
             // PRIORITY: Look for RFE payments first, regardless of the current detected type
              const rfeActions = ['rfe_recovery', 'rfe_analyst', 'rfe_support', 'cos_analyst', 'eos_analyst'];
              const motionActions = [
                'eos_recovery', 'cos_recovery', 'cos_analyst', 'eos_analyst', 
                'cos_motion', 'eos_motion', 'motion_recovery', 'specialist_review', 'specialist_training'
              ];

              // Find any RFE payment for this service
              const rfePayment = data.find(order => {
                const meta = order.payment_metadata as any;
                const orderServiceId = meta.serviceId || meta.service_id;
                const orderAction = meta.action || meta.type;
                return (orderServiceId === process.id) && rfeActions.includes(orderAction);
              });

              let paidOrder = rfePayment;
              let isConfirmedRfe = !!rfePayment;

              // If no RFE payment, look for Motion payments
              if (!paidOrder) {
                paidOrder = data.find(order => {
                  const meta = order.payment_metadata as any;
                  const orderServiceId = meta.serviceId || meta.service_id;
                  const orderAction = meta.action || meta.type;
                  return (orderServiceId === process.id) && motionActions.includes(orderAction);
                });
              }

              if (paidOrder) {
                const meta = paidOrder.payment_metadata as any;
                const orderAction = meta.action || meta.type;
                const prefix = isEos ? 'EOS' : 'COS';
                
                let nextStatus = "";
                if (isRfeFlow) {
                  // If it's an RFE flow, we always want CASE_FORM or RFE_IN_PROGRESS
                  if (['rfe_analyst', 'rfe_support', 'cos_analyst', 'eos_analyst'].includes(orderAction)) {
                    if (!status.endsWith("_REJECTED")) nextStatus = `${prefix}_CASE_FORM`;
                  } else {
                    nextStatus = `${prefix}_RFE_IN_PROGRESS`;
                  }
                } else {
                  // Standard Motion logic
                  if (['cos_analyst', 'eos_analyst', 'rfe_analyst', 'specialist_review', 'specialist_training'].includes(orderAction)) {
                    if (!status.endsWith("_REJECTED")) nextStatus = `${prefix}_CASE_FORM`;
                  } else {
                    nextStatus = `${prefix}_MOTION_IN_PROGRESS`;
                  }
                }   
                // Guard: Only auto-skip if we are in a "starting" state (RFE, REJECTED, TRACKING)
                // If we are already in CASE_FORM or beyond, don't let analysis payments pull us back.
                const isStartingState = 
                  status.includes("TRACKING") || 
                  status.endsWith("_RFE") || 
                  status.endsWith("_REJECTED");

                if (isStartingState && nextStatus && nextStatus !== process.status) {
                  console.log(`[RecoveryFlow] Automatic skip detected! Advancing ${process.id} to ${nextStatus}`);
                  handleAutoSkip(nextStatus);
                }

                // 2. Update recovery case status to 'accepted' only if we are still in a starting state
                // This prevents resetting 'pending' (instructions sent) back to 'accepted' (payment only)
                if (isStartingState && recoveryCase && recoveryCase.status !== 'accepted' && recoveryCase.status !== 'completed' && recoveryCase.status !== 'proposal_sent') {
                  console.log(`[RecoveryFlow] Updating recovery case ${recoveryCase.id} to accepted`);
                  await supabase.from('cos_recovery_cases').update({ status: 'accepted' }).eq('id', recoveryCase.id);
                  fetchProcess();
                }
                // Safety check: if we are in CASE_FORM but the matching payment was an RFE payment and now we are in Motion context
                // OR if we are stuck in CASE_FORM but have no recent accepted status on the case
                if (status.includes("CASE_FORM") && !isRfeFlow && orderAction.includes('rfe_')) {
                  console.log("[RecoveryFlow] Safety reset: Detected RFE payment being used for Motion CASE_FORM. Reverting to REJECTED.");
                  handleAutoSkip(`${prefix}_REJECTED`);
                }
             } else {
               console.log("[RecoveryFlow] No matching paid recovery order found in recent history.");
               
               // High-level safety: if in CASE_FORM but case status is not accepted/completed, someone might be stuck
               if (status.includes("CASE_FORM") && recoveryCase && recoveryCase.status === 'pending') {
                 // Double check if it was already submitted. If not, and no payment found, maybe revert.
                 // For now, let's just log.
                 console.log("[RecoveryFlow] Process in CASE_FORM but no payment found and status is pending.");
               }
             }
          }
        } catch(e) {
          console.error("[RecoveryFlow] Payment verification error:", e);
        }
      };
      
      verifyPayment();
    }
    return () => { isSubscribed = false; };
  }, [status, process.id, process.userId, isEos, fetchProcess, isRfeStatus, recoveryCase]);

  if ((status.endsWith("_REJECTED") || isRfeStatus) && !status.includes("CASE_FORM") && !status.includes("_IN_PROGRESS") && !recoveryCase) {
    const bannerColor = isRfeStatus ? "bg-amber-500/5 border-amber-500/10" : "bg-destructive/5 border-destructive/10";
    const iconColor = isRfeStatus ? "text-amber-500" : "text-destructive";
    const recoveryTitle = isRfeStatus ? "RFE Recebido (Solicitação de Evidência)" : `Pedido não aprovado (${serviceName})`;
    const recoveryMsg = isRfeStatus 
      ? `O USCIS enviou uma solicitação de evidência (RFE) para seu caso. Nossos especialistas estão prontos para analisar a exigência e preparar uma resposta técnica robusta.`
      : `Nossa equipe técnica identificou que seu caso ainda tem chances significativas através de um Motion de Reconsideração focado em ${serviceName}.`;

    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl space-y-8"
      >
        <div className={cn("relative overflow-hidden p-8 rounded-[2rem] border", bannerColor)}>
          <div className="absolute top-0 right-0 p-8 opacity-10">
            {isRfeStatus ? <AlertTriangle className="w-24 h-24 text-amber-500" /> : <XCircle className="w-24 h-24 text-destructive" />}
          </div>
          <div className="relative z-10">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", isRfeStatus ? "bg-amber-500/10" : "bg-destructive/10")}>
              <AlertTriangle className={cn("w-6 h-6", iconColor)} />
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900 mb-4">{recoveryTitle}</h1>
            <p className="text-slate-600 text-lg leading-relaxed max-w-xl">
              {recoveryMsg}
            </p>
            {isRfeStatus && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 text-amber-800 font-bold border border-amber-200">
                <Clock className="w-4 h-4" />
                Vencimento: Você tem um prazo de 33 dias para responder
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-3xl border border-border bg-background flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold">Análise Especializada</h3>
            <p className="text-sm text-muted-foreground">Revisão detalhada da carta oficial do USCIS por profissionais.</p>
          </div>
          <div className="p-6 rounded-3xl border border-border bg-background flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 mb-2">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold">Prazos e Rigor</h3>
            <p className="text-sm text-muted-foreground">{isRfeStatus ? "O prazo legal é curto. Perder o prazo causará a negativa total do processo." : "O Motion possui prazos curtos (33 dias). Não perca tempo."}</p>
          </div>
        </div>

        <Button 
          size="lg" 
          className="w-full h-16 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 group" 
          onClick={async () => {
            const isEosLocal = status.startsWith("EOS_");
            const recoveryType = isRfeStatus ? "rfe" : "motion";
            
            // Persistir o tipo de recuperação para o fluxo correto
            const { data: current } = await supabase.from("user_services").select("service_metadata").eq("id", process.id).single();
            const currentMeta = (current as any)?.service_metadata || {};
            await (supabase as any).from("user_services").update({ service_metadata: { ...currentMeta, recovery_type: recoveryType } }).eq("id", process.id);
            
            const checkoutId = isEosLocal ? "analise-especialista-eos" : "analise-especialista-cos";
            const action = isEosLocal ? "eos_analyst" : "cos_analyst";
            
            navigate(`/checkout/${checkoutId}?serviceId=${process.id}&action=${action}`);
          }}
        >
          {isRfeStatus ? "Solicitar Apoio ao RFE" : "Iniciar Reavaliação do Caso"}
          <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>
    );
  }

  if (status.endsWith("_CASE_FORM")) {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl space-y-8"
      >
        <div className="flex flex-col space-y-1.5 border-b border-border/50 pb-6">
          <div className="flex items-center gap-3 text-primary mb-1">
            <Plus className="w-6 h-6" />
            <span className="font-black uppercase tracking-[0.2em] text-xs leading-none">{getRecoveryTitle()} - {serviceName}</span>
          </div>
          <h2 className="text-3xl font-display font-bold tracking-tight">Instruções para o Especialista</h2>
          <p className="text-slate-500 text-lg leading-snug">
            Forneça os detalhes necessários para que nossa equipe técnica possa preparar sua {getRecoveryType() === "rfe" ? "resposta ao RFE" : "petição de Motion"} de {isEos ? "Extensão" : "Troca de Status"}.
          </p>
        </div>

        <div className="space-y-8">
          <FormTextarea 
            label={`O que diz o seu ${getRecoveryLabel()}?`}
            placeholder={`Descreva aqui os pontos principais, motivos alegados pelo USCIS ou dúvidas pendentes...`} 
            value={explanation} 
            onChange={e => setExplanation(e.target.value)}
            className="min-h-[220px]"
            icon={<Info className="w-5 h-5" />}
            required
            hint="Seja o mais detalhado possível para uma resposta mais eficaz."
          />

          <div className="space-y-4 p-6 rounded-3xl border-2 border-dashed border-border hover:border-primary/30 transition-all bg-muted/20 relative group">
            <input 
              type="file" 
              multiple 
              onChange={handleFileUpload} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
            />
            <div className="flex flex-col items-center justify-center text-center p-4">
              <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <p className="font-bold text-foreground">Anexar cópia do {getRecoveryLabel()} oficial</p>
              <p className="text-sm text-muted-foreground mt-1 text-balance">Arraste os arquivos ou clique para selecionar (Opcional, mas altamente recomendado)</p>
            </div>
          </div>

          <Button 
            className="w-full h-16 text-xl font-bold bg-primary hover:bg-primary/90 rounded-2xl shadow-xl shadow-primary/20 group" 
            onClick={handleSubmitAnalysis} 
            disabled={!explanation.trim() || isUpdatingStatus}
          >
            {isUpdatingStatus ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Send className="mr-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            )}
            {isUpdatingStatus ? "Enviando dados..." : `Solicitar análise de ${getRecoveryLabel()}`}
          </Button>
        </div>
      </motion.div>
    );
  }

  if (status.includes("ANALISE_PENDENTE") || recoveryCase?.status === 'pending') {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl py-24 text-center space-y-6"
      >
        <div className="relative inline-flex mb-8">
           <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping scale-150 duration-[2000ms]" />
           <div className="relative w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center">
              <Clock className="w-10 h-10 text-primary" />
           </div>
        </div>
        <h2 className="text-3xl font-display font-bold">Análise técnica em andamento</h2>
        <p className="text-slate-500 text-lg max-w-md mx-auto">
           Nossos especialistas estão revisando seus documentos de {serviceName} agora mesmo. 
           <span className="block mt-2 font-medium text-primary italic">O tempo médio de resposta é de 24 horas úteis.</span>
        </p>
        <div className="pt-8 flex justify-center">
           <Badge variant="outline" className="px-4 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border-amber-200 uppercase tracking-widest">
              Aguardando Resposta do Analista
           </Badge>
        </div>
      </motion.div>
    );
  }

  if ((status.includes("ANALISE_CONCLUIDA") || recoveryCase?.status === 'proposal_sent') && recoveryCase) {
    const isRfe = isRfeType;
    const checkoutLabel = isRfe ? 'Apoio ao RFE' : 'Motion de Reconsideração';
    
    let checkoutSlug = isRfe ? 'rfe-support' : 'motion-reconsideracao-cos';
    if (!isRfe && isEos) checkoutSlug = 'motion-reconsideracao-eos';

    const action = isRfe ? 'rfe_recovery' : (isEos ? 'eos_recovery' : 'cos_recovery');
    
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl space-y-10"
      >
        {/* Banner Premium Header */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-800 p-10 text-white shadow-2xl shadow-blue-900/20 border border-white/10 group">
          <div className="absolute -right-20 -top-20 z-0 h-64 w-64 rounded-full bg-white opacity-5 blur-3xl transition-transform duration-700 group-hover:scale-150" />
          <div className="absolute -bottom-32 -left-20 z-0 h-64 w-64 rounded-full bg-blue-400 opacity-20 blur-3xl transition-transform duration-1000 group-hover:translate-x-10" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-100 backdrop-blur-md border border-white/10 shadow-sm">
                <CheckCircle2 className="h-4 w-4 text-green-300" />
                Análise Aprovada
              </div>
              <h2 className="text-3xl font-display font-extrabold leading-tight text-white drop-shadow-md">
                Proposta Pronta para seu {getRecoveryLabel()}
              </h2>
              <p className="text-blue-100/90 text-[15px] max-w-sm leading-relaxed font-medium">
                Nossos especialistas revisaram seu caso e elaboraram a estratégia ideal para reverter a decisão.
              </p>
            </div>
            
            <div className="flex flex-col items-center justify-center rounded-3xl bg-white/10 p-6 backdrop-blur-xl border border-white/20 shadow-xl transition-all hover:bg-white/15 min-w-[200px]">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 mb-1 opacity-90">
                Valor do Serviço
              </span>
              <div className="flex items-baseline gap-1 mt-1 drop-shadow-md">
                <span className="text-lg font-bold text-white/80">US$</span>
                <span className="text-5xl font-black text-white tracking-tight">
                  {recoveryCase.proposal_value_usd}
                </span>
              </div>
              <div className="mt-3 text-center border-t border-white/10 pt-3 w-full space-y-1">
                <div className="inline-flex items-center gap-1.5 bg-emerald-400/10 px-2.5 py-1 rounded-md text-emerald-300 border border-emerald-400/20">
                  <span className="text-[10px] font-black uppercase tracking-wider">Desconto Aplicado</span>
                  <span className="text-[10px] font-bold bg-emerald-400/20 px-1.5 py-0.5 rounded">- US$ 50.00</span>
                </div>
                <p className="text-[9px] text-blue-200 uppercase tracking-widest mt-1 opacity-80 leading-relaxed max-w-[160px] mx-auto">
                  Referente à taxa da sua análise inicial
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Parecer do Especialista Section */}
        <div className="space-y-4 px-2">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-3">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-amber-500/10 text-amber-600">
              <Info className="w-3.5 h-3.5" />
            </div>
            Comentários do Especialista
          </h3>
          
          <div className="p-6 md:p-8 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200 dark:border-slate-800 shadow-sm rounded-[1.5rem] relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400/50 rounded-l-[1.5rem]" />
            {recoveryCase.admin_analysis ? (
              <p className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300 text-[15px] font-medium">
                {recoveryCase.admin_analysis}
              </p>
            ) : (
              <p className="text-slate-400 dark:text-slate-500 italic text-[15px] text-center py-4">
                "Não há comentários adicionais. Prossiga com a contratação para iniciar o processo."
              </p>
            )}
          </div>
        </div>

        {/* Call to Action Button */}
        <div className="pt-4 pb-12 w-full max-w-xl mx-auto">
          <Button 
            size="lg" 
            className="w-full h-[4.5rem] text-lg font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-2xl shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98] group overflow-hidden relative border-none"
            onClick={() => navigate(`/checkout/${checkoutSlug}?serviceId=${process.id}&action=${action}&amount=${recoveryCase.proposal_value_usd}`)}
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <span className="relative z-10 flex items-center justify-center gap-3">
              Contratar {checkoutLabel}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 dark:bg-slate-900/10 group-hover:translate-x-1 transition-transform">
                <ChevronRight className="h-4 w-4" />
              </div>
            </span>
          </Button>
          <p className="text-center mt-4 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Pagamento seguro. Suporte completo incluso.
          </p>
        </div>
      </motion.div>
    );
  }

  // 4. Stage: Specialist is preparing the delivery
  if (status.includes("_MOTION_IN_PROGRESS") || status.includes("_RFE_IN_PROGRESS") || recoveryCase?.status === 'accepted') {
    const prefix = status.split('_')[0];
    
    const handleSetAsRfe = async () => {
      try {
        const { data: current, error: fetchErr } = await supabase
          .from("user_services")
          .select("service_metadata")
          .eq("id", process.id)
          .single();

        if (fetchErr) throw fetchErr;

        const currentMeta = (current as any)?.service_metadata || {};
        const mergedMetadata = { ...currentMeta, recovery_type: 'rfe' };

        // Update 1: Service Metadata
        const { error: updateErr } = await supabase
          .from("user_services")
          .update({ 
            // @ts-ignore
            service_metadata: mergedMetadata 
          } as any)
          .eq("id", process.id);
        
        if (updateErr) throw updateErr;

        // Update 2: Recovery Case Record (to be 100% sure)
        if (recoveryCase?.id) {
          await supabase
            .from("cos_recovery_cases")
            .update({ recovery_type: 'rfe' } as any)
            .eq("id", recoveryCase.id);
        }

        // Return to instructions so user can explain the RFE
        handleAutoSkip(`${prefix}_CASE_FORM`);
      } catch (err) {
        console.error("Error setting as rfe:", err);
      }
    };

    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl space-y-8"
      >
        <div className="text-center py-12 px-8 border-2 border-dashed border-primary/20 rounded-[3rem] bg-primary/5 space-y-8">
           <div className="relative inline-flex mx-auto">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping scale-150 duration-[3000ms]" />
              <div className="relative w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl">
                 <Clock className="w-16 h-16 text-primary" />
              </div>
           </div>
           
            <div className="space-y-4">
              <h2 className="text-4xl font-display font-bold text-slate-900">Pagamento confirmado!</h2>
              <div className="max-w-md mx-auto space-y-4">
                <p className="text-xl text-slate-600 leading-relaxed font-medium">
                  Excelente! Nossa equipe já está trabalhando na elaboração da sua resposta técnica de {process?.productType === 'EOS' ? 'Extensão de Status (EOS)' : 'Troca de Status (COS)'}.
                </p>
                <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  O especialista está preparando a entrega do seu {getRecoveryType() === 'rfe' ? 'RFE' : 'Motion'}
                </div>
              </div>
            </div>
           
           <div className="flex flex-col gap-4 items-center">
              <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-white max-w-sm mx-auto shadow-sm">
                  <p className="text-sm text-slate-600">
                      {recoveryCase?.explanation 
                          ? `Já recebemos seu pagamento e as instruções do seu ${getRecoveryLabel()}. Nossa equipe está finalizando os documentos agora.`
                          : isRfeType 
                              ? "Para que possamos começar agora mesmo, precisamos que você nos conte o que o USCIS solicitou." 
                              : "Recebemos o pagamento do seu Motion e estamos preparando os documentos. Fique atento a este painel."}
                  </p>
              </div>

              {isRfeType && !recoveryCase?.explanation && (
                  <Button 
                      onClick={() => handleAutoSkip(`${prefix}_CASE_FORM`)}
                      className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 font-bold text-md shadow-lg shadow-primary/20"
                  >
                      Definir Instruções do {getRecoveryLabel()}
                  </Button>
              )}
              
              <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={fetchProcess} 
                  className="text-slate-400 hover:text-primary font-bold text-xs uppercase tracking-widest"
              >
                  <Loader2 className={cn("mr-2 h-3 w-3", loading && "animate-spin")} />
                  Sincronizar status
              </Button>
           </div>
        </div>

        {!isRfeType && (
          <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-200/50 flex items-center justify-center text-amber-700">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-amber-900">Seu caso é um RFE?</p>
                <p className="text-sm text-amber-700/80 leading-snug">Se o USCIS solicitou evidências em vez de negar seu caso, altere para o fluxo de RFE agora.</p>
              </div>
            </div>
            <Button 
              variant="outline"
              onClick={handleSetAsRfe}
              className="whitespace-nowrap h-12 px-6 rounded-xl border-amber-300 text-amber-900 hover:bg-amber-100 font-bold"
            >
              Marcar como RFE
            </Button>
          </div>
        )}
      </motion.div>
    );
  }

  // 5. Final Stage: Case Completed (Success)
  if (status.includes("_MOTION_COMPLETED") || status.includes("_RFE_COMPLETED") || recoveryCase?.status === 'completed') {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto space-y-8 pb-20"
      >
        <div className="bg-card border border-border rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="px-10 py-8 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-blue-600/5 to-transparent">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-display font-bold text-slate-900">Documentação {getRecoveryLabel()} Pronta</h2>
                <p className="text-slate-500 font-medium tracking-wide">Seu pacote de defesa técnica para {serviceName} foi finalizado.</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleManualRefresh}
              className="h-12 px-6 rounded-2xl bg-slate-50 text-slate-500 hover:text-blue-600 gap-2 border border-slate-100 font-bold"
            >
              <Loader2 className={cn("w-4 h-4", loading && "animate-spin")} />
              <span>Sincronizar Arquivos</span>
            </Button>
          </div>

          <div className="p-10 space-y-10">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 mb-4 italic">
                <Send className="h-3 w-3" />
                Mensagem Final do Especialista
              </h4>
              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 leading-[1.8] text-slate-700 text-[15px] shadow-inner italic">
                {recoveryCase?.admin_final_message || "O analista está finalizando o envio informativo..."}
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 mb-4 italic">
                <Download className="h-3 w-3" />
                Arquivos para Envio ao USCIS
              </h4>
              
              {recoveryCase?.final_document_urls && recoveryCase.final_document_urls.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recoveryCase.final_document_urls.map((url: string, i: number) => (
                    <a 
                      key={i} href={url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-5 p-6 bg-background border border-border rounded-3xl hover:border-primary/50 hover:bg-primary/5 transition-all group relative shadow-sm"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[10px] uppercase font-bold text-slate-400">PDF Document</span>
                         <span className="font-bold text-slate-700">Documento de Defesa #{i+1}</span>
                      </div>
                      <div className="absolute right-6 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all">
                        <ExternalLink className="w-5 h-5 text-primary" />
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center border-2 border-dashed rounded-[2.5rem] text-slate-400 bg-slate-50/50">
                  <FileText className="w-10 h-10 mx-auto mb-4 opacity-20" />
                  <p className="font-medium text-lg leading-snug max-w-xs mx-auto">Nenhum arquivo final foi disponibilizado até o momento.</p>
                </div>
              )}
            </div>

            <div className="pt-10 mt-6 border-t border-slate-100 flex flex-col items-center text-center space-y-8">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest leading-none mb-2">
                   Fase Final: Verificação do USCIS
                </div>
                <h4 className="text-2xl font-display font-bold text-slate-900">Já recebeu o resultado oficial?</h4>
                <p className="text-slate-500 max-w-md mx-auto text-[15px] leading-relaxed">Assim que receber a carta oficial de decisão do USCIS, nos informe abaixo para atualizarmos seu status no sistema.</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
                <Button 
                  className="h-16 flex-1 font-bold bg-green-500 hover:bg-green-600 text-lg rounded-2xl shadow-lg shadow-green-500/10" 
                  onClick={() => { setSelectedOutcome("approved"); setIsConfirmOpen(true); }}
                >
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Fui aprovado!
                </Button>
                <Button 
                  variant="outline"
                  className="h-16 flex-1 font-bold border-destructive/20 text-destructive hover:bg-destructive/5 text-lg rounded-2xl" 
                  onClick={() => { setSelectedOutcome("rejected"); setIsConfirmOpen(true); }}
                >
                  <XCircle className="mr-2 h-5 w-5" />
                  Foi negado
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
};
