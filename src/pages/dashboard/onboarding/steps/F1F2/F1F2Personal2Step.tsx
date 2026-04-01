import { FormInput, FormRadioGroup, FormCheckbox } from "@/presentation/components/atoms/form/FormFields";
import { StepProps } from "../../types";
import { Globe, Shield, IdCard } from "lucide-react";

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
  const isPermanentResidentOtherCountry = watch("isPermanentResidentOtherCountry");
  
  const nationalIDDoesNotApply = watch("nationalIDDoesNotApply");
  const ssnDoesNotApply = watch("ssnDoesNotApply");
  const taxIDDoesNotApply = watch("taxIDDoesNotApply");

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-1.5 border-b border-border/50 pb-4">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Globe className="h-6 w-6 text-primary" />
          {ds.personal2.title[lang]}
        </h2>
      </div>

      <div className="space-y-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormInput
            label={ds.personal2.nationality[lang]}
            {...register("nationalityInfo")}
            required
            onChange={(e) =>
              setValue("nationalityInfo", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g, ""))
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-8">
          <FormRadioGroup
            label={ds.personal2.hasOtherNationality[lang]}
            value={hasOtherNationality}
            onValueChange={(val) => setValue("hasOtherNationality", val)}
            options={[
              { label: lang === "pt" ? "Sim" : "Yes", value: "yes" },
              { label: lang === "pt" ? "Não" : "No", value: "no" }
            ]}
            required
          />
          {hasOtherNationality === "yes" && (
            <FormInput 
              {...register("otherNationalities")} 
              placeholder={lang === "pt" ? "Especifique as outras nacionalidades" : "Specify other nationalities"}
              className="animate-in slide-in-from-top-2 duration-300"
            />
          )}

          <FormRadioGroup
            label={ds.personal2.hasPassportOtherCountry[lang]}
            value={hasNationalityPassport}
            onValueChange={(val) => setValue("hasNationalityPassport", val)}
            options={[
              { label: lang === "pt" ? "Sim" : "Yes", value: "yes" },
              { label: lang === "pt" ? "Não" : "No", value: "no" }
            ]}
            required
          />
          {hasNationalityPassport === "yes" && (
            <FormInput
              {...register("nationalityPassportNumber")}
              placeholder={lang === "pt" ? "Número do passaporte" : "Passport number"}
              className="animate-in slide-in-from-top-2 duration-300"
            />
          )}

          <FormRadioGroup
            label={ds.personal2.permanentResidentOther[lang]}
            value={isPermanentResidentOtherCountry}
            onValueChange={(val) => setValue("isPermanentResidentOtherCountry", val)}
            options={[
              { label: lang === "pt" ? "Sim" : "Yes", value: "yes" },
              { label: lang === "pt" ? "Não" : "No", value: "no" }
            ]}
            required
          />
          {isPermanentResidentOtherCountry === "yes" && (
            <FormInput
              label={lang === "pt" ? "Informe os detalhes da residência:" : "Enter residence details:"}
              {...register("permResCountryDetails")}
              className="animate-in slide-in-from-top-2 duration-300"
              required
            />
          )}
        </div>

        <div className="space-y-6 pt-8 border-t border-border/50">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 mb-4">
            <IdCard className="h-3 w-3" />
            Documentos de Identificação
          </h4>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <FormInput
                label={ds.personal2.nationalID[lang]}
                {...register("nationalID", {
                  required: !nationalIDDoesNotApply,
                  pattern: nationalIDDoesNotApply ? undefined : {
                    value: /^[0-9]{11}$/,
                    message: lang === "pt" ? "CPF deve ter 11 números" : "CPF must be 11 digits",
                  },
                })}
                maxLength={11}
                disabled={nationalIDDoesNotApply}
                error={errors?.nationalID?.message as string}
                onChange={(e) => setValue("nationalID", e.target.value.replace(/\D/g, ""))}
              />
              <FormCheckbox
                label={t.common.doesNotApply[lang]}
                id="nationalIDDoesNotApply"
                checked={nationalIDDoesNotApply}
                onCheckedChange={(checked) => setValue("nationalIDDoesNotApply", checked === true)}
              />
            </div>

            <div className="space-y-4">
              <FormInput
                label={ds.personal2.ssn[lang]}
                {...register("ssn")}
                maxLength={11}
                disabled={ssnDoesNotApply}
                onChange={(e) => setValue("ssn", e.target.value.replace(/[^0-9-]/g, ""))}
              />
              <FormCheckbox
                label={t.common.doesNotApply[lang]}
                id="ssnDoesNotApply"
                checked={ssnDoesNotApply}
                onCheckedChange={(checked) => setValue("ssnDoesNotApply", checked === true)}
              />
            </div>

            <div className="space-y-4">
              <FormInput
                label={ds.personal2.taxID[lang]}
                {...register("taxID")}
                disabled={taxIDDoesNotApply}
              />
              <FormCheckbox
                label={t.common.doesNotApply[lang]}
                id="taxIDDoesNotApply"
                checked={taxIDDoesNotApply}
                onCheckedChange={(checked) => setValue("taxIDDoesNotApply", checked === true)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
