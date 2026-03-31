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
  Sparkles,
} from "lucide-react";
import { ActiveProcessesSection } from "@/presentation/components/organisms/dashboard/ActiveProcessesSection";
import { StoreSection } from "@/presentation/components/organisms/dashboard/StoreSection";
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
import { useLanguage, useT } from "@/i18n/LanguageContext";
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
  const { lang } = useLanguage();
  const t = useT("dashboard");
  const { session, loading: authLoading } = useAuth();
  const user = session?.user;
  const d = t;

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

      <ActiveProcessesSection 
        services={services}
        currentServiceId={currentServiceId}
        checkingSelfieId={checkingSelfie}
        lang={lang}
        onServiceClick={handleServiceClick}
      />

      <StoreSection 
        userServicesSlugs={services.map((s) => s.serviceSlug)}
        lang={lang}
        services={services}
      />

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
