import { useEffect, useState } from "react";
import { useAuth } from "@shared/hooks/useAuth";
import { fetchOfficeByOwner, saveOfficeLandingConfig } from "@features/offices/services/officeOps";
import { uploadPageBuilderAsset } from "@features/page-builder/services/pageBuilderStorageService";
import type { LandingPageConfig } from "../types";

function toAbsoluteUrl(value: string) {
  if (typeof window === "undefined") return value;
  if (!value) return value;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return `${window.location.origin}${value}`;
  return value;
}

function sanitizeLoginUrl(value: string, officeSlug?: string) {
  const absolute = toAbsoluteUrl(value);
  if (typeof window === "undefined" || !absolute) return absolute;

  try {
    const url = new URL(absolute);
    const resolvedOfficeSlug =
      officeSlug || url.searchParams.get("office") || url.searchParams.get("office_id") || url.searchParams.get("officeId");
    url.searchParams.delete("office_id");
    url.searchParams.delete("officeId");

    if (resolvedOfficeSlug) {
      url.pathname = "/track-my-visa";
      url.searchParams.set("office", resolvedOfficeSlug);
    } else if (url.pathname !== "/track-my-visa" && url.pathname !== "/login") {
      url.pathname = "/track-my-visa";
      url.search = "";
    }

    return url.toString();
  } catch {
    return `${window.location.origin}/track-my-visa`;
  }
}

export const defaultLandingPageConfig: LandingPageConfig = {
  pageTitle: "Aplikei",
  seoDescription: "Premium legal advisory for B1/B2, F1, status extension, and change of status. Legal strategy from start to finish for your visa process.",
  seoImageUrl: "",
  faviconUrl: "/logo.png",
  logoUrl: "https://dummyimage.com/180x52/0f172a/ffffff.png&text=SEU+LOGO",
  lightPrimaryColor: "#2d63ff",
  lightBackgroundColor: "#ffffff",
  lightSurfaceColor: "#ffffff",
  lightTextColor: "#0b1220",
  lightMutedTextColor: "#516073",
  darkPrimaryColor: "#6ea2ff",
  darkBackgroundColor: "#080d1c",
  darkSurfaceColor: "#101936",
  darkTextColor: "#eef4ff",
  darkMutedTextColor: "#a9b8d4",
  cardRadius: "8",
  cardShadowStyle: "soft",
  buttonRadiusStyle: "pill",
  primaryButtonColor: "#2d63ff",
  secondaryButtonColor: "#ffffff",
  heroBadge: "PREMIUM VISA ADVISORY",
  lawyerName: "Carolina Mendes, Esq.",
  lawyerCtaText: "Immigration attorney focused on visas and approval strategy.",
  expertTag: "Direct support from a responsible attorney",
  expertStat1Value: "+2.000",
  expertStat1Label: "Clients served",
  expertStat2Value: "4.9/5",
  expertStat2Label: "Average satisfaction",
  adminLawyerUrl: typeof window !== "undefined" ? `${window.location.origin}/master` : "/master",
  loginUrl: typeof window !== "undefined" ? `${window.location.origin}/track-my-visa` : "/track-my-visa",
  contactUrl: "https://wa.me/15551234567",
  primaryCtaUrl: "/checkout/b1-b2",
  secondaryCtaUrl: "/quem-somos",
  heroTitle: "Stop wasting time with visa uncertainty: get legal strategy from start to finish",
  heroSubtitle: "Premium guidance for B1/B2, F1, status extension, and change of status with human support and a clear action plan.",
  loginButtonLabel: "Log in",
  primaryCtaLabel: "I want my case reviewed",
  secondaryCtaLabel: "Talk to a specialist",
  portalClientName: "Marina Costa",
  portalClientInitials: "MC",
  portalCaseType: "Visto F-1 · estudante",
  portalCaseTitle: "Preparacao DS-160 e entrevista",
  portalStatus: "Em revisao",
  portalProgress: "68",
  portalNextStepTitle: "Proxima orientacao",
  portalNextStepDesc: "Revise o checklist antes da entrevista consular.",
  portalTask1Title: "Perfil analisado",
  portalTask1Desc: "Estrategia definida pela equipe juridica.",
  portalTask2Title: "Documentos recebidos",
  portalTask2Desc: "Comprovantes organizados no dossie.",
  portalTask3Title: "Revisao final",
  portalTask3Desc: "Formulario e narrativa em validacao.",
  portalDoc1Name: "I-20 atualizado",
  portalDoc1Status: "Aprovado",
  portalDoc2Name: "Extrato financeiro",
  portalDoc2Status: "Recebido",
  portalDoc3Name: "DS-160 draft",
  portalDoc3Status: "Revisao",
  showServicesSection: true,
  showHowItWorksSection: true,
  showProofBandSection: true,
  showTestimonialsSection: true,
  showFaqSection: true,
  sectionOrder: ["services", "how-it-works", "proof-band", "testimonials", "faq"],
  servicesTitle: "Visa services focused on results",
  servicesSubtitle: "Legal solutions for every stage of your immigration journey, with document organization and tailored strategy.",
  serviceB1B2Tag: "B1/B2",
  serviceB1B2Name: "Tourist Visa",
  serviceB1B2Desc: "Tourism and business support with profile prep, DS-160, and interview guidance.",
  serviceF1Tag: "F1",
  serviceF1Name: "Student Visa",
  serviceF1Desc: "Complete plan for students, aligning academic documentation and immigration narrative.",
  serviceEOSTag: "EOS",
  serviceEOSName: "Status Extension",
  serviceEOSDesc: "Technical filing to extend lawful stay without improvisation.",
  serviceCOSTag: "COS",
  serviceCOSName: "Change of Status",
  serviceCOSDesc: "Category change with legal strategy and denial-risk mitigation.",
  howItWorksTitle: "How our guidance works",
  howItWorksSubtitle: "A clear, structured process to maximize your visa approval chances.",
  step1Title: "Profile analysis",
  step1Desc: "We assess your history and goals to define the best immigration strategy.",
  step2Title: "Document preparation",
  step2Desc: "We organize all required documents with technical rigor and double-checking.",
  step3Title: "Filing and follow-up",
  step3Desc: "We file your case and follow each step through the final consular decision.",
  testimonialsTitle: "Trusted by clients",
  testimonialsSubtitle: "Success stories from clients who trusted our strategic guidance.",
  testimonial1Text: "\"Carolina's strategy was essential for my F1 visa approval after a previous denial. Highly recommended!\"",
  testimonial1PhotoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
  testimonial1Author: "Ricardo Silva",
  testimonial1Role: "Student in Boston",
  testimonial2Text: "\"Impeccable professionalism. My status extension was handled with total confidence and clarity. Outstanding team.\"",
  testimonial2PhotoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
  testimonial2Author: "Mariana Costa",
  testimonial2Role: "Tourism and Business",
  testimonial3Text: "\"Human support made all the difference. I felt confident at every step. Fast approval!\"",
  testimonial3PhotoUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=160&q=80",
  testimonial3Author: "Juliana Lins",
  testimonial3Role: "Change of Status",
  faqTitle: "Frequently Asked Questions",
  faqSubtitle: "Get answers about the visa process and our guidance.",
  faq1Question: "What is the difference between advisory services and an attorney?",
  faq1Answer: "Our advisory services are led by specialist attorneys, ensuring legal rigor that regular advisory services do not provide.",
  faq2Question: "How long does the process take?",
  faq2Answer: "Time varies by visa type and consular demand, but our preparation usually takes 15 to 30 days.",
  faq3Question: "Do you guarantee approval?",
  faq3Answer: "No professional can guarantee approval, but our legal strategy maximizes your chances by mitigating common risks.",
  footerDescription: "Strategic legal guidance for those seeking confidence and clarity in the U.S. visa process.",
  footerLinksTitle: "Useful Links",
  footerLink1Label: "Services",
  footerLink1Url: "#",
  footerLink2Label: "About Us",
  footerLink2Url: "#",
  footerLink3Label: "Testimonials",
  footerLink3Url: "#",
  footerLink4Label: "FAQ",
  footerLink4Url: "#",
  footerContactTitle: "Contact",
  footerContactEmail: "contato@seulogo.com.br",
  footerContactPhone: "+55 (11) 99999-9999",
  footerContactLocation: "Sao Paulo, SP - Brazil",
  footerCopyright: "Powered by Aplikei",
  footerSocialInstagramLabel: "Instagram",
  footerSocialInstagramUrl: "#",
  footerSocialLinkedinLabel: "LinkedIn",
  footerSocialLinkedinUrl: "#",
  footerSocialWhatsappLabel: "WhatsApp",
  officeSlug: "",
  officeId: "",
  isLandingLive: false,
  serviceF1Enabled: true,
  serviceB1B2Enabled: true,
  serviceEOSEnabled: true,
  serviceCOSEnabled: true,
};

export function usePageBuilder() {
  const { user } = useAuth();
  const [config, setConfig] = useState<LandingPageConfig>(defaultLandingPageConfig);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [uploadingTestimonialPhoto, setUploadingTestimonialPhoto] = useState<1 | 2 | 3 | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadOfficeUrl = async () => {
      if (!user?.id || typeof window === "undefined") return;

      try {
        const office = await fetchOfficeByOwner(user.id);
        if (!mounted || !office?.name) return;

        const url = new URL(`${window.location.origin}/master`);
        url.searchParams.set("office", office.name);
        const loginUrl = new URL(`${window.location.origin}/track-my-visa`);
        loginUrl.searchParams.set("office", office.slug);

        setConfig((prev) => ({
          ...prev,
          ...(office.landing_page_config && typeof office.landing_page_config === "object"
            ? (office.landing_page_config as Partial<LandingPageConfig>)
            : {}),
          adminLawyerUrl: url.toString(),
          loginUrl: sanitizeLoginUrl(String((office.landing_page_config as Partial<LandingPageConfig> | null)?.loginUrl ?? loginUrl.toString()), office.slug),
          officeSlug: office.slug,
          officeId: office.id,
        }));
      } catch {
        // Keep the default master URL when office data isn't available.
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
      [key]: key === "loginUrl"
        ? (sanitizeLoginUrl(String(value), prev.officeSlug) as LandingPageConfig[K])
        : value,
    }));
  };

  const openPreview = () => setIsPreviewOpen(true);
  const closePreview = () => setIsPreviewOpen(false);

  const saveConfig = async (nextConfig = config) => {
    if (!user?.id) throw new Error("User not authenticated.");
    setIsSaving(true);
    try {
      await saveOfficeLandingConfig(user.id, nextConfig as unknown as Record<string, unknown>);
    } finally {
      setIsSaving(false);
    }
  };

  const uploadLogo = async (file: File) => {
    if (!user?.id) throw new Error("User not authenticated.");
    setIsUploadingLogo(true);
    try {
      const publicUrl = await uploadPageBuilderAsset({ file, userId: user.id, folder: "landing-logos" });
      setConfig((prev) => ({ ...prev, logoUrl: publicUrl }));
      return publicUrl;
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const uploadFavicon = async (file: File) => {
    if (!user?.id) throw new Error("User not authenticated.");
    setIsUploadingFavicon(true);
    try {
      const publicUrl = await uploadPageBuilderAsset({ file, userId: user.id, folder: "landing-favicons" });
      setConfig((prev) => ({ ...prev, faviconUrl: publicUrl }));
      return publicUrl;
    } finally {
      setIsUploadingFavicon(false);
    }
  };

  const uploadTestimonialPhoto = async (index: 1 | 2 | 3, file: File) => {
    if (!user?.id) throw new Error("User not authenticated.");
    setUploadingTestimonialPhoto(index);
    try {
      const publicUrl = await uploadPageBuilderAsset({ file, userId: user.id, folder: "landing-testimonials" });
      const key = `testimonial${index}PhotoUrl` as keyof Pick<
        LandingPageConfig,
        "testimonial1PhotoUrl" | "testimonial2PhotoUrl" | "testimonial3PhotoUrl"
      >;
      setConfig((prev) => ({ ...prev, [key]: publicUrl }));
      return publicUrl;
    } finally {
      setUploadingTestimonialPhoto(null);
    }
  };

  return {
    config,
    isPreviewOpen,
    isSaving,
    isUploadingLogo,
    isUploadingFavicon,
    uploadingTestimonialPhoto,
    updateConfig,
    saveConfig,
    uploadLogo,
    uploadFavicon,
    uploadTestimonialPhoto,
    openPreview,
    closePreview,
  };
}
