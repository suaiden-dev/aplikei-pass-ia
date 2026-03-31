import { ShoppingBag, Clock, Repeat, Plane, GraduationCap } from "lucide-react";
import { StoreProductCard } from "./StoreProductCard";
import { useT } from "@/i18n/LanguageContext";

interface StoreSectionProps {
  userServicesSlugs: string[];
  lang: string;
  services: any[];
}

export const StoreSection = ({ userServicesSlugs, lang, services }: StoreSectionProps) => {
  const t = useT("dashboard");
  
  const availableProducts = [
    {
      slug: "extensao-status",
      icon: <Clock className="h-5 w-5" />,
      color: "bg-blue-500",
      gradientFrom: "from-blue-500",
      gradientTo: "to-indigo-600",
      badgeLabel: lang === "pt" ? "Em breve" : "Coming soon",
      titlePt: "Extensão de Status (I-539)",
      titleEn: "Status Extension (I-539)",
      subtitlePt: "Para quem já está nos EUA e precisa estender",
      subtitleEn: "Extend your stay while in the US",
      descPt: "Guia para solicitar extensão de status junto ao USCIS usando o formulário I-539.",
      descEn: "Guide to request a status extension with USCIS using Form I-539.",
      features: [
        { pt: "Guia digital para I-539", en: "Digital guide for I-539" },
        { pt: "Checklist de documentos", en: "Documents checklist" },
        { pt: "Orientação sobre preenchimento", en: "Filing orientation" },
      ],
      available: true,
      checkoutUrl: "/checkout/extensao-status",
    },
    {
      slug: "troca-status",
      icon: <Repeat className="h-5 w-5" />,
      color: "bg-blue-500",
      gradientFrom: "from-blue-500",
      gradientTo: "to-indigo-600",
      badgeLabel: lang === "pt" ? "Disponível" : "Available",
      titlePt: "Troca de Status (Change of Status)",
      titleEn: "Change of Status",
      subtitlePt: "Mudança de categoria de visto dentro dos EUA",
      subtitleEn: "Change your visa category while staying in the US",
      descPt: "Guia passo a passo para solicitar troca de status dentro dos EUA via formulário I-539 ou equivalente.",
      descEn: "Step-by-step guide to request a Change of Status within the US using Form I-539 or equivalent.",
      features: [
        { pt: "Guia digital passo a passo", en: "Digital step-by-step guide" },
        { pt: "Checklist de documentos", en: "Documents checklist" },
        { pt: "Orientação sobre formulários", en: "Forms orientation" },
      ],
      available: true,
      checkoutUrl: "/checkout/troca-status",
    },
    {
      slug: "visto-b1-b2",
      icon: <Plane className="h-5 w-5" />,
      color: "bg-blue-500",
      gradientFrom: "from-blue-500",
      gradientTo: "to-indigo-600",
      badgeLabel: lang === "pt" ? "Disponível" : "Available",
      titlePt: "Visto Turismo B1/B2",
      titleEn: "B1/B2 Tourist Visa",
      subtitlePt: "Para brasileiros aplicando do Brasil",
      subtitleEn: "For Brazilians applying from Brazil",
      descPt: "Guia completo passo a passo para aplicar ao visto de turismo/negócios. Inclui orientação para DS-160 e preparação para entrevista.",
      descEn: "Complete step-by-step guide to apply for a tourist/business visa. Includes DS-160 guidance and interview preparation.",
      features: [
        { pt: "Guia digital", en: "Digital guide" },
        { pt: "Checklist de documentos", en: "Complete documents checklist" },
        { pt: "Simulado com IA", en: "AI interview simulator" },
        { pt: "Suporte operacional", en: "Operational support" },
      ],
      available: true,
      checkoutUrl: "/checkout/visto-b1-b2",
    },
    {
      slug: "visa-f1f2",
      icon: <GraduationCap className="h-5 w-5" />,
      color: "bg-purple-500",
      gradientFrom: "from-purple-500",
      gradientTo: "to-violet-600",
      badgeLabel: lang === "pt" ? "Disponível" : "Available",
      titlePt: "Visto de Estudante F-1/F-2",
      titleEn: "F-1/F-2 Student Visa",
      subtitlePt: "Estudantes em instituições americanas",
      subtitleEn: "For students accepted by US institutions",
      descPt: "Guia passo a passo para aplicar ao visto F-1 ou dependentes F-2. Orientação sobre I-20, DS-160, SEVIS.",
      descEn: "Step-by-step guide for the F-1 visa or F-2 dependents. Guidance on I-20, DS-160, SEVIS.",
      features: [
        { pt: "I-20 e SEVIS", en: "I-20 and SEVIS guidance" },
        { pt: "Guia taxa SEVIS", en: "SEVIS fee payment guide" },
        { pt: "Preparação para entrevista", en: "Interview preparation" },
      ],
      available: true,
      checkoutUrl: "/checkout/visa-f1f2",
    },
  ];

  const products = availableProducts.filter(
    (p) => !userServicesSlugs.includes(p.slug)
  );

  if (products.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <ShoppingBag className="w-5 h-5 text-primary" />
        <h2 className="font-bold text-lg text-foreground">
          {t.getProcesses}
        </h2>
      </div>

      <div
        className={`grid gap-4 ${
          products.length === 1
            ? "grid-cols-1 max-w-2xl"
            : "grid-cols-1 lg:grid-cols-2"
        }`}
      >
        {products.map((product) => (
          <StoreProductCard 
            key={product.slug}
            product={product}
            lang={lang}
            t={t}
            hasPreviousAttempt={services.some(s => (s.serviceSlug === product.slug || (s.serviceSlug === "visto-f1" && product.slug === "visa-f1f2")) && s.isSecondAttempt)}
          />
        ))}
      </div>
    </section>
  );
};
