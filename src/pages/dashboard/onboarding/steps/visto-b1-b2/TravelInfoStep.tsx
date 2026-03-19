import { Input } from "@/presentation/components/atoms/input";
import { Label } from "@/presentation/components/atoms/label";
import { RadioGroup, RadioGroupItem } from "@/presentation/components/atoms/radio-group";
import { StepProps } from "../../types";

export const TravelInfoStep = ({
  register,
  watch,
  setValue,
  lang,
  t,
  errors,
}: StepProps) => {
  const ds = t.ds160;
  const hasSpecificTravelPlan = watch("hasSpecificTravelPlan");
  const travelPayer = watch("travelPayer");

  return (
    <div className="space-y-4 fade-in">
      <h2 className="font-display text-lg font-semibold text-foreground">
        {ds.travel.title[lang]}
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
        {errors?.hasSpecificTravelPlan && <p className="text-xs text-destructive">{lang === 'pt' ? 'Selecione uma opção' : 'Select an option'}</p>}
      </div>

      {hasSpecificTravelPlan === "yes" && (
        <div className="space-y-4 rounded-md border border-border p-4 bg-muted/30 scale-in-center">
          <p className="text-xs text-muted-foreground mb-2">
            {lang === "pt"
              ? "Aqui você coloca a data que chegará nos EUA. Essa data é apenas uma previsão de viagem, não significa que você tem que já estar com as passagens compradas. O próprio consulado recomenda às pessoas que comprem suas passagens somente após estarem com visto em mãos."
              : "Provide your intended date of arrival. This is just an estimate; you don't need to have purchased tickets. The consulate recommends buying tickets only after getting the visa."}
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="arrivalDate">
                {ds.travel.arrivalDate[lang]} *
              </Label>
               <Input
                id="arrivalDate"
                type="date"
                {...register("arrivalDate", { required: true })}
                className={errors?.arrivalDate ? "border-destructive" : ""}
              />
              {errors?.arrivalDate && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="arrivalFlightNumber">
                {lang === "pt"
                  ? "Número do voo de chegada (se tiver):"
                  : "Arrival Flight Number (if any):"}
              </Label>
               <Input
                id="arrivalFlightNumber"
                {...register("arrivalFlightNumber", { required: true })}
                className={errors?.arrivalFlightNumber ? "border-destructive" : ""}
              />
              {errors?.arrivalFlightNumber && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="arrivalCity">
                {lang === "pt"
                  ? "Cidade que pretende chegar:"
                  : "Arrival City:"}
              </Label>
               <Input
                id="arrivalCity"
                {...register("arrivalCity", { required: true })}
                className={errors?.arrivalCity ? "border-destructive" : ""}
                onChange={(e) =>
                  setValue(
                    "arrivalCity",
                    e.target.value.replace(
                      /[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g,
                      "",
                    ),
                  )
                }
              />
              {errors?.arrivalCity && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
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
                {...register("departureDate", { required: true })}
                className={errors?.departureDate ? "border-destructive" : ""}
              />
              {errors?.departureDate && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="departureFlightNumber">
                {lang === "pt"
                  ? "Número do voo de saída (se tiver):"
                  : "Departure Flight Number (if any):"}
              </Label>
               <Input
                id="departureFlightNumber"
                {...register("departureFlightNumber", { required: true })}
                className={errors?.departureFlightNumber ? "border-destructive" : ""}
              />
              {errors?.departureFlightNumber && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="departureCity">
                {lang === "pt"
                  ? "Cidade que pretende sair:"
                  : "Departure City:"}
              </Label>
               <Input
                id="departureCity"
                {...register("departureCity", { required: true })}
                className={errors?.departureCity ? "border-destructive" : ""}
                onChange={(e) =>
                  setValue(
                    "departureCity",
                    e.target.value.replace(
                      /[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g,
                      "",
                    ),
                  )
                }
              />
              {errors?.departureCity && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
            </div>
          </div>
        </div>
      )}

      {hasSpecificTravelPlan === "no" && (
        <div className="space-y-4 rounded-md border border-border p-4 bg-muted/30 scale-in-center">
          <p className="text-xs text-muted-foreground mb-2">
            {lang === "pt"
              ? "Aqui você coloca a data que chegará nos EUA. Essa data é apenas uma previsão de viagem, não significa que você tem que já estar com as passagens compradas."
              : "Enter your intended arrival date. This is just an estimate; you don't need to have purchased tickets."}
          </p>
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
                {...register("arrivalDate", { required: true })}
                className={errors?.arrivalDate ? "border-destructive" : ""}
              />
              {errors?.arrivalDate && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
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
                  {...register("stayDurationValue", { required: true })}
                  className={`w-24 ${errors?.stayDurationValue ? "border-destructive" : ""}`}
                />
                <select
                  {...register("stayDurationUnit", { required: true })}
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors?.stayDurationUnit ? "border-destructive" : ""}`}
                >
                  <option value="days">
                    {lang === "pt" ? "Dias" : "Days"}
                  </option>
                  <option value="weeks">
                    {lang === "pt" ? "Semanas" : "Weeks"}
                  </option>
                  <option value="months">
                    {lang === "pt" ? "Meses" : "Months"}
                  </option>
                  <option value="years">
                    {lang === "pt" ? "Anos" : "Years"}
                  </option>
                  <option value="hours">
                    {lang === "pt" ? "Horas" : "Hours"}
                  </option>
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
             <Input 
              id="visitLocations" 
              {...register("visitLocations", { required: true })} 
              className={errors?.visitLocations ? "border-destructive" : ""}
            />
            {errors?.visitLocations && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              {lang === "pt"
                ? "Mencione aqui os locais que você planeja visitar, ponha todos que tem vontade de visitar."
                : "Mention here the places you plan to visit."}
            </p>
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <h3 className="text-md font-medium">
              {ds.travel.stayAddress[lang]}
            </h3>
            <p className="text-xs text-muted-foreground">
              {lang === "pt"
                ? "Endereço onde ficará nos EUA, se você não sabe ainda, coloque algum hotel como referência."
                : "Address where you will stay in the US. If you don't know yet, use a hotel as reference."}
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="stayAddress">
                   {lang === "pt" ? "Endereço:" : "Address:"} *
                </Label>
                <Input 
                  id="stayAddress" 
                  {...register("stayAddress", { required: true })} 
                  className={errors?.stayAddress ? "border-destructive" : ""}
                />
                {errors?.stayAddress && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
              </div>
              <div className="space-y-2">
                 <Label htmlFor="stayCity">{ds.travel.stayCity[lang]} *</Label>
                <Input
                  id="stayCity"
                  {...register("stayCity", { required: true })}
                  className={errors?.stayCity ? "border-destructive" : ""}
                  onChange={(e) =>
                    setValue(
                      "stayCity",
                      e.target.value.replace(
                        /[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g,
                        "",
                      ),
                    )
                  }
                />
                {errors?.stayCity && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
              </div>
              <div className="space-y-2">
                 <Label htmlFor="stayState">{ds.travel.stayState[lang]} *</Label>
                <Input
                  id="stayState"
                  {...register("stayState", { required: true })}
                  className={errors?.stayState ? "border-destructive" : ""}
                  onChange={(e) =>
                    setValue(
                      "stayState",
                      e.target.value.replace(
                        /[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g,
                        "",
                      ),
                    )
                  }
                />
                {errors?.stayState && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
              </div>
              <div className="space-y-2">
                 <Label htmlFor="stayZip">{ds.travel.stayZip[lang]} *</Label>
                <Input
                  id="stayZip"
                  {...register("stayZip", { required: true })}
                  className={errors?.stayZip ? "border-destructive" : ""}
                  maxLength={10}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9-]/g, "");
                    setValue("stayZip", value);
                  }}
                />
                {errors?.stayZip && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <Label>{ds.travel.payer[lang]} *</Label>
             <select
              {...register("travelPayer", { required: true })}
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors?.travelPayer ? "border-destructive" : ""}`}
            >
              <option value="">
                {lang === "pt" ? "Selecione..." : "Select..."}
              </option>
              <option value="self">{ds.travel.payerOptions.self[lang]}</option>
              <option value="other">
                {ds.travel.payerOptions.other[lang]}
              </option>
              <option value="org">{ds.travel.payerOptions.org[lang]}</option>
              <option value="employer">
                {ds.travel.payerOptions.employer[lang]}
              </option>
              <option value="usEmployer">
                {ds.travel.payerOptions.usEmployer[lang]}
              </option>
            </select>
            <p className="text-xs text-muted-foreground">
              {lang === "pt"
                ? "Self: Se for você mesmo. Other person: Se for outra pessoa e então deverá preencher o nome e o grau parentesco com você. Company/Organization: Marque essa opção se for o caso de uma empresa patrocinando sua viagem."
                : "Self: Yourself. Other person: Someone else (you'll need to provide name and relationship). Company/Organization: Sponsored by a company."}
            </p>

            {travelPayer === "other" && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-2 bg-muted/20 p-4 rounded-md border border-dashed border-border scale-in-center">
                <div className="space-y-2">
                   <Label>
                    {lang === "pt" ? "Nome do pagador:" : "Payer Name:"} *
                  </Label>
                  <Input
                    {...register("payerName", { required: true })}
                    className={errors?.payerName ? "border-destructive" : ""}
                    onChange={(e) =>
                      setValue(
                        "payerName",
                        e.target.value.replace(
                          /[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g,
                          "",
                        ),
                      )
                    }
                  />
                  {errors?.payerName && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                </div>
                <div className="space-y-2">
                   <Label>
                    {lang === "pt" ? "Parentesco/Relação:" : "Relationship:"} *
                  </Label>
                  <Input
                    {...register("payerRelationship", { required: true })}
                    className={errors?.payerRelationship ? "border-destructive" : ""}
                    onChange={(e) =>
                      setValue(
                        "payerRelationship",
                        e.target.value.replace(
                          /[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g,
                          "",
                        ),
                      )
                    }
                  />
                  {errors?.payerRelationship && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
