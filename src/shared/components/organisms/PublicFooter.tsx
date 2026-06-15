import { FaInstagram, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useT } from "@app/app/i18n";
import { AppLogo } from "../atoms/AppLogo";

export function PublicFooter() {
  const t = useT("footer");

  return (
    <footer className="border-t border-border/70 bg-bg px-8 pb-8 pt-16 lg:px-16">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 gap-12 border-b border-border/70 pb-14 text-sm lg:grid-cols-4">
          <div className="space-y-6">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <AppLogo className="h-10 w-auto object-contain" />
            </Link>
            <p className="max-w-sm leading-relaxed text-text-muted">{t.description}</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-text-muted transition-colors hover:text-text" aria-label="Instagram">
                <FaInstagram size={18} />
              </a>
              <a href="#" className="text-text-muted transition-colors hover:text-text" aria-label="LinkedIn">
                <FaLinkedinIn size={18} />
              </a>
              <a href="#" className="text-text-muted transition-colors hover:text-text" aria-label="WhatsApp">
                <FaWhatsapp size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-7 text-xs font-bold uppercase tracking-widest text-text">{t.servicesHeader}</h4>
            <ul className="space-y-4 text-text-muted">
              <li><Link to="/quem-somos" className="transition-colors hover:text-text">{t.howItWorks}</Link></li>
              <li><Link to="/servicos" className="transition-colors hover:text-text">{t.services}</Link></li>
              <li><Link to="/landing" className="transition-colors hover:text-text">{t.platform}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-7 text-xs font-bold uppercase tracking-widest text-text">{t.legalHeader}</h4>
            <ul className="space-y-4 text-text-muted">
              <li><Link to="/termos" className="transition-colors hover:text-text">{t.terms}</Link></li>
              <li><Link to="/privacidade" className="transition-colors hover:text-text">{t.privacy}</Link></li>
              <li><Link to="/reembolso" className="transition-colors hover:text-text">{t.refund}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-7 text-xs font-bold uppercase tracking-widest text-text">{t.contact}</h4>
            <ul className="space-y-4 text-text-muted">
              <li><a href="mailto:contato@aplikei.com.br" className="transition-colors hover:text-text">contato@aplikei.com.br</a></li>
              <li><a href="tel:+5511999999999" className="transition-colors hover:text-text">+55 (11) 99999-9999</a></li>
              <li><span>{t.copyright}</span></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 pt-8 text-xs text-text-muted sm:flex-row sm:items-center">
          <p>{t.description}</p>
          <div className="flex flex-wrap items-center gap-4 sm:justify-end sm:gap-6">
            <Link to="/termos" className="transition-colors hover:text-text">{t.terms}</Link>
            <Link to="/privacidade" className="transition-colors hover:text-text">{t.privacy}</Link>
            <Link to="/reembolso" className="transition-colors hover:text-text">{t.refund}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export const Footer = PublicFooter;
