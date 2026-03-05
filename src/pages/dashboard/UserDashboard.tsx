import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CheckSquare,
  MessageSquare,
  Upload,
  FileText,
  HelpCircle,
  ArrowRight,
  Briefcase,
  Shield,
  Fingerprint,
  Calendar,
  User,
  ChevronRight,
  Camera,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const TOTAL_STEPS = 9;

interface UserServiceRaw {
  id: string;
  status: string;
  current_step: number;
  service_slug: string;
  created_at: string;
  application_id?: string;
  date_of_birth?: string;
  grandmother_name?: string;
}

interface ServiceWithProgress extends UserServiceRaw {
  calculatedProgress: number;
  label: string;
  stepText: string;
}

const getStatusDisplay = (
  status: string,
  lang: string,
  serviceSlug?: string,
) => {
  if (!status) return { stepText: "", label: "" };

  // Legacy support
  if (status === "active") status = "ds160InProgress";
  if (status === "review_pending") status = "ds160Processing";
  if (status === "review_assign") status = "ds160AwaitingReviewAndSignature";
  if (status === "completed") status = "approved";

  let step = 0;
  let labelPt = "";
  let labelEn = "";

  switch (status) {
    case "ds160InProgress":
      step = 1;
      labelPt = "Preenchendo DS-160";
      labelEn = "Filling out DS-160";
      break;
    case "ds160Processing":
      step = 2;
      labelPt = "Processando DS-160";
      labelEn = "Processing DS-160";
      break;
    case "ds160upload_documents":
      step = 3;
      labelPt = "3. Anexar Documentos";
      labelEn = "3. Upload Documents";
      break;
    case "ds160AwaitingReviewAndSignature":
      step = 4;
      labelPt = "4. Revisão e Assinatura";
      labelEn = "4. Review and Signature";
      break;
    case "uploadsUnderReview": // Legacy/Alternative
      step = 4;
      labelPt = "4. Revisão de Documentos";
      labelEn = "4. Documents Review";
      break;
    case "casvSchedulingPending":
      step = 5;
      labelPt = "5. Agendamento Pendente";
      labelEn = "5. Scheduling Pending";
      break;
    case "casvFeeProcessing":
      step = 6;
      labelPt = "6. Taxa em Processamento";
      labelEn = "6. Fee in Processing";
      break;
    case "casvPaymentPending":
      step = 7;
      labelPt = "7. Pagamento CASV Pendente";
      labelEn = "7. CASV Payment Pending";
      break;
    case "awaitingInterview":
      step = 8;
      labelPt = "8. Aguardando Entrevista";
      labelEn = "8. Awaiting Interview";
      break;
    case "approved":
      step = 9;
      labelPt = "9. Aprovado";
      labelEn = "9. Approved";
      break;
    case "rejected":
      return {
        stepText: lang === "pt" ? "Processo Rejeitado" : "Process Rejected",
        label: lang === "pt" ? "Rejeitado" : "Rejected",
        step: 0,
        totalSteps: TOTAL_STEPS,
      };
    default:
      return { stepText: "", label: status };
  }

  const stepText =
    lang === "pt"
      ? `Etapa ${step} de ${TOTAL_STEPS}`
      : `Step ${step} of ${TOTAL_STEPS}`;
  const label = lang === "pt" ? labelPt : labelEn;

  return { stepText, label, step, totalSteps: TOTAL_STEPS };
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAfterCheckout = !!searchParams.get("session_id");
  const { lang, t } = useLanguage();
  const d = t.dashboard;

  const [services, setServices] = useState<ServiceWithProgress[]>([]);
  const [currentServiceId, setCurrentServiceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [docsUploaded, setDocsUploaded] = useState(0);
  const [isSelfieModalOpen, setIsSelfieModalOpen] = useState(false);
  const [uploadingSelfie, setUploadingSelfie] = useState(false);
  const [checkingSelfie, setCheckingSelfie] = useState<string | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [pendingServiceToNavigate, setPendingServiceToNavigate] =
    useState<ServiceWithProgress | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  // 1. Fetch all services and their individual progress
  useEffect(() => {
    const fetchServices = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: servicesData, error } = await supabase
        .from("user_services")
        .select(
          "id, status, current_step, service_slug, created_at, application_id, date_of_birth, grandmother_name",
        )
        .eq("user_id", user.id)
        .in("status", [
          "active",
          "review_pending",
          "review_assign",
          "ds160InProgress",
          "ds160Processing",
          "ds160upload_documents",
          "ds160AwaitingReviewAndSignature",
          "uploadsUnderReview",
          "casvSchedulingPending",
          "casvFeeProcessing",
          "casvPaymentPending",
          "awaitingInterview",
          "approved",
          "rejected",
          "completed",
        ])
        .order("created_at", { ascending: false });

      if (error) {
        setLoading(false);
        return;
      }

      const servicesDataTyped = servicesData as UserServiceRaw[];

      if (servicesDataTyped && servicesDataTyped.length > 0) {
        // Group by slug to keep only the most recent entry for each unique guide
        const uniqueServicesMap = new Map<string, ServiceWithProgress>();

        servicesDataTyped.forEach((s) => {
          const existing = uniqueServicesMap.get(s.service_slug);

          // Logic: Keep the service if:
          // 1. We don't have one for this slug yet
          // 2. OR the new one is more "advanced" (review_pending/completed) than the currently stored one (active)
          const isNewAdvanced =
            (s.status === "review_pending" || s.status === "completed") &&
            existing?.status === "active";

          if (!existing || isNewAdvanced) {
            const statusInfo = getStatusDisplay(s.status, lang as string);
            let p = 0;

            if (s.status === "approved" || s.status === "completed") {
              p = 100;
            } else if (statusInfo.step > 0) {
              // 100% divided by 9 steps. Each completed step gives roughly 11%
              // Plus progress within step 1 (onboarding) if it's the current step
              if (statusInfo.step === 1) {
                p = Math.min(Math.round(((s.current_step || 0) / 13) * 10), 10);
              } else {
                p = Math.round(((statusInfo.step - 1) / TOTAL_STEPS) * 100);
              }
            }

            uniqueServicesMap.set(s.service_slug, {
              ...s,
              calculatedProgress: p,
              label: statusInfo.label,
              stepText: statusInfo.stepText,
            });
          }
        });

        const servicesWithProgress = Array.from(uniqueServicesMap.values());
        console.log(
          "DEBUG: Serviços únicos processados:",
          servicesWithProgress,
        );

        setServices(servicesWithProgress);

        // Pick the service from URL or the last one saved or the most recent
        const savedServiceId = localStorage.getItem("last_selected_service");
        const urlServiceId = searchParams.get("service_id");

        if (urlServiceId) {
          setCurrentServiceId(urlServiceId);
        } else if (
          savedServiceId &&
          servicesWithProgress.find((s) => s.id === savedServiceId)
        ) {
          setCurrentServiceId(savedServiceId);
        } else {
          setCurrentServiceId(servicesWithProgress[0].id);
        }
      }
      setLoading(false);
    };
    fetchServices();
  }, [searchParams, lang]);

  const currentService =
    services.find((s) => s.id === currentServiceId) || services[0];

  // 2. Sync UI with current selection
  useEffect(() => {
    if (!currentService) return;

    localStorage.setItem("last_selected_service", currentService.id);
    setProgress(currentService.calculatedProgress);

    const fetchDocs = async () => {
      const { count } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("user_service_id", currentService.id);
      setDocsUploaded(count || 0);
    };
    fetchDocs();
  }, [currentServiceId, currentService]);

  const handleServiceClick = async (service: ServiceWithProgress) => {
    if (checkingSelfie) return;

    setCheckingSelfie(service.id);
    try {
      // 1. Fetch current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // 2. Fetch latest visa_order for this product and user (check by user_id OR email)
      const { data: order, error } = await supabase
        .from("visa_orders")
        .select("id, contract_selfie_url")
        .eq("product_slug", service.service_slug)
        .or(`user_id.eq.${user.id},client_email.eq.${user.email}`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (order && !order.contract_selfie_url) {
        setPendingServiceToNavigate(service);
        setPendingOrderId(order.id);
        setIsSelfieModalOpen(true);
      } else {
        // Already has selfie or no order found
        setCurrentServiceId(service.id);
        navigate(`/dashboard/onboarding?service_id=${service.id}`);
      }
    } catch (err) {
      console.error("Error checking selfie:", err);
      // Fallback: navigate anyway or show error?
      setCurrentServiceId(service.id);
      navigate(`/dashboard/onboarding?service_id=${service.id}`);
    } finally {
      setCheckingSelfie(null);
    }
  };

  const handleSelfieUpload = async () => {
    if (!selfieFile || !pendingOrderId) return;

    setUploadingSelfie(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = selfieFile.name.split(".").pop();
      const fileName = `selfie_${Date.now()}.${fileExt}`;
      const filePath = `contracts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("visa-documents")
        .upload(filePath, selfieFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("visa-documents").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("visa_orders")
        .update({
          contract_selfie_url: publicUrl,
          user_id: user.id, // Ensure order is linked to user
        })
        .eq("id", pendingOrderId);

      if (updateError) throw updateError;

      setIsSelfieModalOpen(false);
      setSelfieFile(null);
      if (pendingServiceToNavigate) {
        setCurrentServiceId(pendingServiceToNavigate.id);
        navigate(
          `/dashboard/onboarding?service_id=${pendingServiceToNavigate.id}`,
        );
      }
    } catch (err: unknown) {
      console.error("Error uploading selfie:", err);
      alert(lang === "pt" ? "Erro ao enviar selfie" : "Error uploading selfie");
    } finally {
      setUploadingSelfie(false);
    }
  };

  const cards = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      title: d.cards.currentService[lang],
      desc: d.cards.currentServiceDesc[lang],
      status: getStatusDisplay(
        currentService?.status,
        lang as string,
        currentService?.service_slug,
      ).label,
      to: `/dashboard/onboarding?service_id=${currentServiceId}`,
      actionText:
        currentService?.status === "review_assign" ||
        currentService?.status === "ds160AwaitingReviewAndSignature"
          ? lang === "pt"
            ? "REVISAR E ASSINAR"
            : "REVIEW AND SIGN"
          : undefined,
    },
    {
      icon: <CheckSquare className="h-5 w-5" />,
      title: d.cards.checklist[lang],
      desc: `${docsUploaded} de 4 documentos enviados`,
      progress: progress,
      to: `/dashboard/onboarding?service_id=${currentServiceId}`,
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: d.cards.chatAI[lang],
      desc: d.cards.chatAIDesc[lang],
      to: `/dashboard/chat?service_id=${currentServiceId}`,
    },
    {
      icon: <HelpCircle className="h-5 w-5" />,
      title: d.cards.help[lang],
      desc: d.cards.helpDesc[lang],
      to: "/dashboard/ajuda",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">{d.welcome[lang]}</p>
        </div>
      </header>

      {/* Success Banner (if any) */}
      <AnimatePresence>
        {isAfterCheckout && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 rounded-2xl border-2 border-green-500/20 bg-green-500/5 flex items-center gap-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
                <CheckSquare className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                {lang === "pt"
                  ? "Pagamento confirmado! Seu novo guia já está disponível abaixo."
                  : "Payment confirmed! Your new guide is available below."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MULTI-SERVICE SELECTOR SECTION */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-lg text-foreground">
            {lang === "pt" ? "Seus Processos Ativos" : "Your Active Processes"}
          </h2>
          <Badge variant="secondary" className="ml-2">
            {services.length}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <button
              key={s.id}
              onClick={() => handleServiceClick(s)}
              disabled={checkingSelfie === s.id}
              className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-300 group ${
                currentServiceId === s.id
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-border bg-card hover:border-primary/40"
              } ${checkingSelfie === s.id ? "opacity-70 cursor-wait" : ""}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`p-2 rounded-lg ${currentServiceId === s.id ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}
                >
                  {checkingSelfie === s.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>
                {currentServiceId === s.id && (
                  <Badge className="bg-primary text-white border-none">
                    Ativo
                  </Badge>
                )}
              </div>

              <h3 className="font-bold text-foreground mb-1">
                {s.service_slug?.toUpperCase().replace("-", " ")}
              </h3>

              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-[10px] text-accent uppercase tracking-wider">
                    {
                      getStatusDisplay(s.status, lang as string, s.service_slug)
                        .stepText
                    }
                  </span>
                  <span className="text-foreground font-medium">
                    {
                      getStatusDisplay(s.status, lang as string, s.service_slug)
                        .label
                    }
                  </span>
                </div>
                <span className="font-bold text-primary">
                  {s.calculatedProgress}%
                </span>
              </div>

              <Progress value={s.calculatedProgress} className="h-1.5" />

              {currentServiceId !== s.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/40 dark:bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                  <span className="bg-white dark:bg-slate-800 px-4 py-2 rounded-full text-xs font-bold shadow-sm border border-border">
                    {lang === "pt" ? "Selecionar Processo" : "Select Process"}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </section>
      <Dialog open={isSelfieModalOpen} onOpenChange={setIsSelfieModalOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Camera className="w-5 h-5 text-primary" />
              {t.dashboard.selfieModal.title[lang]}
            </DialogTitle>
            <DialogDescription>
              {t.dashboard.selfieModal.desc[lang]}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-border group relative overflow-hidden">
              {selfieFile ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <CheckSquare className="w-10 h-10 text-primary" />
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    {selfieFile.name}
                  </p>
                  <button
                    onClick={() => setSelfieFile(null)}
                    className="text-[10px] font-bold text-red-500 uppercase hover:underline"
                  >
                    {lang === "pt" ? "Remover" : "Remove"}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4 text-center">
                  <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-primary/40" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">
                      {lang === "pt"
                        ? "Selecione sua selfie"
                        : "Select your selfie"}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase">
                      JPG, PNG {lang === "pt" ? "ou" : "or"} JPEG
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>

            <Button
              className="w-full bg-primary text-white hover:bg-primary/90 font-bold h-12 rounded-xl shadow-lg shadow-primary/20"
              disabled={!selfieFile || uploadingSelfie}
              onClick={handleSelfieUpload}
            >
              {uploadingSelfie ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.dashboard.selfieModal.submitting[lang]}
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  {t.dashboard.selfieModal.uploadBtn[lang]}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
