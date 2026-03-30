import { Input } from "@/presentation/components/atoms/input";
import { Label } from "@/presentation/components/atoms/label";
import { StepProps } from "../../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/atoms/select";
import { Button } from "@/presentation/components/atoms/button";
import { Plus, Trash2, AlertCircle, HelpCircle, ExternalLink, Shield, Calendar, User } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/presentation/components/atoms/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/atoms/card";
import { Checkbox } from "@/presentation/components/atoms/checkbox";
import * as React from "react";
import { useEffect, useState, useMemo } from "react";

export const ChangeOfStatusFormStep = ({
  register,
  watch,
  setValue,
  control,
  errors,
  lang,
  t,
}: StepProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "cosDependentsList",
  });

  const visaOrigin = watch("visaOrigin");
  const dependentsValue = watch("cosDependentsList");
  const dependents = useMemo(() => dependentsValue || [], [dependentsValue]);

  // Logic for warnings
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    const newWarnings: string[] = [];
    
    // Check dependents for child age > 21 logic
    dependents.forEach((dep, index: number) => {
      if (dep.relationship === "child" && dep.birthDate) {
        const birth = new Date(dep.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        if (age >= 21) {
          newWarnings.push(lang === 'pt' 
            ? `Dependente #${index + 1}: Filhos acima de 21 anos não são elegíveis como dependentes.`
            : `Dependent #${index + 1}: Children over 21 are not eligible as dependents.`);
        } else if (age >= 19) {
          newWarnings.push(lang === 'pt'
            ? `Dependente #${index + 1}: Este filho está próximo dos 21 anos. A elegibilidade pode expirar durante o processo.`
            : `Dependent #${index + 1}: This child is nearing 21. Eligibility may expire during the process.`);
        }
      }
    });

    setWarnings(newWarnings);
  }, [dependents, lang]);

  return (
    <div className="space-y-6 fade-in">
       {/* Instruction Card */}
       <div className="rounded-md border border-primary/20 bg-primary/5 p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-display font-bold text-primary text-sm uppercase tracking-wider">
              {lang === "pt" ? "Coleta de Informações" : "Information Collection"}
            </h4>
            <p className="text-primary/95 text-sm leading-relaxed font-medium">
              {lang === "pt" 
                ? "Por favor, preencha as informações abaixo com atenção para verificarmos a sua elegibilidade e de seus dependentes."
                : "Please fill in the information below carefully so we can verify the eligibility of you and your dependents."}
            </p>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((w, i) => (
            <Alert key={i} variant="warning" className="animate-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{lang === 'pt' ? 'Atenção' : 'Warning'}</AlertTitle>
              <AlertDescription>{w}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {lang === 'pt' ? 'Informações de Visto' : 'Visa Information'}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{lang === 'pt' ? 'Visto Atual (Origem)' : 'Current Visa (Origin)'} *</Label>
            <Select 
              value={visaOrigin} 
              onValueChange={(val) => setValue && setValue("visaOrigin", val)}
            >
              <SelectTrigger className={errors?.visaOrigin ? "border-destructive" : ""}>
                <SelectValue placeholder={lang === 'pt' ? 'Selecione...' : 'Select...'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="B1B2">B1/B2</SelectItem>
                <SelectItem value="J1J2">J1/J2</SelectItem>
                <SelectItem value="R1R2">R1/R2</SelectItem>
                <SelectItem value="L1L2">L1/L2</SelectItem>
                <SelectItem value="OTHER">{lang === 'pt' ? 'Outro' : 'Other'}</SelectItem>
              </SelectContent>
            </Select>
            {visaOrigin === "OTHER" && (
              <Input 
                {...register("visaOriginOther")}
                placeholder={lang === 'pt' ? 'Especifique o visto' : 'Specify visa'}
                className="mt-2"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>{lang === 'pt' ? 'Visto Pretendido (Destino)' : 'Target Visa (Destination)'} *</Label>
            <Select 
              value={watch("visaDestination")} 
              onValueChange={(val) => setValue && setValue("visaDestination", val)}
            >
              <SelectTrigger className={errors?.visaDestination ? "border-destructive" : ""}>
                <SelectValue placeholder={lang === 'pt' ? 'Selecione...' : 'Select...'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="F1F2">F1/F2</SelectItem>
                <SelectItem value="B1B2">B1/B2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* I-94 Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {lang === 'pt' ? 'Permanência (I-94)' : 'Stay (I-94)'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="i94date">{lang === 'pt' ? 'Data de permanência autorizada (I-94)' : 'Authorized stay date (I-94)'} *</Label>
            <Input 
              id="i94date" 
              type="date" 
              {...register("i94ExpirationDate", { required: true })} 
              className={errors?.i94ExpirationDate ? "border-destructive" : ""}
            />
            <a 
              href="https://i94.cbp.dhs.gov/I94/#/home" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1 mt-1 font-medium"
            >
              <HelpCircle className="w-3 h-3" />
              {lang === 'pt' ? 'Não sei onde encontrar essa data' : "I don't know where to find this data"}
              <ExternalLink className="w-2 h-2" />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Dependents Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {lang === 'pt' ? 'Dependentes' : 'Dependents'}
          </h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => append({ fullName: "", relationship: "spouse" as const, birthDate: "", isBiologicalLegalChild: false })}
            className="gap-2 border-primary/20 text-primary hover:bg-primary/5"
          >
            <Plus className="w-4 h-4" />
            {lang === 'pt' ? 'Adicionar Dependente' : 'Add Dependent'}
          </Button>
        </div>

        {fields.length === 0 && (
          <p className="text-sm text-muted-foreground italic bg-muted/30 p-4 rounded-md border border-dashed">
            {lang === 'pt' ? 'Nenhum dependente adicionado.' : 'No dependents added.'}
          </p>
        )}

        {fields.map((field, index) => {
          const relationship = watch(`cosDependentsList.${index}.relationship`);
          return (
            <Card key={field.id} className="relative overflow-hidden group border-primary/10">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-muted-foreground hover:text-destructive transition-colors"
                onClick={() => remove(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>{lang === 'pt' ? 'Nome Completo' : 'Full Name'} *</Label>
                  <Input {...register(`cosDependentsList.${index}.fullName` as const, { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label>{lang === 'pt' ? 'Parentesco' : 'Relationship'} *</Label>
                  <Select 
                    onValueChange={(val) => setValue && setValue(`cosDependentsList.${index}.relationship` as const, val as "spouse" | "child")}
                    value={relationship}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={lang === 'pt' ? 'Selecione...' : 'Select...'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spouse">{lang === 'pt' ? 'Cônjuge' : 'Spouse'}</SelectItem>
                      <SelectItem value="child">{lang === 'pt' ? 'Filho(a)' : 'Child'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{lang === 'pt' ? 'Data de Nascimento' : 'Date of Birth'} *</Label>
                  <Input 
                    type="date" 
                    {...register(`cosDependentsList.${index}.birthDate` as const, { required: true })} 
                  />
                </div>

                {relationship === "spouse" && (
                  <div className="space-y-2 md:col-span-1 border-t md:border-t-0 md:pt-0 pt-4">
                    <Label>{lang === 'pt' ? 'Data do Casamento' : 'Wedding Date'} *</Label>
                    <Input 
                      type="date" 
                      {...register(`cosDependentsList.${index}.weddingDate` as const, { required: true })} 
                    />
                  </div>
                )}
                
                {relationship === "child" && (
                  <div className="flex items-center space-x-3 md:col-span-2 pt-2 md:pt-6">
                    <Checkbox 
                      id={`bio-${index}`}
                      checked={watch(`cosDependentsList.${index}.isBiologicalLegalChild`)}
                      onCheckedChange={(val) => setValue && setValue(`cosDependentsList.${index}.isBiologicalLegalChild` as const, !!val)}
                    />
                    <Label htmlFor={`bio-${index}`} className="text-xs font-normal cursor-pointer leading-tight text-muted-foreground">
                      {lang === 'pt' 
                        ? 'Confirmo que é filho biológico ou legalmente adotado sob minha guarda.' 
                        : 'I confirm this is a biological or legally adopted child under my care.'}
                    </Label>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
