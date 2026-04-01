
import React from "react";
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
    loading
  } = props;

  const getRecoveryLabel = () => {
    const type = process?.data?.recovery_type || 'motion';
    return type === 'rfe' ? 'RFE' : 'Motion';
  };

  const getRecoveryTitle = () => {
    const type = process?.data?.recovery_type || 'motion';
    return type === 'rfe' ? 'Apoio ao RFE' : 'Motion de Reconsideração';
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  if (process.status === "COS_REJECTED") {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl space-y-8"
      >
        <div className="relative overflow-hidden p-8 bg-destructive/5 border border-destructive/10 rounded-[2rem]">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <XCircle className="w-24 h-24 text-destructive" />
          </div>
          <div className="relative z-10">
            <div className="bg-destructive/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900 mb-4">Pedido não aprovado</h1>
            <p className="text-slate-600 text-lg leading-relaxed max-w-xl">
              Nossa equipe técnica identificou que seu caso ainda tem chances significativas através de um <strong>Motion de Reconsideração</strong>. Nossos especialistas estão prontos para reavaliar sua situação e preparar uma defesa robusta.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-3xl border border-border bg-background flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold">Análise Especializada</h3>
            <p className="text-sm text-muted-foreground">Revisão detalhada da carta de recusa do USCIS por profissionais.</p>
          </div>
          <div className="p-6 rounded-3xl border border-border bg-background flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 mb-2">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold">Prazos e Rigor</h3>
            <p className="text-sm text-muted-foreground">O Motion possui prazos curtos (geralmente 30 dias). Não perca tempo.</p>
          </div>
        </div>

        <Button 
          size="lg" 
          className="w-full h-16 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 group" 
          onClick={() => {
            (supabase as any).from("user_services").update({ data: { ...process.data, recovery_type: "motion" } }).eq("id", process.id);
            const action = process.serviceSlug === "extensao-status" ? "eos_analyst" : "cos_analyst";
            navigate(`/checkout/analise-especialista-cos?serviceId=${process.id}&action=${action}`);
          }}
        >
          Iniciar Reavaliação do Caso
          <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>
    );
  }

  if (process.status === "COS_CASE_FORM") {
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
            <span className="font-black uppercase tracking-[0.2em] text-xs leading-none">{getRecoveryTitle()}</span>
          </div>
          <h2 className="text-3xl font-display font-bold tracking-tight">Instruções para o Especialista</h2>
          <p className="text-slate-500 text-lg leading-snug">Forneça os detalhes necessários para que nossa equipe técnica possa preparar sua petição.</p>
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

  if (process.status === "ANALISE_PENDENTE") {
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
           Nossos especialistas estão revisando seus documentos agora mesmo. 
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

  if (process.status === "ANALISE_CONCLUIDA" && recoveryCase) {
    const checkoutLabel = process.data?.recovery_type === 'rfe' ? 'Apoio ao RFE' : 'Motion de Reconsideração';
    const checkoutSlug = process.data?.recovery_type === 'rfe' ? 'rfe-support' : 'motion-reconsideracao-cos';
    
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl space-y-8"
      >
        <div className="bg-primary p-10 text-white rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-primary/20">
          <div className="absolute -right-16 -top-16 p-20 opacity-10 bg-white rounded-full" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-display font-bold leading-tight">Análise concluída com sucesso</h2>
              <p className="text-primary-foreground/80 text-lg">Proposta técnica e financeira disponível para seu {getRecoveryLabel()}.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-8 py-4 rounded-3xl border border-white/20 text-center">
              <span className="block text-[10px] uppercase font-bold tracking-widest text-white/60 mb-1">Valor da Proposta</span>
              <span className="text-3xl font-bold">US$ {recoveryCase.proposal_value_usd}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 italic">
            <FileText className="w-4 h-4" />
            Parecer do Especialista
          </h3>
          <div className="p-8 bg-background border border-border shadow-sm rounded-[2rem] whitespace-pre-wrap leading-loose text-slate-700 text-lg">
            {recoveryCase.admin_analysis}
          </div>
        </div>

        <Button 
          size="lg" className="w-full h-20 text-2xl font-display font-bold bg-primary hover:bg-primary/90 rounded-3xl shadow-2xl shadow-primary/30 group" 
          onClick={() => navigate(`/checkout/${checkoutSlug}?serviceId=${process.id}&action=cos_recovery&amount=${recoveryCase.proposal_value_usd}`)}
        >
          Contratar {checkoutLabel}
          <div className="ml-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-2 transition-transform">
             <ChevronRight className="w-6 h-6" />
          </div>
        </Button>
      </motion.div>
    );
  }

  if (process.status === "COS_MOTION_IN_PROGRESS") {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl space-y-10 text-center py-24 px-8 border-2 border-dashed border-primary/20 rounded-[3rem] bg-primary/5"
      >
         <div className="relative inline-flex mx-auto">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping scale-150 duration-[3000ms]" />
            <div className="relative w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl">
               <Clock className="w-16 h-16 text-primary" />
            </div>
         </div>
         <div className="space-y-4">
           <h2 className="text-4xl font-display font-bold text-slate-900">Pagamento confirmado!</h2>
           <p className="text-slate-500 text-xl max-w-md mx-auto leading-relaxed">
             Excelente! Nossa equipe já está trabalhando na elaboração da sua resposta técnica ao {getRecoveryLabel()}.
           </p>
         </div>
         <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-white max-w-sm mx-auto shadow-sm">
            <p className="text-sm text-slate-600">
               Fique atento ao seu e-mail e a este painel para o envio dos documentos finais.
            </p>
         </div>
         <Button 
            variant="outline" 
            size="lg" 
            onClick={fetchProcess} 
            className="h-16 px-12 rounded-2xl border-primary/20 bg-white hover:bg-primary/5 font-bold text-lg group transition-all"
         >
            <Loader2 className={cn("mr-3 h-5 w-5", loading && "animate-spin")} />
            Verificar status agora
         </Button>
      </motion.div>
    );
  }

  if (process.status === "COS_MOTION_COMPLETED") {
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
                <p className="text-slate-500 font-medium tracking-wide">Seu pacote de defesa técnica foi finalizado com sucesso.</p>
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
              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 leading-[1.8] text-slate-700 text-lg shadow-inner italic">
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
                <p className="text-slate-500 max-w-md mx-auto text-lg leading-relaxed">Assim que receber a carta oficial de decisão do USCIS, nos informe abaixo para atualizarmos seu status no sistema.</p>
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
