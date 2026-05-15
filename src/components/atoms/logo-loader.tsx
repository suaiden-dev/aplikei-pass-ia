import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../shared/lib/supabase";

const BRANDING_STORAGE_KEY = "aplikei.white_label.branding";

type StoredBranding = {
  officeId: string | null;
  companyName: string;
  logoUrl: string;
  faviconUrl: string;
};

function readStoredBranding(): StoredBranding | null {
  try {
    const raw = localStorage.getItem(BRANDING_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredBranding>;
    if (typeof parsed.companyName !== "string" || typeof parsed.logoUrl !== "string") return null;
    return {
      officeId: typeof parsed.officeId === "string" ? parsed.officeId : null,
      companyName: parsed.companyName,
      logoUrl: parsed.logoUrl,
      faviconUrl: typeof parsed.faviconUrl === "string" ? parsed.faviconUrl : parsed.logoUrl,
    };
  } catch {
    return null;
  }
}

type LogoLoaderProps = {
  officeId?: string | null;
};

export function LogoLoader({ officeId = null }: LogoLoaderProps) {
  const stored = useMemo(() => readStoredBranding(), []);
  const [logoUrl, setLogoUrl] = useState<string>(stored?.logoUrl ?? "/logo.png");
  const [companyName, setCompanyName] = useState<string>(stored?.companyName ?? "Aplikei");
  const [brandReady, setBrandReady] = useState<boolean>(() => !officeId || stored?.officeId === officeId);

  useEffect(() => {
    let isCancelled = false;

    const applyBranding = (value: StoredBranding) => {
      if (isCancelled) return;
      setLogoUrl(value.logoUrl || "/logo.png");
      setCompanyName(value.companyName || "Aplikei");
      setBrandReady(true);
      document.title = value.companyName || "Aplikei";
      const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
      if (favicon) favicon.href = value.faviconUrl || value.logoUrl || "/logo.png";
      try {
        localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(value));
      } catch {
        // noop
      }
    };

    const load = async () => {
      if (!officeId) {
        setBrandReady(true);
        return;
      }

      if (stored?.officeId === officeId) {
        setBrandReady(true);
        return;
      }

      setBrandReady(false);

      const { data } = await supabase
        .from("offices")
        .select("id, name, settings")
        .eq("id", officeId)
        .maybeSingle();

      const config = (data?.settings ?? {}) as Record<string, unknown>;
      applyBranding({
        officeId,
        companyName: typeof data?.name === "string" && data.name.trim() ? data.name.trim() : "Aplikei",
        logoUrl: typeof config.logoUrl === "string" && config.logoUrl.trim() ? config.logoUrl.trim() : "/logo.png",
        faviconUrl:
          typeof config.faviconUrl === "string" && config.faviconUrl.trim()
            ? config.faviconUrl.trim()
            : typeof config.logoUrl === "string" && config.logoUrl.trim()
              ? config.logoUrl.trim()
              : "/logo.png",
      });
    };

    load().catch(() => setBrandReady(true));
    return () => {
      isCancelled = true;
    };
  }, [officeId, stored]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center">
      {brandReady ? (
        <motion.div
          animate={{
            scale: [0.95, 1.05, 0.95],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
        >
          <img src={logoUrl} alt={companyName} className="h-32 w-auto object-contain brightness-110 drop-shadow-2xl" />
        </motion.div>
      ) : (
        <div className="h-32 w-40 animate-pulse rounded-2xl bg-slate-200/70" />
      )}
    </div>
  );
}
