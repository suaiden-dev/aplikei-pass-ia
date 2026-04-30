/* eslint-disable @typescript-eslint/no-explicit-any */
export type Language = "en" | "pt" | "es";
export type TranslationNamespace =
  | "common"
  | "auth"
  | "dashboard"
  | "visas"
  | "nav"
  | "landing"
  | "checkout"
  | "admin"
  | "tracking"
  | "services"
  | "howItWorks"
  | "footer"
  | "legal"
  | "validation"
  | "onboarding";

export type LocaleNamespace = Record<string, any>;

export interface LocaleTranslations {
  _lang: Language;
  common: LocaleNamespace;
  auth: LocaleNamespace;
  dashboard: LocaleNamespace;
  visas: LocaleNamespace;
  nav: LocaleNamespace;
  landing: LocaleNamespace;
  checkout: LocaleNamespace;
  admin: LocaleNamespace;
  tracking: LocaleNamespace;
  services: LocaleNamespace;
  howItWorks: LocaleNamespace;
  footer: LocaleNamespace;
  legal: LocaleNamespace;
  validation: LocaleNamespace;
  onboarding: LocaleNamespace;
}

export interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  locale: LocaleTranslations | null;
  isLanguageLoading: boolean;
  loadLocale: (lang: Language) => Promise<void>;
}
