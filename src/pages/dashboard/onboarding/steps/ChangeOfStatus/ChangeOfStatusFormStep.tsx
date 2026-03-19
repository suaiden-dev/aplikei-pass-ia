import React from "react";
import { OnboardingData } from "@/domain/onboarding/OnboardingEntities";
import { Input } from "@/presentation/components/atoms/input";
import { Label } from "@/presentation/components/atoms/label";
import { RadioGroup, RadioGroupItem } from "@/presentation/components/atoms/radio-group";
import { DocumentStepProps } from "../../types";
import { Button } from "@/presentation/components/atoms/button";
import { Upload, X, FileText, CheckCircle2, Loader2, Info } from "lucide-react";
import { Checkbox } from "@/presentation/components/atoms/checkbox";
import { cn } from "@/lib/utils";

export const ChangeOfStatusFormStep = ({
  register,
  watch,
  setValue,
  lang,
  t,
  uploadedDocs,
  handleUpload,
  handleRemove,
  uploading,
  fileInputRef,
  setSelectedDoc,
}: DocumentStepProps) => {
  const cos = t.changeOfStatus;
  
  const courseApplyingIn = watch("courseApplyingIn");
  const paidFormI531 = watch("paidFormI531");
  const hasSponsor = watch("hasSponsor");

  const terms = [
    { id: "agreedVisaExtension", label: cos.fieldExtensionReview[lang], notice: cos.extensionReviewNotice[lang] },
    { id: "agreedSevisFees", label: "I-901 Sevis Fees", notice: cos.terms.sevisFees[lang] },
    { id: "agreedMailingAddress", label: "Mailing Address", notice: cos.terms.mailingAddress[lang] },
    { id: "agreedAcknowledgement", label: "Acknowledgement", notice: cos.terms.acknowledgement[lang] },
  ];


  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-1.5 border-b border-border pb-4">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
          {cos.formTitle[lang]}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lang === "pt" ? "Preencha todos os campos obrigatórios para sua aplicação de troca de status." : "Fill in all required fields for your change of status application."}
        </p>
      </div>

      {/* Dados Pessoais Mockup (Simplified for MVP based on screenshot) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">{lang === "pt" ? "Nome" : "First Name"} *</Label>
          <Input id="firstName" {...register("firstName")} placeholder="John" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">{lang === "pt" ? "Sobrenome" : "Last Name"} *</Label>
          <Input id="lastName" {...register("lastName")} placeholder="Doe" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" {...register("email")} placeholder="john@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mobilePhone">{lang === "pt" ? "Telefone" : "Phone"} *</Label>
          <Input id="mobilePhone" {...register("mobilePhone")} placeholder="+1 (000) 000-0000" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="birthDate">{lang === "pt" ? "Data de Nascimento" : "Date of Birth"} *</Label>
          <Input id="birthDate" type="date" {...register("birthDate")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maternalGrandmotherName">{lang === "pt" ? "Nome da avó materna" : "Maternal Grandmother's Name"} *</Label>
          <Input id="maternalGrandmotherName" {...register("maternalGrandmotherName")} placeholder={lang === "pt" ? "Ex: Maria" : "E.g. Mary"} />
        </div>
      </div>

      {/* Specific Questions */}
      <div className="space-y-6 rounded-2xl border border-border bg-muted/30 p-6 shadow-sm">
        <div className="space-y-3">
          <Label className="text-base font-bold">{cos.fieldCourse[lang]} *</Label>
          <RadioGroup
            onValueChange={(val) => setValue("courseApplyingIn", val)}
            value={courseApplyingIn}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {["ESL - English as Second Language", "Bachelor Theology", "Master Theology", "Other"].map((option) => (
              <div key={option} className="flex items-center space-x-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-accent/5">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option} className="flex-1 cursor-pointer text-sm font-medium">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-bold">{cos.fieldPaidSevis[lang]} *</Label>
          <RadioGroup
            onValueChange={(val) => setValue("paidFormI531", val)}
            value={paidFormI531}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="sevis-yes" />
              <Label htmlFor="sevis-yes">{lang === "pt" ? "Sim" : "Yes"}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="sevis-no" />
              <Label htmlFor="sevis-no">{lang === "pt" ? "Não" : "No"}</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-bold">{cos.fieldHasSponsor[lang]} *</Label>
          <RadioGroup
            onValueChange={(val) => setValue("hasSponsor", val)}
            value={hasSponsor}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="sponsor-yes" />
              <Label htmlFor="sponsor-yes">{lang === "pt" ? "Sim" : "Yes"}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="sponsor-no" />
              <Label htmlFor="sponsor-no">{lang === "pt" ? "Não" : "No"}</Label>
            </div>
          </RadioGroup>
        </div>
      </div>



      {/* Terms and Agreements */}
      <div className="space-y-6">
        <h3 className="font-display text-lg font-bold flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          {lang === "pt" ? "Acordos e Termos" : "Agreements and Terms"}
        </h3>
        <div className="space-y-4">
          {terms.map((term) => (
            <div key={term.id} className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id={term.id}
                  checked={!!watch(term.id as keyof OnboardingData)}
                  onCheckedChange={(checked) => setValue && setValue(term.id as keyof OnboardingData, checked as boolean)}
                  className="mt-1"
                />
                <div className="space-y-2">
                  <Label htmlFor={term.id} className="text-sm font-bold leading-none cursor-pointer text-primary">
                    {term.label} *
                  </Label>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    {term.notice}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2 border-t border-border pt-6">
        <Label htmlFor="appliedBy" className="font-bold">{cos.fieldAppliedBy[lang]}</Label>
        <Input id="appliedBy" {...register("appliedBy")} placeholder="Advisor name" />
        <p className="text-xs text-muted-foreground">{cos.fieldAppliedByDesc[lang]}</p>
      </div>
    </div>
  );
};
