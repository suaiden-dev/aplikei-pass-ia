import { FormInput, FormRadioGroup, FormNativeSelect } from "@/presentation/components/atoms/form/FormFields";
import { StepProps } from "../../types";
import { AlertCircle, User, MapPin, Mail, Calendar } from "lucide-react";

export const F1F2Personal1Step = ({
  register,
  watch,
  setValue,
  lang,
  t,
}: StepProps) => {
  const ds = t.ds160;
  const hasOtherNames = watch("hasOtherNames");
  const gender = watch("gender");
  const hasTelecode = watch("hasTelecode");

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 shadow-sm relative overflow-hidden group">
        <div className="absolute right-0 top-0 h-24 w-24 bg-primary/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
        <div className="flex items-start gap-4 relative z-10">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-display font-black text-primary text-[10px] uppercase tracking-[0.2em]">
              {lang === "pt" ? "Instrução Importante" : "Important Instruction"}
            </h4>
            <p className="text-primary/90 text-sm leading-relaxed font-semibold">
              {ds.interview.fillNotice[lang]}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-1.5 border-b border-border/50 pb-4">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          {t.f1f2.steps[lang][0]}
        </h2>
      </div>

      <div className="space-y-6">
        <FormNativeSelect
          label={ds.interview.location[lang]}
          {...register("interviewLocation")}
          options={ds.interview.options.map((opt: any) => ({
            label: opt[lang],
            value: opt.en
          }))}
          required
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormInput 
            label={ds.personal1.email[lang]} 
            {...register("email")} 
            autoComplete="email" 
            placeholder="exemplo@email.com"
            icon={<Mail className="h-4 w-4" />}
            required
          />
        </div>

        <div className="space-y-6 rounded-3xl border border-border/50 p-6 bg-muted/20 relative overflow-hidden">
          <div className="absolute left-0 top-0 w-1 h-full bg-primary/30" />
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
            <User className="h-3 w-3" />
            Identificação Legal
          </h4>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormInput
              label={ds.personal1.lastName[lang]}
              {...register("lastName")}
              autoComplete="family-name"
              required
              onChange={(e) =>
                setValue("lastName", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g, ""))
              }
            />
            <FormInput
              label={ds.personal1.firstName[lang]}
              {...register("firstName")}
              autoComplete="given-name"
              hint={ds.personal1.fullNameHelper[lang]}
              required
              onChange={(e) =>
                setValue("firstName", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g, ""))
              }
            />
          </div>
          <FormInput 
            label={ds.personal1.fullNamePassport[lang]} 
            {...register("fullNamePassport")} 
            placeholder="Como consta no passaporte"
          />
        </div>

        <div className="grid grid-cols-1 gap-8 pt-4">
          <FormRadioGroup
            label={ds.personal1.hasOtherNames[lang]}
            value={hasOtherNames}
            onValueChange={(val) => setValue("hasOtherNames", val)}
            options={[
              { label: lang === "pt" ? "Sim" : "Yes", value: "yes" },
              { label: lang === "pt" ? "Não" : "No", value: "no" }
            ]}
            required
          />
          {hasOtherNames === "yes" && (
            <FormInput 
              {...register("otherNames")} 
              placeholder={lang === "pt" ? "Informe os outros nomes" : "Enter other names"}
              className="animate-in slide-in-from-top-2 duration-300"
            />
          )}

          <FormRadioGroup
            label={ds.personal1.hasTelecode[lang]}
            value={hasTelecode}
            onValueChange={(val) => setValue("hasTelecode", val)}
            options={[
              { label: lang === "pt" ? "Sim" : "Yes", value: "yes" },
              { label: lang === "pt" ? "Não" : "No", value: "no" }
            ]}
            required
          />
          {hasTelecode === "yes" && (
            <FormInput
              label={lang === "pt" ? "Informe o telecódigo:" : "Enter telecode:"}
              {...register("telecodeValue")}
              onChange={(e) => setValue("telecodeValue", e.target.value.replace(/[^0-9]/g, ""))}
              className="animate-in slide-in-from-top-2 duration-300"
              required
            />
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 border-t border-border/50 pt-8 mt-4">
          <FormRadioGroup
            label={ds.personal1.gender[lang]}
            value={gender}
            onValueChange={(val) => setValue("gender", val)}
            options={[
              { label: ds.personal1.genderOptions.male[lang], value: "male" },
              { label: ds.personal1.genderOptions.female[lang], value: "female" }
            ]}
            required
          />

          <FormNativeSelect
            label={ds.personal1.maritalStatus[lang]}
            {...register("maritalStatus")}
            options={[
              { label: ds.personal1.maritalOptions.married[lang], value: "married" },
              { label: ds.personal1.maritalOptions.single[lang], value: "single" },
              { label: ds.personal1.maritalOptions.widowed[lang], value: "widowed" },
              { label: ds.personal1.maritalOptions.divorced[lang], value: "divorced" },
              { label: ds.personal1.maritalOptions.separated[lang], value: "separated" }
            ]}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 border-t border-border/50 pt-8">
          <FormInput 
            label={ds.personal1.dob[lang]} 
            type="date" 
            {...register("birthDate")} 
            icon={<Calendar className="h-4 w-4" />}
            required 
          />
          <FormInput
            label={ds.personal1.cityBirth[lang]}
            {...register("birthCity")}
            required
            onChange={(e) =>
              setValue("birthCity", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g, ""))
            }
          />
          <FormInput label={ds.personal1.stateBirth[lang]} {...register("birthState")} />
          <FormInput label={ds.personal1.countryBirth[lang]} {...register("birthCountry")} required />
        </div>
      </div>
    </div>
  );
};
