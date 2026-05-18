import { useMemo } from "react";

interface OfficeBranding {
  companyName: string;
  logoUrl: string;
  faviconUrl: string;
  isWhiteLabel: boolean;
  loading: boolean;
}

const FIXED_BRAND = {
  companyName: "Aplikei",
  logoUrl: "/logo.png",
  faviconUrl: "/logo.png",
};

export function useOfficeBranding(): OfficeBranding {
  return useMemo(
    () => ({
      ...FIXED_BRAND,
      isWhiteLabel: false,
      loading: false,
    }),
    [],
  );
}
