import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepProps } from "../../types";

export const F1F2SEVIStep = ({ register, lang, t }: StepProps) => {
  return (
    <div className="space-y-4 fade-in">
      <h2 className="font-display text-lg font-semibold text-foreground">
        {t.f1f2.steps[lang][6]}
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sevisId">{t.f1f2.sevisId[lang]} *</Label>
          <Input id="sevisId" {...register("sevisId")} placeholder="Nxxxxxxxxx" />
        </div>
      </div>
    </div>
  );
};
