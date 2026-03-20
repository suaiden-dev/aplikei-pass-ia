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

export type TranslationNamespace = "common" | "auth" | "dashboard" | "visas";

// ─────────────────────────────────────────
// Locale structure
// ─────────────────────────────────────────

/**
 * A single namespace payload — an arbitrarily nested object with string
 * (or primitive) leaf values. Arrays of objects are also allowed for
 * sections like faq.items or testimonials.items.
 */
export type LocaleNamespace = Record<string, unknown>;

/**
 * The fully loaded locale for one language, organised by namespace.
 * The `_lang` tag lets the context detect stale cache entries after
 * a language switch.
 */
export interface LocaleTranslations {
  /** The language this object was built for. */
  _lang: Language;
  common: LocaleNamespace;
  auth: LocaleNamespace;
  dashboard: LocaleNamespace;
  visas: LocaleNamespace;
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
  /**
   * Legacy translations object (synchronous, key-first with {en,pt,es} leaves).
   * Kept for backward-compat while existing components are gradually migrated
   * to useT(). Will be removed once all consumers use the new hook.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  /** Lazy-loaded locale for the current language. Null while first load is in flight. */
  locale: LocaleTranslations | null;
  /** True while any locale import() promise is pending. */
  isLanguageLoading: boolean;
  /** Imperatively trigger locale loading (idempotent — cached after first call). */
  loadLocale: (lang: Language) => Promise<void>;
}
