import { createContext, useContext } from "react";
import type { LanguageContextType, TranslationNamespace, LocaleTranslations } from "./types";

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLocale() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLocale must be used within <LanguageProvider>");
  return {
    lang: context.lang,
    setLang: context.setLang,
    isLanguageLoading: context.isLanguageLoading,
    loadLocale: context.loadLocale,
  };
}

export function useT<N extends TranslationNamespace>(namespace: N): LocaleTranslations[N] {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useT must be used within <LanguageProvider>");
  if (!context.locale) return {} as unknown as LocaleTranslations[N];
  return context.locale[namespace];
}
