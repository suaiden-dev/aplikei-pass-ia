import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CreditCard,
  Wallet,
  Receipt,
  DollarSign,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Download,
  Clock,
  RefreshCw,
  CheckCircle2,
  FileText,
  MousePointer2,
  ExternalLink,
  Maximize2,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import onePhaseImg from "@/assets/payment/one_phase.jpeg";
import twoPhaseImg from "@/assets/payment/two_phase.jpeg";
import threePhaseImg from "@/assets/payment/three_phase.jpeg";
import fourPhaseImg from "@/assets/payment/four_phase.jpeg";

interface PaymentPendingStepProps {
  serviceId: string | null;
  onComplete?: () => void;
}

interface ProcessDocument {
  id: string;
  name: string;
  storage_path: string;
  bucket_id: string;
  created_at: string;
}

interface ConsularCredentials {
  consular_login?: string | null;
  consular_password?: string | null;
}

export function PaymentPendingStep({
  serviceId,
  onComplete,
}: PaymentPendingStepProps) {
  const { lang, t } = useLanguage();
  const p = t.onboardingPage.paymentPending;
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDoc, setIsLoadingDoc] = useState(true);
  const [boletoDoc, setBoletoDoc] = useState<ProcessDocument | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"boleto" | "card">(
    "boleto",
  );
  const [consularLogin, setConsularLogin] = useState("");
  const [consularPassword, setConsularPassword] = useState("");

  // Fee is strictly $185
  const feeAmount = "185.00";

  const carouselItems = [
    {
      id: 1,
      image: onePhaseImg,
      title: p.slide1Title[lang],
      desc: p.slide1Desc[lang],
    },
    {
      id: 2,
      image: twoPhaseImg,
      title: p.slide2Title[lang],
      desc: p.slide2Desc[lang],
    },
    {
      id: 3,
      image: threePhaseImg,
      title: p.slide3Title[lang],
      desc: p.slide3Desc[lang],
    },
    {
      id: 4,
      image: fourPhaseImg,
      title: p.slide4Title[lang],
      desc: p.slide4Desc[lang],
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!serviceId) return;
      try {
        // Fetch Service details (credentials)
        const { data: service } = await supabase
          .from("user_services")
          .select("consular_login, consular_password")
          .eq("id", serviceId)
          .single();

        if (service) {
          const s = service as unknown as ConsularCredentials;
          setConsularLogin(s.consular_login || "");
          setConsularPassword(s.consular_password || "");
        }

        // Fetch Boleto
        const { data: boleto } = await supabase
          .from("documents")
          .select("id, name, storage_path, bucket_id, created_at")
          .eq("user_service_id", serviceId)
          .eq("name", "ds160_boleto")
          .maybeSingle();

        if (boleto) setBoletoDoc(boleto as unknown as ProcessDocument);
      } catch (error) {
        console.log("Error fetching data:", error);
      } finally {
        setIsLoadingDoc(false);
      }
    };

    fetchData();
  }, [serviceId]);

  const handlePaymentCompleted = async () => {
    if (!serviceId) return;

    setIsSaving(true);
    try {
      // Advance status to awaitingInterview
      const { error: statusError } = await supabase
        .from("user_services")
        .update({ status: "awaitingInterview" })
        .eq("id", serviceId);

      if (statusError) throw statusError;

      toast.success(p.successPaymentMsg[lang]);
      if (onComplete) onComplete();

      // Reload to reflect changes
      window.location.reload();
    } catch (err) {
      const error = err as Error;
      console.error("Error confirming payment:", error);
      toast.error(p.errorConfirmingPayment[lang]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadBoleto = () => {
    if (!boletoDoc) return;
    const { data } = supabase.storage
      .from(boletoDoc.bucket_id || "process-documents")
      .getPublicUrl(boletoDoc.storage_path);
    window.open(data.publicUrl, "_blank");
  };

  if (isLoadingDoc) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
        <p className="text-muted-foreground animate-pulse">
          {p.loadingInfo[lang]}
        </p>
      </div>
    );
  }

  // If no boleto is found, show the Processing screen
  if (!boletoDoc) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-md mb-2">
            <Clock className="h-8 w-8 text-accent animate-spin-slow" />
          </div>
          <h2 className="text-title md:text-title-xl font-black font-display text-foreground tracking-tight uppercase">
            {p.feeInProcessing[lang]}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed md:px-0 px-4">
            {p.excellentEmailReceived[lang]}
          </p>
        </div>

        <Card className="border-border shadow-2xl rounded-[32px] overflow-hidden bg-card/10 backdrop-blur-md relative p-6 text-center border-dashed">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full animate-pulse"></div>
                <div className="relative bg-card border border-border h-24 w-24 rounded-3xl flex items-center justify-center">
                  <Receipt className="h-10 w-10 text-accent" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-subtitle font-bold">
                {p.generatingSlip[lang]}
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                {p.processMinutes[lang]}
              </p>
            </div>
            <div className="pt-4">
              <Button
                variant="outline"
                className="rounded-full px-5 border-accent/20 text-accent hover:bg-accent/5 h-auto py-2 whitespace-normal text-xs sm:text-sm text-center"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-2 shrink-0" />
                {p.refreshStatus[lang]}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 w-full max-w-full">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-md mb-2">
          <Wallet className="h-8 w-8 text-accent animate-pulse" />
        </div>
        <h2 className="text-title md:text-title-xl font-black font-display text-foreground tracking-tight uppercase px-2">
          {p.title[lang]}
        </h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed px-4 md:px-0">
          {p.desc[lang]}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-3 sm:gap-4 max-w-4xl mx-auto w-full">
        {/* Method Selection: Boleto */}
        <div
          className={cn(
            "relative p-4 sm:p-5 rounded-[24px] md:rounded-[32px] border-2 transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.98]",
            paymentMethod === "boleto"
              ? "bg-accent/5 border-accent shadow-xl shadow-accent/10"
              : "bg-card border-border hover:border-accent/40",
          )}
          onClick={() => setPaymentMethod("boleto")}
        >
          <div className="absolute top-6 right-6">
            <div
              className={cn(
                "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors",
                paymentMethod === "boleto"
                  ? "bg-accent border-accent"
                  : "border-muted-foreground/30",
              )}
            >
              <CheckCircle2
                className={cn(
                  "h-4 w-4 text-white transition-opacity",
                  paymentMethod === "boleto" ? "opacity-100" : "opacity-0",
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div
              className={cn(
                "h-14 w-14 rounded-md flex items-center justify-center transition-colors",
                paymentMethod === "boleto"
                  ? "bg-accent text-white"
                  : "bg-muted/50 text-muted-foreground",
              )}
            >
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-subtitle font-black uppercase tracking-tight">
                {p.bankSlip[lang]}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {p.payAnyBank[lang]}
              </p>
            </div>
          </div>
        </div>

        {/* Method Selection: Card */}
        <div
          className={cn(
            "relative p-4 sm:p-5 rounded-[24px] md:rounded-[32px] border-2 transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.98]",
            paymentMethod === "card"
              ? "bg-accent/5 border-accent shadow-xl shadow-accent/10"
              : "bg-card border-border hover:border-accent/40",
          )}
          onClick={() => setPaymentMethod("card")}
        >
          <div className="absolute top-6 right-6">
            <div
              className={cn(
                "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors",
                paymentMethod === "card"
                  ? "bg-accent border-accent"
                  : "border-muted-foreground/30",
              )}
            >
              <CheckCircle2
                className={cn(
                  "h-4 w-4 text-white transition-opacity",
                  paymentMethod === "card" ? "opacity-100" : "opacity-0",
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div
              className={cn(
                "h-14 w-14 rounded-md flex items-center justify-center transition-colors",
                paymentMethod === "card"
                  ? "bg-accent text-white"
                  : "bg-muted/50 text-muted-foreground",
              )}
            >
              <CreditCard className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-subtitle font-black uppercase tracking-tight">
                {p.creditCard[lang]}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {p.immediatePayment[lang]}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-border shadow-2xl rounded-2xl sm:rounded-3xl md:rounded-[40px] overflow-hidden bg-card/10 backdrop-blur-md relative border-dashed max-w-4xl mx-auto w-full">
        <CardContent className="p-3 sm:p-6 space-y-4 md:space-y-6 text-center">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {paymentMethod === "boleto"
                ? p.slipDetails[lang]
                : p.cardDetails[lang]}
            </span>
            <div className="flex items-center justify-center gap-1">
              <span className="text-base sm:text-title font-bold text-muted-foreground self-start mt-1 sm:mt-2">
                $
              </span>
              <span className="text-4xl sm:text-7xl font-black text-foreground tracking-tighter">
                {feeAmount}
              </span>
              <span className="text-xs sm:text-subtitle font-bold text-muted-foreground self-end mb-1 sm:mb-2">
                USD
              </span>
            </div>
          </div>

          <div className="animate-in fade-in zoom-in-95 duration-500">
            {paymentMethod === "boleto" ? (
              <div className="grid gap-4">
                <div
                  className="p-3 sm:p-5 bg-accent/5 rounded-2xl md:rounded-[32px] border border-accent/20 text-left flex items-center justify-between group cursor-pointer"
                  onClick={handleDownloadBoleto}
                >
                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-4 w-full">
                    <div className="flex-1 min-w-0 text-center sm:text-left order-first sm:order-last">
                      <h4 className="font-black text-base sm:text-subtitle tracking-tight leading-tight">
                        {p.downloadPdfSlip[lang]}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-1 sm:mt-1">
                        {p.officialSlipAvailable[lang]}
                      </p>
                    </div>
                    <div className="h-16 w-full sm:w-16 bg-accent rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform shrink-0 order-last sm:order-first">
                      <Download className="h-8 w-8 sm:h-8 sm:w-8" />
                    </div>
                  </div>
                  <MousePointer2 className="h-6 w-6 text-accent animate-bounce hidden sm:block shrink-0 ml-2" />
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-border text-left space-y-2">
                  <div className="flex items-center gap-2 text-blue-500">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-xs font-black uppercase tracking-widest">
                      {p.importantInfo[lang]}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {p.compensationDesc[lang]}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 w-full">
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-2 sm:p-6 shadow-inner mx-auto relative group w-full">
                  <Carousel className="w-full">
                    <CarouselContent>
                      {carouselItems.map((item) => (
                        <CarouselItem key={item.id} className="w-full">
                          <div className="flex flex-col gap-3 sm:gap-5 p-1 sm:p-2 items-center text-center w-full">
                            <div className="space-y-2 mt-2 w-full">
                              <h4 className="text-lg font-bold text-foreground">
                                {item.title}
                              </h4>
                              <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-sm mx-auto">
                                {item.desc}
                              </p>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <div className="mt-3 sm:mt-4 rounded-xl overflow-hidden shadow-sm flex justify-center w-full max-w-full sm:max-w-2xl mx-auto relative group cursor-pointer">
                                    <img
                                      src={item.image}
                                      alt={item.title}
                                      className="w-full h-auto max-h-[600px] object-contain transition-transform duration-300 group-hover:scale-[1.02] rounded-xl border border-border"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                      <div className="bg-white/20 p-3 rounded-full backdrop-blur-md border border-white/30 text-white shadow-lg">
                                        <Maximize2 className="w-6 h-6" />
                                      </div>
                                    </div>
                                  </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl w-[95vw] p-1 sm:p-2 bg-transparent border-none shadow-none mt-4">
                                  <img 
                                    src={item.image} 
                                    alt={item.title} 
                                    className="w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" 
                                  />
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <div className="flex items-center justify-center gap-2 mt-6 relative z-10 w-full">
                      <CarouselPrevious className="static bg-card border-slate-200 hover:bg-slate-100 shadow-sm transition-all text-foreground h-8 w-8 translate-x-0 translate-y-0" />
                      <div className="flex px-4 items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        {lang === "pt"
                          ? "Deslize"
                          : lang === "es"
                            ? "Deslizar"
                            : "Swipe"}
                      </div>
                      <CarouselNext className="static bg-card border-slate-200 hover:bg-slate-100 shadow-sm transition-all text-foreground h-8 w-8 translate-x-0 translate-y-0" />
                    </div>
                  </Carousel>

                  {(consularLogin || consularPassword) && (
                    <div className="bg-white dark:bg-slate-800/80 rounded-xl p-3 sm:p-4 border border-blue-200 dark:border-blue-900/50 shadow-inner space-y-2 sm:space-y-3 mt-6">
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-1">
                          Login / E-mail
                        </span>
                        <span className="text-sm font-bold font-mono break-all leading-none">
                          {consularLogin || "---"}
                        </span>
                      </div>
                      <div className="flex flex-col text-left border-t border-slate-100 dark:border-slate-700/50 pt-3">
                        <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-1">
                          {p.password[lang]}
                        </span>
                        <span className="text-sm font-bold font-mono leading-none">
                          {consularPassword || "---"}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <Button
                      className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-md gap-2 font-bold uppercase text-xs tracking-widest shadow-lg shadow-blue-500/20"
                      onClick={() =>
                        window.open(
                          "https://ais.usvisa-info.com/pt-br/niv/",
                          "_blank",
                        )
                      }
                    >
                      {p.goToPortal[lang]} <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-border text-left space-y-2">
                  <div className="flex items-center gap-2 text-accent">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs font-black uppercase tracking-widest">
                      {p.advantage[lang]}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {p.creditCardInstant[lang]}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 space-y-4">
            <Button
              className="w-full h-auto min-h-14 sm:min-h-20 py-3 sm:py-4 px-4 bg-accent hover:bg-green-dark text-white rounded-2xl sm:rounded-[32px] shadow-2xl shadow-accent/30 font-black text-xs sm:text-base md:text-subtitle whitespace-normal transition-all active:scale-[0.98] group relative overflow-hidden"
              disabled={isSaving}
              onClick={handlePaymentCompleted}
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              {isSaving ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="flex items-center justify-center gap-2 sm:gap-4 relative z-10 w-full">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-full bg-white/20 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <span className="text-center leading-tight">
                    {p.alreadyPaid[lang]}
                  </span>
                </div>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 opacity-40">
              <ShieldCheck className="h-3 w-3" />
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">
                {p.secureEnvironment[lang]}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
