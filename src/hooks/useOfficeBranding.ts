import { useEffect, useMemo, useState } from "react";
import { supabase } from "../shared/lib/supabase";
import type { UserRole } from "../features/auth/types";

interface UseOfficeBrandingParams {
  officeId: string | null | undefined;
  role: UserRole | null | undefined;
}

interface OfficeBranding {
  companyName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
}

const DEFAULT_COMPANY_NAME = "Aplikei";
const DEFAULT_LOGO_URL = "/logo.png";
const DEFAULT_FAVICON_URL = "/logo.png";

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function isWhiteLabelRole(role: UserRole | null | undefined) {
  return role === "admin_lawyer" || role === "manager" || role === "customer";
}

export function useOfficeBranding({ officeId, role }: UseOfficeBrandingParams) {
  const [branding, setBranding] = useState<OfficeBranding>({
    companyName: DEFAULT_COMPANY_NAME,
    logoUrl: DEFAULT_LOGO_URL,
    faviconUrl: DEFAULT_FAVICON_URL,
  });

  const shouldUseWhiteLabel = isWhiteLabelRole(role) && Boolean(officeId);

  useEffect(() => {
    let mounted = true;

    async function loadBranding() {
      if (!shouldUseWhiteLabel || !officeId) {
        if (mounted) {
          setBranding({
            companyName: DEFAULT_COMPANY_NAME,
            logoUrl: DEFAULT_LOGO_URL,
            faviconUrl: DEFAULT_FAVICON_URL,
          });
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from("offices")
          .select("name, landing_page_config")
          .eq("id", officeId)
          .maybeSingle();

        if (error) throw error;
        if (!mounted) return;

        const config = asObject(data?.landing_page_config);
        setBranding({
          companyName: asString(data?.name) ?? DEFAULT_COMPANY_NAME,
          logoUrl: asString(config?.logoUrl) ?? DEFAULT_LOGO_URL,
          faviconUrl: asString(config?.faviconUrl) ?? DEFAULT_FAVICON_URL,
        });
      } catch {
        if (!mounted) return;
        setBranding({
          companyName: DEFAULT_COMPANY_NAME,
          logoUrl: DEFAULT_LOGO_URL,
          faviconUrl: DEFAULT_FAVICON_URL,
        });
      }
    }

    void loadBranding();
    return () => {
      mounted = false;
    };
  }, [officeId, shouldUseWhiteLabel]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    document.title = branding.companyName;

    const iconLink = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    if (iconLink) iconLink.href = branding.faviconUrl ?? DEFAULT_FAVICON_URL;

    const appleIconLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement | null;
    if (appleIconLink) appleIconLink.href = branding.faviconUrl ?? DEFAULT_FAVICON_URL;
  }, [branding.companyName, branding.faviconUrl]);

  return useMemo(
    () => ({
      ...branding,
      isWhiteLabel: shouldUseWhiteLabel,
    }),
    [branding, shouldUseWhiteLabel],
  );
}
