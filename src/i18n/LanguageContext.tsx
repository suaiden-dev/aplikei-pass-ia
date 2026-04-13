/**
 * LanguageContext — modern i18n provider.
 *
 * This context exposes:
 *  • `useLocale()` — returns `{ lang, setLang, isLanguageLoading, loadLocale }`
 *  • `useT(namespace)` — resolves dot-notation keys against the lazy-loaded `locale` object.
 *
 * Lazy loading details:
 *   • Each language is a separate Vite chunk: locales/{lang}/index.
 *   • A module-level Map<Language, LocaleTranslations> caches loaded locales
 *     so language switches are instant on the second toggle.
 *   • An in-flight Set prevents concurrent imports for the same language.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

import {
  Language,
  LocaleTranslations,
  LanguageContextType,
  TranslationNamespace,
} from "./types";

// ─────────────────────────────────────────
// Context object (exported for useT)
// ─────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// ─────────────────────────────────────────
// Module-level cache (survives re-renders)
// ─────────────────────────────────────────

/** Prevents re-fetching already imported locales within the same session. */
const localeCache = new Map<Language, LocaleTranslations>();

// ─────────────────────────────────────────
// Provider
// ─────────────────────────────────────────

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem("aplikei-lang");
    return (saved as Language) || "en";
  });

  const [locale, setLocale] = useState<LocaleTranslations | null>(
    // Serve from cache if the user revisited the page without a full reload.
    () => localeCache.get((localStorage.getItem("aplikei-lang") as Language) || "en") ?? null,
  );

  const [isLanguageLoading, setIsLanguageLoading] = useState<boolean>(
    // If we already have the locale cached, no loading needed.
    () => !localeCache.has((localStorage.getItem("aplikei-lang") as Language) || "en"),
  );

  /**
   * Tracks in-flight imports so concurrent calls for the same language are
   * collapsed into a single dynamic import().
   */
  const inFlightRef = useRef<Set<Language>>(new Set());

// ─────────────────────────────────────────
// Chunks de Idioma (Vite Dynamic Imports)
// ─────────────────────────────────────────

/** 
 * Usamos import.meta.glob para que o Vite mapeie todos os arquivos index.ts 
 * de cada idioma no momento do build. Isso garante que cada um vire um chunk 
 * estável e evita erros de "MIME type" (404) em produção.
 */
const localeLoaders = import.meta.glob("./locales/*/index.ts");

// ── loadLocale ────────────────────────────────────────────────────────────

  const loadLocale = useCallback(async (targetLang: Language): Promise<void> => {
    // 1. Cache hit — apply immediately, no network round-trip.
    if (localeCache.has(targetLang)) {
      setLocale(localeCache.get(targetLang)!);
      setIsLanguageLoading(false);
      return;
    }

    // 2. Concurrent guard — another call is already fetching this locale.
    if (inFlightRef.current.has(targetLang)) return;

    inFlightRef.current.add(targetLang);
    setIsLanguageLoading(true);

    try {
      const l = targetLang;
      const loaderPath = `./locales/${l}/index.ts`;
      const loader = localeLoaders[loaderPath];

      if (!loader) {
        throw new Error(`Locale loader not found for: ${loaderPath}`);
      }

      // Executa o carregamento dinâmico do chunk do idioma
      const localeModule = await loader() as any;

      const loaded: LocaleTranslations = {
        _lang: l,
        ...localeModule, // Espalha namespaces (common, auth, visas, etc.)
      };

      localeCache.set(targetLang, loaded);
      setLocale(loaded);
    } catch (error) {
      console.error(`[i18n] Failed to load locale "${targetLang}"`, error);
    } finally {
      inFlightRef.current.delete(targetLang);
      setIsLanguageLoading(false);
    }
  }, []);

  // ── Initial & reactive locale loading ────────────────────────────────────

  useEffect(() => {
    void loadLocale(lang);
  }, [lang, loadLocale]);

  /** Synchronize browser tab title with active language. */
  useEffect(() => {
    const siteTitle = locale?.common?.siteTitle || "Aplikei";
    document.title = siteTitle;
  }, [locale]);

  // ── Language switcher ─────────────────────────────────────────────────────

  const setLang = useCallback((newLang: Language) => {
    localStorage.setItem("aplikei-lang", newLang);
    setLangState(newLang);
    // The useEffect above will call loadLocale(newLang) reactively.
  }, []);

  // ── Context value ─────────────────────────────────────────────────────────

  const value: LanguageContextType = {
    lang,
    setLang,
    locale,
    isLanguageLoading,
    loadLocale,
  };

  return (
    <LanguageContext.Provider value={value}>
      {!locale ? (
        <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
           <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary dark:border-slate-700"></div>
        </div>
      ) : (
        children
      )}
    </LanguageContext.Provider>
  );
}

// ─────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────

/**
 * Modern hook for accessing language state and loading status.
 * Use this alongside useT() for a fully modern i18n experience.
 */
export function useLocale() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLocale must be used within <LanguageProvider>");
  }
  return {
    lang: context.lang,
    setLang: context.setLang,
    isLanguageLoading: context.isLanguageLoading,
    loadLocale: context.loadLocale,
  };
}


/**
 * Modern hook for accessing lazy-loaded translation namespaces.
 *
 * Use this to fetch specific sections like 'auth', 'dashboard', or 'visas'.
 * The hook returns the subset of the currently loaded locale for that namespace.
 *
 * @example
 *   const t = useT("auth");
 *   return <h1>{t.login.title}</h1>;
 */
export function useT<N extends TranslationNamespace>(namespace: N): LocaleTranslations[N] {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useT must be used within <LanguageProvider>");
  }

  // If the locale is not yet loaded, we return an empty object or handle it.
  // In most cases, the app should be behind a loading spinner if isLanguageLoading is true.
  // We cast to any here to allow partial state before first load finishes,
  // but the return type remains type-safe for the caller.
  if (!context.locale) {
    return {} as any;
  }

  return context.locale[namespace];
}
