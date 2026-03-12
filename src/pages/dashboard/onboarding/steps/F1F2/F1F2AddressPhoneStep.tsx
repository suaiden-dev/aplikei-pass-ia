import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepProps } from "../../types";

export const F1F2AddressPhoneStep = ({ register, lang, t }: StepProps) => {
  return (
    <div className="space-y-4 fade-in">
      <h2 className="font-display text-lg font-semibold text-foreground">
        {t.f1f2.steps[lang][2]}
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="homeAddress">{t.ds160.addressPhone.homeAddress[lang]}</Label>
          <Input id="homeAddress" {...register("homeAddress")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mobilePhone">{t.ds160.addressPhone.mobilePhone[lang]}</Label>
          <Input id="mobilePhone" {...register("mobilePhone")} />
        </div>
      </div>
    </div>
  );
};
