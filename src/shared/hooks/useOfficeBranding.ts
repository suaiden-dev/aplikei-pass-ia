import { useEffect, useMemo, useState } from "react";
import { supabase } from "@shared/lib/supabase";
import type { UserRole } from "@features/auth/types";

interface UseOfficeBrandingParams {
  officeId: string | null | undefined;
  role: UserRole | null | undefined;
}

interface OfficeBranding {
  companyName: string;
  logoUrl: string;
  faviconUrl: string;
}

const DEFAULT_COMPANY_NAME = "Aplikei";
const DEFAULT_LOGO_URL = "/logo.png";
const DEFAULT_FAVICON_URL = "/logo.png";
const BRANDING_STORAGE_KEY = "aplikei.white_label.branding";

type StoredBranding = {
  officeId: string | null;
  companyName: string;
  logoUrl: string;
  faviconUrl: string;
};

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
  const readStored = (): StoredBranding | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(BRANDING_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<StoredBranding>;
      if (!parsed || typeof parsed.companyName !== "string" || typeof parsed.logoUrl !== "string") return null;
      return {
        officeId: typeof parsed.officeId === "string" ? parsed.officeId : null,
        companyName: parsed.companyName,
        logoUrl: parsed.logoUrl,
        faviconUrl: typeof parsed.faviconUrl === "string" ? parsed.faviconUrl : parsed.logoUrl,
      };
    } catch {
      return null;
    }
  };

  const persist = (value: StoredBranding) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(value));
    } catch {
      // noop
    }
  };

  const initialStored = readStored();
  const [branding, setBranding] = useState<OfficeBranding>({
    companyName: initialStored?.companyName ?? DEFAULT_COMPANY_NAME,
    logoUrl: initialStored?.logoUrl ?? DEFAULT_LOGO_URL,
    faviconUrl: initialStored?.faviconUrl ?? DEFAULT_FAVICON_URL,
  });
  const [loading, setLoading] = useState<boolean>(
    Boolean(officeId) && isWhiteLabelRole(role) && initialStored?.officeId !== officeId,
  );

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
          setLoading(false);
        }
        return;
      }

      const stored = readStored();
      if (stored?.officeId === officeId) {
        if (mounted) {
          setBranding({
            companyName: stored.companyName,
            logoUrl: stored.logoUrl,
            faviconUrl: stored.faviconUrl,
          });
          setLoading(false);
        }
        return;
      }

      if (mounted) setLoading(true);
      try {
        const { data, error } = await supabase
          .from("offices")
          .select("name, landing_page_config")
          .eq("id", officeId)
          .maybeSingle();

        if (error) throw error;
        if (!mounted) return;

        const config = asObject(data?.landing_page_config);
        const next = {
          companyName: asString(data?.name) ?? DEFAULT_COMPANY_NAME,
          logoUrl: asString(config?.logoUrl) ?? DEFAULT_LOGO_URL,
          faviconUrl: asString(config?.faviconUrl) ?? DEFAULT_FAVICON_URL,
        };
        setBranding(next);
        persist({
          officeId,
          companyName: next.companyName,
          logoUrl: next.logoUrl ?? DEFAULT_LOGO_URL,
          faviconUrl: next.faviconUrl ?? next.logoUrl ?? DEFAULT_FAVICON_URL,
        });
      } catch {
        if (!mounted) return;
        setBranding({
          companyName: DEFAULT_COMPANY_NAME,
          logoUrl: DEFAULT_LOGO_URL,
          faviconUrl: DEFAULT_FAVICON_URL,
        });
      } finally {
        if (mounted) setLoading(false);
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
      loading,
    }),
    [branding, shouldUseWhiteLabel, loading],
  );
}
