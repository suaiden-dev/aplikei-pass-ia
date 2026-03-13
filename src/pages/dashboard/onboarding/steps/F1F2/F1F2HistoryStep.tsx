import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StepProps } from "../../types";

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
    <div className="space-y-4 fade-in">
      <h2 className="font-display text-lg font-semibold text-foreground">
        {t.f1f2.steps[lang][3]}
      </h2>

      <div className="space-y-4">
        <div className="space-y-3 pb-4 border-b border-border">
          <Label className="leading-relaxed">{ds.previousTravel.beenToUS[lang]} *</Label>
          <RadioGroup
            onValueChange={(val) => setValue("hasBeenToUS", val)}
            value={hasBeenToUS}
            className="flex gap-4 mt-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="been-yes" />
              <Label htmlFor="been-yes">{lang === "pt" ? "Sim" : "Yes"}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="been-no" />
              <Label htmlFor="been-no">{lang === "pt" ? "Não" : "No"}</Label>
            </div>
          </RadioGroup>

          {hasBeenToUS === "yes" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4 p-4 bg-muted/40 rounded-md border border-dashed border-border scale-in-center">
              <div className="space-y-2">
                <Label htmlFor="lastUSTravelDate">
                  {lang === "pt" ? "Data de entrada:" : "Date of Entry:"} *
                </Label>
                <Input id="lastUSTravelDate" type="date" {...register("lastUSTravelDate")} />
              </div>
              <div className="space-y-2">
                <Label>
                  {lang === "pt" ? "Duração da estadia:" : "Stay Duration:"} *
                </Label>
                <div className="flex gap-2">
                  <Input type="number" {...register("lastUSTravelDurationValue")} className="w-24" />
                  <select
                    {...register("lastUSTravelDurationUnit")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="days">{lang === "pt" ? "Dias" : "Days"}</option>
                    <option value="weeks">{lang === "pt" ? "Semanas" : "Weeks"}</option>
                    <option value="months">{lang === "pt" ? "Meses" : "Months"}</option>
                    <option value="years">{lang === "pt" ? "Anos" : "Years"}</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 pb-4 border-b border-border">
          <Label className="leading-relaxed">{ds.previousTravel.hasUSLicense[lang]} *</Label>
          <RadioGroup
            onValueChange={(val) => setValue("hasUSDriverLicense", val)}
            value={hasUSLicense}
            className="flex gap-4 mt-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="license-yes" />
              <Label htmlFor="license-yes">{lang === "pt" ? "Sim" : "Yes"}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="license-no" />
              <Label htmlFor="license-no">{lang === "pt" ? "Não" : "No"}</Label>
            </div>
          </RadioGroup>

          {hasUSLicense === "yes" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4 p-4 bg-muted/40 rounded-md border border-dashed border-border scale-in-center">
              <div className="space-y-2">
                <Label htmlFor="usDriverLicenseNumber">
                  {lang === "pt" ? "Número da habilitação:" : "License Number:"} *
                </Label>
                <Input id="usDriverLicenseNumber" {...register("usDriverLicenseNumber")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usDriverLicenseState">
                  {lang === "pt" ? "Estado emissor:" : "Issuing State:"} *
                </Label>
                <Input id="usDriverLicenseState" {...register("usDriverLicenseState")} />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 pb-4 border-b border-border">
          <Label className="leading-relaxed">{ds.previousTravel.hasUSVisa[lang]} *</Label>
          <RadioGroup
            onValueChange={(val) => setValue("hasHadUSVisa", val)}
            value={hasHadUSVisa}
            className="flex gap-4 mt-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="visa-yes" />
              <Label htmlFor="visa-yes">{lang === "pt" ? "Sim" : "Yes"}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="visa-no" />
              <Label htmlFor="visa-no">{lang === "pt" ? "Não" : "No"}</Label>
            </div>
          </RadioGroup>

          {hasHadUSVisa === "yes" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4 p-4 bg-muted/40 rounded-md border border-dashed border-border scale-in-center">
              <div className="space-y-2">
                <Label htmlFor="lastVisaIssuanceDate">
                  {lang === "pt" ? "Data da emissão:" : "Issuance Date:"} *
                </Label>
                <Input id="lastVisaIssuanceDate" type="date" {...register("lastVisaIssuanceDate")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastVisaNumber">
                  {lang === "pt" ? "Número do visto:" : "Visa Number:"} *
                </Label>
                <Input id="lastVisaNumber" {...register("lastVisaNumber")} />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 pb-4 border-b border-border">
          <Label className="leading-relaxed">
            {lang === "pt" ? "Seu visto já foi cancelado ou revogado?" : "Has your visa ever been cancelled or revoked?"} *
          </Label>
          <RadioGroup
            onValueChange={(val) => setValue("hasVisaBeenCancelled", val)}
            value={watch("hasVisaBeenCancelled")}
            className="flex gap-4 mt-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="cancel-yes" />
              <Label htmlFor="cancel-yes">{lang === "pt" ? "Sim" : "Yes"}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="cancel-no" />
              <Label htmlFor="cancel-no">{lang === "pt" ? "Não" : "No"}</Label>
            </div>
          </RadioGroup>
          {watch("hasVisaBeenCancelled") === "yes" && (
            <div className="mt-4 p-4 bg-muted/40 rounded-md border border-dashed border-border scale-in-center">
               <textarea
                {...register("visaCancellationDetails")}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder={lang === "pt" ? "Detalhes do cancelamento..." : "Cancellation details..."}
              />
            </div>
          )}
        </div>

        <div className="space-y-3 pb-4 border-b border-border">
          <Label className="leading-relaxed">{ds.previousTravel.visaRefused[lang]} *</Label>
          <RadioGroup
            onValueChange={(val) => setValue("hasBeenDeniedVisa", val)}
            value={hasBeenDeniedVisa}
            className="flex gap-4 mt-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="denied-yes" />
              <Label htmlFor="denied-yes">{lang === "pt" ? "Sim" : "Yes"}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="denied-no" />
              <Label htmlFor="denied-no">{lang === "pt" ? "Não" : "No"}</Label>
            </div>
          </RadioGroup>
          {hasBeenDeniedVisa === "yes" && (
            <div className="mt-4 p-4 bg-muted/40 rounded-md border border-dashed border-border scale-in-center">
               <textarea
                {...register("visaRefusalDetails")}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder={lang === "pt" ? "Detalhes da recusa..." : "Refusal details..."}
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label className="leading-relaxed">{ds.previousTravel.immigrationPetition[lang]} *</Label>
          <RadioGroup
            onValueChange={(val) => setValue("hasImmigrationPetition", val)}
            value={hasImmigrationPetition}
            className="flex gap-4 mt-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="petition-yes" />
              <Label htmlFor="petition-yes">{lang === "pt" ? "Sim" : "Yes"}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="petition-no" />
              <Label htmlFor="petition-no">{lang === "pt" ? "Não" : "No"}</Label>
            </div>
          </RadioGroup>
          {hasImmigrationPetition === "yes" && (
            <div className="mt-4 p-4 bg-muted/40 rounded-md border border-dashed border-border scale-in-center">
               <textarea
                {...register("immigrationPetitionDetails")}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder={lang === "pt" ? "Detalhes da petição..." : "Petition details..."}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
