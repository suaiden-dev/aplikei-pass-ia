import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "@/i18n/LanguageContext";
import logoAplikei from "@/assets/logo-aplikei.png";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { lang, t } = useLanguage();

  const serviceLinks = t.servicesData.map((s) => ({
    to: `/servicos/${s.slug}`,
    label: s.shortTitle[lang],
  }));

  const navLinks = [
    { to: "/", label: t.nav.home[lang] },
    { to: "/como-funciona", label: t.nav.howItWorks[lang] },
    ...serviceLinks,
  ];

  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={logoAplikei} alt="Aplikei" className="h-8" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 lg:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium transition-colors hover:text-accent ${
                location.pathname === l.to ? "text-accent" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">{t.nav.login[lang]}</Link>
          </Button>
          <Button size="sm" className="bg-accent text-accent-foreground shadow-button hover:bg-green-dark" asChild>
            <Link to="/cadastro">{t.nav.getStarted[lang]}</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageToggle />
          <button onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border lg:hidden"
          >
            <nav className="container flex flex-col gap-4 py-4">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-accent"
                >
                  {l.label}
                </Link>
              ))}
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login" onClick={() => setOpen(false)}>{t.nav.login[lang]}</Link>
                </Button>
                <Button size="sm" className="bg-accent text-accent-foreground shadow-button" asChild>
                  <Link to="/cadastro" onClick={() => setOpen(false)}>{t.nav.getStarted[lang]}</Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
