import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepProps } from "../../types";

export const SocialMediaStep = ({ register, watch, setValue, lang, t }: StepProps) => {
    const ds = t.ds160;

    return (
        <div className="space-y-6 fade-in">
            <h2 className="font-display text-lg font-semibold text-foreground">{ds.socialMedia.title[lang]}</h2>

            <p className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg border border-border">
                {ds.socialMedia.helper[lang]}
            </p>

            <div className="space-y-4 pt-4">
                <div className="space-y-2">
                    <Label htmlFor="socialMedia1">{ds.socialMedia.platformLabel[lang]} 1 *</Label>
                    <Input id="socialMedia1" {...register("socialMedia1")} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="socialMedia2">{ds.socialMedia.platformLabel[lang]} 2</Label>
                    <Input id="socialMedia2" {...register("socialMedia2")} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="socialMedia3">{ds.socialMedia.platformLabel[lang]} 3</Label>
                    <Input id="socialMedia3" {...register("socialMedia3")} />
                </div>
            </div>
        </div>
    );
};
