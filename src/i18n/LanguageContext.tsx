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
import { supabase } from "../lib/supabase";

import {
  Language,
  LocaleTranslations,
} from "./types";
import { subscribeToAuthChanges } from "../services/auth.service";

import { LanguageContext } from "./context";
import { localeCache, localeLoaders } from "./lib";

function unwrapLocaleModule(module: unknown): Omit<LocaleTranslations, "_lang"> {
  const moduleRecord = module as { default?: Omit<LocaleTranslations, "_lang"> } & Omit<LocaleTranslations, "_lang">;
  return moduleRecord.default ?? moduleRecord;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const currentUserIdRef = useRef<string | null>(null);
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
      const data = unwrapLocaleModule(mod);
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
      const data = unwrapLocaleModule(localeModule);

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

      const userId = currentUserIdRef.current;
      if (userId) {
        supabase
          .from("user_accounts")
          .update({ preferred_language: newLang })
          .eq("id", userId)
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
    const unsubscribe = subscribeToAuthChanges((_, session) => {
      currentUserIdRef.current = session?.user?.id ?? null;
    });

    return unsubscribe;
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
