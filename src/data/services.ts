import type { ServiceData, StepConfig } from "../templates/ServiceDetailTemplate";

export interface ServiceMeta extends Omit<ServiceData, 'steps'> {
  heroImage: string;
  successRate: string;
  processType: string;
  heroIconName: string; // react-icons name — resolved in ServiceDetailPage
  steps: StepConfig[];
}

export const servicesData: ServiceMeta[] = [
  {
    slug: "mentoria-bronze",
    title: "Mentoria Bronze",
    subtitle: "1 Simulação de Entrevista",
    price: "R$ 197,00",
    originalPrice: "R$ 397,00",
    heroImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop",
    successRate: "94.0%",
    processType: "Mentoria",
    heroIconName: "RiUserStarLine",
    description: "Treinamento básico com uma simulação standard.",
    forWhom: ["Quem quer um treinamento rápido"],
    notForWhom: [],
    included: ["1 Mock Interview", "Plano de Estudo"],
    requirements: ["DS-160 confirmada"],
    dependentPrice: "US$ 0,00",
    steps: [],
    faq: [],
  },
  {
    slug: "mentoria-silver",
    title: "Mentoria Prata",
    subtitle: "2 Simulações de Entrevista",
    price: "R$ 397,00",
    originalPrice: "R$ 597,00",
    heroImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop",
    successRate: "97.5%",
    processType: "Mentoria",
    heroIconName: "RiUserStarLine",
    description: "Treinamento intermediário com duas simulações e análise de perfil.",
    forWhom: ["Quem busca melhorar o desempenho entre sessões"],
    notForWhom: [],
    included: ["2 Mock Interviews", "Análise de Perfil", "Feedback Detalhado"],
    requirements: ["DS-160 confirmada"],
    dependentPrice: "US$ 0,00",
    steps: [],
    faq: [],
  },
  {
    slug: "mentoria-gold",
    title: "Mentoria Ouro",
    subtitle: "3 Simulações + Revisão Completa",
    price: "R$ 597,00",
    originalPrice: "R$ 897,00",
    heroImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
    successRate: "99.1%",
    processType: "Mentoria VIP",
    heroIconName: "RiUserStarLine",
    description: "Treinamento completo e acompanhamento próximo para casos complexos.",
    forWhom: ["Quem quer a melhor preparação possível", "Casos com múltiplas negativas"],
    notForWhom: [],
    included: [
      "3 Mock Interviews",
      "Análise de Perfil Profunda",
      "Revisão da DS-160",
      "Suporte via WhatsApp",
    ],
    requirements: ["DS-160 confirmada"],
    dependentPrice: "US$ 0,00",
    steps: [],
    faq: [],
  },
];

export function getServiceBySlug(slug: string): ServiceMeta | undefined {
  return servicesData.find((s) => s.slug === slug);
}
