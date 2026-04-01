import { FormInput, FormRadioGroup, FormNativeSelect, FormTextarea } from "@/presentation/components/atoms/form/FormFields";
import { StepProps } from "../../types";
import { History, Calendar, FileText, BadgeCheck } from "lucide-react";

export const F1F2HistoryStep = ({
  register,
  watch,
  setValue,
  lang,
  t,
}: StepProps) => {
  const ds = t.ds160;
  const hasBeenToUS = watch("hasBeenToUS");
  const hasHadUSVisa = watch("hasHadUSVisa");
  const hasBeenDeniedVisa = watch("hasBeenDeniedVisa");
  const hasImmigrationPetition = watch("hasImmigrationPetition");
  const hasUSLicense = watch("hasUSDriverLicense");

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-1.5 border-b border-border/50 pb-4">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <History className="h-6 w-6 text-primary" />
          {t.f1f2.steps[lang][3]}
        </h2>
      </div>

      <div className="space-y-10">
        {/* Has Been to US */}
        <div className="space-y-6">
          <FormRadioGroup
            label={ds.previousTravel.beenToUS[lang]}
            value={hasBeenToUS}
            onValueChange={(val) => setValue("hasBeenToUS", val)}
            options={[
              { label: lang === "pt" ? "Sim" : "Yes", value: "yes" },
              { label: lang === "pt" ? "Não" : "No", value: "no" }
            ]}
            required
          />

          {hasBeenToUS === "yes" && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 p-6 bg-muted/20 rounded-3xl border border-border/50 animate-in slide-in-from-top-2 duration-300">
              <FormInput 
                label={lang === "pt" ? "Data de entrada:" : "Date of Entry:"} 
                type="date" 
                {...register("lastUSTravelDate")} 
                icon={<Calendar className="h-4 w-4" />}
                required 
              />
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {lang === "pt" ? "Duração da estadia:" : "Stay Duration:"} *
                </label>
                <div className="flex gap-2">
                  <FormInput type="number" {...register("lastUSTravelDurationValue")} className="flex-1" />
                  <FormNativeSelect
                    {...register("lastUSTravelDurationUnit")}
                    className="w-1/2"
                    options={[
                      { label: lang === "pt" ? "Dias" : "Days", value: "days" },
                      { label: lang === "pt" ? "Semanas" : "Weeks", value: "weeks" },
                      { label: lang === "pt" ? "Meses" : "Months", value: "months" },
                      { label: lang === "pt" ? "Anos" : "Years", value: "years" }
                    ]}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* US License */}
        <div className="space-y-6 pt-4 border-t border-border/50">
          <FormRadioGroup
            label={ds.previousTravel.hasUSLicense[lang]}
            value={hasUSLicense}
            onValueChange={(val) => setValue("hasUSDriverLicense", val)}
            options={[
              { label: lang === "pt" ? "Sim" : "Yes", value: "yes" },
              { label: lang === "pt" ? "Não" : "No", value: "no" }
            ]}
            required
          />

          {hasUSLicense === "yes" && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 p-6 bg-muted/20 rounded-3xl border border-border/50 animate-in slide-in-from-top-2 duration-300">
              <FormInput 
                label={lang === "pt" ? "Número da habilitação:" : "License Number:"} 
                {...register("usDriverLicenseNumber")} 
                required 
              />
              <FormInput 
                label={lang === "pt" ? "Estado emissor:" : "Issuing State:"} 
                {...register("usDriverLicenseState")} 
                required 
              />
            </div>
          )}
        </div>

        {/* Had US Visa */}
        <div className="space-y-6 pt-4 border-t border-border/50">
          <FormRadioGroup
            label={ds.previousTravel.hasUSVisa[lang]}
            value={hasHadUSVisa}
            onValueChange={(val) => setValue("hasHadUSVisa", val)}
            options={[
              { label: lang === "pt" ? "Sim" : "Yes", value: "yes" },
              { label: lang === "pt" ? "Não" : "No", value: "no" }
            ]}
            required
          />

          {hasHadUSVisa === "yes" && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 p-6 bg-muted/20 rounded-3xl border border-border/50 animate-in slide-in-from-top-2 duration-300">
              <FormInput 
                label={lang === "pt" ? "Data da emissão:" : "Issuance Date:"} 
                type="date" 
                {...register("lastVisaIssuanceDate")} 
                icon={<Calendar className="h-4 w-4" />}
                required 
              />
              <FormInput 
                label={lang === "pt" ? "Número do visto:" : "Visa Number:"} 
                {...register("lastVisaNumber")} 
                icon={<BadgeCheck className="h-4 w-4" />}
                required 
              />
            </div>
          )}
        </div>

        {/* Visa Cancelled */}
        <div className="space-y-6 pt-4 border-t border-border/50">
          <FormRadioGroup
            label={lang === "pt" ? "Seu visto já foi cancelado ou revogado?" : "Has your visa ever been cancelled or revoked?"}
            value={watch("hasVisaBeenCancelled")}
            onValueChange={(val) => setValue("hasVisaBeenCancelled", val)}
            options={[
              { label: lang === "pt" ? "Sim" : "Yes", value: "yes" },
              { label: lang === "pt" ? "Não" : "No", value: "no" }
            ]}
            required
          />
          {watch("hasVisaBeenCancelled") === "yes" && (
            <FormTextarea
              {...register("visaCancellationDetails")}
              placeholder={lang === "pt" ? "Descreva detalhadamente o ocorrido..." : "Please providing full details..."}
              className="animate-in slide-in-from-top-2 duration-300"
              required
            />
          )}
        </div>

        {/* Visa Denied */}
        <div className="space-y-6 pt-4 border-t border-border/50">
          <FormRadioGroup
            label={ds.previousTravel.visaRefused[lang]}
            value={hasBeenDeniedVisa}
            onValueChange={(val) => setValue("hasBeenDeniedVisa", val)}
            options={[
              { label: lang === "pt" ? "Sim" : "Yes", value: "yes" },
              { label: lang === "pt" ? "Não" : "No", value: "no" }
            ]}
            required
          />
          {hasBeenDeniedVisa === "yes" && (
            <FormTextarea
              {...register("visaRefusalDetails")}
              placeholder={lang === "pt" ? "Explique o motivo da recusa..." : "Explain the reason for refusal..."}
              className="animate-in slide-in-from-top-2 duration-300"
              required
            />
          )}
        </div>

        {/* Immigration Petition */}
        <div className="space-y-6 pt-4 border-t border-border/50">
          <FormRadioGroup
            label={ds.previousTravel.immigrationPetition[lang]}
            value={hasImmigrationPetition}
            onValueChange={(val) => setValue("hasImmigrationPetition", val)}
            options={[
              { label: lang === "pt" ? "Sim" : "Yes", value: "yes" },
              { label: lang === "pt" ? "Não" : "No", value: "no" }
            ]}
            required
          />
          {hasImmigrationPetition === "yes" && (
            <FormTextarea
              {...register("immigrationPetitionDetails")}
              placeholder={lang === "pt" ? "Forneça os detalhes da petição..." : "Provide petition details..."}
              className="animate-in slide-in-from-top-2 duration-300"
              required
            />
          )}
        </div>
      </div>
    </div>
  );
};
