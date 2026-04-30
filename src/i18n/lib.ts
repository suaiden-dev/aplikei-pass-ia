import type { Language, LocaleTranslations } from "./types";

export const localeCache = new Map<Language, LocaleTranslations>();
export const localeLoaders = import.meta.glob("./locales/*/index.ts", { eager: true });
