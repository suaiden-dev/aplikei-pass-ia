import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../../../components/ui/radio-group";
import type { StepProps, OnboardingData } from "../types";

export const PreviousTravelStep = ({
  register,
  watch,
  setValue,
  lang,
  t,
  errors,
}: StepProps) => {
  const ds = t.ds160;
  const hasBeenToUS = watch("hasBeenToUS");
  const hasUSLicense = watch("hasUSDriverLicense");
  const hasHadUSVisa = watch("hasHadUSVisa");
  const hasBeenDeniedVisa = watch("hasBeenDeniedVisa");
  const hasImmigrationPetition = watch("hasImmigrationPetition");

  return (
    <div className="space-y-4 fade-in">
      <h2 className="font-display text-lg font-semibold text-foreground">
        {ds.previousTravel.title[lang]}
      </h2>

      <div className="space-y-4">
        {[
          {
            id: "hasBeenToUS" as Extract<keyof OnboardingData, string>,
            label: ds.previousTravel.beenToUS[lang],
            value: hasBeenToUS,
          },
          {
            id: "hasUSDriverLicense" as Extract<keyof OnboardingData, string>,
            label: ds.previousTravel.hasUSLicense[lang],
            value: hasUSLicense,
          },
          {
            id: "hasHadUSVisa" as Extract<keyof OnboardingData, string>,
            label: ds.previousTravel.hasUSVisa[lang],
            value: hasHadUSVisa,
          },
          {
            id: "hasVisaBeenCancelled" as Extract<keyof OnboardingData, string>,
            label:
              lang === "pt"
                ? "Seu visto já foi cancelado ou revogado?"
                : "Has your visa ever been cancelled or revoked?",
            value: watch("hasVisaBeenCancelled"),
          },
          {
            id: "hasBeenDeniedVisa" as Extract<keyof OnboardingData, string>,
            label: ds.previousTravel.visaRefused[lang],
            value: hasBeenDeniedVisa,
          },
          {
            id: "hasImmigrationPetition" as Extract<keyof OnboardingData, string>,
            label: ds.previousTravel.immigrationPetition[lang],
            value: hasImmigrationPetition,
            helper: ds.previousTravel.petitionHelper[lang],
          },
        ].map((item) => (
          <div
            key={item.id}
            className="space-y-3 pb-4 border-b border-border last:border-0 last:pb-0"
          >
            <Label className="leading-relaxed">{item.label} *</Label>
            <RadioGroup
              onValueChange={(val) => setValue(item.id, val)}
              value={item.value as string}
              className="flex gap-4 mt-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id={`${item.id}-yes`} />
                <Label htmlFor={`${item.id}-yes`}>
                  {lang === "pt" ? "Sim" : "Yes"}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id={`${item.id}-no`} />
                <Label htmlFor={`${item.id}-no`}>
                  {lang === "pt" ? "Não" : "No"}
                </Label>
              </div>
            </RadioGroup>
            {item.helper && (
              <p className="text-xs text-muted-foreground mt-1">
                {item.helper}
              </p>
            )}

            {item.id === "hasBeenToUS" && item.value === "yes" && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4 p-4 bg-muted/40 rounded-md border border-dashed border-border scale-in-center">
                <div className="space-y-2">
                  <Label htmlFor="lastUSTravelDate">
                    {lang === "pt" ? "Data de entrada:" : "Date of Entry:"} *
                  </Label>
                   <Input
                    id="lastUSTravelDate"
                    type="date"
                    {...register("lastUSTravelDate", { required: true })}
                    className={errors?.lastUSTravelDate ? "border-destructive" : ""}
                  />
                  {errors?.lastUSTravelDate && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastUSTravelPortOfEntry">
                    {lang === "pt" ? "Porta de entrada:" : "Port of Entry:"} *
                  </Label>
                   <Input
                    id="lastUSTravelPortOfEntry"
                    {...register("lastUSTravelPortOfEntry", { required: true })}
                    className={errors?.lastUSTravelPortOfEntry ? "border-destructive" : ""}
                    onChange={(e) =>
                      setValue(
                        "lastUSTravelPortOfEntry",
                        e.target.value.replace(
                          /[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g,
                          "",
                        ),
                      )
                    }
                  />
                  {errors?.lastUSTravelPortOfEntry && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                </div>
                <div className="space-y-2">
                  <Label>
                    {lang === "pt" ? "Duração da estadia:" : "Stay Duration:"} *
                  </Label>
                  <div className="flex gap-2">
                     <Input
                      type="number"
                      {...register("lastUSTravelDurationValue", { required: true })}
                      className={`w-24 ${errors?.lastUSTravelDurationValue ? "border-destructive" : ""}`}
                    />
                     <select
                      {...register("lastUSTravelDurationUnit", { required: true })}
                      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors?.lastUSTravelDurationUnit ? "border-destructive" : ""}`}
                    >
                      <option value="days">
                        {lang === "pt" ? "Dias" : "Days"}
                      </option>
                      <option value="weeks">
                        {lang === "pt" ? "Semanas" : "Weeks"}
                      </option>
                      <option value="months">
                        {lang === "pt" ? "Meses" : "Months"}
                      </option>
                      <option value="years">
                        {lang === "pt" ? "Anos" : "Years"}
                      </option>
                    </select>
                  </div>
                  {(errors?.lastUSTravelDurationValue || errors?.lastUSTravelDurationUnit) && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastUSTravelPurpose">
                    {lang === "pt" ? "Motivo da visita:" : "Purpose of Visit:"}{" "}
                    *
                  </Label>
                   <Input
                    id="lastUSTravelPurpose"
                    {...register("lastUSTravelPurpose", { required: true })}
                    className={errors?.lastUSTravelPurpose ? "border-destructive" : ""}
                    onChange={(e) =>
                      setValue(
                        "lastUSTravelPurpose",
                        e.target.value.replace(
                          /[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g,
                          "",
                        ),
                      )
                    }
                  />
                  {errors?.lastUSTravelPurpose && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                </div>
              </div>
            )}

            {item.id === "hasUSDriverLicense" && item.value === "yes" && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4 p-4 bg-muted/40 rounded-md border border-dashed border-border scale-in-center">
                <div className="space-y-2">
                  <Label htmlFor="usDriverLicenseNumber">
                    {lang === "pt"
                      ? "Número da habilitação americana:"
                      : "US Driver License Number:"}{" "}
                    *
                  </Label>
                   <Input
                    id="usDriverLicenseNumber"
                    {...register("usDriverLicenseNumber", { required: true })}
                    className={errors?.usDriverLicenseNumber ? "border-destructive" : ""}
                    onChange={(e) =>
                      setValue(
                        "usDriverLicenseNumber",
                        e.target.value.replace(/[^a-zA-Z0-9]/g, ""),
                      )
                    }
                  />
                  {errors?.usDriverLicenseNumber && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usDriverLicenseState">
                    {lang === "pt"
                      ? "Estado que emitiu a habilitação:"
                      : "Issuing State:"}{" "}
                    *
                  </Label>
                   <Input
                    id="usDriverLicenseState"
                    {...register("usDriverLicenseState", { required: true })}
                    className={errors?.usDriverLicenseState ? "border-destructive" : ""}
                    onChange={(e) =>
                      setValue(
                        "usDriverLicenseState",
                        e.target.value.replace(
                          /[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g,
                          "",
                        ),
                      )
                    }
                  />
                  {errors?.usDriverLicenseState && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                </div>
              </div>
            )}

            {item.id === "hasHadUSVisa" && item.value === "yes" && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4 p-4 bg-muted/40 rounded-md border border-dashed border-border scale-in-center">
                <div className="space-y-2">
                  <Label htmlFor="lastVisaIssuanceDate">
                    {lang === "pt"
                      ? "Data da emissão do último visto:"
                      : "Last Visa Issuance Date:"}{" "}
                    *
                  </Label>
                   <Input
                    id="lastVisaIssuanceDate"
                    type="date"
                    {...register("lastVisaIssuanceDate", { required: true })}
                    className={errors?.lastVisaIssuanceDate ? "border-destructive" : ""}
                  />
                  {errors?.lastVisaIssuanceDate && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastVisaNumber">
                    {lang === "pt"
                      ? "Número do último visto emitido:"
                      : "Last Visa Number:"}{" "}
                    *
                  </Label>
                   <Input
                    id="lastVisaNumber"
                    {...register("lastVisaNumber", { required: true })}
                    className={errors?.lastVisaNumber ? "border-destructive" : ""}
                    onChange={(e) =>
                      setValue(
                        "lastVisaNumber",
                        e.target.value.replace(/[^a-zA-Z0-9]/g, ""),
                      )
                    }
                  />
                  {errors?.lastVisaNumber && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                </div>
                <div className="space-y-3 mt-4">
                  <Label>
                    {lang === "pt"
                      ? "Você está solicitando o mesmo tipo de visto?"
                      : "Are you applying for the same type of visa?"}{" "}
                    *
                  </Label>
                  <RadioGroup
                    onValueChange={(val) =>
                      setValue("isSolicitingSameTypeVisa", val)
                    }
                    value={watch("isSolicitingSameTypeVisa")}
                    className="flex gap-4 mt-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="same-type-yes" />
                      <Label htmlFor="same-type-yes">
                        {lang === "pt" ? "Sim" : "Yes"}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="same-type-no" />
                      <Label htmlFor="same-type-no">
                        {lang === "pt" ? "Não" : "No"}
                      </Label>
                    </div>
                  </RadioGroup>
                  {errors?.isSolicitingSameTypeVisa && <p className="text-xs text-destructive">{lang === 'pt' ? 'Selecione uma opção' : 'Select an option'}</p>}
                </div>

                <div className="space-y-3 mt-4">
                  <Label>
                    {lang === "pt"
                      ? "Está requerendo no mesmo país ou local onde o visto acima foi emitido e esse país é o seu local de residência principal?"
                      : "Are you applying in the same country or location where the visa above was issued and is this country your place of primary residence?"}{" "}
                    *
                  </Label>
                  <RadioGroup
                    onValueChange={(val) =>
                      setValue("isApplyingInSameCountry", val)
                    }
                    value={watch("isApplyingInSameCountry")}
                    className="flex gap-4 mt-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="same-country-yes" />
                      <Label htmlFor="same-country-yes">
                        {lang === "pt" ? "Sim" : "Yes"}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="same-country-no" />
                      <Label htmlFor="same-country-no">
                        {lang === "pt" ? "Não" : "No"}
                      </Label>
                    </div>
                  </RadioGroup>
                  {errors?.isApplyingInSameCountry && <p className="text-xs text-destructive">{lang === 'pt' ? 'Selecione uma opção' : 'Select an option'}</p>}
                </div>

                <div className="space-y-3 mt-4">
                  <Label>
                    {lang === "pt"
                      ? "Você já teve suas digitais coletadas?"
                      : "Have you been ten-printed before?"}{" "}
                    *
                  </Label>
                  <RadioGroup
                    onValueChange={(val) =>
                      setValue("haveBeenFingerprintedBefore", val)
                    }
                    value={watch("haveBeenFingerprintedBefore")}
                    className="flex gap-4 mt-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="fingerprinted-yes" />
                      <Label htmlFor="fingerprinted-yes">
                        {lang === "pt" ? "Sim" : "Yes"}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="fingerprinted-no" />
                      <Label htmlFor="fingerprinted-no">
                        {lang === "pt" ? "Não" : "No"}
                      </Label>
                    </div>
                  </RadioGroup>
                  {errors?.haveBeenFingerprintedBefore && <p className="text-xs text-destructive">{lang === 'pt' ? 'Selecione uma opção' : 'Select an option'}</p>}
                </div>

                <div className="space-y-3 mt-4">
                  <Label>
                    {lang === "pt"
                      ? "O seu visto dos EUA alguma vez foi perdido ou roubado?"
                      : "Has your US visa ever been lost or stolen?"}{" "}
                    *
                  </Label>
                  <RadioGroup
                    onValueChange={(val) =>
                      setValue("hasVisaBeenLostStolen", val)
                    }
                    value={watch("hasVisaBeenLostStolen")}
                    className="flex gap-4 mt-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="visa-lost-yes" />
                      <Label htmlFor="visa-lost-yes">
                        {lang === "pt" ? "Sim" : "Yes"}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="visa-lost-no" />
                      <Label htmlFor="visa-lost-no">
                        {lang === "pt" ? "Não" : "No"}
                      </Label>
                    </div>
                  </RadioGroup>
                  {errors?.hasVisaBeenLostStolen && <p className="text-xs text-destructive">{lang === 'pt' ? 'Selecione uma opção' : 'Select an option'}</p>}
                  {watch("hasVisaBeenLostStolen") === "yes" && (
                    <div className="mt-2 space-y-4 scale-in-center border-l-2 border-border pl-4">
                      <div className="space-y-2">
                        <Label htmlFor="visaLostStolenYear">
                          {lang === "pt" ? "Escolha o ano:" : "Choose year:"} *
                        </Label>
                         <Input
                          id="visaLostStolenYear"
                          {...register("visaLostStolenYear", { required: true })}
                          maxLength={4}
                          className={errors?.visaLostStolenYear ? "border-destructive" : ""}
                          onChange={(e) =>
                            setValue(
                              "visaLostStolenYear",
                              e.target.value.replace(/[^0-9]/g, ""),
                            )
                          }
                        />
                        {errors?.visaLostStolenYear && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="visaLostStolenExplanation">
                          {lang === "pt"
                            ? "Explique os detalhes do visto perdido:"
                            : "Explain lost visa details:"}{" "}
                          *
                        </Label>
                         <textarea
                          id="visaLostStolenExplanation"
                          {...register("visaLostStolenExplanation", { required: true })}
                          className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors?.visaLostStolenExplanation ? "border-destructive" : ""}`}
                        />
                        {errors?.visaLostStolenExplanation && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {item.id === "hasVisaBeenCancelled" && item.value === "yes" && (
              <div className="mt-4 p-4 bg-muted/40 rounded-md border border-dashed border-border scale-in-center">
                <div className="space-y-2">
                  <Label htmlFor="visaCancellationDetails">
                    {lang === "pt"
                      ? "Explique os detalhes do cancelamento:"
                      : "Explain cancellation details:"}{" "}
                    *
                  </Label>
                   <textarea
                    id="visaCancellationDetails"
                    {...register("visaCancellationDetails", { required: true })}
                    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors?.visaCancellationDetails ? "border-destructive" : ""}`}
                  />
                  {errors?.visaCancellationDetails && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                </div>
              </div>
            )}

            {item.id === "hasBeenDeniedVisa" && item.value === "yes" && (
              <div className="mt-4 p-4 bg-muted/40 rounded-md border border-dashed border-border scale-in-center">
                <div className="space-y-2">
                  <Label htmlFor="visaRefusalDetails">
                    {lang === "pt"
                      ? "Explique os detalhes da recusa:"
                      : "Explain denial details:"}{" "}
                    *
                  </Label>
                   <textarea
                    id="visaRefusalDetails"
                    {...register("visaRefusalDetails", { required: true })}
                    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors?.visaRefusalDetails ? "border-destructive" : ""}`}
                  />
                  {errors?.visaRefusalDetails && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                </div>
              </div>
            )}

            {item.id === "hasImmigrationPetition" && item.value === "yes" && (
              <div className="mt-4 p-4 bg-muted/40 rounded-md border border-dashed border-border scale-in-center">
                <div className="space-y-2">
                  <Label htmlFor="immigrationPetitionDetails">
                    {lang === "pt"
                      ? "Explique os detalhes da petição:"
                      : "Explain petition details:"}{" "}
                    *
                  </Label>
                   <textarea
                    id="immigrationPetitionDetails"
                    {...register("immigrationPetitionDetails", { required: true })}
                    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors?.immigrationPetitionDetails ? "border-destructive" : ""}`}
                  />
                  {errors?.immigrationPetitionDetails && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
