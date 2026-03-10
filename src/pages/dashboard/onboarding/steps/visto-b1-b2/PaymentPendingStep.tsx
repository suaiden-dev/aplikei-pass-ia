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
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const { lang } = useLanguage();
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

      toast.success(
        lang === "pt"
          ? "Pagamento confirmado! Agora aguarde a entrevista."
          : "Payment confirmed! Now wait for the interview.",
      );
      if (onComplete) onComplete();

      // Reload to reflect changes
      window.location.reload();
    } catch (err) {
      const error = err as Error;
      console.error("Error confirming payment:", error);
      toast.error(
        lang === "pt"
          ? "Erro ao confirmar pagamento."
          : "Error confirming payment.",
      );
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
          {lang === "pt"
            ? "Carregando informações..."
            : "Loading information..."}
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
            {lang === "pt" ? "TAXA EM PROCESSAMENTO" : "FEE IN PROCESSING"}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed md:px-0 px-4">
            {lang === "pt"
              ? "Excelente! Sua confirmação de e-mail foi recebida. Agora nossa equipe está gerando o seu boleto para pagamento da taxa MRV."
              : "Excellent! Your email confirmation has been received. Now our team is generating your slip for the MRV fee payment."}
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
                {lang === "pt" ? "Gerando Boleto..." : "Generating Slip..."}
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                {lang === "pt"
                  ? "Este processo geralmente leva alguns minutos. Assim que estiver pronto, as opções de pagamento aparecerão aqui."
                  : "This process usually takes a few minutes. Once ready, the payment options will appear here."}
              </p>
            </div>
            <div className="pt-4">
              <Button
                variant="outline"
                className="rounded-full px-5 border-accent/20 text-accent hover:bg-accent/5 h-auto py-2 whitespace-normal text-xs sm:text-sm text-center"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-2 shrink-0" />
                {lang === "pt" ? "ATUALIZAR STATUS" : "REFRESH STATUS"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-md mb-2">
          <Wallet className="h-8 w-8 text-accent animate-pulse" />
        </div>
        <h2 className="text-title md:text-title-xl font-black font-display text-foreground tracking-tight uppercase px-2">
          {lang === "pt"
            ? "PAGAMENTO DA TAXA CONSULAR"
            : "CONSULAR FEE PAYMENT"}
        </h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed px-4">
          {lang === "pt"
            ? "Selecione a forma de pagamento desejada para prosseguir com o agendamento."
            : "Select the desired payment method to proceed with scheduling."}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {/* Method Selection: Boleto */}
        <div
          className={cn(
            "relative p-5 rounded-[32px] border-2 transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.98]",
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
                {lang === "pt" ? "Boleto Bancário" : "Bank Slip"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {lang === "pt"
                  ? "Pague em qualquer banco ou casa lotérica."
                  : "Pay at any bank or convenience store."}
              </p>
            </div>
          </div>
        </div>

        {/* Method Selection: Card */}
        <div
          className={cn(
            "relative p-5 rounded-[32px] border-2 transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.98]",
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
                {lang === "pt" ? "Cartão de Crédito" : "Credit Card"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {lang === "pt"
                  ? "Pagamento imediato via portal do consulado."
                  : "Immediate payment via consulate portal."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-border shadow-2xl rounded-[40px] overflow-hidden bg-card/10 backdrop-blur-md relative border-dashed max-w-3xl mx-auto">
        <CardContent className="p-6 space-y-6 text-center">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {paymentMethod === "boleto"
                ? lang === "pt"
                  ? "DETALHES DO BOLETO"
                  : "SLIP DETAILS"
                : lang === "pt"
                  ? "DETALHES DO CARTÃO"
                  : "CARD DETAILS"}
            </span>
            <div className="flex items-center justify-center gap-1">
              <span className="text-lg sm:text-title font-bold text-muted-foreground self-start mt-1 sm:mt-2">
                $
              </span>
              <span className="text-5xl sm:text-7xl font-black text-foreground tracking-tighter">
                {feeAmount}
              </span>
              <span className="text-sm sm:text-subtitle font-bold text-muted-foreground self-end mb-1 sm:mb-2">
                USD
              </span>
            </div>
          </div>

          <div className="animate-in fade-in zoom-in-95 duration-500">
            {paymentMethod === "boleto" ? (
              <div className="grid gap-4">
                <div
                  className="p-4 sm:p-5 bg-accent/5 rounded-2xl md:rounded-[32px] border border-accent/20 text-left flex items-center justify-between group cursor-pointer"
                  onClick={handleDownloadBoleto}
                >
                  <div className="flex items-center gap-3 sm:gap-4 w-full">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 bg-accent rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-accent/20 group-hover:scale-110 transition-transform shrink-0">
                      <Download className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="font-black text-sm sm:text-subtitle tracking-tight leading-tight">
                        {lang === "pt"
                          ? "Baixar Boleto PDF"
                          : "Download PDF Slip"}
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-0.5 sm:mt-1">
                        {lang === "pt"
                          ? "O boleto oficial já está disponível."
                          : "The official slip is now available."}
                      </p>
                    </div>
                  </div>
                  <MousePointer2 className="h-5 w-5 sm:h-6 sm:w-6 text-accent animate-bounce hidden sm:block shrink-0 ml-2" />
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-border text-left space-y-2">
                  <div className="flex items-center gap-2 text-blue-500">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-xs font-black uppercase tracking-widest">
                      {lang === "pt"
                        ? "INFORMAÇÃO IMPORTANTE"
                        : "IMPORTANT INFO"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {lang === "pt"
                      ? "A compensação do boleto pode levar até 48 horas úteis. Somente após esse prazo nosso sistema liberará o seu agendamento."
                      : "Slip clearing can take up to 48 business hours. Only after this period will our system release your scheduling."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-5 bg-blue-500/5 rounded-[32px] border border-blue-500/20 text-left space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-500 rounded-md flex items-center justify-center text-white shrink-0">
                      <CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <h4 className="font-black text-base sm:text-subtitle tracking-tight leading-tight">
                      {lang === "pt"
                        ? "Pagamento via Portal"
                        : "Portal Payment"}
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {lang === "pt"
                      ? "Para pagar com cartão de crédito, você deve acessar o portal oficial do consulado com os dados abaixo:"
                      : "To pay with a credit card, you must access the official consulate portal with the details below:"}
                  </p>

                  {(consularLogin || consularPassword) && (
                    <div className="bg-white dark:bg-slate-800/80 rounded-md p-4 border border-blue-200 dark:border-blue-900/50 shadow-inner space-y-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-1">
                          Login / E-mail
                        </span>
                        <span className="text-sm font-bold font-mono break-all leading-none">
                          {consularLogin || "---"}
                        </span>
                      </div>
                      <div className="flex flex-col border-t border-slate-100 dark:border-slate-700/50 pt-3">
                        <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-1">
                          {lang === "pt" ? "Senha" : "Password"}
                        </span>
                        <span className="text-sm font-bold font-mono leading-none">
                          {consularPassword || "---"}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-md gap-2 font-bold uppercase text-xs tracking-widest shadow-lg shadow-blue-500/20"
                    onClick={() =>
                      window.open(
                        "https://ais.usvisa-info.com/pt-br/niv/",
                        "_blank",
                      )
                    }
                  >
                    {lang === "pt" ? "IR PARA O PORTAL" : "GO TO PORTAL"}{" "}
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-border text-left space-y-2">
                  <div className="flex items-center gap-2 text-accent">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs font-black uppercase tracking-widest">
                      {lang === "pt" ? "VANTAGEM" : "ADVANTAGE"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {lang === "pt"
                      ? "Pagamentos via cartão de crédito costumam ser compensados instantaneamente, agilizando o seu processo."
                      : "Payments via credit card are usually cleared instantly, speeding up your process."}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 space-y-4">
            <Button
              className="w-full h-auto min-h-20 py-4 px-4 bg-accent hover:bg-green-dark text-white rounded-[32px] shadow-2xl shadow-accent/30 font-black text-sm sm:text-base md:text-subtitle whitespace-normal transition-all active:scale-[0.98] group relative overflow-hidden"
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
                    {lang === "pt"
                      ? "JÁ REALIZEI O PAGAMENTO"
                      : "I HAVE COMPLETED THE PAYMENT"}
                  </span>
                </div>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 opacity-40">
              <ShieldCheck className="h-3 w-3" />
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">
                {lang === "pt"
                  ? "Ambiente seguro e criptografado"
                  : "Secure and encrypted environment"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
