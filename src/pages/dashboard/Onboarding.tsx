import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Upload, ChevronRight, ChevronLeft } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const { lang, t } = useLanguage();
  const o = t.onboardingPage;
  const steps = o.steps[lang];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">{o.title[lang]}</h1>
      <p className="mt-1 text-muted-foreground">{o.subtitle[lang]}</p>

      <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">{lang === "en" ? "Step" : lang === "pt" ? "Etapa" : "Paso"} {currentStep + 1} {o.stepOf[lang]} {steps.length}</span>
          <span className="text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="mt-3 h-2" />
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {steps.map((step, i) => (
            <button key={i} onClick={() => setCurrentStep(i)} className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${i === currentStep ? "bg-accent/10 text-accent" : i < currentStep ? "bg-muted text-foreground" : "text-muted-foreground"}`}>
              {i < currentStep ? <CheckCircle2 className="h-3.5 w-3.5 text-accent" /> : <Circle className="h-3.5 w-3.5" />}
              {step}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-card">
        {currentStep === 0 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">{o.personalData[lang]}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div><Label>{o.fullName[lang]}</Label><Input placeholder={o.asInPassport[lang]} className="mt-1" /></div>
              <div><Label>{o.dob[lang]}</Label><Input type="date" className="mt-1" /></div>
              <div><Label>{o.passportNumber[lang]}</Label><Input placeholder="Ex: AB123456" className="mt-1" /></div>
              <div><Label>{o.nationality[lang]}</Label><Input placeholder={lang === "en" ? "Brazilian" : lang === "pt" ? "Brasileira" : "Brasileña"} className="mt-1" /></div>
              <div className="md:col-span-2"><Label>{o.currentAddress[lang]}</Label><Input placeholder={o.fullAddress[lang]} className="mt-1" /></div>
            </div>
          </div>
        )}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">{o.travelHistory[lang]}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>{o.travelledBefore[lang]}</Label>
                <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>{o.no[lang]}</option>
                  <option>{o.yes[lang]}</option>
                </select>
              </div>
              <div>
                <Label>{o.hadVisa[lang]}</Label>
                <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>{o.no[lang]}</option>
                  <option>{o.yesApproved[lang]}</option>
                  <option>{o.yesDenied[lang]}</option>
                </select>
              </div>
              <div className="md:col-span-2"><Label>{o.countriesVisited[lang]}</Label><Input placeholder={o.countriesPlaceholder[lang]} className="mt-1" /></div>
            </div>
          </div>
        )}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">{o.processInfo[lang]}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div><Label>{o.travelPurpose[lang]}</Label><Input placeholder={o.travelPurposePlaceholder[lang]} className="mt-1" /></div>
              <div><Label>{o.expectedDate[lang]}</Label><Input type="date" className="mt-1" /></div>
              <div><Label>{o.expectedDuration[lang]}</Label><Input placeholder={o.durationPlaceholder[lang]} className="mt-1" /></div>
              <div><Label>{o.consulateCity[lang]}</Label><Input placeholder={lang === "en" ? "e.g., São Paulo" : lang === "pt" ? "Ex: São Paulo" : "Ej: São Paulo"} className="mt-1" /></div>
            </div>
          </div>
        )}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">{o.documentsTitle[lang]}</h2>
            <p className="text-sm text-muted-foreground">{o.documentsDesc[lang]}</p>
            <div className="space-y-3">
              {[o.docPassport[lang], o.docPhoto[lang], o.docFinancial[lang], o.docBond[lang]].map((doc, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-dashed border-border p-4">
                  <span className="text-sm text-foreground">{doc}</span>
                  <Button size="sm" variant="outline" className="gap-1"><Upload className="h-3.5 w-3.5" /> {o.upload[lang]}</Button>
                </div>
              ))}
            </div>
          </div>
        )}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">{o.finalReview[lang]}</h2>
            <p className="text-sm text-muted-foreground">{o.finalReviewDesc[lang]}</p>
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground italic">{o.fillPrevious[lang]}</p>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <Button variant="outline" disabled={currentStep === 0} onClick={() => setCurrentStep((s) => s - 1)}>
            <ChevronLeft className="mr-1 h-4 w-4" /> {o.previous[lang]}
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button className="bg-accent text-accent-foreground hover:bg-green-dark" onClick={() => setCurrentStep((s) => s + 1)}>
              {o.next[lang]} <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button className="bg-accent text-accent-foreground hover:bg-green-dark">{o.confirmGenerate[lang]}</Button>
          )}
        </div>
      </div>
    </div>
  );
}
