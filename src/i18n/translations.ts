export type Language = "en" | "pt" | "es";

export const translations = {
  // ──── Header / Nav ────
  nav: {
    home: { en: "Home", pt: "Home", es: "Inicio" },
    howItWorks: { en: "How it works", pt: "Como funciona", es: "Cómo funciona" },
    services: { en: "Services", pt: "Serviços", es: "Servicios" },
    login: { en: "Log in", pt: "Entrar", es: "Iniciar sesión" },
    getStarted: { en: "Get started", pt: "Começar agora", es: "Empezar ahora" },
  },

  // ──── Hero ────
  hero: {
    title: {
      en: "Aplikei: your American Visa with",
      pt: "Aplikei: seu visto americano com",
      es: "Aplikei: tu Visa Americana con",
    },
    titleHighlight: { en: "clarity", pt: "clareza", es: "claridad" },
    subtitle: {
      en: "You buy a step-by-step guide and get AI access during the process to organize data, documents, and generate your final package.",
      pt: "Você compra um guia passo a passo e ganha acesso à IA durante o processo para organizar dados, documentos e gerar seu pacote final.",
      es: "Compras una guía paso a paso y obtienes acceso a la IA durante el proceso para organizar datos, documentos y generar tu paquete final.",
    },
    cta: { en: "Get started", pt: "Começar agora", es: "Empezar ahora" },
    ctaSecondary: { en: "View services", pt: "Ver serviços", es: "Ver servicios" },
  },

  // ──── How it works (landing) ────
  howItWorksSection: {
    title: { en: "How it works", pt: "Como funciona", es: "Cómo funciona" },
    subtitle: {
      en: "Three simple steps to organize your immigration process.",
      pt: "Três passos simples para organizar seu processo imigratório.",
      es: "Tres pasos simples para organizar tu proceso migratorio.",
    },
    step1Title: { en: "Choose your service", pt: "Escolha seu serviço", es: "Elige tu servicio" },
    step1Desc: {
      en: "See everything included and not included before paying.",
      pt: "Veja tudo que está incluso e não incluso antes de pagar.",
      es: "Ve todo lo incluido y no incluido antes de pagar.",
    },
    step2Title: { en: "Read before you buy", pt: "Leia antes de comprar", es: "Lee antes de comprar" },
    step2Desc: {
      en: "Full transparency about what you're purchasing.",
      pt: "Transparência total sobre o que você está comprando.",
      es: "Transparencia total sobre lo que estás comprando.",
    },
    step3Title: { en: "Build your final package", pt: "Monte seu pacote final", es: "Arma tu paquete final" },
    step3Desc: {
      en: "Use AI to organize data, documents, and generate your PDF.",
      pt: "Use a IA para organizar dados, documentos e gerar seu PDF.",
      es: "Usa la IA para organizar datos, documentos y generar tu PDF.",
    },
  },

  // ──── What you get ────
  whatYouGet: {
    title: { en: "What you get", pt: "O que você recebe", es: "Qué recibes" },
    guide: { en: "Digital guide + checklist", pt: "Guia digital + checklist", es: "Guía digital + checklist" },
    guideDesc: {
      en: "Complete step-by-step guide with document checklist.",
      pt: "Passo a passo completo com checklist de documentos.",
      es: "Paso a paso completo con checklist de documentos.",
    },
    ai: { en: "AI during the process", pt: "IA durante o processo", es: "IA durante el proceso" },
    aiDesc: {
      en: "Bonus: organize data and documents with AI help.",
      pt: "Bônus: organize dados e documentos com ajuda da IA.",
      es: "Bonus: organiza datos y documentos con ayuda de la IA.",
    },
    support: { en: "N1 Operational Support", pt: "Suporte N1 Operacional", es: "Soporte N1 Operacional" },
    supportDesc: {
      en: "Bonus: help using the platform and basic steps.",
      pt: "Bônus: ajuda para usar a plataforma e passos básicos.",
      es: "Bonus: ayuda para usar la plataforma y pasos básicos.",
    },
    pdf: { en: "Final package in PDF", pt: "Pacote final em PDF", es: "Paquete final en PDF" },
    pdfDesc: {
      en: "Final checklist, case summary, and next step instructions.",
      pt: "Checklist final, resumo do caso e instruções de próximos passos.",
      es: "Checklist final, resumen del caso e instrucciones de próximos pasos.",
    },
    bonus: { en: "Bonus", pt: "Bônus", es: "Bonus" },
  },

  // ──── Services section ────
  servicesSection: {
    title: { en: "Our services", pt: "Nossos serviços", es: "Nuestros servicios" },
    subtitle: {
      en: "Choose the ideal guide for your immigration process.",
      pt: "Escolha o guia ideal para o seu processo imigratório.",
      es: "Elige la guía ideal para tu proceso migratorio.",
    },
    viewDetails: { en: "View details", pt: "Ver detalhes", es: "Ver detalles" },
    promo: { en: "🔥 Special conditions — while they last!", pt: "🔥 Aproveite condições especiais enquanto durem!", es: "🔥 ¡Aprovecha condiciones especiales mientras duren!" },
    discount: { en: "50% OFF", pt: "50% OFF", es: "50% OFF" },
  },

  // ──── FAQ ────
  faq: {
    title: { en: "Frequently asked questions", pt: "Perguntas frequentes", es: "Preguntas frecuentes" },
    items: [
      {
        q: {
          en: "Is Aplikei a law firm?",
          pt: "A Aplikei é um escritório de advocacia?",
          es: "¿Es Aplikei un despacho de abogados?",
        },
        a: {
          en: "No. Aplikei is a digital guide platform with AI. We do not offer legal advice, legal representation, nor guarantee visa or petition approvals.",
          pt: "Não. A Aplikei é uma plataforma de guias digitais com IA. Não oferecemos aconselhamento jurídico, representação legal, nem garantimos aprovação de vistos ou petições.",
          es: "No. Aplikei es una plataforma de guías digitales con IA. No ofrecemos asesoría legal, representación legal, ni garantizamos la aprobación de visas o peticiones.",
        },
      },
      {
        q: {
          en: "What is N1 human support?",
          pt: "O que é o suporte humano N1?",
          es: "¿Qué es el soporte humano N1?",
        },
        a: {
          en: "Human support is strictly operational (platform usage and basic steps): how to use the system, where to upload documents, how to pay fees, how to schedule, and how to track status. It does not include case analysis, strategy, or advice.",
          pt: "Suporte humano é apenas operacional (uso da plataforma e passos básicos): como usar o sistema, onde subir documentos, como pagar taxas, como agendar e como acompanhar status. Não inclui análise de caso, estratégia ou aconselhamento.",
          es: "El soporte humano es solo operacional (uso de la plataforma y pasos básicos): cómo usar el sistema, dónde subir documentos, cómo pagar tarifas, cómo agendar y cómo dar seguimiento. No incluye análisis de caso, estrategia o asesoría.",
        },
      },
      {
        q: {
          en: "Can I get a refund?",
          pt: "Posso obter reembolso?",
          es: "¿Puedo obtener un reembolso?",
        },
        a: {
          en: "Yes, according to our Refund Policy. Check the details on the dedicated page before purchasing.",
          pt: "Sim, conforme nossa Política de Reembolso. Consulte os detalhes na página dedicada antes de comprar.",
          es: "Sí, de acuerdo con nuestra Política de Reembolso. Consulta los detalles en la página dedicada antes de comprar.",
        },
      },
      {
        q: {
          en: "Does AI replace a lawyer?",
          pt: "A IA substitui um advogado?",
          es: "¿La IA reemplaza a un abogado?",
        },
        a: {
          en: "No. AI helps organize data, documents, and generate checklists. It does not analyze eligibility, provide legal advice, or guarantee results.",
          pt: "Não. A IA ajuda a organizar dados, documentos e gerar checklists. Ela não analisa elegibilidade, não dá conselhos jurídicos e não garante resultados.",
          es: "No. La IA ayuda a organizar datos, documentos y generar checklists. No analiza elegibilidad, no da asesoría legal y no garantiza resultados.",
        },
      },
      {
        q: {
          en: "Is my data secure?",
          pt: "Os dados que eu forneço são seguros?",
          es: "¿Mis datos están seguros?",
        },
        a: {
          en: "Yes. We use encryption and follow security best practices to protect your data. See our Privacy Policy for details.",
          pt: "Sim. Utilizamos criptografia e seguimos práticas de segurança para proteger seus dados. Consulte nossa Política de Privacidade para mais detalhes.",
          es: "Sí. Usamos cifrado y seguimos buenas prácticas de seguridad para proteger tus datos. Consulta nuestra Política de Privacidad para más detalles.",
        },
      },
    ],
  },

  // ──── Disclaimers (landing) ────
  disclaimers: {
    title: { en: "Important notices", pt: "Avisos Importantes", es: "Avisos importantes" },
    items: {
      en: [
        "Aplikei is not a law firm.",
        "We do not offer legal advice.",
        "We do not guarantee visa or petition approvals.",
        "We do not represent clients before consulates or USCIS.",
        "Human support is strictly operational (platform usage and basic steps).",
        "AI organizes data and documents but does not analyze eligibility or chances.",
      ],
      pt: [
        "Aplikei não é escritório de advocacia.",
        "Não oferecemos aconselhamento jurídico.",
        "Não garantimos aprovação de vistos ou petições.",
        "Não representamos o cliente perante consulado ou USCIS.",
        "Suporte humano é apenas operacional (uso da plataforma e passos básicos).",
        "A IA organiza dados e documentos, mas não analisa elegibilidade ou chances.",
      ],
      es: [
        "Aplikei no es un despacho de abogados.",
        "No ofrecemos asesoría legal.",
        "No garantizamos la aprobación de visas o peticiones.",
        "No representamos al cliente ante consulados o USCIS.",
        "El soporte humano es solo operacional (uso de la plataforma y pasos básicos).",
        "La IA organiza datos y documentos, pero no analiza elegibilidad o probabilidades.",
      ],
    },
    viewAll: { en: "View all disclaimers →", pt: "Ver todos os disclaimers →", es: "Ver todos los avisos →" },
  },

  // ──── Footer ────
  footer: {
    tagline: {
      en: "Step-by-step guide + AI for simple immigration processes.",
      pt: "Guia passo a passo + IA para processos imigratórios simples.",
      es: "Guía paso a paso + IA para procesos migratorios simples.",
    },
    servicesHeader: { en: "Services", pt: "Serviços", es: "Servicios" },
    platformHeader: { en: "Platform", pt: "Plataforma", es: "Plataforma" },
    legalHeader: { en: "Legal", pt: "Legal", es: "Legal" },
    howItWorks: { en: "How it works", pt: "Como funciona", es: "Cómo funciona" },
    disclaimers: { en: "Disclaimers", pt: "Disclaimers", es: "Avisos" },
    helpCenter: { en: "Help Center (N1)", pt: "Central de Ajuda (N1)", es: "Centro de Ayuda (N1)" },
    terms: { en: "Terms of Use", pt: "Termos de Uso", es: "Términos de Uso" },
    privacy: { en: "Privacy Policy", pt: "Política de Privacidade", es: "Política de Privacidad" },
    refund: { en: "Refund Policy", pt: "Política de Reembolso", es: "Política de Reembolso" },
    copyright: {
      en: "All rights reserved. Aplikei is not a law firm, does not offer legal advice, and does not guarantee visa or petition approvals.",
      pt: "Todos os direitos reservados. Aplikei não é escritório de advocacia, não oferece aconselhamento jurídico e não garante aprovação de vistos ou petições.",
      es: "Todos los derechos reservados. Aplikei no es un despacho de abogados, no ofrece asesoría legal y no garantiza la aprobación de visas o peticiones.",
    },
  },

  // ──── How it Works page ────
  howItWorksPage: {
    title: { en: "How Aplikei works", pt: "Como funciona a Aplikei", es: "Cómo funciona Aplikei" },
    subtitle: {
      en: "A simple 5-step flow: from choosing your service to generating your final package.",
      pt: "Um fluxo simples de 5 etapas: da escolha do serviço até a geração do seu pacote final.",
      es: "Un flujo simple de 5 pasos: desde elegir tu servicio hasta generar tu paquete final.",
    },
    step: { en: "Step", pt: "Etapa", es: "Paso" },
    steps: [
      { title: { en: "Pre-purchase", pt: "Pré-compra", es: "Pre-compra" }, desc: { en: "Read everything about the service: what's included and what's not.", pt: "Leia tudo sobre o serviço: o que inclui e o que não inclui.", es: "Lee todo sobre el servicio: qué incluye y qué no." } },
      { title: { en: "Sign up + Agreements", pt: "Cadastro + Aceites", es: "Registro + Aceptaciones" }, desc: { en: "Create your account and accept the terms and disclaimers.", pt: "Crie sua conta e aceite os termos e disclaimers.", es: "Crea tu cuenta y acepta los términos y avisos." } },
      { title: { en: "Payment", pt: "Pagamento", es: "Pago" }, desc: { en: "Pay securely and get immediate access to the guide.", pt: "Pague com segurança e tenha acesso imediato ao guia.", es: "Paga de forma segura y obtén acceso inmediato a la guía." } },
      { title: { en: "AI Onboarding", pt: "Onboarding IA", es: "Onboarding IA" }, desc: { en: "AI helps you fill in data, organize documents, and build your case.", pt: "A IA ajuda você a preencher dados, organizar documentos e montar seu caso.", es: "La IA te ayuda a llenar datos, organizar documentos y armar tu caso." } },
      { title: { en: "Final Package (PDF)", pt: "Pacote Final (PDF)", es: "Paquete Final (PDF)" }, desc: { en: "Generate your PDF with checklist, summary, and next step instructions.", pt: "Gere seu PDF com checklist, resumo e instruções dos próximos passos.", es: "Genera tu PDF con checklist, resumen e instrucciones de próximos pasos." } },
    ],
    youBuy: { en: "You buy: Guide", pt: "Você compra: Guia", es: "Compras: Guía" },
    youBuyDesc: {
      en: "Step-by-step digital guide with document checklist and detailed instructions.",
      pt: "Guia digital passo a passo com checklist de documentos e orientações detalhadas.",
      es: "Guía digital paso a paso con checklist de documentos e instrucciones detalladas.",
    },
    bonusAI: { en: "Bonus: AI", pt: "Bônus: IA", es: "Bonus: IA" },
    bonusAIDesc: {
      en: "Access to AI during the process to organize data, documents, and generate the final package.",
      pt: "Acesso à IA durante o processo para organizar dados, documentos e gerar o pacote final.",
      es: "Acceso a la IA durante el proceso para organizar datos, documentos y generar el paquete final.",
    },
    bonusN1: { en: "Bonus: N1 Support", pt: "Bônus: Suporte N1", es: "Bonus: Soporte N1" },
    bonusN1Desc: {
      en: "Strictly operational human support: platform usage, document uploads, fee payments.",
      pt: "Suporte humano apenas operacional: uso da plataforma, upload de documentos, pagamento de taxas.",
      es: "Soporte humano solo operacional: uso de la plataforma, subida de documentos, pago de tarifas.",
    },
    aiDoesTitle: { en: "What AI does (and doesn't do)", pt: "O que a IA faz (e o que não faz)", es: "Qué hace la IA (y qué no)" },
    aiDoes: {
      en: [
        "Organize personal and process data",
        "Build the document checklist",
        "Generate the case summary for the Final Package",
        "Explain form fields educationally",
        "Remind you of deadlines and next steps",
      ],
      pt: [
        "Organizar dados pessoais e do processo",
        "Montar a checklist de documentos",
        "Gerar o resumo do caso para o Pacote Final",
        "Explicar campos de formulário de forma educacional",
        "Lembrar de prazos e próximos passos",
      ],
      es: [
        "Organizar datos personales y del proceso",
        "Armar el checklist de documentos",
        "Generar el resumen del caso para el Paquete Final",
        "Explicar campos de formulario de forma educativa",
        "Recordar plazos y próximos pasos",
      ],
    },
    aiDoesNot: {
      en: [
        "Eligibility or chance analysis",
        "Legal advice",
        "Strategic recommendations",
        "Official form completion",
        "Representation before consulate/USCIS",
      ],
      pt: [
        "Análise de elegibilidade ou chances",
        "Aconselhamento jurídico",
        "Recomendações estratégicas",
        "Preenchimento de formulários oficiais",
        "Representação perante consulado/USCIS",
      ],
      es: [
        "Análisis de elegibilidad o probabilidades",
        "Asesoría legal",
        "Recomendaciones estratégicas",
        "Llenado de formularios oficiales",
        "Representación ante consulado/USCIS",
      ],
    },
    aiHelps: { en: "✅ AI helps you:", pt: "✅ A IA ajuda você a:", es: "✅ La IA te ayuda a:" },
    aiDoesNotLabel: { en: "❌ AI does NOT:", pt: "❌ A IA NÃO faz:", es: "❌ La IA NO hace:" },
    viewServices: { en: "View available services", pt: "Ver serviços disponíveis", es: "Ver servicios disponibles" },
  },

  // ──── Services page ────
  servicesPage: {
    title: { en: "Our Services", pt: "Nossos Serviços", es: "Nuestros Servicios" },
    subtitle: {
      en: "Choose the step-by-step guide for your immigration process. Read everything before buying.",
      pt: "Escolha o guia passo a passo ideal para o seu processo imigratório. Leia tudo antes de comprar.",
      es: "Elige la guía paso a paso ideal para tu proceso migratorio. Lee todo antes de comprar.",
    },
    forWhom: { en: "Who it's for", pt: "Para quem é", es: "Para quién es" },
    includes: { en: "✅ Includes", pt: "✅ Inclui", es: "✅ Incluye" },
    notIncluded: { en: "❌ Not included", pt: "❌ Não inclui", es: "❌ No incluye" },
    viewFull: { en: "View full details", pt: "Ver detalhes completos", es: "Ver detalles completos" },
  },

  // ──── Service detail page ────
  serviceDetail: {
    overview: { en: "Overview", pt: "Visão geral", es: "Visión general" },
    forWhom: { en: "✅ Who it's for", pt: "✅ Para quem é", es: "✅ Para quién es" },
    notForWhom: { en: "❌ Who it's NOT for", pt: "❌ Para quem NÃO é", es: "❌ Para quién NO es" },
    included: { en: "What's included", pt: "O que está incluso", es: "Qué está incluido" },
    notIncluded: { en: "What's NOT included", pt: "O que NÃO está incluso", es: "Qué NO está incluido" },
    requirements: { en: "What you'll need", pt: "O que você vai precisar", es: "Qué vas a necesitar" },
    steps: { en: "Step-by-step summary", pt: "Passo a passo resumido", es: "Resumen paso a paso" },
    faq: { en: "Frequently asked questions", pt: "Perguntas frequentes", es: "Preguntas frecuentes" },
    disclaimer: {
      en: "Notice: Aplikei is not a law firm, does not offer legal advice, does not guarantee approval, and does not represent clients before consulates or USCIS. Human support is strictly operational.",
      pt: "Aviso: Aplikei não é escritório de advocacia, não oferece aconselhamento jurídico, não garante aprovação e não representa o cliente perante consulado ou USCIS. Suporte humano é apenas operacional.",
      es: "Aviso: Aplikei no es un despacho de abogados, no ofrece asesoría legal, no garantiza aprobación y no representa al cliente ante consulados o USCIS. El soporte humano es solo operacional.",
    },
    createAccount: { en: "Create account and continue", pt: "Criar conta e continuar", es: "Crear cuenta y continuar" },
  },

  // ──── Login ────
  login: {
    title: { en: "Log in to your account", pt: "Entrar na sua conta", es: "Inicia sesión" },
    subtitle: { en: "Access your guide and continue your process.", pt: "Acesse seu guia e continue seu processo.", es: "Accede a tu guía y continúa tu proceso." },
    email: { en: "Email", pt: "E-mail", es: "Correo electrónico" },
    password: { en: "Password", pt: "Senha", es: "Contraseña" },
    submit: { en: "Log in", pt: "Entrar", es: "Iniciar sesión" },
    noAccount: { en: "Don't have an account?", pt: "Não tem conta?", es: "¿No tienes cuenta?" },
    createAccount: { en: "Create account", pt: "Criar conta", es: "Crear cuenta" },
  },

  // ──── Signup ────
  signup: {
    title: { en: "Create account", pt: "Criar conta", es: "Crear cuenta" },
    subtitle: { en: "Start your process with clarity.", pt: "Comece seu processo com clareza.", es: "Comienza tu proceso con claridad." },
    fullName: { en: "Full name", pt: "Nome completo", es: "Nombre completo" },
    namePlaceholder: { en: "Your name", pt: "Seu nome", es: "Tu nombre" },
    email: { en: "Email", pt: "E-mail", es: "Correo electrónico" },
    password: { en: "Password", pt: "Senha", es: "Contraseña" },
    passwordPlaceholder: { en: "Minimum 8 characters", pt: "Mínimo 8 caracteres", es: "Mínimo 8 caracteres" },
    disclaimer: {
      en: "Aplikei is not a law firm, does not offer legal advice, and does not guarantee approval. Human support is strictly operational.",
      pt: "Aplikei não é escritório de advocacia, não oferece aconselhamento jurídico e não garante aprovação. Suporte humano é apenas operacional.",
      es: "Aplikei no es un despacho de abogados, no ofrece asesoría legal y no garantiza aprobación. El soporte humano es solo operacional.",
    },
    acceptTerms: {
      en: "I have read and accept the",
      pt: "Li e aceito os",
      es: "He leído y acepto los",
    },
    termsLink: { en: "Terms of Use", pt: "Termos de Uso", es: "Términos de Uso" },
    privacyLink: { en: "Privacy Policy", pt: "Política de Privacidade", es: "Política de Privacidad" },
    disclaimersLink: { en: "Disclaimers", pt: "Disclaimers", es: "Avisos" },
    and: { en: "and", pt: "e", es: "y" },
    submit: { en: "Create account", pt: "Criar conta", es: "Crear cuenta" },
    hasAccount: { en: "Already have an account?", pt: "Já tem conta?", es: "¿Ya tienes cuenta?" },
    loginLink: { en: "Log in", pt: "Entrar", es: "Iniciar sesión" },
  },

  // ──── Dashboard ────
  dashboard: {
    title: { en: "Dashboard", pt: "Painel", es: "Panel" },
    welcome: { en: "Welcome back! Continue your process.", pt: "Bem-vindo de volta! Continue seu processo.", es: "¡Bienvenido! Continúa tu proceso." },
    overallProgress: { en: "Overall progress", pt: "Progresso geral", es: "Progreso general" },
    onboarding: { en: "Onboarding", pt: "Onboarding", es: "Onboarding" },
    complete: { en: "complete", pt: "completo", es: "completado" },
    cards: {
      currentService: { en: "My current service", pt: "Meu serviço atual", es: "Mi servicio actual" },
      currentServiceDesc: { en: "B1/B2 Visa — Tourism and Business", pt: "Visto B1/B2 — Turismo e Negócios", es: "Visa B1/B2 — Turismo y Negocios" },
      inProgress: { en: "In progress", pt: "Em andamento", es: "En progreso" },
      checklist: { en: "Document checklist", pt: "Checklist de documentos", es: "Checklist de documentos" },
      checklistDesc: { en: "3 of 8 documents uploaded", pt: "3 de 8 documentos enviados", es: "3 de 8 documentos enviados" },
      chatAI: { en: "Chat with AI", pt: "Conversar com a IA", es: "Chatear con la IA" },
      chatAIDesc: { en: "Ask questions and organize your process", pt: "Tire dúvidas e organize seu processo", es: "Haz preguntas y organiza tu proceso" },
      uploads: { en: "Uploads", pt: "Uploads", es: "Subir archivos" },
      uploadsDesc: { en: "Upload and manage your documents", pt: "Envie e gerencie seus documentos", es: "Sube y administra tus documentos" },
      generatePDF: { en: "Generate final package (PDF)", pt: "Gerar pacote final (PDF)", es: "Generar paquete final (PDF)" },
      generatePDFDesc: { en: "Available when onboarding is complete", pt: "Disponível quando o onboarding estiver completo", es: "Disponible cuando el onboarding esté completo" },
      help: { en: "Operational help (N1)", pt: "Ajuda operacional (N1)", es: "Ayuda operacional (N1)" },
      helpDesc: { en: "Questions about platform usage", pt: "Dúvidas sobre uso da plataforma", es: "Preguntas sobre uso de la plataforma" },
    },
    access: { en: "Access", pt: "Acessar", es: "Acceder" },
  },

  // ──── Dashboard sidebar ────
  sidebar: {
    dashboard: { en: "Dashboard", pt: "Painel", es: "Panel" },
    onboarding: { en: "Onboarding", pt: "Onboarding", es: "Onboarding" },
    chatAI: { en: "AI Chat", pt: "Chat IA", es: "Chat IA" },
    documents: { en: "Documents", pt: "Documentos", es: "Documentos" },
    finalPackage: { en: "Final Package", pt: "Pacote Final", es: "Paquete Final" },
    help: { en: "Help (N1)", pt: "Ajuda (N1)", es: "Ayuda (N1)" },
    logout: { en: "Log out", pt: "Sair", es: "Salir" },
  },

  // ──── Onboarding ────
  onboardingPage: {
    title: { en: "Onboarding", pt: "Onboarding", es: "Onboarding" },
    subtitle: { en: "Fill in the information to build your final package.", pt: "Preencha as informações para montar seu pacote final.", es: "Completa la información para armar tu paquete final." },
    stepOf: { en: "of", pt: "de", es: "de" },
    steps: {
      en: ["Personal data", "Travel history", "Process information", "Documents", "Final review"],
      pt: ["Dados pessoais", "Histórico de viagens", "Informações do processo", "Documentos", "Revisão final"],
      es: ["Datos personales", "Historial de viajes", "Información del proceso", "Documentos", "Revisión final"],
    },
    previous: { en: "Previous", pt: "Anterior", es: "Anterior" },
    next: { en: "Next", pt: "Próximo", es: "Siguiente" },
    confirmGenerate: { en: "Confirm and generate package", pt: "Confirmar e gerar pacote", es: "Confirmar y generar paquete" },
    // Step 0
    personalData: { en: "Personal data", pt: "Dados pessoais", es: "Datos personales" },
    fullName: { en: "Full name", pt: "Nome completo", es: "Nombre completo" },
    asInPassport: { en: "As shown on passport", pt: "Como consta no passaporte", es: "Como aparece en el pasaporte" },
    dob: { en: "Date of birth", pt: "Data de nascimento", es: "Fecha de nacimiento" },
    passportNumber: { en: "Passport number", pt: "Número do passaporte", es: "Número de pasaporte" },
    nationality: { en: "Nationality", pt: "Nacionalidade", es: "Nacionalidad" },
    currentAddress: { en: "Current address", pt: "Endereço atual", es: "Dirección actual" },
    fullAddress: { en: "Full address", pt: "Endereço completo", es: "Dirección completa" },
    // Step 1
    travelHistory: { en: "Travel history", pt: "Histórico de viagens", es: "Historial de viajes" },
    travelledBefore: { en: "Have you traveled to the US before?", pt: "Já viajou para os EUA antes?", es: "¿Has viajado a EE.UU. antes?" },
    hadVisa: { en: "Have you had a US visa?", pt: "Já teve visto americano?", es: "¿Has tenido visa americana?" },
    no: { en: "No", pt: "Não", es: "No" },
    yesApproved: { en: "Yes, approved", pt: "Sim, aprovado", es: "Sí, aprobada" },
    yesDenied: { en: "Yes, denied", pt: "Sim, negado", es: "Sí, negada" },
    yes: { en: "Yes", pt: "Sim", es: "Sí" },
    countriesVisited: { en: "Countries visited in the last 5 years", pt: "Países visitados nos últimos 5 anos", es: "Países visitados en los últimos 5 años" },
    countriesPlaceholder: { en: "e.g., Portugal, Argentina, Japan", pt: "Ex: Portugal, Argentina, Japão", es: "Ej: Portugal, Argentina, Japón" },
    // Step 2
    processInfo: { en: "Process information", pt: "Informações do processo", es: "Información del proceso" },
    travelPurpose: { en: "Purpose of travel", pt: "Motivo da viagem", es: "Motivo del viaje" },
    travelPurposePlaceholder: { en: "Tourism, business, family visit...", pt: "Turismo, negócios, visita familiar...", es: "Turismo, negocios, visita familiar..." },
    expectedDate: { en: "Expected travel date", pt: "Data prevista da viagem", es: "Fecha prevista del viaje" },
    expectedDuration: { en: "Expected duration", pt: "Duração prevista", es: "Duración prevista" },
    durationPlaceholder: { en: "e.g., 15 days", pt: "Ex: 15 dias", es: "Ej: 15 días" },
    consulateCity: { en: "Consulate city", pt: "Cidade do consulado", es: "Ciudad del consulado" },
    // Step 3
    documentsTitle: { en: "Documents", pt: "Documentos", es: "Documentos" },
    documentsDesc: { en: "Upload the required documents. Accepted: PDF, JPG, PNG (max. 10MB).", pt: "Faça upload dos documentos necessários. Aceitos: PDF, JPG, PNG (máx. 10MB).", es: "Sube los documentos necesarios. Aceptados: PDF, JPG, PNG (máx. 10MB)." },
    docPassport: { en: "Passport (main page)", pt: "Passaporte (página principal)", es: "Pasaporte (página principal)" },
    docPhoto: { en: "5x5cm photo", pt: "Foto 5x5cm", es: "Foto 5x5cm" },
    docFinancial: { en: "Financial proof", pt: "Comprovante financeiro", es: "Comprobante financiero" },
    docBond: { en: "Proof of ties", pt: "Comprovante de vínculo", es: "Comprobante de vínculo" },
    upload: { en: "Upload", pt: "Upload", es: "Subir" },
    // Step 4
    finalReview: { en: "Final review", pt: "Revisão final", es: "Revisión final" },
    finalReviewDesc: { en: "Review all information before confirming. After confirmation, you can generate the Final Package.", pt: "Revise todas as informações antes de confirmar. Após a confirmação, você poderá gerar o Pacote Final.", es: "Revisa toda la información antes de confirmar. Después de la confirmación, podrás generar el Paquete Final." },
    fillPrevious: { en: "Complete previous steps to see the summary here.", pt: "Preencha as etapas anteriores para ver o resumo aqui.", es: "Completa los pasos anteriores para ver el resumen aquí." },
  },

  // ──── Chat ────
  chat: {
    title: { en: "AI Chat", pt: "Chat IA", es: "Chat IA" },
    subtitle: { en: "AI helps organize data and documents. It does not offer legal advice.", pt: "A IA ajuda a organizar dados e documentos. Não oferece aconselhamento jurídico.", es: "La IA ayuda a organizar datos y documentos. No ofrece asesoría legal." },
    initialMessage: {
      en: "Hello! I'm Aplikei's AI. I can help you organize your data and documents for the process. What would you like to know?\n\n**Remember:** I do not offer legal advice, do not analyze eligibility, and do not guarantee approval.",
      pt: "Olá! Sou a IA da Aplikei. Posso te ajudar a organizar seus dados e documentos para o processo. O que gostaria de saber?\n\n**Lembre-se:** Eu não ofereço aconselhamento jurídico, não analiso elegibilidade e não garanto aprovação.",
      es: "¡Hola! Soy la IA de Aplikei. Puedo ayudarte a organizar tus datos y documentos para el proceso. ¿Qué te gustaría saber?\n\n**Recuerda:** No ofrezco asesoría legal, no analizo elegibilidad y no garantizo aprobación.",
    },
    placeholder: { en: "Type your question...", pt: "Digite sua pergunta...", es: "Escribe tu pregunta..." },
    previewResponse: {
      en: "Thanks for your question! The AI system will be connected in the final version. For now, this is a chat preview.",
      pt: "Obrigado pela sua pergunta! Para uma resposta completa, o sistema de IA será conectado na versão final. Por enquanto, este é um preview do chat.",
      es: "¡Gracias por tu pregunta! El sistema de IA se conectará en la versión final. Por ahora, esto es una vista previa del chat.",
    },
  },

  // ──── Uploads ────
  uploads: {
    title: { en: "Documents", pt: "Documentos", es: "Documentos" },
    subtitle: { en: "Upload your documents by category. Accepted: PDF, JPG, PNG (max. 10MB).", pt: "Envie seus documentos por categoria. Aceitos: PDF, JPG, PNG (máx. 10MB).", es: "Sube tus documentos por categoría. Aceptados: PDF, JPG, PNG (máx. 10MB)." },
    tip: { en: "Documents must be legible, uncropped, and in good resolution. Scans are preferred over photos.", pt: "Documentos devem estar legíveis, sem cortes e em boa resolução. Escaneamentos são preferíveis a fotos.", es: "Los documentos deben ser legibles, sin recortes y en buena resolución. Los escaneos son preferibles a las fotos." },
    received: { en: "Received", pt: "Recebido", es: "Recibido" },
    pending: { en: "Pending", pt: "Pendente", es: "Pendiente" },
    resubmit: { en: "Resubmit", pt: "Reenviar", es: "Reenviar" },
    upload: { en: "Upload", pt: "Upload", es: "Subir" },
    docs: {
      en: ["Passport (main page)", "5x5cm photo", "Financial proof (3 months)", "Proof of ties"],
      pt: ["Passaporte (página principal)", "Foto 5x5cm", "Comprovante financeiro (3 meses)", "Comprovante de vínculo"],
      es: ["Pasaporte (página principal)", "Foto 5x5cm", "Comprobante financiero (3 meses)", "Comprobante de vínculo"],
    },
  },

  // ──── Package PDF ────
  packagePDF: {
    title: { en: "Final Package (PDF)", pt: "Pacote Final (PDF)", es: "Paquete Final (PDF)" },
    subtitle: { en: "Generate your PDF with final checklist, case summary, and next step instructions.", pt: "Gere seu PDF com checklist final, resumo do caso e instruções dos próximos passos.", es: "Genera tu PDF con checklist final, resumen del caso e instrucciones de próximos pasos." },
    disclaimer: {
      en: "The Final Package is an organizational summary. It does not constitute legal advice and does not guarantee approval.",
      pt: "O Pacote Final é um resumo organizacional. Não constitui aconselhamento jurídico e não garante aprovação.",
      es: "El Paquete Final es un resumen organizacional. No constituye asesoría legal y no garantiza aprobación.",
    },
    generate: { en: "Generate Final Package", pt: "Gerar Pacote Final", es: "Generar Paquete Final" },
    generateDesc: { en: "Complete onboarding to generate your personalized PDF.", pt: "Complete o onboarding para gerar seu PDF personalizado.", es: "Completa el onboarding para generar tu PDF personalizado." },
    generateBtn: { en: "Generate PDF (complete onboarding)", pt: "Gerar PDF (complete o onboarding)", es: "Generar PDF (completa el onboarding)" },
    pdfContains: { en: "What the PDF contains:", pt: "O que o PDF contém:", es: "Qué contiene el PDF:" },
    pdfItems: {
      en: ["Final document checklist", "Case summary (provided data)", "Next step instructions", "Letter templates (when applicable)"],
      pt: ["Checklist final de documentos", "Resumo do caso (dados fornecidos)", "Instruções dos próximos passos", "Modelos de cartas (quando aplicável)"],
      es: ["Checklist final de documentos", "Resumen del caso (datos proporcionados)", "Instrucciones de próximos pasos", "Modelos de cartas (cuando aplique)"],
    },
    history: { en: "PDF History", pt: "Histórico de PDFs", es: "Historial de PDFs" },
    draft: { en: "Draft", pt: "Rascunho", es: "Borrador" },
    download: { en: "Download", pt: "Baixar", es: "Descargar" },
  },

  // ──── Help Center ────
  helpCenter: {
    title: { en: "Help Center (N1)", pt: "Central de Ajuda (N1)", es: "Centro de Ayuda (N1)" },
    subtitle: { en: "Strictly operational human support: platform usage and basic steps.", pt: "Suporte humano apenas operacional: uso da plataforma e passos básicos.", es: "Soporte humano solo operacional: uso de la plataforma y pasos básicos." },
    warning: {
      en: "Important: We do not answer questions about strategy, eligibility, chances, or legal advice. Only operational questions about platform usage.",
      pt: "Importante: Não respondemos dúvidas de estratégia, elegibilidade, chances ou aconselhamento jurídico. Apenas questões operacionais sobre uso da plataforma.",
      es: "Importante: No respondemos preguntas sobre estrategia, elegibilidad, probabilidades o asesoría legal. Solo preguntas operacionales sobre uso de la plataforma.",
    },
    faqTitle: { en: "Frequently asked questions", pt: "Perguntas frequentes", es: "Preguntas frecuentes" },
    faqItems: [
      {
        q: { en: "How do I upload documents?", pt: "Como faço upload de documentos?", es: "¿Cómo subo documentos?" },
        a: { en: "Go to Documents in the sidebar, click the Upload button next to each document, and select the file (PDF, JPG, or PNG, max. 10MB).", pt: "Vá em Documentos no menu lateral, clique no botão Upload ao lado de cada documento e selecione o arquivo (PDF, JPG ou PNG, máx. 10MB).", es: "Ve a Documentos en el menú lateral, haz clic en el botón Subir junto a cada documento y selecciona el archivo (PDF, JPG o PNG, máx. 10MB)." },
      },
      {
        q: { en: "How do I pay consular/USCIS fees?", pt: "Como pago as taxas consulares/USCIS?", es: "¿Cómo pago las tarifas consulares/USCIS?" },
        a: { en: "The guide includes detailed instructions on how to pay fees. It's usually done on the official consulate or USCIS website. Aplikei does not process these fees.", pt: "O guia inclui instruções detalhadas sobre como pagar as taxas. Geralmente é feito no site oficial do consulado ou USCIS. A Aplikei não processa essas taxas.", es: "La guía incluye instrucciones detalladas sobre cómo pagar las tarifas. Generalmente se hace en el sitio oficial del consulado o USCIS. Aplikei no procesa estas tarifas." },
      },
      {
        q: { en: "How do I schedule a consulate interview?", pt: "Como agendar a entrevista no consulado?", es: "¿Cómo agendo la entrevista en el consulado?" },
        a: { en: "After paying the MRV fee, visit the CASV website to schedule. The guide explains the step-by-step process.", pt: "Após pagar a taxa MRV, acesse o site do CASV para agendar. O guia explica o passo a passo.", es: "Después de pagar la tarifa MRV, visita el sitio web del CASV para agendar. La guía explica el paso a paso." },
      },
      {
        q: { en: "How do I track my process status?", pt: "Como acompanho o status do meu processo?", es: "¿Cómo doy seguimiento al estado de mi proceso?" },
        a: { en: "If applicable, you can check status on the USCIS website with your receipt number. The guide explains how.", pt: "Se aplicável, você pode verificar o status no site do USCIS com seu receipt number. O guia explica como.", es: "Si aplica, puedes verificar el estado en el sitio de USCIS con tu número de recibo. La guía explica cómo." },
      },
      {
        q: { en: "How do I use the AI chat?", pt: "Como usar o chat da IA?", es: "¿Cómo uso el chat de IA?" },
        a: { en: "Click 'AI Chat' in the sidebar. AI answers questions about data and document organization. It does not offer legal advice.", pt: "Clique em 'Chat IA' no menu lateral. A IA responde perguntas sobre organização de dados e documentos. Ela não oferece aconselhamento jurídico.", es: "Haz clic en 'Chat IA' en el menú lateral. La IA responde preguntas sobre organización de datos y documentos. No ofrece asesoría legal." },
      },
    ],
    ticketTitle: { en: "Open a help ticket", pt: "Abrir ticket de ajuda", es: "Abrir ticket de ayuda" },
    ticketSubtitle: { en: "Select a category and describe your operational question.", pt: "Selecione a categoria e descreva sua dúvida operacional.", es: "Selecciona la categoría y describe tu pregunta operacional." },
    category: { en: "Category (required)", pt: "Categoria (obrigatória)", es: "Categoría (obligatoria)" },
    selectCategory: { en: "Select...", pt: "Selecione...", es: "Selecciona..." },
    categories: {
      en: ["How to use the system", "Where to upload documents", "How to pay fees", "How to schedule", "How to track status"],
      pt: ["Como usar o sistema", "Onde subir documentos", "Como pagar taxas", "Como agendar", "Como acompanhar status"],
      es: ["Cómo usar el sistema", "Dónde subir documentos", "Cómo pagar tarifas", "Cómo agendar", "Cómo dar seguimiento"],
    },
    yourQuestion: { en: "Your question", pt: "Sua dúvida", es: "Tu pregunta" },
    questionPlaceholder: { en: "Describe your operational question...", pt: "Descreva sua dúvida operacional...", es: "Describe tu pregunta operacional..." },
    submit: { en: "Submit ticket", pt: "Enviar ticket", es: "Enviar ticket" },
  },

  // ──── Legal pages ────
  legal: {
    lastUpdated: { en: "Last updated: February 2026", pt: "Última atualização: Fevereiro de 2026", es: "Última actualización: Febrero de 2026" },
    terms: {
      title: { en: "Terms of Use", pt: "Termos de Uso", es: "Términos de Uso" },
      sections: {
        en: [
          { title: "1. About Aplikei", content: "Aplikei is a digital platform that offers step-by-step guides with artificial intelligence assistance for simple immigration processes. Aplikei is not a law firm, does not offer legal advice, and does not guarantee visa or petition approvals." },
          { title: "2. Services offered", content: "When purchasing a guide, the user receives: a step-by-step digital guide, AI access during the process (bonus), N1 operational human support (bonus), and final package PDF generation. Human support is strictly operational and limited to: system usage, document uploads, fee payments, scheduling, and status tracking." },
          { title: "3. Limitations", content: "Aplikei does not: analyze eligibility, offer strategy, assess approval chances, fill out official forms, represent clients before consulates or USCIS, or provide any type of legal advice." },
          { title: "4. User responsibility", content: "The user is responsible for the accuracy of information provided, filling out official forms, submitting applications, and attending interviews. Aplikei is not responsible for decisions made based on the educational content provided." },
          { title: "5. Privacy and data", content: "Data provided is protected under our Privacy Policy. Aplikei uses encryption and security best practices to protect personal information." },
          { title: "6. Refund", content: "See our Refund Policy for detailed information about cancellations and returns." },
        ],
        pt: [
          { title: "1. Sobre a Aplikei", content: "A Aplikei é uma plataforma digital que oferece guias passo a passo com auxílio de inteligência artificial para processos imigratórios simples. A Aplikei não é escritório de advocacia, não oferece aconselhamento jurídico e não garante aprovação de vistos ou petições." },
          { title: "2. Serviços oferecidos", content: "Ao adquirir um guia, o usuário recebe: guia digital passo a passo, acesso à IA durante o processo (bônus), suporte humano N1 operacional (bônus) e geração de pacote final em PDF. O suporte humano é estritamente operacional e limitado a: uso do sistema, upload de documentos, pagamento de taxas, agendamentos e acompanhamento de status." },
          { title: "3. Limitações", content: "A Aplikei não: analisa elegibilidade, oferece estratégia, avalia chances de aprovação, preenche formulários oficiais, representa o cliente perante consulado ou USCIS, ou fornece qualquer tipo de aconselhamento jurídico." },
          { title: "4. Responsabilidade do usuário", content: "O usuário é responsável pela veracidade das informações fornecidas, pelo preenchimento dos formulários oficiais, pela submissão da aplicação e pelo comparecimento a entrevistas. A Aplikei não se responsabiliza por decisões tomadas com base no conteúdo educacional fornecido." },
          { title: "5. Privacidade e dados", content: "Os dados fornecidos são protegidos conforme nossa Política de Privacidade. A Aplikei utiliza criptografia e boas práticas de segurança para proteger informações pessoais." },
          { title: "6. Reembolso", content: "Consulte nossa Política de Reembolso para informações detalhadas sobre cancelamentos e devoluções." },
        ],
        es: [
          { title: "1. Sobre Aplikei", content: "Aplikei es una plataforma digital que ofrece guías paso a paso con asistencia de inteligencia artificial para procesos migratorios simples. Aplikei no es un despacho de abogados, no ofrece asesoría legal y no garantiza la aprobación de visas o peticiones." },
          { title: "2. Servicios ofrecidos", content: "Al adquirir una guía, el usuario recibe: guía digital paso a paso, acceso a la IA durante el proceso (bonus), soporte humano N1 operacional (bonus) y generación de paquete final en PDF. El soporte humano es estrictamente operacional y se limita a: uso del sistema, subida de documentos, pago de tarifas, agendamiento y seguimiento de estado." },
          { title: "3. Limitaciones", content: "Aplikei no: analiza elegibilidad, ofrece estrategia, evalúa probabilidades de aprobación, llena formularios oficiales, representa al cliente ante consulados o USCIS, ni proporciona ningún tipo de asesoría legal." },
          { title: "4. Responsabilidad del usuario", content: "El usuario es responsable de la veracidad de la información proporcionada, del llenado de formularios oficiales, del envío de la solicitud y de asistir a entrevistas. Aplikei no se responsabiliza por decisiones tomadas con base en el contenido educativo proporcionado." },
          { title: "5. Privacidad y datos", content: "Los datos proporcionados están protegidos según nuestra Política de Privacidad. Aplikei utiliza cifrado y buenas prácticas de seguridad para proteger información personal." },
          { title: "6. Reembolso", content: "Consulta nuestra Política de Reembolso para información detallada sobre cancelaciones y devoluciones." },
        ],
      },
      acceptNotice: {
        en: "By using Aplikei, you declare that you have read and agreed to these Terms of Use, the Privacy Policy, and the Disclaimers.",
        pt: "Ao utilizar a Aplikei, você declara ter lido e concordado com estes Termos de Uso, a Política de Privacidade e os Disclaimers.",
        es: "Al usar Aplikei, declaras haber leído y aceptado estos Términos de Uso, la Política de Privacidad y los Avisos.",
      },
    },
    privacy: {
      title: { en: "Privacy Policy", pt: "Política de Privacidade", es: "Política de Privacidad" },
      sections: {
        en: [
          { title: "1. Data collected", content: "We collect: registration data (name, email), immigration process data (personal information, documents), platform usage data, and payment data (processed by secure third parties)." },
          { title: "2. Data usage", content: "Your data is used to: provide the contracted service, personalize the guide and final package, process payments, provide operational support, and improve the platform." },
          { title: "3. Sharing", content: "We do not sell personal data. We only share with: payment processors, infrastructure services (hosting, database), and when required by law." },
          { title: "4. Security", content: "We use encryption in transit and at rest, access controls, and information security best practices to protect your data." },
          { title: "5. Your rights", content: "You can request access, correction, or deletion of your personal data at any time through the platform's contact channel." },
          { title: "6. Cookies", content: "We use essential cookies for platform operation and analytics cookies to improve user experience." },
        ],
        pt: [
          { title: "1. Dados coletados", content: "Coletamos: dados de cadastro (nome, e-mail), dados do processo imigratório (informações pessoais, documentos), dados de uso da plataforma e dados de pagamento (processados por terceiros seguros)." },
          { title: "2. Uso dos dados", content: "Seus dados são utilizados para: fornecer o serviço contratado, personalizar o guia e o pacote final, processar pagamentos, fornecer suporte operacional e melhorar a plataforma." },
          { title: "3. Compartilhamento", content: "Não vendemos dados pessoais. Compartilhamos apenas com: processadores de pagamento, serviços de infraestrutura (hospedagem, banco de dados) e quando exigido por lei." },
          { title: "4. Segurança", content: "Utilizamos criptografia em trânsito e em repouso, controles de acesso e boas práticas de segurança da informação para proteger seus dados." },
          { title: "5. Seus direitos", content: "Você pode solicitar acesso, correção ou exclusão dos seus dados pessoais a qualquer momento através do canal de contato da plataforma." },
          { title: "6. Cookies", content: "Utilizamos cookies essenciais para o funcionamento da plataforma e cookies de análise para melhorar a experiência do usuário." },
        ],
        es: [
          { title: "1. Datos recopilados", content: "Recopilamos: datos de registro (nombre, correo), datos del proceso migratorio (información personal, documentos), datos de uso de la plataforma y datos de pago (procesados por terceros seguros)." },
          { title: "2. Uso de datos", content: "Tus datos se utilizan para: proporcionar el servicio contratado, personalizar la guía y el paquete final, procesar pagos, brindar soporte operacional y mejorar la plataforma." },
          { title: "3. Compartir", content: "No vendemos datos personales. Solo compartimos con: procesadores de pago, servicios de infraestructura (hosting, base de datos) y cuando lo exija la ley." },
          { title: "4. Seguridad", content: "Usamos cifrado en tránsito y en reposo, controles de acceso y buenas prácticas de seguridad de la información para proteger tus datos." },
          { title: "5. Tus derechos", content: "Puedes solicitar acceso, corrección o eliminación de tus datos personales en cualquier momento a través del canal de contacto de la plataforma." },
          { title: "6. Cookies", content: "Usamos cookies esenciales para el funcionamiento de la plataforma y cookies de análisis para mejorar la experiencia del usuario." },
        ],
      },
    },
    refund: {
      title: { en: "Refund Policy", pt: "Política de Reembolso", es: "Política de Reembolso" },
      sections: {
        en: [
          { title: "1. Refund period", content: "You can request a refund within 7 days of purchase, as long as you have not generated the Final Package (PDF)." },
          { title: "2. Conditions", content: "Refund is available when: the Final Package has not been generated, the 7-day period has not been exceeded, and the service has not been used abusively." },
          { title: "3. How to request", content: "To request a refund, open a ticket in the Help Center (N1) selecting the category 'How to use the system' and mentioning your refund request." },
          { title: "4. Processing", content: "The refund will be processed using the same payment method used for the purchase, within 10 business days after approval." },
          { title: "5. Exceptions", content: "We do not offer refunds after generating the Final Package, after the 7-day period, or in cases of platform abuse." },
        ],
        pt: [
          { title: "1. Prazo de reembolso", content: "Você pode solicitar reembolso em até 7 dias após a compra, desde que não tenha gerado o Pacote Final (PDF)." },
          { title: "2. Condições", content: "O reembolso está disponível quando: o Pacote Final não foi gerado, o prazo de 7 dias não foi excedido e o serviço não foi utilizado de forma abusiva." },
          { title: "3. Como solicitar", content: "Para solicitar reembolso, abra um ticket na Central de Ajuda (N1) selecionando a categoria \"Como usar o sistema\" e mencionando sua solicitação de reembolso." },
          { title: "4. Processamento", content: "O reembolso será processado na mesma forma de pagamento utilizada na compra, em até 10 dias úteis após a aprovação da solicitação." },
          { title: "5. Exceções", content: "Não oferecemos reembolso após a geração do Pacote Final, após o prazo de 7 dias, ou em casos de uso abusivo da plataforma." },
        ],
        es: [
          { title: "1. Plazo de reembolso", content: "Puedes solicitar un reembolso dentro de los 7 días posteriores a la compra, siempre que no hayas generado el Paquete Final (PDF)." },
          { title: "2. Condiciones", content: "El reembolso está disponible cuando: el Paquete Final no ha sido generado, el plazo de 7 días no ha sido excedido y el servicio no ha sido utilizado de forma abusiva." },
          { title: "3. Cómo solicitar", content: "Para solicitar un reembolso, abre un ticket en el Centro de Ayuda (N1) seleccionando la categoría 'Cómo usar el sistema' y mencionando tu solicitud de reembolso." },
          { title: "4. Procesamiento", content: "El reembolso se procesará con el mismo método de pago utilizado en la compra, dentro de 10 días hábiles después de la aprobación." },
          { title: "5. Excepciones", content: "No ofrecemos reembolso después de generar el Paquete Final, después del plazo de 7 días, o en casos de uso abusivo de la plataforma." },
        ],
      },
    },
    disclaimersPage: {
      title: { en: "Disclaimers", pt: "Disclaimers", es: "Avisos" },
      readCarefully: { en: "Read carefully before using the platform.", pt: "Leia atentamente antes de utilizar a plataforma.", es: "Lee atentamente antes de usar la plataforma." },
      natureTitle: { en: "Nature of service", pt: "Natureza do serviço", es: "Naturaleza del servicio" },
      natureItems: {
        en: [
          "Aplikei is not a law firm and does not have attorneys providing legal services to users.",
          "We do not offer legal advice, eligibility analysis, chance assessment, or immigration strategy.",
          "We do not guarantee approval of visas, extensions, status changes, or any immigration petition.",
          "We do not represent clients before American consulates, USCIS, or any government agency.",
        ],
        pt: [
          "Aplikei não é escritório de advocacia e não possui advogados em seu quadro prestando serviços jurídicos aos usuários.",
          "Não oferecemos aconselhamento jurídico, análise de elegibilidade, avaliação de chances ou estratégia imigratória.",
          "Não garantimos aprovação de vistos, extensões, trocas de status ou qualquer petição imigratória.",
          "Não representamos o cliente perante consulados americanos, USCIS ou qualquer órgão governamental.",
        ],
        es: [
          "Aplikei no es un despacho de abogados y no cuenta con abogados que presten servicios legales a los usuarios.",
          "No ofrecemos asesoría legal, análisis de elegibilidad, evaluación de probabilidades o estrategia migratoria.",
          "No garantizamos la aprobación de visas, extensiones, cambios de estatus o cualquier petición migratoria.",
          "No representamos al cliente ante consulados americanos, USCIS o cualquier agencia gubernamental.",
        ],
      },
      offersTitle: { en: "What Aplikei offers", pt: "O que a Aplikei oferece", es: "Qué ofrece Aplikei" },
      offersItems: {
        en: [
          "Educational step-by-step digital guides for simple immigration processes.",
          "AI for data and document organization (not for legal analysis).",
          "Exclusively operational human support (N1): system usage, uploads, fees, scheduling, and status.",
          "Final package (PDF) generation with checklist, summary, and instructions.",
        ],
        pt: [
          "Guias digitais educacionais passo a passo para processos imigratórios simples.",
          "IA para organização de dados e documentos (não para análise jurídica).",
          "Suporte humano exclusivamente operacional (N1): uso do sistema, upload, taxas, agendamento e status.",
          "Geração de pacote final (PDF) com checklist, resumo e instruções.",
        ],
        es: [
          "Guías digitales educativas paso a paso para procesos migratorios simples.",
          "IA para organización de datos y documentos (no para análisis legal).",
          "Soporte humano exclusivamente operacional (N1): uso del sistema, subida de archivos, tarifas, agendamiento y estado.",
          "Generación de paquete final (PDF) con checklist, resumen e instrucciones.",
        ],
      },
      supportTitle: { en: "Human Support — Limitations", pt: "Suporte Humano — Limitações", es: "Soporte Humano — Limitaciones" },
      supportDesc: {
        en: "Human support is strictly operational (N1) and limited to:",
        pt: "O suporte humano é apenas operacional (N1) e se limita a:",
        es: "El soporte humano es solo operacional (N1) y se limita a:",
      },
      supportItems: {
        en: ["How to use the system", "Where to upload documents", "How to pay fees", "How to schedule", "How to track status"],
        pt: ["Como usar o sistema", "Onde subir documentos", "Como pagar taxas", "Como agendar", "Como acompanhar status"],
        es: ["Cómo usar el sistema", "Dónde subir documentos", "Cómo pagar tarifas", "Cómo agendar", "Cómo dar seguimiento"],
      },
      supportWarning: {
        en: "We do not answer questions about strategy, eligibility, chances, or legal advice.",
        pt: "Não respondemos dúvidas de estratégia, elegibilidade, chances ou aconselhamento jurídico.",
        es: "No respondemos preguntas sobre estrategia, elegibilidad, probabilidades o asesoría legal.",
      },
      recommendationTitle: { en: "Recommendation", pt: "Recomendação", es: "Recomendación" },
      recommendationDesc: {
        en: "If your case involves complexities (prior denials, overstay, employer changes, specific legal situations), we strongly recommend consulting a licensed immigration attorney.",
        pt: "Se o seu caso envolve complexidades (negativas anteriores, overstay, mudanças de empregador, situações legais específicas), recomendamos fortemente que você consulte um advogado de imigração licenciado.",
        es: "Si tu caso involucra complejidades (negativas previas, overstay, cambios de empleador, situaciones legales específicas), recomendamos enfáticamente que consultes a un abogado de inmigración licenciado.",
      },
    },
  },

  // ──── Services data translations ────
  servicesData: [
    {
      slug: "visto-b1-b2",
      title: { en: "B1/B2 Consular Visa Guide", pt: "Guia Visto Consular B1/B2", es: "Guía Visa Consular B1/B2" },
      shortTitle: { en: "B1/B2 Visa", pt: "Visto B1/B2", es: "Visa B1/B2" },
      subtitle: {
        en: "Tourism & Business — for Brazilians applying from Brazil",
        pt: "Turismo e Negócios — para brasileiros aplicando do Brasil",
        es: "Turismo y Negocios — para brasileños aplicando desde Brasil",
      },
      price: { en: "US$ 100.00", pt: "US$ 100,00", es: "US$ 100,00" },
      originalPrice: { en: "US$ 200.00", pt: "US$ 200,00", es: "US$ 200,00" },
      description: {
        en: "Complete step-by-step guide to apply for the tourism/business visa (B1/B2) at the American consulate. Includes document checklist, DS-160 guidance, and interview preparation.",
        pt: "Guia completo passo a passo para aplicar ao visto de turismo/negócios (B1/B2) no consulado americano. Inclui checklist de documentos, orientação para preenchimento do DS-160 e preparação para a entrevista.",
        es: "Guía completa paso a paso para solicitar la visa de turismo/negocios (B1/B2) en el consulado americano. Incluye checklist de documentos, orientación para el DS-160 y preparación para la entrevista.",
      },
      forWhom: {
        en: ["Brazilians living in Brazil", "First-time or B1/B2 visa renewal", "Tourism, family visit, or short business trips"],
        pt: ["Brasileiros que moram no Brasil", "Primeira vez ou renovação de visto B1/B2", "Viagens a turismo, visita familiar ou negócios curtos"],
        es: ["Brasileños que viven en Brasil", "Primera vez o renovación de visa B1/B2", "Viajes de turismo, visita familiar o negocios cortos"],
      },
      notForWhom: {
        en: ["Those already in the US wanting to extend their stay", "Those needing a work or student visa", "Those needing legal representation before the consulate"],
        pt: ["Quem já está nos EUA e quer estender permanência", "Quem precisa de visto de trabalho ou estudante", "Quem precisa de representação legal perante o consulado"],
        es: ["Quienes ya están en EE.UU. y quieren extender su estadía", "Quienes necesitan visa de trabajo o estudiante", "Quienes necesitan representación legal ante el consulado"],
      },
      included: {
        en: ["Lifetime access digital step-by-step guide", "Complete document checklist", "DS-160 filling guidance", "Interview preparation tips", "Bonus: AI during the process to organize data and documents", "Bonus: N1 Operational Human Support (platform usage and basic steps)", "Final package in PDF (checklist + summary + instructions)"],
        pt: ["Guia digital passo a passo (acesso vitalício)", "Checklist completo de documentos", "Orientação para preenchimento do DS-160", "Dicas de preparação para entrevista", "Bônus: IA durante o processo para organizar dados e documentos", "Bônus: Suporte humano N1 Operacional (uso da plataforma e passos básicos)", "Pacote final em PDF (checklist + resumo + instruções)"],
        es: ["Guía digital paso a paso (acceso vitalicio)", "Checklist completo de documentos", "Orientación para llenado del DS-160", "Consejos de preparación para entrevista", "Bonus: IA durante el proceso para organizar datos y documentos", "Bonus: Soporte humano N1 Operacional (uso de la plataforma y pasos básicos)", "Paquete final en PDF (checklist + resumen + instrucciones)"],
      },
      notIncluded: {
        en: ["Legal advice or eligibility analysis", "Visa approval guarantee", "Representation before the consulate", "DS-160 form completion for you", "Chance analysis or strategy", "In-person interview accompaniment"],
        pt: ["Aconselhamento jurídico ou análise de elegibilidade", "Garantia de aprovação do visto", "Representação perante o consulado", "Preenchimento do DS-160 por você", "Análise de chances ou estratégia", "Acompanhamento presencial na entrevista"],
        es: ["Asesoría legal o análisis de elegibilidad", "Garantía de aprobación de visa", "Representación ante el consulado", "Llenado del DS-160 por usted", "Análisis de probabilidades o estrategia", "Acompañamiento presencial en la entrevista"],
      },
      requirements: {
        en: ["Valid passport", "Recent digital photo (5x5cm, white background)", "Financial proof (last 3 months)", "Proof of ties to Brazil (employment, property, family)", "Consular fee (MRV) paid"],
        pt: ["Passaporte válido", "Foto digital recente (5x5cm, fundo branco)", "Comprovantes financeiros (últimos 3 meses)", "Comprovante de vínculo com o Brasil (emprego, imóvel, família)", "Taxa consular (MRV) paga"],
        es: ["Pasaporte válido", "Foto digital reciente (5x5cm, fondo blanco)", "Comprobantes financieros (últimos 3 meses)", "Comprobante de vínculo con Brasil (empleo, inmueble, familia)", "Tarifa consular (MRV) pagada"],
      },
      steps: {
        en: ["Create your account and accept the terms", "Choose the service and make payment", "Start the AI-guided onboarding", "Fill in your data and upload documents", "Review everything and generate your Final Package (PDF)", "Follow the instructions to schedule and attend the interview"],
        pt: ["Crie sua conta e aceite os termos", "Escolha o serviço e realize o pagamento", "Inicie o onboarding guiado pela IA", "Preencha seus dados e faça upload dos documentos", "Revise tudo e gere seu Pacote Final (PDF)", "Siga as instruções para agendar e comparecer à entrevista"],
        es: ["Crea tu cuenta y acepta los términos", "Elige el servicio y realiza el pago", "Inicia el onboarding guiado por IA", "Completa tus datos y sube los documentos", "Revisa todo y genera tu Paquete Final (PDF)", "Sigue las instrucciones para agendar y asistir a la entrevista"],
      },
      faq: [
        {
          q: { en: "Does Aplikei fill out the DS-160 for me?", pt: "A Aplikei preenche o DS-160 para mim?", es: "¿Aplikei llena el DS-160 por mí?" },
          a: { en: "No. We provide detailed guidance so you can fill it out confidently. The guide explains field by field what to enter.", pt: "Não. Nós fornecemos orientação detalhada para que você mesmo preencha com confiança. O guia explica campo a campo o que preencher.", es: "No. Proporcionamos orientación detallada para que lo llenes con confianza. La guía explica campo por campo qué ingresar." },
        },
        {
          q: { en: "Does Aplikei guarantee my visa will be approved?", pt: "A Aplikei garante que meu visto será aprovado?", es: "¿Aplikei garantiza que mi visa será aprobada?" },
          a: { en: "No. No company can guarantee visa approval. The decision is exclusively made by the American consulate.", pt: "Não. Nenhuma empresa pode garantir aprovação de visto. A decisão é exclusiva do consulado americano.", es: "No. Ninguna empresa puede garantizar la aprobación de visa. La decisión es exclusiva del consulado americano." },
        },
        {
          q: { en: "Can I use it if I've been denied before?", pt: "Posso usar se já tive visto negado?", es: "¿Puedo usarlo si me negaron la visa antes?" },
          a: { en: "Yes, the guide is for anyone applying from Brazil. However, we do not offer chance analysis or strategy for prior denial cases.", pt: "Sim, o guia serve para qualquer pessoa aplicando do Brasil. Porém, não oferecemos análise de chances ou estratégia para casos de negativa anterior.", es: "Sí, la guía es para cualquier persona que aplique desde Brasil. Sin embargo, no ofrecemos análisis de probabilidades o estrategia para casos de negativa previa." },
        },
      ],
    },
    {
      slug: "visto-f1",
      title: { en: "F-1 Consular Visa Guide", pt: "Guia Visto Consular F-1", es: "Guía Visa Consular F-1" },
      shortTitle: { en: "F-1 Visa", pt: "Visto F-1", es: "Visa F-1" },
      subtitle: {
        en: "Student — for Brazilians applying from Brazil",
        pt: "Estudante — para brasileiros aplicando do Brasil",
        es: "Estudiante — para brasileños aplicando desde Brasil",
      },
      price: { en: "US$ 175.00", pt: "US$ 175,00", es: "US$ 175,00" },
      originalPrice: { en: "US$ 350.00", pt: "US$ 350,00", es: "US$ 350,00" },
      description: {
        en: "Step-by-step guide to apply for the F-1 student visa. Guidance on I-20, DS-160, SEVIS, financial documentation, and consulate interview preparation.",
        pt: "Guia passo a passo para aplicar ao visto de estudante F-1. Orientação sobre I-20, DS-160, SEVIS, documentação financeira e preparação para entrevista no consulado.",
        es: "Guía paso a paso para solicitar la visa de estudiante F-1. Orientación sobre I-20, DS-160, SEVIS, documentación financiera y preparación para la entrevista consular.",
      },
      forWhom: {
        en: ["Brazilians accepted at a US educational institution", "Those who already have the I-20 from the school/university", "Undergraduate, graduate, or language course students"],
        pt: ["Brasileiros aceitos em instituição de ensino nos EUA", "Quem já possui I-20 da escola/universidade", "Estudantes de graduação, pós-graduação ou cursos de idioma"],
        es: ["Brasileños aceptados en una institución educativa en EE.UU.", "Quienes ya tienen el I-20 de la escuela/universidad", "Estudiantes de grado, posgrado o cursos de idiomas"],
      },
      notForWhom: {
        en: ["Those not yet accepted at any institution", "Those needing advice on choosing a school/university", "Those already in the US needing to change status"],
        pt: ["Quem ainda não foi aceito em nenhuma instituição", "Quem precisa de assessoria para escolher escola/universidade", "Quem já está nos EUA e precisa trocar status"],
        es: ["Quienes aún no han sido aceptados en ninguna institución", "Quienes necesitan asesoría para elegir escuela/universidad", "Quienes ya están en EE.UU. y necesitan cambiar estatus"],
      },
      included: {
        en: ["Lifetime access digital step-by-step guide", "Complete F-1 document checklist", "I-20, SEVIS, and DS-160 guidance", "Consular interview preparation tips", "Bonus: AI during the process to organize data and documents", "Bonus: N1 Operational Human Support (platform usage and basic steps)", "Final package in PDF (checklist + summary + instructions)"],
        pt: ["Guia digital passo a passo (acesso vitalício)", "Checklist completo de documentos para F-1", "Orientação sobre I-20, SEVIS e DS-160", "Dicas de preparação para entrevista consular", "Bônus: IA durante o processo para organizar dados e documentos", "Bônus: Suporte humano N1 Operacional (uso da plataforma e passos básicos)", "Pacote final em PDF (checklist + resumo + instruções)"],
        es: ["Guía digital paso a paso (acceso vitalicio)", "Checklist completo de documentos para F-1", "Orientación sobre I-20, SEVIS y DS-160", "Consejos de preparación para entrevista consular", "Bonus: IA durante el proceso para organizar datos y documentos", "Bonus: Soporte humano N1 Operacional (uso de la plataforma y pasos básicos)", "Paquete final en PDF (checklist + resumen + instrucciones)"],
      },
      notIncluded: {
        en: ["Legal advice or eligibility analysis", "Visa approval guarantee", "School/university selection advice", "Representation before the consulate", "Chance analysis or strategy"],
        pt: ["Aconselhamento jurídico ou análise de elegibilidade", "Garantia de aprovação do visto", "Assessoria para escolha de escola/universidade", "Representação perante o consulado", "Análise de chances ou estratégia"],
        es: ["Asesoría legal o análisis de elegibilidad", "Garantía de aprobación de visa", "Asesoría para elegir escuela/universidad", "Representación ante el consulado", "Análisis de probabilidades o estrategia"],
      },
      requirements: {
        en: ["I-20 issued by the educational institution", "Valid passport", "SEVIS payment receipt (I-901)", "Financial proof (sponsor or own)", "Acceptance letter from the institution"],
        pt: ["I-20 emitido pela instituição de ensino", "Passaporte válido", "Comprovante de pagamento SEVIS (I-901)", "Comprovantes financeiros (sponsor ou próprios)", "Carta de aceitação da instituição"],
        es: ["I-20 emitido por la institución educativa", "Pasaporte válido", "Comprobante de pago SEVIS (I-901)", "Comprobantes financieros (patrocinador o propios)", "Carta de aceptación de la institución"],
      },
      steps: {
        en: ["Create your account and accept the terms", "Choose the service and make payment", "Start the AI-guided onboarding", "Fill in your academic and financial data", "Upload documents and the I-20", "Review everything and generate your Final Package (PDF)", "Follow the instructions to schedule and attend the interview"],
        pt: ["Crie sua conta e aceite os termos", "Escolha o serviço e realize o pagamento", "Inicie o onboarding guiado pela IA", "Preencha seus dados acadêmicos e financeiros", "Faça upload dos documentos e do I-20", "Revise tudo e gere seu Pacote Final (PDF)", "Siga as instruções para agendar e comparecer à entrevista"],
        es: ["Crea tu cuenta y acepta los términos", "Elige el servicio y realiza el pago", "Inicia el onboarding guiado por IA", "Completa tus datos académicos y financieros", "Sube los documentos y el I-20", "Revisa todo y genera tu Paquete Final (PDF)", "Sigue las instrucciones para agendar y asistir a la entrevista"],
      },
      faq: [
        {
          q: { en: "Do I need the I-20 to use the guide?", pt: "Preciso já ter o I-20 para usar o guia?", es: "¿Necesito tener el I-20 para usar la guía?" },
          a: { en: "Yes. The guide is for those already accepted by the institution and who have the I-20 in hand.", pt: "Sim. O guia é para quem já foi aceito pela instituição e possui o I-20 em mãos.", es: "Sí. La guía es para quienes ya fueron aceptados por la institución y tienen el I-20 en mano." },
        },
        {
          q: { en: "Does Aplikei help choose a school?", pt: "A Aplikei ajuda a escolher a escola?", es: "¿Aplikei ayuda a elegir la escuela?" },
          a: { en: "No. Our focus is on the visa process after institution acceptance.", pt: "Não. Nosso foco é no processo de visto após a aceitação pela instituição.", es: "No. Nuestro enfoque es en el proceso de visa después de la aceptación por la institución." },
        },
        {
          q: { en: "Does the guide work for language courses?", pt: "O guia serve para cursos de idioma?", es: "¿La guía sirve para cursos de idiomas?" },
          a: { en: "Yes, as long as the course requires an F-1 visa and you have the I-20.", pt: "Sim, desde que o curso exija visto F-1 e você tenha o I-20.", es: "Sí, siempre que el curso requiera visa F-1 y tengas el I-20." },
        },
      ],
    },
    {
      slug: "extensao-status",
      title: { en: "Status Extension Guide (I-539)", pt: "Guia Extensão de Status (I-539)", es: "Guía Extensión de Estatus (I-539)" },
      shortTitle: { en: "Status Extension", pt: "Extensão de Status", es: "Extensión de Estatus" },
      subtitle: {
        en: "For those already in the US needing to extend their stay",
        pt: "Para quem já está nos EUA e precisa estender a permanência",
        es: "Para quienes ya están en EE.UU. y necesitan extender su estadía",
      },
      price: { en: "US$ 100.00", pt: "US$ 100,00", es: "US$ 100,00" },
      originalPrice: { en: "US$ 200.00", pt: "US$ 200,00", es: "US$ 200,00" },
      description: {
        en: "Guide to request status extension with USCIS using Form I-539. Ideal for those in the US with a valid visa needing more time before returning.",
        pt: "Guia para solicitar extensão de status junto ao USCIS usando o formulário I-539. Ideal para quem está nos EUA com visto válido e precisa de mais tempo antes de retornar.",
        es: "Guía para solicitar extensión de estatus ante USCIS usando el formulario I-539. Ideal para quienes están en EE.UU. con visa válida y necesitan más tiempo antes de regresar.",
      },
      forWhom: {
        en: ["Brazilians already in the US with valid status", "Those needing to extend their stay (tourism, visitor, etc.)", "Applications within the I-94 validity period"],
        pt: ["Brasileiros que já estão nos EUA com status válido", "Quem precisa estender permanência (turismo, visitante, etc.)", "Aplicações dentro do prazo de validade do I-94"],
        es: ["Brasileños que ya están en EE.UU. con estatus válido", "Quienes necesitan extender su estadía (turismo, visitante, etc.)", "Solicitudes dentro del plazo de validez del I-94"],
      },
      notForWhom: {
        en: ["Those with expired status (overstay)", "Those needing to change visa category", "Those needing legal advice on eligibility"],
        pt: ["Quem já está com status vencido (overstay)", "Quem precisa trocar de categoria de visto", "Quem precisa de aconselhamento jurídico sobre elegibilidade"],
        es: ["Quienes tienen estatus vencido (overstay)", "Quienes necesitan cambiar de categoría de visa", "Quienes necesitan asesoría legal sobre elegibilidad"],
      },
      included: {
        en: ["Digital step-by-step I-539 guide", "Extension document checklist", "I-539 filling guidance", "USCIS deadlines and fees information", "Bonus: AI during the process to organize data and documents", "Bonus: N1 Operational Human Support (platform usage and basic steps)", "Final package in PDF (checklist + summary + instructions)"],
        pt: ["Guia digital passo a passo para I-539", "Checklist de documentos para extensão", "Orientação sobre preenchimento do I-539", "Informações sobre prazos e taxas do USCIS", "Bônus: IA durante o processo para organizar dados e documentos", "Bônus: Suporte humano N1 Operacional (uso da plataforma e passos básicos)", "Pacote final em PDF (checklist + resumo + instruções)"],
        es: ["Guía digital paso a paso para I-539", "Checklist de documentos para extensión", "Orientación sobre llenado del I-539", "Información sobre plazos y tarifas de USCIS", "Bonus: IA durante el proceso para organizar datos y documentos", "Bonus: Soporte humano N1 Operacional (uso de la plataforma y pasos básicos)", "Paquete final en PDF (checklist + resumen + instrucciones)"],
      },
      notIncluded: {
        en: ["Legal advice or eligibility analysis", "Extension approval guarantee", "Representation before USCIS", "Overstay case analysis", "Chance analysis or strategy"],
        pt: ["Aconselhamento jurídico ou análise de elegibilidade", "Garantia de aprovação da extensão", "Representação perante o USCIS", "Análise de casos de overstay", "Análise de chances ou estratégia"],
        es: ["Asesoría legal o análisis de elegibilidad", "Garantía de aprobación de extensión", "Representación ante USCIS", "Análisis de casos de overstay", "Análisis de probabilidades o estrategia"],
      },
      requirements: {
        en: ["Valid passport", "I-94 (US entry record)", "Copy of current visa", "Financial proof", "Justification for extension"],
        pt: ["Passaporte válido", "I-94 (registro de entrada nos EUA)", "Cópia do visto atual", "Comprovantes financeiros", "Justificativa para extensão"],
        es: ["Pasaporte válido", "I-94 (registro de entrada en EE.UU.)", "Copia de la visa actual", "Comprobantes financieros", "Justificación para la extensión"],
      },
      steps: {
        en: ["Create your account and accept the terms", "Choose the service and make payment", "Start the AI-guided onboarding", "Fill in your data and I-94 information", "Upload required documents", "Review everything and generate your Final Package (PDF)", "Follow the instructions to submit to USCIS"],
        pt: ["Crie sua conta e aceite os termos", "Escolha o serviço e realize o pagamento", "Inicie o onboarding guiado pela IA", "Preencha seus dados e informações do I-94", "Faça upload dos documentos necessários", "Revise tudo e gere seu Pacote Final (PDF)", "Siga as instruções para enviar ao USCIS"],
        es: ["Crea tu cuenta y acepta los términos", "Elige el servicio y realiza el pago", "Inicia el onboarding guiado por IA", "Completa tus datos e información del I-94", "Sube los documentos necesarios", "Revisa todo y genera tu Paquete Final (PDF)", "Sigue las instrucciones para enviar al USCIS"],
      },
      faq: [
        {
          q: { en: "Can I use it if my I-94 has expired?", pt: "Posso usar se meu I-94 já venceu?", es: "¿Puedo usarlo si mi I-94 ya venció?" },
          a: { en: "The guide is for applications within the deadline. Overstay situations may involve complexities that require legal advice.", pt: "O guia é voltado para aplicações dentro do prazo. Situações de overstay podem envolver complexidades que exigem aconselhamento jurídico.", es: "La guía está orientada a solicitudes dentro del plazo. Las situaciones de overstay pueden involucrar complejidades que requieren asesoría legal." },
        },
        {
          q: { en: "Does Aplikei submit my application to USCIS?", pt: "A Aplikei envia minha aplicação ao USCIS?", es: "¿Aplikei envía mi solicitud al USCIS?" },
          a: { en: "No. We guide the process so you can submit it yourself with confidence.", pt: "Não. Nós orientamos o processo para que você envie por conta própria com confiança.", es: "No. Orientamos el proceso para que lo envíes por tu cuenta con confianza." },
        },
      ],
    },
    {
      slug: "troca-status",
      title: { en: "Change of Status Guide", pt: "Guia Troca de Status (Change of Status)", es: "Guía Cambio de Estatus" },
      shortTitle: { en: "Change of Status", pt: "Troca de Status", es: "Cambio de Estatus" },
      subtitle: {
        en: "For those in the US needing to change visa category",
        pt: "Para quem está nos EUA e precisa mudar a categoria do visto",
        es: "Para quienes están en EE.UU. y necesitan cambiar la categoría de visa",
      },
      price: { en: "US$ 175.00", pt: "US$ 175,00", es: "US$ 175,00" },
      originalPrice: { en: "US$ 350.00", pt: "US$ 350,00", es: "US$ 350,00" },
      description: {
        en: "Step-by-step guide to request Change of Status within the US via Form I-539 or equivalent. For those needing to change from one visa category to another without leaving the country.",
        pt: "Guia passo a passo para solicitar troca de status (Change of Status) dentro dos EUA via formulário I-539 ou equivalente. Para quem precisa mudar de uma categoria de visto para outra sem sair do país.",
        es: "Guía paso a paso para solicitar cambio de estatus (Change of Status) dentro de EE.UU. vía formulario I-539 o equivalente. Para quienes necesitan cambiar de una categoría de visa a otra sin salir del país.",
      },
      forWhom: {
        en: ["Brazilians in the US with valid status needing to change category", "Example: B1/B2 to F-1 (when applicable via I-539)", "Applications within the I-94 validity period"],
        pt: ["Brasileiros nos EUA com status válido que precisam mudar de categoria", "Exemplo: de B1/B2 para F-1 (quando aplicável via I-539)", "Aplicações dentro do prazo de validade do I-94"],
        es: ["Brasileños en EE.UU. con estatus válido que necesitan cambiar de categoría", "Ejemplo: de B1/B2 a F-1 (cuando aplique vía I-539)", "Solicitudes dentro del plazo de validez del I-94"],
      },
      notForWhom: {
        en: ["Those with expired status", "Those needing a work visa (H-1B, L-1, etc.)", "Those needing specialized legal advice"],
        pt: ["Quem está com status vencido", "Quem precisa de visto de trabalho (H-1B, L-1, etc.)", "Quem precisa de aconselhamento jurídico especializado"],
        es: ["Quienes tienen estatus vencido", "Quienes necesitan visa de trabajo (H-1B, L-1, etc.)", "Quienes necesitan asesoría legal especializada"],
      },
      included: {
        en: ["Digital step-by-step Change of Status guide", "Status change document checklist", "Applicable forms guidance", "USCIS deadlines and fees information", "Bonus: AI during the process to organize data and documents", "Bonus: N1 Operational Human Support (platform usage and basic steps)", "Final package in PDF (checklist + summary + instructions)"],
        pt: ["Guia digital passo a passo para Change of Status", "Checklist de documentos para troca de status", "Orientação sobre formulários aplicáveis", "Informações sobre prazos e taxas do USCIS", "Bônus: IA durante o processo para organizar dados e documentos", "Bônus: Suporte humano N1 Operacional (uso da plataforma e passos básicos)", "Pacote final em PDF (checklist + resumo + instruções)"],
        es: ["Guía digital paso a paso para Cambio de Estatus", "Checklist de documentos para cambio de estatus", "Orientación sobre formularios aplicables", "Información sobre plazos y tarifas de USCIS", "Bonus: IA durante el proceso para organizar datos y documentos", "Bonus: Soporte humano N1 Operacional (uso de la plataforma y pasos básicos)", "Paquete final en PDF (checklist + resumen + instrucciones)"],
      },
      notIncluded: {
        en: ["Legal advice or eligibility analysis", "Status change approval guarantee", "Representation before USCIS", "Complex or overstay case analysis", "Work visa petitions"],
        pt: ["Aconselhamento jurídico ou análise de elegibilidade", "Garantia de aprovação da troca de status", "Representação perante o USCIS", "Análise de casos complexos ou de overstay", "Petições de visto de trabalho"],
        es: ["Asesoría legal o análisis de elegibilidad", "Garantía de aprobación del cambio de estatus", "Representación ante USCIS", "Análisis de casos complejos o de overstay", "Peticiones de visa de trabajo"],
      },
      requirements: {
        en: ["Valid passport", "Valid I-94 (not expired)", "Documentation for the new intended category", "Financial proof", "Justification for the status change"],
        pt: ["Passaporte válido", "I-94 válido (não vencido)", "Documentação da nova categoria pretendida", "Comprovantes financeiros", "Justificativa para a troca de status"],
        es: ["Pasaporte válido", "I-94 válido (no vencido)", "Documentación de la nueva categoría pretendida", "Comprobantes financieros", "Justificación para el cambio de estatus"],
      },
      steps: {
        en: ["Create your account and accept the terms", "Choose the service and make payment", "Start the AI-guided onboarding", "Fill in your data and process information", "Upload required documents", "Review everything and generate your Final Package (PDF)", "Follow the instructions to submit to USCIS"],
        pt: ["Crie sua conta e aceite os termos", "Escolha o serviço e realize o pagamento", "Inicie o onboarding guiado pela IA", "Preencha seus dados e informações do processo", "Faça upload dos documentos necessários", "Revise tudo e gere seu Pacote Final (PDF)", "Siga as instruções para enviar ao USCIS"],
        es: ["Crea tu cuenta y acepta los términos", "Elige el servicio y realiza el pago", "Inicia el onboarding guiado por IA", "Completa tus datos e información del proceso", "Sube los documentos necesarios", "Revisa todo y genera tu Paquete Final (PDF)", "Sigue las instrucciones para enviar al USCIS"],
      },
      faq: [
        {
          q: { en: "Is every status change possible?", pt: "Qualquer troca de status é possível?", es: "¿Todo cambio de estatus es posible?" },
          a: { en: "Not every change is eligible. The guide covers common processes via I-539. For complex situations, we recommend consulting an immigration attorney.", pt: "Nem toda troca é elegível. O guia cobre processos comuns via I-539. Para situações complexas, recomendamos consultar um advogado de imigração.", es: "No todo cambio es elegible. La guía cubre procesos comunes vía I-539. Para situaciones complejas, recomendamos consultar a un abogado de inmigración." },
        },
        {
          q: { en: "Can I change from B1/B2 to F-1?", pt: "Posso trocar de B1/B2 para F-1?", es: "¿Puedo cambiar de B1/B2 a F-1?" },
          a: { en: "In many cases, yes, as long as you meet the requirements. The guide walks you through the process but does not analyze individual eligibility.", pt: "Em muitos casos, sim, desde que você atenda aos requisitos. O guia orienta o processo, mas não analisa elegibilidade individual.", es: "En muchos casos, sí, siempre que cumplas los requisitos. La guía orienta el proceso, pero no analiza elegibilidad individual." },
        },
      ],
    },
  ],

  // ──── 404 ────
  notFound: {
    title: { en: "Page not found", pt: "Página não encontrada", es: "Página no encontrada" },
    back: { en: "Return to Home", pt: "Voltar ao início", es: "Volver al inicio" },
  },
} as const;

// Helper type
export type TranslationKey = keyof typeof translations;
