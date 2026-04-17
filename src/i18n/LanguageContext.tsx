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

  const [locale, setLocale] = useState<LocaleTranslations | null>(() => {
    const currentLang = (localStorage.getItem("aplikei-lang") as Language) || "en";
    const cached = localeCache.get(currentLang);
    if (cached) return cached;
    
    // Check eager loaders for immediate sync initialization
    const loaderPath = `./locales/${currentLang}/index.ts`;
    const mod = localeLoaders[loaderPath];
    if (mod) {
      const data = (mod as any).default || mod;
      return { _lang: currentLang, ...data } as LocaleTranslations;
    }
    return null;
  });

  const [isLanguageLoading, setIsLanguageLoading] = useState(!locale);

  const loadLocale = useCallback(async (targetLang: Language) => {
    const cached = localeCache.get(targetLang);
    if (cached) {
      setLocale(cached);
      return;
    }

    try {
      const loaderPath = `./locales/${targetLang}/index.ts`;
      const localeModule = localeLoaders[loaderPath];

      if (!localeModule) {
        throw new Error(`Locale loader not found for: ${loaderPath}`);
      }

      // With { eager: true }, localeModule is the actual content
      const data = (localeModule as any).default || localeModule;

      const loaded: LocaleTranslations = {
        _lang: targetLang,
        ...data,
      };

      localeCache.set(targetLang, loaded);
      setLocale(loaded);
    } catch (error) {
      console.error(`[i18n] Failed to load locale "${targetLang}"`, error);
      if (!localeCache.has(targetLang)) {
        setLocale({ _lang: targetLang } as unknown as LocaleTranslations);
      }
    } finally {
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
