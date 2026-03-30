import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase,
  FileText,
  ChevronRight,
  Camera,
  Upload,
  Loader2,
  CheckSquare,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Badge } from "@/presentation/components/atoms/badge";
import { Progress } from "@/presentation/components/atoms/progress";
import { Skeleton } from "@/presentation/components/atoms/skeleton";
import { Button } from "@/presentation/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/presentation/components/atoms/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProcessRepository } from "@/infrastructure/factories/processFactory";
import { getStorageService } from "@/infrastructure/factories/documentFactory";
import { getVisaOrderRepository } from "@/infrastructure/factories/paymentFactory";
import { GetUserProcesses } from "@/application/use-cases/user/GetUserProcesses";
import { getStatusDisplay, TOTAL_STEPS } from "@/domain/user/UserProcessStatus";

// ... (getStatusDisplay centralizado sendo usado)

export default function UserProcesses() {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const d = t.dashboard;
  const { session, loading: authLoading } = useAuth();
  const user = session?.user;
  const [services, setServices] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSelfieModalOpen, setIsSelfieModalOpen] = useState(false);
  const [uploadingSelfie, setUploadingSelfie] = useState(false);
  const [checkingSelfie, setCheckingSelfie] = useState<string | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [pendingServiceToNavigate, setPendingServiceToNavigate] = useState<Record<string, unknown> | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchServices = async () => {
      try {
        const repo = getUserProcessRepository();
        const getUserProcesses = new GetUserProcesses(repo);
        const processes = await getUserProcesses.execute(user.id);

        const processedServices = processes.map((s) => {
          const statusInfo = getStatusDisplay(s.status, lang as string, d.status, s.serviceSlug as string);
          let p = 0;

          if (s.status === "approved" || s.status === "completed") {
            p = 100;
          } else if (statusInfo.step > 1) {
            p = Math.round(((statusInfo.step - 1) / statusInfo.totalSteps) * 100);
          } else if (statusInfo.step === 1) {
            const onboardingTotal = (s.serviceSlug as string)?.includes("status") ? 4 : 13;
            p = Math.min(Math.round(((s.currentStep || 0) / onboardingTotal) * 10), 15);
          }

          return {
            ...s,
            calculatedProgress: p,
            statusLabel: statusInfo.label,
            stepText: statusInfo.stepText,
          };
        });

        setServices(processedServices);
      } catch (error) {
        console.error("Erro ao buscar serviços:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [user, authLoading, lang, d.status]);

  const handleServiceClick = async (service: Record<string, unknown>) => {
    if (checkingSelfie || !user) return;

    setCheckingSelfie(service.id as string);
    try {
      const visaOrderRepo = getVisaOrderRepository();
      const order = await visaOrderRepo.findLatestByProductAndUser(service.serviceSlug as string, user.id, user.email || "");

      if (order && !order.contract_selfie_url) {
        setPendingServiceToNavigate(service);
        setPendingOrderId(order.id);
        setIsSelfieModalOpen(true);
      } else {
        navigate(`/dashboard/onboarding?service_id=${service.id}`);
      }
    } catch (err) {
      console.error("Error checking selfie:", err);
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

      const storageService = getStorageService();
      const { error: uploadError } = await storageService.uploadFile("visa-documents", filePath, selfieFile);

      if (uploadError) throw new Error(uploadError);

      const publicUrl = storageService.getPublicUrl("visa-documents", filePath);

      const visaOrderRepo = getVisaOrderRepository();
      await visaOrderRepo.updateOrder(pendingOrderId, {
        contract_selfie_url: publicUrl,
        user_id: user.id,
      });

      setIsSelfieModalOpen(false);
      setSelfieFile(null);
      if (pendingServiceToNavigate) {
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

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-title-xl font-bold text-foreground tracking-tight">
          {d.myProcesses[lang]}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {d.trackStatus[lang]}
        </p>
      </header>

      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.length === 0 ? (
            <div className="col-span-full py-12 text-center rounded-md border-2 border-dashed border-border">
              <p className="text-muted-foreground">
                {d.noActiveProcesses[lang]}
              </p>
            </div>
          ) : (
            services.map((s) => (
              <motion.button
                key={s.id as string}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleServiceClick(s)}
                disabled={checkingSelfie === s.id}
                className={`relative text-left p-4 rounded-md border-2 border-border bg-card hover:border-primary/40 transition-all duration-300 group shadow-sm hover:shadow-lg ${checkingSelfie === s.id ? "opacity-70 cursor-wait" : ""}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex gap-2">
                    {s.isSecondAttempt && (
                      <Badge className="bg-amber-500 text-white border-none text-[10px] font-bold">
                        2ª TENTATIVA
                      </Badge>
                    )}
                    <Badge
                      variant="secondary"
                      className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    >
                      {s.statusLabel as string}
                    </Badge>
                  </div>
                </div>

                <h3 className="font-bold text-subtitle text-foreground mb-1 uppercase tracking-tight">
                  {(s.serviceSlug as string)?.replace("-", " ")}
                </h3>

                <p className="text-xs text-accent font-bold uppercase tracking-widest mb-4">
                  {s.stepText as string}
                </p>

                <div className="mt-auto">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase">
                      {d.progress[lang]}
                    </span>
                    <span className="text-sm font-black text-primary">
                      {s.calculatedProgress as number}%
                    </span>
                  </div>
                  <Progress value={s.calculatedProgress as number} className="h-2" />
                </div>

                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                  {d.accessDetails[lang]}
                  <ChevronRight className="w-4 h-4" />
                </div>
              </motion.button>
            ))
          )}
        </div>
      </section>

      <Dialog open={isSelfieModalOpen} onOpenChange={setIsSelfieModalOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-subtitle font-bold">
              <Camera className="w-5 h-5 text-primary" />
              {d.selfieModal.title[lang]}
            </DialogTitle>
            <DialogDescription>
              {d.selfieModal.desc[lang]}
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
                  {d.selfieModal.submitting[lang]}
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  {d.selfieModal.uploadBtn[lang]}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
