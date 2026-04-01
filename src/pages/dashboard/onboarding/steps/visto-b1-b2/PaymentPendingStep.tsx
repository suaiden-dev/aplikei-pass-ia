import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/presentation/components/atoms/card";
import { Button } from "@/presentation/components/atoms/button";
import { Badge } from "@/presentation/components/atoms/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/presentation/components/atoms/carousel";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/presentation/components/atoms/dialog";
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
  ChevronRight,
  Zap,
  Lock,
  Sparkles
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
      const { error: statusError } = await supabase
        .from("user_services")
        .update({ status: "awaitingInterview" })
        .eq("id", serviceId);

      if (statusError) throw statusError;

      toast.success(p.successPaymentMsg[lang]);
      if (onComplete) onComplete();

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
      <div className="flex flex-col items-center justify-center py-32 gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
          <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
        </div>
        <p className="text-muted-foreground font-display font-medium tracking-wide animate-pulse">
          {p.loadingInfo[lang]}
        </p>
      </div>
    );
  }

  if (!boletoDoc) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-10 max-w-2xl mx-auto py-10"
      >
        <div className="text-center space-y-4">
          <div className="relative inline-flex mb-4">
             <div className="absolute inset-0 bg-accent/20 rounded-full animate-ping scale-150 duration-[3000ms]" />
             <div className="relative p-5 bg-card border-4 border-accent shadow-2xl rounded-[2rem]">
               <Clock className="h-10 w-10 text-accent animate-spin-slow" />
             </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-black font-display text-foreground tracking-tight leading-tight">
            {p.feeInProcessing[lang]}
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed font-medium">
            {p.excellentEmailReceived[lang]}
          </p>
        </div>

        <div className="bg-card/10 backdrop-blur-xl border border-border/50 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
           <div className="absolute -right-20 -top-20 opacity-[0.05] group-hover:scale-110 transition-transform duration-700">
             <Receipt className="w-80 h-80" />
           </div>
           
           <div className="relative space-y-8 text-center">
              <div className="space-y-3">
                <h3 className="text-2xl font-black font-display tracking-tight">
                  {p.generatingSlip[lang]}
                </h3>
                <p className="text-slate-500 font-semibold text-base leading-relaxed max-w-sm mx-auto">
                  {p.processMinutes[lang]}
                </p>
              </div>

              <div className="pt-4 flex flex-col items-center gap-4">
                <Button
                  size="lg"
                  className="rounded-2xl px-10 h-16 bg-white hover:bg-slate-100 border-2 border-accent/20 text-accent font-black uppercase text-xs tracking-widest gap-2 shadow-xl shadow-accent/5 transition-all active:scale-95"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="h-4 w-4" />
                  {p.refreshStatus[lang]}
                </Button>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <Zap className="h-3 w-3 fill-slate-400" />
                  Estimated time: ~15 mins
                </div>
              </div>
           </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 w-full max-w-4xl mx-auto pb-10"
    >
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-[2rem] shadow-inner mb-2">
          <Wallet className="h-8 w-8 text-primary animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl md:text-6xl font-black font-display text-foreground tracking-tighter leading-none uppercase">
            {p.title[lang]}
          </h2>
          <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed px-4">
            {p.desc[lang]}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Method Selection: Boleto */}
        <motion.div
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "relative p-8 rounded-[3rem] border-4 transition-all duration-300 cursor-pointer overflow-hidden group",
            paymentMethod === "boleto"
              ? "bg-primary/5 border-primary shadow-2xl shadow-primary/10"
              : "bg-card border-border/50 hover:border-primary/40 shadow-sm"
          )}
          onClick={() => setPaymentMethod("boleto")}
        >
          {paymentMethod === "boleto" && (
            <motion.div layoutId="payment-active" className="absolute top-8 right-8 z-20">
               <div className="bg-primary p-2 rounded-full shadow-lg">
                 <CheckCircle2 className="h-4 w-4 text-white" />
               </div>
            </motion.div>
          )}

          <div className="relative z-10 space-y-6">
            <div className={cn(
              "h-16 w-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 shadow-inner",
              paymentMethod === "boleto" ? "bg-primary text-white scale-110 rotate-3" : "bg-muted/50 text-slate-400"
            )}>
              <FileText className="h-8 w-8" />
            </div>
            <div className="space-y-1 text-left">
              <h3 className="text-2xl font-black font-display uppercase tracking-tight leading-none">
                {p.bankSlip[lang]}
              </h3>
              <p className="font-bold text-slate-500 text-sm leading-relaxed">
                {p.payAnyBank[lang]}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Method Selection: Card */}
        <motion.div
           whileHover={{ y: -5 }}
           whileTap={{ scale: 0.98 }}
           className={cn(
            "relative p-8 rounded-[3rem] border-4 transition-all duration-300 cursor-pointer overflow-hidden group",
            paymentMethod === "card"
              ? "bg-primary/5 border-primary shadow-2xl shadow-primary/10"
              : "bg-card border-border/50 hover:border-primary/40 shadow-sm"
          )}
          onClick={() => setPaymentMethod("card")}
        >
          {paymentMethod === "card" && (
            <motion.div layoutId="payment-active" className="absolute top-8 right-8 z-20">
               <div className="bg-primary p-2 rounded-full shadow-lg">
                 <CheckCircle2 className="h-4 w-4 text-white" />
               </div>
            </motion.div>
          )}

          <div className="relative z-10 space-y-6">
            <div className={cn(
              "h-16 w-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 shadow-inner",
              paymentMethod === "card" ? "bg-primary text-white scale-110 -rotate-3" : "bg-muted/50 text-slate-400"
            )}>
              <CreditCard className="h-8 w-8" />
            </div>
            <div className="space-y-1 text-left">
              <h3 className="text-2xl font-black font-display uppercase tracking-tight leading-none">
                {p.creditCard[lang]}
              </h3>
              <p className="font-bold text-slate-500 text-sm leading-relaxed">
                {p.immediatePayment[lang]}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-card/10 backdrop-blur-xl border border-border/50 shadow-2xl rounded-[3rem] lg:rounded-[4rem] overflow-hidden relative p-8 md:p-12 text-center">
        <div className="space-y-4 md:space-y-8">
          <div className="space-y-4">
            <Badge variant="outline" className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-widest px-4 py-2 h-auto shadow-inner">
              {paymentMethod === "boleto" ? p.slipDetails[lang] : p.cardDetails[lang]}
            </Badge>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-black text-slate-400 self-center mb-6">$</span>
              <span className="text-7xl md:text-9xl font-black text-foreground tracking-tighter leading-none font-display">
                {feeAmount}
              </span>
              <span className="text-xl font-black text-slate-400 self-end mb-4">USD</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {paymentMethod === "boleto" ? (
              <motion.div 
                key="boleto-view"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid gap-6 max-w-2xl mx-auto"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-8 bg-white dark:bg-card border-4 border-primary rounded-[2.5rem] text-left flex items-center justify-between group cursor-pointer shadow-xl shadow-primary/5 transition-all"
                  onClick={handleDownloadBoleto}
                >
                  <div className="flex items-center gap-6 w-full">
                    <div className="h-20 w-20 bg-primary rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-primary/30 group-hover:rotate-6 transition-transform shrink-0">
                      <Download className="h-10 w-10" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black font-display text-2xl tracking-tight leading-tight group-hover:text-primary transition-colors">
                        {p.downloadPdfSlip[lang]}
                      </h4>
                      <p className="font-bold text-slate-500 leading-relaxed mt-1">
                        {p.officialSlipAvailable[lang]}
                      </p>
                    </div>
                    <MousePointer2 className="h-8 w-8 text-primary animate-bounce hidden md:block shrink-0" />
                  </div>
                </motion.div>

                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-border/80 text-left flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                      Informação Importante
                    </p>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">
                      {p.compensationDesc[lang]}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="card-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 w-full"
              >
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-border/80 rounded-[3rem] p-4 sm:p-10 shadow-inner relative group max-w-3xl mx-auto">
                  <Carousel className="w-full">
                    <CarouselContent>
                      {carouselItems.map((item) => (
                        <CarouselItem key={item.id} className="w-full">
                          <div className="flex flex-col gap-8 p-2 items-center text-center">
                            <div className="space-y-3">
                              <h4 className="text-2xl font-black font-display tracking-tight text-foreground leading-none">
                                {item.title}
                              </h4>
                              <p className="text-base text-slate-500 font-bold leading-relaxed max-w-sm mx-auto">
                                {item.desc}
                              </p>
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                  <div className="rounded-[2.5rem] overflow-hidden shadow-2xl flex justify-center w-full relative group/img cursor-pointer border-8 border-white dark:border-card">
                                    <img
                                      src={item.image}
                                      alt={item.title}
                                      className="w-full h-auto max-h-[500px] object-contain transition-transform duration-500 group-hover/img:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                      <div className="bg-white p-4 rounded-full text-primary shadow-2xl scale-75 group-hover/img:scale-100 transition-transform">
                                        <Maximize2 className="w-8 h-8" />
                                      </div>
                                    </div>
                                  </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl w-[95vw] p-2 bg-transparent border-none shadow-none">
                                  <img 
                                    src={item.image} 
                                    alt={item.title} 
                                    className="w-full max-h-[85vh] object-contain rounded-[2rem] shadow-2xl" 
                                  />
                                </DialogContent>
                              </Dialog>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <div className="flex items-center justify-center gap-4 mt-10">
                      <CarouselPrevious className="static translate-y-0 h-12 w-12 rounded-2xl bg-white dark:bg-card border-none shadow-xl hover:text-primary transition-all" />
                      <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        <Sparkles className="h-3 w-3" />
                         Swipe for Guide
                      </div>
                      <CarouselNext className="static translate-y-0 h-12 w-12 rounded-2xl bg-white dark:bg-card border-none shadow-xl hover:text-primary transition-all" />
                    </div>
                  </Carousel>

                  {/* Credentials Card */}
                  {(consularLogin || consularPassword) && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-card rounded-[2.5rem] p-8 border-2 border-primary/20 shadow-2xl space-y-6 mt-10 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                        <Lock className="w-32 h-32" />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-8 relative z-10">
                        <div className="flex flex-col text-left space-y-2">
                          <span className="text-[10px] font-black uppercase text-primary tracking-[0.2em] leading-none">
                             Consular E-mail
                          </span>
                          <span className="text-base font-black font-mono break-all text-foreground bg-primary/5 p-4 rounded-xl border border-primary/10">
                            {consularLogin || "---"}
                          </span>
                        </div>
                        <div className="flex flex-col text-left space-y-2">
                          <span className="text-[10px] font-black uppercase text-primary tracking-[0.2em] leading-none">
                            Consular Password
                          </span>
                          <span className="text-base font-black font-mono text-foreground bg-primary/5 p-4 rounded-xl border border-primary/10">
                            {consularPassword || "---"}
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        size="lg"
                        className="w-full h-18 bg-primary hover:bg-primary/90 text-white rounded-2xl gap-3 font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] group"
                        onClick={() => window.open("https://ais.usvisa-info.com/pt-br/niv/", "_blank")}
                      >
                        {p.goToPortal[lang]} 
                        <ExternalLink className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </Button>
                    </motion.div>
                  )}
                </div>

                <div className="p-6 bg-green-50 dark:bg-green-950/20 rounded-3xl border border-green-200 dark:border-green-900/30 text-left flex gap-4 max-w-2xl mx-auto">
                  <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center shrink-0">
                    <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-green-600 dark:text-green-400">
                      {p.advantage[lang]}
                    </p>
                    <p className="text-sm font-semibold text-green-800 dark:text-green-300 leading-relaxed">
                      {p.creditCardInstant[lang]}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-10 space-y-8 max-w-2xl mx-auto">
            <Button
              className="w-full h-24 px-8 bg-accent hover:bg-accent/90 text-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(34,197,94,0.3)] font-black text-xl md:text-2xl font-display whitespace-normal transition-all active:scale-[0.98] group relative overflow-hidden"
              disabled={isSaving}
              onClick={handlePaymentCompleted}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
              {isSaving ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <div className="flex items-center justify-center gap-6 relative z-10 w-full py-4">
                  <div className="h-12 w-12 shrink-0 rounded-2xl bg-white/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <span className="text-center leading-[1.1] tracking-tight">
                    {p.alreadyPaid[lang]}
                  </span>
                  <ChevronRight className="h-8 w-8 opacity-40 group-hover:translate-x-2 transition-transform" />
                </div>
              )}
            </Button>

            <div className="flex flex-col items-center justify-center gap-4">
               <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 shadow-sm">
                 <ShieldCheck className="h-4 w-4 text-primary" />
                 <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">
                   {p.secureEnvironment[lang]}
                 </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
