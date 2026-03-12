import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepProps } from "../../types";

export const F1F2PassportStep = ({ register, lang, t }: StepProps) => {
  return (
    <div className="space-y-4 fade-in">
      <h2 className="font-display text-lg font-semibold text-foreground">
        {t.f1f2.steps[lang][3]}
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="passportNumberDS">{t.ds160.passport.number[lang]}</Label>
          <Input id="passportNumberDS" {...register("passportNumberDS")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="passportExpirationDate">{t.ds160.passport.expirationDate[lang]}</Label>
          <Input id="passportExpirationDate" type="date" {...register("passportExpirationDate")} />
        </div>
      </div>
    </div>
  );
};
