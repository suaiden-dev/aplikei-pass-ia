import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepProps } from "../../types";

export const F1F2PersonalInfoStep = ({ register, lang, t }: StepProps) => {
  return (
    <div className="space-y-4 fade-in">
      <h2 className="font-display text-lg font-semibold text-foreground">
        {t.f1f2.steps[lang][0]}
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">{t.ds160.personal1.firstName[lang]} *</Label>
          <Input id="firstName" {...register("firstName")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">{t.ds160.personal1.lastName[lang]} *</Label>
          <Input id="lastName" {...register("lastName")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t.ds160.personal1.email[lang]} *</Label>
          <Input id="email" {...register("email")} />
        </div>
      </div>
    </div>
  );
};
