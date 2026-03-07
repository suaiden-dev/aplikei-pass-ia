import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  Upload,
  Calendar,
  CreditCard,
  CheckCircle2,
  XCircle,
  Info,
  Clock,
  Fingerprint,
  ShieldCheck,
  Save,
  Loader2,
  ChevronLeft,
  ExternalLink,
  User as UserIcon,
  FileText,
  Download,
  RefreshCw,
  Eye,
  Package,
  MapPin,
  Trophy,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AdminStatusTimeline } from "@/components/admin/AdminStatusTimeline";
import { AdminVerticalTimeline } from "@/components/admin/AdminVerticalTimeline";
import { AdminProcessLogs } from "@/components/admin/AdminProcessLogs";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Order {
  id: string;
  user_id: string | null;
  product_slug: string | null;
  service_status: string | null;
  user_service_id: string | null;
  application_id: string | null;
  date_of_birth: string | null;
  grandmother_name: string | null;
  contract_pdf_url?: string | null;
  consular_login?: string | null;
  consular_password?: string | null;
  interview_date?: string | null;
  interview_time?: string | null;
  interview_location_casv?: string | null;
  interview_location_consulate?: string | null;
}

interface ProcessDocument {
  id: string;
  user_id: string | null;
  user_service_id: string | null;
  name: string;
  storage_path: string;
  bucket_id: string | null;
  status: string | null;
  created_at: string;
}

interface OnboardingResponse {
  id: string;
  user_service_id: string | null;
  step_slug: string;
  data: Record<string, unknown>;
  created_at: string;
}

interface RegistrationData {
  interviewLocation?: string;
  consulateCity?: string;
}

interface SchedData {
  preferred_date?: string;
}

export default function AdminProcessDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [appId, setAppId] = useState("");
  const [dob, setDob] = useState("");
  const [grandmaName, setGrandmaName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [processDocs, setProcessDocs] = useState<ProcessDocument[]>([]);
  const [onboardingResponses, setOnboardingResponses] = useState<
    OnboardingResponse[]
  >([]);
  const [interviewLocation, setInterviewLocation] = useState<string>("");
  const [consularLogin, setConsularLogin] = useState("");
  const [consularPassword, setConsularPassword] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewLocationCasv, setInterviewLocationCasv] = useState("");
  const [interviewLocationConsulate, setInterviewLocationConsulate] =
    useState("");
  const [consulateInterviewDate, setConsulateInterviewDate] = useState("");
  const [consulateInterviewTime, setConsulateInterviewTime] = useState("");
  const [sameLocation, setSameLocation] = useState(true);
  const [isViewDocsModalOpen, setIsViewDocsModalOpen] = useState(false);
  const { lang } = useLanguage();

  const handleOpenDocAdmin = async (doc: ProcessDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from(doc.bucket_id || "process-documents")
        .createSignedUrl(doc.storage_path, 3600);
      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank");
      }
    } catch (err) {
      console.error("Error opening doc:", err);
      toast({ title: "Erro ao abrir documento", variant: "destructive" });
    }
  };

  const fetchProcessData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch the order
      const { data: orderData, error: orderError } = await supabase
        .from("visa_orders")
        .select("*")
        .eq("id", id)
        .single();

      if (orderError) throw orderError;

      // Fetch the corresponding user service
      const { data: serviceData, error: serviceError } = await supabase
        .from("user_services")
        .select("*")
        .eq("user_id", orderData.user_id)
        .eq("service_slug", orderData.product_slug)
        .single();

      const s = serviceData as any;
      const combined = {
        ...orderData,
        service_status: serviceData?.status,
        user_service_id: serviceData?.id,
        application_id: serviceData?.application_id,
        date_of_birth: serviceData?.date_of_birth,
        grandmother_name: serviceData?.grandmother_name,
        interview_date: s?.interview_date,
        interview_time: s?.interview_time,
        interview_location_casv: s?.interview_location_casv,
        interview_location_consulate: s?.interview_location_consulate,
      };

      setOrder(combined);
      setAppId(combined.application_id || "");
      setDob(combined.date_of_birth || "");
      setGrandmaName(combined.grandmother_name || "");
      setConsularLogin(serviceData?.consular_login || "");
      setConsularPassword(serviceData?.consular_password || "");
      setInterviewDate(serviceData?.interview_date || "");
      setInterviewTime(serviceData?.interview_time || "");
      setInterviewLocationCasv(serviceData?.interview_location_casv || "");
      setInterviewLocationConsulate(
        serviceData?.interview_location_consulate || "",
      );
      const svcAny = serviceData as typeof serviceData & {
        consulate_interview_date?: string;
        consulate_interview_time?: string;
        same_location?: boolean;
      };
      setConsulateInterviewDate(svcAny?.consulate_interview_date || "");
      setConsulateInterviewTime(svcAny?.consulate_interview_time || "");
      setSameLocation(svcAny?.same_location !== false);

      // Fetch documents for this user
      if (orderData.user_id) {
        const { data: docs } = await supabase
          .from("documents")
          .select("*")
          .eq("user_id", orderData.user_id);

        // Filter documents belonging to this service or the special DS-160 upload names
        const relevantDocs =
          docs?.filter(
            (d) =>
              d.name === "ds160_assinada" ||
              d.name === "ds160_comprovante" ||
              d.name === "ds160_boleto",
          ) || [];

        // Custom sort: 1. assinada, 2. comprovante, 3. boleto
        const sortOrder: Record<string, number> = {
          ds160_assinada: 1,
          ds160_comprovante: 2,
          ds160_boleto: 3,
        };

        relevantDocs.sort((a, b) => {
          return (sortOrder[a.name] || 99) - (sortOrder[b.name] || 99);
        });

        console.log("DEBUG: Documentos filtrados e ordenados:", relevantDocs);

        setProcessDocs(relevantDocs);

        // Fetch onboarding responses to find consulate/interview location
        const { data: responses } = await supabase
          .from("onboarding_responses")
          .select("*")
          .eq("user_service_id", serviceData.id);

        if (responses) {
          setOnboardingResponses(responses);
          // Find interview location in personal1 or legacy steps
          const personal1 = responses.find((r) => r.step_slug === "personal1");
          const personal1Data = personal1?.data as RegistrationData;
          if (personal1Data?.interviewLocation) {
            setInterviewLocation(personal1Data.interviewLocation);
          } else {
            // Check legacy or other steps
            const travel = responses.find((r) => r.step_slug === "travel");
            const travelData = travel?.data as RegistrationData;
            if (travelData?.consulateCity) {
              setInterviewLocation(travelData.consulateCity);
            }
          }
        }
      }
    } catch (err) {
      const error = err as Error;
      console.error("Error fetching process data:", error);
      toast({ title: "Erro ao carregar processo", variant: "destructive" });
      navigate("/admin/contratos");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    if (id) {
      fetchProcessData();
    }
  }, [id, fetchProcessData]);

  const handleSaveFields = async () => {
    if (!order?.user_service_id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("user_services")
        .update({
          application_id: appId.trim(),
          date_of_birth: dob.trim(),
          grandmother_name: grandmaName.trim(),
          status: "ds160upload_documents",
        })
        .eq("id", order.user_service_id);

      if (error) throw error;

      toast({
        title: "Dados salvos com sucesso",
        description: "Status atualizado para 'Aguardando Revisão/Assinatura'.",
      });

      fetchProcessData();
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCredentials = async () => {
    if (!order?.user_service_id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("user_services")
        .update({
          consular_login: consularLogin.trim(),
          consular_password: consularPassword.trim(),
        })
        .eq("id", order.user_service_id);

      if (error) throw error;

      toast({
        title: "Credenciais salvas",
        description: "O cliente poderá visualizar os dados no portal.",
      });

      fetchProcessData();
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Erro ao salvar credenciais",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveInterviewDetails = async () => {
    if (!order?.user_service_id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("user_services")
        .update({
          interview_date: interviewDate || null,
          interview_time: interviewTime || null,
          interview_location_casv: interviewLocationCasv.trim() || null,
          interview_location_consulate:
            interviewLocationConsulate.trim() || null,
          same_location: sameLocation,
          consulate_interview_date: sameLocation
            ? null
            : consulateInterviewDate || null,
          consulate_interview_time: sameLocation
            ? null
            : consulateInterviewTime || null,
        })
        .eq("id", order.user_service_id);

      if (error) throw error;

      toast({
        title: "Agendamento salvo",
        description: "Os dados da entrevista foram atualizados.",
      });

      fetchProcessData();
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Erro ao salvar agendamento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleApproveDocuments = async () => {
    if (!order?.user_service_id) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("user_services")
        .update({ status: "casvSchedulingPending" })
        .eq("id", order.user_service_id);

      if (error) throw error;

      // Update all documents status to approved if desired,
      // but the requirement just says change process status
      await supabase
        .from("documents")
        .update({ status: "approved" })
        .eq("user_service_id", order.user_service_id);

      toast({
        title: "Documentos aprovados",
        description: "Status alterado para 'CASV: Agendamento Pendente'.",
      });
      fetchProcessData();
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Erro ao aprovar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRejectDocuments = async () => {
    if (!order?.user_service_id) return;
    // For rejection, we might want to move back to a state where they can re-upload
    // or just leave it in current state and ask for re-upload
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("user_services")
        .update({ status: "ds160upload_documents" })
        .eq("id", order.user_service_id);

      if (error) throw error;

      await supabase
        .from("documents")
        .update({ status: "resubmit" })
        .eq("user_service_id", order.user_service_id);

      toast({
        title: "Documentos rejeitados",
        description: "O cliente será solicitado a enviar novamente.",
      });
      fetchProcessData();
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBoletoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !order?.user_service_id) return;

    setIsSaving(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${order.user_service_id}/boleto_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("process-documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create document record
      const { error: dbError } = await supabase.from("documents").upsert(
        {
          user_id: order.user_id,
          user_service_id: order.user_service_id,
          name: "ds160_boleto",
          storage_path: filePath,
          bucket_id: "process-documents",
          status: "approved",
          created_at: new Date().toISOString(),
        },
        { onConflict: "user_id,name" },
      );

      if (dbError) throw dbError;

      toast({
        title: "Boleto enviado",
        description: "O arquivo foi disponibilizado para o cliente.",
      });

      fetchProcessData();
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegeneratePdf = async () => {
    if (!order) return;
    setRegeneratingId(order.id);
    try {
      // Limpa o PDF atual para forçar regeneração
      await supabase
        .from("visa_orders")
        .update({ contract_pdf_url: null })
        .eq("id", order.id);

      const { error } = await supabase.functions.invoke(
        "generate-contract-pdf",
        {
          body: { orderId: order.id },
        },
      );

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description:
          "O contrato está sendo regenerado. Aguarde alguns segundos.",
      });

      // Aguarda um pouco e recarrega
      setTimeout(fetchProcessData, 3000);
    } catch (err) {
      const error = err as Error;
      console.error("Erro ao regenerar PDF:", error);
      toast({
        title: "Erro ao regenerar contrato",
        description: "Não foi possível iniciar a regeneração do PDF.",
        variant: "destructive",
      });
    } finally {
      setRegeneratingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!order) return null;

  const status = order.service_status || "unknown";
  const isAlreadySaved = !!(
    order.application_id &&
    order.date_of_birth &&
    order.grandmother_name
  );

  const renderStatusContent = () => {
    switch (status) {
      case "ds160InProgress":
      case "active":
        return (
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl border border-yellow-200 dark:border-yellow-900/30">
              <ClipboardList className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-bold text-yellow-700">
                  Fluxo DS-160
                </p>
                <p className="text-xs text-yellow-600">
                  O cliente ainda precisa preencher a DS-160.
                </p>
              </div>
            </div>
          </div>
        );

      case "ds160Processing":
      case "review_pending":
      case "review_assign":
        return (
          <div className="space-y-6 max-w-xl">
            <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl border border-yellow-200 dark:border-yellow-900/30">
              <ClipboardList className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-bold text-yellow-700">
                  Fluxo DS-160
                </p>
                <p className="text-xs text-yellow-600">
                  Preencha os dados de segurança para liberar o upload dos
                  documentos pelo cliente.
                </p>
              </div>
            </div>

            <div className="space-y-4 p-6 bg-accent/5 rounded-2xl border border-accent/20 shadow-sm">
              <div className="flex items-center gap-2 border-b border-accent/10 pb-3 mb-4">
                <ShieldCheck className="h-5 w-5 text-accent" />
                <h4 className="text-sm font-bold uppercase tracking-widest text-accent">
                  Dados de Segurança
                </h4>
              </div>

              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Application ID
                  </label>
                  <Input
                    placeholder="Ex: AA00..."
                    value={appId}
                    onChange={(e) => setAppId(e.target.value.toUpperCase())}
                    className="font-mono h-11 uppercase"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Nascimento
                    </label>
                    <Input
                      placeholder="DD/MM/AAAA"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Nome da Avó
                    </label>
                    <Input
                      placeholder="Nome Completo"
                      value={grandmaName}
                      onChange={(e) => setGrandmaName(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button
                className="w-full gap-2 mt-4 h-12 shadow-lg bg-accent hover:bg-green-dark"
                onClick={handleSaveFields}
                disabled={
                  isSaving ||
                  !appId.trim() ||
                  !dob.trim() ||
                  !grandmaName.trim()
                }
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                SALVAR E PEDIR UPLOADS
              </Button>
            </div>
          </div>
        );

      case "ds160upload_documents":
        return (
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-xl border border-orange-200 dark:border-orange-900/30">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-bold text-orange-700">
                  Aguardando Cliente
                </p>
                <p className="text-xs text-orange-600">
                  Os dados de segurança foram salvos. O cliente agora precisa
                  anexar os documentos assinados e a confirmação de envio.
                </p>
              </div>
            </div>

            <div className="p-6 bg-muted/20 rounded-2xl border border-border space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Dados Salvos
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[10px] font-bold"
                  onClick={() => {
                    // Permite editar se precisar
                  }}
                >
                  EDITAR
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                    Application ID
                  </label>
                  <p className="font-mono font-bold text-lg">{appId}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                    Nascimento
                  </label>
                  <p className="font-bold text-lg">{dob}</p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-dashed border-border rounded-xl text-center">
              <p className="text-xs text-muted-foreground italic">
                O fluxo avançará automaticamente assim que o cliente clicar em
                "Enviar Documentos" no portal dele.
              </p>
            </div>

            {processDocs.length > 0 && (
              <div className="mt-8 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Arquivos já recebidos (Parcial)
                </h4>
                <div className="grid gap-3">
                  {processDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 bg-card border border-border rounded-xl shadow-sm hover:border-accent/40 transition-shadow"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate">
                            {doc.name === "ds160_assinada"
                              ? "ASSINADA"
                              : doc.name === "ds160_comprovante"
                                ? "COMPROVANTE"
                                : doc.name === "ds160_boleto"
                                  ? "BOLETO"
                                  : doc.name
                                      .replace(/ds160_?|DS160_?/gi, "")
                                      .replace(/_/g, " ")
                                      .toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 border-accent/20 text-accent hover:bg-accent/10 font-bold text-[10px] tracking-wider"
                        onClick={() => {
                          const { data } = supabase.storage
                            .from(doc.bucket_id || "documents")
                            .getPublicUrl(doc.storage_path);
                          window.open(data.publicUrl, "_blank");
                        }}
                      >
                        ABRIR
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case "ds160AwaitingReviewAndSignature":
      case "uploadsUnderReview":
        return (
          <div className="space-y-6 max-w-xl">
            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900/30">
              <Upload className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-bold text-blue-700">
                  Validação de Documentos
                </p>
                <p className="text-xs text-blue-600">
                  O cliente enviou os documentos. Por favor, revise os anexos
                  abaixo para prosseguir com o agendamento.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Arquivos do Processo
              </h4>
              <div className="grid gap-3">
                {processDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-card border border-border rounded-xl shadow-sm hover:border-accent/40 transition-shadow"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">
                          {doc.name === "ds160_assinada"
                            ? "ASSINADA"
                            : doc.name === "ds160_comprovante"
                              ? "COMPROVANTE"
                              : doc.name === "ds160_boleto"
                                ? "BOLETO"
                                : doc.name
                                    .replace(/ds160_?|DS160_?/gi, "")
                                    .replace(/_/g, " ")
                                    .toUpperCase()}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase font-medium">
                          {doc.storage_path.split(".").pop()} •{" "}
                          {new Date(doc.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-accent/20 text-accent hover:bg-accent/10 font-bold text-[10px] tracking-wider"
                      onClick={() => {
                        const { data } = supabase.storage
                          .from(doc.bucket_id || "documents")
                          .getPublicUrl(doc.storage_path);
                        window.open(data.publicUrl, "_blank");
                      }}
                    >
                      ABRIR
                    </Button>
                  </div>
                ))}

                {processDocs.length === 0 && (
                  <div className="text-center py-10 border-2 border-dashed border-border rounded-xl bg-muted/10">
                    <p className="text-sm text-muted-foreground italic">
                      Nenhum documento anexado ainda.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button
                variant="outline"
                className="h-12 border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold text-xs tracking-wide"
                onClick={handleRejectDocuments}
                disabled={isSaving}
              >
                <XCircle className="h-4 w-4 mr-2" />
                REJEITAR / PEDIR RECORREÇÃO
              </Button>
              <Button
                className="h-12 bg-accent hover:bg-green-dark text-white font-bold text-xs tracking-wide shadow-lg shadow-accent/20"
                onClick={handleApproveDocuments}
                disabled={isSaving || processDocs.length === 0}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                APROVAR DOCUMENTOS
              </Button>
            </div>
          </div>
        );

      case "approved":
      case "completed": {
        return (
          <div className="space-y-6">
            <div className="p-8 border-2 border-green-200 dark:border-green-900/30 rounded-3xl bg-green-50 dark:bg-green-950/20 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-600"></div>

              <div className="h-16 w-16 mb-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center border-4 border-white dark:border-green-800 shadow-sm">
                <Trophy className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>

              <h3 className="text-xl font-display font-bold text-green-800 dark:text-green-300 mb-2">
                Visto Aprovado!
              </h3>

              <p className="text-sm text-green-700 dark:text-green-400 max-w-[320px] leading-relaxed mb-6">
                Este processo foi concluído com sucesso e o visto do cliente foi
                aprovado na entrevista.
              </p>
            </div>
          </div>
        );
      }

      case "casvSchedulingPending":
      case "casvFeeProcessing":
      case "casvPaymentPending":
      case "awaitingInterview": {
        const sched = onboardingResponses.find(
          (r) => r.step_slug === "casv_scheduling",
        );
        const schedData = sched?.data as SchedData;
        const preferredDate = schedData?.preferred_date;

        return (
          <div className="space-y-8 max-w-xl pb-20">
            <div
              className={`flex items-center gap-3 p-4 rounded-2xl border ${
                order.service_status === "awaitingInterview"
                  ? "bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30"
                  : "bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/30"
              }`}
            >
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  order.service_status === "awaitingInterview"
                    ? "bg-blue-100 dark:bg-blue-900"
                    : "bg-green-100 dark:bg-green-900"
                }`}
              >
                {order.service_status === "awaitingInterview" ? (
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                ) : (
                  <Calendar className="h-5 w-5 text-green-600" />
                )}
              </div>
              <div>
                <p
                  className={`text-sm font-bold ${order.service_status === "awaitingInterview" ? "text-blue-800" : "text-green-800"}`}
                >
                  {order.service_status === "awaitingInterview"
                    ? "Fase Final: Aguardando Entrevista"
                    : "Fase de Agendamento e Taxas"}
                </p>
                <p
                  className={`text-xs ${order.service_status === "awaitingInterview" ? "text-blue-600" : "text-green-600"}`}
                >
                  {order.service_status === "awaitingInterview"
                    ? "O cliente já informou o pagamento e dados da entrevista estão sendo processados."
                    : "Acompanhe a preferência de data e disponibilize o boleto."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-4 border-border bg-muted/20">
                <label className="text-[10px] font-black uppercase text-muted-foreground block mb-2">
                  Consulado (DS-160)
                </label>
                <p className="font-bold text-foreground text-sm">
                  {interviewLocation || "Não informado"}
                </p>
              </Card>

              <Card className="p-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900/30">
                <label className="text-[10px] font-black uppercase text-yellow-600 block mb-2">
                  Preferência do Cliente
                </label>
                <div className="font-bold text-foreground text-sm">
                  {preferredDate
                    ? new Date(preferredDate + "T12:00:00").toLocaleDateString(
                        "pt-BR",
                      )
                    : "Aguardando..."}
                </div>
              </Card>

              <Card
                className={`p-4 ${order.interview_date ? "border-accent/30 bg-accent/5" : "border-border bg-muted/20"}`}
              >
                <label className="text-[10px] font-black uppercase text-accent block mb-2">
                  Data Marcada (Admin)
                </label>
                <div className="font-bold text-foreground text-sm">
                  {order.interview_date ? (
                    new Date(
                      order.interview_date + "T12:00:00",
                    ).toLocaleDateString("pt-BR")
                  ) : (
                    <span className="text-muted-foreground italic text-xs">
                      Não definida ainda
                    </span>
                  )}
                </div>
                {order.interview_time && (
                  <p className="text-xs text-accent font-bold mt-1">
                    @ {order.interview_time.slice(0, 5)}
                  </p>
                )}
              </Card>
            </div>

            {["awaitingInterview", "approved", "completed"].includes(
              status,
            ) && (
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Agendamento da Entrevista
                </h4>

                {/* Same / Different location toggle */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSameLocation(true)}
                    className={`p-3 rounded-xl border-2 text-xs font-bold transition-all ${
                      sameLocation
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-card text-muted-foreground hover:border-accent/40"
                    }`}
                  >
                    🏢 CASV e Consulado no mesmo local
                  </button>
                  <button
                    type="button"
                    onClick={() => setSameLocation(false)}
                    className={`p-3 rounded-xl border-2 text-xs font-bold transition-all ${
                      !sameLocation
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-card text-muted-foreground hover:border-accent/40"
                    }`}
                  >
                    📍 CASV e Consulado em locais diferentes
                  </button>
                </div>

                {/* CASV Date */}
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">
                    {sameLocation ? "Data CASV / Consulado" : "Data CASV"}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                        Data Marcada
                      </label>
                      <Input
                        type="date"
                        value={interviewDate}
                        onChange={(e) => setInterviewDate(e.target.value)}
                        className="h-10 bg-card"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                        Hora Marcada
                      </label>
                      <Input
                        type="time"
                        value={interviewTime}
                        onChange={(e) => setInterviewTime(e.target.value)}
                        className="h-10 bg-card"
                      />
                    </div>
                  </div>
                </div>

                {/* Consulate Date — only when locations are different */}
                {!sameLocation && (
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">
                      Data Consulado
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                          Data Marcada
                        </label>
                        <Input
                          type="date"
                          value={consulateInterviewDate}
                          onChange={(e) =>
                            setConsulateInterviewDate(e.target.value)
                          }
                          className="h-10 bg-card"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                          Hora Marcada
                        </label>
                        <Input
                          type="time"
                          value={consulateInterviewTime}
                          onChange={(e) =>
                            setConsulateInterviewTime(e.target.value)
                          }
                          className="h-10 bg-card"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                    Localidade CASV
                  </label>
                  <Input
                    value={interviewLocationCasv}
                    onChange={(e) => setInterviewLocationCasv(e.target.value)}
                    placeholder="Ex: CASV São Paulo - Chácara Santo Antônio"
                    className="h-10 bg-card"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                    Localidade Consulado
                  </label>
                  <Input
                    value={interviewLocationConsulate}
                    onChange={(e) =>
                      setInterviewLocationConsulate(e.target.value)
                    }
                    placeholder="Ex: Consulado Americano - São Paulo"
                    className="h-10 bg-card"
                  />
                </div>
                <Button
                  size="sm"
                  className="w-full h-10 gap-2 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-none font-black text-[10px] tracking-widest"
                  onClick={handleSaveInterviewDetails}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Save className="h-3 w-3" />
                  )}
                  SALVAR AGENDAMENTO
                </Button>
              </div>
            )}

            {status === "casvFeeProcessing" && (
              <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl border border-yellow-200 dark:border-yellow-900/30">
                <Clock className="h-5 w-5 text-yellow-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-yellow-700">
                    Aguardando confirmação do e-mail
                  </p>
                  <p className="text-xs text-yellow-600">
                    O cliente ainda não confirmou o e-mail no portal. As
                    credenciais consulares e o upload do boleto serão
                    habilitados após essa confirmação.
                  </p>
                </div>
              </div>
            )}

            {status === "casvPaymentPending" && (
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Credenciais Consulares
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                      Login / E-mail
                    </label>
                    <Input
                      value={consularLogin}
                      onChange={(e) => setConsularLogin(e.target.value)}
                      placeholder="E-mail do portal"
                      className="h-10 bg-card"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                      Senha
                    </label>
                    <Input
                      value={consularPassword}
                      onChange={(e) => setConsularPassword(e.target.value)}
                      placeholder="Senha do portal"
                      className="h-10 bg-card"
                    />
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full h-10 gap-2 bg-accent/10 text-accent hover:bg-accent/20 border-none font-black text-[10px] tracking-widest"
                  onClick={handleSaveCredentials}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Save className="h-3 w-3" />
                  )}
                  SALVAR CREDENCIAIS
                </Button>
              </div>
            )}

            {status === "casvPaymentPending" && (
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Boleto da Taxa MRV
                </h4>

                {!preferredDate ? (
                  <div className="p-8 border-2 border-dashed border-muted rounded-3xl bg-muted/5 flex flex-col items-center justify-center text-center">
                    <Clock className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                    <p className="text-sm font-bold text-muted-foreground uppercase">
                      Aguardando escolha da data
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase mt-2 max-w-[280px] leading-relaxed">
                      O upload do boleto será habilitado assim que o cliente
                      definir sua preferência de data no onboarding.
                    </p>
                  </div>
                ) : processDocs.find((d) => d.name === "ds160_boleto") ? (
                  <div className="flex items-center justify-between p-4 bg-card border border-accent/20 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          Boleto Disponibilizado
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase">
                          Enviado em{" "}
                          {new Date(
                            processDocs.find((d) => d.name === "ds160_boleto")
                              .created_at,
                          ).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-[10px] font-bold"
                        onClick={() => {
                          const doc = processDocs.find(
                            (d) => d.name === "ds160_boleto",
                          );
                          const { data } = supabase.storage
                            .from(doc.bucket_id || "documents")
                            .getPublicUrl(doc.storage_path);
                          window.open(data.publicUrl, "_blank");
                        }}
                      >
                        ABRIR
                      </Button>
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-[10px] font-bold text-accent"
                        >
                          SUBSTITUIR
                        </Button>
                        <input
                          type="file"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={handleBoletoUpload}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative group">
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-accent/20 rounded-3xl bg-accent/5 hover:bg-accent/10 transition-colors group-hover:border-accent/40 cursor-pointer text-center">
                      <Upload className="h-8 w-8 text-accent mb-2" />
                      <p className="text-sm font-bold text-accent">
                        UPLOAD DO BOLETO
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase mt-1">
                        PDF, JPG ou PNG
                      </p>
                    </div>
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleBoletoUpload}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  </div>
                )}
              </div>
            )}

            {status === "casvPaymentPending" &&
              !!processDocs.find((d) => d.name === "ds160_boleto") &&
              !!(consularLogin || consularPassword) && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900/30">
                  <Clock className="h-5 w-5 text-blue-600 shrink-0 animate-pulse" />
                  <div>
                    <p className="text-sm font-bold text-blue-700">
                      Aguardando confirmação de pagamento
                    </p>
                    <p className="text-xs text-blue-600">
                      O boleto e as credenciais foram disponibilizados ao
                      cliente. Aguardando ele confirmar o pagamento no portal.
                    </p>
                  </div>
                </div>
              )}
          </div>
        );
      }

      default:
        return (
          <div className="py-12 text-center text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Detalhes específicos para este status ainda não configurados.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/contratos")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Gestão do Processo
          </h2>
          <p className="text-muted-foreground">
            Cliente:{" "}
            <span className="font-bold text-foreground">
              {order.client_name}
            </span>{" "}
            • {order.product_slug}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Status info & Logs */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs defaultValue="actions" className="w-full">
            <TabsList className="mb-4 bg-muted/50 p-1 border border-border">
              <TabsTrigger
                value="actions"
                className="text-xs font-bold uppercase tracking-wider px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
              >
                Ações Necessárias
              </TabsTrigger>
              <TabsTrigger
                value="logs"
                className="text-xs font-bold uppercase tracking-wider px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
              >
                Histórico e Observações
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="actions"
              className="mt-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm min-h-[300px]">
                {renderStatusContent()}
              </div>
            </TabsContent>

            <TabsContent
              value="logs"
              className="mt-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <AdminProcessLogs userServiceId={order.user_service_id} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Process & Order info */}
        <div className="space-y-6">
          {/* Timeline Section */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Resumo do Status
            </h3>
            <AdminVerticalTimeline currentStatus={status} />
          </div>

          {/* Security Data Card — shown after saving */}
          {isAlreadySaved && (
            <div className="bg-card border border-accent/20 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-accent/10 pb-3">
                <ShieldCheck className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-accent">
                  Dados de Segurança
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Application ID
                  </p>
                  <p className="font-mono font-bold text-foreground text-sm mt-0.5 break-all">
                    {order.application_id}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Nascimento
                  </p>
                  <p className="font-bold text-foreground text-sm mt-0.5">
                    {order.date_of_birth}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Nome da Avó
                  </p>
                  <p className="font-bold text-foreground text-sm mt-0.5">
                    {order.grandmother_name}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Informações do Pedido
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                  Pedido
                </p>
                <p className="text-sm font-medium">{order.order_number}</p>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                  E-mail
                </p>
                <p className="text-sm font-medium break-all leading-tight">
                  {order.client_email}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                  Valor
                </p>
                <p className="text-sm font-medium">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(order.total_price_usd)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                  Data da Compra
                </p>
                <p className="text-sm font-medium">
                  {new Date(order.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                  Data do Aceite
                </p>
                <p className="text-sm font-medium">
                  {order.terms_accepted_at
                    ? new Date(order.terms_accepted_at).toLocaleDateString(
                        "pt-BR",
                      )
                    : "Pendente"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Formulário DS-160
            </h3>
            <Button
              variant="outline"
              className="w-full gap-2 border-accent text-accent hover:bg-accent hover:text-white transition-all h-11 font-bold"
              onClick={() =>
                navigate(`/admin/ds160/${order.user_id}`, {
                  state: { clientName: order.client_name },
                })
              }
            >
              <ClipboardList className="h-4 w-4" />
              VER RESPOSTAS DS-160
            </Button>

            {(status === "casvSchedulingPending" ||
              status === "casvFeeProcessing" ||
              status === "casvPaymentPending" ||
              status === "awaitingInterview" ||
              status === "approved" ||
              status === "completed") &&
              processDocs.length > 0 && (
                <Button
                  variant="outline"
                  className="w-full mt-3 gap-2 border-primary/20 text-primary hover:bg-primary/5 hover:text-primary transition-all h-11 font-bold"
                  onClick={() => setIsViewDocsModalOpen(true)}
                >
                  <Eye className="h-4 w-4" />
                  VER DOCUMENTOS ENVIADOS
                </Button>
              )}
          </div>

          {/* Contract PDF Section */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-accent" />
              Contrato do Processo
            </h3>
            <div className="space-y-3">
              {order.contract_pdf_url ? (
                <a
                  href={order.contract_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full gap-2 font-bold h-11 bg-accent hover:bg-green-dark">
                    <Download className="h-4 w-4" />
                    BAIXAR CONTRATO PDF
                  </Button>
                </a>
              ) : (
                <div className="p-4 bg-muted/50 rounded-xl border border-dashed border-border text-center">
                  <p className="text-xs text-muted-foreground italic mb-2">
                    PDF não disponível ou em geração
                  </p>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 text-[10px] font-bold h-8 border-accent/20 text-accent hover:bg-accent/5"
                onClick={handleRegeneratePdf}
                disabled={!!regeneratingId}
              >
                {regeneratingId ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                REGERAR CONTRATO
              </Button>
            </div>
          </div>

          {/* Selfie Section */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-accent" />
              Selfie do Cliente
            </h3>
            {order.contract_selfie_url ? (
              <div className="relative group overflow-hidden rounded-xl border border-border aspect-square bg-slate-50 flex items-center justify-center">
                <img
                  src={order.contract_selfie_url}
                  alt="Selfie do cliente"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <a
                  href={order.contract_selfie_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300"
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    className="font-bold text-xs gap-2"
                  >
                    <ExternalLink className="h-3 w-3" />
                    VER EM TELA CHEIA
                  </Button>
                </a>
              </div>
            ) : (
              <div className="py-12 text-center bg-slate-50 dark:bg-slate-900 rounded-xl border-2 border-dashed border-muted-foreground/20">
                <UserIcon className="h-10 w-10 mx-auto text-muted-foreground/20 mb-2" />
                <p className="text-[10px] font-medium text-muted-foreground uppercase">
                  Nenhuma selfie disponível
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isViewDocsModalOpen} onOpenChange={setIsViewDocsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Documentos Enviados</DialogTitle>
            <DialogDescription>
              Visualize os documentos anexados neste processo.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            {processDocs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum documento encontrado.
              </p>
            ) : (
              processDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-xl border bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-accent" />
                    <span className="text-sm font-bold pr-4 break-all">
                      {doc.name === "ds160_assinada"
                        ? "ASSINADA"
                        : doc.name === "ds160_comprovante"
                          ? "COMPROVANTE"
                          : doc.name === "ds160_boleto"
                            ? "BOLETO"
                            : doc.name
                                .replace(/ds160_?|DS160_?/gi, "")
                                .replace(/_/g, " ")
                                .toUpperCase()}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenDocAdmin(doc)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Abrir
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
