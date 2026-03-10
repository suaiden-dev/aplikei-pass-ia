import { Shield } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Terms() {
  const { lang, t } = useLanguage();
  const p = t.legal.terms;

  return (
    <div className="py-16">
      <div className="container max-w-3xl">
        <h1 className="font-display text-title-xl font-bold text-foreground">{p.title[lang]}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.legal.lastUpdated[lang]}</p>
        <div className="mt-5 space-y-4 text-sm text-foreground/80 leading-relaxed">
          {p.sections[lang].map((s, i) => (
            <section key={i}>
              <h2 className="font-display text-lg font-semibold text-foreground">{s.title}</h2>
              <p>{s.content}</p>
            </section>
          ))}
          <div className="rounded-md border-2 border-amber-300/50 bg-amber-50/60 p-4">
            <div className="flex items-start gap-2">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs text-foreground/70">{p.acceptNotice[lang]}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
