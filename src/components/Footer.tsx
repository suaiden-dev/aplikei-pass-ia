import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import logoAplikei from "@/assets/logo-aplikei.png";

export default function Footer() {
  const { lang, t } = useLanguage();

  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <img src={logoAplikei} alt="Aplikei" className="h-28 w-auto -my-6 object-contain" />
            <p className="mt-2 text-sm text-primary-foreground/70">{t.footer.tagline[lang]}</p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground/50">
              {t.footer.servicesHeader[lang]}
            </h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              {t.servicesData.map((s) => (
                <li key={s.slug}>
                  <Link to={`/servicos/${s.slug}`} className="hover:text-accent transition-colors">
                    {s.shortTitle[lang]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground/50">
              {t.footer.platformHeader[lang]}
            </h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/como-funciona" className="hover:text-accent transition-colors">{t.footer.howItWorks[lang]}</Link></li>
              <li><Link to="/disclaimers" className="hover:text-accent transition-colors">{t.footer.disclaimers[lang]}</Link></li>
              <li><Link to="/dashboard/ajuda" className="hover:text-accent transition-colors">{t.footer.helpCenter[lang]}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground/50">
              {t.footer.legalHeader[lang]}
            </h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/termos" className="hover:text-accent transition-colors">{t.footer.terms[lang]}</Link></li>
              <li><Link to="/privacidade" className="hover:text-accent transition-colors">{t.footer.privacy[lang]}</Link></li>
              <li><Link to="/reembolso" className="hover:text-accent transition-colors">{t.footer.refund[lang]}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-foreground/10 pt-6">
          <p className="text-center text-xs text-primary-foreground/40">
            © {new Date().getFullYear()} Aplikei. {t.footer.copyright[lang]}
          </p>
        </div>
      </div>
    </footer>
  );
}
