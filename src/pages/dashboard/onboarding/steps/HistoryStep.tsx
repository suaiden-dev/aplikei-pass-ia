import { FormInput, FormNativeSelect } from "@/presentation/components/atoms/form/FormFields";
import { StepProps } from "../types";

export const HistoryStep = ({ register, o, lang }: StepProps) => {
    return (
        <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">{o.travelHistory[lang]}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormNativeSelect 
                    label={o.travelledBefore[lang]}
                    {...register("travelledBefore")}
                    options={[
                        { value: "yes", label: o.yes[lang] },
                        { value: "no", label: o.no[lang] }
                    ]}
                />
                <FormNativeSelect 
                    label={o.hadVisa[lang]}
                    {...register("hadVisa")}
                    options={[
                        { value: "no", label: o.no[lang] },
                        { value: "yesApproved", label: o.yesApproved[lang] },
                        { value: "yesDenied", label: o.yesDenied[lang] }
                    ]}
                />
                <FormInput label={o.countriesVisited[lang]} {...register("countriesVisited")} className="md:col-span-2" />
            </div>
        </div>
    );
};
