import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StepProps } from "../../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const PersonalInfo1Step = ({
  register,
  watch,
  setValue,
  lang,
  t,
}: StepProps) => {
  const ds = t.ds160;
  const hasOtherNames = watch("hasOtherNames");
  const gender = watch("gender");
  const maritalStatus = watch("maritalStatus");
  const hasTelecode = watch("hasTelecode");

  return (
    <div className="space-y-6 fade-in">
      <h2 className="font-display text-lg font-semibold text-foreground">
        {ds.personal1.title[lang]}
      </h2>

      <div className="space-y-3 pb-6 border-b border-border">
        <Label htmlFor="interviewLocation">
          {ds.interview.location[lang]} *
        </Label>
        <Select
          onValueChange={(value) => setValue("interviewLocation", value)}
          value={watch("interviewLocation")}
        >
          <SelectTrigger id="interviewLocation" className="w-full mt-1">
            <SelectValue
              placeholder={
                lang === "pt" ? "Selecione o local..." : "Select location..."
              }
            />
          </SelectTrigger>
          <SelectContent>
            {ds.interview.options.map((option: any, index: number) => (
              <SelectItem key={index} value={option.en}>
                {option[lang]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">{ds.personal1.email[lang]} *</Label>
          <Input id="email" {...register("email")} autoComplete="email" />
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-border p-4 bg-muted/30">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="lastName">{ds.personal1.lastName[lang]} *</Label>
            <Input
              id="lastName"
              {...register("lastName")}
              autoComplete="family-name"
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName">{ds.personal1.firstName[lang]} *</Label>
            <Input
              id="firstName"
              {...register("firstName")}
              autoComplete="given-name"
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
            <p className="text-xs text-muted-foreground mt-1">
              {ds.personal1.fullNameHelper[lang]}
            </p>
          </div>
        </div>
        <div className="space-y-2 mt-2">
          <Label htmlFor="fullNamePassport">
            {ds.personal1.fullNamePassport[lang]}
          </Label>
          <Input id="fullNamePassport" {...register("fullNamePassport")} />
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
        {hasOtherNames === "yes" && (
          <Input {...register("otherNames")} className="mt-2" />
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
        {hasTelecode === "yes" && (
          <div className="mt-2 space-y-2 scale-in-center">
            <Label htmlFor="telecodeValue">
              {lang === "pt" ? "Informe o telecódigo:" : "Enter telecode:"} *
            </Label>
            <Input
              id="telecodeValue"
              {...register("telecodeValue")}
              onChange={(e) =>
                setValue("telecodeValue", e.target.value.replace(/[^0-9]/g, ""))
              }
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 border-t border-border pt-6">
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
        </div>

        <div className="space-y-2">
          <Label>{ds.personal1.maritalStatus[lang]} *</Label>
          <select
            {...register("maritalStatus")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 border-t border-border pt-6">
        <div className="space-y-2">
          <Label htmlFor="birthDate">{ds.personal1.dob[lang]} *</Label>
          <Input id="birthDate" type="date" {...register("birthDate")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="birthCity">{ds.personal1.cityBirth[lang]} *</Label>
          <Input
            id="birthCity"
            {...register("birthCity")}
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
        </div>
        <div className="space-y-2">
          <Label htmlFor="birthState">{ds.personal1.stateBirth[lang]}</Label>
          <Input id="birthState" {...register("birthState")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="birthCountry">
            {ds.personal1.countryBirth[lang]} *
          </Label>
          <Input id="birthCountry" {...register("birthCountry")} />
        </div>
      </div>
    </div>
  );
};
