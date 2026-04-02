import React, { useState } from "react";
import { DocumentStepProps } from "../../types";
import { Label } from "@/presentation/components/atoms/label";
import { Input } from "@/presentation/components/atoms/input";
import { Button } from "@/presentation/components/atoms/button";
import {
  FileCheck, Bell, CreditCard, Send, Loader2, CheckCircle2, Info, Download, Zap, Sparkles, ChevronDown, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/presentation/components/atoms/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/atoms/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { fillG1145G1450Forms } from "@/application/use-cases/FillG1145G1450Forms";
import { motion, AnimatePresence } from "framer-motion";

const G1145_URL = import.meta.env.VITE_G1145_TEMPLATE_URL as string;
const G1450_URL = import.meta.env.VITE_G1450_TEMPLATE_URL as string;

async function uploadBytes(bucket: string, storagePath: string, bytes: Uint8Array): Promise<void> {
  const blob = new Blob([bytes.buffer as any], { type: "application/pdf" });
  const { error } = await supabase.storage.from(bucket).upload(storagePath, blob, {
    contentType: "application/pdf",
    upsert: true,
  });
  if (error) throw new Error(`Upload falhou: ${error.message}`);
}

export const ChangeOfStatusFinalFormsStep = ({
  lang,
  register,
  setValue,
  watch,
  serviceId,
  onNext,
}: Partial<DocumentStepProps> & { serviceId?: string, onNext?: () => Promise<void> }) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [pdfUrls, setPdfUrls] = useState<{ g1145: string; g1450: string } | null>(null);

  const handleGenerate = async () => {
    if (!serviceId) {
      toast({ title: "Erro", description: "ID do serviço não encontrado.", variant: "destructive" });
      return;
    }
    if (!G1145_URL || !G1450_URL) {
      toast({ title: "Erro de Configuração", description: "URLs dos templates não definidas no .env.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado.");

      const v = (watch?.() ?? {}) as Record<string, string | undefined>;

      const result = await fillG1145G1450Forms(
        {
          lastName:    v.g1145_last_name,
          firstName:   v.g1145_first_name,
          middleName:  v.g1145_middle_name,
          email:       v.g1145_email,
          mobilePhone: v.g1145_mobile_phone,
        },
        {
          familyName:    v.g1450_last_name,
          givenName:     v.g1450_first_name,
          middleName:    v.g1450_middle_name,
          streetAddress: v.g1450_billing_street,
          city:          v.g1450_billing_city,
          state:         v.g1450_billing_state,
          zipCode:       v.g1450_billing_zip,
          cardType:      v.g1450_card_type,
          cardNumber:    v.g1450_card_number,
          expirationDate: v.g1450_expiration_date,
          email:         v.g1145_email,  // reusar email do G-1145
          signature:     `${v.g1450_first_name ?? ""} ${v.g1450_last_name ?? ""}`.trim(),
        },
        serviceId,
        { g1145TemplateUrl: G1145_URL, g1450TemplateUrl: G1450_URL, bucket: "process-documents", uploadBytes },
      );

      // Salva registros na tabela documents
      await Promise.all([
        supabase.from("documents").upsert({
          user_id: user.id, user_service_id: serviceId,
          name: "g1145_oficial", storage_path: result.g1145Path,
          bucket_id: "process-documents", status: "pending",
          created_at: new Date().toISOString(),
        }, { onConflict: "user_id,name" }),
        supabase.from("documents").upsert({
          user_id: user.id, user_service_id: serviceId,
          name: "g1450_oficial", storage_path: result.g1450Path,
          bucket_id: "process-documents", status: "pending",
          created_at: new Date().toISOString(),
        }, { onConflict: "user_id,name" }),
      ]);

      // Signed URLs para download imediato
      const [{ data: s1 }, { data: s2 }] = await Promise.all([
        supabase.storage.from("process-documents").createSignedUrl(result.g1145Path, 3600),
        supabase.storage.from("process-documents").createSignedUrl(result.g1450Path, 3600),
      ]);

      setPdfUrls({ g1145: s1?.signedUrl ?? "", g1450: s2?.signedUrl ?? "" });
      setIsGenerated(true);
      toast({
        title: "Formulários Gerados com Sucesso!",
        description: "G-1145 e G-1450 foram preenchidos e estão prontos para download.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Não foi possível gerar os PDFs.";
      console.error("Error generating G-1145/G-1450:", err);
      toast({ title: "Erro na Geração", description: msg, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-10"
    >
      <div className="flex flex-col space-y-1.5 border-b border-border/50 pb-6">
        <h2 className="font-display text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <FileCheck className="h-8 w-8 text-primary shrink-0" />
          {lang === "pt" ? "Formulários Finais USCIS" : "USCIS Final Forms"}
        </h2>
        <p className="text-muted-foreground font-medium">
          {lang === "pt"
            ? "Preencha os dados abaixo para gerarmos automaticamente os formulários G-1145 e G-1450 de forma segura."
            : "Fill in the information below and we will automatically generate Forms G-1145 and G-1450 securely."}
        </p>
      </div>

      <Accordion type="multiple" defaultValue={["g1145", "g1450"]} className="w-full space-y-6">

        {/* ── G-1145 ── */}
        <AccordionItem value="g1145" className="bg-card/10 backdrop-blur-sm rounded-[2rem] border border-border/50 px-6 shadow-xl overflow-hidden group">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
                <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <p className="font-display text-xl font-bold text-foreground">Form G-1145</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60">
                  e-Notification of Application Acceptance
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-8 space-y-8">
            <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-2xl text-sm text-blue-700 dark:text-blue-300">
              <Info className="h-5 w-5 mt-0.5 shrink-0" />
              <p className="font-medium leading-relaxed">
                {lang === "pt"
                  ? "Este formulário solicita que a USCIS envie notificações por e-mail ou SMS assim que seu processo for recebido e aceito pelo órgão."
                  : "This form requests USCIS to send e-mail or text notifications when your application is officially accepted by the agency."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest opacity-60">Last Name / Sobrenome *</Label>
                <Input {...register!("g1145_last_name" as any)} placeholder="Smith" className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest opacity-60">First Name / Nome *</Label>
                <Input {...register!("g1145_first_name" as any)} placeholder="John" className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest opacity-60">Middle Name (opcional)</Label>
                <Input {...register!("g1145_middle_name" as any)} className="h-12 rounded-xl" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest opacity-60">Email Address *</Label>
                <Input type="email" {...register!("g1145_email" as any)} placeholder="email@example.com" className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest opacity-60">Mobile Phone *</Label>
                <Input type="tel" {...register!("g1145_mobile_phone" as any)} placeholder="+1 (555) 000-0000" className="h-12 rounded-xl" />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ── G-1450 ── */}
        <AccordionItem value="g1450" className="bg-card/10 backdrop-blur-sm rounded-[2rem] border border-border/50 px-6 shadow-xl overflow-hidden group">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center shadow-inner group-hover:-rotate-6 transition-transform">
                <CreditCard className="h-6 w-6 text-accent" />
              </div>
              <div className="text-left">
                <p className="font-display text-xl font-bold text-foreground">Form G-1450</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60">
                  Authorization for Credit Card Transactions
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-8 space-y-10">
            <div className="flex items-start gap-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl text-sm text-amber-700 dark:text-amber-300">
              <Info className="h-5 w-5 mt-0.5 shrink-0" />
              <p className="font-medium leading-relaxed">
                {lang === "pt"
                  ? "Este formulário autoriza a USCIS a cobrar a taxa de solicitação oficial diretamente no seu cartão de crédito informado abaixo."
                  : "This form authorizes USCIS to charge the official filing fee directly to the credit card information provided below."}
              </p>
            </div>

            {/* Applicant Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-border pb-2">
                <div className="h-2 w-2 rounded-full bg-accent" />
                <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Applicant Information</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest opacity-60">Last Name / Sobrenome *</Label>
                  <Input {...register!("g1450_last_name" as any)} placeholder="Smith" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest opacity-60">First Name / Nome *</Label>
                  <Input {...register!("g1450_first_name" as any)} placeholder="John" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest opacity-60">Middle Name (opcional)</Label>
                  <Input {...register!("g1450_middle_name" as any)} className="h-12 rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest opacity-60">Date of Birth *</Label>
                  <Input type="date" {...register!("g1450_dob" as any)} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest opacity-60">A-Number (se houver)</Label>
                  <Input {...register!("g1450_alien_number" as any)} placeholder="A-XXXXX" className="h-12 rounded-xl" />
                </div>
              </div>
            </div>

            {/* Card Info */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-3 border-b border-border pb-2">
                <div className="h-2 w-2 rounded-full bg-accent" />
                <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Credit Card Information</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest opacity-60">Card Type / Bandeira *</Label>
                  <Select onValueChange={(v) => setValue!("g1450_card_type" as any, v)}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Visa">Visa</SelectItem>
                      <SelectItem value="Mastercard">Mastercard</SelectItem>
                      <SelectItem value="American Express">American Express</SelectItem>
                      <SelectItem value="Discover">Discover</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest opacity-60">Cardholder Name (como no cartão) *</Label>
                  <Input {...register!("g1450_cardholder_name" as any)} placeholder="JOHN D SMITH" className="h-12 rounded-xl uppercase font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2 md:col-span-1">
                  <Label className="text-xs font-black uppercase tracking-widest opacity-60">Card Number *</Label>
                  <Input {...register!("g1450_card_number" as any)} placeholder="XXXX XXXX XXXX XXXX" maxLength={19} className="h-12 rounded-xl font-mono" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest opacity-60">Expiration Date *</Label>
                  <Input {...register!("g1450_expiration_date" as any)} placeholder="MM/YYYY" maxLength={7} className="h-12 rounded-xl font-mono" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest opacity-60">CVV *</Label>
                  <Input {...register!("g1450_cvv" as any)} placeholder="123" maxLength={4} type="password" className="h-12 rounded-xl" />
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-3 border-b border-border pb-2">
                <div className="h-2 w-2 rounded-full bg-accent" />
                <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Billing Address</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-black uppercase tracking-widest opacity-60">Street Address *</Label>
                  <Input {...register!("g1450_billing_street" as any)} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest opacity-60">City *</Label>
                  <Input {...register!("g1450_billing_city" as any)} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest opacity-60">State *</Label>
                  <Input {...register!("g1450_billing_state" as any)} placeholder="Ex: NY" className="h-12 rounded-xl uppercase" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest opacity-60">ZIP Code *</Label>
                  <Input {...register!("g1450_billing_zip" as any)} className="h-12 rounded-xl font-mono" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest opacity-60">Country *</Label>
                  <Input {...register!("g1450_billing_country" as any)} defaultValue="United States" className="h-12 rounded-xl" />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>

      {/* Generate Button Section */}
      <div className={cn(
        "rounded-[2.5rem] border-4 p-8 md:p-12 shadow-2xl overflow-hidden relative transition-all duration-700 group",
        isGenerated
          ? "border-green-500 bg-green-50/50"
          : "border-primary/20 bg-primary/5"
      )}>
        <div className="absolute -right-20 -top-20 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
          <FileCheck className="h-64 w-64 text-primary" />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row gap-10 items-center justify-between">
          <div className="space-y-4 flex-1 text-center lg:text-left">
            <AnimatePresence mode="wait">
              {isGenerated ? (
                <motion.div 
                  key="generated-content"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-center lg:justify-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center shadow-lg shadow-green-600/30">
                      <Check className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-display text-3xl font-black text-green-700 tracking-tight">
                      {lang === "pt" ? "Formulários Prontos!" : "Forms Ready!"}
                    </h3>
                  </div>
                  <p className="text-lg text-green-700/80 font-medium leading-relaxed max-w-xl">
                    {lang === "pt"
                      ? "Os formulários G-1145 e G-1450 foram preenchidos com sucesso. Agora você pode baixá-los abaixo ou prosseguir."
                      : "Forms G-1145 and G-1450 were filled successfully. You can download them below or continue."}
                  </p>
                  {pdfUrls && (
                    <div className="space-y-6">
                      <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-6">
                        <Button 
                          variant="outline" 
                          asChild 
                          className="bg-white border-green-200 text-green-700 hover:bg-green-50 h-14 px-8 rounded-2xl font-bold gap-3 shadow-sm hover:shadow-md transition-all"
                        >
                          <a href={pdfUrls.g1145} target="_blank" rel="noopener noreferrer">
                            <Download className="h-5 w-5" /> G-1145.pdf
                          </a>
                        </Button>
                        <Button 
                          variant="outline" 
                          asChild 
                          className="bg-white border-green-200 text-green-700 hover:bg-green-50 h-14 px-8 rounded-2xl font-bold gap-3 shadow-sm hover:shadow-md transition-all"
                        >
                          <a href={pdfUrls.g1450} target="_blank" rel="noopener noreferrer">
                            <Download className="h-5 w-5" /> G-1450.pdf
                          </a>
                        </Button>
                      </div>

                      <div className="pt-4 border-t border-green-200/50">
                        <Button
                          onClick={onNext}
                          className="w-full lg:w-auto h-16 px-12 gap-3 bg-green-600 hover:bg-green-700 text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-green-600/20 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Send className="h-5 w-5" />
                          {lang === "pt" ? "Enviar para Revisão do Administrador" : "Submit for Administrator Review"}
                        </Button>
                        <p className="text-[10px] text-green-600/70 font-bold uppercase tracking-widest mt-3 text-center lg:text-left">
                          {lang === "pt" 
                            ? "Ao clicar, o administrador será notificado para conferir e aprovar seus formulários."
                            : "By clicking, the administrator will be notified to check and approve your forms."}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="initial-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-center lg:justify-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-display text-3xl font-black text-primary tracking-tight">
                      {lang === "pt" ? "Geração Automática" : "Automatic Generation"}
                    </h3>
                  </div>
                  <p className="text-lg text-foreground/70 font-medium leading-relaxed max-w-xl">
                    {lang === "pt"
                      ? "Nosso sistema utilizará sua inteligência para preencher ambos os formulários oficiais da USCIS automaticamente."
                      : "Our system will use its intelligence to fill both official USCIS forms automatically for you."}
                  </p>
                  <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-black text-primary uppercase tracking-widest opacity-60">
                    <Zap className="h-3 w-3 fill-primary" /> Review all data before starting
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!isGenerated && (
            <Button
              className="w-full lg:w-auto h-20 px-12 gap-4 font-black uppercase text-sm tracking-widest shadow-2xl shadow-primary/20 rounded-[2rem] transition-all active:scale-[0.98] group relative overflow-hidden"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
              {isGenerating ? (
                <><Loader2 className="h-6 w-6 animate-spin" /> Gerando PDFs...</>
              ) : (
                <><Send className="h-6 w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Iniciar Geração</>
              )}
            </Button>
          )}
        </div>
      </div>

    </motion.div>
  );
};
