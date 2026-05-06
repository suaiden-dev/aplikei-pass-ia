import { useState } from "react";
import type { LandingPageConfig } from "../types";

const initialConfig: LandingPageConfig = {
  pageTitle: "Advocacia Imigratória | Vistos EUA",
  faviconUrl: "https://www.google.com/s2/favicons?domain=aplikei.com&sz=64",
  logoUrl: "https://dummyimage.com/180x52/0f172a/ffffff.png&text=SEU+LOGO",
  lawyerName: "Dra. Carolina Mendes",
  lawyerCtaText: "Advogada de imigração com atuação focada em vistos e estratégia de aprovação.",
  loginUrl: "/login",
  contactUrl: "https://wa.me/15551234567",
  primaryCtaUrl: "/checkout/b1-b2",
  secondaryCtaUrl: "/quem-somos",
  heroTitle: "Pare de perder tempo com dúvida de visto: tenha estratégia jurídica do início ao fim",
  heroSubtitle: "Assessoria premium para B1/B2, F1, extensão de status e troca de status com acompanhamento humano e plano claro de ação.",
  loginButtonLabel: "Entrar",
  primaryCtaLabel: "Quero análise do meu caso",
  secondaryCtaLabel: "Falar com especialista",
};

export function usePageBuilder() {
  const [config, setConfig] = useState<LandingPageConfig>(initialConfig);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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
