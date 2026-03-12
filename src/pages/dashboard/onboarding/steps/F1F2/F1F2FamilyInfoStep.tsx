import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepProps } from "../../types";

export const F1F2FamilyInfoStep = ({ register, lang, t }: StepProps) => {
  return (
    <div className="space-y-4 fade-in">
      <h2 className="font-display text-lg font-semibold text-foreground">
        {t.f1f2.steps[lang][4]}
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fatherLastName">{t.ds160.family.fatherLast[lang]}</Label>
          <Input id="fatherLastName" {...register("fatherLastName")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fatherFirstName">{t.ds160.family.fatherFirst[lang]}</Label>
          <Input id="fatherFirstName" {...register("fatherFirstName")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="motherLastName">{t.ds160.family.motherLast[lang]}</Label>
          <Input id="motherLastName" {...register("motherLastName")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="motherFirstName">{t.ds160.family.motherFirst[lang]}</Label>
          <Input id="motherFirstName" {...register("motherFirstName")} />
        </div>
      </div>
    </div>
  );
};
