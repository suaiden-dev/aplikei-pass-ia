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
  CheckSquare,
  Wand2,
  PenLine,
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/presentation/components/atoms/accordion";
import { cn } from "@/lib/utils";
import { AdminCosAnalysisPanel } from "@/presentation/components/organisms/admin/AdminCosAnalysisPanel";


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
  service_metadata?: Record<string, any> | null;
}

interface ProcessDocument {
  id: string;
  user_id: string | null;
  user_service_id: string | null;
  name: string;
  storage_path: string;
  bucket_id: string | null;
  status: string | null;
  feedback?: string | null;
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
  service_metadata: Record<string, any> | null;
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
  const [signedSelfieUrl, setSignedSelfieUrl] = useState<string | null>(null);

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
  const [correctionNotes, setCorrectionNotes] = useState("");
  const { lang } = useLanguage();

  // COS-specific state
  const [cosRejectionNote, setCosRejectionNote] = useState("");
  const [individualRejectionNotes, setIndividualRejectionNotes] = useState<Record<string, string>>({});
  const [cosGeneratingCoverLetter, setCosGeneratingCoverLetter] = useState(false);
  const [cosCoverLetterHtml, setCosCoverLetterHtml] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("actions");

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
      const { data: orderData, error: orderError } = await supabase
        .from("visa_orders")
        .select("*")
        .eq("id", id)
        .single();

      if (orderError) throw orderError;
      if (!orderData) throw new Error("Order not found");

      // Fetch user profile for fallback data (like phone)
      let profileData = null;
      if (orderData.user_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", orderData.user_id)
          .single();
        profileData = profile;
      }

      // Fetch service statuses for this user
      const isCOSProduct = orderData.product_slug === "troca-status" || orderData.product_slug === "extensao-status";
      const slugGroup = [orderData.product_slug];
      if (isCOSProduct) slugGroup.push("changeofstatus");

      const { data: services, error: servicesError } = await supabase
        .from("user_services")
        .select("*")
        .eq("user_id", orderData.user_id as string)
        .in("service_slug", slugGroup)
        .order("created_at", { ascending: true });

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
        contract_selfie_url: orderData.contract_selfie_url || s?.contract_selfie_url || null,

        specialist_review_data: s?.specialist_review_data || null,
        service_metadata: serviceData?.service_metadata || null,
        consular_login: serviceData?.consular_login || null,
        consular_password: serviceData?.consular_password || null,
        client_whatsapp: profileData?.phone || (orderData.payment_metadata as Record<string, unknown>)?.phone || orderData.client_email || null,
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
              (d.user_service_id === serviceData?.id ||
              d.name === "ds160_assinada" ||
              d.name === "ds160_comprovante" ||
              d.name === "ds160_comprovante_sevis" ||
              d.name === "ds160_boleto") &&
              d.name !== "selfie" &&
              d.name !== "Foto (Selfie)",

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
        
        // Fallback: If no selfie URL in order, check if we have it in documents
        const selfieDoc = docs?.find(d => d.name === "selfie" || d.name === "Foto (Selfie)");
        if (selfieDoc && !combined.contract_selfie_url) {
          combined.contract_selfie_url = selfieDoc.storage_path;
        }

        setProcessDocs(relevantDocs);

        const { data: onboardingResponsesData } = serviceData?.id
          ? await supabase
              .from("onboarding_responses")
              .select("*")
              .eq("user_service_id", serviceData.id)
          : { data: null };
        
        if (onboardingResponsesData) {
          const typedResponses = onboardingResponsesData.map((r) => ({
            ...r,
            data: r.data as Record<string, unknown>,
          })) as OnboardingResponse[];
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
          status: "awaitingConsularInterview",
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
    setIsSaving(true);
    try {
      // B1/B2: Step 12, F1/F2: Step 7
      const isF1F2 = order.product_slug === "visa-f1f2" || order.product_slug === "visto-f1";
      const resetStep = isF1F2 ? 7 : 12;

      const { error } = await supabase
        .from("user_services")
        .update({ 
          status: "ds160upload_documents",
          current_step: resetStep
        })
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

  useEffect(() => {
    const signSelfieUrl = async () => {
      if (order?.contract_selfie_url && !order.contract_selfie_url.startsWith("http")) {
        try {
          // Heuristic to decide bucket: contracts/ prefix belongs to visa-documents, 
          // direct userId/ prefix usually belongs to process-documents
          const bucket = order.contract_selfie_url.startsWith("contracts/") ? "visa-documents" : "process-documents";
          
          const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(order.contract_selfie_url, 3600);

          
          if (error) throw error;
          if (data?.signedUrl) {
            setSignedSelfieUrl(data.signedUrl);
          }
        } catch (err) {
          console.error("Error signing selfie URL:", err);
        }
      } else if (order?.contract_selfie_url) {
        setSignedSelfieUrl(order.contract_selfie_url);
      } else {
        setSignedSelfieUrl(null);
      }
    };

    signSelfieUrl();
  }, [order?.contract_selfie_url]);

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

  const renderReviewUI = () => {
    const ds160StepTitles: Record<string, string> = {
      personal1: "11. Personal Information 1",
      personal2: "12. Personal Information 2",
      travel: "13. Address & Phone",
      companions: "14. Travel Companions",
      "previous-travel": "15. Previous US Travel",
      "address-phone": "16. Address & Phone",
      "social-media": "17. Social Media",
      passport: "18. Passport Information",
      "us-contact": "19. US Contact",
      family: "22. Family Information",
      "work-education": "33. Work / Education",
      additional: "34. Additional Information",
      "f1f2-personal1": "1. Personal Information 1",
      "f1f2-personal2": "2. Personal Information 2",
      "f1f2-travel": "3. Travel Information",
      "f1f2-history": "4. US Travel History",
      "f1f2-address-phone": "5. Address & Phone",
      "f1f2-social-media": "6. Social Media",
      "f1f2-passport": "7. Passport Information",
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 bg-accent/5 rounded-md border border-accent/20">
          <ShieldCheck className="h-5 w-5 text-accent" />
          <div>
            <p className="text-sm font-bold text-accent uppercase tracking-widest">
              Revisão Final (DS-160)
            </p>
            <p className="text-xs text-muted-foreground">
              Verifique todas as respostas do formulário e documentos anexados.
            </p>
          </div>
        </div>

        {/* responses removed per user request */}

        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Documentos Anexados
              </h4>
            </div>
            {processDocs.filter(d => d.status !== "approved").length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-3 text-[9px] font-bold uppercase tracking-tighter border-accent/30 text-accent hover:bg-accent/5"
                onClick={() => handleApproveAllDocs(processDocs.filter(d => d.status !== "approved").map(d => d.id))}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckSquare className="h-3 w-3 mr-1" />}
                Aprovar Todos
              </Button>
            )}
          </div>

          <div className="grid gap-3">
            {processDocs.length > 0 ? (
              processDocs.map((doc) => {
                 const isApproved = doc.status === "approved";
                 const isRejected = doc.status === "resubmit";
                 const currentNote = individualRejectionNotes[doc.id] || "";

                 return (
                  <Card key={doc.id} className="p-3 bg-white dark:bg-slate-900 border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center",
                          isApproved ? "bg-green-100 text-green-600" :
                          isRejected ? "bg-red-100 text-red-600" :
                          "bg-blue-100 text-blue-600"
                        )}>
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate tracking-tight uppercase">
                            {doc.name === "ds160_assinada"
                              ? "ASSINADA"
                              : doc.name === "ds160_comprovante"
                                ? "COMPROVANTE"
                              : doc.name === "ds160_comprovante_sevis"
                                ? "COMPROVANTE SEVIS"
                                  : doc.name === "ds160_boleto"
                                    ? "BOLETO"
                                    : doc.name
                                        .replace(/ds160_?|DS160_?/gi, "")
                                        .replace(/_/g, " ")
                                        .toUpperCase()}
                          </p>
                          <p className="text-[8px] text-muted-foreground uppercase font-bold">
                            Status: {isApproved ? "Aprovado" : isRejected ? "Rejeitado" : "Pendente"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[9px] font-bold uppercase text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex gap-1"
                          onClick={() => handleOpenDocAdmin(doc)}
                        >
                          <Eye className="h-3 w-3" />
                          Visualizar
                        </Button>
                        {!isApproved && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[9px] font-bold uppercase text-green-600 hover:text-green-700 hover:bg-green-50 flex gap-1"
                            onClick={() => handleApproveIndividualDoc(doc)}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Aprovar
                          </Button>
                        )}
                        {!isApproved && !isRejected && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[9px] font-bold uppercase text-red-600 hover:text-red-700 hover:bg-red-50 flex gap-1"
                            onClick={() => {
                              const input = document.getElementById(`reject-input-main-${doc.id}`);
                              input?.focus();
                            }}
                          >
                            <XCircle className="h-3 w-3" />
                            Reprovar
                          </Button>
                        )}
                      </div>
                    </div>

                    {!isApproved && (
                      <div className="mt-2 space-y-2 border-t border-slate-50 pt-2 pb-1">
                        <label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">
                          Motivo da Reprova
                        </label>
                        <div className="flex gap-2">
                          <Input
                            id={`reject-input-main-${doc.id}`}
                            placeholder="Descreva o motivo da recusa..."
                            className="h-8 text-[10px] bg-background"
                            value={currentNote}
                            onChange={(e) => setIndividualRejectionNotes(prev => ({ ...prev, [doc.id]: e.target.value }))}
                          />
                          <Button
                            size="sm"
                            className="h-8 px-3 bg-red-600 hover:bg-red-700 text-[10px] font-bold uppercase"
                            onClick={() => handleRejectIndividualDoc(doc)}
                            disabled={!currentNote}
                          >
                            CONFIRMAR REPROVA
                          </Button>
                        </div>
                      </div>
                    )}

                    {doc.feedback && isRejected && (
                      <div className="mt-2 px-2 py-1 bg-red-50 border border-red-100 rounded-md">
                        <p className="text-[8px] text-red-700 font-bold uppercase">Feedback Ativo:</p>
                        <p className="text-[9px] text-red-600 italic">{doc.feedback}</p>
                      </div>
                    )}
                  </Card>
                );
              })
            ) : (
              <div className="p-8 border border-dashed border-muted rounded-xl text-center bg-muted/5">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                  Nenhum arquivo enviado pelo cliente ainda
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-border">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Feedback para o Cliente
            </label>
            <textarea
              value={correctionNotes}
              onChange={(e) => setCorrectionNotes(e.target.value)}
              placeholder="Notas internas ou feedback para o cliente..."
              className="w-full min-h-[100px] p-3 rounded-md border border-border bg-card text-sm focus:ring-1 focus:ring-accent outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-12 gap-2 font-bold text-[10px] uppercase tracking-widest border-red-200 text-red-600 hover:bg-red-50"
              onClick={handleRejectDocuments}
              disabled={isSaving}
            >
              <XCircle className="h-3.5 w-3.5" />
              REJEITAR
            </Button>
            <Button
              className="h-12 gap-2 font-bold text-[10px] uppercase tracking-widest bg-accent hover:bg-green-dark"
              onClick={handleApproveDocuments}
              disabled={isSaving}
            >
              <CheckSquare className="h-3.5 w-3.5" />
              APROVAR
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderProcessingUI = () => {
    return (
      <div className="space-y-6 max-w-xl">
        <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-md border border-yellow-200 dark:border-yellow-900/30">
          <Clock className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="text-sm font-bold text-yellow-700">
              Processamento DS-160 (Admin)
            </p>
            <p className="text-xs text-yellow-600">
              O formulário foi preenchido. Agora você deve processar na CEAC e informar o ID da Application e data de nascimento.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <Card className="p-4 border-border bg-card shadow-sm">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">
              Dados de Processamento
            </h4>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                  Application ID (AA00...)
                </label>
                <Input
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="AA00..."
                  className="h-10 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                    Data de Nascimento (YYYY-MM-DD)
                  </label>
                  <Input
                    type="text"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    placeholder="Ex: 1990-05-20"
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                    Nome da Avó Materna (DS-160)
                  </label>
                  <Input
                    value={grandmaName}
                    onChange={(e) => setGrandmaName(e.target.value)}
                    placeholder="Nome da Avó"
                    className="h-10"
                  />
                </div>
              </div>

              <Button
                className="w-full h-10 gap-2 font-bold text-[10px] uppercase tracking-widest bg-accent hover:bg-green-dark"
                onClick={handleSaveFields}
                disabled={isSaving || !appId || !dob}
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                SALVAR E SOLICITAR ASSINATURA
              </Button>
            </div>
          </Card>

          {/* responses shortcut removed per user request */}
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────
  // COS Admin Handlers
  // ─────────────────────────────────────────────

  const handleCOSApprove = async (nextStatus: string) => {
    if (!order?.user_service_id) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("user_services")
        .update({ status: nextStatus })
        .eq("id", order.user_service_id);
      if (error) throw error;
      toast({ title: "Aprovado!", description: `Status atualizado para ${nextStatus}.` });
      fetchProcessData();
    } catch (err) {
      const e = err as Error;
      toast({ title: "Erro ao aprovar", description: e.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCOSReject = async () => {
    if (!order?.user_service_id) return;
    setIsSaving(true);
    try {
      const currentStatus = order.service_status || "";
      // Determine the previous client-facing step based on current admin review status
      let rejectToStatus = "COS_ADMIN_SCREENING";
      if (currentStatus === "COS_OFFICIAL_FORMS_REVIEW") rejectToStatus = "COS_OFFICIAL_FORMS";
      if (currentStatus === "COS_COVER_LETTER_ADMIN_REVIEW") rejectToStatus = "COS_COVER_LETTER_FORM";
      if (currentStatus === "COS_F1_I20_REVIEW") rejectToStatus = "COS_F1_I20";
      if (currentStatus === "COS_SEVIS_FEE_REVIEW") rejectToStatus = "COS_F1_SEVIS";
      if (currentStatus === "COS_FINAL_FORMS_REVIEW") rejectToStatus = "COS_FINAL_FORMS";

      const { error } = await supabase
        .from("user_services")
        .update({ status: rejectToStatus })
        .eq("id", order.user_service_id);
      if (error) throw error;
      toast({ title: "Rejeitado", description: "O cliente será solicitado a reenviar." });
      setCosRejectionNote("");
      fetchProcessData();
    } catch (err) {
      const e = err as Error;
      toast({ title: "Erro ao rejeitar", description: e.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateCoverLetter = async (coverLetterData: Record<string, unknown>) => {
    if (!order?.user_service_id) return;
    setCosGeneratingCoverLetter(true);
    try {
      const webhookUrl = import.meta.env.VITE_N8N_BOT_COVERLATTER;
      if (!webhookUrl) throw new Error("URL do webhook n8n não configurada (VITE_N8N_BOT_COVERLATTER).");
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userServiceId: order.user_service_id, formData: coverLetterData }),
      });
      if (!response.ok) throw new Error(`Erro do n8n: ${response.status} ${response.statusText}`);
      const result = await response.json();
      const html: string = result.html ?? result.content ?? result.text ?? "";
      if (!html) throw new Error("n8n não retornou conteúdo HTML.");
      setCosCoverLetterHtml(html);
    } catch (err) {
      const e = err as Error;
      toast({ title: "Erro ao gerar cover letter", description: e.message, variant: "destructive" });
    } finally {
      setCosGeneratingCoverLetter(false);
    }
  };

  const handleApproveCoverLetter = async (html: string, nextStatus: string) => {
    if (!order?.user_service_id) return;
    setIsSaving(true);
    try {
      const existingMeta = (order.specialist_review_data as Record<string, unknown>) ?? {};

      // 1. Save status + HTML to user_services
      const { error } = await supabase
        .from("user_services")
        .update({
          status: nextStatus,
          specialist_review_data: { ...existingMeta, cover_letter_html: html },
        })
        .eq("id", order.user_service_id);
      if (error) throw error;

      // 2. Generate PDF from HTML and save to documents table
      try {
        const { error: fnErr } = await supabase.functions.invoke("cover-letter-pdf", {
          body: {
            html,
            userServiceId: order.user_service_id,
            clientUserId: order.user_id,
          },
        });
        if (fnErr) {
          console.warn("Cover letter PDF generation failed (non-blocking):", fnErr.message);
        }
      } catch (fnCatchErr) {
        console.warn("Cover letter PDF function error (non-blocking):", fnCatchErr);
      }

      toast({ title: "Cover Letter aprovada!", description: "Conteúdo salvo, PDF gerado e etapa avançada." });
      setCosCoverLetterHtml(null);
      fetchProcessData();
    } catch (err) {
      const e = err as Error;
      toast({ title: "Erro ao aprovar", description: e.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };


  const handleApproveIndividualDoc = async (doc: ProcessDocument) => {
    try {
      await supabase.from("documents").update({ status: "approved" }).eq("id", doc.id);
      toast({ title: "Documento aprovado" });
      fetchProcessData();
    } catch (err) {
      const e = err as Error;
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const handleRejectIndividualDoc = async (doc: ProcessDocument) => {
    const note = individualRejectionNotes[doc.id] || individualRejectionNotes[doc.name] || "";
    if (!note) {
      toast({ title: "Informe o motivo", description: "É necessário informar o motivo da recusa.", variant: "destructive" });
      return;
    }
    try {
      await supabase.from("documents").update({ status: "resubmit", feedback: note }).eq("id", doc.id);
      toast({ title: "Documento rejeitado" });
      setIndividualRejectionNotes(prev => { 
        const n = { ...prev }; 
        delete n[doc.id]; 
        delete n[doc.name]; 
        return n; 
      });
      fetchProcessData();
    } catch (err) {
      const e = err as Error;
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const handleApproveAllDocs = async (docIds: string[]) => {
    if (docIds.length === 0) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("documents")
        .update({ status: "approved" })
        .in("id", docIds);
      
      if (error) throw error;
      toast({ title: "Sucesso", description: "Todos os documentos foram aprovados." });
      fetchProcessData();
    } catch (err) {
      const e = err as Error;
      toast({ title: "Erro ao aprovar todos", description: e.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // ─────────────────────────────────────────────
  // COS Admin UI Render Functions
  // ─────────────────────────────────────────────

  const renderCOSDocumentChecklist = (
    docTypes: { id: string; label: string; required?: boolean }[],
    approveNextStatus: string
  ) => {
    const uploadedDocsInChecklist = docTypes.filter(dt => processDocs.find(d => d.name === dt.id));
    const allApproved = uploadedDocsInChecklist.length > 0 && uploadedDocsInChecklist.every(dt => {
      const doc = processDocs.find(d => d.name === dt.id);
      return doc?.status === "approved";
    });

    const pendingDocIds = docTypes
      .map(dt => processDocs.find(d => d.name === dt.id))
      .filter(d => d && d.status !== "approved")
      .map(d => d!.id);

    return (
      <div className="space-y-4">
        <Card className="border-border bg-card shadow-sm">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-accent">
                Checklist de Documentos
              </h4>
            </div>
            {pendingDocIds.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-3 text-[9px] font-bold uppercase tracking-tighter border-accent/30 text-accent hover:bg-accent/5"
                onClick={() => handleApproveAllDocs(pendingDocIds)}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckSquare className="h-3 w-3 mr-1" />}
                Aprovar Todos
              </Button>
            )}
          </div>
          <div className="divide-y divide-border">
            {docTypes.map(docType => {
              const doc = processDocs.find(d => d.name === docType.id);
              const isApproved = doc?.status === "approved";
              const isRejected = doc?.status === "resubmit";
              const currentNote = individualRejectionNotes[doc?.id || docType.id] || "";

              return (
                <div key={docType.id} className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center",
                        isApproved ? "bg-green-100 text-green-600" :
                        isRejected ? "bg-red-100 text-red-600" :
                        doc ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"
                      )}>
                        {isApproved ? <CheckCircle2 className="h-4 w-4" /> :
                         isRejected ? <XCircle className="h-4 w-4" /> :
                         doc ? <Clock className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                      </div>
                      <div>
                  <p className="text-[11px] font-bold uppercase tracking-tight">{docType.label}</p>
                  <p className="text-[9px] text-muted-foreground uppercase font-medium">
                    {isApproved ? "Aprovado" : isRejected ? "Rejeitado" : doc ? "Aguardando Revisão" : "Pendente de Upload"}
                  </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {doc && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[9px] font-bold uppercase text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex gap-1"
                            onClick={() => handleOpenDocAdmin(doc)}
                          >
                            <Eye className="h-3 w-3" />
                            Visualizar
                          </Button>
                          {!isApproved && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-[9px] font-bold uppercase text-green-600 hover:text-green-700 hover:bg-green-50 flex gap-1"
                              onClick={() => handleApproveIndividualDoc(doc)}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Aprovar
                            </Button>
                          )}
                          {!isApproved && !isRejected && (
                             <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-[9px] font-bold uppercase text-red-600 hover:text-red-700 hover:bg-red-50 flex gap-1"
                              onClick={() => {
                                const input = document.getElementById(`reject-input-${docType.id}`);
                                input?.focus();
                              }}
                            >
                              <XCircle className="h-3 w-3" />
                              Reprovar
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Rejection Note Input */}
                  {doc && !isApproved && (
                    <div className="px-1 flex flex-col gap-2">
                       <label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">
                        Motivo da Reprova
                      </label>
                      <div className="flex gap-2">
                        <Input
                          id={`reject-input-${docType.id}`}
                          placeholder="Descreva o problema com este documento..."
                          className="h-8 text-[10px] bg-background"
                          value={currentNote}
                          onChange={(e) => setIndividualRejectionNotes(prev => ({ ...prev, [doc.id || docType.id]: e.target.value }))}
                        />
                        <Button
                          size="sm"
                          className="h-8 px-3 bg-red-600 hover:bg-red-700 text-[10px] font-bold uppercase"
                          onClick={() => handleRejectIndividualDoc(doc)}
                          disabled={!currentNote}
                        >
                          CONFIRMAR REPROVA
                        </Button>
                      </div>
                    </div>
                  )}

                  {doc?.feedback && isRejected && (
                    <div className="px-3 py-1.5 bg-red-50 border border-red-100 rounded-lg">
                      <p className="text-[9px] text-red-700 font-bold uppercase">Feedback Ativo:</p>
                      <p className="text-[10px] text-red-600 italic">{doc.feedback}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <div className="flex gap-4 pt-4 border-t border-border">
          <Button
            className="flex-1 h-12 gap-2 font-bold text-[10px] uppercase tracking-widest bg-accent hover:bg-green-dark"
            onClick={() => handleCOSApprove(approveNextStatus)}
            disabled={isSaving || !allApproved}
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            APROVAR E AVANÇAR
          </Button>
        </div>
      </div>
    );
  };

  const renderCOSScreeningUI = () => {
    const formStep = onboardingResponses.find(r => r.step_slug === "cos-form");
    const formData = formStep?.data as Record<string, unknown> | undefined;

    // Define all possible documents according to ChangeOfStatusDocumentsStep
    const docTypes: { id: string; label: string }[] = [
      { id: "cos_photo", label: "Foto Inicial (Principal)" },
      { id: "cos_i94", label: "Documento I-94 (Principal)" },
      { id: "cos_passport_visa_principal", label: "Passaporte e Visto (Principal)" },
      { id: "cos_proof_of_residence_brazil", label: "Comprovante de Residência (Brasil)" },
      { id: "cos_bank_statement", label: "Extrato Bancário / Prova de Fundos" },
    ];

    // Add family ties if dependents exist
    if (formData?.dependents && Array.isArray(formData.dependents) && formData.dependents.length > 0) {
      docTypes.push({ id: "cos_marriage_certificate", label: "Certidão de Casamento" });
      docTypes.push({ id: "cos_birth_certificate", label: "Certidões de Nascimento dos Filhos" });

      // Add dependent-specific documents
      formData.dependents.forEach((dep: any, idx: number) => {
        const depName = dep.name || `Dependente ${idx + 1}`;
        docTypes.push({ id: `cos_i94_dependent_${idx}`, label: `I-94 de ${depName}` });
        docTypes.push({ id: `cos_passport_visa_dependent_${idx}`, label: `Passaporte/Visto de ${depName}` });
      });
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 bg-accent/5 rounded-md border border-accent/20">
          <ShieldCheck className="h-5 w-5 text-accent" />
          <div>
            <p className="text-sm font-bold text-accent uppercase tracking-widest">Triagem Inicial (COS)</p>
            <p className="text-xs text-muted-foreground">Revise os dados e todos os documentos enviados.</p>
          </div>
        </div>

        {/* Form Data Summary */}
        {formData && (
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dados do Formulário</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Visto Atual", value: formData.currentVisa },
                { label: "Visto Destino", value: formData.targetVisa },
                { label: "Status I-94", value: formData.i94Status },
                { label: "Dependentes", value: Array.isArray(formData.dependents) ? `${(formData.dependents as unknown[]).length} pessoa(s)` : "Nenhum" },
              ].map(item => (
                <div key={item.label} className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-[9px] font-black uppercase text-muted-foreground">{item.label}</p>
                  <p className="text-[11px] font-bold text-foreground mt-0.5">{String(item.value || "—")}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dependents */}
        {formData?.dependents && Array.isArray(formData.dependents) && (formData.dependents as unknown[]).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dependentes Cadastrados</h4>
            {(formData.dependents as Array<Record<string, unknown>>).map((dep, idx) => (
              <div key={idx} className="p-3 bg-muted/20 rounded-lg border border-border text-xs space-y-1">
                <p className="font-bold">{String(dep.name || "—")}</p>
                <p className="text-muted-foreground">Relação: {String(dep.relationship || "—")} · Nascimento: {String(dep.birthDate || "—")}</p>
              </div>
            ))}
          </div>
        )}

        {/* Standardized Checklist (Full List) */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Revisão de Documentos</h4>
          {renderCOSDocumentChecklist(docTypes, "COS_OFFICIAL_FORMS")}
        </div>
      </div>
    );
  };

  const renderCOSOfficialFormsReviewUI = () => {
    return renderCOSDocumentChecklist(
      [
        { id: "i539_oficial", label: "Formulário I-539 Assinado" },
        { id: "i539a_oficial", label: "Suplemento I-539A (se houver)" }
      ],
      "COS_COVER_LETTER_FORM"
    );
  };

  const renderCOSCoverLetterReviewUI = () => {
    const formStep = onboardingResponses.find(r => r.step_slug === "cos-cover-letter");
    const coverLetterData = formStep?.data as Record<string, unknown> | undefined;

    const visaInfoStep = onboardingResponses.find(r => r.step_slug === "cos-form");
    const targetVisa = String((visaInfoStep?.data as Record<string, unknown>)?.targetVisa || "");
    const isF1F2 = targetVisa.toLowerCase().includes("f1") || targetVisa.toLowerCase().includes("f2");
    const approveNextStatus = isF1F2 ? "COS_F1_I20" : "COS_FINAL_FORMS";

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 bg-accent/5 rounded-md border border-accent/20">
          <FileText className="h-5 w-5 text-accent" />
          <div>
            <p className="text-sm font-bold text-accent uppercase tracking-widest">Revisão da Cover Letter</p>
            <p className="text-xs text-muted-foreground">
              Visto destino: <strong>{targetVisa || "não identificado"}</strong>
              {isF1F2 ? " → Próxima: I-20 + SEVIS" : " → Próxima: Formulários Finais"}
            </p>
          </div>
        </div>

        <Tabs defaultValue="responses" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="responses">Respostas do Questionário</TabsTrigger>
            <TabsTrigger value="editor" disabled={!cosCoverLetterHtml}>
              <PenLine className="h-3.5 w-3.5 mr-1.5" />
              Editar Cover Letter
            </TabsTrigger>
          </TabsList>

          {/* Tab 1 – Respostas + botão gerar */}
          <TabsContent value="responses" className="mt-4 space-y-4">
            {coverLetterData && Object.keys(coverLetterData).length > 0 ? (
              <div className="max-h-64 overflow-y-auto space-y-1 pr-1 border border-border rounded-xl p-2 bg-muted/5">
                {Object.entries(coverLetterData).map(([key, value]) => (
                  <div key={key} className="flex gap-2 p-2 bg-white dark:bg-slate-900 border border-slate-100 rounded-lg text-[10px]">
                    <span className="font-bold uppercase text-muted-foreground min-w-[140px]">{key.replace(/_/g, " ")}:</span>
                    <span className="text-foreground">{String(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma resposta do questionário encontrada.</p>
            )}

            <Button
              className="w-full gap-2"
              onClick={() => handleGenerateCoverLetter(coverLetterData ?? {})}
              disabled={cosGeneratingCoverLetter}
            >
              {cosGeneratingCoverLetter
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Gerando via IA...</>
                : <><Wand2 className="h-4 w-4" /> Gerar Cover Letter</>
              }
            </Button>

            {cosCoverLetterHtml && (
              <p className="text-xs text-center text-green-600 font-medium">
                ✓ Cover letter gerada — acesse a aba "Editar Cover Letter" para revisar e aprovar.
              </p>
            )}
          </TabsContent>

          {/* Tab 2 – Editor visual + aprovar */}
          <TabsContent value="editor" className="mt-4 space-y-4">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Conteúdo gerado — clique para editar
              </p>
              {/* Editor WYSIWYG via contentEditable */}
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => setCosCoverLetterHtml(e.currentTarget.innerHTML)}
                dangerouslySetInnerHTML={{ __html: cosCoverLetterHtml ?? "" }}
                className={cn(
                  "min-h-[400px] rounded-xl border border-border bg-white dark:bg-slate-950 p-6 text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-primary/40",
                  "overflow-y-auto",
                  // Prose-like styling for the rendered HTML
                  "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4",
                  "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-4",
                  "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3",
                  "[&_p]:mb-3 [&_p]:leading-relaxed",
                  "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3",
                  "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3",
                  "[&_li]:mb-1",
                  "[&_strong]:font-semibold",
                  "[&_em]:italic",
                  "[&_br]:block",
                )}
              />
              <p className="text-[10px] text-muted-foreground">
                Edições são salvas ao sair do campo (onBlur). Formatação HTML é renderizada visualmente.
              </p>
            </div>

            <div className="flex flex-col gap-2 border-t pt-4">
              <Button
                className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleApproveCoverLetter(cosCoverLetterHtml!, approveNextStatus)}
                disabled={isSaving || !cosCoverLetterHtml}
              >
                {isSaving
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</>
                  : <><CheckCircle2 className="h-4 w-4" /> Aprovar e Salvar</>
                }
              </Button>
              <p className="text-[10px] text-muted-foreground text-center">
                Salva o conteúdo e avança para: <strong>{approveNextStatus}</strong>
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  const renderCOSI20ReviewUI = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-md border border-blue-200">
          <Info className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-bold text-blue-800 uppercase tracking-widest">Revisão do I-20 (F1)</p>
            <p className="text-xs text-blue-600">Verifique o formulário I-20 enviado pelo cliente.</p>
          </div>
        </div>
        {renderCOSDocumentChecklist(
          [{ id: "cos_i20_official", label: "Formulário I-20" }],
          "COS_F1_SEVIS"
        )}
      </div>
    );
  };

  const renderCOSSEVISReviewUI = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-md border border-blue-200">
          <CreditCard className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-bold text-blue-800 uppercase tracking-widest">Revisão da Taxa SEVIS (F1)</p>
            <p className="text-xs text-blue-600">Comprovante de pagamento da taxa SEVIS ($350).</p>
          </div>
        </div>

        {renderCOSDocumentChecklist(
          [{ id: "cos_sevis_voucher", label: "Comprovante SEVIS" }],
          "COS_FINAL_FORMS"
        )}
      </div>
    );
  };

  const renderCOSFinalFormsReviewUI = () => {
    const g1145Doc = processDocs.find(d => d.name === "g1145_oficial");
    const g1450Doc = processDocs.find(d => d.name === "g1450_oficial");
    const packageDoc = processDocs.find(d => d.name === "cos_package");

    const allUploaded = !!(g1145Doc && g1450Doc);

    // Determine final step index based on visa type
    const visaInfoStep = onboardingResponses.find(r => r.step_slug === "cos-form");
    const targetVisa = String((visaInfoStep?.data as Record<string, unknown>)?.targetVisa || "");
    const isF1F2 = targetVisa.toLowerCase().includes("f1") || targetVisa.toLowerCase().includes("f2");
    const finalStepIndex = isF1F2 ? 7 : 5;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 bg-accent/5 rounded-md border border-accent/20">
          <CheckSquare className="h-5 w-5 text-accent" />
          <div>
            <p className="text-sm font-bold text-accent uppercase tracking-widest">Revisão dos Formulários Finais</p>
            <p className="text-xs text-muted-foreground">G-1145 (notificação) e G-1450 (autorização de pagamento).</p>
          </div>
        </div>

        {renderCOSDocumentChecklist(
          [
            { id: "g1145_oficial", label: "Formulário G-1145" },
            { id: "g1450_oficial", label: "Formulário G-1450" },
          ],
          "COS_PACKAGE_READY"
        )}

        {/* Package ready section */}
        {allUploaded && (
          <div className="space-y-3 pt-4 border-t border-border">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pacote Final (PDF Unificado)</h4>
            <div className="flex items-center justify-between p-3 bg-card border border-border rounded-xl">
              <div className="flex items-center gap-3">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center",
                  packageDoc ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400")}>
                  {packageDoc ? <CheckCircle2 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase">Pacote USCIS</p>
                  <p className="text-[9px] text-muted-foreground uppercase">
                    {packageDoc ? "Gerado e disponível" : "Aguardando geração"}
                  </p>
                </div>
              </div>
              {packageDoc && (
                <Button variant="ghost" size="sm" className="h-7 gap-1 text-[10px] text-blue-600"
                  onClick={() => handleOpenDocAdmin(packageDoc)}>
                  <Eye className="h-3.5 w-3.5" /> Ver
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Main COS router
  const renderCOSReviewUI = () => {
    const currentStatus = order?.service_status || "";
    console.log(`[AdminRouter] renderCOSReviewUI - Status: ${currentStatus}`);
    console.log(`[AdminRouter] renderCOSReviewUI - Status: ${currentStatus}`);
    console.log(`[AdminRouter] Status: ${currentStatus}`);

    const statusMap: Record<string, () => JSX.Element> = {
      COS_ADMIN_SCREENING: renderCOSScreeningUI,
      COS_OFFICIAL_FORMS_REVIEW: renderCOSOfficialFormsReviewUI,
      COS_COVER_LETTER_ADMIN_REVIEW: renderCOSCoverLetterReviewUI,
      COS_F1_I20_REVIEW: renderCOSI20ReviewUI,
      COS_SEVIS_FEE_REVIEW: renderCOSSEVISReviewUI,
      COS_FINAL_FORMS_REVIEW: renderCOSFinalFormsReviewUI,
      COS_ANALISE_PENDENTE: () => <AdminCosAnalysisPanel userServiceId={order!.user_service_id!} />,
      EOS_ANALISE_PENDENTE: () => <AdminCosAnalysisPanel userServiceId={order!.user_service_id!} />,
      ANALISE_PENDENTE: () => <AdminCosAnalysisPanel userServiceId={order!.user_service_id!} />,
      COS_MOTION_IN_PROGRESS: () => <AdminCosAnalysisPanel userServiceId={order!.user_service_id!} />,
      EOS_MOTION_IN_PROGRESS: () => <AdminCosAnalysisPanel userServiceId={order!.user_service_id!} />,
      MOTION_IN_PROGRESS: () => <AdminCosAnalysisPanel userServiceId={order!.user_service_id!} />,
    };

    // Client-facing waiting states
    const waitingStates: Record<string, { title: string; desc: string }> = {
      COS_INITIAL_PHOTO: { title: "Aguardando: Foto Inicial", desc: "O cliente precisa fazer o upload da foto inicial." },
      COS_VISA_INFO: { title: "Aguardando: Informações do Visto", desc: "O cliente está preenchendo as informações sobre o visto atual e destino." },
      COS_DEPENDENTS: { title: "Aguardando: Gestão de Dependentes", desc: "O cliente está cadastrando seus dependentes." },
      COS_I94_COLLECTION: { title: "Aguardando: Coleta do I-94", desc: "O cliente está fazendo o upload do documento I-94." },
      COS_OFFICIAL_FORMS: { title: "Aguardando: Formulário I-539", desc: "O cliente está preenchendo e assinando o formulário I-539." },
      COS_COVER_LETTER_FORM: { title: "Aguardando: Questionário Cover Letter", desc: "O cliente está respondendo ao questionário para geração da carta." },
      COS_COVER_LETTER_WEBHOOK: { title: "Processando: Gerando Cover Letter", desc: "O sistema está gerando a cover letter via IA. Aguarde." },
      COS_F1_I20: { title: "Aguardando: Upload do I-20", desc: "O cliente precisa fazer o upload do formulário I-20." },
      COS_F1_SEVIS: { title: "Aguardando: Comprovante SEVIS", desc: "O cliente precisa pagar e enviar o comprovante da taxa SEVIS." },
      COS_FINAL_FORMS: { title: "Aguardando: Formulários G-1145 / G-1450", desc: "O cliente está fazendo upload dos formulários finais." },
      COS_PACKAGE_READY: { title: "Pacote Finalizado", desc: "O pacote final foi gerado e está disponível para o cliente." },
      COS_COMPLETED: { title: "Processo Concluído", desc: "O processo de Mudança de Status foi finalizado com sucesso." },
      COS_REJECTED: { title: "Processo Rejeitado", desc: "Este processo foi encerrado por negativa ou cancelamento." },
    };

    if (statusMap[currentStatus]) {
      return statusMap[currentStatus]();
    }

    if (waitingStates[currentStatus]) {
      const { title, desc } = waitingStates[currentStatus];
      const isCompleted = currentStatus === "COS_COMPLETED" || currentStatus === "COS_PACKAGE_READY";
      const isRejected = currentStatus === "COS_REJECTED";
      return (
        <div className="space-y-4">
          <div className={cn(
            "flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-3xl text-center",
            isCompleted ? "border-green-200 bg-green-50" :
            isRejected ? "border-red-200 bg-red-50" :
            "border-accent rounded-3xl bg-accent/5"
          )}>
            <Clock className={cn("h-12 w-12 mb-4",
              isCompleted ? "text-green-500" :
              isRejected ? "text-red-500" :
              "text-accent animate-pulse")} />
            <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-[320px] leading-relaxed">{desc}</p>
          </div>
        </div>
      );
    }

    if (currentStatus.includes("ANALISE") || currentStatus.includes("MOTION") || currentStatus.includes("RFE") || currentStatus.includes("TRACKING")) {
      return <AdminCosAnalysisPanel userServiceId={order!.user_service_id!} />;
    }

    return null;
  };

  const renderStatusContent = () => {
    const currentStatus = order?.service_status || "unknown";
    console.log(`[AdminStatus] renderStatusContent - Status: ${currentStatus}`);
    const sched = onboardingResponses.find((r) => r.step_slug === "casv_scheduling");
    if (currentStatus.startsWith("COS_")) {
      return renderCOSReviewUI();
    }

    switch (currentStatus) {
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
        return renderProcessingUI();

      case "ANALISE_PENDENTE":
      case "COS_ANALISE_PENDENTE":
      case "EOS_ANALISE_PENDENTE":
      case "MOTION_IN_PROGRESS":
      case "COS_MOTION_IN_PROGRESS":
      case "EOS_MOTION_IN_PROGRESS":
      case "RFE_IN_PROGRESS":
      case "COS_RFE_IN_PROGRESS":
      case "EOS_RFE_IN_PROGRESS":
      case "RFE":
      case "COS_RFE":
      case "EOS_RFE":
      case "COS_ANALISE_CONCLUIDA":
      case "ANALISE_CONCLUIDA":
        return <AdminCosAnalysisPanel userServiceId={order!.user_service_id!} />;

      case "uploadsUnderReview":
      case "ds160upload_documents":
      case "ds160AwaitingReviewAndSignature":
      case "Waiting Signature":
        // For F1, if it's in Awaiting Review/Signature, it might mean the client is doing it.
        // The user specifically asked for a screen informing that the client is in the process.
        const isF1 = order.product_slug === "visa-f1f2" || order.product_slug === "visto-f1";
        
        if (isF1 && (status === "ds160AwaitingReviewAndSignature" || status === "ds160upload_documents")) {
          // If we have documents, we still show the "Waiting for Client" status for F1 
          // as per user request to inform then that the client is reviewing and signing.
          return (
            <div className="space-y-4 max-w-xl">
              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-accent rounded-3xl bg-accent/5 text-center">
                <Clock className="h-12 w-12 text-accent mb-4 animate-pulse" />
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Cliente em Revisão e Assinatura
                </h3>
                <p className="text-sm text-muted-foreground max-w-[320px] leading-relaxed">
                  O cliente está revisando as respostas e assinando a DS-160 do visto F1. 
                  Aguarde a conclusão deste processo pelo cliente para prosseguir com a revisão final.
                </p>
                <div className="mt-4 p-3 bg-muted/50 rounded-lg text-[10px] text-muted-foreground uppercase tracking-wider">
                  Documentos anexados: {processDocs.length}
                </div>
              </div>
            </div>
          );
        }

        if (processDocs.length === 0) {
          return (
            <div className="space-y-4 max-w-xl">
              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-muted rounded-3xl bg-muted/5 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Aguardando Documentos
                </h3>
                <p className="text-sm text-muted-foreground max-w-[320px] leading-relaxed">
                  O cliente foi solicitado a assinar a DS-160 e realizar o upload dos documentos necessários. 
                  Assim que ele enviar, os arquivos aparecerão aqui para sua revisão.
                </p>
                <div className="mt-6 px-4 py-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-full border border-yellow-100 dark:border-yellow-900/30">
                   <p className="text-[10px] font-black uppercase tracking-widest text-yellow-700">
                     Status atual: {status}
                   </p>
                </div>
              </div>
            </div>
          );
        }
        return renderReviewUI();

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
                  {processDocs.find((d) => d.name === "ds160_boleto")?.created_at
                    ? new Date(processDocs.find((d) => d.name === "ds160_boleto")!.created_at).toLocaleDateString("pt-BR")
                    : "-"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[10px] font-bold"
                onClick={() => {
                  const doc = processDocs.find((d) => d.name === "ds160_boleto");
                  if (doc) {
                    const { data } = supabase.storage
                      .from(doc.bucket_id || "process-documents")
                      .getPublicUrl(doc.storage_path);
                    window.open(data.publicUrl, "_blank");
                  }
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

      // ── COS/EOS Post-decision: Specialist Analysis & Recovery Flows ──
      case "ANALISE_PENDENTE":
      case "COS_ANALISE_PENDENTE":
      case "EOS_ANALISE_PENDENTE":
      case "ANALISE_CONCLUIDA":
      case "COS_ANALISE_CONCLUIDA":
      case "EOS_ANALISE_CONCLUIDA":
      case "RECOVERY_PAYMENT_PENDING":
      case "COS_RECOVERY_PAYMENT_PENDING":
      case "EOS_RECOVERY_PAYMENT_PENDING":
      case "RFE":
      case "COS_RFE":
      case "EOS_RFE":
      case "MOTION_PREPARATION":
      case "COS_MOTION_PREPARATION":
      case "EOS_MOTION_PREPARATION":
      case "MOTION_SENT":
      case "COS_MOTION_SENT":
      case "EOS_MOTION_SENT":
      case "COS_CASE_FORM":
      case "EOS_CASE_FORM":
      case "COS_REJECTED":
      case "EOS_REJECTED":
      case "MOTION_APPROVED":
      case "MOTION_REJECTED":
      case "MOTION_COMPLETED":
      case "COS_MOTION_COMPLETED":
      case "EOS_MOTION_COMPLETED":
      case "MOTION_IN_PROGRESS":
      case "EOS_MOTION_IN_PROGRESS":
      case "COS_MOTION_IN_PROGRESS":
      case "RFE_MOTION_IN_PROGRESS":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-border">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-primary">
                  Análise do Especialista — {(order?.product_slug?.toLowerCase().includes("extens") || status?.includes("EOS")) ? "EOS" : "COS"}
                </p>
                <p className="text-xs text-muted-foreground">Formulário enviado pelo cliente após pagamento da análise.</p>
              </div>
              <Badge 
                className="ml-auto" 
                variant={
                  status === "ANALISE_PENDENTE" ? "destructive" : 
                  status === "ANALISE_CONCLUIDA" ? "default" : 
                  (status === "MOTION_SENT" || status === "MOTION_APPROVED") ? "default" : 
                  "secondary"
                }
              >
                {status === "ANALISE_PENDENTE" ? "Pendente" :
                 status === "ANALISE_CONCLUIDA" ? "Proposta Enviada" :
                 status === "RECOVERY_PAYMENT_PENDING" ? "Aguardando Pagamento" :
                 status === "RFE" ? "RFE Recebido" :
                 (status?.includes("MOTION_IN_PROGRESS") || status === "MOTION_PREPARATION") ? "Em Preparação" :
                 (status === "MOTION_SENT" || status?.includes("MOTION_COMPLETED")) ? "Entregue" :
                 status === "EOS_CASE_FORM" || status === "COS_CASE_FORM" ? "Formulário Recebido" : 
                 status || "Processando"}
              </Badge>
            </div>
            <AdminCosAnalysisPanel
              userServiceId={order.user_service_id}
              clientName={order.client_name}
            />
          </div>
        );

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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                <AdminProcessLogs 
                  userServiceId={order.user_service_id as string} 
                  productSlug={order.product_slug as string} 
                />
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

                  {/* Análise Técnica / Motion */}
                  <Card className="p-4 border-border bg-muted/10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <Wand2 className="h-4 w-4 text-primary" />
                        <h4 className="text-sm font-bold">
                          Análise Técnica (Motion/RFE)
                        </h4>
                      </div>
                      <Badge
                        variant={
                          status.includes("ANALISE") || status.includes("RFE") || status.includes("MOTION") || status.includes("CASE_FORM") || (order?.service_metadata?.recovery_type && order?.service_metadata?.recovery_type !== 'none')
                            ? "default"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {status.includes("ANALISE") || status.includes("RFE") || status.includes("MOTION") || status.includes("CASE_FORM") || (order?.service_metadata?.recovery_type && order?.service_metadata?.recovery_type !== 'none')
                          ? "CONTRATADO"
                          : "NÃO CONTRATADO"}
                      </Badge>
                    </div>
                    {(status.includes("ANALISE") || status.includes("RFE") || status.includes("MOTION")) ? (
                      <div className="space-y-3">
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Fase Atual:</span>
                            <span className="font-medium text-primary">
                              {status.includes("CASE_FORM") ? "Aguardando Formulário" :
                               status === "ANALISE_PENDENTE" ? "Nova Análise" : 
                               status === "RFE" ? "Tratando RFE" : 
                               status.includes("MOTION") ? "Fluxo de Motion" : "Em Andamento"}
                            </span>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full text-[10px] font-black h-8 uppercase tracking-widest border-primary/30 text-primary hover:bg-primary/5"
                          onClick={() => {
                            setActiveTab("actions");
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          Gerenciar Motion
                        </Button>
                      </div>
                    ) : (
                      <p className="text-[10px] text-muted-foreground italic">
                        O cliente ainda não solicitou o apoio especializado para este caso.
                      </p>
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
            <AdminVerticalTimeline 
              currentStatus={status} 
              productSlug={order?.product_slug || "visto-b1-b2"} 
            />
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
                      {order?.product_slug === "extensao-status"
                        ? "Formulário de Extensão de Status"
                        : order?.product_slug === "troca-status"
                        ? "Formulário de Troca de Status"
                        : "Formulário DS-160"}
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
            {order.contract_selfie_url && 
             order.service_status !== "uploadsUnderReview" && 
             order.service_status !== "ds160AwaitingReviewAndSignature" && (
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
                      src={signedSelfieUrl || order.contract_selfie_url}
                      alt="Selfie do cliente"
                      className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full h-8 text-[10px] font-bold rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
                        onClick={() => window.open(signedSelfieUrl || order.contract_selfie_url, '_blank')}
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
                                ? "COMPROVANTE"
                              : doc.name === "ds160_comprovante_sevis"
                                ? "COMPROVANTE SEVIS"
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
