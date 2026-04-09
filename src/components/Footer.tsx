import { FaTwitter, FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";

export const Footer = () => {
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
              Step-by-step guide to simplify immigration processes.
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
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-7">Serviços</h4>
            <ul className="space-y-4">
              <li><Link to="/cadastro" className="text-slate-400 hover:text-white text-sm transition-colors">Visto de Turismo B1/B2</Link></li>
              <li><Link to="/cadastro" className="text-slate-400 hover:text-white text-sm transition-colors">Visto de Estudante F-1</Link></li>
              <li><Link to="/cadastro" className="text-slate-400 hover:text-white text-sm transition-colors">Extensão de Status</Link></li>
              <li><Link to="/cadastro" className="text-slate-400 hover:text-white text-sm transition-colors">Troca de Status</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-7">Plataforma</h4>
            <ul className="space-y-4">
              <li><Link to="/como-funciona" className="text-slate-400 hover:text-white text-sm transition-colors">Como Funciona</Link></li>
              <li><Link to="#" className="text-slate-400 hover:text-white text-sm transition-colors">Segurança de Dados</Link></li>
              <li><Link to="#" className="text-slate-400 hover:text-white text-sm transition-colors">Central de Ajuda</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-7">Contato</h4>
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
          <p className="text-slate-500 text-xs">
            © 2026 Aplikei Technologies. All rights reserved. Not a law firm, does not offer legal advice, and does not guarantee visa approval.
          </p>
          <div className="flex items-center gap-6">
            <Link to="#" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">Termos de Uso</Link>
            <Link to="#" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
