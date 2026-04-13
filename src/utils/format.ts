/**
 * Utility functions for formatting strings, numbers and dates.
 */

/**
 * Formats a number as a currency string.
 * Default is USD for US based visa processes.
 */
export function formatCurrency(
  value: number,
  currency: string = "USD",
  locale: string = "en-US"
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
}

/**
 * Formats a date string.
 */
export function formatDate(date: string | Date, locale: string = "pt-BR") {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale).format(d);
}
