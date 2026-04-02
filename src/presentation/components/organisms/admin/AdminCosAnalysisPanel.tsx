import { useState, useEffect } from "react";
import { Button } from "@/presentation/components/atoms/button";
import { Input } from "@/presentation/components/atoms/input";
import { Badge } from "@/presentation/components/atoms/badge";
import { toast } from "sonner";
import {
  FileText,
  MessageSquare,
  DollarSign,
  Send,
  ExternalLink,
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  User,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import { AdminAnalysisService, type RecoveryCase } from "@/application/services/admin/AdminAnalysisService";
import { useT } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

interface Props {
  userServiceId: string | null;
  clientName?: string | null;
}

export function AdminCosAnalysisPanel({ userServiceId, clientName }: Props) {
  const t = useT("admin");
  const [recoveryCase, setRecoveryCase] = useState<RecoveryCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Admin form fields
  const [adminAnalysis, setAdminAnalysis] = useState("");
  const [proposalValue, setProposalValue] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  
  // Fulfillment fields
  const [adminFinalMessage, setAdminFinalMessage] = useState("");
  const [finalDocumentUrls, setFinalDocumentUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [serviceSlug, setServiceSlug] = useState("");
  const [recoveryType, setRecoveryType] = useState<"rfe" | "motion">("motion");
  const [userServiceStatus, setUserServiceStatus] = useState<string>("");
  const [productType, setProductType] = useState<string | null>(null);

  useEffect(() => {
    if (!userServiceId) { setLoading(false); return; }
    fetchCase();
  }, [userServiceId]);

  const getStatusPrefix = () => productType ? `${productType}_` : (serviceSlug === "extensao-status" ? "EOS_" : "COS_");
  const getLabel = () => recoveryType === "rfe" ? "RFE" : "Motion";

  const fetchCase = async () => {
    setLoading(true);
    try {
      const { recoveryCase: rc, userService: us } = await AdminAnalysisService.fetchCase(userServiceId!);

      if (rc) {
        setRecoveryCase(rc);
        setAdminAnalysis(rc.admin_analysis || "");
        setProposalValue(rc.proposal_value_usd?.toString() || "");
        setAdminNotes(rc.admin_notes || "");
        setAdminFinalMessage(rc.admin_final_message || "");
        setFinalDocumentUrls(rc.final_document_urls || []);
      }

      setUserServiceStatus(us.status || "");
      setServiceSlug(us.service_slug || "");
      setProductType(us.product_type || null);
      
      const metadata = us.service_metadata as any;
      
      // Detecção robusta do tipo de recuperação
      let detectedType: "rfe" | "motion" = "motion";
      if (us.status?.includes("RFE_IN_PROGRESS") || us.status?.includes("_RFE") || metadata?.recovery_type === "rfe" || rc?.recovery_type === "rfe") {
        detectedType = "rfe";
      } else if (us.status?.includes("MOTION") || metadata?.recovery_type === "motion" || rc?.recovery_type === "motion") {
        detectedType = "motion";
      }
      
      setRecoveryType(detectedType);
      console.log(`[AdminAnalysis] Status: ${us.status}, Case Status: ${rc?.status}, DetectedType: ${detectedType}`);
      
    } catch (error: any) {
      console.error("Error saving case:", error);
      toast.error(t.analysisPanel.messages.errorSave);
    } finally {
      setLoading(false);
    }
  };

  const saveCase = async () => {
    setSaving(true);
    try {
      const updatedCase = await AdminAnalysisService.saveAnalysis(
        recoveryCase?.id,
        userServiceId!,
        recoveryCase?.user_id,
        {
          admin_analysis: adminAnalysis,
          admin_notes: adminNotes,
          admin_final_message: adminFinalMessage,
          final_document_urls: finalDocumentUrls,
          recovery_type: recoveryType,
        }
      );

      setRecoveryCase(updatedCase);
      toast.success(t.analysisPanel.messages.proposalSent);
    } catch (error: any) {
      console.error("Error saving analysis:", error);
      toast.error(error.message || "Failed to save analysis");
    } finally {
      setSaving(false);
    }
  };

  const handleProposedValue = async () => {
    if (!recoveryCase?.id) return;
    const value = parseFloat(proposalValue);
    if (isNaN(value)) {
      toast.error("Please enter a valid number for the proposal value");
      return;
    }

    setSaving(true);
    try {
      if (adminAnalysis || adminNotes) {
        await AdminAnalysisService.saveAnalysis(
          recoveryCase?.id,
          userServiceId!,
          recoveryCase?.user_id,
          {
            admin_analysis: adminAnalysis,
            admin_notes: adminNotes,
            recovery_type: recoveryType
          }
        );
      }
      
      await AdminAnalysisService.sendProposal(recoveryCase.id, value, recoveryType);
      
      const newStatus = "ANALISE_CONCLUIDA";
      await AdminAnalysisService.updateUserServiceStatus(userServiceId!, newStatus);

      toast.success("Proposal sent and status updated");
      fetchCase();
    } catch (error: any) {
      console.error("Error sending proposal:", error);
      toast.error(error.message || "Failed to send proposal");
    } finally {
      setSaving(false);
    }
  };

  const handleDeliver = async () => {
    if (!adminFinalMessage.trim()) return;
    setSaving(true);
    try {
      await AdminAnalysisService.completeRecovery(
        recoveryCase!.id,
        userServiceId!,
        adminFinalMessage,
        finalDocumentUrls,
        getStatusPrefix(),
        recoveryType
      );
      toast.success(t.analysisPanel.messages.successSave);
      fetchCase();
    } catch (error) {
      console.error("Error delivering recovery:", error);
      toast.error(t.analysisPanel.messages.errorSave);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !recoveryCase) return;
    
    setUploading(true);
    const newUrls: string[] = [...finalDocumentUrls];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const signedUrl = await AdminAnalysisService.uploadFile(recoveryCase.id, files[i]);
        newUrls.push(signedUrl);
      }
      
      setFinalDocumentUrls(newUrls);
      toast.success(`${files.length} arquivo(s) enviados com sucesso.`);
    } catch (err) {
      toast.error("Erro ao fazer upload dos arquivos.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!recoveryCase) {
    const isWaitingInstructions = userServiceStatus?.includes("RFE") || userServiceStatus?.includes("_REJECTED");
    
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
          {isWaitingInstructions ? <Clock className="w-7 h-7 text-amber-500 animate-pulse" /> : <AlertCircle className="w-7 h-7 text-muted-foreground" />}
        </div>
        <p className="text-sm font-bold">
          {isWaitingInstructions ? `Aguardando Instruções do ${getLabel()}` : "Nenhuma submissão encontrada"}
        </p>
        <p className="text-xs text-muted-foreground max-w-xs">
          {isWaitingInstructions 
            ? `O cliente recebeu a notificação de ${getLabel()}, mas ainda não enviou o formulário com a explicação e documentos para sua análise.`
            : `O cliente ainda não enviou o formulário de análise. O status atual é ${userServiceStatus || 'desconhecido'}.`}
        </p>
        {isWaitingInstructions && (
          <Badge variant="outline" className="mt-2 bg-amber-50 text-amber-700 border-amber-200">
            Ação Requerida pelo Cliente
          </Badge>
        )}
      </div>
    );
  }

  const isCompleted = recoveryCase.status === "completed" || userServiceStatus?.includes("PACKAGE_READY") || userServiceStatus?.includes("_COMPLETED");
  const isAccepted = (
    userServiceStatus?.includes("MOTION") || 
    userServiceStatus?.includes("RFE") || 
    userServiceStatus?.includes("_IN_PROGRESS") || 
    recoveryCase.status === 'accepted'
  ) && !isCompleted;
  const isProposalSent = (recoveryCase.status === "proposal_sent" || userServiceStatus?.includes("ANALISE_CONCLUIDA") || (userServiceStatus?.includes("TRACKING") && recoveryCase.status === 'proposal_sent')) && !isAccepted && !isCompleted;
  const isPending = !isProposalSent && !isAccepted && !isCompleted;

  return (
    <div className="space-y-6">
      {/* 1. Status Banner */}
      <div className={`flex items-center gap-3 p-4 rounded-xl border ${
        isCompleted ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800" :
        isAccepted ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800" :
        isProposalSent ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800" :
        "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
      }`}>
        {isCompleted ? <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" /> :
         isAccepted ? <DollarSign className="w-5 h-5 text-indigo-600 flex-shrink-0" /> :
         isProposalSent ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" /> :
         <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
        }
        <div>
          <div className="flex items-center gap-2">
            <p className={`text-sm font-bold ${
              isCompleted ? "text-blue-700 dark:text-blue-400" :
              isAccepted ? "text-indigo-700 dark:text-indigo-400" :
              isProposalSent ? "text-green-700 dark:text-green-400" : 
              "text-amber-700 dark:text-amber-400"
            }`}>
              {isCompleted ? `${getLabel()} entregue e finalizado` :
               isAccepted ? "Pagamento Confirmado — Realizar Entrega" :
               isProposalSent ? "Proposta já enviada" : 
               `Aguardando análise de especialista para ${getLabel()}`}
            </p>
            <Badge variant="outline" className={(productType === 'EOS' || serviceSlug === "extensao-status") ? "bg-purple-50 text-purple-700 border-purple-100" : "bg-blue-50 text-blue-700 border-blue-100"}>
              {productType || (serviceSlug === "extensao-status" ? "EOS" : "COS")}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Tipo de Recuperação:</span>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setRecoveryType("rfe")}
                className={cn(
                  "px-3 py-1 rounded-md text-[10px] font-bold transition-all",
                  recoveryType === "rfe" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                RFE
              </button>
              <button 
                onClick={() => setRecoveryType("motion")}
                className={cn(
                  "px-3 py-1 rounded-md text-[10px] font-bold transition-all",
                  recoveryType === "motion" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                MOTION
              </button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            Enviado pelo cliente em: {new Date(recoveryCase.submitted_at).toLocaleString("pt-BR")}
            {recoveryCase.proposal_sent_at && (
              <> · Proposta enviada em: {new Date(recoveryCase.proposal_sent_at).toLocaleString("pt-BR")}</>
            )}
          </p>
        </div>
        <Badge variant="outline" className="ml-auto">
          {recoveryCase.status === "pending" ? "Pendente" :
           recoveryCase.status === "proposal_sent" ? "Proposta Enviada" :
           recoveryCase.status === "accepted" ? "Aceita" :
           recoveryCase.status === "completed" ? "Concluída" : recoveryCase.status}
        </Badge>
      </div>

      {/* 2. SECTION: Client's Submission */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Relato do Cliente — {clientName || "Cliente"}
            </h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchCase} 
            className="h-7 text-[10px] font-bold uppercase tracking-tight text-primary hover:bg-primary/5"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
            Atualizar Dados
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Descrição do caso / Justificativa</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-border shadow-inner">
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                {recoveryCase.explanation || (
                  <span className="text-slate-400 italic">O cliente não forneceu uma descrição em texto para este caso.</span>
                )}
              </p>
            </div>
          </div>

          {recoveryCase.document_urls && recoveryCase.document_urls.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Documentação Enviada ({recoveryCase.document_urls.length})</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recoveryCase.document_urls.map((url, idx) => (
                  <a
                    key={idx} href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-background border border-border rounded-2xl hover:border-primary/40 hover:bg-primary/[0.02] transition-all group shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Anexo de Evidência #{idx + 1}</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-medium">Ver Arquivo</span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-border">
              <AlertCircle className="w-5 h-5 text-slate-400" />
              <p className="text-sm text-slate-500 italic">Nenhum arquivo de evidência anexado.</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. SECTION: Admin Proposal Form */}
      {!isAccepted && !isCompleted && (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="bg-primary/[0.03] px-6 py-4 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t.analysisPanel.title}</h3>
              <p className="text-xs text-muted-foreground">{t.analysisPanel.subtitle}</p>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                Análise Técnica do Especialista <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full min-h-[180px] p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-sm leading-relaxed"
                placeholder="Descreva aqui o parecer técnico, chances de êxito e estratégia para o Motion/RFE..."
                value={adminAnalysis}
                onChange={(e) => setAdminAnalysis(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Valor Adicional (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                  <Input 
                    type="number" value={proposalValue} onChange={(e) => setProposalValue(e.target.value)}
                    className="pl-8 h-12 bg-slate-50 dark:bg-slate-900 border-border rounded-xl font-mono"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  Notas Internas
                </label>
                <textarea 
                  className="w-full h-12 p-3 rounded-xl border border-border bg-slate-50 dark:bg-slate-900 resize-none text-xs"
                  placeholder="Anotações para a equipe administrativa..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between gap-4 border-t border-border">
               <p className="text-xs text-muted-foreground italic max-w-sm">
                  {isProposalSent ? "✓ Proposta enviada. Alterações serão visíveis para o cliente imediatamente." : "Ao enviar, o cliente receberá uma notificação para contratar o serviço."}
               </p>
               <Button onClick={handleProposedValue} disabled={saving || !adminAnalysis.trim()} className="h-12 px-8 font-bold gap-2 rounded-xl">
                 {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                 {isProposalSent ? "Atualizar Proposta" : "Enviar Proposta"}
               </Button>
            </div>
          </div>
        </div>
      )}

      {/* 4. SECTION: Delivery (If Accepted or Completed) */}
      {(isAccepted || isCompleted) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border-2 border-primary/20 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-primary/[0.03] px-6 py-4 border-b border-primary/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Entrega Final do {getLabel()}</h3>
                <p className="text-xs text-muted-foreground">Envio de documentos finais para o cliente</p>
              </div>
            </div>
            {isAccepted && <Badge className="bg-green-500 text-white animate-pulse">PAGO — AGUARDANDO ARQUIVOS</Badge>}
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2 italic">Mensagem Final e Instruções <span className="text-red-500">*</span></label>
              <textarea
                className="w-full min-h-[120px] p-4 rounded-xl border border-border bg-background text-sm"
                placeholder={`Instruções finais para o protocolo físico ou digital do seu ${getLabel()}...`}
                value={adminFinalMessage}
                onChange={(e) => setAdminFinalMessage(e.target.value)}
                readOnly={isCompleted}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2 italic">Arquivos de {getLabel()} / Provas</label>
                {!isCompleted && (
                  <Button variant="outline" size="sm" onClick={() => (document.getElementById("file-upload") as HTMLInputElement)?.click()} disabled={uploading}>
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                    Adicionar Arquivos
                  </Button>
                )}
                <input id="file-upload" type="file" multiple className="hidden" onChange={(e) => handleFileUpload(e.target.files)} />
              </div>

              {finalDocumentUrls.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {finalDocumentUrls.map((url, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-border rounded-2xl group">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="text-sm font-bold">Documento de Defesa #{idx+1}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white rounded-lg text-primary shadow-sm border border-transparent hover:border-border transition-all">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        {!isCompleted && (
                          <Button variant="ghost" size="sm" onClick={() => setFinalDocumentUrls(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 hover:bg-red-50 p-2 h-auto">
                            <AlertCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 border-2 border-dashed border-border rounded-2xl text-center">
                  <p className="text-sm text-muted-foreground italic">Nenhum arquivo final anexado para entrega.</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between gap-4">
              <Button variant="outline" size="lg" onClick={() => fetchCase()} disabled={loading} className="gap-2 font-bold px-6">
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                Sincronizar Dados
              </Button>

              <Button 
                size="lg" 
                onClick={handleDeliver} 
                disabled={saving || uploading || !adminFinalMessage.trim()} 
                className="gap-2 font-bold px-10 bg-primary hover:bg-primary/90"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isCompleted ? `Re-enviar Entrega do ${getLabel()}` : `Finalizar e Entregar ${getLabel()}`}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

