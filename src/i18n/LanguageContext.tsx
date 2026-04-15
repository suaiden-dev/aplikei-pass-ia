/**
 * LanguageProvider — Dedicated component for i18n state management.
 * 
 * NOTE: This file ONLY exports the LanguageProvider component to ensure
 * Vite's Fast Refresh works correctly without warnings.
 */

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

import {
  Language,
  LocaleTranslations,
} from "./types";

import { LanguageContext } from "./context";
import { localeCache, localeLoaders } from "./lib";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem("aplikei-lang");
    return (saved as Language) || "en";
  });

  const [locale, setLocale] = useState<LocaleTranslations | null>(
    () => localeCache.get((localStorage.getItem("aplikei-lang") as Language) || "en") ?? null,
  );

  const [isLanguageLoading, setIsLanguageLoading] = useState(!locale);
  const inFlightRef = useRef<Set<string>>(new Set());

  const loadLocale = useCallback(async (targetLang: Language) => {
    if (inFlightRef.current.has(targetLang)) return;

    const cached = localeCache.get(targetLang);
    if (cached) {
      setLocale(cached);
      return;
    }

    try {
      setIsLanguageLoading(true);
      inFlightRef.current.add(targetLang);

      const loaderPath = `./locales/${targetLang}/index.ts`;
      const loader = localeLoaders[loaderPath];

      if (!loader) {
        throw new Error(`Locale loader not found for: ${loaderPath}`);
      }

      const localeModule = (await loader()) as Omit<LocaleTranslations, "_lang">;

      const loaded: LocaleTranslations = {
        _lang: targetLang,
        ...localeModule,
      };

      localeCache.set(targetLang, loaded);
      setLocale(loaded);
    } catch (error) {
      console.error(`[i18n] Failed to load locale "${targetLang}"`, error);
      if (!localeCache.has(targetLang)) {
        setLocale({ _lang: targetLang } as unknown as LocaleTranslations);
      }
    } finally {
      inFlightRef.current.delete(targetLang);
      setIsLanguageLoading(false);
    }
  }, []);

  const setLang = useCallback(
    (newLang: Language) => {
      if (newLang === lang) return;
      localStorage.setItem("aplikei-lang", newLang);
      setLangState(newLang);
    },
    [lang],
  );

  useEffect(() => {
    loadLocale(lang);
  }, [lang, loadLocale]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, locale, isLanguageLoading, loadLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}
