import { createContext, useContext } from "react";
import { 
  LanguageContextType, 
  TranslationNamespace, 
  LocaleTranslations 
} from "./types";

/**
 * The core context object. 
 * Separated to satisfy Vite's Fast Refresh rules.
 */
export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * Modern hook for accessing language state and loading status.
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
 */
export function useT<N extends TranslationNamespace>(namespace: N): LocaleTranslations[N] {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useT must be used within <LanguageProvider>");
  }

  if (!context.locale) {
    return {} as unknown as LocaleTranslations[N];
  }

  return context.locale[namespace];
}
