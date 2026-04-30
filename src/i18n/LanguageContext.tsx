import { useState, useCallback, type ReactNode } from "react";
import type { Language, LocaleTranslations } from "./types";
import { LanguageContext } from "./context";
import { localeCache, localeLoaders } from "./lib";

function unwrapLocaleModule(module: unknown): Omit<LocaleTranslations, "_lang"> {
  const m = module as { default?: Omit<LocaleTranslations, "_lang"> } & Omit<LocaleTranslations, "_lang">;
  return m.default ?? m;
}

function isLanguage(value: string | null): value is Language {
  return value === "pt" || value === "en" || value === "es";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem("aplikei-lang");
    return isLanguage(saved) ? saved : "pt";
  });

  const [locale, setLocale] = useState<LocaleTranslations | null>(() => {
    const saved = localStorage.getItem("aplikei-lang");
    const currentLang = isLanguage(saved) ? saved : "pt";
    const cached = localeCache.get(currentLang);
    if (cached) return cached;
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
      setIsLanguageLoading(false);
      return;
    }

    setIsLanguageLoading(true);

    try {
      const loaderPath = `./locales/${targetLang}/index.ts`;
      const localeModule = localeLoaders[loaderPath];
      if (!localeModule) throw new Error(`Locale not found: ${loaderPath}`);
      const data = unwrapLocaleModule(localeModule);
      const loaded: LocaleTranslations = { _lang: targetLang, ...data };
      localeCache.set(targetLang, loaded);
      setLocale(loaded);
    } catch (error) {
      console.error(`[i18n] Failed to load locale "${targetLang}"`, error);
      if (!localeCache.has(targetLang)) setLocale({ _lang: targetLang } as unknown as LocaleTranslations);
    } finally {
      setIsLanguageLoading(false);
    }
  }, []);

  const setLang = useCallback(async (newLang: Language) => {
    if (newLang === lang) return;

    localStorage.setItem("aplikei-lang", newLang);
    setLangState(newLang);
    await loadLocale(newLang);
  }, [lang, loadLocale]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, locale, isLanguageLoading, loadLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}
