import { Input } from "@/presentation/components/atoms/input";
import { Label } from "@/presentation/components/atoms/label";
import { RadioGroup, RadioGroupItem } from "@/presentation/components/atoms/radio-group";
import { StepProps } from "../../types";
import { Checkbox } from "@/presentation/components/atoms/checkbox";

export const PersonalInfo2Step = ({
  register,
  watch,
  setValue,
  lang,
  t,
  errors,
}: StepProps) => {
  const ds = t.ds160;
  const hasOtherNationality = watch("hasOtherNationality");
  const hasNationalityPassport = watch("hasNationalityPassport");
  const isPermanentResidentOtherCountry = watch(
    "isPermanentResidentOtherCountry",
  );

  return (
    <div className="space-y-4 fade-in">
      <h2 className="font-display text-lg font-semibold text-foreground">
        {ds.personal2.title[lang]}
      </h2>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nationalityInfo">
            {ds.personal2.nationality[lang]} *
          </Label>
          <Input
            id="nationalityInfo"
            {...register("nationalityInfo", { required: true })}
            className={errors?.nationalityInfo ? "border-destructive" : ""}
            onChange={(e) =>
              setValue(
                "nationalityInfo",
                e.target.value.replace(
                  /[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g,
                  "",
                ),
              )
            }
          />
          {errors?.nationalityInfo && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
        </div>

        <div className="space-y-3">
          <Label>{ds.personal2.hasOtherNationality[lang]} *</Label>
          <RadioGroup
            onValueChange={(val) => setValue("hasOtherNationality", val)}
            value={hasOtherNationality}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="other-nat-yes" />
              <Label htmlFor="other-nat-yes">
                {lang === "pt" ? "Sim" : "Yes"}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="other-nat-no" />
              <Label htmlFor="other-nat-no">
                {lang === "pt" ? "Não" : "No"}
              </Label>
            </div>
          </RadioGroup>
          {errors?.hasOtherNationality && <p className="text-xs text-destructive">{lang === 'pt' ? 'Selecione uma opção' : 'Select an option'}</p>}
          {hasOtherNationality === "yes" && (
            <div className="space-y-2">
              <Input 
                {...register("otherNationalities", { required: true })} 
                className={`mt-2 ${errors?.otherNationalities ? "border-destructive" : ""}`} 
                placeholder={lang === 'pt' ? 'Informe as outras nacionalidades' : 'Enter other nationalities'}
              />
              {errors?.otherNationalities && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label>{ds.personal2.hasPassportOtherCountry[lang]} *</Label>
          <RadioGroup
            onValueChange={(val) => setValue("hasNationalityPassport", val)}
            value={hasNationalityPassport}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="other-pass-yes" />
              <Label htmlFor="other-pass-yes">
                {lang === "pt" ? "Sim" : "Yes"}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="other-pass-no" />
              <Label htmlFor="other-pass-no">
                {lang === "pt" ? "Não" : "No"}
              </Label>
            </div>
          </RadioGroup>
          {errors?.hasNationalityPassport && <p className="text-xs text-destructive">{lang === 'pt' ? 'Selecione uma opção' : 'Select an option'}</p>}
          {hasNationalityPassport === "yes" && (
            <div className="space-y-2">
              <Input
                {...register("nationalityPassportNumber", { required: true })}
                className={`mt-2 ${errors?.nationalityPassportNumber ? "border-destructive" : ""}`}
                placeholder={lang === 'pt' ? 'Número do passaporte' : 'Passport number'}
              />
              {errors?.nationalityPassportNumber && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label>{ds.personal2.permanentResidentOther[lang]} *</Label>
          <RadioGroup
            onValueChange={(val) =>
              setValue("isPermanentResidentOtherCountry", val)
            }
            value={isPermanentResidentOtherCountry}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="perm-res-yes" />
              <Label htmlFor="perm-res-yes">
                {lang === "pt" ? "Sim" : "Yes"}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="perm-res-no" />
              <Label htmlFor="perm-res-no">
                {lang === "pt" ? "Não" : "No"}
              </Label>
            </div>
          </RadioGroup>
          {errors?.isPermanentResidentOtherCountry && <p className="text-xs text-destructive">{lang === 'pt' ? 'Selecione uma opção' : 'Select an option'}</p>}
          {isPermanentResidentOtherCountry === "yes" && (
            <div className="mt-2 space-y-2 scale-in-center">
              <Label htmlFor="permResCountryDetails">
                {lang === "pt"
                  ? "Informe os detalhes da residência:"
                  : "Enter residence details:"}{" "}
                *
              </Label>
              <Input
                id="permResCountryDetails"
                {...register("permResCountryDetails", { required: true })}
                className={errors?.permResCountryDetails ? "border-destructive" : ""}
              />
              {errors?.permResCountryDetails && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 border-t border-border pt-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="nationalID">
              {ds.personal2.nationalID[lang]} *
            </Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="nationalIDDoesNotApply"
                checked={watch("nationalIDDoesNotApply")}
                onCheckedChange={(checked) =>
                  setValue("nationalIDDoesNotApply", checked === true)
                }
              />
              <label
                htmlFor="nationalIDDoesNotApply"
                className="text-xs text-muted-foreground cursor-pointer"
              >
                Does Not Apply
              </label>
            </div>
          </div>
          <Input
            id="nationalID"
            {...register("nationalID", {
              required: !watch("nationalIDDoesNotApply"),
              pattern: watch("nationalIDDoesNotApply")
                ? undefined
                : {
                    value: /^[0-9]{11}$/,
                    message:
                      lang === "pt"
                        ? "CPF deve ter exatamente 11 números"
                        : "CPF must be exactly 11 digits",
                  },
            })}
            maxLength={11}
            disabled={watch("nationalIDDoesNotApply")}
            className={!watch("nationalIDDoesNotApply") && errors?.nationalID ? "border-destructive" : ""}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setValue("nationalID", value);
            }}
          />
          {errors?.nationalID && !watch("nationalIDDoesNotApply") && (
            <p className="text-xs text-destructive mt-1">
              {errors.nationalID.message ||
                (lang === "pt" ? "Campo obrigatório" : "Required field")}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="ssn">{ds.personal2.ssn[lang]} *</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ssnDoesNotApply"
                checked={watch("ssnDoesNotApply")}
                onCheckedChange={(checked) =>
                  setValue("ssnDoesNotApply", checked === true)
                }
              />
              <label
                htmlFor="ssnDoesNotApply"
                className="text-xs text-muted-foreground cursor-pointer"
              >
                Does Not Apply
              </label>
            </div>
          </div>
          <Input
            id="ssn"
            {...register("ssn", { required: !watch("ssnDoesNotApply") })}
            maxLength={11}
            disabled={watch("ssnDoesNotApply")}
            className={!watch("ssnDoesNotApply") && errors?.ssn ? "border-destructive" : ""}
            onChange={(e) =>
              setValue("ssn", e.target.value.replace(/[^0-9-]/g, ""))
            }
          />
          {errors?.ssn && !watch("ssnDoesNotApply") && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="taxID">{ds.personal2.taxID[lang]} *</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="taxIDDoesNotApply"
                checked={watch("taxIDDoesNotApply")}
                onCheckedChange={(checked) =>
                  setValue("taxIDDoesNotApply", checked === true)
                }
              />
              <label
                htmlFor="taxIDDoesNotApply"
                className="text-xs text-muted-foreground cursor-pointer"
              >
                Does Not Apply
              </label>
            </div>
          </div>
          <Input
            id="taxID"
            {...register("taxID", { required: !watch("taxIDDoesNotApply") })}
            disabled={watch("taxIDDoesNotApply")}
            className={!watch("taxIDDoesNotApply") && errors?.taxID ? "border-destructive" : ""}
          />
          {errors?.taxID && !watch("taxIDDoesNotApply") && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
        </div>
      </div>
    </div>
  );
};
