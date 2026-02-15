import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/como-funciona", label: "Como funciona" },
  { to: "/servicos", label: "Serviços" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isHero = location.pathname === "/";

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-display text-xl font-bold text-primary">
          Aplikei
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
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

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Entrar</Link>
          </Button>
          <Button size="sm" className="bg-accent text-accent-foreground shadow-button hover:bg-green-dark" asChild>
            <Link to="/cadastro">Começar agora</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border md:hidden"
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
                  <Link to="/login" onClick={() => setOpen(false)}>Entrar</Link>
                </Button>
                <Button size="sm" className="bg-accent text-accent-foreground shadow-button" asChild>
                  <Link to="/cadastro" onClick={() => setOpen(false)}>Começar agora</Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
