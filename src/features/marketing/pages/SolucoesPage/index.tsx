import { Link, Navigate, useParams } from "react-router-dom";
import { Activity, ArrowRight, Check, FolderCheck, LayoutGrid, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";
import { useLocale } from "@app/app/i18n";
import { PublicButton } from "@shared/components/atoms/PublicButton";
import wernerLogo from "@assets/logos/Logotipo-Werner-Advocacia.png";
import logoHorizontal from "@assets/logos/logo-horizontal-CyOfyqfY.png";
import marquesLogo from "@assets/logos/MARQUES-ADVOGADOS-.png";
import logotipoLogo from "@assets/logos/cropped-LOGOTIPO-Logotipo.webp";
import msgLogo from "@assets/logos/cropped-logo-MSG-azul.png";
import genericLogo from "@assets/logos/4085d7be-8277-487c-af1e-7190ed407c7f-e1729658650101.png";
import mattosLogo from "@assets/logos/Logo-03-1024x818.png";
import gerenciarProcessos1 from "@assets/solutions/gerenciar-processos-1.png";
import gerenciarProcessos2 from "@assets/solutions/gerenciar-processos-2.png";
import gerenciarProcessos3 from "@assets/solutions/gerenciar-processos-3.png";
import b1b2ProcessoImage from "@assets/solutions/b1b2-processo-simplificado.png";
import b1b2AcompanhamentoImage from "@assets/solutions/b1b2-acompanhamento-inteligente.png";
import b1b2OrganizacaoImage from "@assets/solutions/b1b2-mais-organizacao.png";
import {
  defaultSolutionSlug,
  getSolutionBySlug,
} from "@shared/data/solutions";

const pageCopy = {
  pt: {
    tag: "Soluções",
    title: "Uma solução por página, com foco total no que importa.",
    lead:
      "Cada página aprofunda uma solução específica, com blocos editoriais abaixo do hero, imagens dedicadas e benefícios claros.",
    cta: "Falar com especialista",
    signup: "Criar conta",
    sectionTitle: "Uma operação mais clara, em uma página com foco total.",
    sectionLead:
      "A solução concentra as informações essenciais em um fluxo limpo, com a imagem certa, leitura rápida e um próximo passo direto para cadastro.",
    blocks: [
      {
        title: "Visão geral",
        text: "Entenda a proposta da solução em poucos segundos, com o contexto que importa no topo e a leitura visual logo abaixo.",
      },
      {
        title: "Como funciona",
        text: "Veja a operação em um layout mais editorial, com explicação curta e imagem grande para dar clareza ao conteúdo.",
      },
      {
        title: "Próximo passo",
        text: "Depois de entender a solução, siga diretamente para o cadastro e mantenha o fluxo simples para o usuário.",
      },
    ],
  },
  en: {
    tag: "Solutions",
    title: "One solution per page, with full focus on what matters.",
    lead:
      "Each page goes deeper into a specific solution, with editorial blocks below the hero, dedicated images and clear benefits.",
    cta: "Talk to an expert",
    signup: "Create account",
    sectionTitle: "A clearer operation, in a page with full focus.",
    sectionLead:
      "The solution brings the essential information into a clean flow, with the right image, quick reading and a direct next step to sign up.",
    blocks: [
      {
        title: "Overview",
        text: "Understand the solution at a glance, with the key context up top and the visual reading right below it.",
      },
      {
        title: "How it works",
        text: "See the operation in a more editorial layout, with short copy and a large image that gives the content room.",
      },
      {
        title: "Next step",
        text: "After understanding the solution, move straight to sign up and keep the flow simple for the user.",
      },
    ],
  },
  es: {
    tag: "Soluciones",
    title: "Una solución por página, con foco total en lo importante.",
    lead:
      "Cada página profundiza en una solución específica, con bloques editoriales debajo del hero, imágenes dedicadas y beneficios claros.",
    cta: "Hablar con especialista",
    signup: "Crear cuenta",
    sectionTitle: "Una operación más clara, en una página con foco total.",
    sectionLead:
      "La solución concentra la información esencial en un flujo limpio, con la imagen correcta, lectura rápida y un siguiente paso directo para registrarse.",
    blocks: [
      {
        title: "Visión general",
        text: "Entienda la propuesta de la solución en pocos segundos, con el contexto importante arriba y la lectura visual debajo.",
      },
      {
        title: "Cómo funciona",
        text: "Vea la operación en un layout más editorial, con texto breve e imagen grande para dar espacio al contenido.",
      },
      {
        title: "Siguiente paso",
        text: "Después de entender la solución, siga directamente al registro y mantenga el flujo simple para el usuario.",
      },
    ],
  },
  } as const;

const enhancedCopy = {
  pt: {
    compareTag: "Por que mudar",
    compareTitle: "Da operação dispersa para um fluxo com foco total.",
    compareLead:
      "Veja a diferença entre operar no improviso e operar com a Aplikei organizando cada etapa.",
    beforeLabel: "Sem a Aplikei",
    beforeItems: [
      "Informações espalhadas em planilhas, e-mails e mensagens.",
      "Retrabalho e perda de histórico a cada novo caso.",
      "Falta de visão clara do que está em andamento.",
    ],
    afterLabel: "Com a Aplikei",
    afterItems: [
      "Tudo centralizado em uma única operação organizada.",
      "Histórico, status e responsáveis sempre visíveis.",
      "Fluxo padronizado que o time segue sem improviso.",
    ],
    showcaseTitle: "O que você organiza nesta solução",
    capabilitiesTag: "Recursos",
    capabilitiesTitle: "Tudo o que essa solução entrega",
    capabilitiesLead:
      "Recursos pensados para tirar a operação do improviso e dar clareza ao time.",
  },
  en: {
    compareTag: "Why change",
    compareTitle: "From a scattered operation to a flow with full focus.",
    compareLead:
      "See the difference between improvising and running everything with Aplikei organizing each step.",
    beforeLabel: "Without Aplikei",
    beforeItems: [
      "Information scattered across spreadsheets, emails and messages.",
      "Rework and lost history with every new case.",
      "No clear view of what is in progress.",
    ],
    afterLabel: "With Aplikei",
    afterItems: [
      "Everything centralized in a single organized operation.",
      "History, status and owners always visible.",
      "A standardized flow the team follows without improvising.",
    ],
    showcaseTitle: "What you organize with this solution",
    capabilitiesTag: "Features",
    capabilitiesTitle: "Everything this solution delivers",
    capabilitiesLead:
      "Features designed to take the operation out of improvisation and give the team clarity.",
  },
  es: {
    compareTag: "Por qué cambiar",
    compareTitle: "De una operación dispersa a un flujo con foco total.",
    compareLead:
      "Vea la diferencia entre improvisar y operar con Aplikei organizando cada etapa.",
    beforeLabel: "Sin Aplikei",
    beforeItems: [
      "Información dispersa en hojas de cálculo, correos y mensajes.",
      "Retrabajo y pérdida de historial con cada nuevo caso.",
      "Falta de una visión clara de lo que está en curso.",
    ],
    afterLabel: "Con Aplikei",
    afterItems: [
      "Todo centralizado en una única operación organizada.",
      "Historial, estado y responsables siempre visibles.",
      "Un flujo estandarizado que el equipo sigue sin improvisar.",
    ],
    showcaseTitle: "Lo que organizas con esta solución",
    capabilitiesTag: "Recursos",
    capabilitiesTitle: "Todo lo que esta solución entrega",
    capabilitiesLead:
      "Recursos pensados para sacar la operación de la improvisación y dar claridad al equipo.",
  },
} as const;

const block = (
  title: [string, string, string],
  text: [string, string, string],
) => ({
  pt: { title: title[0], text: text[0] },
  en: { title: title[1], text: text[1] },
  es: { title: title[2], text: text[2] },
});

const ENHANCED_BLOCKS: Partial<
  Record<string, ReturnType<typeof block>[]>
> = {
  "gerenciar-servicos": [
    block(
      ["Catálogo de serviços centralizado", "Centralized service catalog", "Catálogo de servicios centralizado"],
      [
        "Reúna todos os serviços em um só lugar, com escopo, preço e disponibilidade claros para o time.",
        "Bring every service into one place, with clear scope, price and availability for the team.",
        "Reúna todos los servicios en un solo lugar, con alcance, precio y disponibilidad claros para el equipo.",
      ],
    ),
    block(
      ["Escopo padronizado", "Standardized scope", "Alcance estandarizado"],
      [
        "Defina o que entra em cada serviço para vender com consistência e evitar mal-entendidos.",
        "Define what goes into each service to sell consistently and avoid misunderstandings.",
        "Defina qué incluye cada servicio para vender con consistencia y evitar malentendidos.",
      ],
    ),
    block(
      ["Operação sem retrabalho", "Operation without rework", "Operación sin retrabajo"],
      [
        "Mantenha tudo organizado para que cada atendimento siga o mesmo padrão de qualidade.",
        "Keep everything organized so each request follows the same quality standard.",
        "Mantenga todo organizado para que cada atención siga el mismo estándar de calidad.",
      ],
    ),
  ],
  "gerenciar-time": [
    block(
      ["Responsáveis por área", "Owners by area", "Responsables por área"],
      [
        "Distribua o trabalho por papel e responsabilidade para todos saberem o que fazer.",
        "Distribute work by role and responsibility so everyone knows what to do.",
        "Distribuya el trabajo por rol y responsabilidad para que todos sepan qué hacer.",
      ],
    ),
    block(
      ["Fila de tarefas clara", "Clear task queue", "Cola de tareas clara"],
      [
        "Acompanhe prioridades e prazos em uma visão única, sem depender de cobranças manuais.",
        "Track priorities and deadlines in a single view, without relying on manual follow-ups.",
        "Siga prioridades y plazos en una vista única, sin depender de seguimientos manuales.",
      ],
    ),
    block(
      ["Visão de capacidade", "Capacity view", "Vista de capacidad"],
      [
        "Enxergue a carga do time para equilibrar a demanda e manter a execução previsível.",
        "See the team's workload to balance demand and keep execution predictable.",
        "Vea la carga del equipo para equilibrar la demanda y mantener la ejecución previsible.",
      ],
    ),
  ],
  "gerenciar-regras-de-desconto": [
    block(
      ["Limites por oferta", "Limits per offer", "Límites por oferta"],
      [
        "Defina até onde cada desconto pode ir e proteja a margem do escritório.",
        "Set how far each discount can go and protect the firm's margin.",
        "Defina hasta dónde puede llegar cada descuento y proteja el margen del despacho.",
      ],
    ),
    block(
      ["Exceções aprovadas", "Approved exceptions", "Excepciones aprobadas"],
      [
        "Permita exceções apenas com aprovação, mantendo o controle comercial.",
        "Allow exceptions only with approval, keeping commercial control.",
        "Permita excepciones solo con aprobación, manteniendo el control comercial.",
      ],
    ),
    block(
      ["Regras transparentes", "Transparent rules", "Reglas transparentes"],
      [
        "Deixe as condições claras para o time aplicar descontos sem improviso.",
        "Make conditions clear so the team applies discounts without improvising.",
        "Deje las condiciones claras para que el equipo aplique descuentos sin improvisar.",
      ],
    ),
  ],
  "gerir-fluxo-de-casos": [
    block(
      ["Casos de ponta a ponta", "End-to-end cases", "Casos de extremo a extremo"],
      [
        "Acompanhe múltiplos casos com contexto, status e histórico sempre visíveis.",
        "Track multiple cases with context, status and history always visible.",
        "Siga múltiples casos con contexto, estado e historial siempre visibles.",
      ],
    ),
    block(
      ["Status sempre visível", "Always-visible status", "Estado siempre visible"],
      [
        "Saiba em que fase cada caso está e o que precisa de atenção agora.",
        "Know which stage each case is in and what needs attention now.",
        "Sepa en qué fase está cada caso y qué necesita atención ahora.",
      ],
    ),
    block(
      ["Histórico consolidado", "Consolidated history", "Historial consolidado"],
      [
        "Mantenha decisões e documentos reunidos para retomar qualquer caso sem perda de contexto.",
        "Keep decisions and documents together to resume any case without losing context.",
        "Mantenga decisiones y documentos reunidos para retomar cualquier caso sin perder contexto.",
      ],
    ),
  ],
  "analise-das-financas": [
    block(
      ["Receita e caixa em tempo real", "Real-time revenue and cash", "Ingresos y caja en tiempo real"],
      [
        "Visualize entradas, saídas e previsibilidade em um só painel.",
        "See inflows, outflows and predictability in a single dashboard.",
        "Visualice entradas, salidas y previsibilidad en un solo panel.",
      ],
    ),
    block(
      ["Custos e margens claros", "Clear costs and margins", "Costos y márgenes claros"],
      [
        "Acompanhe onde o dinheiro entra e sai para proteger a rentabilidade.",
        "Track where money comes in and goes out to protect profitability.",
        "Siga dónde entra y sale el dinero para proteger la rentabilidad.",
      ],
    ),
    block(
      ["Decisões com contexto", "Decisions with context", "Decisiones con contexto"],
      [
        "Use indicadores de operação para decidir com mais clareza e menos achismo.",
        "Use operational indicators to decide with more clarity and less guesswork.",
        "Use indicadores de operación para decidir con más claridad y menos suposiciones.",
      ],
    ),
  ],
  "chat-para-servicos-personalizados": [
    block(
      ["Conversa no contexto do serviço", "Chat in the service context", "Conversación en el contexto del servicio"],
      [
        "Fale com o cliente sem perder o histórico e o contexto do atendimento.",
        "Talk to the client without losing the history and context of the service.",
        "Hable con el cliente sin perder el historial y el contexto de la atención.",
      ],
    ),
    block(
      ["Atendimento por serviço", "Service-based support", "Atención por servicio"],
      [
        "Organize as conversas por serviço para responder com mais agilidade.",
        "Organize conversations by service to respond faster.",
        "Organice las conversaciones por servicio para responder con más agilidad.",
      ],
    ),
    block(
      ["Histórico unificado", "Unified history", "Historial unificado"],
      [
        "Centralize mensagens e próximos passos em uma experiência única.",
        "Centralize messages and next steps in a single experience.",
        "Centralice mensajes y próximos pasos en una experiencia única.",
      ],
    ),
  ],
  "criar-cupons-customizados": [
    block(
      ["Cupom por campanha", "Coupon per campaign", "Cupón por campaña"],
      [
        "Crie descontos sob medida para cada oferta, promoção ou momento comercial.",
        "Create tailored discounts for each offer, promotion or sales moment.",
        "Cree descuentos a medida para cada oferta, promoción o momento comercial.",
      ],
    ),
    block(
      ["Regras de validade", "Validity rules", "Reglas de vigencia"],
      [
        "Defina período, condições e limites para cada cupom com segurança.",
        "Set period, conditions and limits for each coupon safely.",
        "Defina período, condiciones y límites para cada cupón con seguridad.",
      ],
    ),
    block(
      ["Controle de uso", "Usage control", "Control de uso"],
      [
        "Acompanhe quantas vezes cada cupom foi usado e mantenha o controle.",
        "Track how many times each coupon was used and stay in control.",
        "Siga cuántas veces se usó cada cupón y mantenga el control.",
      ],
    ),
  ],
  "plataforma-para-vendedores": [
    block(
      ["Oferta centralizada", "Centralized offers", "Oferta centralizada"],
      [
        "Reúna serviços e condições em uma base única para o time vender melhor.",
        "Bring services and conditions into a single base so the team sells better.",
        "Reúna servicios y condiciones en una base única para que el equipo venda mejor.",
      ],
    ),
    block(
      ["Visão comercial", "Commercial view", "Visión comercial"],
      [
        "Acompanhe o processo de venda com clareza do início ao fechamento.",
        "Track the sales process clearly from start to close.",
        "Siga el proceso de venta con claridad de principio a cierre.",
      ],
    ),
    block(
      ["Fluxo de venda claro", "Clear sales flow", "Flujo de venta claro"],
      [
        "Reduza a dispersão e dê ao vendedor um caminho simples para avançar.",
        "Reduce dispersion and give sellers a simple path to move forward.",
        "Reduzca la dispersión y dé al vendedor un camino simple para avanzar.",
      ],
    ),
  ],
};

const CAPABILITY_ICONS = [LayoutGrid, Activity, FolderCheck] as const;

const FIRM_LOGOS = [
  { name: "Werner Advocacia", src: wernerLogo },
  { name: "Logo Horizontal", src: logoHorizontal },
  { name: "Marques Advogados", src: marquesLogo },
  { name: "Logotipo", src: logotipoLogo },
  { name: "MSG Advocacia", src: msgLogo },
  { name: "Advocacia", src: genericLogo },
  { name: "Mattos Advogados", src: mattosLogo },
] as const;

const B1B2_SHOWCASE_IMAGES = [
  b1b2ProcessoImage,
  b1b2AcompanhamentoImage,
  b1b2OrganizacaoImage,
] as const;

const GERENCIAR_PROCESSOS_IMAGES = [
  gerenciarProcessos1,
  gerenciarProcessos2,
  gerenciarProcessos3,
] as const;

function getShowcaseBlocks(slug: string, lang: "pt" | "en" | "es") {
  const enhanced = ENHANCED_BLOCKS[slug];
  if (enhanced) {
    return enhanced.map((entry) => entry[lang]);
  }

  if (slug === "fluxo-b1b2") {
    return [
      {
        title:
          lang === "en"
            ? "Simplified process from start to finish"
            : lang === "es"
              ? "Proceso simplificado del inicio al fin"
              : "Processo simplificado do início ao fim",
        text:
          lang === "en"
            ? "Fill in your details, send documents and follow every stage in one place. Aplikei organizes the entire process so you get more clarity, practicality and security throughout your request."
            : lang === "es"
              ? "Complete sus datos, envíe documentos y siga cada etapa en un solo lugar. Aplikei organiza todo el proceso para que tenga más claridad, practicidad y seguridad durante su solicitud."
              : "Preencha seus dados, envie documentos e acompanhe cada etapa em um único lugar. A Aplikei organiza todo o processo para que você tenha mais clareza, praticidade e segurança durante sua solicitação.",
      },
      {
        title:
          lang === "en"
            ? "Smart tracking for your request"
            : lang === "es"
              ? "Seguimiento inteligente de su solicitud"
              : "Acompanhamento inteligente da sua solicitação",
        text:
          lang === "en"
            ? "Know exactly which stage you are in. Our platform centralizes information, documents and updates so you can follow your process without doubts or wasted time."
            : lang === "es"
              ? "Sepa exactamente en qué etapa está. Nuestra plataforma centraliza información, documentos y actualizaciones para que siga su proceso sin dudas ni pérdida de tiempo."
              : "Saiba exatamente em que etapa você está. Nossa plataforma centraliza informações, documentos e atualizações para que você acompanhe seu processo sem dúvidas ou perda de tempo.",
      },
      {
        title:
          lang === "en"
            ? "More organization, more confidence"
            : lang === "es"
              ? "Más organización, más confianza"
              : "Mais organização, mais confiança",
        text:
          lang === "en"
            ? "Get access to the guidance you need to prepare your documents and move forward with confidence. Aplikei helps you keep everything organized for a simpler, more efficient experience."
            : lang === "es"
              ? "Tenga acceso a las orientaciones necesarias para preparar su documentación y avanzar con tranquilidad. Aplikei le ayuda a mantener todo organizado para una experiencia más simple y eficiente."
              : "Tenha acesso às orientações necessárias para preparar sua documentação e avançar com tranquilidade. A Aplikei ajuda você a manter tudo organizado para uma experiência mais simples e eficiente.",
      },
    ] as const;
  }

  if (slug === "gerenciar-processos") {
    return [
      {
        title:
          lang === "en"
            ? "Simplify your case flow"
            : lang === "es"
              ? "Simplifique su flujo de casos"
              : "Simplifique seu fluxo de casos",
        text:
          lang === "en"
            ? "Track cases, stages and owners in one place to keep the operation organized from start to finish."
            : lang === "es"
              ? "Acompañe casos, etapas y responsables en un solo lugar para mantener la operación organizada de principio a fin."
              : "Acompanhe casos, etapas e responsáveis em um só lugar para manter a operação organizada do início ao fim.",
      },
      {
        title:
          lang === "en"
            ? "Intelligent operational tracking"
            : lang === "es"
              ? "Seguimiento operativo inteligente"
              : "Acompanhamento operacional inteligente",
        text:
          lang === "en"
            ? "See the progress of each case in real time and reduce friction with a clearer, more visual workflow."
            : lang === "es"
              ? "Visualice el avance de cada caso en tiempo real y reduzca fricciones con un flujo más claro y visual."
              : "Visualize o andamento de cada caso em tempo real e reduza fricções com um fluxo mais claro e visual.",
      },
      {
        title:
          lang === "en"
            ? "Documents and status under control"
            : lang === "es"
              ? "Documentos y estatus bajo control"
              : "Documentos e status sob controle",
        text:
          lang === "en"
            ? "Keep files, forms and updates centralized to avoid mistakes and move cases forward with confidence."
            : lang === "es"
              ? "Mantenga archivos, formularios y actualizaciones centralizados para evitar errores y avanzar con confianza."
              : "Mantenha arquivos, formulários e atualizações centralizados para evitar erros e avançar com confiança.",
      },
    ] as const;
  }

  if (slug === "fluxo-f1") {
    return [
      {
        title:
          lang === "en"
            ? "Guided process for students"
            : lang === "es"
              ? "Proceso guiado para estudiantes"
              : "Processo guiado para estudantes",
        text:
          lang === "en"
            ? "Fill out forms, send documents and follow every step of your request in one place. Aplikei simplifies the path to your student visa."
            : lang === "es"
              ? "Complete formularios, envíe documentos y acompañe cada etapa de su solicitud en un solo lugar. Aplikei simplifica el camino para su visa de estudiante."
              : "Preencha formulários, envie documentos e acompanhe cada etapa da sua solicitação em um único lugar. A Aplikei simplifica o caminho para seu visto de estudante.",
      },
      {
        title:
          lang === "en"
            ? "Complete application tracking"
            : lang === "es"
              ? "Seguimiento completo de la aplicación"
              : "Acompanhamento completo da aplicação",
        text:
          lang === "en"
            ? "See your process in real time, receive guidance and keep all documentation organized throughout your academic journey."
            : lang === "es"
              ? "Visualice el avance de su proceso en tiempo real, reciba orientaciones y mantenga toda la documentación organizada durante su jornada académica."
              : "Visualize o andamento do seu processo em tempo real, receba orientações e mantenha toda a documentação organizada durante sua jornada acadêmica.",
      },
      {
        title:
          lang === "en"
            ? "Preparation with more confidence"
            : lang === "es"
              ? "Preparación con más confianza"
              : "Preparação com mais confiança",
        text:
          lang === "en"
            ? "Organize your documents, track important requirements and move forward with more confidence in each step of your request."
            : lang === "es"
              ? "Organice sus documentos, acompañe requisitos importantes y avance con más seguridad en cada etapa de su solicitud."
              : "Organize seus documentos, acompanhe requisitos importantes e avance com mais segurança em cada etapa da sua solicitação.",
      },
    ] as const;
  }

  if (slug === "fluxo-extensao-status") {
    return [
      {
        title:
          lang === "en"
            ? "Request your extension with ease"
            : lang === "es"
              ? "Solicite su extensión con facilidad"
              : "Solicite sua extensão com facilidade",
        text:
          lang === "en"
            ? "Manage documents and requirements in one platform, making the extension process simpler and more organized."
            : lang === "es"
              ? "Gestione documentos y requisitos en una sola plataforma, haciendo el proceso de extensión más simple y organizado."
              : "Gerencie documentos e requisitos em uma única plataforma, tornando o processo de extensão mais simples e organizado.",
      },
      {
        title:
          lang === "en"
            ? "Track every step"
            : lang === "es"
              ? "Acompañe cada etapa"
              : "Acompanhe cada etapa",
        text:
          lang === "en"
            ? "Have full visibility into the progress of your request and know exactly which actions need to be taken."
            : lang === "es"
              ? "Tenga visibilidad completa del avance de su solicitud y sepa exactamente qué acciones deben realizarse."
              : "Tenha visibilidade completa do andamento da sua solicitação e saiba exatamente quais ações precisam ser realizadas.",
      },
      {
        title:
          lang === "en"
            ? "More organization, less worry"
            : lang === "es"
              ? "Más organización, menos preocupación"
              : "Mais organização, menos preocupação",
        text:
          lang === "en"
            ? "Keep all documentation accessible and up to date to handle your status extension with more confidence and efficiency."
            : lang === "es"
              ? "Mantenga toda la documentación accesible y actualizada para conducir su extensión de estatus con más confianza y eficiencia."
              : "Mantenha toda a documentação acessível e atualizada para conduzir sua extensão de status com mais confiança e eficiência.",
      },
    ] as const;
  }

  if (slug === "fluxo-troca-status") {
    return [
      {
        title:
          lang === "en"
            ? "Status change without complications"
            : lang === "es"
              ? "Cambio de estatus sin complicaciones"
              : "Mudança de status sem complicação",
        text:
          lang === "en"
            ? "Centralize information and documents in an intuitive platform to guide your status change process with more practicality."
            : lang === "es"
              ? "Centralice información y documentos en una plataforma intuitiva para conducir su proceso de cambio de estatus con más practicidad."
              : "Centralize informações e documentos em uma plataforma intuitiva para conduzir seu processo de mudança de status com mais praticidade.",
      },
      {
        title:
          lang === "en"
            ? "Full control of your request"
            : lang === "es"
              ? "Control total de su solicitud"
              : "Controle total da sua solicitação",
        text:
          lang === "en"
            ? "Follow each phase of the process, view pending items and access the information you need to keep moving forward."
            : lang === "es"
              ? "Acompañe cada fase del proceso, visualice pendientes y tenga acceso rápido a la información necesaria para seguir avanzando."
              : "Acompanhe cada fase do processo, visualize pendências e tenha acesso rápido às informações necessárias para seguir avançando.",
      },
      {
        title:
          lang === "en"
            ? "Everything organized in one place"
            : lang === "es"
              ? "Todo organizado en un solo lugar"
              : "Tudo organizado em um só lugar",
        text:
          lang === "en"
            ? "Keep documents, forms and updates together to reduce errors and ensure more peace of mind during the status transition."
            : lang === "es"
              ? "Mantenga documentos, formularios y actualizaciones reunidos para reducir errores y garantizar más tranquilidad durante la transición de estatus."
              : "Mantenha documentos, formulários e atualizações reunidos para reduzir erros e garantir mais tranquilidade durante a transição de status.",
      },
    ] as const;
  }

  return [
    {
      title:
        lang === "en"
          ? "Overview"
          : lang === "es"
            ? "Visión general"
            : "Visão geral",
      text:
        lang === "en"
          ? "Understand the proposal in a few seconds, with the context that matters up top and the visual reading right below."
          : lang === "es"
            ? "Entienda la propuesta en pocos segundos, con el contexto que importa en la parte superior y la lectura visual justo debajo."
            : "Entenda a proposta da solução em poucos segundos, com o contexto que importa no topo e a leitura visual logo abaixo.",
    },
    {
      title:
        lang === "en"
          ? "How it works"
          : lang === "es"
            ? "Cómo funciona"
            : "Como funciona",
      text:
        lang === "en"
          ? "See the operation in a more editorial layout, with short copy and a large image that gives the content room."
          : lang === "es"
            ? "Vea la operación en un layout más editorial, con texto breve e imagen grande para dar espacio al contenido."
            : "Veja a operação em um layout mais editorial, com explicação curta e imagem grande para dar clareza ao conteúdo.",
    },
    {
      title:
        lang === "en"
          ? "Next step"
          : lang === "es"
            ? "Siguiente paso"
            : "Próximo passo",
      text:
        lang === "en"
          ? "After understanding the solution, move straight to sign up and keep the flow simple for the user."
          : lang === "es"
            ? "Después de entender la solución, siga directamente al registro y mantenga el flujo simple para el usuario."
            : "Depois de entender a solução, siga diretamente para o cadastro e mantenha o fluxo simples para o usuário.",
    },
  ] as const;
}

export default function SolucoesPage() {
  const { slug } = useParams<{ slug?: string }>();
  const { lang } = useLocale();
  const copy = pageCopy[lang as keyof typeof pageCopy] ?? pageCopy.pt;

  if (!slug) {
    return <Navigate to={`/solucoes/${defaultSolutionSlug}`} replace />;
  }

  const current = getSolutionBySlug(slug);

  if (current.slug !== slug) {
    return <Navigate to={`/solucoes/${defaultSolutionSlug}`} replace />;
  }

  const showcaseImages =
    current.slug === "fluxo-b1b2"
      ? B1B2_SHOWCASE_IMAGES
      : current.slug === "gerenciar-processos"
        ? GERENCIAR_PROCESSOS_IMAGES
      : [current.image, current.image, current.image];

  const showcaseBlocks = getShowcaseBlocks(current.slug, lang);

  const isEnhanced = current.group === "operacao" || current.group === "produtos";
  const ec = enhancedCopy[lang as keyof typeof enhancedCopy] ?? enhancedCopy.pt;
  const featureList = current.features[lang] ?? current.features.pt;

  return (
    <div className="public-page text-text">
      <section className="public-section relative overflow-hidden border-b border-border/70 bg-bg">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(45,99,255,0.16),transparent_28%),radial-gradient(circle_at_84%_14%,rgba(99,102,241,0.12),transparent_26%),radial-gradient(circle_at_50%_100%,rgba(34,197,94,0.08),transparent_26%)]" />
        <div className="relative mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-12">
          <div className="grid items-center gap-16 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="max-w-3xl"
            >
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-card/90 px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary shadow-sm">
                {copy.tag}
              </span>
              <h1 className="mt-6 max-w-[13ch] font-display text-5xl font-black leading-[0.95] tracking-[-0.05em] text-text sm:text-6xl lg:text-[5.75rem]">
                {current.title[lang]}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-muted sm:text-xl">
                {copy.lead}
              </p>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-text-muted">
                {current.detail[lang] ?? current.detail.pt}
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <PublicButton asChild tone="solid">
                  <Link to="/contato">
                    {copy.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </PublicButton>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-[32px] border border-border/70 bg-card shadow-[0_30px_100px_rgba(15,23,42,0.12)]">
                <div className="relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_25%,rgba(45,99,255,0.18),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0))]" />
                  <img
                    src={current.image}
                    alt={current.imageAlt[lang] ?? current.imageAlt.pt}
                    className="relative aspect-[16/10] w-full object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-10 pt-10">
            <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-6 px-6 sm:px-8 lg:px-12">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-text-muted/80">
                {lang === "en" ? "Trusted by the best" : lang === "es" ? "Confiado por los mejores" : "Confiado pelos melhores"}
              </p>
              <div className="grid w-full grid-cols-2 items-center justify-items-center gap-x-14 gap-y-10 sm:grid-cols-3 xl:grid-cols-7">
                {FIRM_LOGOS.map((firm) => (
                  <div key={firm.name} className="flex min-h-12 items-center justify-center">
                    <img
                      src={firm.src}
                      alt={firm.name}
                      className="h-14 w-auto max-w-[190px] object-contain object-center opacity-100 transition-transform duration-200 hover:scale-[1.03]"
                      style={{
                        filter: "drop-shadow(0 1px 1px rgba(15, 23, 42, 0.06))",
                      }}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {isEnhanced ? (
        <>
          <section className="public-section border-y border-border/60 bg-bg-subtle">
            <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-12">
              <div className="mx-auto max-w-3xl text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
                  {ec.compareTag}
                </span>
                <h2 className="mt-6 font-display text-3xl font-black tracking-tight text-text sm:text-4xl lg:text-5xl">
                  {ec.compareTitle}
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-text-muted">
                  {ec.compareLead}
                </p>
              </div>

              <div className="mx-auto mt-12 grid max-w-[1040px] gap-6 md:grid-cols-2">
                <div className="rounded-3xl border border-border/70 bg-card p-8 shadow-sm">
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-text-muted">
                    {ec.beforeLabel}
                  </p>
                  <ul className="mt-6 space-y-4">
                    {ec.beforeItems.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-base text-text-muted">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
                          <X className="h-3.5 w-3.5" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-3xl border border-primary/30 bg-primary/5 p-8 shadow-[0_20px_60px_rgba(45,99,255,0.12)]">
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">
                    {ec.afterLabel}
                  </p>
                  <ul className="mt-6 space-y-4">
                    {ec.afterItems.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-base font-semibold text-text">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="public-section">
            <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-12">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="relative order-last lg:order-first">
                  <div className="relative overflow-hidden rounded-[32px] border border-border/70 bg-card shadow-[0_30px_100px_rgba(15,23,42,0.12)]">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_35%_25%,rgba(45,99,255,0.16),transparent_30%)]" />
                    <img
                      src={current.image}
                      alt={current.imageAlt[lang] ?? current.imageAlt.pt}
                      className="relative aspect-[16/11] w-full object-cover"
                    />
                  </div>
                </div>

                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
                    {copy.tag}
                  </span>
                  <h2 className="mt-6 font-display text-3xl font-black tracking-tight text-text sm:text-4xl lg:text-5xl">
                    {ec.showcaseTitle}
                  </h2>
                  <p className="mt-4 text-lg leading-relaxed text-text-muted">
                    {current.detail[lang] ?? current.detail.pt}
                  </p>
                  <ul className="mt-8 space-y-4">
                    {featureList.map((feat) => (
                      <li key={feat} className="flex items-start gap-3 text-base font-semibold text-text">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-10">
                    <PublicButton asChild tone="solid">
                      <Link to="/cadastro">
                        {copy.signup}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </PublicButton>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="public-section border-y border-border/60 bg-bg-subtle">
            <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-12">
              <div className="mx-auto max-w-3xl text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
                  {ec.capabilitiesTag}
                </span>
                <h2 className="mt-6 font-display text-3xl font-black tracking-tight text-text sm:text-4xl lg:text-5xl">
                  {ec.capabilitiesTitle}
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-text-muted">
                  {ec.capabilitiesLead}
                </p>
              </div>

              <div className="mx-auto mt-14 grid max-w-[1120px] gap-6 md:grid-cols-3">
                {showcaseBlocks.map((block, index) => {
                  const Icon = CAPABILITY_ICONS[index % CAPABILITY_ICONS.length];
                  return (
                    <article
                      key={block.title}
                      className="flex flex-col rounded-3xl border border-border/70 bg-card p-8 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.10)]"
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-6 w-6" />
                      </span>
                      <h3 className="mt-6 font-display text-xl font-black tracking-tight text-text">
                        {block.title}
                      </h3>
                      <p className="mt-3 text-base leading-relaxed text-text-muted">
                        {block.text}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="public-section">
            <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-12">
              <div className="relative overflow-hidden rounded-[36px] border border-border/70 bg-card px-8 py-16 text-center shadow-[0_30px_100px_rgba(15,23,42,0.12)] sm:px-16">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(45,99,255,0.14),transparent_45%)]" />
                <div className="relative mx-auto max-w-3xl">
                  <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    {copy.tag}
                  </span>
                  <h2 className="mt-6 font-display text-3xl font-black tracking-tight text-text sm:text-4xl">
                    {lang === "en"
                      ? "Create your account and start organizing the operation"
                      : lang === "es"
                        ? "Crea tu cuenta y empieza a organizar la operación"
                        : "Crie sua conta e comece a organizar a operação"}
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-text-muted sm:text-lg">
                    {lang === "en"
                      ? "Sign up to activate the solution and move your team into a clearer workflow."
                      : lang === "es"
                        ? "Regístrate para activar la solución y llevar a tu equipo a un flujo más claro."
                        : "Cadastre-se para ativar a solução e levar seu time para um fluxo mais claro."}
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <PublicButton asChild tone="solid" size="lg">
                      <Link to="/cadastro">
                        {copy.signup}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </PublicButton>
                    <PublicButton asChild tone="outline" size="lg">
                      <Link to="/contato">{copy.cta}</Link>
                    </PublicButton>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="public-section">
          <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-4xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
                {copy.tag}
              </span>
              <h2 className="mt-6 font-display text-4xl font-black tracking-tight text-text sm:text-5xl lg:text-6xl">
                {copy.sectionTitle}
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-text-muted">
                {copy.sectionLead}
              </p>
            </div>

            <div className="mx-auto mt-14 grid max-w-[1120px] gap-8">
              {showcaseBlocks.map((block, index) => (
                <article
                  key={block.title}
                  className="overflow-hidden"
                >
                  <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr] xl:items-stretch xl:gap-10">
                    <div className="px-0 pt-0 xl:pr-4">
                      <h3 className="mt-0 max-w-3xl font-display text-3xl font-black tracking-[-0.04em] text-text sm:text-4xl lg:text-5xl">
                        {block.title}
                      </h3>
                      <p className="mt-4 max-w-3xl text-base leading-relaxed text-text-muted sm:text-lg">
                        {block.text}
                      </p>
                    </div>

                    <div className="relative w-full overflow-hidden md:max-w-[560px] md:justify-self-end xl:max-w-none">
                      <img
                        src={showcaseImages[index] ?? current.image}
                        alt={current.imageAlt[lang] ?? current.imageAlt.pt}
                        className="h-auto w-full object-cover object-center"
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mx-auto mt-14 max-w-4xl text-center">
              <h3 className="font-display text-3xl font-black tracking-tight text-text sm:text-4xl">
                {lang === "en"
                  ? "Create your account and start organizing the operation"
                  : lang === "es"
                    ? "Crea tu cuenta y empieza a organizar la operación"
                    : "Crie sua conta e comece a organizar a operação"}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-text-muted sm:text-lg">
                {lang === "en"
                  ? "Sign up to activate the solution and move your team into a clearer workflow."
                  : lang === "es"
                    ? "Regístrate para activar la solución y llevar a tu equipo a un flujo más claro."
                    : "Cadastre-se para ativar a solução e levar seu time para um fluxo mais claro."}
              </p>
              <div className="mt-8 flex justify-center">
                <PublicButton asChild tone="solid" size="lg">
                  <Link to="/cadastro">
                    {copy.signup}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </PublicButton>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
