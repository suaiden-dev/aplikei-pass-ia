import { Input } from "@/presentation/components/atoms/input";
import { Label } from "@/presentation/components/atoms/label";
import { StepProps } from "../../types";

export const F1F2SocialMediaStep = ({ register, lang, t }: StepProps) => {
  const ds = t.ds160;
  return (
    <div className="space-y-4 fade-in">
      <h2 className="font-display text-lg font-semibold text-foreground">
        {t.f1f2.steps[lang][5]}
      </h2>
      <p className="text-sm text-muted-foreground">{ds.socialMedia.helper[lang]}</p>
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="socialMedia1">{ds.socialMedia.platformLabel1[lang]}</Label>
          <Input 
            id="socialMedia1" 
            {...register("socialMedia1")} 
            placeholder="Ex: Instagram / @seuperfil" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="socialMedia2">{ds.socialMedia.platformLabel2[lang]}</Label>
          <Input 
            id="socialMedia2" 
            {...register("socialMedia2")} 
            placeholder="Ex: LinkedIn / /in/seuperfil" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="socialMedia3">{ds.socialMedia.platformLabel3[lang]}</Label>
          <Input 
            id="socialMedia3" 
            {...register("socialMedia3")} 
            placeholder="Ex: Twitter / @seuperfil" 
          />
        </div>
      </div>
    </div>
  );
};
