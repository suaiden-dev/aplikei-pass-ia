import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepProps } from "../../types";

export const OpenDS160Step = ({ register, lang, t }: StepProps) => {
  return (
    <div className="space-y-4 fade-in">
      <h2 className="font-display text-lg font-semibold text-foreground">
        DS-160 Application
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="f1f2ApplicationId">Application ID *</Label>
          <Input id="f1f2ApplicationId" {...register("f1f2ApplicationId")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="f1f2ConsulateLocation">Consulate Location *</Label>
          <Input id="f1f2ConsulateLocation" {...register("f1f2ConsulateLocation")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="f1f2SecurityAnswer">Security Answer *</Label>
          <Input id="f1f2SecurityAnswer" {...register("f1f2SecurityAnswer")} />
        </div>
      </div>
    </div>
  );
};
