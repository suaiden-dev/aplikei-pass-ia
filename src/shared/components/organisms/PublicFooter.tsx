import { FaInstagram, FaTwitter } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useT } from "@app/app/i18n";
import { AppLogo } from "../atoms/AppLogo";

export function PublicFooter() {
  const t = useT("footer");

  return (
    <footer className="bg-bg px-8 pb-8 pt-20 lg:px-16">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 gap-12 border-b border-border/70 pb-16 text-center text-sm lg:grid-cols-3 lg:text-left">
          <div>
            <Link to="/" className="mb-6 flex items-center justify-center gap-2.5 lg:justify-start">
              <AppLogo className="h-10 w-auto object-contain" />
            </Link>
            <p className="mb-8 leading-relaxed text-text-muted">{t.description}</p>
            <div className="flex items-center justify-center gap-4 lg:justify-start">
              <a href="#" className="text-text-muted transition-colors hover:text-text" aria-label="Twitter">
                <FaTwitter size={18} />
              </a>
              <a href="#" className="text-text-muted transition-colors hover:text-text" aria-label="Instagram">
                <FaInstagram size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-7 text-xs font-bold uppercase tracking-widest text-text">{t.platform}</h4>
            <ul className="space-y-4 text-text-muted">
              <li><Link to="/quem-somos" className="transition-colors hover:text-text">{t.howItWorks}</Link></li>
              <li><Link to="#" className="transition-colors hover:text-text">{t.security}</Link></li>
              <li><Link to="#" className="transition-colors hover:text-text">{t.helpCenter}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-7 text-xs font-bold uppercase tracking-widest text-text">{t.contact}</h4>
            <ul className="space-y-4 text-text-muted">
              <li><a href="mailto:contato@aplikei.com.br" className="transition-colors hover:text-text">contato@aplikei.com.br</a></li>
              <li><a href="tel:+5511999999999" className="transition-colors hover:text-text">+55 (11) 99999-9999</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-text-muted">{t.copyright}</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-end sm:gap-6">
            <Link to="/termos" className="text-xs text-text-muted transition-colors hover:text-text">{t.terms}</Link>
            <Link to="/privacidade" className="text-xs text-text-muted transition-colors hover:text-text">{t.privacy}</Link>
            <Link to="/reembolso" className="text-xs text-text-muted transition-colors hover:text-text">{t.refund}</Link>

          </div>
        </div>
      </div>
    </footer>
  );
}

export const Footer = PublicFooter;
