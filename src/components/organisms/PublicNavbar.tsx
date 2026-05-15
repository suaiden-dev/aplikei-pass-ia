import React, { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { RiMenu3Line, RiCloseLine, RiSunLine, RiMoonLine, RiArrowDownSLine } from "react-icons/ri";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../utils/cn";
import { useLocale, useT, type Language } from "../../i18n";
import { useTheme } from "../../contexts/useTheme";
import { Button } from "../atoms/button";
import Flag from "../atoms/flag";
import { LANGUAGE_FLAG_CODE } from "../atoms/flags";
import { supabase } from "../../shared/lib/supabase";

const LANGS: { code: Language; label: string }[] = [
  { code: "pt", label: "Português" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
];
const BRANDING_STORAGE_KEY = "aplikei.white_label.branding";

interface StoredBranding {
  officeId: string | null;
  companyName: string;
  logoUrl: string;
  faviconUrl: string;
}

function LangDropdown({ size = "sm" }: { size?: "sm" | "lg" }) {
  const { lang, setLang } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
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
          "flex items-center gap-1.5 rounded-full border border-border/70 bg-card/80 px-2.5 py-1.5 backdrop-blur-sm transition-all",
          "hover:border-primary/40 hover:bg-card",
          open && "border-primary/40 ring-2 ring-primary/10",
        )}
        aria-label="Selecionar idioma"
      >
        <Flag countryCode={LANGUAGE_FLAG_CODE[active.code]} alt={active.label} className={cn(flagH, "w-auto rounded-[3px]")} />
        <RiArrowDownSLine
          size={14}
          className={cn("text-text-muted transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-[200] min-w-[140px] overflow-hidden rounded-2xl border border-border bg-card shadow-[0_16px_48px_rgba(15,23,42,0.16)] backdrop-blur-xl"
          >
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setOpen(false); }}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors",
                  lang === l.code
                    ? "bg-primary/10 text-primary"
                    : "text-text-muted hover:bg-bg-subtle hover:text-text",
                )}
              >
                <Flag countryCode={LANGUAGE_FLAG_CODE[l.code]} alt={l.label} className={cn(flagHDrop, "w-auto rounded-[3px]")} />
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
  const t = useT("nav");
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const officeIdParam = searchParams.get("officeId") || searchParams.get("office_id") || searchParams.get("office");
  const [brand, setBrand] = useState<StoredBranding>({
    officeId: null,
    companyName: "Aplikei",
    logoUrl: "/logo.png",
    faviconUrl: "/logo.png",
  });
  const [isBrandLoading, setIsBrandLoading] = useState(true);
  const [menuOpenPath, setMenuOpenPath] = useState<string | null>(null);
  const isMenuOpen = menuOpenPath === location.pathname;

  const closeMenu = () => setMenuOpenPath(null);
  const toggleMenu = () => setMenuOpenPath((cur) => (cur === location.pathname ? null : location.pathname));

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    let mounted = true;

    const applyFavicon = (value: string) => {
      const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
      if (favicon) favicon.href = value;
      const apple = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement | null;
      if (apple) apple.href = value;
    };

    const readStored = (): StoredBranding | null => {
      try {
        const raw = localStorage.getItem(BRANDING_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<StoredBranding>;
        if (!parsed || typeof parsed.companyName !== "string" || typeof parsed.logoUrl !== "string") return null;
        return {
          officeId: typeof parsed.officeId === "string" ? parsed.officeId : null,
          companyName: parsed.companyName,
          logoUrl: parsed.logoUrl,
          faviconUrl: typeof parsed.faviconUrl === "string" ? parsed.faviconUrl : parsed.logoUrl,
        };
      } catch {
        return null;
      }
    };

    const persist = (value: StoredBranding) => {
      try {
        localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(value));
      } catch {
        // noop
      }
    };

    async function loadBranding() {
      const stored = readStored();
      if (stored && mounted) {
        setBrand(stored);
        applyFavicon(stored.faviconUrl);
      }

      if (!officeIdParam) {
        if (!stored && mounted) {
          setBrand({
            officeId: null,
            companyName: "Aplikei",
            logoUrl: "/logo.png",
            faviconUrl: "/logo.png",
          });
          applyFavicon("/logo.png");
        }
        if (mounted) setIsBrandLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("offices")
          .select("name, landing_page_config")
          .eq("id", officeIdParam)
          .maybeSingle();
        if (error) throw error;
        if (!mounted) return;

        const cfg =
          data?.landing_page_config && typeof data.landing_page_config === "object"
            ? (data.landing_page_config as Record<string, unknown>)
            : null;
        const next: StoredBranding = {
          officeId: officeIdParam,
          companyName: typeof data?.name === "string" && data.name.trim() ? data.name.trim() : "Aplikei",
          logoUrl: typeof cfg?.logoUrl === "string" && cfg.logoUrl.trim() ? cfg.logoUrl.trim() : "/logo.png",
          faviconUrl:
            typeof cfg?.faviconUrl === "string" && cfg.faviconUrl.trim()
              ? cfg.faviconUrl.trim()
              : typeof cfg?.logoUrl === "string" && cfg.logoUrl.trim()
                ? cfg.logoUrl.trim()
                : "/logo.png",
        };
        setBrand(next);
        persist(next);
        applyFavicon(next.faviconUrl);
      } catch {
        if (!mounted) return;
        if (!stored) {
          setBrand({
            officeId: null,
            companyName: "Aplikei",
            logoUrl: "/logo.png",
            faviconUrl: "/logo.png",
          });
        }
      } finally {
        if (mounted) setIsBrandLoading(false);
      }
    }

    void loadBranding();
    return () => {
      mounted = false;
    };
  }, [officeIdParam]);

  const navLinks = [
    { to: "/quem-somos", label: t.howItWorks },
    { to: "/servicos", label: t.services },
    { to: officeIdParam ? `/login?officeId=${encodeURIComponent(officeIdParam)}` : "/login", label: t.login },
  ];

  return (
    <>
      <nav className="sticky top-0 z-[100] flex items-center justify-between border-b border-border/70 bg-bg/90 px-6 py-4 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-xl xl:px-16">
        <div className="flex items-center gap-10">
          <Link to="/" className="relative z-[110] flex items-center gap-2.5">
            <img
              src={isBrandLoading ? "/logo.png" : brand.logoUrl}
              alt={isBrandLoading ? "Aplikei" : brand.companyName}
              className="h-12 w-auto object-contain drop-shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
            />
          </Link>
          <div className="hidden items-center gap-7 xl:flex">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "font-display relative pb-1 text-[0.98rem] font-semibold tracking-[-0.015em] transition-colors duration-200",
                    "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-primary after:transition-transform after:duration-200 after:origin-left",
                    isActive ? "text-text after:scale-x-100" : "text-text-muted hover:text-text after:scale-x-0 hover:after:scale-x-100",
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="hidden items-center gap-4 xl:flex">
          {/* Language Dropdown */}
          <LangDropdown />

          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/80 text-text-muted transition-colors hover:border-primary/40 hover:text-text"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <RiSunLine size={16} /> : <RiMoonLine size={16} />}
          </button>

          <Button asChild>
            <Link to={officeIdParam ? `/login?officeId=${encodeURIComponent(officeIdParam)}` : "/login"}>{t.login}</Link>
          </Button>
        </div>

        <button
          className="z-[110] rounded-lg border border-primary/20 bg-card/80 p-2 text-primary transition-colors hover:bg-primary/10 xl:hidden"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <RiCloseLine size={28} /> : <RiMenu3Line size={28} />}
        </button>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90] flex flex-col overflow-y-auto bg-bg px-6 pb-6 pt-24"
          >
            <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    cn("font-display py-2 text-2xl font-black uppercase tracking-[0.04em] transition-colors", isActive ? "text-primary" : "text-text-muted hover:text-text")
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
            <div className="mt-8 flex flex-col items-center gap-5">
              {/* Language Dropdown (mobile) */}
              <LangDropdown size="lg" />

              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:text-text"
              >
                {theme === "dark" ? <RiSunLine size={16} /> : <RiMoonLine size={16} />}
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </button>

              <Button asChild className="w-full">
                <Link to={officeIdParam ? `/login?officeId=${encodeURIComponent(officeIdParam)}` : "/login"} onClick={closeMenu}>
                  {t.login}
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link to={officeIdParam ? `/login?officeId=${encodeURIComponent(officeIdParam)}` : "/login"} onClick={closeMenu}>
                  {t.login}
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export const Navbar = PublicNavbar;
