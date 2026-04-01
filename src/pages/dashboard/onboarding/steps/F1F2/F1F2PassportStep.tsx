import { FormInput, FormRadioGroup, FormNativeSelect, FormTextarea } from "@/presentation/components/atoms/form/FormFields";
import { StepProps } from "../../types";
import { Book, Globe, MapPin, Calendar, HelpCircle } from "lucide-react";

export const F1F2PassportStep = ({
  register,
  watch,
  setValue,
  lang,
  t,
}: StepProps) => {
  const ds = t.ds160;
  const pa = ds.passport;
  const hasPassportBeenLostStolen = watch("hasPassportBeenLostStolen");

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-1.5 border-b border-border/50 pb-4">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Book className="h-6 w-6 text-primary" />
          {t.f1f2.steps[lang][6]}
        </h2>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormNativeSelect
            label={pa.type[lang]}
            {...register("passportType")}
            options={[
              { label: pa.select[lang], value: "" },
              { label: pa.typeOptions.regular[lang], value: "regular" },
              { label: pa.typeOptions.official[lang], value: "official" },
              { label: pa.typeOptions.diplomatic[lang], value: "diplomatic" },
              { label: pa.typeOptions.other[lang], value: "other" }
            ]}
            required
          />

          <FormInput
            label={pa.number[lang]}
            {...register("passportNumberDS")}
            required
            onChange={(e) =>
              setValue("passportNumberDS", e.target.value.replace(/[^a-zA-Z0-9]/g, ""))
            }
          />

          <FormInput 
            label={pa.country[lang]} 
            {...register("passportIssuanceCountry")} 
            required 
            icon={<Globe className="h-4 w-4" />}
          />

          <FormInput 
            label={pa.city[lang]} 
            {...register("passportIssuanceCity")} 
            required 
            icon={<MapPin className="h-4 w-4" />}
          />

          <FormInput label={pa.state[lang]} {...register("passportIssuanceState")} />

          <div className="grid grid-cols-2 gap-4">
            <FormInput 
              label={pa.issuanceDate[lang]} 
              type="date" 
              {...register("passportIssuanceDate")} 
              required 
              icon={<Calendar className="h-4 w-4" />}
            />
            <FormInput
              label={pa.expirationDate[lang]}
              type="date"
              {...register("passportExpirationDate")}
              required
              icon={<Calendar className="h-4 w-4" />}
            />
          </div>
        </div>

        <div className="space-y-6 pt-6 border-t border-border/50">
          <FormRadioGroup
            label={pa.lostStolen[lang]}
            value={hasPassportBeenLostStolen}
            onValueChange={(val) => setValue("hasPassportBeenLostStolen", val)}
            options={[
              { label: pa.yes[lang], value: "yes" },
              { label: pa.no[lang], value: "no" }
            ]}
            required
          />

          {hasPassportBeenLostStolen === "yes" && (
            <div className="p-6 bg-muted/20 rounded-3xl border border-border/50 animate-in slide-in-from-top-2 duration-300 space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormInput
                  label={pa.lostPassportNumber[lang]}
                  {...register("lostPassportNumberDetails")}
                  required
                />
                <FormInput
                  label={pa.issuingCountry[lang]}
                  {...register("lostPassportCountryDetails")}
                  required
                />
              </div>
              <FormTextarea
                label={pa.explanationLabel[lang]}
                {...register("lostPassportExplanationDetails")}
                required
                icon={<HelpCircle className="h-4 w-4" />}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
