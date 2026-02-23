import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepProps } from "../types";

export const HistoryStep = ({ register, o, lang }: StepProps) => {
    return (
        <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">{o.travelHistory[lang]}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <Label>{o.travelledBefore[lang]}</Label>
                    <select {...register("travelledBefore")} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="no">{o.no[lang]}</option>
                        <option value="yes">{o.yes[lang]}</option>
                    </select>
                </div>
                <div>
                    <Label>{o.hadVisa[lang]}</Label>
                    <select {...register("hadVisa")} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="no">{o.no[lang]}</option>
                        <option value="yesApproved">{o.yesApproved[lang]}</option>
                        <option value="yesDenied">{o.yesDenied[lang]}</option>
                    </select>
                </div>
                <div className="md:col-span-2"><Label>{o.countriesVisited[lang]}</Label><Input {...register("countriesVisited")} className="mt-1" /></div>
            </div>
        </div>
    );
};
