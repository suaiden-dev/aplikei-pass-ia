/**
 * useT — the primary hook for lazy-loaded, type-safe translations.
 *
 * Usage:
 *   const { t, lang, isLoading } = useT("auth");
 *   t("auth.login.title")                        // → "Sign In"
 *   t("auth.forgotPassword.resendIn", { s: 30 }) // → "Resend in 30s"
 *
 * How it works:
 *   1. Calls loadLocale(lang) to ensure the locale chunk is in memory.
 *   2. Resolves dot-notation paths against the lazily loaded locale object.
 *   3. Runs interpolate() when vars are provided.
 *   4. Falls back to the raw path string if the key is missing or the locale
 *      is still loading — components never crash on missing translations.
 */

import { useCallback, useContext, useEffect } from "react";
import { LanguageContext } from "./LanguageContext";
import { getByPath, interpolate } from "./utils";
import type { Language, TranslationNamespace } from "./types";

// ─────────────────────────────────────────
// Hook
// ─────────────────────────────────────────

export interface UseTReturn {
  /**
   * Resolve a dot-notation translation key for the current language.
   *
   * @param path  Full dot path including namespace prefix, e.g. "auth.login.title"
   * @param vars  Optional interpolation variables, e.g. { name: "Ana" }
   * @returns     The translated string, or the raw path if the key is absent.
   */
  t: (path: string, vars?: Record<string, string | number>) => string;
  /** The currently active language. */
  lang: Language;
  /** True while the locale chunk is being fetched (typically < 200 ms). */
  isLoading: boolean;
}

/**
 * @param namespace  The namespace to pre-load before the component renders.
 *                   The locale for the current language is fetched once and
 *                   cached for the session — subsequent calls are synchronous.
 */
export function useT(namespace: TranslationNamespace): UseTReturn {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useT must be used within <LanguageProvider>");
  }

  const { locale, lang, isLanguageLoading, loadLocale } = context;

  // Trigger (or re-trigger) locale loading whenever the active language changes.
  // loadLocale is memoised and guarded by an in-flight Set + cache Map, so
  // concurrent or duplicate calls are safe.
  useEffect(() => {
    if (!locale || locale._lang !== lang) {
      void loadLocale(lang);
    }
  }, [lang, locale, loadLocale]);

  // Suppress the `namespace` unused-var lint warning — it documents intent and
  // will be used for per-namespace lazy loading in a future iteration.
  void namespace;

  const t = useCallback(
    (path: string, vars?: Record<string, string | number>): string => {
      // While the locale is loading, return the key path as a readable fallback.
      if (!locale || locale._lang !== lang) return path;

      const value = getByPath(locale, path);
      if (typeof value !== "string") return path;

      return vars ? interpolate(value, vars) : value;
    },
    // Re-memoize only when the locale object reference changes (i.e. on language switch).
    [locale, lang],
  );

  return { t, lang, isLoading: isLanguageLoading };
}
