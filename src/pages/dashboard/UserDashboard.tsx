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
  Repeat,
  Clock,
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
  DialogFooter,
} from "@/presentation/components/atoms/dialog";
import { toast } from "sonner";
import { Progress } from "@/presentation/components/atoms/progress";
import { Skeleton } from "@/presentation/components/atoms/skeleton";
import { useLanguage } from "@/i18n/LanguageContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/presentation/components/atoms/badge";
import { Button } from "@/presentation/components/atoms/button";
import { useAuth } from "@/contexts/AuthContext";
import { GetUserProcesses } from "@/application/use-cases/user/GetUserProcesses";
import { getUserProcessRepository } from "@/infrastructure/factories/processFactory";
import { getDocumentRepository, getStorageService } from "@/infrastructure/factories/documentFactory";
import { getVisaOrderRepository } from "@/infrastructure/factories/paymentFactory";
import { UserProcess } from "@/domain/user/UserEntities";
import { getStatusDisplay, TOTAL_STEPS } from "@/domain/user/UserProcessStatus";

interface ServiceWithProgress extends UserProcess {
  calculatedProgress: number;
  label: string;
  stepText: string;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAfterCheckout = !!searchParams.get("session_id");
  const { lang, t } = useLanguage();
  const { session, loading: authLoading } = useAuth();
  const user = session?.user;
  const d = t.dashboard;

  const [services, setServices] = useState<ServiceWithProgress[]>([]);
  const [currentServiceId, setCurrentServiceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [docsUploaded, setDocsUploaded] = useState(0);
  const [isSelfieModalOpen, setIsSelfieModalOpen] = useState(false);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfieStep, setSelfieStep] = useState<1 | 2>(1);
  const [uploadingSelfie, setUploadingSelfie] = useState(false);
  const [checkingSelfie, setCheckingSelfie] = useState<string | null>(null);
  const [pendingServiceToNavigate, setPendingServiceToNavigate] =
    useState<ServiceWithProgress | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  const userId = user?.id;
  const serviceIdParam = searchParams.get("service_id");

  // 1. Fetch all services and their individual progress
  useEffect(() => {
    if (authLoading || !userId) return;

    const fetchServices = async () => {
      try {
        const repo = getUserProcessRepository();
        const getUserProcesses = new GetUserProcesses(repo);
        const processes = await getUserProcesses.execute(userId);

        if (processes && processes.length > 0) {
          const uniqueServicesMap = new Map<string, ServiceWithProgress>();

          const EXCLUDED_SUB_SERVICES = ["analise-especialista-cos", "motion-reconsideracao-cos"];
          
          processes.forEach((p) => {
            // Excluir serviços que não são processos "raiz" da lista de cards
            if (EXCLUDED_SUB_SERVICES.includes(p.serviceSlug)) return;

            // Normalizar slugs para evitar duplicatas por variações de nome
            let normalizedSlug = p.serviceSlug;
            if (normalizedSlug === "visto-f1") normalizedSlug = "visa-f1f2";
            if (normalizedSlug === "changeofstatus") normalizedSlug = "troca-status";

            const process = { ...p, serviceSlug: normalizedSlug };
            
            const groupingKey = process.status === 'rejected' ? `${normalizedSlug}_rejected` : normalizedSlug;
            const existing = uniqueServicesMap.get(groupingKey);

            const isNewAdvanced =
              (process.status === "review_pending" || process.status === "completed") &&
              existing?.status === "active";

            if (!existing || isNewAdvanced) {
              const statusInfo = getStatusDisplay(process.status, lang as string, d.status, normalizedSlug);
              let prog = 0;

              if (process.status === "approved" || process.status === "completed" || process.status === "rejected") {
                prog = 100;
              } else if (statusInfo.step > 0) {
                if (statusInfo.step === 1) {
                  const onboardingTotal = normalizedSlug.includes("status") ? 4 : 13;
                  prog = Math.min(Math.round(((process.currentStep || 0) / onboardingTotal) * 10), 15);
                } else {
                  prog = Math.round(((statusInfo.step - 1) / statusInfo.totalSteps) * 100);
                }
              }

              uniqueServicesMap.set(groupingKey, {
                ...process,
                calculatedProgress: prog,
                label: statusInfo.label,
                stepText: statusInfo.stepText,
              });
            }
          });

          const servicesWithProgress = Array.from(uniqueServicesMap.values());
          setServices(servicesWithProgress);

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
      } catch (error) {
        console.error("Erro ao buscar serviços:", error);
      } finally {
        setLoading(false);
      }
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
      const docRepo = getDocumentRepository();
      const count = await docRepo.countByProcessId(currentServiceIdForEffect);
      setDocsUploaded(count);
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
      const visaOrderRepo = getVisaOrderRepository();
      const order = await visaOrderRepo.findLatestByProductAndUser(service.serviceSlug, user.id, user.email || "");

      const needsSelfie = order && !order.contract_selfie_url;

      if (needsSelfie) {
        setPendingServiceToNavigate(service);
        setPendingOrderId(order?.id || null);
        setIsSelfieModalOpen(true);
      } else {
        setCurrentServiceId(service.id);
        navigate(`/dashboard/onboarding?service_id=${service.id}`);
      }
    } catch (err: unknown) {
      console.error("Error checking selfie:", err);
      setCurrentServiceId(service.id);
      navigate(`/dashboard/onboarding?service_id=${service.id}`);
    } finally {
      setCheckingSelfie(null);
    }
  };

  const handleSelfieUpload = async () => {
    if (!user) return;
    setUploadingSelfie(true);
    try {
      const storageService = getStorageService();
      
      if (selfieFile && pendingOrderId) {
        const fileExt = selfieFile.name.split(".").pop();
        const fileName = `selfie_${Date.now()}.${fileExt}`;
        const filePath = `contracts/${fileName}`;
        const { error: uploadError } = await storageService.uploadFile("visa-documents", filePath, selfieFile);
        if (uploadError) throw new Error(uploadError);
        
        const publicUrl = storageService.getPublicUrl("visa-documents", filePath);
        const visaOrderRepo = getVisaOrderRepository();
        await visaOrderRepo.updateOrder(pendingOrderId, { contract_selfie_url: publicUrl, user_id: user.id });
      }

      toast.success(t.dashboard.selfieModal.success[lang]);
      setIsSelfieModalOpen(false);
      setSelfieFile(null);
      
      if (pendingServiceToNavigate) {
        setCurrentServiceId(pendingServiceToNavigate.id);
        navigate(`/dashboard/onboarding?service_id=${pendingServiceToNavigate.id}`);
      }
    } catch (err: unknown) {
      console.error("Error uploading photo:", err);
      toast.error(lang === "pt" ? "Erro ao enviar fotos" : "Error uploading photos");
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
        currentService?.serviceSlug,
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
                {s.serviceSlug?.toUpperCase().replace("-", " ")}
              </h3>

              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-[10px] text-accent uppercase tracking-wider">
                    {
                      getStatusDisplay(s.status, lang as string, d.status, s.serviceSlug)
                        .stepText
                    }
                  </span>
                  <span className="text-foreground font-medium">
                    {
                      getStatusDisplay(s.status, lang as string, d.status, s.serviceSlug)
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
      {(() => {        const availableProducts = [

          {
            slug: "extensao-status",
            icon: <Clock className="h-5 w-5" />,
            color: "bg-blue-500",
            gradientFrom: "from-blue-500",
            gradientTo: "to-indigo-600",
            badgeLabel: lang === "pt" ? "Em breve" : "Coming soon",
            titlePt: "Extensão de Status (I-539)",
            titleEn: "Status Extension (I-539)",
            subtitlePt: "Para quem já está nos EUA e precisa estender",
            subtitleEn: "Extend your stay while in the US",
            descPt:
              "Guia para solicitar extensão de status junto ao USCIS usando o formulário I-539.",
            descEn:
              "Guide to request a status extension with USCIS using Form I-539.",
            features: [
              { pt: "Guia digital para I-539", en: "Digital guide for I-539" },
              { pt: "Checklist de documentos", en: "Documents checklist" },
              { pt: "Orientação sobre preenchimento", en: "Filing orientation" },
            ],
            available: true,
            checkoutUrl: "/checkout/extensao-status",
          },
          {
            slug: "troca-status",
            icon: <Repeat className="h-5 w-5" />,
            color: "bg-blue-500",
            gradientFrom: "from-blue-500",
            gradientTo: "to-indigo-600",
            badgeLabel: lang === "pt" ? "Disponível" : "Available",
            titlePt: "Troca de Status (Change of Status)",
            titleEn: "Change of Status",
            subtitlePt: "Mudança de categoria de visto dentro dos EUA",
            subtitleEn: "Change your visa category while staying in the US",
            descPt:
              "Guia passo a passo para solicitar troca de status dentro dos EUA via formulário I-539 ou equivalente.",
            descEn:
              "Step-by-step guide to request a Change of Status within the US using Form I-539 or equivalent.",
            features: [
              { pt: "Guia digital passo a passo", en: "Digital step-by-step guide" },
              { pt: "Checklist de documentos", en: "Documents checklist" },
              { pt: "Orientação sobre formulários", en: "Forms orientation" },
            ],
            available: true,
            checkoutUrl: "/checkout/troca-status",
          },
          {
            slug: "visto-b1-b2",
            icon: <Plane className="h-5 w-5" />,
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
              { pt: "Guia digital", en: "Digital guide" },
              { pt: "Checklist de documentos", en: "Complete documents checklist" },
              { pt: "Simulado com IA", en: "AI interview simulator" },
              { pt: "Suporte operacional", en: "Operational support" },
            ],
            available: true,
            checkoutUrl: "/checkout/visto-b1-b2",
          },
          {
            slug: "visa-f1f2",
            icon: <GraduationCap className="h-5 w-5" />,
            color: "bg-purple-500",
            gradientFrom: "from-purple-500",
            gradientTo: "to-violet-600",
            badgeLabel: lang === "pt" ? "Disponível" : "Available",
            titlePt: "Visto de Estudante F-1/F-2",
            titleEn: "F-1/F-2 Student Visa",
            subtitlePt: "Estudantes em instituições americanas",
            subtitleEn: "For students accepted by US institutions",
            descPt:
              "Guia passo a passo para aplicar ao visto F-1 ou dependentes F-2. Orientação sobre I-20, DS-160, SEVIS.",
            descEn:
              "Step-by-step guide for the F-1 visa or F-2 dependents. Guidance on I-20, DS-160, SEVIS.",
            features: [
              { pt: "I-20 e SEVIS", en: "I-20 and SEVIS guidance" },
              { pt: "Guia taxa SEVIS", en: "SEVIS fee payment guide" },
              { pt: "Preparação para entrevista", en: "Interview preparation" },
            ],
            available: true,
            checkoutUrl: "/checkout/visa-f1f2",
          },
        ];

        const userServiceSlugs = services.map((s) => s.serviceSlug);
          
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
                  className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:shadow-md group flex flex-col h-full"
                >
                  {/* Top gradient bar */}
                  <div
                    className={`h-1.5 w-full shrink-0 bg-gradient-to-r ${product.gradientFrom} ${product.gradientTo}`}
                  />

                  <div className="p-4 space-y-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {services.some(s => (s.serviceSlug === product.slug || (s.serviceSlug === "visto-f1" && product.slug === "visa-f1f2")) && s.isSecondAttempt) && (
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

                    <ul className="space-y-2 flex-grow">
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
                      <Link to={product.checkoutUrl} className="mt-auto block">
                        <Button className="w-full bg-primary font-bold h-11 rounded-md gap-2 hover:bg-primary/90 shadow-sm">
                          {d.getStarted[lang]}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        disabled
                        className="w-full h-11 rounded-md gap-2 opacity-60 cursor-not-allowed mt-auto shrink-0"
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
              {t.dashboard.selfieModal.step1Desc[lang]}
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
                    capture="user"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setSelfieFile(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              className="w-full bg-primary font-bold h-11 rounded-md"
              disabled={!selfieFile || uploadingSelfie}
              onClick={handleSelfieUpload}
            >
              {uploadingSelfie ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckSquare className="w-4 h-4 mr-2" />
              )}
              {t.dashboard.selfieModal.finish[lang]}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
