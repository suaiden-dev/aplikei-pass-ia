import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import LanguageToggle from "@/presentation/components/molecules/LanguageToggle";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { session } = useAuth();
  const user = session?.user;
  const { lang, t } = useLanguage();
  const location = useLocation();

  const serviceLinks = t.servicesData.map((s) => ({
    to: `/servicos/${s.slug}`,
    label: s.shortTitle[lang],
  }));

  const navLinks = [
    { to: "/como-funciona", label: t.nav.howItWorks[lang] },
    ...serviceLinks,
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-24 flex items-center">
        {/* Logo */}
        <div className="flex-shrink-0 mr-8 xl:mr-12">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">A</div>
            <span className="text-xl font-extrabold tracking-tighter text-dark-grey uppercase group-hover:text-primary transition-colors">Aplikei</span>
          </Link>
        </div>
        
        {/* Centered Desktop Nav */}
        <div className="hidden min-[1100px]:flex flex-1 justify-center">
          <div className="flex items-center gap-4 xl:gap-8 font-bold text-slate-500">
            {navLinks.map((link) => (
              <Link 
                key={link.to} 
                to={link.to} 
                className={`hover:text-primary transition-all whitespace-nowrap text-[13px] xl:text-[14px] 2xl:text-base px-1 py-2 relative group-nav ${location.pathname === link.to ? 'text-primary' : ''}`}
              >
                {link.label}
                <div className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${location.pathname === link.to ? 'w-full' : 'w-0 group-nav-hover:w-full'}`} />
              </Link>
            ))}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 xl:gap-8 flex-shrink-0 ml-8 xl:ml-12">
          <div className="hidden md:block">
             <LanguageToggle />
          </div>
          <Link to="/login" className="hidden sm:block font-bold text-slate-500 hover:text-primary transition-colors whitespace-nowrap text-sm xl:text-base">
            {t.nav.login[lang]}
          </Link>
          <Link to="/cadastro" className="px-6 xl:px-9 py-3.5 bg-highlight text-white font-bold rounded-full hover:shadow-2xl hover:shadow-highlight/30 transition-all whitespace-nowrap text-sm xl:text-base border-b-4 border-black/10 active:border-b-0 active:translate-y-1 hover:-translate-y-0.5">
            {t.nav.getStarted[lang]}
          </Link>
          <button className="min-[1100px]:hidden p-2 text-primary hover:bg-slate-50 rounded-xl transition-colors" onClick={() => setOpen(!open)}>
            {open ? <X size={30} /> : <Menu size={30} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="min-[1100px]:hidden fixed inset-0 top-24 bg-white z-[40] p-8 flex flex-col gap-8 animate-in slide-in-from-bottom duration-500 overflow-y-auto">
          <div className="flex justify-between items-center bg-slate-50 p-5 rounded-3xl border border-slate-100">
            <span className="font-bold text-slate-400 text-xs uppercase tracking-widest italic">Configurações</span>
            <LanguageToggle />
          </div>
          
          <div className="grid gap-3">
            <span className="font-bold text-slate-400 text-xs uppercase tracking-widest pl-2">Menu</span>
            {navLinks.map((link) => (
              <Link 
                key={link.to} 
                to={link.to} 
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between font-extrabold p-5 rounded-2xl transition-all text-lg ${location.pathname === link.to ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-102' : 'bg-slate-50 text-slate-700 active:bg-slate-100 border border-slate-100'}`}
              >
                {link.label}
                {location.pathname === link.to && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
              </Link>
            ))}
          </div>
          
          <div className="mt-auto flex flex-col gap-4">
            <Link to="/login" onClick={() => setOpen(false)} className="w-full py-5 text-lg text-center font-bold text-slate-700 bg-slate-100 rounded-3xl border border-slate-200">
              {t.nav.login[lang]}
            </Link>
            <Link to="/cadastro" onClick={() => setOpen(false)} className="w-full py-5 text-lg text-center font-bold text-white bg-highlight rounded-3xl shadow-xl shadow-highlight/20 border-b-4 border-black/10">
              {t.nav.getStarted[lang]}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
