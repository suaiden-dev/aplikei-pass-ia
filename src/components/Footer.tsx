import { FaTwitter, FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useT } from "../i18n/LanguageContext";

export const Footer = () => {
  const t = useT("footer");
  return (
    <footer className="bg-highlight px-8 lg:px-16 pt-20 pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 pb-16 border-b border-slate-800">
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">A</span>
              </div>
              <span className="text-white font-black text-base tracking-widest uppercase">Aplikei</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              {t.description}
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <FaTwitter size={18} />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <FaInstagram size={18} />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-7">{t.services}</h4>
            <ul className="space-y-4">
              <li><Link to="/cadastro" className="text-slate-400 hover:text-white text-sm transition-colors">{t.vistoB1B2}</Link></li>
              <li><Link to="/cadastro" className="text-slate-400 hover:text-white text-sm transition-colors">{t.vistoF1}</Link></li>
              <li><Link to="/cadastro" className="text-slate-400 hover:text-white text-sm transition-colors">{t.extensaoStatus}</Link></li>
              <li><Link to="/cadastro" className="text-slate-400 hover:text-white text-sm transition-colors">{t.trocaStatus}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-7">{t.platform}</h4>
            <ul className="space-y-4">
              <li><Link to="/como-funciona" className="text-slate-400 hover:text-white text-sm transition-colors">{t.howItWorks}</Link></li>
              <li><Link to="#" className="text-slate-400 hover:text-white text-sm transition-colors">{t.security}</Link></li>
              <li><Link to="#" className="text-slate-400 hover:text-white text-sm transition-colors">{t.helpCenter}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-7">{t.contact}</h4>
            <ul className="space-y-4">
              <li>
                <a href="mailto:contato@aplikei.com.br" className="text-slate-400 hover:text-white text-sm transition-colors">
                  contato@aplikei.com.br
                </a>
              </li>
              <li>
                <a href="tel:+5511989890005" className="text-slate-400 hover:text-white text-sm transition-colors">
                  +55 (11) 98989-0005
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs text-balance">
            © 2026 Aplikei Technologies. {t.allRightsReserved}
          </p>
          <div className="flex items-center gap-6">
            <Link to="/legal/terms" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">{t.terms}</Link>
            <Link to="/legal/privacy" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">{t.privacy || "Privacy"}</Link>
            <Link to="/legal/refund" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">{t.refund || "Refund"}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
