import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepProps } from "../../types";

export const F1F2TravelInfoStep = ({ register, lang, t }: StepProps) => {
  return (
    <div className="space-y-4 fade-in">
      <h2 className="font-display text-lg font-semibold text-foreground">
        {t.f1f2.steps[lang][1]}
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="arrivalDate">{t.ds160.travel.arrivalDate[lang]}</Label>
          <Input id="arrivalDate" type="date" {...register("arrivalDate")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expectedDuration">{t.ds160.travel.durationOptions.months[lang]}</Label>
          <Input id="expectedDuration" {...register("expectedDuration")} />
        </div>
      </div>
    </div>
  );
};
