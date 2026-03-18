import { Input } from "@/presentation/components/atoms/input";
import { Label } from "@/presentation/components/atoms/label";
import { StepProps } from "../../types";

export function SocialMediaStep({
  register,
  formData,
  lang,
  t,
}: StepProps) {
  const sm = t.ds160.socialMedia;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <h2 className="text-title font-black tracking-tight">{sm.title[lang]}</h2>
        <p className="text-muted-foreground text-sm">
          {sm.helper[lang]}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="socialMedia1">
            {sm.platformLabel1[lang]}
          </Label>
          <Input
            id="socialMedia1"
            {...register("socialMedia1")}
            defaultValue={formData.socialMedia1 || ""}
            placeholder="Ex: Instagram - @joãosilva"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="socialMedia2">
            {sm.platformLabel2[lang]}
          </Label>
          <Input
            id="socialMedia2"
            {...register("socialMedia2")}
            defaultValue={formData.socialMedia2 || ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="socialMedia3">
            {sm.platformLabel3[lang]}
          </Label>
          <Input
            id="socialMedia3"
            {...register("socialMedia3")}
            defaultValue={formData.socialMedia3 || ""}
          />
        </div>
      </div>
    </div>
  );
}
