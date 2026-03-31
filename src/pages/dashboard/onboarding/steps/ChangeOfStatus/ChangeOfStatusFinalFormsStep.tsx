import React, { useState } from "react";
import { DocumentStepProps } from "../../types";
import { Label } from "@/presentation/components/atoms/label";
import { Input } from "@/presentation/components/atoms/input";
import { Button } from "@/presentation/components/atoms/button";
import {
  FileCheck, Bell, CreditCard, Send, Loader2, CheckCircle2, Info, Download,
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

const G1145_URL = import.meta.env.VITE_G1145_TEMPLATE_URL as string;
const G1450_URL = import.meta.env.VITE_G1450_TEMPLATE_URL as string;

async function uploadBytes(bucket: string, storagePath: string, bytes: Uint8Array): Promise<void> {
  const blob = new Blob([bytes], { type: "application/pdf" });
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
}: Partial<DocumentStepProps> & { serviceId?: string }) => {
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-1.5 border-b border-border pb-4">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <FileCheck className="h-6 w-6 text-primary" />
          {lang === "pt" ? "Formulários Finais USCIS" : "USCIS Final Forms"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lang === "pt"
            ? "Preencha os dados abaixo para gerarmos automaticamente os formulários G-1145 e G-1450."
            : "Fill in the information below and we will automatically generate Forms G-1145 and G-1450."}
        </p>
      </div>

      <Accordion type="multiple" defaultValue={["g1145"]} className="w-full space-y-4">

        {/* ── G-1145 ── */}
        <AccordionItem value="g1145" className="bg-card rounded-2xl border px-4 shadow-sm">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Bell className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-bold">Form G-1145</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                  e-Notification of Application Acceptance
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6 space-y-6">
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <p>
                {lang === "pt"
                  ? "O G-1145 solicita que a USCIS envie notificação por e-mail/SMS quando seu processo for aceito."
                  : "G-1145 requests USCIS to send an e-mail/text notification when your application is accepted."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Last Name / Sobrenome *</Label>
                <Input {...register!("g1145_last_name" as any)} placeholder="Smith" />
              </div>
              <div className="space-y-2">
                <Label>First Name / Nome *</Label>
                <Input {...register!("g1145_first_name" as any)} placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label>Middle Name (opcional)</Label>
                <Input {...register!("g1145_middle_name" as any)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email Address *</Label>
                <Input type="email" {...register!("g1145_email" as any)} placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Mobile Phone *</Label>
                <Input type="tel" {...register!("g1145_mobile_phone" as any)} placeholder="+1 (555) 000-0000" />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ── G-1450 ── */}
        <AccordionItem value="g1450" className="bg-card rounded-2xl border px-4 shadow-sm">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-accent" />
              </div>
              <div className="text-left">
                <p className="font-bold">Form G-1450</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                  Authorization for Credit Card Transactions
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6 space-y-6">
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <p>
                {lang === "pt"
                  ? "O G-1450 autoriza a USCIS a cobrar a taxa de solicitação diretamente no seu cartão de crédito."
                  : "G-1450 authorizes USCIS to charge the filing fee directly to your credit card."}
              </p>
            </div>

            {/* Applicant Info */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold border-b pb-2">Applicant Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Last Name / Sobrenome *</Label>
                  <Input {...register!("g1450_last_name" as any)} placeholder="Smith" />
                </div>
                <div className="space-y-2">
                  <Label>First Name / Nome *</Label>
                  <Input {...register!("g1450_first_name" as any)} placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label>Middle Name (opcional)</Label>
                  <Input {...register!("g1450_middle_name" as any)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date of Birth *</Label>
                  <Input type="date" {...register!("g1450_dob" as any)} />
                </div>
                <div className="space-y-2">
                  <Label>A-Number (se houver)</Label>
                  <Input {...register!("g1450_alien_number" as any)} placeholder="A-" />
                </div>
              </div>
            </div>

            {/* Card Info */}
            <div className="space-y-3 border-t pt-4">
              <h4 className="text-sm font-bold border-b pb-2">Credit Card Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Card Type / Bandeira *</Label>
                  <Select onValueChange={(v) => setValue!("g1450_card_type" as any, v)}>
                    <SelectTrigger>
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
                  <Label>Cardholder Name (como no cartão) *</Label>
                  <Input {...register!("g1450_cardholder_name" as any)} placeholder="JOHN D SMITH" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-1">
                  <Label>Card Number *</Label>
                  <Input {...register!("g1450_card_number" as any)} placeholder="XXXX XXXX XXXX XXXX" maxLength={19} />
                </div>
                <div className="space-y-2">
                  <Label>Expiration Date *</Label>
                  <Input {...register!("g1450_expiration_date" as any)} placeholder="MM/YYYY" maxLength={7} />
                </div>
                <div className="space-y-2">
                  <Label>CVV *</Label>
                  <Input {...register!("g1450_cvv" as any)} placeholder="123" maxLength={4} type="password" />
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="space-y-3 border-t pt-4">
              <h4 className="text-sm font-bold border-b pb-2">Billing Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Street Address *</Label>
                  <Input {...register!("g1450_billing_street" as any)} />
                </div>
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input {...register!("g1450_billing_city" as any)} />
                </div>
                <div className="space-y-2">
                  <Label>State *</Label>
                  <Input {...register!("g1450_billing_state" as any)} placeholder="Ex: NY" />
                </div>
                <div className="space-y-2">
                  <Label>ZIP Code *</Label>
                  <Input {...register!("g1450_billing_zip" as any)} />
                </div>
                <div className="space-y-2">
                  <Label>Country *</Label>
                  <Input {...register!("g1450_billing_country" as any)} defaultValue="United States" />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>

      {/* Generate Button */}
      <div className={cn(
        "rounded-2xl border p-6 shadow-sm overflow-hidden relative transition-all",
        isGenerated
          ? "border-green-300 bg-green-50"
          : "border-accent/40 bg-accent/5"
      )}>
        <div className="absolute -right-10 -top-10 opacity-5">
          <FileCheck className="h-40 w-40 text-accent" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="space-y-2 flex-1">
            {isGenerated ? (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-bold text-green-700">
                    {lang === "pt" ? "Formulários Gerados!" : "Forms Generated!"}
                  </h3>
                </div>
                <p className="text-sm text-green-600">
                  {lang === "pt"
                    ? "G-1145 e G-1450 foram gerados com sucesso. Clique em Próximo para concluir."
                    : "G-1145 and G-1450 were generated successfully. Click Next to continue."}
                </p>
                {pdfUrls && (
                  <div className="flex gap-3 mt-2 flex-wrap">
                    <a href={pdfUrls.g1145} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 underline underline-offset-2">
                      <Download className="h-4 w-4" /> Baixar G-1145
                    </a>
                    <a href={pdfUrls.g1450} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 underline underline-offset-2">
                      <Download className="h-4 w-4" /> Baixar G-1450
                    </a>
                  </div>
                )}
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-accent">
                  {lang === "pt" ? "Gerar Formulários G-1145 e G-1450" : "Generate Forms G-1145 and G-1450"}
                </h3>
                <p className="text-sm text-foreground/80">
                  {lang === "pt"
                    ? "Confira todos os dados antes de prosseguir. Nosso sistema preencherá ambos os formulários automaticamente."
                    : "Review all information before proceeding. Our system will fill both forms automatically."}
                </p>
              </>
            )}
          </div>

          {!isGenerated && (
            <Button
              className="w-full md:w-auto h-14 px-8 gap-3 font-bold text-sm uppercase tracking-widest shadow-lg shadow-accent/20"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Gerando...</>
              ) : (
                <><Send className="h-5 w-5" /> Gerar G-1145 e G-1450</>
              )}
            </Button>
          )}
        </div>
      </div>

    </div>
  );
};
