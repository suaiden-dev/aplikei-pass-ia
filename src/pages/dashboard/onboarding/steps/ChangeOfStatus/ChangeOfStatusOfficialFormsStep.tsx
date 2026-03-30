import React, { useState } from "react";
import { DocumentStepProps } from "../../types";
import { Label } from "@/presentation/components/atoms/label";
import { Input } from "@/presentation/components/atoms/input";
import { Button } from "@/presentation/components/atoms/button";
import { Checkbox } from "@/presentation/components/atoms/checkbox";
import { RadioGroup, RadioGroupItem } from "@/presentation/components/atoms/radio-group";
import { 
  FileEdit, CheckCircle2, Loader2, Download, Send, Globe, ShieldAlert, Contact
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/presentation/components/atoms/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/presentation/components/atoms/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const ChangeOfStatusOfficialFormsStep = ({
  formData,
  register,
  watch,
  setValue,
  serviceId
}: DocumentStepProps & { serviceId?: string }) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateI539 = async () => {
    if (!serviceId) {
      toast({ title: "Erro", description: "ID do serviço não encontrado.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('fill-i539', {
        body: { formData, userServiceId: serviceId }
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      toast({
        title: "I-539 Gerado com Sucesso!",
        description: "O formulário preenchido já está disponível na sua lista de documentos.",
      });

      console.log("PDF Gerado:", data?.fileName);
      
    } catch (error: any) {
      console.error("Error generating I-539:", error);
      toast({
        title: "Erro na Geração",
        description: error.message || "Não foi possível gerar o PDF.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const isMailingSameAsPhysical = watch!("i539_is_mailing_same_as_physical" as any);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-1.5 border-b border-border pb-4">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <FileEdit className="h-6 w-6 text-primary" />
          Preenchimento Oficial I-539 Completo
        </h2>
        <p className="text-sm text-muted-foreground">
          Preencha todos os campos requeridos. Eles serão mapeados integralmente para o documento I-539 (Partes 1 a 7).
        </p>
      </div>

      <Accordion type="multiple" defaultValue={["part1"]} className="w-full space-y-4">
        
        {/* PARTE 1 - INFORMAÇÕES PESSOAIS */}
        <AccordionItem value="part1" className="bg-card rounded-2xl border px-4 shadow-sm">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">1</div>
              <div className="text-left">
                <p className="font-bold">Part 1 - Information About You</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Dados Pessoais & Endereço</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6 space-y-8">
            {/* Nomes */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold border-b pb-2">Full Legal Name</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Family Name (Sobrenome)</Label><Input {...register!("i539_family_name" as any)} /></div>
                <div className="space-y-2"><Label>Given Name (Primeiro Nome)</Label><Input {...register!("i539_given_name" as any)} /></div>
                <div className="space-y-2"><Label>Middle Name</Label><Input {...register!("i539_middle_name" as any)} /></div>
              </div>
            </div>

            {/* Identificadores */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="text-sm font-bold border-b pb-2">Identifiers</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>A-Number (if any)</Label><Input {...register!("i539_alien_reg_number" as any)} placeholder="A-" /></div>
                <div className="space-y-2"><Label>USCIS Online Account Number</Label><Input {...register!("i539_uscis_online_account_number" as any)} /></div>
                <div className="space-y-2"><Label>SSN (if any)</Label><Input {...register!("i539_ssn" as any)} /></div>
              </div>
            </div>

            {/* Mailing Address */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="text-sm font-bold border-b pb-2">U.S. Mailing Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2"><Label>In Care Of Name (Aos cuidados de)</Label><Input {...register!("i539_mailing_in_care_of" as any)} /></div>
                <div className="space-y-2 md:col-span-2"><Label>Street Number and Name</Label><Input {...register!("i539_mailing_street" as any)} /></div>
                <div className="space-y-2"><Label>Apt / Ste / Flr Number</Label><Input {...register!("i539_mailing_apt_ste_flr" as any)} /></div>
                <div className="space-y-2"><Label>City or Town</Label><Input {...register!("i539_mailing_city" as any)} /></div>
                <div className="space-y-2"><Label>State</Label><Input {...register!("i539_mailing_state" as any)} /></div>
                <div className="space-y-2"><Label>ZIP Code</Label><Input {...register!("i539_mailing_zip" as any)} /></div>
              </div>
            </div>

            {/* Endereço Físico */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center gap-2 bg-accent/5 p-3 rounded-lg border border-accent/20">
                <Checkbox 
                  id="sameAddress" 
                  checked={isMailingSameAsPhysical}
                  onCheckedChange={(val) => setValue!("i539_is_mailing_same_as_physical" as any, !!val)}
                />
                <Label htmlFor="sameAddress" className="cursor-pointer font-medium">My mailing address is the same as my physical address</Label>
              </div>
              
              {!isMailingSameAsPhysical && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 opacity-90">
                  <div className="space-y-2 md:col-span-2"><Label>Physical: Street Number and Name</Label><Input {...register!("i539_physical_street" as any)} /></div>
                  <div className="space-y-2"><Label>Apt / Ste / Flr Number</Label><Input {...register!("i539_physical_apt" as any)} /></div>
                  <div className="space-y-2"><Label>City or Town</Label><Input {...register!("i539_physical_city" as any)} /></div>
                  <div className="space-y-2"><Label>State</Label><Input {...register!("i539_physical_state" as any)} /></div>
                  <div className="space-y-2"><Label>ZIP Code</Label><Input {...register!("i539_physical_zip" as any)} /></div>
                </div>
              )}
            </div>

            {/* Outras e Ultima Entrada */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="text-sm font-bold border-b pb-2">Other Information & Last Arrival</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Country of Birth</Label><Input {...register!("i539_country_of_birth" as any)} /></div>
                <div className="space-y-2"><Label>Country of Citizenship</Label><Input {...register!("i539_country_of_citizenship" as any)} /></div>
                <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" {...register!("i539_date_of_birth" as any)} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2"><Label>Date of Last Arrival</Label><Input type="date" {...register!("i539_last_arrival_date" as any)} /></div>
                <div className="space-y-2"><Label>I-94 Record Number</Label><Input {...register!("i539_i94_number" as any)} /></div>
                <div className="space-y-2"><Label>Passport Number</Label><Input {...register!("i539_passport_number" as any)} /></div>
                <div className="space-y-2"><Label>Travel Document Number</Label><Input {...register!("i539_travel_document_number" as any)} /></div>
                <div className="space-y-2"><Label>Country of Issuance</Label><Input {...register!("i539_country_passport_issuance" as any)} /></div>
                <div className="space-y-2"><Label>Passport Expiration</Label><Input type="date" {...register!("i539_passport_expiration_date" as any)} /></div>
                <div className="space-y-2"><Label>Current Status (Ex: B2)</Label><Input {...register!("i539_current_nonimmigrant_status" as any)} /></div>
                <div className="space-y-2"><Label>Status Expiration</Label><Input type="date" {...register!("i539_status_expiration_date" as any)} /></div>
                <div className="space-y-2 flex items-end pb-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id="ds" onCheckedChange={(v) => setValue!("i539_granted_duration_of_status" as any, !!v)} />
                    <Label htmlFor="ds" className="cursor-pointer">Granted D/S (Duration of Status)</Label>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* PARTE 2 e 3 - SOLICITAÇÃO */}
        <AccordionItem value="part2" className="bg-card rounded-2xl border px-4 shadow-sm">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">2</div>
              <div className="text-left">
                <p className="font-bold">Part 2 & 3 - Application & Processing</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Informações do Pedido</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="font-bold">I am applying for:</Label>
                <RadioGroup onValueChange={(v) => setValue!("i539_application_type" as any, v)}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="reinstatement" id="app1" /><Label htmlFor="app1">Reinstatement to student status</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="extension" id="app2" /><Label htmlFor="app2">Extension of stay</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="change" id="app3" /><Label htmlFor="app3">Change of status</Label></div>
                </RadioGroup>
              </div>
              <div className="space-y-4">
                <div className="space-y-2"><Label>New Status Requested (Ex: F1)</Label><Input {...register!("i539_change_status_to" as any)} /></div>
                <div className="space-y-2"><Label>To be effective (Date)</Label><Input type="date" {...register!("i539_effective_date_requested" as any)} /></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
              <div className="space-y-3">
                <Label className="font-bold">Number of people included:</Label>
                <RadioGroup onValueChange={(v) => setValue!("i539_number_of_applicants" as any, v)}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="only_me" id="num1" /><Label htmlFor="num1">I am the only applicant</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="family" id="num2" /><Label htmlFor="num2">Myself and members of my family</Label></div>
                </RadioGroup>
              </div>
              <div className="space-y-2 mt-4 md:mt-0">
                <Label>Total Number of People</Label>
                <Input type="number" {...register!("i539_total_people" as any)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-2"><Label>School Name (if student)</Label><Input {...register!("i539_school_name" as any)} /></div>
              <div className="space-y-2"><Label>SEVIS ID Number</Label><Input {...register!("i539_sevis_id" as any)} /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-2"><Label>Extend until (Date)</Label><Input type="date" {...register!("i539_extended_until_date" as any)} /></div>
              <div className="space-y-2 pt-6">
                <div className="flex items-center gap-2"><Checkbox id="prior" onCheckedChange={(v) => setValue!("i539_is_based_on_prior_approval" as any, !!v)} /><Label htmlFor="prior">Based on prior approval given to spouse/parent?</Label></div>
                <div className="flex items-center gap-2 mt-2"><Checkbox id="pend" onCheckedChange={(v) => setValue!("i539_is_based_on_pending_petition" as any, !!v)} /><Label htmlFor="pend">Based on a pending petition?</Label></div>
              </div>
              <div className="space-y-2 md:col-span-2"><Label>USCIS Receipt Number (if pending petition)</Label><Input {...register!("i539_uscis_receipt_number" as any)} /></div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* PARTE 4 - SEGURANÇA */}
        <AccordionItem value="part4" className="bg-card rounded-2xl border px-4 shadow-sm">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="font-bold">Part 4 - Additional Information</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Histórico e Segurança</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="max-w-[70%]">Are you an applicant for an immigrant visa?</Label>
                <RadioGroup onValueChange={(v) => setValue!("i539_immigrant_visa_applicant" as any, v)} className="flex items-center gap-4">
                  <div className="flex items-center gap-2"><RadioGroupItem value="yes" id="q1y"/><Label htmlFor="q1y">Yes</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="no" id="q1n"/><Label htmlFor="q1n">No</Label></div>
                </RadioGroup>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="max-w-[70%]">Has an immigrant petition EVER been filed for you?</Label>
                <RadioGroup onValueChange={(v) => setValue!("i539_immigrant_petition_filed" as any, v)} className="flex items-center gap-4">
                  <div className="flex items-center gap-2"><RadioGroupItem value="yes" id="q2y"/><Label htmlFor="q2y">Yes</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="no" id="q2n"/><Label htmlFor="q2n">No</Label></div>
                </RadioGroup>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="max-w-[70%]">Have you EVER filed Form I-485?</Label>
                <RadioGroup onValueChange={(v) => setValue!("i539_filed_i485" as any, v)} className="flex items-center gap-4">
                  <div className="flex items-center gap-2"><RadioGroupItem value="yes" id="q3y"/><Label htmlFor="q3y">Yes</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="no" id="q3n"/><Label htmlFor="q3n">No</Label></div>
                </RadioGroup>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <Label className="max-w-[70%]">Have you been arrested or convicted of any criminal offense?</Label>
                <RadioGroup onValueChange={(v) => setValue!("i539_criminal_history" as any, v)} className="flex items-center gap-4">
                  <div className="flex items-center gap-2"><RadioGroupItem value="yes" id="q4y"/><Label htmlFor="q4y">Yes</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="no" id="q4n"/><Label htmlFor="q4n">No</Label></div>
                </RadioGroup>
              </div>

              <div className="pt-4 space-y-4">
                <h4 className="text-sm font-bold opacity-80 uppercase tracking-widest">General Security Questions (7.a to 15)</h4>
                {[
                  { id: "q7a", name: "i539_q7a", label: "7.a. Acts involving torture or genocide?" },
                  { id: "q7b", name: "i539_q7b", label: "7.b. Killing any person?" },
                  { id: "q8a", name: "i539_q8a", label: "8.a. Served in military unit, paramilitary unit, rebel group?" },
                  { id: "q8b", name: "i539_q8b", label: "8.b. Worked/volunteered in prison, jail, detention facility?" },
                  { id: "q10", name: "i539_q10", label: "10. Sold/provided weapons or assisted in selling weapons?" },
                  { id: "q11", name: "i539_q11", label: "11. Received weapons/military training?" },
                  { id: "q12", name: "i539_q12", label: "12. Violated the terms of the nonimmigrant status?" },
                  { id: "q13", name: "i539_q13", label: "13. Are you now in removal proceedings?" },
                  { id: "q14", name: "i539_q14", label: "14. Have you EVER been employed in the US since last admitted?" }
                ].map((q) => (
                  <div key={q.id} className="flex items-center justify-between py-2 border-b border-dashed">
                    <Label className="max-w-[70%] font-normal">{q.label}</Label>
                    <RadioGroup onValueChange={(v) => setValue!(q.name as any, v)} className="flex items-center gap-4">
                      <div className="flex items-center gap-2"><RadioGroupItem value="yes" id={`${q.id}y`}/><Label htmlFor={`${q.id}y`}>Yes</Label></div>
                      <div className="flex items-center gap-2"><RadioGroupItem value="no" id={`${q.id}n`}/><Label htmlFor={`${q.id}n`}>No</Label></div>
                    </RadioGroup>
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* PARTE 5 a 7 - CONTATO */}
        <AccordionItem value="part5" className="bg-card rounded-2xl border px-4 shadow-sm">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                <Contact className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="font-bold">Part 5, 6 & 7 - Contact & Signatures</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Informações de Contato</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6 space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-bold border-b pb-2">Applicant's Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Daytime Telephone</Label><Input type="tel" {...register!("i539_applicant_phone" as any)} /></div>
                <div className="space-y-2"><Label>Mobile Telephone</Label><Input type="tel" {...register!("i539_applicant_mobile" as any)} /></div>
                <div className="space-y-2"><Label>Email Address</Label><Input type="email" {...register!("i539_applicant_email" as any)} /></div>
              </div>
            </div>
            
            <div className="space-y-4 border-t pt-4">
              <h4 className="text-sm font-bold border-b pb-2">Interpreter & Preparer (If Applicable)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Interpreter's Full Name</Label><Input {...register!("i539_interpreter_info" as any)} placeholder="Deixe em branco se não aplicável" /></div>
                <div className="space-y-2"><Label>Preparer's Full Name</Label><Input {...register!("i539_preparer_info" as any)} placeholder="Deixe em branco se não aplicável" /></div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>

      <Card className="border-accent/40 bg-accent/5 p-6 shadow-sm overflow-hidden relative">
        <div className="absolute -right-10 -top-10 opacity-5">
          <FileEdit className="h-40 w-40 text-accent" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="space-y-2 flex-1">
            <h3 className="text-lg font-bold text-accent">Gerar Documento Final I-539</h3>
            <p className="text-sm text-foreground/80">
              Confira todos os dados antes de prosseguir. Ao "Gerar", nosso sistema preencherá o formulário I-539 da USCIS automaticamente com as informações acima, poupando horas de digitação.
            </p>
          </div>
          <Button 
            className="w-full md:w-auto h-14 px-8 gap-3 font-bold text-sm uppercase tracking-widest shadow-lg shadow-accent/20"
            onClick={handleGenerateI539}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Processando...</>
            ) : (
              <><Send className="h-5 w-5" /> Gerar I-539 Oficial</>
            )}
          </Button>
        </div>
      </Card>
      
    </div>
  );
};
