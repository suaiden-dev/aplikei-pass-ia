import { Input } from "@/presentation/components/atoms/input";
import { Label } from "@/presentation/components/atoms/label";
import { RadioGroup, RadioGroupItem } from "@/presentation/components/atoms/radio-group";
import { StepProps } from "../../types";
import { Alert, AlertDescription } from "@/presentation/components/atoms/alert";
import {
  AlertCircle,
  Shield,
  Fingerprint,
  Calendar,
  User,
  Copy,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/atoms/select";
import { toast } from "sonner";
import { Button } from "@/presentation/components/atoms/button";

export const PersonalInfo1Step = ({
  register,
  watch,
  setValue,
  lang,
  t,
  securityData,
  errors,
}: StepProps) => {
  const ds = t.ds160;
  const hasOtherNames = watch("hasOtherNames");
  const gender = watch("gender");
  const maritalStatus = watch("maritalStatus");
  const hasTelecode = watch("hasTelecode");

  const handleCopy = (text: string | null | undefined) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(lang === "pt" ? "Copiado!" : "Copied!");
  };

  return (
    <div className="space-y-4 fade-in">
      <div className="rounded-md border border-primary/20 bg-primary/5 p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-display font-bold text-primary text-sm uppercase tracking-wider">
              {lang === "pt" ? "Instrução da Etapa" : "Stage Instruction"}
            </h4>
            <p className="text-primary/95 text-sm leading-relaxed font-medium">
              {ds.interview.fillNotice[lang]}
            </p>
          </div>
        </div>
      </div>

      <h2 className="font-display text-lg font-semibold text-foreground">
        {ds.personal1.title[lang]}
      </h2>

      <div className="space-y-3 pb-4 border-b border-border">
        <Label htmlFor="interviewLocation">
          {ds.interview.location[lang]} *
        </Label>
        <Select
          onValueChange={(value) => setValue("interviewLocation", value)}
          value={watch("interviewLocation")}
          required
        >
          <SelectTrigger id="interviewLocation" className={`w-full mt-1 ${errors?.interviewLocation ? "border-destructive" : ""}`}>
            <SelectValue
              placeholder={
                lang === "pt" ? "Selecione o local..." : "Select location..."
              }
            />
          </SelectTrigger>
          <SelectContent>
            {ds.interview.options.map(
              (
                option: { en: string; pt: string; es: string },
                index: number,
              ) => (
                <SelectItem key={index} value={option.en}>
                  {option[lang]}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">{ds.personal1.email[lang]} *</Label>
          <Input 
            id="email" 
            {...register("email", { required: true })} 
            autoComplete="email" 
            className={errors?.email ? "border-destructive" : ""}
          />
          {errors?.email && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
        </div>
      </div>

      <div className="space-y-4 rounded-md border border-border p-4 bg-muted/30">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="lastName">{ds.personal1.lastName[lang]} *</Label>
            <Input
              id="lastName"
              {...register("lastName", { required: true })}
              autoComplete="family-name"
              className={errors?.lastName ? "border-destructive" : ""}
              onChange={(e) =>
                setValue(
                  "lastName",
                  e.target.value.replace(
                    /[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g,
                    "",
                  ),
                )
              }
            />
            {errors?.lastName && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName">{ds.personal1.firstName[lang]} *</Label>
            <Input
              id="firstName"
              {...register("firstName", { required: true })}
              autoComplete="given-name"
              className={errors?.firstName ? "border-destructive" : ""}
              onChange={(e) =>
                setValue(
                  "firstName",
                  e.target.value.replace(
                    /[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g,
                    "",
                  ),
                )
              }
            />
            {errors?.firstName && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              {ds.personal1.fullNameHelper[lang]}
            </p>
          </div>
        </div>
        <div className="space-y-2 mt-2">
          <Label htmlFor="fullNamePassport">
            {ds.personal1.fullNamePassport[lang]} *
          </Label>
          <Input 
            id="fullNamePassport" 
            {...register("fullNamePassport", { required: true })} 
            className={errors?.fullNamePassport ? "border-destructive" : ""}
          />
          {errors?.fullNamePassport && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
        </div>
      </div>

      <div className="space-y-3">
        <Label>{ds.personal1.hasOtherNames[lang]} *</Label>
        <RadioGroup
          onValueChange={(val) => setValue("hasOtherNames", val)}
          value={hasOtherNames}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="names-yes" />
            <Label htmlFor="names-yes">{lang === "pt" ? "Sim" : "Yes"}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="names-no" />
            <Label htmlFor="names-no">{lang === "pt" ? "Não" : "No"}</Label>
          </div>
        </RadioGroup>
        {errors?.hasOtherNames && <p className="text-xs text-destructive">{lang === 'pt' ? 'Selecione uma opção' : 'Select an option'}</p>}
        {hasOtherNames === "yes" && (
          <div className="space-y-2">
            <Input 
              {...register("otherNames", { required: true })} 
              className={`mt-2 ${errors?.otherNames ? "border-destructive" : ""}`} 
              placeholder={lang === 'pt' ? 'Informe os outros nomes' : 'Enter other names'}
            />
            {errors?.otherNames && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label>{ds.personal1.hasTelecode[lang]} *</Label>
        <RadioGroup
          onValueChange={(val) => setValue("hasTelecode", val)}
          value={hasTelecode}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="telecode-yes" />
            <Label htmlFor="telecode-yes">
              {lang === "pt" ? "Sim" : "Yes"}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="telecode-no" />
            <Label htmlFor="telecode-no">{lang === "pt" ? "Não" : "No"}</Label>
          </div>
        </RadioGroup>
        {errors?.hasTelecode && <p className="text-xs text-destructive">{lang === 'pt' ? 'Selecione uma opção' : 'Select an option'}</p>}
        {hasTelecode === "yes" && (
          <div className="mt-2 space-y-2 scale-in-center">
            <Label htmlFor="telecodeValue">
              {lang === "pt" ? "Informe o telecódigo:" : "Enter telecode:"} *
            </Label>
            <Input
              id="telecodeValue"
              {...register("telecodeValue", { required: true })}
              className={errors?.telecodeValue ? "border-destructive" : ""}
              onChange={(e) =>
                setValue("telecodeValue", e.target.value.replace(/[^0-9]/g, ""))
              }
            />
            {errors?.telecodeValue && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 border-t border-border pt-4">
        <div className="space-y-3">
          <Label>{ds.personal1.gender[lang]} *</Label>
          <RadioGroup
            onValueChange={(val) => setValue("gender", val)}
            value={gender}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="gender-male" />
              <Label htmlFor="gender-male">
                {ds.personal1.genderOptions.male[lang]}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="gender-female" />
              <Label htmlFor="gender-female">
                {ds.personal1.genderOptions.female[lang]}
              </Label>
            </div>
          </RadioGroup>
          {errors?.gender && <p className="text-xs text-destructive">{lang === 'pt' ? 'Selecione uma opção' : 'Select an option'}</p>}
        </div>

        <div className="space-y-2">
          <Label>{ds.personal1.maritalStatus[lang]} *</Label>
          <select
            {...register("maritalStatus", { required: true })}
            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors?.maritalStatus ? "border-destructive" : ""}`}
          >
            <option value="">
              {lang === "pt" ? "Selecione..." : "Select..."}
            </option>
            <option value="married">
              {ds.personal1.maritalOptions.married[lang]}
            </option>
            <option value="single">
              {ds.personal1.maritalOptions.single[lang]}
            </option>
            <option value="widowed">
              {ds.personal1.maritalOptions.widowed[lang]}
            </option>
            <option value="divorced">
              {ds.personal1.maritalOptions.divorced[lang]}
            </option>
            <option value="separated">
              {ds.personal1.maritalOptions.separated[lang]}
            </option>
          </select>
          {errors?.maritalStatus && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 border-t border-border pt-4">
        <div className="space-y-2">
          <Label htmlFor="birthDate">{ds.personal1.dob[lang]} *</Label>
          <Input 
            id="birthDate" 
            type="date" 
            {...register("birthDate", { required: true })} 
            className={errors?.birthDate ? "border-destructive" : ""}
          />
          {errors?.birthDate && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="birthCity">{ds.personal1.cityBirth[lang]} *</Label>
            <Input
              id="birthCity"
              {...register("birthCity", { required: true })}
              className={errors?.birthCity ? "border-destructive" : ""}
              onChange={(e) =>
                setValue(
                  "birthCity",
                  e.target.value.replace(
                    /[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g,
                    "",
                  ),
                )
              }
            />
            {errors?.birthCity && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="birthState">{ds.personal1.stateBirth[lang]} *</Label>
          <Input 
            id="birthState" 
            {...register("birthState", { required: true })} 
            className={errors?.birthState ? "border-destructive" : ""}
          />
          {errors?.birthState && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="birthCountry">
            {ds.personal1.countryBirth[lang]} *
          </Label>
          <Input 
            id="birthCountry" 
            {...register("birthCountry", { required: true })} 
            className={errors?.birthCountry ? "border-destructive" : ""}
          />
          {errors?.birthCountry && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
        </div>
      </div>
    </div>
  );
};
