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
  ShoppingBag,
  Plane,
  GraduationCap,
  Lock,
  Sparkles,
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
import { useAuth } from "@/contexts/AuthContext";

interface UserServiceRaw {
  id: string;
  status: string;
  current_step: number | null;
  service_slug: string;
  created_at: string;
  application_id?: string | null;
  date_of_birth?: string | null;
  grandmother_name?: string | null;
  is_second_attempt?: boolean | null;
}

const TOTAL_STEPS = 9;

interface ServiceWithProgress extends UserServiceRaw {
  calculatedProgress: number;
  label: string;
  stepText: string;
}

const getStatusDisplay = (
  status: string,
  lang: string,
  tStatus: any,
  serviceSlug?: string,
) => {
  if (!status) return { stepText: "", label: "" };

  // Legacy support
  if (status === "active") status = "ds160InProgress";
  if (status === "review_pending") status = "ds160Processing";
  if (status === "review_assign") status = "ds160AwaitingReviewAndSignature";
  if (status === "completed") status = "approved";

  let step = 0;
  let label = "";

  switch (status) {
    case "ds160InProgress":
      step = 1;
      label = tStatus.ds160InProgress[lang];
      break;
    case "ds160Processing":
      step = 2;
      label = tStatus.ds160Processing[lang];
      break;
    case "ds160upload_documents":
      step = 3;
      label = tStatus.ds160uploadDocuments[lang];
      break;
    case "ds160AwaitingReviewAndSignature":
      step = 4;
      label = tStatus.ds160AwaitingReviewAndSignature[lang];
      break;
    case "uploadsUnderReview": // Legacy/Alternative
      step = 4;
      label = tStatus.uploadsUnderReview[lang];
      break;
    case "casvSchedulingPending":
      step = 5;
      label = tStatus.casvSchedulingPending[lang];
      break;
    case "casvFeeProcessing":
      step = 6;
      label = tStatus.casvFeeProcessing[lang];
      break;
    case "casvPaymentPending":
      step = 7;
      label = tStatus.casvPaymentPending[lang];
      break;
    case "awaitingInterview":
      step = 8;
      label = tStatus.awaitingInterview[lang];
      break;
    case "approved":
      step = 9;
      label = tStatus.approved[lang];
      break;
    case "rejected":
      return {
        stepText: tStatus.rejectedText[lang],
        label: tStatus.rejectedLabel[lang],
        step: TOTAL_STEPS,
        totalSteps: TOTAL_STEPS,
      };
    case "completed":
      return {
        stepText: tStatus.approved[lang],
        label: tStatus.approved[lang],
        step: TOTAL_STEPS,
        totalSteps: TOTAL_STEPS,
      };
    default:
      return { stepText: "", label: status };
  }

  const stepText = tStatus.stepOf[lang]
    .replace("[step]", String(step))
    .replace("[total]", String(TOTAL_STEPS));

  return { stepText, label, step, totalSteps: TOTAL_STEPS };
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAfterCheckout = !!searchParams.get("session_id");
  const { lang, t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
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

  const userId = user?.id;
  const serviceIdParam = searchParams.get("service_id");

  // 1. Fetch all services and their individual progress
  useEffect(() => {
    if (authLoading || !userId) return;

    const fetchServices = async () => {
      const { data: servicesData, error } = await supabase
        .from("user_services")
        .select(
          "id, status, current_step, service_slug, created_at, application_id, date_of_birth, grandmother_name, is_second_attempt",
        )
        .eq("user_id", userId)
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

      const servicesDataTyped = (servicesData || []) as unknown as UserServiceRaw[];

      if (servicesDataTyped && servicesDataTyped.length > 0) {
        // Group by slug to keep only the most recent entry for each unique guide
        const uniqueServicesMap = new Map<string, ServiceWithProgress>();

        servicesDataTyped.forEach((rawS) => {
          // Normalize legacy slug
          const s = { ...rawS, service_slug: rawS.service_slug === "visto-f1" ? "visa-f1f2" : rawS.service_slug };
          
          // Grouping key: slug + status (to show rejected and active separately if they exist)
          const groupingKey = s.status === 'rejected' ? `${s.service_slug}_rejected` : s.service_slug;
          const existing = uniqueServicesMap.get(groupingKey);

          // Logic: Keep the service if:
          // 1. We don't have one for this key yet
          // 2. OR the new one is more "advanced" (review_pending/completed) than the currently stored one (active)
          const isNewAdvanced =
            (s.status === "review_pending" || s.status === "completed") &&
            existing?.status === "active";

          if (!existing || isNewAdvanced) {
            const statusInfo = getStatusDisplay(s.status, lang as string, d.status);
            let p = 0;

            if (s.status === "approved" || s.status === "completed" || s.status === "rejected") {
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

            uniqueServicesMap.set(groupingKey, {
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
        const urlServiceId = serviceIdParam;

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
  }, [userId, authLoading, serviceIdParam, lang, d.status]);

  const currentService =
    services.find((s) => s.id === currentServiceId) || services[0];
  const currentServiceIdForEffect = currentService?.id;

  // 2. Sync UI with current selection
  useEffect(() => {
    if (authLoading || !userId || !currentServiceIdForEffect) return;

    localStorage.setItem("last_selected_service", currentServiceIdForEffect);
    setProgress(currentService.calculatedProgress);

    const fetchDocs = async () => {
      const { count } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("user_service_id", currentServiceIdForEffect);
      setDocsUploaded(count || 0);
    };
    fetchDocs();
  }, [
    userId,
    authLoading,
    currentServiceId,
    currentServiceIdForEffect,
    currentService?.calculatedProgress,
  ]);

  const handleServiceClick = async (service: ServiceWithProgress) => {
    if (checkingSelfie || !user) return;

    setCheckingSelfie(service.id);
    try {
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
    if (!selfieFile || !pendingOrderId || !user) return;

    setUploadingSelfie(true);
    try {
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
      alert(d.errorUploadingSelfie[lang]);
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
        d.status,
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
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32 w-full rounded-md" />
          <Skeleton className="h-32 w-full rounded-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-title-xl font-bold text-foreground tracking-tight">
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
            <div className="p-5 rounded-md border-2 border-green-500/20 bg-green-500/5 flex items-center gap-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
                <CheckSquare className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                {d.paymentSuccess[lang]}
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
            {d.activeProcesses[lang]}
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
              className={`relative text-left p-5 rounded-md border-2 transition-all duration-300 group ${
                currentServiceId === s.id
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-border bg-card hover:border-primary/40"
              } ${checkingSelfie === s.id ? "opacity-70 cursor-wait" : ""}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`p-2 rounded-md ${currentServiceId === s.id ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}
                >
                  {checkingSelfie === s.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>
                {currentServiceId === s.id && s.status !== "rejected" && (
                  <Badge className="bg-primary text-white border-none">
                    Ativo
                  </Badge>
                )}
                {s.status === "rejected" && (
                  <Badge variant="destructive" className="border-none font-black text-[10px] uppercase tracking-wider">
                    {d.status.rejectedLabel[lang]}
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
                      getStatusDisplay(s.status, lang as string, d.status, s.service_slug)
                        .stepText
                    }
                  </span>
                  <span className="text-foreground font-medium">
                    {
                      getStatusDisplay(s.status, lang as string, d.status, s.service_slug)
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
                <div className="absolute inset-0 flex items-center justify-center bg-white/40 dark:bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                  <span className="bg-white dark:bg-slate-800 px-4 py-2 rounded-full text-xs font-bold shadow-sm border border-border">
                    {d.selectProcess[lang]}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* GET PROCESSES SECTION */}
      {(() => {
        const availableProducts = [
          {
            slug: "visto-b1-b2",
            icon: <Plane className="h-6 w-6" />,
            color: "bg-blue-500",
            gradientFrom: "from-blue-500",
            gradientTo: "to-indigo-600",
            badgeLabel: lang === "pt" ? "Disponível" : "Available",
            titlePt: "Visto Turismo B1/B2",
            titleEn: "B1/B2 Tourist Visa",
            subtitlePt: "Para brasileiros aplicando do Brasil",
            subtitleEn: "For Brazilians applying from Brazil",
            descPt:
              "Guia completo passo a passo para aplicar ao visto de turismo/negócios. Inclui orientação para DS-160 e preparação para entrevista.",
            descEn:
              "Complete step-by-step guide to apply for a tourist/business visa. Includes DS-160 guidance and interview preparation.",
            features: [
              {
                pt: "Guia digital com acesso vitalício",
                en: "Digital guide with lifetime access",
              },
              {
                pt: "Checklist completo de documentos",
                en: "Complete documents checklist",
              },
              {
                pt: "Simulado de entrevista com IA",
                en: "AI-powered interview simulator",
              },
              {
                pt: "Suporte humano operacional",
                en: "Human operational support",
              },
            ],
            available: true,
            checkoutUrl: "/checkout/visto-b1-b2",
          },
          {
            slug: "visa-f1f2",
            icon: <GraduationCap className="h-6 w-6" />,
            color: "bg-purple-500",
            gradientFrom: "from-purple-500",
            gradientTo: "to-violet-600",
            badgeLabel: lang === "pt" ? "Disponível" : "Available",
            titlePt: "Visto de Estudante F-1/F-2",
            titleEn: "F-1/F-2 Student Visa",
            subtitlePt: "Para estudantes aceitos em instituições americanas",
            subtitleEn: "For students accepted by US institutions",
            descPt:
              "Guia passo a passo para aplicar ao visto F-1 ou dependentes F-2. Orientação sobre I-20, DS-160, SEVIS e preparação para entrevista.",
            descEn:
              "Step-by-step guide for the F-1 visa or F-2 dependents. Guidance on I-20, DS-160, SEVIS and interview preparation.",
            features: [
              {
                pt: "Orientação sobre I-20 e SEVIS",
                en: "I-20 and SEVIS guidance",
              },
              {
                pt: "Guia para pagamento da taxa SEVIS",
                en: "SEVIS fee payment guide",
              },
              { pt: "Preparação para entrevista", en: "Interview preparation" },
            ],
            available: true,
            checkoutUrl: "/checkout/visa-f1f2",
          },
        ];

        const userServiceSlugs = services.map((s) => s.service_slug);
        const products = availableProducts.filter(
          (p) => !userServiceSlugs.includes(p.slug),
        );

        if (products.length === 0) return null;

        return (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg text-foreground">
                {d.getProcesses[lang]}
              </h2>
            </div>

            <div
              className={`grid gap-4 ${
                products.length === 1
                  ? "grid-cols-1 max-w-2xl"
                  : "grid-cols-1 lg:grid-cols-2"
              }`}
            >
              {products.map((product) => (
                <div
                  key={product.slug}
                  className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:shadow-md group"
                >
                  {/* Top gradient bar */}
                  <div
                    className={`h-1.5 w-full bg-gradient-to-r ${product.gradientFrom} ${product.gradientTo}`}
                  />

                  <div className="p-4 space-y-5">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {services.some(s => (s.service_slug === product.slug || (s.service_slug === "visto-f1" && product.slug === "visa-f1f2")) && s.is_second_attempt) && (
                            <Badge className="absolute -top-2 -right-1 z-10 bg-amber-500 text-white border-none text-[8px] font-bold px-1 py-0 h-4 uppercase">
                              2ª Tentativa
                            </Badge>
                          )}
                          <div
                            className={`h-11 w-11 rounded-md ${product.color} text-white flex items-center justify-center shadow-sm`}
                          >
                            {product.icon}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground text-base">
                            {lang === "pt" ? product.titlePt : product.titleEn}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {lang === "pt"
                              ? product.subtitlePt
                              : product.subtitleEn}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={`shrink-0 ${
                          product.available
                            ? "bg-accent/10 text-accent border-accent/20"
                            : "bg-muted text-muted-foreground"
                        }`}
                        variant="outline"
                      >
                        {product.available && (
                          <Sparkles className="h-3 w-3 mr-1" />
                        )}
                        {product.badgeLabel}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {lang === "pt" ? product.descPt : product.descEn}
                    </p>

                    <ul className="space-y-2">
                      {product.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckSquare className="h-4 w-4 text-accent shrink-0" />
                          <span className="text-foreground">
                            {lang === "pt" ? f.pt : f.en}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {product.available ? (
                      <Link to={product.checkoutUrl}>
                        <Button className="w-full bg-primary font-bold h-11 rounded-md gap-2 hover:bg-primary/90 shadow-sm">
                          {d.getStarted[lang]}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        disabled
                        className="w-full h-11 rounded-md gap-2 opacity-60 cursor-not-allowed"
                      >
                        <Lock className="h-4 w-4" />
                        {d.comingSoon[lang]}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })()}
      <Dialog open={isSelfieModalOpen} onOpenChange={setIsSelfieModalOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-subtitle font-bold">
              <Camera className="w-5 h-5 text-primary" />
              {t.dashboard.selfieModal.title[lang]}
            </DialogTitle>
            <DialogDescription>
              {t.dashboard.selfieModal.desc[lang]}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center p-5 bg-slate-50 dark:bg-slate-900 rounded-md border border-dashed border-border group relative overflow-hidden">
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
                    {d.remove[lang]}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4 text-center">
                  <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-primary/40" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">
                      {d.selectSelfie[lang]}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase">
                      JPG, PNG {d.or[lang]} JPEG
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
              className="w-full bg-primary text-white hover:bg-primary/90 font-bold h-12 rounded-md shadow-lg shadow-primary/20"
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
