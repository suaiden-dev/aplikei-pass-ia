import { Button } from "@/presentation/components/atoms/button";
import { FileText, Download, Clock, Shield } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function PackagePDF() {
  const { lang, t } = useLanguage();
  const p = t.packagePDF;

  return (
    <div>
      <h1 className="font-display text-title font-bold text-foreground">{p.title[lang]}</h1>
      <p className="mt-1 text-muted-foreground">{p.subtitle[lang]}</p>

      <div className="mt-4 rounded-md border-2 border-amber-300/50 bg-amber-50/60 p-4">
        <div className="flex items-start gap-2">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs text-foreground/70">{p.disclaimer[lang]}</p>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-border bg-card p-5 text-center shadow-card">
        <FileText className="mx-auto h-12 w-12 text-accent" />
        <h2 className="mt-4 font-display text-lg font-semibold text-foreground">{p.generate[lang]}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{p.generateDesc[lang]}</p>
        <Button className="mt-4 bg-accent text-accent-foreground shadow-button hover:bg-green-dark" disabled>{p.generateBtn[lang]}</Button>
      </div>

      <div className="mt-4 rounded-md border border-border bg-card p-4 shadow-card">
        <h3 className="font-display font-semibold text-foreground">{p.pdfContains[lang]}</h3>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {p.pdfItems[lang].map((item, i) => (
            <li key={i} className="flex items-start gap-2"><FileText className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {item}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <h3 className="font-display font-semibold text-foreground">{p.history[lang]}</h3>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between rounded-md border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">{p.finalPackage[lang]} — v1.0</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">2026-02-10</span>
                  <span className="text-xs text-muted-foreground">• {p.draft[lang]}</span>
                </div>
              </div>
            </div>
            <Button size="sm" variant="outline" disabled><Download className="mr-1 h-3.5 w-3.5" /> {p.download[lang]}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
