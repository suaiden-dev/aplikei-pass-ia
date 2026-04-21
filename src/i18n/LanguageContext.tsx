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
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";

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
    async (newLang: Language) => {
      if (newLang === lang) return;
      localStorage.setItem("aplikei-lang", newLang);
      setLangState(newLang);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        supabase
          .from("user_accounts")
          .update({ preferred_language: newLang })
          .eq("id", user.id)
          .then(({ error }) => {
            if (error) {
              console.warn("[i18n] Failed to persist lang to DB:", error.message);
            }
          });
      }
    },
    [lang],
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      supabase
        .from("user_accounts")
        .select("preferred_language")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          const dbLang = data?.preferred_language as Language | undefined;
          if (dbLang && dbLang !== lang) {
            localStorage.setItem("aplikei-lang", dbLang);
            setLangState(dbLang);
          }
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadLocale(lang);
  }, [lang, loadLocale]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, locale, isLanguageLoading, loadLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}
