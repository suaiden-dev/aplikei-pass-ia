import { Input } from "@/presentation/components/atoms/input";
import { Label } from "@/presentation/components/atoms/label";
import { RadioGroup, RadioGroupItem } from "@/presentation/components/atoms/radio-group";
import { StepProps } from "../../types";
import { Checkbox } from "@/presentation/components/atoms/checkbox";

export const F1F2Personal2Step = ({
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
        {t.f1f2.steps[lang][1]}
      </h2>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nationalityInfo">
            {ds.personal2.nationality[lang]} *
          </Label>
          <Input
            id="nationalityInfo"
            {...register("nationalityInfo")}
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
          {hasOtherNationality === "yes" && (
            <Input {...register("otherNationalities")} className="mt-2" />
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
          {hasNationalityPassport === "yes" && (
            <Input
              {...register("nationalityPassportNumber")}
              className="mt-2"
            />
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
                {...register("permResCountryDetails")}
              />
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
                {t.common.doesNotApply[lang]}
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
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setValue("nationalID", value);
            }}
          />
          {errors?.nationalID && (
            <p className="text-xs text-destructive mt-1">
              {errors.nationalID.message ||
                (lang === "pt" ? "Campo obrigatório" : "Required field")}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="ssn">{ds.personal2.ssn[lang]}</Label>
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
                {t.common.doesNotApply[lang]}
              </label>
            </div>
          </div>
          <Input
            id="ssn"
            {...register("ssn")}
            maxLength={11}
            disabled={watch("ssnDoesNotApply")}
            onChange={(e) =>
              setValue("ssn", e.target.value.replace(/[^0-9-]/g, ""))
            }
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="taxID">{ds.personal2.taxID[lang]}</Label>
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
                {t.common.doesNotApply[lang]}
              </label>
            </div>
          </div>
          <Input
            id="taxID"
            {...register("taxID")}
            disabled={watch("taxIDDoesNotApply")}
          />
        </div>
      </div>
    </div>
  );
};
