import { Input } from "@/presentation/components/atoms/input";
import { Label } from "@/presentation/components/atoms/label";
import { StepProps } from "../types";

export const PersonalInfoStep = ({ register, o, lang }: StepProps) => {
    return (
        <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">{o.personalData[lang]}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div><Label>{o.fullName[lang]}</Label><Input {...register("fullName")} className="mt-1" /></div>
                <div><Label>{o.dob[lang]}</Label><Input type="date" {...register("dob")} className="mt-1" /></div>
                <div><Label>{o.passportNumber[lang]}</Label><Input {...register("passportNumber")} className="mt-1" /></div>
                <div><Label>{o.nationality[lang]}</Label><Input {...register("nationality")} className="mt-1" /></div>
                <div className="md:col-span-2"><Label>{o.currentAddress[lang]}</Label><Input {...register("currentAddress")} className="mt-1" /></div>
            </div>
        </div>
    );
};
