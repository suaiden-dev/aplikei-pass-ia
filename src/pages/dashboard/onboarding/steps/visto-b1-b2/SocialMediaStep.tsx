import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
        <h2 className="text-title font-black tracking-tight">{sm.title}</h2>
        <p className="text-muted-foreground text-sm">
          {sm.helper}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="social_media_1">
            {sm.platformLabel1}
          </Label>
          <Input
            id="social_media_1"
            {...register("social_media_1")}
            defaultValue={formData.social_media_1 || ""}
            placeholder="Ex: Instagram - @joãosilva"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="social_media_2">
            {sm.platformLabel2}
          </Label>
          <Input
            id="social_media_2"
            {...register("social_media_2")}
            defaultValue={formData.social_media_2 || ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="social_media_3">
            {sm.platformLabel3}
          </Label>
          <Input
            id="social_media_3"
            {...register("social_media_3")}
            defaultValue={formData.social_media_3 || ""}
          />
        </div>
      </div>
    </div>
  );
}
