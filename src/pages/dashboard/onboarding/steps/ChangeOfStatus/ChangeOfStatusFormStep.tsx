import { 
  FormInput, 
  FormGroup 
} from "@/presentation/components/atoms/form/FormFields";
import { Label } from "@/presentation/components/atoms/label";
import { RadioGroup, RadioGroupItem } from "@/presentation/components/atoms/radio-group";
import { DocumentStepProps } from "../../types";
import { Button } from "@/presentation/components/atoms/button";
import { Plus, Trash2, Info, AlertTriangle, ExternalLink, Globe, GraduationCap, Building2, Church, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFieldArray } from "react-hook-form";
import { COSProductFlow } from "@/domain/flows/strategies/COSProductFlow";

export const ChangeOfStatusFormStep = ({
  register,
  watch,
  setValue,
  lang,
  t,
  control,
}: DocumentStepProps & { control: any }) => {
  const cos = (t as any).changeOfStatus;
  const labels = cos.labels;
  
  const currentVisa = watch("currentVisa");
  const targetVisa = watch("targetVisa");
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "dependents",
  });

  const dependents = watch("dependents") || [];

  // Options for visas
  const currentVisaOptions = [
    { value: "b1/b2", label: "B1/B2", icon: Globe, color: "text-blue-500", bg: "bg-blue-50" },
    { value: "f1/f2", label: "F1/F2", icon: GraduationCap, color: "text-green-500", bg: "bg-green-50" },
    { value: "j1/j2", label: "J1/J2", icon: Globe, color: "text-purple-500", bg: "bg-purple-50" },
    { value: "l1/l2", label: "L1/L2", icon: Building2, color: "text-orange-500", bg: "bg-orange-50" },
    { value: "r1/r2", label: "R1/R2", icon: Church, color: "text-red-500", bg: "bg-red-50" },
    { value: "other", label: lang === "pt" ? "Outro" : "Other", icon: MoreHorizontal, color: "text-slate-500", bg: "bg-slate-50" },
  ];

  const targetVisaOptions = [
    { value: "f1/f2", label: "F1/F2", icon: GraduationCap, color: "text-green-600", bg: "bg-green-50" },
    { value: "b1/b2", label: "B1/B2", icon: Globe, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-1.5 border-b border-border pb-4">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
          {cos.formTitle[lang]}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lang === "pt" ? "Preencha as informações para sua troca de status." : "Fill in the information for your change of status."}
        </p>
      </div>

      {/* 1. Visa Information */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <FormGroup label={labels.currentVisa[lang]} required className="space-y-4">
          <RadioGroup
            onValueChange={(val) => setValue("currentVisa", val)}
            value={currentVisa}
            className="grid grid-cols-2 gap-3"
          >
            {currentVisaOptions.map((opt) => (
              <div 
                key={opt.value} 
                className={cn(
                  "flex items-center space-x-3 rounded-2xl border p-4 transition-all duration-300 cursor-pointer shadow-sm",
                  currentVisa === opt.value 
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20 scale-[1.02]" 
                    : "border-border bg-card hover:border-primary/50 hover:bg-accent/5"
                )}
                onClick={() => setValue("currentVisa", opt.value)}
              >
                <div className={cn("p-2 rounded-xl", opt.bg, opt.color)}>
                  <opt.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`curr-${opt.value}`} className="cursor-pointer text-sm font-bold block">{opt.label}</Label>
                    <RadioGroupItem value={opt.value} id={`curr-${opt.value}`} className="sr-only" />
                  </div>
                </div>
              </div>
            ))}
          </RadioGroup>
          {currentVisa === "other" && (
            <FormInput 
              {...register("currentVisaOther")} 
              placeholder={labels.placeholderOther[lang]}
              className="mt-2"
            />
          )}
        </FormGroup>

        <FormGroup label={labels.targetVisa[lang]} required className="space-y-4">
          <RadioGroup
            onValueChange={(val) => setValue("targetVisa", val)}
            value={targetVisa}
            className="grid grid-cols-2 gap-3"
          >
            {targetVisaOptions.map((opt) => (
              <div 
                key={opt.value} 
                className={cn(
                  "flex items-center space-x-3 rounded-2xl border p-4 transition-all duration-300 cursor-pointer shadow-sm",
                  targetVisa === opt.value 
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20 scale-[1.02]" 
                    : "border-border bg-card hover:border-primary/50 hover:bg-accent/5"
                )}
                onClick={() => setValue("targetVisa", opt.value)}
              >
                <div className={cn("p-2 rounded-xl", opt.bg, opt.color)}>
                  <opt.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`target-${opt.value}`} className="cursor-pointer text-sm font-bold block">{opt.label}</Label>
                    <RadioGroupItem value={opt.value} id={`target-${opt.value}`} className="sr-only" />
                  </div>
                </div>
              </div>
            ))}
          </RadioGroup>
        </FormGroup>
      </div>

      {/* 2. I-94 Information */}
      <FormGroup 
        label={labels.i94Date[lang]} 
        required 
        className="rounded-2xl border border-border bg-primary/5 p-6"
        hint={
          <a 
            href="https://i94.cbp.dhs.gov/I94/#/recent-search" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-primary flex items-center gap-1 hover:underline mt-1"
          >
            {labels.i94Instruction[lang]} <ExternalLink className="h-3 w-3" />
          </a>
        }
      >
        <FormInput 
          id="i94Date" 
          type="date" 
          {...register("i94AuthorizedStayDate")} 
          className="max-w-xs"
        />
      </FormGroup>

      {/* 3. Dependent Management */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h3 className="font-display text-lg font-bold">{labels.addDependent[lang]}</h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => append({ name: "", relationship: "child", birthDate: "" })}
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> {lang === "pt" ? "Adicionar" : "Add"}
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field: any, index: number) => {
            const dep = dependents[index];
            const validation = COSProductFlow.validateDependent(dep?.birthDate || "", dep?.relationship || "child", dep?.marriageDate);
            
            return (
              <div key={field.id} className="relative rounded-2xl border border-border bg-card p-6 shadow-sm animate-in slide-in-from-top-2 border-l-4 border-l-primary/40 transition-all hover:shadow-md">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-3 right-3 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <FormInput 
                    label={labels.dependentName[lang]} 
                    {...register(`dependents.${index}.name` as const)} 
                    placeholder="Name" 
                    className="border-border h-11" 
                  />
                  
                  <FormGroup label={labels.relationship[lang]} className="space-y-2">
                    <RadioGroup 
                      value={dep?.relationship || "child"} 
                      onValueChange={(val) => setValue(`dependents.${index}.relationship` as const, val)}
                      className="flex gap-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="spouse" id={`rel-spouse-${index}`} className="border-primary text-primary" />
                        <Label htmlFor={`rel-spouse-${index}`} className="text-xs font-medium">{lang === "pt" ? "Cônjuge" : "Spouse"}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="child" id={`rel-child-${index}`} className="border-primary text-primary" />
                        <Label htmlFor={`rel-child-${index}`} className="text-xs font-medium">{lang === "pt" ? "Filho" : "Child"}</Label>
                      </div>
                    </RadioGroup>
                  </FormGroup>

                  <FormInput 
                    label={labels.birthDate[lang]} 
                    type="date" 
                    {...register(`dependents.${index}.birthDate` as const)} 
                    className="border-border h-11" 
                  />

                  {dep?.relationship === "spouse" && (
                    <FormInput 
                      label={labels.marriageDate[lang]} 
                      type="date" 
                      {...register(`dependents.${index}.marriageDate` as const)} 
                      className="border-border h-11 md:col-span-2 lg:col-span-1" 
                    />
                  )}
                </div>

                {/* Alerts */}
                {validation.alerts.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {validation.alerts.map((alertKey: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 p-3 rounded-lg text-xs font-medium bg-warning/10 text-warning border border-warning/20">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>{(cos.alerts as any)[alertKey][lang]}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
