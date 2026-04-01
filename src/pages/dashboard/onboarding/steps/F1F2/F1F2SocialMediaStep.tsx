import { FormInput } from "@/presentation/components/atoms/form/FormFields";
import { StepProps } from "../../types";
import { Share2, Instagram, Linkedin, Twitter } from "lucide-react";

export const F1F2SocialMediaStep = ({ register, lang, t }: StepProps) => {
  const ds = t.ds160;
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-1.5 border-b border-border/50 pb-4">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Share2 className="h-6 w-6 text-primary" />
          {t.f1f2.steps[lang][5]}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{ds.socialMedia.helper[lang]}</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <FormInput
          label={ds.socialMedia.platformLabel1[lang]}
          {...register("socialMedia1")}
          placeholder="Ex: Instagram / @seuperfil"
          icon={<Instagram className="h-4 w-4" />}
        />
        <FormInput
          label={ds.socialMedia.platformLabel2[lang]}
          {...register("socialMedia2")}
          placeholder="Ex: LinkedIn / /in/seuperfil"
          icon={<Linkedin className="h-4 w-4" />}
        />
        <FormInput
          label={ds.socialMedia.platformLabel3[lang]}
          {...register("socialMedia3")}
          placeholder="Ex: Twitter / @seuperfil"
          icon={<Twitter className="h-4 w-4" />}
        />
      </div>
    </div>
  );
};
