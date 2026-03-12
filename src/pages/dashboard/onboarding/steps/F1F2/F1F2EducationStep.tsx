import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepProps } from "../../types";

export const F1F2EducationStep = ({ register, lang, t }: StepProps) => {
  return (
    <div className="space-y-4 fade-in">
      <h2 className="font-display text-lg font-semibold text-foreground">
        {t.f1f2.steps[lang][5]}
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="schoolName">{t.f1f2.schoolName[lang]} *</Label>
          <Input id="schoolName" {...register("schoolName")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="schoolAddress">{t.f1f2.schoolAddress[lang]} *</Label>
          <Input id="schoolAddress" {...register("schoolAddress")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="courseName">{t.f1f2.courseName[lang]} *</Label>
          <Input id="courseName" {...register("courseName")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="courseStartDate">{t.f1f2.courseStartDate[lang]} *</Label>
          <Input id="courseStartDate" type="date" {...register("courseStartDate")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="courseEndDate">{t.f1f2.courseEndDate[lang]} *</Label>
          <Input id="courseEndDate" type="date" {...register("courseEndDate")} />
        </div>
      </div>
    </div>
  );
};
