import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StepProps } from "../../types";

export const AdditionalInfoStep = ({ register, watch, setValue, lang, t }: StepProps) => {
    const ds = t.ds160;
    const belongsToClan = watch("belongsToClan");
    const hasVisitedOtherCountries = watch("hasVisitedOtherCountries");

    return (
        <div className="space-y-6 fade-in">
            <h2 className="font-display text-lg font-semibold text-foreground">{ds.additional.title[lang]}</h2>

            <div className="space-y-4">
                <div className="space-y-3">
                    <Label>{ds.additional.clanTribue[lang]} *</Label>
                    <RadioGroup
                        onValueChange={(val) => setValue("belongsToClan", val)}
                        value={belongsToClan}
                        className="flex gap-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="clan-yes" />
                            <Label htmlFor="clan-yes">{lang === 'pt' ? 'Sim' : 'Yes'}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="clan-no" />
                            <Label htmlFor="clan-no">{lang === 'pt' ? 'Não' : 'No'}</Label>
                        </div>
                    </RadioGroup>
                    {belongsToClan === "yes" && (
                        <div className="mt-2 space-y-2 scale-in-center">
                            <Label htmlFor="clanName">{lang === 'pt' ? 'Nome do clã ou tribo:' : 'Clan or tribe name:'} *</Label>
                            <Input id="clanName" {...register("clanName")} />
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="languagesSpoken">{ds.additional.languages[lang]} *</Label>
                    <Input id="languagesSpoken" {...register("languagesSpoken")} />
                </div>

                <div className="space-y-3 border-t border-border pt-4">
                    <Label>{lang === 'pt' ? 'Viajou para alguma região/país nos últimos cinco anos?' : 'Traveled to any region/country in the last five years?'} *</Label>
                    <RadioGroup
                        onValueChange={(val) => setValue("hasVisitedOtherCountries", val)}
                        value={hasVisitedOtherCountries}
                        className="flex gap-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="visited-yes" />
                            <Label htmlFor="visited-yes">{lang === 'pt' ? 'Sim' : 'Yes'}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="visited-no" />
                            <Label htmlFor="visited-no">{lang === 'pt' ? 'Não' : 'No'}</Label>
                        </div>
                    </RadioGroup>
                    {hasVisitedOtherCountries === "yes" && (
                        <div className="mt-2 space-y-2 scale-in-center">
                            <Label htmlFor="countriesVisitedDetails">{lang === 'pt' ? 'Liste os países e detalhes das viagens:' : 'List countries and travel details:'} *</Label>
                            <textarea
                                id="countriesVisitedDetails"
                                {...register("countriesVisitedDetails")}
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder={lang === 'pt' ? 'País, Data de partida, Data de retorno, Motivo...' : 'Country, Departure date, Return date, Purpose...'}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
