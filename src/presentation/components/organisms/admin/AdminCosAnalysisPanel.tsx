import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
} from "lucide-react";
import { motion } from "framer-motion";

interface RecoveryCase {
  id: string;
  user_service_id: string;
  user_id: string;
  explanation: string | null;
  document_urls: string[];
  submitted_at: string;
  admin_analysis: string | null;
  proposal_value_usd: number | null;
  proposal_sent_at: string | null;
  admin_notes: string | null;
  status: string;
}

interface Props {
  userServiceId: string | null;
  clientName?: string | null;
}

export function AdminCosAnalysisPanel({ userServiceId, clientName }: Props) {
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

  useEffect(() => {
    if (!userServiceId) { setLoading(false); return; }
    fetchCase();
  }, [userServiceId]);

  const getStatusPrefix = () => serviceSlug === "extensao-status" ? "EOS_" : "COS_";

  const fetchCase = async () => {
    setLoading(true);
    try {
      // 1. Fetch recovery case details
      const { data: rc, error: rcError } = await (supabase as any)
        .from("cos_recovery_cases")
        .select("*")
        .eq("user_service_id", userServiceId!)
        .maybeSingle();

      if (rcError) throw rcError;
      if (rc) {
        setRecoveryCase(rc as RecoveryCase);
        setAdminAnalysis(rc.admin_analysis || "");
        setProposalValue(rc.proposal_value_usd?.toString() || "");
        setAdminNotes(rc.admin_notes || "");
        setAdminFinalMessage(rc.admin_final_message || "");
        setFinalDocumentUrls(rc.final_document_urls || []);
      }

      // 2. Fetch user_service to get recovery_type and current status
      const { data: us, error: usError } = await (supabase as any)
        .from("user_services")
        .select("status, data, service_slug")
        .eq("id", userServiceId!)
        .single();

      if (usError) throw usError;
      setUserServiceStatus(us.status || "");
      setServiceSlug(us.service_slug || "");
      const dataObj = us.data as any;
      if (dataObj?.recovery_type === "rfe") {
        setRecoveryType("rfe");
      } else {
        setRecoveryType("motion");
      }

    } catch (err) {
      console.error("Error fetching recovery case or user service:", err);
    } finally {
      setLoading(false);
    }
  };

  const getLabel = () => recoveryType === "rfe" ? "RFE" : "Motion";

  const handleSendProposal = async () => {
    if (!recoveryCase) return;
    if (!adminAnalysis.trim()) {
      toast.error("Preencha o campo de análise antes de enviar.");
      return;
    }

    setSaving(true);
    try {
      const valueNumeric = proposalValue ? parseFloat(proposalValue) : null;

      // 1. Update cos_recovery_cases with admin response
      const { error: updateError } = await (supabase as any)
        .from("cos_recovery_cases")
        .update({
          admin_analysis: adminAnalysis.trim(),
          proposal_value_usd: valueNumeric,
          admin_notes: adminNotes.trim() || null,
          proposal_sent_at: new Date().toISOString(),
          status: "proposal_sent",
          updated_at: new Date().toISOString(),
        })
        .eq("id", recoveryCase.id);

      if (updateError) throw updateError;

      // 2. Update user_services status to ANALISE_CONCLUIDA
      const { error: statusError } = await supabase
        .from("user_services")
        .update({ status: "ANALISE_CONCLUIDA" })
        .eq("id", userServiceId!);

      if (statusError) throw statusError;

      toast.success("Proposta enviada com sucesso! O cliente foi notificado.");
      await fetchCase();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Erro ao enviar proposta: ${msg}`);
    } finally {
      setSaving(false);
    }
  };
  
  const handleDeliver = async () => {
    if (!recoveryCase) return;
    if (!adminFinalMessage.trim() && finalDocumentUrls.length === 0) {
      toast.error(`Preencha a mensagem final ou envie pelo menos um documento para o ${getLabel()}.`);
      return;
    }

    setSaving(true);
    try {
      // 1. Update cos_recovery_cases
      const { error: updateError } = await (supabase as any)
        .from("cos_recovery_cases")
        .update({
          admin_final_message: adminFinalMessage.trim(),
          final_document_urls: finalDocumentUrls,
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", recoveryCase.id);

      if (updateError) throw updateError;

      // 2. Update user_services status
      const { error: statusError } = await supabase
        .from("user_services")
        .update({ status: `${getStatusPrefix()}MOTION_COMPLETED` })
        .eq("id", userServiceId!);

      if (statusError) throw statusError;

      toast.success(`${getLabel()} entregue com sucesso! O cliente receberá as instruções imediatamente.`);
      await fetchCase();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Erro ao entregar ${getLabel().toLowerCase()}: ${msg}`);
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
        const file = files[i];
        const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `recovery_fulfillment/${recoveryCase.id}/${Date.now()}_${safeFilename}`;
        
        const { error: uploadError } = await supabase.storage
          .from('process-documents')
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;
        
        const { data: signedData, error: signError } = await supabase.storage
          .from('process-documents')
          .createSignedUrl(filePath, 31536000); // 1 year expiry
          
        if (signError) throw signError;
          
        newUrls.push(signedData.signedUrl);
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
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">Nenhuma submissão encontrada</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          O cliente ainda não enviou o formulário de análise após o pagamento.
          O status do processo precisa ser <strong>ANALISE_PENDENTE</strong> para que a submissão apareça aqui.
        </p>
      </div>
    );
  }

  const isPending = recoveryCase.status === "pending";
  const isProposalSent = recoveryCase.status === "proposal_sent";
  const isAccepted = recoveryCase.status === "accepted";
  const isCompleted = recoveryCase.status === "completed";

  return (
    <div className="space-y-6">
      {/* Status banner */}
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
            <Badge variant="outline" className={serviceSlug === "extensao-status" ? "bg-purple-50 text-purple-700 border-purple-100" : "bg-blue-50 text-blue-700 border-blue-100"}>
              {serviceSlug === "extensao-status" ? "EOS" : "COS"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
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

      {/* ─── SECTION 1: Client's submission ─── */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-3 border-b border-border flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Relato do Cliente — {clientName || "Cliente"}
          </h3>
        </div>

        <div className="p-5 space-y-5">
          {/* Explanation */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Descrição do caso</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                {recoveryCase.explanation || <span className="text-muted-foreground italic">Nenhuma descrição enviada.</span>}
              </p>
            </div>
          </div>

          {/* Documents */}
          {recoveryCase.document_urls && recoveryCase.document_urls.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Documentos enviados ({recoveryCase.document_urls.length})
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {recoveryCase.document_urls.map((url, idx) => {
                  const filename = url.split("/").pop() || `Documento ${idx + 1}`;
                  return (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-background border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-xs font-medium truncate flex-1 text-foreground">{filename}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── SECTION 2: Admin Response Form (Only if NOT accepted or completed) ─── */}
      {!isAccepted && !isCompleted && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="bg-primary/5 dark:bg-primary/10 px-5 py-3 border-b border-border flex items-center gap-2">
            <Send className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
              Resposta do Especialista
            </h3>
          </div>

          <div className="p-5 space-y-5">
            {/* Analysis text */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-primary" />
                Análise do Especialista <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-muted-foreground">
                Descreva a avaliação jurídica do caso, os fundamentos para o {getLabel()} e a estratégia recomendada.
              </p>
              <textarea
                className="w-full min-h-[180px] p-4 rounded-xl border border-border bg-background focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all resize-none text-sm leading-relaxed"
                placeholder="Ex: Após análise da decisão do USCIS, identificamos que a negativa foi fundamentada em deficiência documental no formulário I-539A do dependente. Recomendamos a interposição de Motion to Reopen (I-290B) com os seguintes argumentos..."
                value={adminAnalysis}
                onChange={(e) => setAdminAnalysis(e.target.value)}
              />
            </div>

            {/* Proposal value */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-primary" />
                Valor da Proposta (USD)
              </label>
              <p className="text-xs text-muted-foreground">
                Valor cobrado pelo serviço completo do Motion. Deixe em branco se não houver cobrança adicional.
              </p>
              <div className="relative max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">$</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={proposalValue}
                  onChange={(e) => setProposalValue(e.target.value)}
                  className="pl-7 text-sm font-mono"
                />
              </div>
            </div>

            {/* Internal notes */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Notas internas (não visível ao cliente)
              </label>
              <textarea
                className="w-full min-h-[80px] p-3 rounded-xl border border-border bg-muted/20 focus:border-primary focus:outline-none transition-all resize-none text-sm leading-relaxed text-muted-foreground"
                placeholder="Observações internas sobre o caso (não será exibido ao cliente)..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>

            {/* Submit */}
            <div className="border-t pt-4 flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                {isProposalSent
                  ? "✓ Proposta já enviada. Você pode atualizar e reenviar se necessário."
                  : "Ao enviar, o status do cliente será atualizado para ANALISE_CONCLUIDA."}
              </p>
              <Button
                onClick={handleSendProposal}
                disabled={saving || !adminAnalysis.trim()}
                className="min-w-[160px] gap-2 font-bold"
              >
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                  : <><Send className="w-4 h-4" /> {isProposalSent ? "Atualizar Proposta" : "Enviar Proposta"}</>
                }
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── SECTION 3: Motion Delivery (Only visible if paid/accepted or completed) ─── */}
      {(isAccepted || isCompleted) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border-2 border-indigo-200 dark:border-indigo-900 rounded-xl overflow-hidden shadow-lg"
        >
          <div className="bg-indigo-50 dark:bg-indigo-950/30 px-5 py-3 border-b border-indigo-200 dark:border-indigo-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-400">
              Entrega Completa do {getLabel()}
            </h3>
            {isAccepted && (
              <Badge className="ml-auto bg-green-600 text-white border-none animate-pulse px-3">
                PAGO — AGUARDANDO ENTREGA FINAL
              </Badge>
            )}
          </div>

          <div className="p-5 space-y-6">
            {/* Final Message */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                Mensagem Final para o Cliente ({getLabel()}) <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full min-h-[140px] p-4 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-background focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none text-sm"
                placeholder={`Ex: Prezado cliente, conforme solicitado, elaboramos a resposta ao seu ${getLabel()}. Em anexo estão os documentos finais e as instruções detalhadas para o protocolo. Ficamos à disposição...`}
                value={adminFinalMessage}
                readOnly={isCompleted}
                onChange={(e) => setAdminFinalMessage(e.target.value)}
              />
            </div>

            {/* Document Upload / Delivery */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                Documentos Finais ({getLabel()})
              </label>
              
              {!isCompleted && (
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    className="gap-2 border-dashed border-indigo-300 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                    onClick={() => document.getElementById('fulfillment-upload')?.click()}
                    disabled={uploading}
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4 text-indigo-600" />}
                    Selecionar Arquivos
                  </Button>
                  <input
                    id="fulfillment-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                  <p className="text-xs text-muted-foreground italic">Envie PDFs ou imagens da petição e evidências.</p>
                </div>
              )}

              {/* List of uploaded files */}
              <div className="space-y-2">
                {finalDocumentUrls.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {finalDocumentUrls.map((url, idx) => {
                      const filename = url.split("/").pop() || `Documento ${idx + 1}`;
                      return (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900 rounded-lg">
                          <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          <span className="text-xs font-medium truncate flex-1">{filename}</span>
                          <div className="flex items-center gap-2">
                            <a href={url} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-indigo-50 rounded-md transition-colors">
                              <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                            </a>
                            {!isCompleted && (
                              <button 
                                onClick={() => setFinalDocumentUrls(prev => prev.filter((_, i) => i !== idx))}
                                className="p-1.5 hover:bg-red-50 text-red-500 rounded-md transition-colors"
                              >
                                <AlertCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-3 italic">Nenhum documento anexado à entrega.</p>
                )}
              </div>
            </div>

            {/* Finish Button */}
            {!isCompleted && (
              <div className="pt-4 border-t border-indigo-100 dark:border-indigo-900 flex justify-end">
                <Button
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 min-w-[200px]"
                  onClick={handleDeliver}
                  disabled={saving || uploading}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Finalizar e Entregar {getLabel()}
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

