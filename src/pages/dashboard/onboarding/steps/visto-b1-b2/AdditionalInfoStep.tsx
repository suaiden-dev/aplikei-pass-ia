import { Input } from "@/presentation/components/atoms/input";
import { Label } from "@/presentation/components/atoms/label";
import { RadioGroup, RadioGroupItem } from "@/presentation/components/atoms/radio-group";
import { StepProps } from "../../types";

export const AdditionalInfoStep = ({ register, watch, setValue, lang, t }: StepProps) => {
    const ds = t.ds160;
    const ai = ds.additional;
    const belongsToClan = watch("belongsToClan");
    const hasVisitedOtherCountries = watch("hasVisitedOtherCountries");

    return (
        <div className="space-y-4 fade-in">
            <h2 className="font-display text-lg font-semibold text-foreground">{ai.title[lang]}</h2>

            <div className="space-y-4">
                <div className="space-y-3">
                    <Label>{ai.clanTribue[lang]} *</Label>
                    <RadioGroup
                        onValueChange={(val) => setValue("belongsToClan", val)}
                        value={belongsToClan}
                        className="flex gap-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="clan-yes" />
                            <Label htmlFor="clan-yes">{ai.yes[lang]}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="clan-no" />
                            <Label htmlFor="clan-no">{ai.no[lang]}</Label>
                        </div>
                    </RadioGroup>
                    {belongsToClan === "yes" && (
                        <div className="mt-2 space-y-2 scale-in-center">
                            <Label htmlFor="clanName">{ai.clanNameLabel[lang]} *</Label>
                            <Input id="clanName" {...register("clanName")} />
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="languagesSpoken">{ai.languages[lang]} *</Label>
                    <Input id="languagesSpoken" {...register("languagesSpoken")} />
                </div>

                <div className="space-y-3 border-t border-border pt-4">
                    <Label>{ai.countries5Years[lang]} *</Label>
                    <RadioGroup
                        onValueChange={(val) => setValue("hasVisitedOtherCountries", val)}
                        value={hasVisitedOtherCountries}
                        className="flex gap-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="visited-yes" />
                            <Label htmlFor="visited-yes">{ai.yes[lang]}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="visited-no" />
                            <Label htmlFor="visited-no">{ai.no[lang]}</Label>
                        </div>
                    </RadioGroup>
                    {hasVisitedOtherCountries === "yes" && (
                        <div className="mt-2 space-y-2 scale-in-center">
                            <Label htmlFor="countriesVisitedDetails">{ai.listCountriesLabel[lang]} *</Label>
                            <textarea
                                id="countriesVisitedDetails"
                                {...register("countriesVisitedDetails")}
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder={ai.travelDetailsPlaceholder[lang]}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
