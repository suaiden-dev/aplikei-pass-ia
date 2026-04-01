import { FormInput, FormRadioGroup, FormNativeSelect } from "@/presentation/components/atoms/form/FormFields";
import { StepProps } from "../../types";
import { Plane, Calendar, MapPin, Users, Landmark, User } from "lucide-react";

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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-1.5 border-b border-border/50 pb-4">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Plane className="h-6 w-6 text-primary" />
          {t.f1f2.steps[lang][2]}
        </h2>
      </div>

      <div className="space-y-10">
        <FormRadioGroup
          label={ds.travel.specificPlan[lang]}
          value={hasSpecificTravelPlan}
          onValueChange={(val) => setValue("hasSpecificTravelPlan", val)}
          options={[
            { label: lang === "pt" ? "Sim" : "Yes", value: "yes" },
            { label: lang === "pt" ? "Não" : "No", value: "no" }
          ]}
          required
        />

        {hasSpecificTravelPlan === "yes" && (
          <div className="space-y-6 rounded-3xl border border-border/50 p-6 bg-muted/20 animate-in slide-in-from-top-2 duration-300">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 mb-4">
              <Calendar className="h-3 w-3" />
              Cronograma de Viagem
            </h4>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormInput
                label={ds.travel.arrivalDate[lang]}
                type="date"
                {...register("arrivalDate")}
                required
                icon={<Calendar className="h-4 w-4" />}
              />
              <FormInput
                label={lang === "pt" ? "Número do voo de chegada:" : "Arrival Flight Number:"}
                {...register("arrivalFlightNumber")}
                placeholder="Ex: AA123"
              />
              <FormInput
                label={lang === "pt" ? "Cidade de chegada:" : "Arrival City:"}
                {...register("arrivalCity")}
                icon={<MapPin className="h-4 w-4" />}
              />
              <FormInput
                label={lang === "pt" ? "Data de saída do país:" : "Departure Date:"}
                type="date"
                {...register("departureDate")}
                icon={<Calendar className="h-4 w-4" />}
              />
              <FormInput
                label={lang === "pt" ? "Número do voo de saída:" : "Departure Flight Number:"}
                {...register("departureFlightNumber")}
                placeholder="Ex: LH456"
              />
              <FormInput
                label={lang === "pt" ? "Cidade de saída:" : "Departure City:"}
                {...register("departureCity")}
                icon={<MapPin className="h-4 w-4" />}
              />
            </div>
          </div>
        )}

        {hasSpecificTravelPlan === "no" && (
          <div className="space-y-6 rounded-3xl border border-border/50 p-6 bg-muted/20 animate-in slide-in-from-top-2 duration-300">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 mb-4">
              <Calendar className="h-3 w-3" />
              Previsão de Viagem
            </h4>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormInput
                label={lang === "pt" ? "Data prevista de chegada:" : "Intended Arrival Date:"}
                type="date"
                {...register("arrivalDate")}
                required
                icon={<Calendar className="h-4 w-4" />}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {lang === "pt" ? "Duração prevista da estadia:" : "Intended Stay Duration:"} *
                </label>
                <div className="flex gap-2">
                  <FormInput type="number" {...register("stayDurationValue")} className="flex-1" />
                  <FormNativeSelect
                    {...register("stayDurationUnit")}
                    className="w-1/2"
                    options={[
                      { label: lang === "pt" ? "Dias" : "Days", value: "days" },
                      { label: lang === "pt" ? "Semanas" : "Weeks", value: "weeks" },
                      { label: lang === "pt" ? "Meses" : "Months", value: "months" },
                      { label: lang === "pt" ? "Anos" : "Years", value: "years" }
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {(hasSpecificTravelPlan === "yes" || hasSpecificTravelPlan === "no") && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <FormInput
              label={ds.travel.visitLocations[lang]}
              {...register("visitLocations")}
              required
              placeholder={lang === "pt" ? "Cidades, estados que visitará..." : "Cities, states to visit..."}
              icon={<MapPin className="h-4 w-4 text-primary" />}
            />

            <div className="space-y-6 pt-8 border-t border-border/50">
              <h3 className="text-sm font-bold flex items-center gap-2 text-foreground mb-4">
                <Landmark className="h-4 w-4 text-primary" />
                {ds.travel.stayAddress[lang]}
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <FormInput label={lang === "pt" ? "Endereço:" : "Address:"} {...register("stayAddress")} required />
                </div>
                <FormInput label={ds.travel.stayCity[lang]} {...register("stayCity")} required />
                <FormInput label={ds.travel.stayState[lang]} {...register("stayState")} required />
                <FormInput
                  label={ds.travel.stayZip[lang]}
                  {...register("stayZip")}
                  required
                  onChange={(e) => setValue("stayZip", e.target.value.replace(/[^0-9-]/g, ""))}
                />
              </div>
            </div>

            <div className="space-y-6 pt-8 border-t border-border/50">
              <FormNativeSelect
                label={ds.travel.payer[lang]}
                {...register("travelPayer")}
                required
                options={[
                  { label: lang === "pt" ? "Selecione..." : "Select...", value: "" },
                  { label: ds.travel.payerOptions.self[lang], value: "self" },
                  { label: ds.travel.payerOptions.other[lang], value: "other" },
                  { label: ds.travel.payerOptions.org[lang], value: "org" },
                  { label: ds.travel.payerOptions.employer[lang], value: "employer" },
                  { label: ds.travel.payerOptions.usEmployer[lang], value: "usEmployer" }
                ]}
              />

              {travelPayer === "other" && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 p-6 bg-muted/20 rounded-3xl border border-dashed border-primary/30 animate-in zoom-in-95 duration-300">
                  <FormInput label={lang === "pt" ? "Nome do pagador:" : "Payer Name:"} {...register("payerName")} required icon={<User className="h-4 w-4" />} />
                  <FormInput label={lang === "pt" ? "Parentesco/Relação:" : "Relationship:"} {...register("payerRelationship")} required />
                </div>
              )}
            </div>

            <div className="space-y-6 pt-8 border-t border-border/50">
              <FormRadioGroup
                label={t.ds160.companions.hasCompanions[lang]}
                value={hasTravelCompanions}
                onValueChange={(val) => setValue("hasTravelCompanions", val)}
                options={[
                  { label: lang === "pt" ? "Sim" : "Yes", value: "yes" },
                  { label: lang === "pt" ? "Não" : "No", value: "no" }
                ]}
                required
              />

              {hasTravelCompanions === "yes" && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 p-6 bg-muted/20 rounded-3xl border border-dashed border-primary/30 animate-in zoom-in-95 duration-300">
                  <FormInput label={lang === "pt" ? "Nome do acompanhante:" : "Companion Name:"} {...register("companionName")} required icon={<User className="h-4 w-4" />} />
                  <FormInput label={lang === "pt" ? "Parentesco/Relação:" : "Relationship:"} {...register("companionRelationship")} required />
                </div>
              )}
            </div>

            <div className="space-y-6 pt-8 border-t border-border/50">
              <FormRadioGroup
                label={t.ds160.companions.isGrpup[lang]}
                value={isTravelingWithGroup}
                onValueChange={(val) => setValue("isTravelingWithGroup", val)}
                options={[
                  { label: lang === "pt" ? "Sim" : "Yes", value: "yes" },
                  { label: lang === "pt" ? "Não" : "No", value: "no" }
                ]}
                required
              />

              {isTravelingWithGroup === "yes" && (
                <FormInput
                  label={lang === "pt" ? "Nome do grupo:" : "Group Name:"}
                  {...register("groupName")}
                  required
                  placeholder="Ex: Seleção Brasileira de Judô"
                  icon={<Users className="h-4 w-4 text-primary" />}
                  className="animate-in slide-in-from-top-2 duration-300"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
