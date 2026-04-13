/**
 * Core types for the Aplikei i18n system.
 *
 * Architecture:
 *  - Locales are split by domain (common / auth / dashboard / visas)
 *  - Each locale file exports locale-first string values (no { en, pt, es } objects)
 *  - Lazy loading happens at the language level via dynamic import of locales/{lang}/index
 *  - TranslationKeys is derived from `pt` — the canonical source of truth
 */

// ─────────────────────────────────────────
// Primitive types
// ─────────────────────────────────────────

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

// ─────────────────────────────────────────
// Locale structure
// ─────────────────────────────────────────

/**
 * A single namespace payload — an arbitrarily nested object with string
 * (or primitive) leaf values. Arrays of objects are also allowed for
 * sections like faq.items or testimonials.items.
 */
export type LocaleNamespace = Record<string, any>;

export interface LocaleTranslations {
  _lang: Language;
  common: Record<string, any>;
  auth: Record<string, any>;
  dashboard: Record<string, any>;
  visas: Record<string, any>;
  nav: Record<string, any>;
  landing: Record<string, any>;
  checkout: Record<string, any>;
  admin: Record<string, any>;
  tracking: Record<string, any>;
  services: Record<string, any>;
  howItWorks: Record<string, any>;
  footer: Record<string, any>;
  legal: Record<string, any>;
  validation: Record<string, any>;
  onboarding: Record<string, any>;
}

// ─────────────────────────────────────────
// Type-safe dot-notation paths
// ─────────────────────────────────────────

/**
 * Recursively collects all dot-paths to string leaves of T.
 * Enables autocomplete for the t() function when T is known.
 *
 * @example
 *   type AuthPaths = DotPaths<AuthTranslations>
 *   // "auth.login.title" | "auth.login.email" | …
 */
export type DotPaths<
  T,
  Prefix extends string = "",
> = T extends string
  ? Prefix extends "" ? never : Prefix
  : T extends Array<unknown>
    ? never
    : {
        [K in keyof T & string]: DotPaths<T[K], `${Prefix}${Prefix extends "" ? "" : "."}${K}`>;
      }[keyof T & string];

// ─────────────────────────────────────────
// Context contract
// ─────────────────────────────────────────

/** Shape exposed by LanguageContext and consumed by useLanguage / useT. */
export interface LanguageContextType {
  /** Currently active language. */
  lang: Language;
  /** Persist a new language choice to localStorage and reload the locale. */
  setLang: (lang: Language) => void;
  /** Lazy-loaded locale for the current language. Null while first load is in flight. */
  locale: LocaleTranslations | null;
  /** True while any locale import() promise is pending. */
  isLanguageLoading: boolean;
  /** Imperatively trigger locale loading (idempotent — cached after first call). */
  loadLocale: (lang: Language) => Promise<void>;
}
