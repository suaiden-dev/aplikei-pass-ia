import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepProps } from "../types";

export const ProcessStep = ({ register, o, lang }: StepProps) => {
    return (
        <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">{o.processInfo[lang]}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div><Label>{o.travelPurpose[lang]}</Label><Input {...register("travelPurpose")} className="mt-1" /></div>
                <div><Label>{o.expectedDate[lang]}</Label><Input type="date" {...register("expectedDate")} className="mt-1" /></div>
                <div><Label>{o.expectedDuration[lang]}</Label><Input {...register("expectedDuration")} className="mt-1" /></div>
                <div><Label>{o.consulateCity[lang]}</Label><Input {...register("consulateCity")} className="mt-1" /></div>
            </div>
        </div>
    );
};
