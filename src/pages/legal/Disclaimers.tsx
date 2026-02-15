import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Disclaimers() {
  const { lang, t } = useLanguage();
  const d = t.legal.disclaimersPage;

  return (
    <div className="py-16">
      <div className="container max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-foreground">{d.title[lang]}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{d.readCarefully[lang]}</p>

        <div className="mt-8 space-y-6">
          <div className="rounded-xl border-2 border-amber-300/50 bg-amber-50/60 p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
              <Shield className="h-5 w-5 text-amber-600" />
              {d.natureTitle[lang]}
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-foreground/80">
              {d.natureItems[lang].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <span dangerouslySetInnerHTML={{ __html: `<strong>${item.split(" ").slice(0, 4).join(" ")}</strong> ${item.split(" ").slice(4).join(" ")}` }} />
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-lg font-bold text-foreground">{d.offersTitle[lang]}</h2>
            <ul className="mt-4 space-y-2 text-sm text-foreground/80">
              {d.offersItems[lang].map((item, i) => (
                <li key={i} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-lg font-bold text-foreground">{d.supportTitle[lang]}</h2>
            <p className="mt-3 text-sm text-foreground/80"><strong>{d.supportDesc[lang]}</strong></p>
            <ul className="mt-3 space-y-1.5 text-sm text-foreground/80">
              {d.supportItems[lang].map((item, i) => <li key={i}>• {item}</li>)}
            </ul>
            <p className="mt-4 text-sm font-medium text-destructive">{d.supportWarning[lang]}</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-lg font-bold text-foreground">{d.recommendationTitle[lang]}</h2>
            <p className="mt-3 text-sm text-foreground/80">{d.recommendationDesc[lang]}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
