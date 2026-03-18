import { Input } from "@/presentation/components/atoms/input";
import { Label } from "@/presentation/components/atoms/label";
import { RadioGroup, RadioGroupItem } from "@/presentation/components/atoms/radio-group";
import { StepProps } from "../../types";

export const F1F2PassportStep = ({
  register,
  watch,
  setValue,
  lang,
  t,
}: StepProps) => {
  const ds = t.ds160;
  const pa = ds.passport;
  const hasPassportBeenLostStolen = watch("hasPassportBeenLostStolen");

  return (
    <div className="space-y-4 fade-in">
      <h2 className="font-display text-lg font-semibold text-foreground">
        {t.f1f2.steps[lang][6]}
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="passportType">{pa.type[lang]} *</Label>
          <select
            {...register("passportType")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          >
            <option value="">{pa.select[lang]}</option>
            <option value="regular">{pa.typeOptions.regular[lang]}</option>
            <option value="official">{pa.typeOptions.official[lang]}</option>
            <option value="diplomatic">{pa.typeOptions.diplomatic[lang]}</option>
            <option value="other">{pa.typeOptions.other[lang]}</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="passportNumberDS">{pa.number[lang]} *</Label>
          <Input
            id="passportNumberDS"
            {...register("passportNumberDS")}
            onChange={(e) =>
              setValue(
                "passportNumberDS",
                e.target.value.replace(/[^a-zA-Z0-9]/g, ""),
              )
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="passportIssuanceCountry">{pa.country[lang]} *</Label>
          <Input id="passportIssuanceCountry" {...register("passportIssuanceCountry")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="passportIssuanceCity">{pa.city[lang]} *</Label>
          <Input id="passportIssuanceCity" {...register("passportIssuanceCity")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="passportIssuanceState">{pa.state[lang]}</Label>
          <Input id="passportIssuanceState" {...register("passportIssuanceState")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="passportIssuanceDate">{pa.issuanceDate[lang]} *</Label>
          <Input id="passportIssuanceDate" type="date" {...register("passportIssuanceDate")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="passportExpirationDate">
            {pa.expirationDate[lang]} *
          </Label>
          <Input
            id="passportExpirationDate"
            type="date"
            {...register("passportExpirationDate")}
          />
        </div>
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <Label>{pa.lostStolen[lang]} *</Label>
        <RadioGroup
          onValueChange={(val) => setValue("hasPassportBeenLostStolen", val)}
          value={hasPassportBeenLostStolen}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="lost-yes" />
            <Label htmlFor="lost-yes">{pa.yes[lang]}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="lost-no" />
            <Label htmlFor="lost-no">{pa.no[lang]}</Label>
          </div>
        </RadioGroup>

        {hasPassportBeenLostStolen === "yes" && (
          <div className="mt-4 p-4 bg-muted/20 rounded-md border border-dashed border-border scale-in-center space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lostPassportNumberDetails">
                  {pa.lostPassportNumber[lang]} *
                </Label>
                <Input
                  id="lostPassportNumberDetails"
                  {...register("lostPassportNumberDetails")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lostPassportCountryDetails">
                  {pa.issuingCountry[lang]} *
                </Label>
                <Input
                  id="lostPassportCountryDetails"
                  {...register("lostPassportCountryDetails")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lostPassportExplanationDetails">
                {pa.explanationLabel[lang]} *
              </Label>
              <textarea
                id="lostPassportExplanationDetails"
                {...register("lostPassportExplanationDetails")}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
