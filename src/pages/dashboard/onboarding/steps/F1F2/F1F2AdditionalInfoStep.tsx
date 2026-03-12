import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepProps } from "../../types";

export const F1F2AdditionalInfoStep = ({ register, lang, t }: StepProps) => {
  return (
    <div className="space-y-4 fade-in">
      <h2 className="font-display text-lg font-semibold text-foreground">
        {t.f1f2.steps[lang][8]}
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="clanName">{t.ds160.additional.clanNameLabel[lang]}</Label>
          <Input id="clanName" {...register("clanName")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="languages">{t.ds160.additional.languages[lang]}</Label>
          <Input id="languages" {...register("languages" as "clanName")} />
        </div>
      </div>
    </div>
  );
};
