/**
 * Localized overrides for the featured service pages.
 * Only text fields are translated — slugs, prices, heroImage, etc. remain in the source.
 * Add more locales as needed by following the same structure.
 */

type ServiceTextFields = {
  title: string;
  subtitle: string;
  description: string;
  forWhom: string[];
  notForWhom: string[];
  included: string[];
  requirements: string[];
  faq: { q: string; a: string }[];
};

type ServiceLocaleMap = Record<string, ServiceTextFields>;

const servicesI18n: Record<string, ServiceLocaleMap> = {
  en: {},
  es: {},
};

/**
 * Returns the localized text fields for a service, falling back to PT (source) data.
 */
export function getServiceLocale(
  slug: string,
  lang: string,
): ServiceTextFields | null {
  return servicesI18n[lang]?.[slug] ?? null;
}
