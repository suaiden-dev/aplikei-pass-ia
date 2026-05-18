function parseBoolean(value: string | undefined): boolean {
  if (!value) return false;
  return ["true", "1", "yes", "on"].includes(value.trim().toLowerCase());
}

const envIsProd = import.meta.env.VITE_SITE_IS_PROD;

/**
 * Controls which public experience is shown at the site root.
 * Set `VITE_SITE_IS_PROD=true` to expose the landing page at `/`.
 */
export const siteConfig = {
  isProd: envIsProd !== undefined ? parseBoolean(envIsProd) : import.meta.env.PROD,
};

