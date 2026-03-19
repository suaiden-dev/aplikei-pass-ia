import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/presentation/components/atoms/button";
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
  Phone,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/presentation/components/atoms/dialog";
import { Badge } from "@/presentation/components/atoms/badge";
import { Input } from "@/presentation/components/atoms/input";
import { AdminStatusTimeline } from "@/presentation/components/organisms/admin/AdminStatusTimeline";
import { AdminVerticalTimeline } from "@/presentation/components/organisms/admin/AdminVerticalTimeline";
import { AdminProcessLogs } from "@/presentation/components/organisms/admin/AdminProcessLogs";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/presentation/components/atoms/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/presentation/components/atoms/tabs";

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
  contract_selfie_url?: string | null;
  consular_login?: string | null;
  consular_password?: string | null;
  interview_date?: string | null;
  interview_time?: string | null;
  consulate_interview_date?: string | null;
  consulate_interview_time?: string | null;
  interview_location_casv?: string | null;
  interview_location_consulate?: string | null;
  specialist_training_data?: Record<string, unknown> | null;
  specialist_review_data?: Record<string, unknown> | null;
  client_name?: string | null;
  client_email?: string | null;
  client_whatsapp?: string | null;
  order_number?: string | null;
  total_price_usd?: number;
  created_at: string;
  terms_accepted_at?: string | null;
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
  updated_at: string | null;
}

interface ServiceData {
  id: string;
  service_slug: string;
  status: string | null;
  current_step: number | null;
  application_id: string | null;
  consular_login: string | null;
  consular_password: string | null;
  consulate_interview_date: string | null;
  consulate_interview_time: string | null;
  interview_date: string | null;
  interview_time: string | null;
  interview_location_casv: string | null;
  interview_location_consulate: string | null;
  created_at: string;
  date_of_birth: string | null;
  grandmother_name: string | null;
  is_second_attempt: boolean | null;
  contract_selfie_url: string | null;
  specialist_training_data: Record<string, unknown> | null;
  specialist_review_data: Record<string, unknown> | null;
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
      // Justification: Usando 'any' tático para evitar recursão profunda de tipos do Supabase.
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const { data: orderData, error: orderError } = await ((supabase as any)
        .from("visa_orders")
        .select("*")
        .eq("id", id)
        .single() as Promise<{ data: any | null; error: Error | null }>);

      if (orderError) throw orderError;

      // Fetch user profile for fallback data (like phone)
      let profileData = null;
      if (orderData.user_id) {
        const { data: profile } = await ((supabase as any)
          .from("profiles")
          .select("*")
          .eq("id", orderData.user_id)
          .single() as Promise<{ data: any | null; error: Error | null }>);
        profileData = profile;
      }

      // Fetch service statuses for this user
      const { data: services, error: servicesError } = await ((supabase as any)
        .from("user_services")
        .select("*")
        .eq("user_id", orderData.user_id)
        .eq("service_slug", orderData.product_slug)
        .order("created_at", { ascending: true }) as Promise<{ data: any[] | null; error: Error | null }>);

      if (servicesError) {
        console.error("Error fetching services:", servicesError);
      }

      // Match the service that was created closest to the order
      const matchingServices = (services || []).sort((a, b) => {
        const diffA = Math.abs(new Date(a.created_at).getTime() - new Date(orderData.created_at).getTime());
        const diffB = Math.abs(new Date(b.created_at).getTime() - new Date(orderData.created_at).getTime());
        return diffA - diffB;
      });

      const serviceData = matchingServices[0] || null;

      if (!serviceData) {
        console.warn("No matching service found for this order");
      }

      const s = serviceData as unknown as ServiceData;
      const combined: Order = {
        ...(orderData as unknown as Order),
        service_status: serviceData?.status || "unknown",
        user_service_id: serviceData?.id || null,
        application_id: serviceData?.application_id || null,
        date_of_birth: serviceData?.date_of_birth || null,
        grandmother_name: serviceData?.grandmother_name || null,
        interview_date: s?.interview_date || null,
        interview_time: s?.interview_time || null,
        consulate_interview_date: s?.consulate_interview_date || null,
        consulate_interview_time: s?.consulate_interview_time || null,
        interview_location_casv: s?.interview_location_casv || null,
        interview_location_consulate: s?.interview_location_consulate || null,
        contract_pdf_url: orderData.contract_pdf_url || null,
        contract_selfie_url: s?.contract_selfie_url || null,
        specialist_training_data: s?.specialist_training_data || null,
        specialist_review_data: s?.specialist_review_data || null,
        consular_login: serviceData?.consular_login || null,
        consular_password: serviceData?.consular_password || null,
        client_whatsapp: profileData?.phone || orderData.payment_metadata?.phone || orderData.client_whatsapp || null,
      };
      /* eslint-enable @typescript-eslint/no-explicit-any */

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
        // Justification: Usando 'any' tático para evitar recursão profunda de tipos.
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const { data: docs } = await ((supabase as any)
          .from("documents")
          .select("*")
          .eq("user_id", orderData.user_id) as Promise<{ data: any[] | null; error: Error | null }>);
        /* eslint-enable @typescript-eslint/no-explicit-any */

        // Filter documents belonging to this service or the special DS-160 upload names
        const relevantDocs =
          docs?.filter(
            (d) =>
              d.name === "ds160_assinada" ||
              d.name === "ds160_comprovante" ||
              d.name === "ds160_comprovante_sevis" ||
              d.name === "ds160_boleto",
          ) || [];

        // Custom sort: 1. assinada, 2. comprovante, 3. boleto
        const sortOrder: Record<string, number> = {
          ds160_assinada: 1,
          ds160_comprovante: 2,
          ds160_comprovante_sevis: 2,
          ds160_boleto: 3,
        };

        relevantDocs.sort((a, b) => {
          return (sortOrder[a.name] || 99) - (sortOrder[b.name] || 99);
        });

        console.log("DEBUG: Documentos filtrados e ordenados:", relevantDocs);

        setProcessDocs(relevantDocs);

        /* eslint-disable @typescript-eslint/no-explicit-any */
        const { data: responses } = serviceData?.id 
          ? await ((supabase as any)
              .from("onboarding_responses")
              .select("*")
              .eq("user_service_id", serviceData.id) as Promise<{ data: any[] | null; error: Error | null }>)
          : { data: null };
        /* eslint-enable @typescript-eslint/no-explicit-any */

        if (responses) {
          const typedResponses = responses as unknown as OnboardingResponse[];
          setOnboardingResponses(typedResponses);
          // Find interview location in personal1 or legacy steps
          const personal1 = typedResponses.find((r) => r.step_slug === "personal1");
          const personal1Data = personal1?.data as RegistrationData | undefined;
          if (personal1Data?.interviewLocation) {
            setInterviewLocation(String(personal1Data.interviewLocation));
          } else {
            // Check legacy or other steps
            const travel = typedResponses.find((r) => r.step_slug === "travel");
            const travelData = travel?.data as RegistrationData | undefined;
            if (travelData?.consulateCity) {
              setInterviewLocation(String(travelData.consulateCity));
            }
          }

          // Pre-fill grandma name from family info if not already set in user_services
          if (!serviceData?.grandmother_name) {
            const familyStep = typedResponses.find((r) => r.step_slug === "family");
            const familyData = familyStep?.data as Record<string, unknown> | undefined;
            if (familyData?.maternalGrandmotherName) {
              setGrandmaName(String(familyData.maternalGrandmotherName));
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
            <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-md border border-yellow-200 dark:border-yellow-900/30">
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
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-md border border-yellow-200 dark:border-yellow-900/30">
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

            <div className="space-y-4 p-4 bg-accent/5 rounded-md border border-accent/20 shadow-sm">
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
            <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-md border border-orange-200 dark:border-orange-900/30">
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

            <div className="p-4 bg-muted/20 rounded-md border border-border space-y-4">
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
              <div className="grid grid-cols-2 gap-4">
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

            <div className="p-4 border border-dashed border-border rounded-md text-center">
              <p className="text-xs text-muted-foreground italic">
                O fluxo avançará automaticamente assim que o cliente clicar em
                "Enviar Documentos" no portal dele.
              </p>
            </div>
          </div>
        );

      case "ds160AwaitingReviewAndSignature":
      case "uploadsUnderReview":
        return (
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-900/30">
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

            <div className="text-center py-6 border-2 border-dashed border-border rounded-md bg-muted/10">
              <p className="text-sm text-muted-foreground italic">
                Verifique todos os arquivos na coluna à direita para aprovar ou
                rejeitar o processo.
              </p>
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
          <div className="space-y-4">
            <div className="p-5 border-2 border-green-200 dark:border-green-900/30 rounded-3xl bg-green-50 dark:bg-green-950/20 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-600"></div>

              <div className="h-16 w-16 mb-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center border-4 border-white dark:border-green-800 shadow-sm">
                <Trophy className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>

              <h3 className="text-subtitle font-display font-bold text-green-800 dark:text-green-300 mb-2">
                Visto Aprovado!
              </h3>

              <p className="text-sm text-green-700 dark:text-green-400 max-w-[320px] leading-relaxed mb-4">
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
          <div className="space-y-5 max-w-xl pb-20">
            <div
              className={`flex items-center gap-3 p-4 rounded-md border ${
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
                    className={`p-3 rounded-md border-2 text-xs font-bold transition-all ${
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
                    className={`p-3 rounded-md border-2 text-xs font-bold transition-all ${
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

            {status === "casvFeeProcessing" &&
              !(consularLogin || consularPassword) && (
                <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-md border border-yellow-200 dark:border-yellow-900/30">
                  <Clock className="h-5 w-5 text-yellow-600 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-yellow-700">
                      Aguardando Credenciais
                    </p>
                    <p className="text-xs text-yellow-600">
                      O cliente está aguardando você criar e enviar as
                      credenciais consulares.
                    </p>
                  </div>
                </div>
              )}

            {status === "casvFeeProcessing" &&
              !!(consularLogin || consularPassword) && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-900/30">
                  <Clock className="h-5 w-5 text-blue-600 shrink-0 animate-pulse" />
                  <div>
                    <p className="text-sm font-bold text-blue-700">
                      Aguardando cliente confirmar o e-mail
                    </p>
                    <p className="text-xs text-blue-600">
                      As credenciais foram salvas. O cliente agora precisa
                      validar a conta no portal dele.
                    </p>
                  </div>
                </div>
              )}

            {(status === "casvFeeProcessing" ||
              status === "casvPaymentPending") && (
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
                  <div className="p-5 border-2 border-dashed border-muted rounded-3xl bg-muted/5 flex flex-col items-center justify-center text-center">
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
                  <div className="flex items-center justify-between p-4 bg-card border border-accent/20 rounded-md shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-accent/10 flex items-center justify-center text-accent">
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
                    <div className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-accent/20 rounded-3xl bg-accent/5 hover:bg-accent/10 transition-colors group-hover:border-accent/40 cursor-pointer text-center">
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
                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-900/30">
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
    <div className="space-y-4">
      <header className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/contratos")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="font-display text-title font-bold text-foreground">
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Column: Status info & Logs */}
        <div className="lg:col-span-3 space-y-4">
          <Tabs defaultValue="actions" className="w-full">
            <TabsList className="mb-4 bg-muted/50 p-1 border border-border">
              <TabsTrigger
                value="actions"
                className="text-xs font-bold uppercase tracking-wider px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
              >
                Ações Necessárias
              </TabsTrigger>
              <TabsTrigger
                value="logs"
                className="text-xs font-bold uppercase tracking-wider px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
              >
                Histórico e Observações
              </TabsTrigger>
              <TabsTrigger
                value="upsells"
                className="text-xs font-bold uppercase tracking-wider px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
              >
                Serviços Adicionais
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="actions"
              className="mt-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <div className="bg-card border border-border rounded-md p-4 shadow-sm min-h-[300px]">
                {renderStatusContent()}
              </div>
            </TabsContent>

            <TabsContent
              value="logs"
              className="mt-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <div className="bg-card border border-border rounded-md p-4 shadow-sm">
                <AdminProcessLogs userServiceId={order.user_service_id} />
              </div>
            </TabsContent>

            <TabsContent
              value="upsells"
              className="mt-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <div className="bg-card border border-border rounded-md p-4 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <Package className="h-5 w-5 text-accent" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-accent">
                    Treinamento e Revisão
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Treinamento */}
                  <Card className="p-4 border-border bg-muted/10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-accent" />
                        <h4 className="text-sm font-bold">
                          Treinamento Especialista
                        </h4>
                      </div>
                      <Badge
                        variant={
                          order.specialist_training_data?.status === "paid"
                            ? "default"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {order.specialist_training_data?.status === "paid"
                          ? "CONTRATADO"
                          : "NÃO CONTRATADO"}
                      </Badge>
                    </div>
                    {order.specialist_training_data?.status === "paid" && (
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Pacote:</span>
                          <span className="font-medium">
                            {order.specialist_training_data.package_type ===
                              1 && "Bronze (1 Aula)"}
                            {order.specialist_training_data.package_type ===
                              2 && "Prata (2 Aulas)"}
                            {order.specialist_training_data.package_type ===
                              3 && "Ouro (3 Aulas)"}
                            {!order.specialist_training_data.package_type &&
                              "Personalizado"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Última Atualização:
                          </span>
                          <span className="font-medium">
                            {order.specialist_training_data?.updated_at
                              ? new Date(
                                  String(order.specialist_training_data.updated_at),
                                ).toLocaleDateString("pt-BR")
                              : "-"}
                          </span>
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* Revisão */}
                  <Card className="p-4 border-border bg-muted/10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-accent" />
                        <h4 className="text-sm font-bold">
                          Revisão Especialista
                        </h4>
                      </div>
                      <Badge
                        variant={
                          order.specialist_review_data?.status === "paid"
                            ? "default"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {order.specialist_review_data?.status === "paid"
                          ? "CONTRATADO"
                          : "NÃO CONTRATADO"}
                      </Badge>
                    </div>
                    {order.specialist_review_data?.status === "paid" && (
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="font-medium text-green-600">
                            Pagamento Confirmado
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Última Atualização:
                          </span>
                          <span className="font-medium">
                            {order.specialist_review_data?.updated_at
                              ? new Date(
                                  String(order.specialist_review_data.updated_at),
                                ).toLocaleDateString("pt-BR")
                              : "-"}
                          </span>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Process & Order info */}
        <div className="space-y-4">
          {/* Timeline Section */}
          <div className="bg-card border border-border rounded-md p-4 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Resumo do Status
            </h3>
            <AdminVerticalTimeline currentStatus={status} />
          </div>

          {/* Security Data Card — shown after saving */}
          {isAlreadySaved && (
            <div className="bg-card border border-accent/20 rounded-md p-4 shadow-sm space-y-4">
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

          <div className="bg-card border border-border rounded-md p-4 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Informações do Pedido
            </h3>
            <div className="space-y-4">
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-muted-foreground uppercase text-accent">
                  Nome do Cliente
                </p>
                <p className="text-sm font-bold break-all leading-tight">
                  {order.client_name}
                </p>
              </div>
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
                  Telefone / WhatsApp
                </p>
                <p className="text-sm font-medium">
                  {order.client_whatsapp || "Não informado"}
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

          {/* Agendamentos Section - Dedicated for CASV and Consulate Dates */}
          {order.interview_date && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-6 relative">
                <div className="h-10 w-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 ring-4 ring-blue-500/5">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">
                    Agendamentos
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                    Datas de CASV e Consulado
                  </p>
                </div>
              </div>

              <div className="grid gap-3 relative">
                {/* CASV / Principal Interview */}
                <div className="group p-4 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 hover:border-blue-500/30 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-blue-500 transition-colors">
                      {order.consulate_interview_date ? "Data CASV" : "Data Entrevista"}
                    </span>
                    <Clock className="h-3 w-3 text-slate-300" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-slate-700 dark:text-slate-200">
                      {new Date(order.interview_date + "T12:00:00").toLocaleDateString("pt-BR")}
                    </span>
                    {order.interview_time && (
                      <span className="text-xs font-bold text-accent">@ {order.interview_time.slice(0, 5)}</span>
                    )}
                  </div>
                  {order.interview_location_casv && (
                    <p className="text-[9px] text-muted-foreground mt-2 font-medium flex items-center gap-1">
                      <MapPin className="h-2.5 w-2.5 opacity-50" />
                      {order.interview_location_casv}
                    </p>
                  )}
                </div>

                {/* Consulate Interview */}
                {order.consulate_interview_date && (
                  <div className="group p-4 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 hover:border-blue-500/30 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-blue-500 transition-colors">
                        Data Consulado
                      </span>
                      <Trophy className="h-3 w-3 text-slate-300" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-slate-700 dark:text-slate-200">
                        {new Date(order.consulate_interview_date + "T12:00:00").toLocaleDateString("pt-BR")}
                      </span>
                      {order.consulate_interview_time && (
                        <span className="text-xs font-bold text-accent">@ {order.consulate_interview_time.slice(0, 5)}</span>
                      )}
                    </div>
                    {order.interview_location_consulate && (
                      <p className="text-[9px] text-muted-foreground mt-2 font-medium flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5 opacity-50" />
                        {order.interview_location_consulate}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Document Center Section - Redesigned for Premium Look */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-6 relative">
                <div className="h-10 w-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent ring-4 ring-accent/5">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">
                    Documentação
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                    Centro de Arquivos e Dados
                  </p>
                </div>
              </div>
            </div>

            {/* Main Action Grid */}
            <div className="grid gap-4 relative">
              {/* DS-160 Card */}
              <div className="group p-4 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 hover:border-accent/30 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                      <ClipboardList className="h-4 w-4" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Formulário DS-160
                    </span>
                  </div>
                  <Eye className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-10 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-bold rounded-xl hover:bg-accent hover:text-white hover:border-accent transition-all group/btn"
                  onClick={() =>
                    navigate(`/admin/ds160/${order.user_id}`, {
                      state: { 
                        clientName: order.client_name,
                        serviceId: order.user_service_id
                      },
                    })
                  }
                >
                  <span className="flex items-center gap-2">
                    RESPOSTAS COMPLETAS
                  </span>
                  <ExternalLink className="h-3 w-3 opacity-50 group-hover/btn:opacity-100" />
                </Button>
              </div>

              {/* Contract Card */}
              <div className="group p-4 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 hover:border-accent/30 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                      <FileText className="h-4 w-4" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Contrato de Prestação
                    </span>
                  </div>
                  {order.contract_pdf_url && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                </div>
                
                <div className="space-y-2">
                  {order.contract_pdf_url ? (
                    <Button 
                      className="w-full justify-between h-10 px-4 bg-accent hover:bg-green-dark text-white text-[11px] font-bold rounded-xl transition-all shadow-md shadow-accent/10"
                      onClick={() => window.open(order.contract_pdf_url, '_blank')}
                    >
                      <span>DOWNLOAD DO PDF</span>
                      <Download className="h-3 w-3" />
                    </Button>
                  ) : (
                    <div className="h-10 flex items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50">
                      <span className="text-[10px] text-muted-foreground italic font-medium">Aguardando geração...</span>
                    </div>
                  )}

                  <button
                    onClick={handleRegeneratePdf}
                    disabled={!!regeneratingId}
                    className="w-full flex items-center justify-center gap-2 py-1 text-[9px] font-black uppercase text-muted-foreground hover:text-accent transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`h-2.5 w-2.5 ${regeneratingId ? "animate-spin" : ""}`} />
                    Regerar Documento
                  </button>
                </div>
              </div>
            </div>

            {/* Selfie & Identify Section */}
            {order.contract_selfie_url && (
              <div className="pt-2">
                <div className="relative p-2 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/40">
                  <div className="flex items-center gap-3 mb-3 px-3 pt-2">
                    <Fingerprint className="h-4 w-4 text-accent" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Reconhecimento Facial
                    </span>
                  </div>
                  <div className="relative group rounded-2xl overflow-hidden aspect-[4/3] bg-slate-200">
                    <img
                      src={order.contract_selfie_url}
                      alt="Selfie do cliente"
                      className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full h-8 text-[10px] font-bold rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
                        onClick={() => window.open(order.contract_selfie_url, '_blank')}
                      >
                        ABRIR ORIGINAL
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Uploaded Files Center */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Package className="h-3 w-3 text-slate-500" />
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Anexos Recebidos
                  </h4>
                </div>
                <Badge variant="outline" className="text-[9px] h-5 px-2 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold">
                  {processDocs.length} ARQUIVOS
                </Badge>
              </div>

              <div className="grid gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {processDocs.length > 0 ? (
                  processDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="group flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-accent/20 hover:bg-accent/[0.02] transition-all cursor-pointer"
                      onClick={() => {
                        const { data } = supabase.storage
                          .from(doc.bucket_id || "documents")
                          .getPublicUrl(doc.storage_path);
                        window.open(data.publicUrl, "_blank");
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate tracking-tight uppercase">
                            {doc.name === "ds160_assinada"
                              ? "ASSINADA"
                              : doc.name === "ds160_comprovante"
                                ? "COMPROVANTE MRV"
                                : doc.name === "ds160_comprovante_sevis"
                                  ? "COMPROVANTE DS-160"
                                  : doc.name === "ds160_boleto"
                                    ? "BOLETO"
                                    : doc.name
                                        .replace(/ds160_?|DS160_?/gi, "")
                                        .replace(/_/g, " ")
                                        .toUpperCase()}
                          </p>
                          <span className="text-[9px] text-muted-foreground font-medium flex items-center gap-1.5">
                            <Clock className="h-2.5 w-2.5 opacity-50" />
                            {new Date(doc.created_at).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground group-hover:text-accent group-hover:bg-accent/5 transition-all">
                        <Eye className="h-4 w-4" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
                       <FileText className="h-5 w-5 text-slate-300" />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest text-center">
                      Nenhum arquivo anexado
                    </p>
                  </div>
                )}
              </div>
            </div>
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
                  className="flex items-center justify-between p-3 rounded-md border bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-accent" />
                    <span className="text-sm font-bold pr-4 break-all">
                      {doc.name === "ds160_assinada"
                        ? "ASSINADA"
                        : doc.name === "ds160_comprovante"
                          ? "COMPROVANTE MRV"
                          : doc.name === "ds160_comprovante_sevis"
                            ? "COMPROVANTE DS-160"
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
