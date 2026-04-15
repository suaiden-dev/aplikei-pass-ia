import { Language, LocaleTranslations } from "./types";

/**
 * Global cache for loaded translations.
 * Placed here to satisfy Vite's Fast Refresh rules for component files.
 */
export const localeCache = new Map<Language, LocaleTranslations>();

/**
 * Static mapping for Vite dynamic imports.
 */
export const localeLoaders = import.meta.glob("./locales/*/index.ts");
