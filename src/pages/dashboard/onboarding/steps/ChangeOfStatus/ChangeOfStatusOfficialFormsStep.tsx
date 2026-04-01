import React, { useState } from "react";
import { 
  FormInput, 
  FormCheckbox,
  FormRadioGroup
} from "@/presentation/components/atoms/form/FormFields";
import { Label } from "@/presentation/components/atoms/label";
import { Button } from "@/presentation/components/atoms/button";
import {
  FileEdit, CheckCircle2, Loader2, Download, Send, ShieldAlert, Contact, Info, Zap, Sparkles, ChevronRight, FileText, Lock
} from "lucide-react";
import { Card } from "@/presentation/components/atoms/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/presentation/components/atoms/accordion";
import { DocumentStepProps } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { fillI539Form } from "@/application/use-cases/FillI539Form";
import { I539FormData } from "@/domain/entities/I539FormData";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const TEMPLATE_URL = import.meta.env.VITE_I539_TEMPLATE_URL as string;

/** Converte YYYY-MM-DD (input type=date) para MM/DD/YYYY (USCIS PDF) */
function toUSDate(v: string | undefined): string | undefined {
  if (!v) return undefined;
  const [y, m, d] = v.split("-");
  if (!y || !m || !d) return v;
  return `${m}/${d}/${y}`;
}

function yesNo(v: string | undefined): { yes: boolean; no: boolean } {
  return { yes: v === "yes", no: v === "no" };
}

async function uploadBytes(bucket: string, storagePath: string, bytes: Uint8Array): Promise<void> {
  const blob = new Blob([bytes.buffer as any], { type: "application/pdf" });
  const { error } = await supabase.storage.from(bucket).upload(storagePath, blob, {
    contentType: "application/pdf",
    upsert: true,
  });
  if (error) throw new Error(`Upload falhou: ${error.message}`);
}

export const ChangeOfStatusOfficialFormsStep = ({
  register,
  watch,
  setValue,
  serviceId
}: DocumentStepProps & { serviceId?: string }) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleGenerateI539 = async () => {
    if (!serviceId) {
      toast({ title: "Erro", description: "ID do serviço não encontrado.", variant: "destructive" });
      return;
    }
    if (!TEMPLATE_URL) {
      toast({ title: "Erro de Configuração", description: "VITE_I539_TEMPLATE_URL não está definido no .env.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const v = (watch!() as unknown) as Record<string, string | boolean | undefined>;

      const i539Data: I539FormData = {
        // Part 1 — Identifiers
        familyName:              v.i539_family_name as string,
        givenName:               v.i539_given_name as string,
        middleName:              v.i539_middle_name as string,
        alienNumber:             v.i539_alien_reg_number as string,
        uscisOnlineAccountNumber: v.i539_uscis_online_account_number as string,
        ssn:                     v.i539_ssn as string,

        // Part 1 — Mailing address
        inCareOf:                v.i539_mailing_in_care_of as string,
        streetName:              v.i539_mailing_street as string,
        aptNumber:               v.i539_mailing_apt_ste_flr as string,
        city:                    v.i539_mailing_city as string,
        state:                   v.i539_mailing_state as string,
        zipCode:                 v.i539_mailing_zip as string,
        hasSeparateMailingAddress: !(v.i539_is_mailing_same_as_physical as boolean),

        // Part 1 — Personal info
        dateOfBirth:             toUSDate(v.i539_date_of_birth as string),
        countryOfBirth:          v.i539_country_of_birth as string,
        countryOfCitizenship:    v.i539_country_of_citizenship as string,

        // Part 1 — Travel & status
        dateOfLastArrival:       toUSDate(v.i539_last_arrival_date as string),
        i94Number:               v.i539_i94_number as string,
        passportNumber:          v.i539_passport_number as string,
        passportCountry:         v.i539_travel_document_number as string,
        passportIssuingCountry:  v.i539_country_passport_issuance as string,
        passportExpirationDate:  toUSDate(v.i539_passport_expiration_date as string),
        currentImmigrationStatus: v.i539_current_nonimmigrant_status as string,
        statusExpirationDate:    toUSDate(v.i539_status_expiration_date as string),
        statusExpiresDS:         !!(v.i539_granted_duration_of_status as boolean),

        // Part 2 — Application type
        applicationType:
          (v.i539_application_type as string) === "extension" ? "extend"
          : (v.i539_application_type as string) === "change"    ? "change"
          : undefined,
        newStatusRequested:      v.i539_change_status_to as string,
        requestedEffectiveDate:  toUSDate(v.i539_effective_date_requested as string),
        includeSelf:             true,
        includeSpouse:           (v.i539_number_of_applicants as string) === "family",
        includeChildren:         (v.i539_number_of_applicants as string) === "family",
        totalCoApplicants:       v.i539_total_people as string,
        previouslyExtended:      !!(v.i539_is_based_on_prior_approval as boolean),

        // Part 4 — Security questions
        q6Yes:  yesNo(v.i539_immigrant_visa_applicant  as string).yes,
        q6No:   yesNo(v.i539_immigrant_visa_applicant  as string).no,
        q7Yes:  yesNo(v.i539_immigrant_petition_filed  as string).yes,
        q7No:   yesNo(v.i539_immigrant_petition_filed  as string).no,
        q8Yes:  yesNo(v.i539_filed_i485                as string).yes,
        q8No:   yesNo(v.i539_filed_i485                as string).no,
        q9Yes:  yesNo(v.i539_criminal_history           as string).yes,
        q9No:   yesNo(v.i539_criminal_history           as string).no,
        q10Yes: yesNo(v.i539_q7a  as string).yes,
        q10No:  yesNo(v.i539_q7a  as string).no,
        q11Yes: yesNo(v.i539_q7b  as string).yes,
        q11No:  yesNo(v.i539_q7b  as string).no,
        q12Yes: yesNo(v.i539_q8a  as string).yes,
        q12No:  yesNo(v.i539_q8a  as string).no,
        q13Yes: yesNo(v.i539_q8b  as string).yes,
        q13No:  yesNo(v.i539_q8b  as string).no,
        q14Yes: yesNo(v.i539_q10  as string).yes,
        q14No:  yesNo(v.i539_q10  as string).no,
        q15Yes: yesNo(v.i539_q11  as string).yes,
        q15No:  yesNo(v.i539_q11  as string).no,
        q16Yes: yesNo(v.i539_q12  as string).yes,
        q16No:  yesNo(v.i539_q12  as string).no,
        q17Yes: yesNo(v.i539_q13  as string).yes,
        q17No:  yesNo(v.i539_q13  as string).no,
        q18Yes: yesNo(v.i539_q14  as string).yes,
        q18No:  yesNo(v.i539_q14  as string).no,

        // Part 5 — Contact
        daytimePhone:     v.i539_applicant_phone  as string,
        mobilePhone:      v.i539_applicant_mobile as string,
        email:            v.i539_applicant_email  as string,
        signatureDate:    new Date().toLocaleDateString("en-US"),
      };

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado.");

      const result = await fillI539Form(i539Data, serviceId, {
        templateUrl: TEMPLATE_URL,
        bucket: "process-documents",
        uploadBytes,
      });

      await supabase.from("documents").upsert({
        user_id: user.id,
        user_service_id: serviceId,
        name: "i539_oficial",
        storage_path: result.storagePath,
        bucket_id: "process-documents",
        status: "pending",
        created_at: new Date().toISOString(),
      }, { onConflict: "user_id,name" });

      const { data: signedData, error: signedError } = await supabase.storage
        .from("process-documents")
        .createSignedUrl(result.storagePath, 60 * 60);
      if (signedError) throw signedError;

      setPdfUrl(signedData.signedUrl);
      toast({
        title: "I-539 Gerado com Sucesso!",
        description: "O PDF preenchido está pronto para download.",
      });

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Não foi possível gerar o PDF.";
      console.error("Error generating I-539:", err);
      toast({ title: "Erro na Geração", description: msg, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const isMailingSameAsPhysical = !!watch!("i539_is_mailing_same_as_physical" as any);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-10"
    >
      <div className="flex flex-col space-y-1.5 border-b border-border/50 pb-6">
        <h2 className="font-display text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <FileEdit className="h-8 w-8 text-primary shrink-0" />
          Preenchimento Oficial I-539
        </h2>
        <p className="text-muted-foreground font-medium">
          Preencha todos os campos requeridos. Eles serão mapeados integralmente para o documento oficial I-539 da USCIS.
        </p>
      </div>

      <Accordion type="multiple" defaultValue={["part1"]} className="w-full space-y-6">
        
        {/* PARTE 1 - INFORMAÇÕES PESSOAIS */}
        <AccordionItem value="part1" className="bg-card/10 backdrop-blur-sm rounded-[2rem] border border-border/50 px-6 shadow-xl overflow-hidden group">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
                <span className="font-display text-xl font-black text-primary">01</span>
              </div>
              <div className="text-left">
                <p className="font-display text-xl font-bold text-foreground">Part 1 - Information About You</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60">Dados Pessoais & Endereço</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-8 space-y-10">
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-border pb-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Full Legal Name</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormInput label="Family Name (Sobrenome)" {...register!("i539_family_name" as any)} className="h-12 rounded-xl" />
                <FormInput label="Given Name (Primeiro Nome)" {...register!("i539_given_name" as any)} className="h-12 rounded-xl" />
                <FormInput label="Middle Name" {...register!("i539_middle_name" as any)} className="h-12 rounded-xl" />
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-3 border-b border-border pb-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Identifiers</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormInput label="A-Number (if any)" placeholder="A-" {...register!("i539_alien_reg_number" as any)} className="h-12 rounded-xl" />
                <FormInput label="USCIS Account Number" {...register!("i539_uscis_online_account_number" as any)} className="h-12 rounded-xl" />
                <FormInput label="SSN (if any)" {...register!("i539_ssn" as any)} className="h-12 rounded-xl" />
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-3 border-b border-border pb-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <h4 className="text-sm font-black uppercase tracking-widest text-foreground">U.S. Mailing Address</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput className={cn("h-12 rounded-xl md:col-span-2")} label="In Care Of Name" {...register!("i539_mailing_in_care_of" as any)} />
                <FormInput className={cn("h-12 rounded-xl md:col-span-2")} label="Street Number and Name" {...register!("i539_mailing_street" as any)} />
                <FormInput label="Apt / Ste / Flr Number" {...register!("i539_mailing_apt_ste_flr" as any)} className="h-12 rounded-xl" />
                <FormInput label="City or Town" {...register!("i539_mailing_city" as any)} className="h-12 rounded-xl" />
                <FormInput label="State" {...register!("i539_mailing_state" as any)} className="h-12 rounded-xl" />
                <FormInput label="ZIP Code" {...register!("i539_mailing_zip" as any)} className="h-12 rounded-xl font-mono" />
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/20">
                <FormCheckbox 
                  id="sameAddress" 
                  label="My mailing address is the same as my physical address"
                  checked={isMailingSameAsPhysical}
                  onCheckedChange={(val) => setValue!("i539_is_mailing_same_as_physical" as any, !!val)}
                />
              </div>
              
              <AnimatePresence>
                {!isMailingSameAsPhysical && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <FormInput className={cn("h-12 rounded-xl md:col-span-2")} label="Physical: Street" {...register!("i539_physical_street" as any)} />
                      <FormInput label="Apt / Ste / Flr" {...register!("i539_physical_apt" as any)} className="h-12 rounded-xl" />
                      <FormInput label="City" {...register!("i539_physical_city" as any)} className="h-12 rounded-xl" />
                      <FormInput label="State" {...register!("i539_physical_state" as any)} className="h-12 rounded-xl" />
                      <FormInput label="ZIP Code" {...register!("i539_physical_zip" as any)} className="h-12 rounded-xl font-mono" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-3 border-b border-border pb-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Travel & Identification</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormInput label="Country of Birth" {...register!("i539_country_of_birth" as any)} className="h-12 rounded-xl" />
                <FormInput label="Citizenship" {...register!("i539_country_of_citizenship" as any)} className="h-12 rounded-xl" />
                <FormInput label="Date of Birth" type="date" {...register!("i539_date_of_birth" as any)} className="h-12 rounded-xl px-4" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <FormInput label="Last Arrival Date" type="date" {...register!("i539_last_arrival_date" as any)} className="h-12 rounded-xl px-4" />
                <FormInput label="I-94 Number" {...register!("i539_i94_number" as any)} className="h-12 rounded-xl font-mono" />
                <FormInput label="Passport Number" {...register!("i539_passport_number" as any)} className="h-12 rounded-xl" />
                <FormInput label="Travel Doc #" {...register!("i539_travel_document_number" as any)} className="h-12 rounded-xl" />
                <FormInput label="Country of Passport" {...register!("i539_country_passport_issuance" as any)} className="h-12 rounded-xl" />
                <FormInput label="Passport Exp." type="date" {...register!("i539_passport_expiration_date" as any)} className="h-12 rounded-xl px-4" />
                <FormInput label="Current Status (Ex: B2)" {...register!("i539_current_nonimmigrant_status" as any)} className="h-12 rounded-xl" />
                <FormInput label="Status Expiration" type="date" {...register!("i539_status_expiration_date" as any)} className="h-12 rounded-xl px-4" />
                <div className="flex items-end pb-4">
                  <FormCheckbox 
                    id="ds" 
                    label="Granted D/S (Duration of Status)"
                    onCheckedChange={(v) => setValue!("i539_granted_duration_of_status" as any, !!v)} 
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* PARTE 2 e 3 - SOLICITAÇÃO */}
        <AccordionItem value="part2" className="bg-card/10 backdrop-blur-sm rounded-[2rem] border border-border/50 px-6 shadow-xl overflow-hidden group">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center shadow-inner group-hover:-rotate-6 transition-transform">
                <span className="font-display text-xl font-black text-accent">02</span>
              </div>
              <div className="text-left">
                <p className="font-display text-xl font-bold text-foreground">Part 2 & 3 - Application Info</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60">Tipo de Pedido & Processamento</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <Label className="text-xs font-black uppercase tracking-widest opacity-60">I am applying for:</Label>
                <FormRadioGroup 
                  onValueChange={(v) => setValue!("i539_application_type" as any, v)}
                  options={[
                    { value: "reinstatement", id: "app1", label: "Reinstatement to student status" },
                    { value: "extension", id: "app2", label: "Extension of stay" },
                    { value: "change", id: "app3", label: "Change of status" },
                  ]}
                  className="space-y-3"
                />
              </div>
              <div className="space-y-6">
                <FormInput label="New Status Requested (Ex: F1)" {...register!("i539_change_status_to" as any)} className="h-12 rounded-xl" />
                <FormInput label="Effective Date Requested" type="date" {...register!("i539_effective_date_requested" as any)} className="h-12 rounded-xl px-4" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-border/50 pt-8">
              <div className="space-y-6">
                <Label className="text-xs font-black uppercase tracking-widest opacity-60">Number of people included:</Label>
                <FormRadioGroup 
                  onValueChange={(v) => setValue!("i539_number_of_applicants" as any, v)}
                  options={[
                    { value: "only_me", id: "num1", label: "I am the only applicant" },
                    { value: "family", id: "num2", label: "Myself and family members" },
                  ]}
                  className="space-y-3"
                />
              </div>
              <FormInput 
                label="Total Number of People"
                type="number" 
                {...register!("i539_total_people" as any)} 
                className="h-12 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-border/50 pt-8">
              <FormInput label="School Name (if student)" {...register!("i539_school_name" as any)} className="h-12 rounded-xl" />
              <FormInput label="SEVIS ID Number" {...register!("i539_sevis_id" as any)} className="h-12 rounded-xl font-mono" />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="part4" className="bg-card/10 backdrop-blur-sm rounded-[2rem] border border-border/50 px-6 shadow-xl overflow-hidden group">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-red-100 dark:bg-red-950/30 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-left">
                <p className="font-display text-xl font-bold text-foreground">Part 4 - Security Information</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60">Histórico & Segurança</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-8 space-y-10">
            <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl text-sm text-red-700 dark:text-red-300">
              <Info className="h-5 w-5 mt-0.5 shrink-0" />
              <p className="font-medium leading-relaxed">
                Responda com extrema honestidade. Informações falsas nestas seções podem acarretar em negações definitivas de visto.
              </p>
            </div>

            <div className="space-y-2 border-t border-border/50">
              {[
                { name: "i539_immigrant_visa_applicant", label: "Are you an applicant for an immigrant visa?", id: "q1" },
                { name: "i539_immigrant_petition_filed", label: "Has an immigrant petition EVER been filed for you?", id: "q2" },
                { name: "i539_filed_i485", label: "Have you EVER filed Form I-485?", id: "q3" },
                { name: "i539_criminal_history", label: "Have you been arrested or convicted of any criminal offense?", id: "q4" },
              ].map((q) => (
                <div key={q.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-6 border-b border-border/50 gap-4 group/row">
                  <Label className="sm:max-w-[65%] font-bold text-slate-700 dark:text-slate-300 group-hover/row:text-primary transition-colors">{q.label}</Label>
                  <FormRadioGroup 
                    onValueChange={(v) => setValue!(q.name as any, v)} 
                    className="flex items-center gap-6"
                    options={[
                      { value: "yes", id: `${q.id}y`, label: "Yes" },
                      { value: "no", id: `${q.id}n`, label: "No" },
                    ]}
                  />
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="part5" className="bg-card/10 backdrop-blur-sm rounded-[2rem] border border-border/50 px-6 shadow-xl overflow-hidden group">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform">
                <Contact className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <p className="font-display text-xl font-bold text-foreground">Part 5, 6 & 7 - Contact & Signatures</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60">Informações de Contato</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-8 space-y-10">
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-border pb-2">
                <div className="h-2 w-2 rounded-full bg-blue-600" />
                <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Applicant's Contact</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormInput label="Daytime Telephone" type="tel" {...register!("i539_applicant_phone" as any)} className="h-12 rounded-xl" />
                <FormInput label="Mobile Telephone" type="tel" {...register!("i539_applicant_mobile" as any)} className="h-12 rounded-xl" />
                <FormInput label="Email Address" type="email" {...register!("i539_applicant_email" as any)} className="h-12 rounded-xl" />
              </div>
            </div>
            
            <div className="space-y-6 pt-4 border-t border-border/50">
              <div className="flex items-center gap-3 border-b border-border pb-2">
                <div className="h-2 w-2 rounded-full bg-blue-600" />
                <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Interpreter & Preparer</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput label="Interpreter's Full Name" {...register!("i539_interpreter_info" as any)} placeholder="Se houver..." className="h-12 rounded-xl" />
                <FormInput label="Preparer's Full Name" {...register!("i539_preparer_info" as any)} placeholder="Se houver..." className="h-12 rounded-xl" />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className={cn(
        "rounded-[2.5rem] border-4 p-8 md:p-12 shadow-2xl overflow-hidden relative transition-all duration-700 group mt-10",
        pdfUrl
          ? "border-green-500 bg-green-50/50"
          : "border-primary/20 bg-primary/5"
      )}>
        <div className="absolute -right-20 -top-20 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
          <FileText className="h-64 w-64 text-primary" />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row gap-10 items-center justify-between">
          <div className="space-y-4 flex-1 text-center lg:text-left">
            <AnimatePresence mode="wait">
              {pdfUrl ? (
                <motion.div 
                  key="generated-content"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-center lg:justify-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center shadow-lg shadow-green-600/30">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-display text-3xl font-black text-green-700 tracking-tight leading-none">
                      I-539 Gerado!
                    </h3>
                  </div>
                  <p className="text-lg text-green-700/80 font-medium leading-relaxed max-w-xl">
                    O formulário oficial I-539 foi preenchido com sucesso com seus dados. Você pode baixá-lo agora para conferência.
                  </p>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-6">
                    <Button 
                      variant="outline" 
                      asChild 
                      className="bg-white border-green-200 text-green-700 hover:bg-green-50 h-14 px-8 rounded-2xl font-black uppercase text-xs tracking-widest gap-3 shadow-xl shadow-green-500/5 transition-all active:scale-95"
                    >
                      <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="h-5 w-5" /> Baixar I-539.pdf
                      </a>
                    </Button>
                  </div>
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
                    <h3 className="font-display text-3xl font-black text-primary tracking-tight leading-none uppercase">
                      Geração Automática
                    </h3>
                  </div>
                  <p className="text-lg text-foreground/70 font-medium leading-relaxed max-w-xl">
                    Finalize o preenchimento acima e clique em "Gerar" para criar o seu formulário I-539 oficial em segundos.
                  </p>
                  <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-black text-primary uppercase tracking-widest opacity-60">
                    <Zap className="h-3 w-3 fill-primary" /> Review all data before generating
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button
            className={cn(
              "w-full lg:w-auto h-24 px-12 gap-5 font-black uppercase text-sm tracking-[0.2em] shadow-2xl rounded-[2.5rem] transition-all active:scale-[0.98] group relative overflow-hidden",
              pdfUrl ? "bg-green-600 hover:bg-green-700 shadow-green-500/20" : "bg-primary hover:bg-primary/90 shadow-primary/20"
            )}
            onClick={handleGenerateI539}
            disabled={isGenerating}
          >
            <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
            {isGenerating ? (
              <><Loader2 className="h-6 w-6 animate-spin" /> Processando...</>
            ) : (
              <>
                <Send className="h-6 w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                {pdfUrl ? "Regerar Formulário" : "Gerar I-539 Oficial"}
              </>
            )}
          </Button>
        </div>

        <div className="mt-8 pt-8 border-t border-border/30 flex items-center justify-center lg:justify-start gap-4">
           <div className="flex items-center gap-2 bg-white/50 dark:bg-card/50 px-4 py-2 rounded-full border border-border/50">
             <Lock className="h-3.5 w-3.5 text-slate-400" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secure 256-bit AES Encryption</span>
           </div>
        </div>
      </div>
    </motion.div>
  );
};
