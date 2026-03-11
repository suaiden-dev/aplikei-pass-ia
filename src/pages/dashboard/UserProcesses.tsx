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
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";

const TOTAL_STEPS = 9;

const getStatusDisplay = (
  status: string,
  lang: string,
  tStatus: any,
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
    case "uploadsUnderReview":
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
        step: 0,
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

export default function UserProcesses() {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const d = t.dashboard;
  const { user, loading: authLoading } = useAuth();
  const [services, setServices] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(true);
  const [isSelfieModalOpen, setIsSelfieModalOpen] = useState(false);
  const [uploadingSelfie, setUploadingSelfie] = useState(false);
  const [checkingSelfie, setCheckingSelfie] = useState<string | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [pendingServiceToNavigate, setPendingServiceToNavigate] = useState<
    any | null
  >(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchServices = async () => {
      const { data: servicesData, error } = await supabase
        .from("user_services")
        .select("id, status, current_step, service_slug, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setLoading(false);
        return;
      }

      if (servicesData) {
        const processedServices = servicesData.map((s) => {
          const statusInfo = getStatusDisplay(s.status, lang as string, d.status);
          let p = 0;

          if (s.status === "approved" || s.status === "completed") {
            p = 100;
          } else if (statusInfo.step > 1) {
            p = Math.round(((statusInfo.step - 1) / TOTAL_STEPS) * 100);
          } else if (statusInfo.step === 1) {
            p = Math.min(Math.round(((s.current_step || 0) / 13) * 10), 10);
          }

          return {
            ...s,
            calculatedProgress: p,
            statusLabel: statusInfo.label,
            stepText: statusInfo.stepText,
          };
        });

        setServices(processedServices);
      }
      setLoading(false);
    };
    fetchServices();
  }, [user, authLoading, lang, d.status]);

  const handleServiceClick = async (service: any) => {
    if (checkingSelfie || !user) return;

    setCheckingSelfie(service.id);
    try {
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

      const { error: uploadError } = await supabase.storage
        .from("visa-documents")
        .upload(filePath, selfieFile);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("visa-documents").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("visa_orders")
        .update({
          contract_selfie_url: publicUrl,
          user_id: user.id,
        })
        .eq("id", pendingOrderId);

      if (updateError) throw updateError;

      setIsSelfieModalOpen(false);
      setSelfieFile(null);
      if (pendingServiceToNavigate) {
        navigate(
          `/dashboard/onboarding?service_id=${pendingServiceToNavigate.id}`,
        );
      }
    } catch (err: any) {
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
                key={s.id}
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
                  <Badge
                    variant="secondary"
                    className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  >
                    {s.statusLabel}
                  </Badge>
                </div>

                <h3 className="font-bold text-subtitle text-foreground mb-1 uppercase tracking-tight">
                  {s.service_slug?.replace("-", " ")}
                </h3>

                <p className="text-xs text-accent font-bold uppercase tracking-widest mb-4">
                  {s.stepText}
                </p>

                <div className="mt-auto">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase">
                      {d.progress[lang]}
                    </span>
                    <span className="text-sm font-black text-primary">
                      {s.calculatedProgress}%
                    </span>
                  </div>
                  <Progress value={s.calculatedProgress} className="h-2" />
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
