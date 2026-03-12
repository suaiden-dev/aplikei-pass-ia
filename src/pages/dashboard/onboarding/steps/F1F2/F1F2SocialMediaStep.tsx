import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepProps } from "../../types";

export const F1F2SocialMediaStep = ({ register, lang, t }: StepProps) => {
  return (
    <div className="space-y-4 fade-in">
      <h2 className="font-display text-lg font-semibold text-foreground">
        {t.f1f2.steps[lang][7]}
      </h2>
      <p className="text-sm text-muted-foreground">{t.ds160.socialMedia.helper[lang]}</p>
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="socialMedia1">{t.ds160.socialMedia.platformLabel1[lang]}</Label>
          <Input id="socialMedia1" {...register("socialMedia1")} placeholder="Ex: Instagram / @seuperfil" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="socialMedia2">{t.ds160.socialMedia.platformLabel2[lang]}</Label>
          <Input id="socialMedia2" {...register("socialMedia2" as "socialMedia1")} placeholder="Ex: LinkedIn / /in/seuperfil" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="socialMedia3">{t.ds160.socialMedia.platformLabel3[lang]}</Label>
          <Input id="socialMedia3" {...register("socialMedia3" as "socialMedia1")} placeholder="Ex: Twitter / @seuperfil" />
        </div>
      </div>
    </div>
  );
};
