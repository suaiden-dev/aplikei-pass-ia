import { Input } from "@/presentation/components/atoms/input";
import { Label } from "@/presentation/components/atoms/label";
import { RadioGroup, RadioGroupItem } from "@/presentation/components/atoms/radio-group";
import { StepProps } from "../../types";

export const CompanionsStep = ({
  register,
  watch,
  setValue,
  lang,
  t,
  errors,
}: StepProps) => {
  const ds = t.ds160;
  const hasTravelCompanions = watch("hasTravelCompanions");
  const isTravelingWithGroup = watch("isTravelingWithGroup");

  return (
    <div className="space-y-4 fade-in">
      <h2 className="font-display text-lg font-semibold text-foreground">
        {ds.companions.title[lang]}
      </h2>

      <div className="space-y-3">
        <Label>{ds.companions.hasCompanions[lang]} *</Label>
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
        {errors?.hasTravelCompanions && <p className="text-xs text-destructive">{lang === 'pt' ? 'Selecione uma opção' : 'Select an option'}</p>}
        <p className="text-xs text-muted-foreground mt-1">
          {ds.companions.companionHelper[lang]}
        </p>

        {hasTravelCompanions === "yes" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-2 bg-muted/20 p-4 rounded-md border border-dashed border-border scale-in-center">
            <div className="space-y-2">
               <Label>
                {lang === "pt" ? "Nome do acompanhante:" : "Companion Name:"} *
              </Label>
              <Input
                {...register("companionName", { required: true })}
                className={errors?.companionName ? "border-destructive" : ""}
                onChange={(e) =>
                  setValue(
                    "companionName",
                    e.target.value.replace(
                      /[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g,
                      "",
                    ),
                  )
                }
              />
              {errors?.companionName && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
            </div>
            <div className="space-y-2">
               <Label>
                {lang === "pt" ? "Parentesco/Relação:" : "Relationship:"} *
              </Label>
              <Input
                {...register("companionRelationship", { required: true })}
                className={errors?.companionRelationship ? "border-destructive" : ""}
                onChange={(e) =>
                  setValue(
                    "companionRelationship",
                    e.target.value.replace(
                      /[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g,
                      "",
                    ),
                  )
                }
              />
              {errors?.companionRelationship && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <Label>{ds.companions.isGrpup[lang]} *</Label>
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
        {errors?.isTravelingWithGroup && <p className="text-xs text-destructive">{lang === 'pt' ? 'Selecione uma opção' : 'Select an option'}</p>}

        {isTravelingWithGroup === "yes" && (
          <div className="mt-4 space-y-2 scale-in-center">
            <Label htmlFor="groupName">
              {lang === "pt" ? "Nome do grupo:" : "Group Name:"} *
            </Label>
             <Input 
              id="groupName" 
              {...register("groupName", { required: true })} 
              className={errors?.groupName ? "border-destructive" : ""}
            />
            {errors?.groupName && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
          </div>
        )}
      </div>
    </div>
  );
};
