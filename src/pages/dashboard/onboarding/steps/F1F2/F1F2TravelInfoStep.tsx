import { Input } from "@/presentation/components/atoms/input";
import { Label } from "@/presentation/components/atoms/label";
import { RadioGroup, RadioGroupItem } from "@/presentation/components/atoms/radio-group";
import { StepProps } from "../../types";

export const F1F2TravelInfoStep = ({
  register,
  watch,
  setValue,
  lang,
  t,
}: StepProps) => {
  const ds = t.ds160;
  const hasSpecificTravelPlan = watch("hasSpecificTravelPlan");
  const travelPayer = watch("travelPayer");
  const hasTravelCompanions = watch("hasTravelCompanions");
  const isTravelingWithGroup = watch("isTravelingWithGroup");

  return (
    <div className="space-y-4 fade-in">
      <h2 className="font-display text-lg font-semibold text-foreground">
        {t.f1f2.steps[lang][2]}
      </h2>

      <div className="space-y-3">
        <Label>{ds.travel.specificPlan[lang]} *</Label>
        <RadioGroup
          onValueChange={(val) => setValue("hasSpecificTravelPlan", val)}
          value={hasSpecificTravelPlan}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="plan-yes" />
            <Label htmlFor="plan-yes">{lang === "pt" ? "Sim" : "Yes"}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="plan-no" />
            <Label htmlFor="plan-no">{lang === "pt" ? "Não" : "No"}</Label>
          </div>
        </RadioGroup>
      </div>

      {hasSpecificTravelPlan === "yes" && (
        <div className="space-y-4 rounded-md border border-border p-4 bg-muted/30 scale-in-center">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="arrivalDate">
                {ds.travel.arrivalDate[lang]} *
              </Label>
              <Input
                id="arrivalDate"
                type="date"
                {...register("arrivalDate")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="arrivalFlightNumber">
                {lang === "pt"
                  ? "Número do voo de chegada (se tiver):"
                  : "Arrival Flight Number (if any):"}
              </Label>
              <Input
                id="arrivalFlightNumber"
                {...register("arrivalFlightNumber")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="arrivalCity">
                {lang === "pt"
                  ? "Cidade que pretende chegar:"
                  : "Arrival City:"}
              </Label>
              <Input
                id="arrivalCity"
                {...register("arrivalCity")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="departureDate">
                {lang === "pt"
                  ? "Data que pretende sair dos EUA:"
                  : "Date of Departure from US:"}
              </Label>
              <Input
                id="departureDate"
                type="date"
                {...register("departureDate")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="departureFlightNumber">
                {lang === "pt"
                  ? "Número do voo de saída (se tiver):"
                  : "Departure Flight Number (if any):"}
              </Label>
              <Input
                id="departureFlightNumber"
                {...register("departureFlightNumber")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="departureCity">
                {lang === "pt"
                  ? "Cidade que pretende sair:"
                  : "Departure City:"}
              </Label>
              <Input
                id="departureCity"
                {...register("departureCity")}
              />
            </div>
          </div>
        </div>
      )}

      {hasSpecificTravelPlan === "no" && (
        <div className="space-y-4 rounded-md border border-border p-4 bg-muted/30 scale-in-center">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="arrivalDate">
                {lang === "pt"
                  ? "Data prevista de chegada:"
                  : "Intended Arrival Date:"}{" "}
                *
              </Label>
              <Input
                id="arrivalDate"
                type="date"
                {...register("arrivalDate")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stayDurationValue">
                {lang === "pt"
                  ? "Duração prevista da estadia:"
                  : "Intended Stay Duration:"}{" "}
                *
              </Label>
              <div className="flex gap-2">
                <Input
                  id="stayDurationValue"
                  type="number"
                  {...register("stayDurationValue")}
                  className="w-24"
                />
                <select
                  {...register("stayDurationUnit")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="days">{lang === "pt" ? "Dias" : "Days"}</option>
                  <option value="weeks">{lang === "pt" ? "Semanas" : "Weeks"}</option>
                  <option value="months">{lang === "pt" ? "Meses" : "Months"}</option>
                  <option value="years">{lang === "pt" ? "Anos" : "Years"}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {(hasSpecificTravelPlan === "yes" || hasSpecificTravelPlan === "no") && (
        <>
          <div className="space-y-2">
            <Label htmlFor="visitLocations">
              {ds.travel.visitLocations[lang]} *
            </Label>
            <Input id="visitLocations" {...register("visitLocations")} />
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <h3 className="text-md font-medium">
              {ds.travel.stayAddress[lang]}
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="stayAddress">
                  {lang === "pt" ? "Endereço:" : "Address:"}
                </Label>
                <Input id="stayAddress" {...register("stayAddress")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stayCity">{ds.travel.stayCity[lang]}</Label>
                <Input id="stayCity" {...register("stayCity")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stayState">{ds.travel.stayState[lang]}</Label>
                <Input id="stayState" {...register("stayState")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stayZip">{ds.travel.stayZip[lang]}</Label>
                <Input
                  id="stayZip"
                  {...register("stayZip")}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9-]/g, "");
                    setValue("stayZip", value);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <Label>{ds.travel.payer[lang]} *</Label>
            <select
              {...register("travelPayer")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">
                {lang === "pt" ? "Selecione..." : "Select..."}
              </option>
              <option value="self">{ds.travel.payerOptions.self[lang]}</option>
              <option value="other">{ds.travel.payerOptions.other[lang]}</option>
              <option value="org">{ds.travel.payerOptions.org[lang]}</option>
              <option value="employer">{ds.travel.payerOptions.employer[lang]}</option>
              <option value="usEmployer">{ds.travel.payerOptions.usEmployer[lang]}</option>
            </select>

            {travelPayer === "other" && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-2 bg-muted/20 p-4 rounded-md border border-dashed border-border scale-in-center">
                <div className="space-y-2">
                  <Label>
                    {lang === "pt" ? "Nome do pagador:" : "Payer Name:"}
                  </Label>
                  <Input {...register("payerName")} />
                </div>
                <div className="space-y-2">
                  <Label>
                    {lang === "pt" ? "Parentesco/Relação:" : "Relationship:"}
                  </Label>
                  <Input {...register("payerRelationship")} />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <Label>{t.ds160.companions.hasCompanions[lang]} *</Label>
            <RadioGroup
              onValueChange={(val) => setValue("hasTravelCompanions", val)}
              value={hasTravelCompanions}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="comp-yes" />
                <Label htmlFor="comp-yes">{lang === "pt" ? "Sim" : "Yes"}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="comp-no" />
                <Label htmlFor="comp-no">{lang === "pt" ? "Não" : "No"}</Label>
              </div>
            </RadioGroup>

            {hasTravelCompanions === "yes" && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-2 bg-muted/20 p-4 rounded-md border border-dashed border-border scale-in-center">
                <div className="space-y-2">
                  <Label>
                    {lang === "pt" ? "Nome do acompanhante:" : "Companion Name:"}
                  </Label>
                  <Input {...register("companionName")} />
                </div>
                <div className="space-y-2">
                  <Label>
                    {lang === "pt" ? "Parentesco/Relação:" : "Relationship:"}
                  </Label>
                  <Input {...register("companionRelationship")} />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <Label>{t.ds160.companions.isGrpup[lang]} *</Label>
            <RadioGroup
              onValueChange={(val) => setValue("isTravelingWithGroup", val)}
              value={isTravelingWithGroup}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="group-yes" />
                <Label htmlFor="group-yes">{lang === "pt" ? "Sim" : "Yes"}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="group-no" />
                <Label htmlFor="group-no">{lang === "pt" ? "Não" : "No"}</Label>
              </div>
            </RadioGroup>

            {isTravelingWithGroup === "yes" && (
              <div className="mt-4 space-y-2 scale-in-center">
                <Label htmlFor="groupName">
                  {lang === "pt" ? "Nome do grupo:" : "Group Name:"} *
                </Label>
                <Input id="groupName" {...register("groupName")} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
