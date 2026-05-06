import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { fetchOfficeByOwner } from "../../../features/admin/roles/lib/officeOps";
import type { LandingPageConfig } from "../types";

const initialConfig: LandingPageConfig = {
  pageTitle: "Advocacia Imigratória | Vistos EUA",
  faviconUrl: "https://www.google.com/s2/favicons?domain=aplikei.com&sz=64",
  logoUrl: "https://dummyimage.com/180x52/0f172a/ffffff.png&text=SEU+LOGO",
  lawyerName: "Dra. Carolina Mendes",
  lawyerCtaText: "Advogada de imigração com atuação focada em vistos e estratégia de aprovação.",
  adminLawyerUrl: typeof window !== "undefined" ? `${window.location.origin}/admin` : "/admin",
  loginUrl: "/login",
  contactUrl: "https://wa.me/15551234567",
  primaryCtaUrl: "/checkout/b1-b2",
  secondaryCtaUrl: "/como-funciona",
  heroTitle: "Pare de perder tempo com dúvida de visto: tenha estratégia jurídica do início ao fim",
  heroSubtitle: "Assessoria premium para B1/B2, F1, extensão de status e troca de status com acompanhamento humano e plano claro de ação.",
  loginButtonLabel: "Entrar",
  primaryCtaLabel: "Quero análise do meu caso",
  secondaryCtaLabel: "Falar com especialista",
  officeSlug: "",
  serviceF1Enabled: true,
  serviceB1B2Enabled: true,
  serviceEOSEnabled: true,
  serviceCOSEnabled: true,
};

export function usePageBuilder() {
  const { user } = useAuth();
  const [config, setConfig] = useState<LandingPageConfig>(initialConfig);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadOfficeUrl = async () => {
      if (!user?.id || typeof window === "undefined") return;

      try {
        const office = await fetchOfficeByOwner(user.id);
        if (!mounted || !office?.name) return;

        const url = new URL(`${window.location.origin}/admin`);
        url.searchParams.set("office", office.name);

        setConfig((prev) => ({
          ...prev,
          adminLawyerUrl: url.toString(),
          officeSlug: office.slug,
        }));
      } catch {
        // Keep the default admin URL when office data isn't available.
      }
    };

    void loadOfficeUrl();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const updateConfig = <K extends keyof LandingPageConfig>(key: K, value: LandingPageConfig[K]) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const openPreview = () => setIsPreviewOpen(true);
  const closePreview = () => setIsPreviewOpen(false);

  return {
    config,
    isPreviewOpen,
    updateConfig,
    openPreview,
    closePreview,
  };
}
