import { FormInput } from "@/presentation/components/atoms/form/FormFields";
import { StepProps } from "../types";
import { Plane } from "lucide-react";

export const ProcessStep = ({ register, o, lang }: StepProps) => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col space-y-1.5 border-b border-border/50 pb-4">
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <Plane className="h-6 w-6 text-primary" />
                    {o.processInfo[lang]}
                </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormInput label={o.travelPurpose[lang]} {...register("travelPurpose")} />
                <FormInput label={o.expectedDate[lang]} type="date" {...register("expectedDate")} />
                <FormInput label={o.expectedDuration[lang]} {...register("expectedDuration")} />
                <FormInput label={o.consulateCity[lang]} {...register("consulateCity")} />
            </div>
        </div>
    );
};
