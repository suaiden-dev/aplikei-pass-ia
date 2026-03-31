import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Search,
  Mail,
  CheckCircle2,
  XCircle,
  FileSearch,
  Send,
  Truck,
  AlertCircle,
  Clock,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Plus,
  Upload,
  FileText,
  MessageSquare,
  DollarSign,
  Loader2
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProcessRepository } from "@/infrastructure/factories/processFactory";
import { GetUserProcesses } from "@/application/use-cases/user/GetUserProcesses";
import { UserProcess } from "@/domain/user/UserEntities";
import { Skeleton } from "@/presentation/components/atoms/skeleton";
import { Badge } from "@/presentation/components/atoms/badge";
import { Button } from "@/presentation/components/atoms/button";
import { Input } from "@/presentation/components/atoms/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/presentation/components/atoms/alert-dialog";
import { toast } from "sonner";

export default function TrackingTab() {
  const { lang, t } = useLanguage();
  const { session } = useAuth();
  const user = session?.user;
  const [loading, setLoading] = useState(true);
  const [process, setProcess] = useState<UserProcess | null>(null);
  const [trackingCode, setTrackingCode] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [recoveryCase, setRecoveryCase] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  
  const [isAwaitingPaymentConfirm, setIsAwaitingPaymentConfirm] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cosOutcome = t.cosOutcome as any;

  const ct = (t.changeOfStatus as any)?.tracking;

  const getStatusPrefix = (p: UserProcess | null) => {
    if (!p) return "COS_";
    return p.serviceSlug === "extensao-status" ? "EOS_" : "COS_";
  };

  const fetchProcess = async () => {
    if (!user) return;
    try {
      console.log("TrackingTab: Fetching processes for user:", user.id);
      const repo = getUserProcessRepository();
      const getUserProcesses = new GetUserProcesses(repo);
      const processes = await getUserProcesses.execute(user.id);
      
      const cosProcess = processes.find(p => 
        (p.serviceSlug === "troca-status" || p.serviceSlug === "extensao-status" || p.serviceSlug === "changeofstatus") &&
        (p.status.startsWith("COS_") || p.status.startsWith("EOS_") || p.status.includes("ANALISE") || p.status.includes("MOTION"))
      ) || processes.find(p => 
        p.serviceSlug === "troca-status" || p.serviceSlug === "extensao-status" || p.serviceSlug === "changeofstatus"
      ) || processes[0]; 
      
      if (cosProcess) {
        setProcess(cosProcess);
        if (cosProcess.data?.trackingCode) {
          setTrackingCode(cosProcess.data.trackingCode);
        }
        
        const isRecovery = cosProcess.status.startsWith("COS_") || 
                           cosProcess.status.startsWith("EOS_") ||
                           cosProcess.status.includes("ANALISE") || 
                           cosProcess.status.includes("MOTION");
                           
        if (isRecovery) {
          const { data: rc, error: rcErr } = await (supabase as any)
            .from("cos_recovery_cases")
            .select("*")
            .eq("user_service_id", cosProcess.id)
            .maybeSingle();
          if (rc) {
            console.log("TrackingTab: Recovery data fetched:", rc);
            setRecoveryCase(rc);
          }
        }
      }
    } catch (error) {
      console.error("TrackingTab: Error fetching process:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchProcess();
    
    // 1. Subscription for user_services
    const serviceChannel = supabase.channel(`user_services_all`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "user_services" }, (payload: any) => {
        if (payload.new.user_id === user.id) {
          setProcess(prev => prev && prev.id === payload.new.id ? { ...prev, status: payload.new.status } : prev);
        }
      })
      .subscribe();

    // 2. Subscription for cos_recovery_cases (crucial for live updates of docs/messages)
    const recoveryChannel = supabase.channel(`cos_recovery_all`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "cos_recovery_cases" }, (payload: any) => {
        if (process && payload.new.user_service_id === process.id) {
          console.log("TrackingTab: Real-time update for recovery case RECEIVED!", payload.new);
          setRecoveryCase(payload.new);
        }
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(serviceChannel); 
      supabase.removeChannel(recoveryChannel);
    };
  }, [user, process?.id]);

  // Helper to determine the current recovery string based on data.recovery_type
  const getRecoveryLabel = () => {
    const type = process?.data?.recovery_type || 'motion';
    return type === 'rfe' ? 'RFE' : 'Motion';
  };

  const getRecoveryTitle = () => {
    const type = process?.data?.recovery_type || 'motion';
    return type === 'rfe' ? 'Apoio ao RFE' : 'Motion de Reconsideração';
  };

  // Helper for manual refresh in all screens
  const handleManualRefresh = async () => {
    console.log("TrackingTab: Manual refresh requested...");
    setLoading(true);
    await fetchProcess();
  };

  useEffect(() => {
    if (!process?.id || !user) return;
    const isRecoveryStatus = process.status.includes("REJECTED") || process.status.includes("ANALISE") || process.status.includes("MOTION") || process.status === "COS_CASE_FORM";
    if (isRecoveryStatus) {
      const fetchRC = async () => {
        const { data: rc } = await (supabase as any).from("cos_recovery_cases").select("*").eq("user_service_id", process.id).maybeSingle();
        setRecoveryCase(rc || null);
      };
      fetchRC();
    }
  }, [process?.status, user?.id]);

  const handleSaveTracking = async () => {
    if (!process || !trackingCode.trim()) return;
    setIsSaving(true);
    try {
      const repo = getUserProcessRepository();
      const updatedData = { ...process.data, trackingCode: trackingCode.trim().toUpperCase() };
      await repo.updateData(process.id, updatedData);
      setProcess({ ...process, data: updatedData });
      setIsEditing(false);
      toast.success("Código de rastreio salvo!");
    } catch (e) {
      toast.error("Erro ao salvar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmStatus = async () => {
    if (!process || !selectedOutcome) return;
    setIsUpdatingStatus(true);
    const currentType = process.data?.recovery_type || 'motion';
    const prefix = getStatusPrefix(process);
    
    try {
      let statusToSave = "";
      let newRecursiveType = "";
      
      if (selectedOutcome === "approved") {
        statusToSave = "approved";
      } else if (selectedOutcome === "rejected") {
        // RECURSIVE LOGIC: RFE REJECTED -> MOTION
        if (currentType === "rfe") {
          console.info("RFE Rejected. Starting Motion flow...");
          statusToSave = prefix + "CASE_FORM";
          newRecursiveType = "motion";
        } else {
          // MOTION REJECTED -> FINAL END
          statusToSave = "rejected";
        }
      } else if (selectedOutcome === "rfe") {
        // Initial Tracking Case: Click RFE
        statusToSave = prefix + "CASE_FORM";
        newRecursiveType = "rfe";
      }

      console.info(`TrackingTab: Updating status to ${statusToSave} (Type: ${newRecursiveType || currentType})`);
      
      const updatePayload: any = { status: statusToSave };
      if (newRecursiveType) {
        updatePayload.data = { ...process.data, recovery_type: newRecursiveType };
      }

      const { data, error } = await (supabase as any)
        .from("user_services")
        .update(updatePayload)
        .eq("id", process.id)
        .select();

      if (error) throw error;
      
      toast.success(newRecursiveType === "motion" && currentType === "rfe" 
        ? "RFE processado. Iniciando fluxo de Motion..." 
        : "Status atualizado com sucesso!");
        
      setIsConfirmOpen(false);
      setTimeout(() => window.location.reload(), 1000);
      
    } catch (e: any) {
      console.error("TrackingTab Error:", e);
      toast.error(`Erro: ${e.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !process || !user) return;
    setIsUploading(true);
    try {
      const newUrls = [...uploadedFiles];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = `recovery_cases/${user.id}/${process.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('process-documents').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data } = await supabase.storage.from('process-documents').createSignedUrl(filePath, 31536000);
        if (data?.signedUrl) newUrls.push(data.signedUrl);
      }
      setUploadedFiles(newUrls);
      toast.success("Documentos enviados!");
    } catch (e) {
      toast.error("Erro no upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitAnalysis = async () => {
    if (!process || !explanation.trim()) return;
    setIsUpdatingStatus(true);
    try {
      const { data: existing } = await (supabase as any).from("cos_recovery_cases").select("id").eq("user_service_id", process.id).maybeSingle();
      const payload = { explanation: explanation.trim(), document_urls: uploadedFiles, submitted_at: new Date().toISOString(), status: "pending", updated_at: new Date().toISOString() };
      if (existing?.id) {
        await (supabase as any).from("cos_recovery_cases").update(payload).eq("id", existing.id);
      } else {
        await (supabase as any).from("cos_recovery_cases").insert({ ...payload, user_service_id: process.id, user_id: user!.id });
      }
      await supabase.from("user_services").update({ status: "ANALISE_PENDENTE" }).eq("id", process.id);
      setProcess({ ...process, status: "ANALISE_PENDENTE" });
      toast.success("Enviado para análise!");
    } catch (e) {
      toast.error("Erro ao enviar");
    } finally {
      setIsUpdatingStatus(false);
    }
  };  // --- RENDER ---
  const renderContent = () => {
    if (isAwaitingPaymentConfirm) {
      return <div className="flex flex-col items-center py-24 text-center"><Clock className="w-10 h-10 animate-pulse mb-4" /><h2 className="text-xl font-bold">Confirmando pagamento...</h2></div>;
    }

    if (loading) return <div className="p-8"><Skeleton className="h-48 w-full" /></div>;

    if (!process || !ct) {
      return <div className="py-20 text-center"><Truck className="w-12 h-12 mx-auto mb-4 opacity-20" /><h2 className="text-xl font-bold">Processo Indisponível</h2><Button onClick={() => window.location.reload()} className="mt-4">Recarregar</Button></div>;
    }

    // --- FINAL STATES ---
    if (process.status === "COS_APPROVED" || process.status === "EOS_APPROVED" || process.status === "MOTION_APPROVED" || process.status === "approved" || process.status === "completed") {
      return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20 pt-10">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              {process.status === "MOTION_APPROVED" ? "Motion Aprovado!" : "Processo Concluido"}
            </h1>
            <p className="text-lg text-slate-500 max-w-md mx-auto leading-relaxed">
              {process.status === "MOTION_APPROVED" 
                ? "Parabéns! O USCIS aceitou o seu Motion e seu status foi restabelecido com sucesso."
                : "Seu processo foi finalizado e todos os documentos foram gerados com sucesso."}
            </p>
            <div className="mt-12 flex justify-center gap-4">
              <Button size="lg" className="rounded-xl px-10 bg-blue-600 hover:bg-blue-700" onClick={() => navigate("/dashboard")}>
                Ir para o Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (process.status === "MOTION_REJECTED" || process.status === "rejected" || process.status === "COS_REJECTED_FINAL" || process.status === "EOS_REJECTED_FINAL") {
      return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20 pt-10">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-8">
              <XCircle className="w-10 h-10 text-slate-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Processo Encerrado</h1>
            <p className="text-lg text-slate-500 max-w-md mx-auto leading-relaxed">
              O seu processo atingiu a etapa final após o Motion e, infelizmente, a petição foi negada. De acordo com as normas atuais, não é possível iniciar um novo pedido de troca de status para este visto.
            </p>
            <div className="mt-12 flex justify-center gap-4">
              <Button size="lg" variant="outline" className="rounded-xl px-8" onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
              <Button size="lg" className="rounded-xl px-8 bg-slate-900 hover:bg-slate-900 text-white font-bold" onClick={() => window.open("https://wa.me/APLIKEI", "_blank")}>
                Falar com Especialista
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // --- RECOVERY FLOW ---
    const isRecovering = process.status.includes("REJECTED") || process.status.includes("ANALISE") || process.status.includes("MOTION") || process.status === "COS_CASE_FORM";
    
    if (isRecovering) {
      if (process.status === "COS_REJECTED") {
        return (
          <div className="max-w-3xl space-y-6">
            <div className="p-8 bg-red-50 border border-red-200 rounded-2xl">
              <h1 className="text-2xl font-bold text-red-800">Seu pedido foi negado.</h1>
              <p className="mt-2 text-red-700">Temos especialistas prontos para analisar seu caso e entrar com um Motion de Reconsideração.</p>
            </div>
            <Button 
              size="lg" className="w-full" 
              onClick={() => {
                // Force motion type for first rejection
                (supabase as any).from("user_services").update({ data: { ...process.data, recovery_type: "motion" } }).eq("id", process.id);
                const action = process.serviceSlug === "extensao-status" ? "eos_analyst" : "cos_analyst";
                navigate(`/checkout/analise-especialista-cos?serviceId=${process.id}&action=${action}`);
              }}
            >
              Solicitar Análise para Motion
            </Button>
          </div>
        );
      }

      if (process.status === "COS_CASE_FORM") {
        return (
          <div className="max-w-3xl space-y-6">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Plus className="w-5 h-5" />
              <span className="font-bold uppercase tracking-widest text-sm">{getRecoveryTitle()}</span>
            </div>
            <h2 className="text-2xl font-bold">Instruções para o Especialista</h2>
            <p className="text-slate-500 italic">Informe abaixo os detalhes do seu {getRecoveryLabel()} recebido do USCIS para que possamos preparar sua resposta.</p>
            <textarea 
              className="w-full h-40 p-4 border rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all" 
              placeholder={`Descreva aqui os pontos principais do seu ${getRecoveryLabel()}...`} 
              value={explanation} 
              onChange={e => setExplanation(e.target.value)} 
            />
            <div className="space-y-3">
              <p className="text-sm font-bold flex items-center gap-2"><FileText className="w-4 h-4" /> Anexar {getRecoveryLabel()} (Opcional)</p>
              <input type="file" multiple onChange={handleFileUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
            <Button className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 rounded-xl" onClick={handleSubmitAnalysis} disabled={!explanation.trim() || isUpdatingStatus}>
              {isUpdatingStatus ? "Enviando..." : `Enviar para Análise de ${getRecoveryLabel()}`}
            </Button>
          </div>
        );
      }

      if (process.status === "ANALISE_PENDENTE") {
        return <div className="max-w-3xl p-12 text-center bg-card border rounded-2xl"><Clock className="w-12 h-12 mx-auto mb-4 text-amber-500 animate-pulse" /><h2 className="text-xl font-bold">Em análise técnica...</h2><p className="text-muted-foreground">Normalmente respondemos em 24h.</p></div>;
      }

      if (process.status === "ANALISE_CONCLUIDA" && recoveryCase) {
        const checkoutLabel = process.data?.recovery_type === 'rfe' ? 'Apoio ao RFE' : 'Motion de Reconsideração';
        const checkoutSlug = process.data?.recovery_type === 'rfe' ? 'rfe-support' : 'motion-reconsideracao-cos';
        
        return (
          <div className="max-w-3xl space-y-6">
            <div className="p-6 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-between">
              <span>Análise Concluída para {getRecoveryLabel()}</span>
              <Badge className="bg-white/20">US$ {recoveryCase.proposal_value_usd}</Badge>
            </div>
            <div className="p-8 bg-white border border-slate-100 rounded-2xl shadow-sm whitespace-pre-wrap leading-relaxed">{recoveryCase.admin_analysis}</div>
            <Button 
              size="lg" className="w-full h-14 text-xl bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-lg shadow-blue-600/20" 
              onClick={() => navigate(`/checkout/${checkoutSlug}?serviceId=${process.id}&action=cos_recovery&amount=${recoveryCase.proposal_value_usd}`)}
            >
              Contratar {checkoutLabel}
            </Button>
          </div>
        );
      }

      if (process.status === "COS_MOTION_IN_PROGRESS") {
        return (
          <div className="max-w-3xl space-y-8 text-center py-20 border-2 border-dashed rounded-3xl">
             <Clock className="w-20 h-20 text-indigo-600 mx-auto animate-pulse" />
             <h2 className="text-3xl font-bold">Pagamento Confirmado!</h2>
             <p className="text-muted-foreground max-w-md mx-auto">Estamos preparando sua petição. Clique no botão abaixo para verificar se novos documentos foram disponibilizados.</p>
             <Button variant="outline" size="lg" onClick={fetchProcess} className="rounded-full px-10 border-indigo-200">Verificar Atualizações</Button>
          </div>
        );
      }

      if (process.status === "COS_MOTION_COMPLETED") {
        return (
          <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              {/* Simple Header */}
              <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Documentação {getRecoveryLabel()} Pronta</h2>
                    <p className="text-sm text-slate-500">Seu pacote de {getRecoveryLabel()} foi preparado.</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleManualRefresh}
                  className="text-slate-400 hover:text-blue-600 gap-1.5"
                >
                  <Loader2 className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span className="text-xs font-medium">Sincronizar</span>
                </Button>
              </div>

              <div className="p-8 space-y-8">
                {/* Specialist Message */}
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 italic">Mensagem do Especialista</p>
                  <div className="p-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl leading-relaxed text-slate-700 dark:text-slate-300">
                    {recoveryCase?.admin_final_message || "Aguardando o envio da mensagem final pelo administrador..."}
                  </div>
                </div>

                {/* Document List */}
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Arquivos para Download</p>
                  {recoveryCase?.final_document_urls && recoveryCase.final_document_urls.length > 0 ? (
                    <div className="space-y-2">
                      {recoveryCase.final_document_urls.map((url: string, i: number) => (
                        <a 
                          key={i} href={url} target="_blank" rel="noreferrer"
                          className="flex items-center gap-4 p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                        >
                          <FileText className="w-5 h-5 text-slate-400 group-hover:text-primary" />
                          <span className="flex-1 text-sm font-medium text-slate-600 dark:text-slate-400">Documento {i+1}</span>
                          <ExternalLink className="w-4 h-4 text-slate-300" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center border-2 border-dashed rounded-xl text-sm text-slate-400">
                      Nenhum arquivo anexado ainda.
                    </div>
                  )}
                </div>

                {/* Status Update Block */}
                <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-6">
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Qual foi o resultado oficial do USCIS?</p>
                    <p className="text-xs text-slate-400 mt-1">Atualize o status abaixo assim que receber a carta.</p>
                  </div>
                  
                  <div className="flex gap-4 max-w-md mx-auto">
                    <Button 
                      className="flex-1 font-bold bg-blue-600 hover:bg-blue-700" 
                      onClick={() => { setSelectedOutcome("approved"); setIsConfirmOpen(true); }}
                    >
                      Aprovado!
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 font-bold border-red-200 text-red-600 hover:bg-red-50" 
                      onClick={() => { setSelectedOutcome("rejected"); setIsConfirmOpen(true); }}
                    >
                      Negado
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
    }

    // --- STANDARD TRACKING ---
    return (
      <div className="max-w-4xl space-y-8 pb-10">
        <h1 className="text-3xl font-bold flex items-center gap-3"><Truck className="text-primary" /> Acompanhamento de Envio</h1>
        <div className="p-8 bg-card border-2 border-border rounded-3xl shadow-sm">
          <h2 className="text-2xl font-bold mb-4">{trackingCode ? "Pacote Enviado" : "Aguardando Envio"}</h2>
          {isEditing || !trackingCode ? (
            <div className="flex gap-2 max-w-md"><Input value={trackingCode} onChange={e => setTrackingCode(e.target.value.toUpperCase())} placeholder="Insira o código do correio" /><Button onClick={handleSaveTracking} disabled={isSaving}>{isSaving ? "..." : "Salvar"}</Button></div>
          ) : (
            <div className="flex items-center justify-between bg-muted/30 p-6 rounded-2xl border border-border"><p className="text-2xl font-mono font-bold tracking-tighter select-all">{trackingCode}</p><Button variant="ghost" onClick={() => setIsEditing(true)}>Editar</Button></div>
          )}
          {trackingCode && !isEditing && (
            <div className="mt-10 pt-10 border-t"><h3 className="font-bold mb-4">Atualize o status do seu pedido:</h3><div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><Button variant="outline" className="border-blue-200 text-blue-700 font-bold h-12 hover:bg-blue-50" onClick={() => { setSelectedOutcome("approved"); setIsConfirmOpen(true); }}>Aprovado!</Button><Button variant="outline" className="border-red-200 text-red-700 font-bold h-12 hover:bg-red-50" onClick={() => { setSelectedOutcome("rejected"); setIsConfirmOpen(true); }}>Negado</Button><Button variant="outline" className="border-amber-200 text-amber-700 font-bold h-12 hover:bg-amber-50" onClick={() => { setSelectedOutcome("rfe"); setIsConfirmOpen(true); }}>RFE Recebido</Button></div></div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {renderContent()}

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="rounded-3xl border border-slate-200 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-slate-800">Confirmar Resultado?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 text-base">
              Você está marcando este processo como <strong>{selectedOutcome === "approved" ? "APROVADO" : selectedOutcome === "rejected" ? "NEGADO" : "PENDENTE DE RFE"}</strong>. 
              {selectedOutcome === "approved" ? " Isso restabelecerá seu status no sistema." : " Isso encerrará o acompanhamento deste Motion."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex gap-3">
            <AlertDialogCancel asChild>
              <Button variant="ghost" className="rounded-xl px-6 border-none hover:bg-slate-100">Cancelar</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button 
                onClick={handleConfirmStatus} 
                disabled={isUpdatingStatus}
                className={`rounded-xl px-10 font-bold ${selectedOutcome === "approved" ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"}`}
              >
                {isUpdatingStatus ? "Processando..." : "Confirmar e Encerrar"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
