import { useLanguage } from "@/i18n/LanguageContext";

export default function Privacy() {
  const { lang, t } = useLanguage();
  const p = t.legal.privacy;

  return (
    <div className="py-16">
      <div className="container max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-foreground">{p.title[lang]}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.legal.lastUpdated[lang]}</p>
        <div className="mt-8 space-y-6 text-sm text-foreground/80 leading-relaxed">
          {p.sections[lang].map((s, i) => (
            <section key={i}>
              <h2 className="font-display text-lg font-semibold text-foreground">{s.title}</h2>
              <p>{s.content}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
