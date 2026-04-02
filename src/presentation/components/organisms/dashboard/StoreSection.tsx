import { ShoppingBag, Clock, Repeat, Plane, GraduationCap, Sparkles } from "lucide-react";
import { StoreProductCard } from "./StoreProductCard";
import { useT } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StoreSectionProps {
  userServicesSlugs: string[];
  lang: string;
  services: any[];
}

export const StoreSection = ({ userServicesSlugs, lang, services }: StoreSectionProps) => {
  const t = useT("dashboard");
  const d = t?.dashboard;
  
  const availableProducts = [
    {
      slug: "extensao-status",
      icon: <Clock />,
      color: "bg-blue-500",
      gradientFrom: "from-blue-500",
      gradientTo: "to-indigo-600",
      badgeLabel: lang === "pt" ? "Disponível" : "Available",
      titlePt: "Extensão de Status (I-539)",
      titleEn: "Status Extension (I-539)",
      subtitlePt: "Estender Estadia",
      subtitleEn: "Extend Stay",
      descPt: "Para quem já está nos EUA e precisa estender o tempo legal.",
      descEn: "For those already in the US needing to extend their legal stay.",
      features: [
        { pt: "Guia digital I-539", en: "Digital I-539 Guide" },
        { pt: "Checklist de documentos", en: "Document checklist" },
        { pt: "Instruções de envio", en: "Filing instructions" },
      ],
      available: true,
      checkoutUrl: "/checkout/extensao-status",
    },
    {
      slug: "troca-status",
      icon: <Repeat />,
      color: "bg-blue-500",
      gradientFrom: "from-blue-500",
      gradientTo: "to-indigo-600",
      badgeLabel: lang === "pt" ? "Disponível" : "Available",
      titlePt: "Troca de Status (COS)",
      titleEn: "Change of Status (COS)",
      subtitlePt: "Mudança de Categoria",
      subtitleEn: "New Category",
      descPt: "Mudança de categoria de visto dentro dos Estados Unidos.",
      descEn: "Change your visa category while staying in the US.",
      features: [
        { pt: "Guia passo a passo", en: "Step-by-step guide" },
        { pt: "Checklist documentos", en: "Document checklist" },
        { pt: "Apoio formulários", en: "Form support" },
      ],
      available: true,
      checkoutUrl: "/checkout/troca-status",
    },
    {
      slug: "visto-b1-b2",
      icon: <Plane />,
      color: "bg-blue-500",
      gradientFrom: "from-blue-500",
      gradientTo: "to-indigo-600",
      badgeLabel: lang === "pt" ? "Disponível" : "Available",
      titlePt: "Visto B1/B2 Turismo",
      titleEn: "B1/B2 Tourist Visa",
      subtitlePt: "Turismo/Negócios",
      subtitleEn: "Tourism/Business",
      descPt: "Guia completo passo a passo para aplicar ao visto americano.",
      descEn: "Complete step-by-step guide to apply for a US visa.",
      features: [
        { pt: "DS-160 e Entrevista", en: "DS-160 & Interview" },
        { pt: "Checklist completo", en: "Full checklist" },
        { pt: "Suporte operacional", en: "Operational support" },
      ],
      available: true,
      checkoutUrl: "/checkout/visto-b1-b2",
    },
    {
      slug: "visa-f1f2",
      icon: <GraduationCap />,
      color: "bg-purple-500",
      gradientFrom: "from-purple-500",
      gradientTo: "to-violet-600",
      badgeLabel: lang === "pt" ? "Disponível" : "Available",
      titlePt: "Visto de Estudante F-1",
      titleEn: "F-1 Student Visa",
      subtitlePt: "Estudante/Acadêmico",
      subtitleEn: "Student/Academic",
      descPt: "Guia detalhado para visto em instituições americanas.",
      descEn: "Detailed guide for student visas in US institutions.",
      features: [
        { pt: "I-20 e Taxa SEVIS", en: "I-20 & SEVIS Fee" },
        { pt: "Preparação entrevista", en: "Interview preparation" },
        { pt: "Documentação F-2", en: "F-2 documentation" },
      ],
      available: true,
      checkoutUrl: "/checkout/visa-f1f2",
    },
  ];

  const products = availableProducts.filter(
    (p) => !userServicesSlugs.includes(p.slug)
  );

  if (products.length === 0 || !d) return null;

  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-8"
    >
      <div className="flex flex-col space-y-1 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-display text-xl font-black uppercase tracking-tight text-foreground">
            {d.getProcesses}
          </h2>
        </div>
        <p className="text-xs text-muted-foreground font-medium pl-1 gap-2 flex items-center">
          <Sparkles className="h-3 w-3 text-primary" />
          {lang === "pt" ? "Melhore sua jornada com guias especializados." : "Enhance your journey with specialized guides."}
        </p>
      </div>

      <div
        className={cn(
          "grid gap-8",
          products.length === 1 ? "grid-cols-1 max-w-xl" : 
          products.length === 2 ? "grid-cols-1 sm:grid-cols-2 max-w-5xl" :
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
        )}
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
    </motion.section>
  );
};
