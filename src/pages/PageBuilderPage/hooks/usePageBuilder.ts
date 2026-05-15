import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { fetchOfficeByOwner, saveOfficeLandingConfig } from "../../../features/admin/roles/lib/officeOps";
import { supabase } from "../../../shared/lib/supabase";
import type { LandingPageConfig } from "../types";

function toAbsoluteUrl(value: string) {
  if (typeof window === "undefined") return value;
  if (!value) return value;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return `${window.location.origin}${value}`;
  return value;
}

const initialConfig: LandingPageConfig = {
  pageTitle: "Advocacia Imigratória | Vistos EUA",
  faviconUrl: "https://www.google.com/s2/favicons?domain=aplikei.com&sz=64",
  logoUrl: "https://dummyimage.com/180x52/0f172a/ffffff.png&text=SEU+LOGO",
  heroBadge: "ADVOCACIA IMIGRATÓRIA ESTRATÉGICA",
  lawyerName: "Dra. Carolina Mendes",
  lawyerCtaText: "Advogada de imigração com atuação focada em vistos e estratégia de aprovação.",
  expertTag: "Atendimento com advogado responsável",
  expertStat1Value: "+2.000",
  expertStat1Label: "Clientes atendidos",
  expertStat2Value: "4.9/5",
  expertStat2Label: "Satisfação média",
  adminLawyerUrl: typeof window !== "undefined" ? `${window.location.origin}/master` : "/master",
  loginUrl: typeof window !== "undefined" ? `${window.location.origin}/login` : "/login",
  contactUrl: "https://wa.me/15551234567",
  primaryCtaUrl: "/checkout/b1-b2",
  secondaryCtaUrl: "/quem-somos",
  heroTitle: "Pare de perder tempo com dúvida de visto: tenha estratégia jurídica do início ao fim",
  heroSubtitle: "Assessoria premium para B1/B2, F1, extensão de status e troca de status com acompanhamento humano e plano claro de ação.",
  loginButtonLabel: "Entrar",
  primaryCtaLabel: "Quero análise do meu caso",
  secondaryCtaLabel: "Falar com especialista",
  servicesTitle: "Serviços de vistos com foco em resultado",
  servicesSubtitle: "Soluções jurídicas para cada etapa da sua jornada imigratória, com organização documental e estratégia personalizada.",
  serviceB1B2Tag: "B1/B2",
  serviceB1B2Name: "Visto de Turismo",
  serviceB1B2Desc: "Turismo e negócios com preparação de perfil, DS-160 e orientação de entrevista.",
  serviceF1Tag: "F1",
  serviceF1Name: "Visto de Estudante",
  serviceF1Desc: "Plano completo para estudantes, alinhando documentação acadêmica e narrativa migratória.",
  serviceEOSTag: "EOS",
  serviceEOSName: "Extensão de Status",
  serviceEOSDesc: "Solicitação técnica para ampliar permanência regular sem improviso.",
  serviceCOSTag: "COS",
  serviceCOSName: "Troca de Status",
  serviceCOSDesc: "Mudança de categoria com estratégia jurídica e mitigação de riscos de negação.",
  howItWorksTitle: "Como funciona nossa assessoria",
  howItWorksSubtitle: "Um processo claro e estruturado para garantir a maior chance de aprovação do seu visto.",
  step1Title: "Análise de Perfil",
  step1Desc: "Avaliamos seu histórico e objetivos para definir a melhor estratégia migratória.",
  step2Title: "Preparação Documental",
  step2Desc: "Organizamos toda a documentação necessária com rigor técnico e conferência dupla.",
  step3Title: "Protocolo e Acompanhamento",
  step3Desc: "Realizamos o protocolo e acompanhamos cada etapa até a decisão final do consulado.",
  testimonialsTitle: "Quem contrata recomenda",
  testimonialsSubtitle: "Histórias de sucesso de quem confiou na nossa assessoria estratégica.",
  testimonial1Text: "\"A estratégia da Dra. Carolina foi fundamental para a aprovação do meu visto F1 após uma negação anterior. Recomendo muito!\"",
  testimonial1Author: "Ricardo Silva",
  testimonial1Role: "Estudante em Boston",
  testimonial2Text: "\"Profissionalismo impecável. A extensão do meu status foi feita com total segurança e clareza. Equipe nota 10.\"",
  testimonial2Author: "Mariana Costa",
  testimonial2Role: "Turismo e Negócios",
  testimonial3Text: "\"O diferencial é o acompanhamento humano. Me senti segura em cada etapa do processo. Aprovação rápida!\"",
  testimonial3Author: "Juliana Lins",
  testimonial3Role: "Troca de Status",
  faqTitle: "Perguntas Frequentes",
  faqSubtitle: "Tire suas dúvidas sobre o processo de visto e nossa assessoria.",
  faq1Question: "Qual a diferença entre assessoria e advogado?",
  faq1Answer: "Nossa assessoria é liderada por advogados especialistas, garantindo o rigor jurídico que uma assessoria comum não oferece.",
  faq2Question: "Quanto tempo demora o processo?",
  faq2Answer: "O tempo varia de acordo com o tipo de visto e a demanda consular, mas nossa preparação leva em média 15 a 30 dias.",
  faq3Question: "Vocês garantem a aprovação?",
  faq3Answer: "Nenhum profissional pode garantir a aprovação, mas nossa estratégia jurídica maximiza as chances ao mitigar riscos comuns.",
  footerDescription: "Assessoria jurídica estratégica para quem busca segurança e clareza no processo imigratório americano.",
  footerLinksTitle: "Links Úteis",
  footerLink1Label: "Serviços",
  footerLink2Label: "Sobre Nós",
  footerLink3Label: "Depoimentos",
  footerLink4Label: "FAQ",
  footerContactTitle: "Contato",
  footerContactEmail: "contato@seulogo.com.br",
  footerContactPhone: "+55 (11) 99999-9999",
  footerContactLocation: "São Paulo, SP - Brasil",
  footerCopyright: "© 2024 Advocacia Imigratória Estratégica. Todos os direitos reservados.",
  footerSocialInstagramLabel: "Instagram",
  footerSocialLinkedinLabel: "LinkedIn",
  footerSocialWhatsappLabel: "WhatsApp",
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
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadOfficeUrl = async () => {
      if (!user?.id || typeof window === "undefined") return;

      try {
        const office = await fetchOfficeByOwner(user.id);
        if (!mounted || !office?.name) return;

        const url = new URL(`${window.location.origin}/master`);
        url.searchParams.set("office", office.name);
        const loginUrl = new URL(`${window.location.origin}/login`);
        loginUrl.searchParams.set("officeId", office.id);

        setConfig((prev) => ({
          ...prev,
          ...(office.landing_page_config && typeof office.landing_page_config === "object"
            ? (office.landing_page_config as Partial<LandingPageConfig>)
            : {}),
          adminLawyerUrl: url.toString(),
          loginUrl: loginUrl.toString(),
          officeSlug: office.slug,
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
    const normalizedValue = key === "loginUrl"
      ? (toAbsoluteUrl(String(value)) as LandingPageConfig[K])
      : value;

    setConfig((prev) => ({
      ...prev,
      [key]: normalizedValue,
    }));
  };

  const openPreview = () => setIsPreviewOpen(true);
  const closePreview = () => setIsPreviewOpen(false);

  const saveConfig = async () => {
    if (!user?.id) throw new Error("Usuário não autenticado.");
    setIsSaving(true);
    try {
      await saveOfficeLandingConfig(user.id, config as unknown as Record<string, unknown>);
    } finally {
      setIsSaving(false);
    }
  };

  const uploadLogo = async (file: File) => {
    if (!user?.id) throw new Error("Usuário não autenticado.");
    setIsUploadingLogo(true);
    try {
      const ext = file.name.split(".").pop() ?? "png";
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const safeBaseName = baseName.replace(/\s+/g, "-").toLowerCase();
      const path = `landing-logos/${user.id}/${Date.now()}-${safeBaseName}.${ext}`;
      const { error } = await supabase.storage
        .from("profiles")
        .upload(path, file, { contentType: file.type, upsert: true });
      if (error) throw new Error(error.message);
      const publicUrl = supabase.storage.from("profiles").getPublicUrl(path).data.publicUrl;
      setConfig((prev) => ({ ...prev, logoUrl: publicUrl }));
      return publicUrl;
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const uploadFavicon = async (file: File) => {
    if (!user?.id) throw new Error("Usuário não autenticado.");
    setIsUploadingFavicon(true);
    try {
      const ext = file.name.split(".").pop() ?? "png";
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const safeBaseName = baseName.replace(/\s+/g, "-").toLowerCase();
      const path = `landing-favicons/${user.id}/${Date.now()}-${safeBaseName}.${ext}`;
      const { error } = await supabase.storage
        .from("profiles")
        .upload(path, file, { contentType: file.type, upsert: true });
      if (error) throw new Error(error.message);
      const publicUrl = supabase.storage.from("profiles").getPublicUrl(path).data.publicUrl;
      setConfig((prev) => ({ ...prev, faviconUrl: publicUrl }));
      return publicUrl;
    } finally {
      setIsUploadingFavicon(false);
    }
  };

  return {
    config,
    isPreviewOpen,
    isSaving,
    isUploadingLogo,
    isUploadingFavicon,
    updateConfig,
    saveConfig,
    uploadLogo,
    uploadFavicon,
    openPreview,
    closePreview,
  };
}
