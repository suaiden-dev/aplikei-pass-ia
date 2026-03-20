/**
 * LanguageContext — dual-mode i18n provider.
 *
 * During the gradual migration from the monolithic translations.ts to the
 * modular locale system, this context exposes two APIs:
 *
 *  • LEGACY  — `useLanguage()` returns `{ lang, setLang, t }` where `t` is the
 *    old synchronous translations object (key-first, with {en,pt,es} leaves).
 *    Existing components continue to work without any change.
 *
 *  • NEW     — `useT(namespace)` (see useT.ts) resolves dot-notation keys
 *    against the lazy-loaded `locale` object that is stored in context.
 *
 * Migration path:
 *   1. Convert a component from `useLanguage()` to `useT("namespace")`.
 *   2. Once all components are converted, delete the `translations` import
 *      and the `t` property from this context.
 *   3. Then remove translations.ts entirely.
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

import { translations } from "./translations"; // backward-compat — removed when migration is complete
import type { Language, LocaleTranslations, LanguageContextType } from "./types";

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
      /**
       * Explicit per-language imports are required for Vite/Rollup to emit
       * separate chunks. A template literal with a variable would cause all
       * locales to land in a single chunk, defeating lazy loading.
       */
      const moduleMap: Record<Language, () => Promise<Record<string, unknown>>> = {
        en: () => import("./locales/en/index"),
        pt: () => import("./locales/pt/index"),
        es: () => import("./locales/es/index"),
      };
      const module = await moduleMap[targetLang]();

      const loaded: LocaleTranslations = {
        _lang: targetLang,
        common: module.common as Record<string, unknown>,
        auth: module.auth as Record<string, unknown>,
        dashboard: module.dashboard as Record<string, unknown>,
        visas: module.visas as Record<string, unknown>,
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
    t: translations,   // legacy — provides old key-first structure to existing components
    locale,
    isLanguageLoading,
    loadLocale,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// ─────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────

/**
 * Legacy hook — returns the old `{ lang, setLang, t }` API.
 * Existing components continue to use `t.section.key[lang]` without change.
 *
 * @deprecated Migrate components to `useT(namespace)` for lazy-loaded access.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within <LanguageProvider>");
  }
  return {
    lang: context.lang,
    setLang: context.setLang,
    t: context.t as typeof translations,
  };
}
