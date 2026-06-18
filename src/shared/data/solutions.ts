import type { Language } from "@app/app/i18n";
import analysisImage from "@assets/solutions/analise das financas.png";
import chatImage from "@assets/solutions/chat para servicos personalizados.png";
import couponsImage from "@assets/solutions/criar cupons.png";
import processesImage from "@assets/solutions/gerenciar processos.png";
import discountsImage from "@assets/solutions/gerenciar regras de desconto.png";
import servicesImage from "@assets/solutions/gerenciar servicos.png";
import teamImage from "@assets/solutions/gerenciar time.png";
import casesImage from "@assets/solutions/gerir aprovacoes.png";
import sellerImage from "@assets/solutions/plataforma para vendedor.png";

export type SolutionSlug =
  | "fluxo-b1b2"
  | "fluxo-f1"
  | "fluxo-extensao-status"
  | "fluxo-troca-status"
  | "analise-das-financas"
  | "chat-para-servicos-personalizados"
  | "criar-cupons-customizados"
  | "gerenciar-processos"
  | "gerenciar-regras-de-desconto"
  | "gerenciar-servicos"
  | "gerenciar-time"
  | "gerir-fluxo-de-casos"
  | "plataforma-para-vendedores";

export type LocalizedText = Record<Language, string>;

type SolutionGroupKey = "fluxos" | "operacao" | "produtos";

export type SolutionCard = {
  slug: SolutionSlug;
  group: SolutionGroupKey;
  title: LocalizedText;
  summary: LocalizedText;
  detail: LocalizedText;
  features: Record<Language, string[]>;
  image: string;
  imageAlt: LocalizedText;
};

export const solutionMenuGroups: Array<{
  key: SolutionGroupKey;
  label: LocalizedText;
  slugs: SolutionSlug[];
}> = [
  {
    key: "fluxos",
    label: {
      pt: "Vistos",
      en: "Visas",
      es: "Visados",
    },
    slugs: [
      "fluxo-b1b2",
      "fluxo-f1",
      "fluxo-extensao-status",
      "fluxo-troca-status",
    ],
  },
  {
    key: "operacao",
    label: {
      pt: "Operação",
      en: "Operations",
      es: "Operación",
    },
    slugs: [
      "gerenciar-processos",
      "gerenciar-servicos",
      "gerenciar-time",
      "gerenciar-regras-de-desconto",
      "gerir-fluxo-de-casos",
    ],
  },
  {
    key: "produtos",
    label: {
      pt: "Soluções",
      en: "Solutions",
      es: "Soluciones",
    },
    slugs: [
      "analise-das-financas",
      "chat-para-servicos-personalizados",
      "criar-cupons-customizados",
      "plataforma-para-vendedores",
    ],
  },
] as const;

const text = (pt: string, en: string, es: string): LocalizedText => ({ pt, en, es });

export const solutions: SolutionCard[] = [
  {
    slug: "fluxo-b1b2",
    group: "fluxos",
    title: text("Visto B1/B2", "B1/B2 Visa", "Visa B1/B2"),
    summary: text(
      "Organize o visto B1/B2 com etapas, documentos e aprovações.",
      "Organize the B1/B2 visa with stages, documents and approvals.",
      "Organice la visa B1/B2 con etapas, documentos y aprobaciones.",
    ),
    detail: text(
      "Template para vender e operar o fluxo B1/B2 com clareza para o cliente e visão de ponta a ponta para o time.",
      "Template to sell and run the B1/B2 flow with clarity for the client and end-to-end visibility for the team.",
      "Plantilla para vender y operar el flujo B1/B2 con claridad para el cliente y visión de extremo a extremo para el equipo.",
    ),
    features: {
      pt: ["Etapas do B1/B2", "Checklist documental", "Aprovações centralizadas"],
      en: ["B1/B2 stages", "Document checklist", "Centralized approvals"],
      es: ["Etapas del B1/B2", "Lista documental", "Aprobaciones centralizadas"],
    },
    image: casesImage,
    imageAlt: text("Visto B1/B2", "B1/B2 visa", "Visa B1/B2"),
  },
  {
    slug: "fluxo-f1",
    group: "fluxos",
    title: text("Visto F1", "F1 Visa", "Visa F1"),
    summary: text(
      "Acompanhe o processo F1 com uma jornada clara por etapa.",
      "Track the F1 process with a clear step-by-step journey.",
      "Siga el proceso F1 con un recorrido claro por etapa.",
    ),
    detail: text(
      "Estruture o fluxo F1 com menos atrito, mais visibilidade e comunicação objetiva em cada fase.",
      "Structure the F1 flow with less friction, more visibility and clear communication at every stage.",
      "Estructure el flujo F1 con menos fricción, más visibilidad y comunicación clara en cada fase.",
    ),
    features: {
      pt: ["Etapas do estudante", "Documentos e revisões", "Histórico do caso"],
      en: ["Student stages", "Documents and reviews", "Case history"],
      es: ["Etapas del estudiante", "Documentos y revisiones", "Historial del caso"],
    },
    image: servicesImage,
    imageAlt: text("Visto F1", "F1 visa", "Visa F1"),
  },
  {
    slug: "fluxo-extensao-status",
    group: "fluxos",
    title: text("Extensão de Status", "Status Extension", "Extensión de Estatus"),
    summary: text(
      "Padronize a extensão de status com um fluxo guiado.",
      "Standardize the status extension with a guided flow.",
      "Estandarice la extensión de estatus con un flujo guiado.",
    ),
    detail: text(
      "Controle os marcos da extensão de status e reduza a chance de perder pendências ao longo do processo.",
      "Control the key milestones of the status extension and reduce the chance of missing pending items along the way.",
      "Controle los hitos de la extensión de estatus y reduzca la chance de perder pendientes a lo largo del proceso.",
    ),
    features: {
      pt: ["Marcos da extensão", "Pendências rastreáveis", "Fluxo para o time"],
      en: ["Extension milestones", "Trackable pending items", "Team flow"],
      es: ["Hitos de la extensión", "Pendientes rastreables", "Flujo para el equipo"],
    },
    image: processesImage,
    imageAlt: text("Extensão de status", "Status extension", "Extensión de estatus"),
  },
  {
    slug: "fluxo-troca-status",
    group: "fluxos",
    title: text("Troca de Status", "Status Change", "Cambio de Estatus"),
    summary: text(
      "Trilhe a troca de status com aprovações e pontos de controle.",
      "Track the status change with approvals and control points.",
      "Siga el cambio de estatus con aprobaciones y puntos de control.",
    ),
    detail: text(
      "A troca de status ganha um template operacional para reduzir retrabalho e organizar a evolução do caso.",
      "The status change gets an operational template to reduce rework and organize the case progression.",
      "El cambio de estatus obtiene una plantilla operacional para reducir retrabajo y organizar la evolución del caso.",
    ),
    features: {
      pt: ["Controle de mudança", "Aprovações", "Pontos de revisão"],
      en: ["Change control", "Approvals", "Review points"],
      es: ["Control de cambio", "Aprobaciones", "Puntos de revisión"],
    },
    image: discountsImage,
    imageAlt: text("Troca de status", "Status change", "Cambio de estatus"),
  },
  {
    slug: "analise-das-financas",
    group: "produtos",
    title: text("Análise das Finanças", "Finance Analysis", "Análisis de Finanzas"),
    summary: text(
      "Visualize caixa, receita e previsibilidade em um só lugar.",
      "See cash flow, revenue and predictability in one place.",
      "Visualice caja, ingresos y previsibilidad en un solo lugar.",
    ),
    detail: text(
      "Use a página de análise para dar contexto financeiro ao escritório e apoiar decisões com mais clareza.",
      "Use the analysis page to bring financial context to the firm and support decisions with more clarity.",
      "Use la página de análisis para dar contexto financiero al despacho y apoyar decisiones con más claridad.",
    ),
    features: {
      pt: ["Receita total", "Custos e margens", "Indicadores de operação"],
      en: ["Total revenue", "Costs and margins", "Operational indicators"],
      es: ["Ingresos totales", "Costos y márgenes", "Indicadores de operación"],
    },
    image: analysisImage,
    imageAlt: text("Análise das finanças", "Finance analysis", "Análisis de finanzas"),
  },
  {
    slug: "chat-para-servicos-personalizados",
    group: "produtos",
    title: text(
      "Chat para Serviços Personalizados",
      "Chat for Custom Services",
      "Chat para Servicios Personalizados",
    ),
    summary: text(
      "Converse com o cliente sem quebrar o contexto do serviço.",
      "Talk to the client without breaking the service context.",
      "Hable con el cliente sin romper el contexto del servicio.",
    ),
    detail: text(
      "Centralize conversas, orientação e próximos passos em uma experiência mais clara para atendimento personalizado.",
      "Centralize conversations, guidance and next steps in a clearer experience for personalized service.",
      "Centralice conversaciones, orientación y próximos pasos en una experiencia más clara para atención personalizada.",
    ),
    features: {
      pt: ["Chat contextual", "Atendimento por serviço", "Histórico unificado"],
      en: ["Contextual chat", "Service-based support", "Unified history"],
      es: ["Chat contextual", "Atención por servicio", "Historial unificado"],
    },
    image: chatImage,
    imageAlt: text("Chat para serviços personalizados", "Chat for custom services", "Chat para servicios personalizados"),
  },
  {
    slug: "criar-cupons-customizados",
    group: "produtos",
    title: text("Criar Cupons Customizados", "Create Custom Coupons", "Crear Cupones Personalizados"),
    summary: text(
      "Gere cupons por oferta, campanha ou momento comercial.",
      "Generate coupons by offer, campaign or sales moment.",
      "Genere cupones por oferta, campaña o momento comercial.",
    ),
    detail: text(
      "Personalize descontos para promoções, recompra ou campanhas específicas sem perder controle operacional.",
      "Personalize discounts for promotions, re-ordering or special campaigns without losing operational control.",
      "Personalice descuentos para promociones, recompra o campañas específicas sin perder control operacional.",
    ),
    features: {
      pt: ["Cupom por campanha", "Regras de validade", "Controle de uso"],
      en: ["Campaign coupon", "Validity rules", "Usage control"],
      es: ["Cupón por campaña", "Reglas de vigencia", "Control de uso"],
    },
    image: couponsImage,
    imageAlt: text("Criar cupons customizados", "Create custom coupons", "Crear cupones personalizados"),
  },
  {
    slug: "gerenciar-processos",
    group: "operacao",
    title: text("Gerenciar Processos", "Manage Processes", "Gestionar Procesos"),
    summary: text(
      "Veja cada caso com etapas, responsáveis e pendências.",
      "See each case with stages, owners and pending items.",
      "Vea cada caso con etapas, responsables y pendientes.",
    ),
    detail: text(
      "Um template para acompanhar o andamento operacional sem perder histórico, prioridade ou contexto.",
      "A template to track operational progress without losing history, priority or context.",
      "Una plantilla para seguir el avance operacional sin perder historial, prioridad o contexto.",
    ),
    features: {
      pt: ["Pipeline por etapa", "Responsáveis visíveis", "Histórico central"],
      en: ["Stage pipeline", "Visible owners", "Central history"],
      es: ["Pipeline por etapa", "Responsables visibles", "Historial central"],
    },
    image: processesImage,
    imageAlt: text("Gerenciar processos", "Manage processes", "Gestionar procesos"),
  },
  {
    slug: "gerenciar-regras-de-desconto",
    group: "operacao",
    title: text("Gerenciar Regras de Desconto", "Manage Discount Rules", "Gestionar Reglas de Descuento"),
    summary: text(
      "Padronize regras de desconto sem perder controle comercial.",
      "Standardize discount rules without losing commercial control.",
      "Estandarice reglas de descuento sin perder control comercial.",
    ),
    detail: text(
      "Defina limites, exceções e aprovadores para descontos com mais segurança e menos improviso.",
      "Define limits, exceptions and approvers for discounts with more safety and less improvisation.",
      "Defina límites, excepciones y aprobadores para descuentos con más seguridad y menos improvisación.",
    ),
    features: {
      pt: ["Limites por oferta", "Exceções aprovadas", "Regras transparentes"],
      en: ["Offer limits", "Approved exceptions", "Transparent rules"],
      es: ["Límites por oferta", "Excepciones aprobadas", "Reglas transparentes"],
    },
    image: discountsImage,
    imageAlt: text("Gerenciar regras de desconto", "Manage discount rules", "Gestionar reglas de descuento"),
  },
  {
    slug: "gerenciar-servicos",
    group: "operacao",
    title: text("Gerenciar Serviços", "Manage Services", "Gestionar Servicios"),
    summary: text(
      "Organize serviços em um catálogo fácil de operar.",
      "Organize services in an easy-to-run catalog.",
      "Organice servicios en un catálogo fácil de operar.",
    ),
    detail: text(
      "Centralize o catálogo de serviços, escopo e disponibilidade para simplificar a rotina do escritório.",
      "Centralize the service catalog, scope and availability to simplify the firm's daily routine.",
      "Centralice el catálogo de servicios, alcance y disponibilidad para simplificar la rutina del despacho.",
    ),
    features: {
      pt: ["Catálogo único", "Escopo por serviço", "Operação organizada"],
      en: ["Single catalog", "Scope per service", "Organized operation"],
      es: ["Catálogo único", "Alcance por servicio", "Operación organizada"],
    },
    image: servicesImage,
    imageAlt: text("Gerenciar serviços", "Manage services", "Gestionar servicios"),
  },
  {
    slug: "gerenciar-time",
    group: "operacao",
    title: text("Gerenciar Time", "Manage Team", "Gestionar Equipo"),
    summary: text(
      "Distribua tarefas e acompanhe a equipe com clareza.",
      "Distribute tasks and follow the team clearly.",
      "Distribuya tareas y siga al equipo con claridad.",
    ),
    detail: text(
      "Organize o trabalho do time por papel, prioridade e responsabilidade para manter a execução previsível.",
      "Organize the team's work by role, priority and responsibility to keep execution predictable.",
      "Organice el trabajo del equipo por rol, prioridad y responsabilidad para mantener la ejecución previsible.",
    ),
    features: {
      pt: ["Responsáveis por área", "Fila de tarefas", "Visão de capacidade"],
      en: ["Area owners", "Task queue", "Capacity view"],
      es: ["Responsables por área", "Cola de tareas", "Vista de capacidad"],
    },
    image: teamImage,
    imageAlt: text("Gerenciar time", "Manage team", "Gestionar equipo"),
  },
  {
    slug: "gerir-fluxo-de-casos",
    group: "operacao",
    title: text("Gestão de Casos", "Case Management", "Gestión de Casos"),
    summary: text(
      "Acompanhe múltiplos casos com visão de ponta a ponta.",
      "Track multiple cases with an end-to-end view.",
      "Siga múltiples casos con visión de extremo a extremo.",
    ),
    detail: text(
      "Uma página para operar casos recorrentes com contexto, status e histórico sempre visíveis.",
      "A page to run recurring cases with context, status and history always visible.",
      "Una página para operar casos recurrentes con contexto, estado e historial siempre visibles.",
    ),
    features: {
      pt: ["Lista de casos", "Status visível", "Histórico consolidado"],
      en: ["Case list", "Visible status", "Consolidated history"],
      es: ["Lista de casos", "Estado visible", "Historial consolidado"],
    },
    image: casesImage,
    imageAlt: text("Gestão de casos", "Case management", "Gestión de casos"),
  },
  {
    slug: "plataforma-para-vendedores",
    group: "produtos",
    title: text("Plataforma para Vendedores", "Platform for Sellers", "Plataforma para Vendedores"),
    summary: text(
      "Dê ao time uma plataforma para vender com mais organização.",
      "Give the team a platform to sell with more organization.",
      "Dé al equipo una plataforma para vender con más organización.",
    ),
    detail: text(
      "Uma base para vender serviços, controlar oferta e reduzir a dispersão do processo comercial.",
      "A base for selling services, controlling offers and reducing commercial process spread.",
      "Una base para vender servicios, controlar ofertas y reducir la dispersión del proceso comercial.",
    ),
    features: {
      pt: ["Oferta centralizada", "Visão comercial", "Fluxo de venda claro"],
      en: ["Centralized offers", "Commercial view", "Clear sales flow"],
      es: ["Oferta centralizada", "Visión comercial", "Flujo de venta claro"],
    },
    image: sellerImage,
    imageAlt: text("Plataforma para vendedores", "Platform for sellers", "Plataforma para vendedores"),
  },
];

export const defaultSolutionSlug: SolutionSlug = "fluxo-b1b2";

export function getSolutionBySlug(slug?: string | null): SolutionCard {
  return solutions.find((solution) => solution.slug === slug) ?? solutions[0];
}

export function getSolutionsByGroup(group: SolutionGroupKey): SolutionCard[] {
  return solutions.filter((solution) => solution.group === group);
}
