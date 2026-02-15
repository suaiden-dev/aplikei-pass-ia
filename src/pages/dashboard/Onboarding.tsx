import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Upload, ChevronRight, ChevronLeft } from "lucide-react";

const steps = [
  "Dados pessoais",
  "Histórico de viagens",
  "Informações do processo",
  "Documentos",
  "Revisão final",
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">Onboarding</h1>
      <p className="mt-1 text-muted-foreground">Preencha as informações para montar seu pacote final.</p>

      {/* Progress bar */}
      <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Etapa {currentStep + 1} de {steps.length}</span>
          <span className="text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="mt-3 h-2" />
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {steps.map((step, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                i === currentStep
                  ? "bg-accent/10 text-accent"
                  : i < currentStep
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {i < currentStep ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
              ) : (
                <Circle className="h-3.5 w-3.5" />
              )}
              {step}
            </button>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-card">
        {currentStep === 0 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Dados pessoais</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Nome completo</Label>
                <Input placeholder="Como consta no passaporte" className="mt-1" />
              </div>
              <div>
                <Label>Data de nascimento</Label>
                <Input type="date" className="mt-1" />
              </div>
              <div>
                <Label>Número do passaporte</Label>
                <Input placeholder="Ex: AB123456" className="mt-1" />
              </div>
              <div>
                <Label>Nacionalidade</Label>
                <Input placeholder="Brasileira" className="mt-1" />
              </div>
              <div className="md:col-span-2">
                <Label>Endereço atual</Label>
                <Input placeholder="Endereço completo" className="mt-1" />
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Histórico de viagens</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Já viajou para os EUA antes?</Label>
                <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>Não</option>
                  <option>Sim</option>
                </select>
              </div>
              <div>
                <Label>Já teve visto americano?</Label>
                <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>Não</option>
                  <option>Sim, aprovado</option>
                  <option>Sim, negado</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <Label>Países visitados nos últimos 5 anos</Label>
                <Input placeholder="Ex: Portugal, Argentina, Japão" className="mt-1" />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Informações do processo</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Motivo da viagem</Label>
                <Input placeholder="Turismo, negócios, visita familiar..." className="mt-1" />
              </div>
              <div>
                <Label>Data prevista da viagem</Label>
                <Input type="date" className="mt-1" />
              </div>
              <div>
                <Label>Duração prevista</Label>
                <Input placeholder="Ex: 15 dias" className="mt-1" />
              </div>
              <div>
                <Label>Cidade do consulado</Label>
                <Input placeholder="Ex: São Paulo" className="mt-1" />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Documentos</h2>
            <p className="text-sm text-muted-foreground">
              Faça upload dos documentos necessários. Aceitos: PDF, JPG, PNG (máx. 10MB).
            </p>
            <div className="space-y-3">
              {["Passaporte (página principal)", "Foto 5x5cm", "Comprovante financeiro", "Comprovante de vínculo"].map(
                (doc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-dashed border-border p-4"
                  >
                    <span className="text-sm text-foreground">{doc}</span>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Upload className="h-3.5 w-3.5" /> Upload
                    </Button>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Revisão final</h2>
            <p className="text-sm text-muted-foreground">
              Revise todas as informações antes de confirmar. Após a confirmação, você poderá gerar o Pacote Final.
            </p>
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground italic">
                Preencha as etapas anteriores para ver o resumo aqui.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep((s) => s - 1)}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Anterior
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button
              className="bg-accent text-accent-foreground hover:bg-green-dark"
              onClick={() => setCurrentStep((s) => s + 1)}
            >
              Próximo <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button className="bg-accent text-accent-foreground hover:bg-green-dark">
              Confirmar e gerar pacote
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
