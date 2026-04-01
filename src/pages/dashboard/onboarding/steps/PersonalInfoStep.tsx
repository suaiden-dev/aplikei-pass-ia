import { FormInput } from "@/presentation/components/atoms/form/FormFields";
import { StepProps } from "../types";

export const PersonalInfoStep = ({ register, o, lang }: StepProps) => {
    return (
        <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">{o.personalData[lang]}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormInput label={o.fullName[lang]} {...register("fullName")} />
                <FormInput label={o.dob[lang]} type="date" {...register("dob")} />
                <FormInput label={o.passportNumber[lang]} {...register("passportNumber")} />
                <FormInput label={o.nationality[lang]} {...register("nationality")} />
                <FormInput label={o.currentAddress[lang]} {...register("currentAddress")} className="md:col-span-2" />
            </div>
        </div>
    );
};
