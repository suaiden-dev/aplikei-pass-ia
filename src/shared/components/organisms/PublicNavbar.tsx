import React, { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  RiMenu3Line,
  RiCloseLine,
  RiArrowDownSLine,
  RiArrowRightSLine,
} from "react-icons/ri";
import { AnimatePresence, motion } from "framer-motion";
import {
  BriefcaseBusiness,
  Sparkles,
} from "lucide-react";
import { cn } from "@shared/utils/cn";
import { useLocale, useT, type Language } from "@app/app/i18n";
import { PublicButton } from "../atoms/PublicButton";
import { AppLogo } from "../atoms/AppLogo";
import { useDemoBooking } from "./DemoBookingModal";
import Flag from "../atoms/flag";
import { LANGUAGE_FLAG_CODE } from "../atoms/flags";

const LANGS: { code: Language; label: string }[] = [
  { code: "pt", label: "Português" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
];

const SOLUTIONS_COLUMNS = [
  {
    title: {
      pt: "Vistos",
      en: "Visas",
      es: "Visados",
    },
    items: [
      { label: { pt: "Visto B1/B2", en: "B1/B2 Visa", es: "Visa B1/B2" }, href: "/solucoes/fluxo-b1b2" },
      { label: { pt: "Visto F1", en: "F1 Visa", es: "Visa F1" }, href: "/solucoes/fluxo-f1" },
      { label: { pt: "Extensão de Status", en: "Status Extension", es: "Extensión de Estatus" }, href: "/solucoes/fluxo-extensao-status" },
      { label: { pt: "Troca de Status", en: "Status Change", es: "Cambio de Estatus" }, href: "/solucoes/fluxo-troca-status" },
    ],
  },
  {
    title: {
      pt: "Operação",
      en: "Operations",
      es: "Operación",
    },
    items: [
      { label: { pt: "Gerenciar Processos", en: "Manage Processes", es: "Gestionar Procesos" }, href: "/solucoes/gerenciar-processos" },
      { label: { pt: "Gerenciar Serviços", en: "Manage Services", es: "Gestionar Servicios" }, href: "/solucoes/gerenciar-servicos" },
      { label: { pt: "Gerenciar Time", en: "Manage Team", es: "Gestionar Equipo" }, href: "/solucoes/gerenciar-time" },
      { label: { pt: "Regras de Desconto", en: "Discount Rules", es: "Reglas de Descuento" }, href: "/solucoes/gerenciar-regras-de-desconto" },
      { label: { pt: "Gestão de Casos", en: "Case Management", es: "Gestión de Casos" }, href: "/solucoes/gerir-fluxo-de-casos" },
    ],
  },
  {
    title: {
      pt: "Soluções",
      en: "Solutions",
      es: "Soluciones",
    },
    items: [
      { label: { pt: "Análise das Finanças", en: "Finance Analysis", es: "Análisis de Finanzas" }, href: "/solucoes/analise-das-financas" },
      { label: { pt: "Chat para Serviços", en: "Chat for Services", es: "Chat para Servicios" }, href: "/solucoes/chat-para-servicos-personalizados" },
      { label: { pt: "Criar Cupons", en: "Create Coupons", es: "Crear Cupones" }, href: "/solucoes/criar-cupons-customizados" },
      { label: { pt: "Plataforma para Vendedores", en: "Platform for Sellers", es: "Plataforma para Vendedores" }, href: "/solucoes/plataforma-para-vendedores" },
    ],
  },
] as const;

const SOLUTIONS_FEATURED = [
  {
    title: {
      pt: "Visto B1/B2",
      en: "B1/B2 Visa",
      es: "Visa B1/B2",
    },
    description: {
      pt: "Uma página de solução para vender e operar o visto.",
      en: "A solution page to sell and run the visa workflow.",
      es: "Una página de solución para vender y operar la visa.",
    },
    href: "/solucoes/fluxo-b1b2",
    icon: BriefcaseBusiness,
    accent: "from-primary/15 to-primary/5",
    badge: {
      pt: "Template",
      en: "Template",
      es: "Plantilla",
    },
  },
  {
    title: {
      pt: "Análise das Finanças",
      en: "Finance Analysis",
      es: "Análisis de Finanzas",
    },
    description: {
      pt: "Leitura clara do negócio com dados operacionais.",
      en: "Clear business view with operational data.",
      es: "Lectura clara del negocio con datos operativos.",
    },
    href: "/solucoes/analise-das-financas",
    icon: Sparkles,
    accent: "from-success/15 to-success/5",
  },
] as const;

function LangDropdown({ size = "sm" }: { size?: "sm" | "lg" }) {
  const { lang, setLang } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const flagH = size === "lg" ? "h-6" : "h-4";
  const flagHDrop = size === "lg" ? "h-5" : "h-4";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-2.5 py-1.5 transition-all",
          "hover:border-primary/40 hover:bg-card",
          open && "border-primary/40 ring-2 ring-primary/10",
        )}
        aria-label="Selecionar idioma"
      >
        <Flag
          countryCode={LANGUAGE_FLAG_CODE[active.code]}
          alt={active.label}
          className={cn(flagH, "w-auto rounded-[3px]")}
        />
        <RiArrowDownSLine
          size={14}
          className={cn(
            "text-text-muted transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-[200] min-w-[140px] overflow-hidden rounded-2xl border border-border bg-card shadow-[0_16px_48px_rgba(15,23,42,0.16)]"
          >
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors",
                  lang === l.code
                    ? "bg-primary/10 text-primary"
                    : "text-text-muted hover:bg-bg-subtle hover:text-text",
                )}
              >
                <Flag
                  countryCode={LANGUAGE_FLAG_CODE[l.code]}
                  alt={l.label}
                  className={cn(flagHDrop, "w-auto rounded-[3px]")}
                />
                {l.label}
                {lang === l.code && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PublicNavbar() {
  const { lang } = useLocale();
  const t = useT("nav");
  const { openDemoBooking } = useDemoBooking();
  const location = useLocation();
  const [mobileMenuOpenPath, setMobileMenuOpenPath] = useState<string | null>(null);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const solutionsMenuRef = useRef<HTMLDivElement>(null);
  const isMobileMenuOpen = mobileMenuOpenPath === location.pathname;
  const isSolutionsRoute =
    location.pathname.startsWith("/solucoes") || location.pathname.startsWith("/servicos");
  const solutionsLabel = t.solutions ?? t.services;

  const closeMobileMenu = () => setMobileMenuOpenPath(null);
  const toggleMobileMenu = () =>
    setMobileMenuOpenPath((cur) => (cur === location.pathname ? null : location.pathname));
  const closeSolutionsMenu = () => setSolutionsOpen(false);
  const toggleSolutionsMenu = () => setSolutionsOpen((cur) => !cur);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (solutionsMenuRef.current && !solutionsMenuRef.current.contains(event.target as Node)) {
        setSolutionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navLinks = [
    { kind: "link" as const, to: "/landing", label: t.home },
    { kind: "link" as const, to: "/quem-somos", label: t.howItWorks },
    { kind: "solutions" as const, label: solutionsLabel },
    { kind: "link" as const, to: "/contato", label: t.contact },
  ];

  const handleDemoBooking = () => {
    closeMobileMenu();
    openDemoBooking();
  };

  return (
    <>
      <nav className="sticky top-0 z-[100] flex items-center justify-between border-b border-border/70 bg-bg/90 px-6 py-4 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-xl xl:px-16">
        <div className="flex items-center gap-10">
          <Link to="/" className="relative z-[110] flex items-center gap-2.5">
            <AppLogo className="h-12 w-auto object-contain drop-shadow-[0_8px_24px_rgba(15,23,42,0.12)]" />
          </Link>
          <div className="hidden items-center gap-7 xl:flex">
            {navLinks.map((item) => {
              if (item.kind === "solutions") {
                return (
                  <div ref={solutionsMenuRef} key="solutions" className="relative">
                    <button
                      type="button"
                      onClick={toggleSolutionsMenu}
                      className={cn(
                        "font-display inline-flex items-center gap-1.5 relative pb-1 text-[0.98rem] font-semibold tracking-[-0.015em] transition-colors duration-200",
                        "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-primary after:transition-transform after:duration-200 after:origin-left",
                        isSolutionsRoute || solutionsOpen
                          ? "text-text after:scale-x-100"
                          : "text-text-muted hover:text-text after:scale-x-0 hover:after:scale-x-100",
                      )}
                      aria-haspopup="menu"
                      aria-expanded={solutionsOpen}
                    >
                      {item.label}
                      <RiArrowDownSLine size={16} className={cn("transition-transform", solutionsOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                      {solutionsOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 12, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 12, scale: 0.98 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          className="fixed left-1/2 top-[76px] z-[220] w-[min(1120px,calc(100vw-3rem))] -translate-x-1/2 overflow-hidden rounded-[28px] border border-border/70 bg-card p-6 shadow-[0_30px_90px_rgba(15,23,42,0.18)]"
                        >
                          <div className="grid gap-6 lg:grid-cols-[0.95fr_0.95fr_0.95fr_1.1fr]">
                            {SOLUTIONS_COLUMNS.map((column) => (
                              <div key={column.title.pt} className="space-y-4">
                                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">
                                  {column.title[lang] ?? column.title.pt}
                                </p>
                                <ul className="space-y-3">
                                  {column.items.map((item) => (
                                    <li key={`${column.title.pt}-${typeof item.label === "string" ? item.label : item.label.pt}`}>
                                      <Link
                                        to={item.href}
                                        onClick={closeSolutionsMenu}
                                        className="group flex items-center justify-between gap-3 rounded-2xl px-3 py-2 text-sm font-semibold text-text transition-colors hover:bg-bg-subtle"
                                      >
                                        <span>{typeof item.label === "string" ? item.label : item.label[lang] ?? item.label.pt}</span>
                                        <RiArrowRightSLine className="text-text-muted transition-transform group-hover:translate-x-0.5" />
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}

                            <div className="space-y-4">
                              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">
                                Featured
                              </p>
                              <div className="space-y-3">
                                {SOLUTIONS_FEATURED.map((card) => {
                                  const Icon = card.icon;
                                  return (
                                    <Link
                                      key={card.title.pt}
                                      to={card.href}
                                      onClick={closeSolutionsMenu}
                                      className={cn(
                                        "group flex items-start gap-4 rounded-[24px] border border-border/70 bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg",
                                        `bg-gradient-to-br ${card.accent}`,
                                      )}
                                    >
                                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-bg-subtle text-primary shadow-sm">
                                        <Icon className="h-5 w-5" />
                                      </span>
                                      <span className="min-w-0">
                                        <span className="flex items-center gap-2">
                                          <strong className="block text-sm font-bold text-text">
                                            {card.title[lang] ?? card.title.pt}
                                          </strong>
                                          {"badge" in card && (
                                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary">
                                              {card.badge[lang] ?? card.badge.pt}
                                            </span>
                                          )}
                                        </span>
                                        <span className="mt-1 block text-xs leading-relaxed text-text-muted">
                                          {card.description[lang] ?? card.description.pt}
                                        </span>
                                      </span>
                                    </Link>
                                  );
                                })}
                              </div>

                              <Link
                                to="/solucoes/fluxo-b1b2"
                                onClick={closeSolutionsMenu}
                                className="inline-flex items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-primary-hover"
                              >
                                Ver todas as soluções
                                <RiArrowRightSLine />
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "font-display relative pb-1 text-[0.98rem] font-semibold tracking-[-0.015em] transition-colors duration-200",
                      "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-primary after:transition-transform after:duration-200 after:origin-left",
                      isActive
                        ? "text-text after:scale-x-100"
                        : "text-text-muted hover:text-text after:scale-x-0 hover:after:scale-x-100",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </div>

        <div className="hidden items-center gap-4 xl:flex">
          {/* Language Dropdown */}
          <LangDropdown />

          <PublicButton onClick={openDemoBooking} size="sm">
            {t.bookDemo}
          </PublicButton>

          <PublicButton asChild tone="outline" size="sm">
            <Link to="/track-my-visa">{t.trackMyCase}</Link>
          </PublicButton>

          <PublicButton asChild tone="ghost" size="sm">
            <Link to="/login">{t.login}</Link>
          </PublicButton>
        </div>

        <button
          className="z-[110] rounded-lg border border-primary/20 bg-card/80 p-2 text-primary transition-colors hover:bg-primary/10 xl:hidden"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <RiCloseLine size={28} /> : <RiMenu3Line size={28} />}
        </button>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-90 flex flex-col overflow-y-auto bg-bg px-6 pb-6 pt-24"
          >
            <div className="mx-auto mb-8 w-full max-w-md rounded-[28px] border border-border/70 bg-card p-5 text-left shadow-lg">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">
                {solutionsLabel}
              </p>
              <div className="mt-4 grid gap-2">
                {[
                  { label: "Fluxo B1/B2", href: "/solucoes/fluxo-b1b2" },
                  { label: "Processos", href: "/solucoes/gerenciar-processos" },
                  { label: "Finanças", href: "/solucoes/analise-das-financas" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-text transition-colors hover:bg-bg-subtle"
                  >
                    <span>{item.label}</span>
                    <RiArrowRightSLine className="text-text-muted" />
                  </Link>
                ))}
              </div>
              <Link
                to="/solucoes/fluxo-b1b2"
                onClick={closeMobileMenu}
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-primary-hover"
              >
                Ver todas as soluções
                <RiArrowRightSLine />
              </Link>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
              {navLinks.map((item) => (
                item.kind === "solutions" ? (
                  <Link
                    key="solutions-mobile"
                    className="font-display py-2 text-2xl font-black uppercase tracking-[0.04em] transition-colors text-primary"
                    to="/solucoes/fluxo-b1b2"
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </Link>
                ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    cn(
                      "font-display py-2 text-2xl font-black uppercase tracking-[0.04em] transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-text-muted hover:text-text",
                    )
                  }
                >
                  {item.label}
                </NavLink>
                )
              ))}
            </div>
            <div className="mt-8 flex flex-col items-center gap-5">
              {/* Language Dropdown (mobile) */}
              <LangDropdown size="lg" />
              <PublicButton onClick={handleDemoBooking} size="lg" className="w-full">
                {t.bookDemo}
              </PublicButton>
              <PublicButton asChild tone="outline" className="w-full">
                <Link to="/track-my-visa" onClick={closeMobileMenu}>{t.trackMyCase}</Link>
              </PublicButton>

              <PublicButton asChild tone="ghost" className="w-full">
                <Link to="/login" onClick={closeMobileMenu}>
                  {t.login}
                </Link>
              </PublicButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export const Navbar = PublicNavbar;
