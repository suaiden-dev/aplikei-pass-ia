export type Language = "en" | "pt" | "es";

export const translations = {
  common: {
    yes: { en: "Yes", pt: "Sim", es: "Sí" },
    no: { en: "No", pt: "Não", es: "No" },
    select: { en: "Select...", pt: "Selecione...", es: "Seleccionar..." },
    tip: { en: "Tip:", pt: "Dica:", es: "Tip:" },
    doNotKnow: { en: "Do Not Know", pt: "Não sei", es: "No lo sé" },
    doesNotApply: { en: "Does Not Apply", pt: "Não se aplica", es: "No aplica" },
  },
  // ──── Header / Nav ────
  nav: {
    home: { en: "Home", pt: "Home", es: "Inicio" },
    howItWorks: {
      en: "How it works",
      pt: "Como funciona",
      es: "Cómo funciona",
    },
    services: { en: "Services", pt: "Serviços", es: "Servicios" },
    login: { en: "Log in", pt: "Entrar", es: "Iniciar sesión" },
    getStarted: { en: "Get started", pt: "Começar agora", es: "Empezar ahora" },
    dashboard: { en: "Dashboard", pt: "Painel", es: "Panel" },
    adminPanel: { en: "Admin Panel", pt: "Painel Admin", es: "Panel de Admin" },
    logout: { en: "Logout", pt: "Sair", es: "Salir" },
    goToDashboard: {
      en: "Go to Dashboard",
      pt: "Ir para o Painel",
      es: "Ir al Panel",
    },
    goToAdmin: { en: "Go to Admin", pt: "Ir para o Admin", es: "Ir al Admin" },
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
      en: "Get a step-by-step digital guide for US Tourist (B1/B2), Student (F-1), and Exchange Visitor (J-1) visas, plus AI-powered tools to organize your documents and generate a ready-to-print application package.",
      pt: "Obtenha um guia digital passo a passo para vistos americanos de Turismo (B1/B2), Estudante (F-1) e Visitante de Intercâmbio (J-1), além de ferramentas com IA para organizar seus documentos e gerar um pacote de aplicação pronto para imprimir.",
      es: "Obtén una guía digital paso a paso para visas de Turismo (B1/B2), Estudiante (F-1) y Visitante de Intercambio (J-1) de EE.UU., además de herramientas con IA para organizar tus documentos y generar un paquete de aplicación listo para imprimir.",
    },
    cta: {
      en: "See Plans & Pricing →",
      pt: "Ver Planos e Preços →",
      es: "Ver Planes y Precios →",
    },
    ctaSecondary: {
      en: "How it works",
      pt: "Como funciona",
      es: "Cómo funciona",
    },
  },

  // ──── How it works (landing) ────
  howItWorksSection: {
    title: { en: "How it works", pt: "Como funciona", es: "Cómo funciona" },
    subtitle: {
      en: "Three simple steps to organize your immigration process.",
      pt: "Três passos simples para organizar seu processo imigratório.",
      es: "Tres pasos simples para organizar tu proceso migratorio.",
    },
    step1Title: {
      en: "Choose your service",
      pt: "Escolha seu serviço",
      es: "Elige tu servicio",
    },
    step1Desc: {
      en: "Select the guide for your specific visa type. We clearly list what's included (like the AI tool) and what's not (like legal advice).",
      pt: "Selecione o guia para seu tipo de visto específico. Listamos claramente o que está incluso (como a ferramenta de IA) e o que não está (como assessoria jurídica).",
      es: "Selecciona la guía para tu tipo de visa específico. Listamos claramente qué está incluido (como la herramienta de IA) y qué no (como asesoría legal).",
    },
    step2Title: {
      en: "Read before you buy",
      pt: "Leia antes de comprar",
      es: "Lee antes de comprar",
    },
    step2Desc: {
      en: "Preview the guide's table of contents and checklist. Full transparency so you know exactly what you're getting.",
      pt: "Veja o índice e o checklist do guia antes de comprar. Transparência total para você saber exatamente o que está adquirindo.",
      es: "Ve el índice y el checklist de la guía antes de comprar. Transparencia total para que sepas exactamente lo que obtienes.",
    },
    step3Title: {
      en: "Build your final package",
      pt: "Monte seu pacote final",
      es: "Arma tu paquete final",
    },
    step3Desc: {
      en: "Use our AI assistant to organize your uploaded documents, auto-fill forms, and compile everything into a final, organized PDF.",
      pt: "Use nosso assistente de IA para organizar seus documentos enviados, preencher formulários automaticamente e compilar tudo em um PDF final e organizado.",
      es: "Usa nuestro asistente de IA para organizar tus documentos subidos, auto-completar formularios y compilar todo en un PDF final y organizado.",
    },
  },

  // ──── What you get ────
  whatYouGet: {
    title: { en: "What you get", pt: "O que você recebe", es: "Qué recibes" },
    guide: {
      en: "Comprehensive Visa Guide & Checklist",
      pt: "Guia Completo de Visto & Checklist",
      es: "Guía Completa de Visa & Checklist",
    },
    guideDesc: {
      en: "A 50+ page guide written in plain English. Covers forms, fees, required documents, and step-by-step instructions for your specific visa type.",
      pt: "Um guia de mais de 50 páginas escrito em linguagem clara. Cobre formulários, taxas, documentos necessários e instruções passo a passo para seu tipo de visto específico.",
      es: "Una guía de más de 50 páginas escrita en lenguaje claro. Cubre formularios, tarifas, documentos necesarios e instrucciones paso a paso para tu tipo de visa específico.",
    },
    ai: {
      en: "AI Document Organizer",
      pt: "Organizador de Documentos com IA",
      es: "Organizador de Documentos con IA",
    },
    aiDesc: {
      en: "Our AI helps you sort your bank statements, IDs, and letters. It extracts key information, checks for missing documents against the checklist, and helps format your application.",
      pt: "Nossa IA ajuda você a organizar extratos bancários, documentos de identidade e cartas. Ela extrai informações-chave, verifica documentos faltantes no checklist e ajuda a formatar sua aplicação.",
      es: "Nuestra IA te ayuda a organizar extractos bancarios, documentos de identidad y cartas. Extrae información clave, verifica documentos faltantes en el checklist y ayuda a formatear tu aplicación.",
    },
    support: { en: "Support", pt: "Suporte", es: "Soporte" },
    supportDesc: {
      en: "Stuck on how to upload a file or download your PDF? Our support team can help you use the platform, so you can focus on your application.",
      pt: "Dificuldade para enviar um arquivo ou baixar seu PDF? Nossa equipe de suporte ajuda você a usar a plataforma, para que você possa focar na sua aplicação.",
      es: "¿Tienes problemas para subir un archivo o descargar tu PDF? Nuestro equipo de soporte te ayuda a usar la plataforma, para que puedas enfocarte en tu aplicación.",
    },
    pdf: {
      en: "Your Ready-to-Print Package",
      pt: "Seu Pacote Pronto para Imprimir",
      es: "Tu Paquete Listo para Imprimir",
    },
    pdfDesc: {
      en: "A single, organized PDF containing your completed forms, document index, case summary, and clear instructions on what to do next.",
      pt: "Um único PDF organizado contendo seus formulários preenchidos, índice de documentos, resumo do caso e instruções claras sobre os próximos passos.",
      es: "Un único PDF organizado que contiene tus formularios completados, índice de documentos, resumen del caso e instrucciones claras sobre qué hacer después.",
    },
    bonus: { en: "Bonus", pt: "Bônus", es: "Bonus" },
  },

  // ──── Services section ────
  servicesSection: {
    title: {
      en: "Our services",
      pt: "Nossos serviços",
      es: "Nuestros servicios",
    },
    subtitle: {
      en: "Choose the ideal guide for your immigration process.",
      pt: "Escolha o guia ideal para o seu processo imigratório.",
      es: "Elige la guía ideal para tu proceso migratorio.",
    },
    viewDetails: { en: "View details", pt: "Ver detalhes", es: "Ver detalles" },
    promo: {
      en: "🔥 Special conditions — while they last!",
      pt: "🔥 Aproveite condições especiais enquanto durem!",
      es: "🔥 ¡Aprovecha condiciones especiales mientras duren!",
    },
    discount: { en: "50% OFF", pt: "50% OFF", es: "50% OFF" },
  },

  // ──── FAQ ────
  // ──── Testimonials ────
  testimonials: {
    title: {
      en: "Trusted by Applicants Like You",
      pt: "Confiado por Aplicantes Como Você",
      es: "Confiado por Solicitantes Como Tú",
    },
    items: [
      {
        quote: {
          en: "The guide was super detailed and the AI saved me hours of sorting through paperwork. Finally, a tool that just organizes everything for you.",
          pt: "O guia foi super detalhado e a IA me economizou horas organizando papelada. Finalmente, uma ferramenta que organiza tudo para você.",
          es: "La guía fue super detallada y la IA me ahorró horas organizando papeleo. Finalmente, una herramienta que organiza todo por ti.",
        },
        author: "Maria S.",
      },
      {
        quote: {
          en: "I was so confused about the F-1 visa documents. Aplikei's checklist made sure I didn't forget anything. The final PDF package was so professional.",
          pt: "Eu estava tão confusa sobre os documentos do visto F-1. O checklist da Aplikei garantiu que eu não esquecesse nada. O pacote final em PDF ficou muito profissional.",
          es: "Estaba muy confundida sobre los documentos de la visa F-1. El checklist de Aplikei se aseguró de que no olvidara nada. El paquete final en PDF fue muy profesional.",
        },
        author: "Carlos R.",
      },
      {
        quote: {
          en: "Great value. It's not a lawyer, but it gave me the clarity I needed to prepare my own B1/B2 application with confidence.",
          pt: "Ótimo custo-benefício. Não é um advogado, mas me deu a clareza que eu precisava para preparar minha própria aplicação B1/B2 com confiança.",
          es: "Gran valor. No es un abogado, pero me dio la claridad que necesitaba para preparar mi propia solicitud B1/B2 con confianza.",
        },
        author: "David K.",
      },
    ],
  },

  faq: {
    title: {
      en: "Frequently asked questions",
      pt: "Perguntas frequentes",
      es: "Preguntas frecuentes",
    },
    items: [
      {
        q: {
          en: "How long do I have access to the AI tool?",
          pt: "Por quanto tempo tenho acesso à ferramenta de IA?",
          es: "¿Por cuánto tiempo tengo acceso a la herramienta de IA?",
        },
        a: {
          en: "You get access for 90 days from purchase—plenty of time to gather your documents and build your package.",
          pt: "Você tem acesso por 90 dias a partir da compra — tempo suficiente para reunir seus documentos e montar seu pacote.",
          es: "Tienes acceso por 90 días desde la compra — tiempo suficiente para reunir tus documentos y armar tu paquete.",
        },
      },
      {
        q: {
          en: "Which visa types do you cover right now?",
          pt: "Quais tipos de visto vocês cobrem atualmente?",
          es: "¿Qué tipos de visa cubren actualmente?",
        },
        a: {
          en: "We currently have guides for US Tourist (B1/B2), Student (F-1), and Exchange Visitor (J-1) visas. We are working on adding more!",
          pt: "Atualmente temos guias para vistos americanos de Turismo (B1/B2), Estudante (F-1) e Visitante de Intercâmbio (J-1). Estamos trabalhando para adicionar mais!",
          es: "Actualmente tenemos guías para visas de Turismo (B1/B2), Estudiante (F-1) y Visitante de Intercambio (J-1) de EE.UU. ¡Estamos trabajando para agregar más!",
        },
      },
      {
        q: {
          en: "What if I'm not satisfied with the guide?",
          pt: "E se eu não ficar satisfeito com o guia?",
          es: "¿Qué pasa si no estoy satisfecho con la guía?",
        },
        a: {
          en: "We offer a 14-day money-back guarantee if you haven't started using the AI tool. Just email us.",
          pt: "Oferecemos garantia de devolução em 14 dias se você não começou a usar a ferramenta de IA. Basta nos enviar um e-mail.",
          es: "Ofrecemos garantía de devolución de 14 días si no has comenzado a usar la herramienta de IA. Solo envíanos un correo.",
        },
      },
      {
        q: {
          en: "Do I still need a lawyer?",
          pt: "Eu ainda preciso de um advogado?",
          es: "¿Aún necesito un abogado?",
        },
        a: {
          en: "We are not a law firm and cannot provide legal advice. Our service is for organization and guidance. If your case is complex (e.g., prior denials, legal issues), we always recommend consulting with a qualified immigration attorney.",
          pt: "Nós não somos um escritório de advocacia e não podemos oferecer assessoria jurídica. Nosso serviço é de organização e orientação. Se seu caso é complexo (ex: negativas anteriores, questões legais), sempre recomendamos consultar um advogado de imigração qualificado.",
          es: "No somos un despacho de abogados y no podemos brindar asesoría legal. Nuestro servicio es de organización y orientación. Si tu caso es complejo (ej: negativas previas, asuntos legales), siempre recomendamos consultar con un abogado de inmigración calificado.",
        },
      },
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
          en: "Does AI replace a lawyer?",
          pt: "A IA substitui um advogado?",
          es: "¿La IA reemplaza a un abogado?",
        },
        a: {
          en: "No. AI helps organize data, documents, and generate checklists. It does not analyze eligibility, provide legal advice, or guarantee results.",
          pt: "Não. A IA ajuda a organizar dados, documentos e gerar checklists. Ela não analisa elegibilidade, não dá conselhos jurídicos e não garante resultados.",
          es: "No. La IA ayuda a organizar dados, documentos y generar checklists. No analiza elegibilidad, no da asesoría legal y no garantiza resultados.",
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
    title: {
      en: "Important notices",
      pt: "Avisos Importantes",
      es: "Avisos importantes",
    },
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
    viewAll: {
      en: "View all disclaimers →",
      pt: "Ver todos os disclaimers →",
      es: "Ver todos los avisos →",
    },
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
    howItWorks: {
      en: "How it works",
      pt: "Como funciona",
      es: "Cómo funciona",
    },
    disclaimers: { en: "Disclaimers", pt: "Disclaimers", es: "Avisos" },
    helpCenter: { en: "Support", pt: "Suporte", es: "Soporte" },
    terms: { en: "Terms of Use", pt: "Termos de Uso", es: "Términos de Uso" },
    privacy: {
      en: "Privacy Policy",
      pt: "Política de Privacidade",
      es: "Política de Privacidad",
    },
    refund: {
      en: "Refund Policy",
      pt: "Política de Reembolso",
      es: "Política de Reembolso",
    },
    copyright: {
      en: "All rights reserved. Aplikei is not a law firm, does not offer legal advice, and does not guarantee visa or petition approvals.",
      pt: "Todos os direitos reservados. Aplikei não é escritório de advocacia, não oferece aconselhamento jurídico e não garante aprovação de vistos ou petições.",
      es: "Todos los derechos reservados. Aplikei no es un despacho de abogados, no ofrece asesoría legal y no garantiza la aprobación de visas o peticiones.",
    },
  },

  // ──── How it Works page ────
  howItWorksPage: {
    title: {
      en: "How Aplikei works",
      pt: "Como funciona a Aplikei",
      es: "Cómo funciona Aplikei",
    },
    subtitle: {
      en: "A simple 5-step flow: from choosing your service to generating your final package.",
      pt: "Um fluxo simples de 5 etapas: da escolha do serviço até a geração do seu pacote final.",
      es: "Un flujo simple de 5 pasos: desde elegir tu servicio hasta generar tu paquete final.",
    },
    step: { en: "Step", pt: "Etapa", es: "Paso" },
    steps: [
      {
        title: { en: "Pre-purchase", pt: "Pré-compra", es: "Pre-compra" },
        desc: {
          en: "Read everything about the service: what's included and what's not.",
          pt: "Leia tudo sobre o serviço: o que inclui e o que não inclui.",
          es: "Lee todo sobre el servicio: qué incluye y qué no.",
        },
      },
      {
        title: {
          en: "Sign up + Agreements",
          pt: "Cadastro + Aceites",
          es: "Registro + Aceptaciones",
        },
        desc: {
          en: "Create your account and accept the terms and disclaimers.",
          pt: "Crie sua conta e aceite os termos e disclaimers.",
          es: "Crea tu cuenta y acepta los términos y avisos.",
        },
      },
      {
        title: { en: "Payment", pt: "Pagamento", es: "Pago" },
        desc: {
          en: "Pay securely and get immediate access to the guide.",
          pt: "Pague com segurança e tenha acesso imediato ao guia.",
          es: "Paga de forma segura y obtén acceso inmediato a la guía.",
        },
      },
      {
        title: {
          en: "AI Onboarding",
          pt: "Onboarding IA",
          es: "Onboarding IA",
        },
        desc: {
          en: "AI helps you fill in data, organize documents, and build your case.",
          pt: "A IA ajuda você a preencher dados, organizar documentos e montar seu caso.",
          es: "La IA te ayuda a llenar datos, organizar documentos y armar tu caso.",
        },
      },
      {
        title: {
          en: "Final Package (PDF)",
          pt: "Pacote Final (PDF)",
          es: "Paquete Final (PDF)",
        },
        desc: {
          en: "Generate your PDF with checklist, summary, and next step instructions.",
          pt: "Gere seu PDF com checklist, resumo e instruções dos próximos passos.",
          es: "Genera tu PDF con checklist, resumen e instrucciones de próximos pasos.",
        },
      },
    ],
    youBuy: {
      en: "You buy: Guide",
      pt: "Você compra: Guia",
      es: "Compras: Guía",
    },
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
    bonusN1: {
      en: "Bonus: Support",
      pt: "Bônus: Suporte",
      es: "Bonus: Soporte",
    },
    bonusN1Desc: {
      en: "Strictly operational human support: platform usage, document uploads, fee payments.",
      pt: "Suporte humano apenas operacional: uso da plataforma, upload de documentos, pagamento de taxas.",
      es: "Soporte humano solo operacional: uso de la plataforma, subida de documentos, pago de tarifas.",
    },
    aiDoesTitle: {
      en: "What AI does (and doesn't do)",
      pt: "O que a IA faz (e o que não faz)",
      es: "Qué hace la IA (y qué no)",
    },
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
    aiHelps: {
      en: "✅ AI helps you:",
      pt: "✅ A IA ajuda você a:",
      es: "✅ La IA te ayuda a:",
    },
    aiDoesNotLabel: {
      en: "❌ AI does NOT:",
      pt: "❌ A IA NÃO faz:",
      es: "❌ La IA NO hace:",
    },
    viewServices: {
      en: "View available services",
      pt: "Ver serviços disponíveis",
      es: "Ver servicios disponibles",
    },
  },

  // ──── Services page ────
  servicesPage: {
    title: {
      en: "Our Services",
      pt: "Nossos Serviços",
      es: "Nuestros Servicios",
    },
    subtitle: {
      en: "Choose the step-by-step guide for your immigration process. Read everything before buying.",
      pt: "Escolha o guia passo a passo ideal para o seu processo imigratório. Leia tudo antes de comprar.",
      es: "Elige la guía paso a paso ideal para tu proceso migratorio. Lee todo antes de comprar.",
    },
    forWhom: { en: "Who it's for", pt: "Para quem é", es: "Para quién es" },
    includes: { en: "✅ Includes", pt: "✅ Inclui", es: "✅ Incluye" },
    notIncluded: {
      en: "❌ Not included",
      pt: "❌ Não inclui",
      es: "❌ No incluye",
    },
    viewFull: {
      en: "View full details",
      pt: "Ver detalhes completos",
      es: "Ver detalles completos",
    },
  },

  // ──── Service detail page ────
  serviceDetail: {
    overview: { en: "Overview", pt: "Visão geral", es: "Visión general" },
    forWhom: {
      en: "✅ Who it's for",
      pt: "✅ Para quem é",
      es: "✅ Para quién es",
    },
    notForWhom: {
      en: "❌ Who it's NOT for",
      pt: "❌ Para quem NÃO é",
      es: "❌ Para quién NO es",
    },
    included: {
      en: "What's included",
      pt: "O que está incluso",
      es: "Qué está incluido",
    },
    notIncluded: {
      en: "What's NOT included",
      pt: "O que NÃO está incluso",
      es: "Qué NO está incluido",
    },
    requirements: {
      en: "What you'll need",
      pt: "O que você vai precisar",
      es: "Qué vas a necesitar",
    },
    steps: {
      en: "Step-by-step summary",
      pt: "Passo a passo resumido",
      es: "Resumen paso a paso",
    },
    faq: {
      en: "Frequently asked questions",
      pt: "Perguntas frequentes",
      es: "Preguntas frecuentes",
    },
    disclaimer: {
      en: "Notice: Aplikei is not a law firm, does not offer legal advice, does not guarantee approval, and does not represent clients before consulates or USCIS. Human support is strictly operational.",
      pt: "Aviso: Aplikei não é escritório de advocacia, não oferece aconselhamento jurídico, não garante aprovação e não representa o cliente perante consulado ou USCIS. Suporte humano é apenas operacional.",
      es: "Aviso: Aplikei no es un despacho de abogados, no ofrece asesoría legal, no garantiza aprobación y no representa al cliente ante consulados o USCIS. El soporte humano es solo operacional.",
    },
    createAccount: { en: "Contract", pt: "Contratar", es: "Contratar" },
    dependents: { en: "Dependents", pt: "Dependentes", es: "Dependientes" },
    dependentsDesc: {
      en: "Spouses and children under 21 years old are considered dependents.",
      pt: "Cônjuges e filhos menores de 21 anos são considerados dependentes.",
      es: "Cónyuges e hijos menores de 21 años se consideran dependientes.",
    },
    perDependent: {
      en: "per dependent",
      pt: "por dependente",
      es: "por dependiente",
    },
  },

  // ──── Login ────
  login: {
    title: {
      en: "Log in to your account",
      pt: "Entrar na sua conta",
      es: "Inicia sesión",
    },
    subtitle: {
      en: "Access your guide and continue your process.",
      pt: "Acesse seu guia e continue seu processo.",
      es: "Accede a tu guía y continúa tu proceso.",
    },
    email: { en: "Email", pt: "E-mail", es: "Correo electrónico" },
    password: { en: "Password", pt: "Senha", es: "Contraseña" },
    submit: { en: "Log in", pt: "Entrar", es: "Iniciar sesión" },
    noAccount: {
      en: "Don't have an account?",
      pt: "Não tem conta?",
      es: "¿No tienes cuenta?",
    },
    createAccount: {
      en: "Create account",
      pt: "Criar conta",
      es: "Crear cuenta",
    },
    forgotPassword: {
      en: "Forgot your password?",
      pt: "Esqueceu sua senha?",
      es: "¿Olvidaste tu contraseña?",
    },
  },

  // ──── Forgot Password ────
  forgotPassword: {
    title: {
      en: "Recover Password",
      pt: "Recuperar Senha",
      es: "Recuperar Contraseña",
    },
    subtitle: {
      en: "Enter your e-mail to receive a verification code.",
      pt: "Digite seu e-mail para receber um código de verificação.",
      es: "Ingresa tu correo para recibir un código de verificación.",
    },
    email: { en: "E-mail", pt: "E-mail", es: "Correo electrónico" },
    send: { en: "Send Code", pt: "Enviar Código", es: "Enviar Código" },
    sending: { en: "Sending...", pt: "Enviando...", es: "Enviando..." },
    otpTitle: {
      en: "Enter the code",
      pt: "Digite o código",
      es: "Ingresa el código",
    },
    otpSubtitle: {
      en: "We sent a 6-digit code to",
      pt: "Enviamos um código de 6 dígitos para",
      es: "Enviamos un código de 6 dígitos a",
    },
    otpLabel: {
      en: "Verification Code",
      pt: "Código de Verificação",
      es: "Código de Verificación",
    },
    verify: {
      en: "Verify & Continue",
      pt: "Verificar e Continuar",
      es: "Verificar y Continuar",
    },
    verifying: {
      en: "Verifying...",
      pt: "Verificando...",
      es: "Verificando...",
    },
    notReceived: {
      en: "Didn't receive it?",
      pt: "Não recebeu?",
      es: "¿No lo recibiste?",
    },
    resend: { en: "Resend code", pt: "Reenviar código", es: "Reenviar código" },
    resendIn: {
      en: "Resend in {s}s",
      pt: "Reenviar em {s}s",
      es: "Reenviar en {s}s",
    },
    backToLogin: {
      en: "Back to login",
      pt: "Voltar ao login",
      es: "Volver al inicio de sesión",
    },
    back: { en: "Back", pt: "Voltar", es: "Volver" },
    errorGeneric: {
      en: "An error occurred. Please try again.",
      pt: "Ocorreu um erro. Tente novamente.",
      es: "Ocurrió un error. Inténtalo de nuevo.",
    },
  },

  // ──── Reset Password ────
  resetPassword: {
    title: { en: "New Password", pt: "Nova Senha", es: "Nueva Contraseña" },
    subtitle: {
      en: "Enter your new password below.",
      pt: "Digite sua nova senha abaixo.",
      es: "Ingresa tu nueva contraseña abajo.",
    },
    newPassword: {
      en: "New Password",
      pt: "Nova Senha",
      es: "Nueva Contraseña",
    },
    confirmPassword: {
      en: "Confirm Password",
      pt: "Confirmar Senha",
      es: "Confirmar Contraseña",
    },
    submit: {
      en: "Reset Password",
      pt: "Redefinir Senha",
      es: "Restablecer Contraseña",
    },
    submitting: { en: "Saving...", pt: "Salvando...", es: "Guardando..." },
    mismatch: {
      en: "Passwords don't match",
      pt: "As senhas não coincidem",
      es: "Las contraseñas no coinciden",
    },
    successTitle: {
      en: "Password updated!",
      pt: "Senha atualizada!",
      es: "¡Contraseña actualizada!",
    },
    successDesc: {
      en: "Your password has been reset. Redirecting to login...",
      pt: "Sua senha foi redefinida. Redirecionando para o login...",
      es: "Tu contraseña fue restablecida. Redirigiendo al inicio de sesión...",
    },
    goToLogin: {
      en: "Go to Login",
      pt: "Ir para o Login",
      es: "Ir al inicio de sesión",
    },
    noSession: {
      en: "Session not found. Please request a new code.",
      pt: "Sessão não encontrada. Solicite um novo código.",
      es: "Sesión no encontrada. Solicita un nuevo código.",
    },
    redirecting: {
      en: "You will be redirected shortly.",
      pt: "Você será redirecionado em instantes.",
      es: "Serás redirigido en breve.",
    },
    backToLogin: { en: "Back", pt: "Voltar", es: "Volver" },
    errorSamePassword: {
      en: "New password must be different from current password.",
      pt: "A nova senha deve ser diferente da senha atual.",
      es: "La nueva contraseña debe ser diferente de la actual.",
    },
    errorWeakPassword: {
      en: "Password is too weak. Use a stronger password.",
      pt: "Senha muito fraca. Use uma senha mais forte.",
      es: "La contraseña es muy débil. Usa una más segura.",
    },
    errorGeneric: {
      en: "An error occurred. Please try again.",
      pt: "Ocorreu um erro. Tente novamente.",
      es: "Ocurrió un error. Inténtalo de nuevo.",
    },
  },

  // ──── Signup ────
  signup: {
    title: { en: "Create account", pt: "Criar conta", es: "Crear cuenta" },
    subtitle: {
      en: "Start your process with clarity.",
      pt: "Comece seu processo com clareza.",
      es: "Comienza tu proceso con claridad.",
    },
    signupSuccess: {
      en: "Signup successful! Please check your email.",
      pt: "Cadastro realizado! Verifique seu e-mail.",
      es: "¡Registro exitoso! Por favor, verifica tu correo electrónico.",
    },
    fullName: { en: "Full name", pt: "Nome completo", es: "Nombre completo" },
    namePlaceholder: { en: "Your name", pt: "Seu nome", es: "Tu nombre" },
    email: { en: "Email", pt: "E-mail", es: "Correo electrónico" },
    password: { en: "Password", pt: "Senha", es: "Contraseña" },
    passwordPlaceholder: {
      en: "Minimum 8 characters",
      pt: "Mínimo 8 caracteres",
      es: "Mínimo 8 caracteres",
    },
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
    termsLink: {
      en: "Terms of Use",
      pt: "Termos de Uso",
      es: "Términos de Uso",
    },
    privacyLink: {
      en: "Privacy Policy",
      pt: "Política de Privacidade",
      es: "Política de Privacidad",
    },
    disclaimersLink: { en: "Disclaimers", pt: "Disclaimers", es: "Avisos" },
    and: { en: "and", pt: "e", es: "y" },
    phone: { en: "Phone", pt: "Telefone", es: "Teléfono" },
    submit: { en: "Create account", pt: "Criar conta", es: "Crear cuenta" },
    hasAccount: {
      en: "Already have an account?",
      pt: "Já tem conta?",
      es: "¿Ya tienes cuenta?",
    },
    loginLink: { en: "Log in", pt: "Entrar", es: "Iniciar sesión" },
  },

  // ──── Dashboard ────
  dashboard: {
    title: { en: "Dashboard", pt: "Painel", es: "Panel" },
    welcome: {
      en: "Welcome back! Continue your process.",
      pt: "Bem-vindo de volta! Continue seu processo.",
      es: "¡Bienvenido! Continúa tu proceso.",
    },
    overallProgress: {
      en: "Overall progress",
      pt: "Progresso geral",
      es: "Progreso general",
    },
    onboarding: { en: "Onboarding", pt: "Onboarding", es: "Onboarding" },
    complete: { en: "complete", pt: "completo", es: "completado" },
    cards: {
      currentService: {
        en: "My current service",
        pt: "Meu serviço atual",
        es: "Mi servicio actual",
      },
      currentServiceDesc: {
        en: "B1/B2 Visa — Tourism and Business",
        pt: "Visto B1/B2 — Turismo e Negócios",
        es: "Visa B1/B2 — Turismo y Negocios",
      },
      inProgress: { en: "In progress", pt: "Em andamento", es: "En progreso" },
      checklist: {
        en: "Document checklist",
        pt: "Checklist de documentos",
        es: "Checklist de documentos",
      },
      checklistDesc: {
        en: "3 of 8 documents uploaded",
        pt: "3 de 8 documentos enviados",
        es: "3 de 8 documentos enviados",
      },
      chatAI: {
        en: "Chat with AI",
        pt: "Conversar com a IA",
        es: "Chatear con la IA",
      },
      chatAIDesc: {
        en: "Ask questions and organize your process",
        pt: "Tire dúvidas e organize seu processo",
        es: "Haz preguntas y organiza tu proceso",
      },
      uploads: { en: "Uploads", pt: "Uploads", es: "Subir archivos" },
      uploadsDesc: {
        en: "Upload and manage your documents",
        pt: "Envie e gerencie seus documentos",
        es: "Sube y administra tus documentos",
      },
      generatePDF: {
        en: "Generate final package (PDF)",
        pt: "Gerar pacote final (PDF)",
        es: "Generar paquete final (PDF)",
      },
      generatePDFDesc: {
        en: "Available when onboarding is complete",
        pt: "Disponível quando o onboarding estiver completo",
        es: "Disponible cuando el onboarding esté completo",
      },
      help: { en: "Support", pt: "Suporte", es: "Soporte" },
      helpDesc: {
        en: "Questions about platform usage",
        pt: "Dúvidas sobre uso da plataforma",
        es: "Preguntas sobre uso de la plataforma",
      },
    },
    access: { en: "Access", pt: "Acessar", es: "Acceder" },
    selfieModal: {
      title: {
        en: "Identity Verification Required",
        pt: "Verificação de Identidade Necessária",
        es: "Verificación de Identidad Requerida",
      },
      desc: {
        en: "Para prosseguir com sua solicitação do DS-160, você deve enviar uma selfie com fundo branco, usando camisa fechada, sem óculos, com o rosto totalmente visível.",
        pt: "To proceed with your DS-160 request, you must send a selfie with a white background, wearing a closed shirt, without glasses, with your face fully visible.",
        es: "Para continuar con su solicitud del DS-160, debe enviar una selfie con fondo blanco, usando camisa cerrada, sin gafas, con el rostro completamente visible.",
      },
      uploadBtn: {
        en: "Upload Selfie",
        pt: "Fazer Upload da Selfie",
        es: "Subir Selfie",
      },
      submitting: { en: "Uploading...", pt: "Enviando...", es: "Subiendo..." },
      success: {
        en: "Selfie uploaded successfully!",
        pt: "Selfie enviada com sucesso!",
        es: "¡Selfie subida con éxito!",
      },
    },
    activeProcesses: {
      en: "Your Active Processes",
      pt: "Seus Processos Ativos",
      es: "Tus Procesos Activos",
    },
    selectProcess: {
      en: "Select Process",
      pt: "Selecionar Processo",
      es: "Seleccionar Proceso",
    },
    getProcesses: {
      en: "Get Processes",
      pt: "Obter Processos",
      es: "Obtener Procesos",
    },
    comingSoon: { en: "Coming Soon", pt: "Em Breve", es: "Próximamente" },
    getStarted: {
      en: "Get Started",
      pt: "Contratar Agora",
      es: "Contratar Ahora",
    },
    available: { en: "Available", pt: "Disponível", es: "Disponible" },
    paymentSuccess: {
      en: "Payment confirmed! Your new guide is available below.",
      pt: "Pagamento confirmado! Seu novo guia já está disponível abaixo.",
      es: "¡Pago confirmado! Tu nueva guía está disponible abajo.",
    },
    errorUploadingSelfie: {
      en: "Error uploading selfie",
      pt: "Erro ao enviar selfie",
      es: "Error al subir selfie",
    },
    remove: { en: "Remove", pt: "Remover", es: "Eliminar" },
    selectSelfie: {
      en: "Select your selfie",
      pt: "Selecione sua selfie",
      es: "Selecciona tu selfie",
    },
    or: { en: "or", pt: "ou", es: "o" },
    status: {
      ds160InProgress: {
        en: "Filling out DS-160",
        pt: "Preenchendo DS-160",
        es: "Llenando DS-160",
      },
      ds160Processing: {
        en: "Processing DS-160",
        pt: "Processando DS-160",
        es: "Procesando DS-160",
      },
      ds160uploadDocuments: {
        en: "3. Upload Documents",
        pt: "3. Anexar Documentos",
        es: "3. Adjuntar Documentos",
      },
      ds160AwaitingReviewAndSignature: {
        en: "4. Review and Signature",
        pt: "4. Revisão e Assinatura",
        es: "4. Revisión y Firma",
      },
      uploadsUnderReview: {
        en: "4. Documents Review",
        pt: "4. Revisão de Documentos",
        es: "4. Revisión de Documentos",
      },
      casvSchedulingPending: {
        en: "5. Scheduling Pending",
        pt: "5. Agendamento Pendente",
        es: "5. Programación Pendiente",
      },
      casvFeeProcessing: {
        en: "6. Fee in Processing",
        pt: "6. Taxa em Processamento",
        es: "6. Tarifa en Procesamiento",
      },
      casvPaymentPending: {
        en: "7. CASV Payment Pending",
        pt: "7. Pagamento CASV Pendente",
        es: "7. Pago CASV Pendiente",
      },
      awaitingInterview: {
        en: "8. Awaiting Interview",
        pt: "8. Aguardando Entrevista",
        es: "8. Esperando Entrevista",
      },
      approved: { en: "9. Approved", pt: "9. Aprovado", es: "9. Aprobado" },
      rejectedText: {
        en: "Process Denied",
        pt: "Processo Negado",
        es: "Proceso Denegado",
      },
      rejectedLabel: { en: "Rejected", pt: "Rejeitado", es: "Rechazado" },
      stepOf: {
        en: "Step [step] of [total]",
        pt: "Etapa [step] de [total]",
        es: "Paso [step] de [total]",
      },
    },
    myProcesses: {
      en: "My Processes",
      pt: "Meus Processos",
      es: "Mis Procesos",
    },
    trackStatus: {
      en: "Track the status of all your guides and applications.",
      pt: "Acompanhe o status de todos os seus guias e aplicações.",
      es: "Sigue el estado de todas tus guías y solicitudes.",
    },
    noActiveProcesses: {
      en: "You don't have any active processes yet.",
      pt: "Você ainda não possui processos ativos.",
      es: "Aún no tienes procesos activos.",
    },
    progress: { en: "Progress", pt: "Progresso", es: "Progreso" },
    accessDetails: {
      en: "ACCESS DETAILS",
      pt: "ACESSAR DETALHES",
      es: "ACCEDER DETALLES",
    },
  },

  // ──── Dashboard sidebar ────
  sidebar: {
    dashboard: { en: "Dashboard", pt: "Painel", es: "Panel" },
    onboarding: { en: "Onboarding", pt: "Onboarding", es: "Onboarding" },
    chatAI: { en: "AI Chat", pt: "Chat IA", es: "Chat IA" },
    documents: { en: "Documents", pt: "Documentos", es: "Documentos" },
    finalPackage: {
      en: "Final Package",
      pt: "Pacote Final",
      es: "Paquete Final",
    },
    help: { en: "Support", pt: "Suporte", es: "Soporte" },
    logout: { en: "Log out", pt: "Sair", es: "Salir" },
  },

  // ──── Onboarding ────
  onboardingPage: {
    title: { en: "Onboarding", pt: "Onboarding", es: "Onboarding" },
    subtitle: {
      en: "Fill in the information to build your final package.",
      pt: "Preencha as informações para montar seu pacote final.",
      es: "Completa la información para armar tu paquete final.",
    },
    stepOf: { en: "of", pt: "de", es: "de" },
    steps: {
      en: [
        "Personal data",
        "Travel history",
        "Process information",
        "Documents",
        "Final review",
      ],
      pt: [
        "Dados pessoais",
        "Histórico de viagens",
        "Informações do processo",
        "Documentos",
        "Revisão final",
      ],
      es: [
        "Datos personales",
        "Historial de viajes",
        "Información del proceso",
        "Documentos",
        "Revisión final",
      ],
    },
    previous: { en: "Previous", pt: "Anterior", es: "Anterior" },
    next: { en: "Next", pt: "Próximo", es: "Siguiente" },
    confirmGenerate: {
      en: "Confirm and generate package",
      pt: "Confirmar e gerar pacote",
      es: "Confirmar y generar paquete",
    },
    // Index specific texts
    errorOpeningDoc: {
      en: "Error opening document.",
      pt: "Erro ao abrir documento.",
      es: "Error al abrir documento.",
    },
    processing: {
      en: "Processing...",
      pt: "Processando...",
      es: "Procesando...",
    },
    submitDocs: {
      en: "Submit Documents",
      pt: "Enviar Documentos",
      es: "Enviar Documentos",
    },
    docsUnderReview: {
      en: "Analyzing your documents...",
      pt: "Analisando seus documentos...",
      es: "Analizando sus documentos...",
    },
    completed: { en: "Completed", pt: "Concluído", es: "Completado" },
    stepLabel: { en: "Step", pt: "Etapa", es: "Paso" },
    ds160Form: {
      en: "DS-160 Form",
      pt: "Formulário DS-160",
      es: "Formulario DS-160",
    },
    fillInfoToProceed: {
      en: "Fill in the requested information to proceed.",
      pt: "Preencha as informações solicitadas para prosseguir.",
      es: "Complete la información solicitada para continuar.",
    },
    viewMyDS160: {
      en: "VIEW MY DS-160",
      pt: "VISUALIZAR MINHA DS-160",
      es: "VER MI DS-160",
    },
    viewDocuments: {
      en: "VIEW DOCUMENTS",
      pt: "VISUALIZAR DOCUMENTOS",
      es: "VER DOCUMENTOS",
    },
    submittedDocs: {
      en: "Submitted Documents",
      pt: "Documentos Enviados",
      es: "Documentos Enviados",
    },
    viewSubmittedDocs: {
      en: "View the documents you have already submitted.",
      pt: "Visualize os documentos que você já enviou.",
      es: "Vea los documentos que ya ha enviado.",
    },
    noDocsFound: {
      en: "No documents found.",
      pt: "Nenhum documento encontrado.",
      es: "No se encontraron documentos.",
    },
    open: { en: "Open", pt: "Abrir", es: "Abrir" },
    identityVerification: {
      en: "Identity Verification Required",
      pt: "Verificação de Identidade Necessária",
      es: "Verificación de Identidad Requerida",
    },
    selfieInstructions: {
      en: "To proceed with your DS-160 application, you must upload a selfie holding your passport (open at the identification page).",
      pt: "Para prosseguir com sua solicitação de DS-160, você precisa realizar o upload de uma selfie segurando seu passaporte (aberto na página de identificação).",
      es: "Para continuar con su solicitud de DS-160, debe cargar una selfie sosteniendo su pasaporte (abierto en la página de identificación).",
    },
    remove: { en: "Remove", pt: "Remover", es: "Eliminar" },
    selectSelfie: {
      en: "Select your selfie",
      pt: "Selecione sua selfie",
      es: "Seleccione su selfie",
    },
    or: { en: "or", pt: "ou", es: "o" },
    uploading: { en: "Uploading...", pt: "Enviando...", es: "Enviando..." },
    uploadSelfie: {
      en: "Upload Selfie",
      pt: "Fazer Upload da Selfie",
      es: "Subir Selfie",
    },
    // Logic specific texts
    docUploaded: {
      en: "Document uploaded!",
      pt: "Documento enviado!",
      es: "¡Documento subido!",
    },
    removed: { en: "Removed!", pt: "Removido!", es: "¡Eliminado!" },
    errorRemovingDoc: {
      en: "Error removing document.",
      pt: "Erro ao remover documento.",
      es: "Error al eliminar el documento.",
    },
    internalErrorServiceId: {
      en: "Internal error. Could not save data (missing serviceId).",
      pt: "Erro interno. Não foi possível salvar os dados (serviceId ausente).",
      es: "Error interno. No se pudieron guardar los datos (falta serviceId).",
    },
    errorSavingStep: {
      en: "Error saving data for this step.",
      pt: "Erro ao salvar os dados desta etapa.",
      es: "Error al guardar los datos de este paso.",
    },
    missingDocs: {
      en: "Missing documents:",
      pt: "Faltam documentos:",
      es: "Faltan documentos:",
    },
    selfieUploaded: {
      en: "Selfie uploaded successfully!",
      pt: "Selfie enviada com sucesso!",
      es: "¡Selfie subida con éxito!",
    },
    errorUploadingSelfie: {
      en: "Error uploading selfie.",
      pt: "Erro ao enviar selfie.",
      es: "Error al subir la selfie.",
    },
    selectBothDocs: {
      en: "You must select both requested documents.",
      pt: "Você deve selecionar os 2 documentos solicitados.",
      es: "Debe seleccionar los 2 documentos solicitados.",
    },
    unexpectedError: {
      en: "Unexpected error.",
      pt: "Erro inesperado.",
      es: "Error inesperado.",
    },
    docsSubmitted: {
      en: "Documents submitted successfully!",
      pt: "Documentos enviados com sucesso!",
      es: "¡Documentos enviados con éxito!",
    },
    packageGenerated: {
      en: "Package generated successfully!",
      pt: "Pacote gerado com sucesso!",
      es: "¡Paquete generado con éxito!",
    },
    // Step specific texts
    photoAlreadyRegistered: {
      en: "Photo already registered!",
      pt: "Foto já registrada!",
      es: "¡Foto ya registrada!",
    },
    photoCollectedDesc: {
      en: "Your selfie with passport was already collected at the start of the process. No need to upload it again.",
      pt: "A sua selfie com passaporte já foi coletada no início do processo. Não é necessário enviar novamente.",
      es: "Su selfie con pasaporte ya fue obtenida al inicio del proceso. No es necesario enviarla de nuevo.",
    },
    uploadingBtn: { en: "Uploading...", pt: "Enviando...", es: "Subiendo..." },
    replaceBtn: { en: "Replace", pt: "Trocar", es: "Reemplazar" },
    removeBtn: { en: "Remove", pt: "Remover", es: "Eliminar" },
    reviewPendingMsg: {
      en: "Your form is already being processed by our team. You can review the information above, but you do not need to submit it again.",
      pt: "Seu formulário já está sendo processado pela nossa equipe. Você pode revisar as informações acima, mas não precisa enviar novamente.",
      es: "Su formulario ya está siendo procesado por nuestro equipo. Puede revisar la información anterior, pero no es necesario enviarlo de nuevo.",
    },
    reviewEndMsg: {
      en: "You have reached the end of the review! If everything is correct, click the main button to confirm and generate your package.",
      pt: "Você chegou ao fim da revisão! Se tudo estiver correto, clique no botão principal para confirmar e gerar seu pacote.",
      es: "¡Has llegado al final de la revisión! Si todo está correcto, haz clic en el botón principal para confirmar y generar tu paquete.",
    },
    // Step 0
    personalData: {
      en: "Personal data",
      pt: "Dados pessoais",
      es: "Datos personales",
    },
    fullName: { en: "Full name", pt: "Nome completo", es: "Nombre completo" },
    asInPassport: {
      en: "As shown on passport",
      pt: "Como consta no passaporte",
      es: "Como aparece en el pasaporte",
    },
    dob: {
      en: "Date of birth",
      pt: "Data de nascimento",
      es: "Fecha de nacimiento",
    },
    passportNumber: {
      en: "Passport number",
      pt: "Número do passaporte",
      es: "Número de pasaporte",
    },
    nationality: { en: "Nationality", pt: "Nacionalidade", es: "Nacionalidad" },
    currentAddress: {
      en: "Current address",
      pt: "Endereço atual",
      es: "Dirección actual",
    },
    fullAddress: {
      en: "Full address",
      pt: "Endereço completo",
      es: "Dirección completa",
    },
    // Step 1
    travelHistory: {
      en: "Travel history",
      pt: "Histórico de viagens",
      es: "Historial de viajes",
    },
    travelledBefore: {
      en: "Have you traveled to the US before?",
      pt: "Já viajou para os EUA antes?",
      es: "¿Has viajado a EE.UU. antes?",
    },
    hadVisa: {
      en: "Have you had a US visa?",
      pt: "Já teve visto americano?",
      es: "¿Has tenido visa americana?",
    },
    no: { en: "No", pt: "Não", es: "No" },
    yesApproved: {
      en: "Yes, approved",
      pt: "Sim, aprovado",
      es: "Sí, aprobada",
    },
    yesDenied: { en: "Yes, denied", pt: "Sim, negado", es: "Sí, negada" },
    yes: { en: "Yes", pt: "Sim", es: "Sí" },
    countriesVisited: {
      en: "Countries visited in the last 5 years",
      pt: "Países visitados nos últimos 5 anos",
      es: "Países visitados en los últimos 5 años",
    },
    countriesPlaceholder: {
      en: "e.g., Portugal, Argentina, Japan",
      pt: "Ex: Portugal, Argentina, Japão",
      es: "Ej: Portugal, Argentina, Japón",
    },
    // Step 2
    processInfo: {
      en: "Process information",
      pt: "Informações do processo",
      es: "Información del proceso",
    },
    travelPurpose: {
      en: "Purpose of travel",
      pt: "Motivo da viagem",
      es: "Motivo del viaje",
    },
    travelPurposePlaceholder: {
      en: "Tourism, business, family visit...",
      pt: "Turismo, negócios, visita familiar...",
      es: "Turismo, negocios, visita familiar...",
    },
    expectedDate: {
      en: "Expected travel date",
      pt: "Data prevista da viagem",
      es: "Fecha prevista del viaje",
    },
    expectedDuration: {
      en: "Expected duration",
      pt: "Duração prevista",
      es: "Duración prevista",
    },
    durationPlaceholder: {
      en: "e.g., 15 days",
      pt: "Ex: 15 dias",
      es: "Ej: 15 días",
    },
    consulateCity: {
      en: "Consulate city",
      pt: "Cidade do consulado",
      es: "Ciudad del consulado",
    },
    // Step 3
    documentsTitle: { en: "Documents", pt: "Documentos", es: "Documentos" },
    documentsDesc: {
      en: "Upload the required documents. Accepted: JPG, PNG (max. 10MB).",
      pt: "Faça upload dos documentos necessários. Aceitos: JPG, PNG (máx. 10MB).",
      es: "Sube los documentos necesarios. Aceptados: JPG, PNG (máx. 10MB).",
    },
    docPassport: {
      en: "Passport (main page)",
      pt: "Passaporte (página principal)",
      es: "Pasaporte (página principal)",
    },
    docPhoto: {
      en: "Photo (Selfie)",
      pt: "Foto (Selfie)",
      es: "Foto (Selfie)",
    },
    docFinancial: {
      en: "Financial proof",
      pt: "Comprovante financeiro",
      es: "Comprobante financiero",
    },
    docBond: {
      en: "Proof of ties",
      pt: "Comprovante de vínculo",
      es: "Comprobante de vínculo",
    },
    upload: { en: "Upload", pt: "Upload", es: "Subir" },
    // Step 4
    finalReview: {
      en: "Final Review",
      pt: "Revisão Final",
      es: "Revisión Final",
    },
    finalReviewDesc: {
      en: "Review your information before confirming the package generation.",
      pt: "Revise suas informações antes de confirmar a geração do pacote.",
      es: "Revisa tu información antes de confirmar la generación del paquete.",
    },
    fillPrevious: {
      en: "Complete previous steps to see the summary here.",
      pt: "Preencha as etapas anteriores para ver o resumo aqui.",
      es: "Completa los pasos anteriores para ver el resumen aquí.",
    },
    casvSchedulingTitle: {
      en: "CASV Scheduling",
      pt: "Agendamento CASV",
      es: "Agendamiento CASV",
    },
    casvSchedulingDesc: {
      en: "Select your preferred date for CASV and Consulate scheduling.",
      pt: "Selecione sua data de preferência para o agendamento no CASV e Consulado.",
      es: "Seleccione su fecha de preferencia para el agendamiento en el CASV e Consulado.",
    },
    casvSchedulingAlert: {
      en: "The final date and time will depend on Consulate availability. This is only an indication of your initial preference.",
      pt: "A data e horário final dependerão da disponibilidade do Consulado. Esta é apenas uma indicação de sua preferência inicial.",
      es: "La fecha y hora final dependerán de la disponibilidad del Consulado. Esta es solo una indicación de su preferencia inicial.",
    },
    officialAvailability: {
      en: "Check official availability",
      pt: "Confira as disponibilidades oficiais",
      es: "Check official availability",
    },
    preferenceCalendar: {
      en: "Preference Calendar",
      pt: "Calendário de Preferência",
      es: "Calendario de Preferencia",
    },
    selectDayFits: {
      en: "Select the day that best fits you.",
      pt: "Selecione o dia que melhor se encaixa para você.",
      es: "Seleccione el día que mejor se ajuste a usted.",
    },
    activitySummary: {
      en: "Activity Summary",
      pt: "Resumo da Atividade",
      es: "Resumen de la Actividad",
    },
    selectedDate: {
      en: "Selected Date",
      pt: "Data Selecionada",
      es: "Fecha Seleccionada",
    },
    none: { en: "None", pt: "Nenhuma", es: "Ninguna" },
    spotsClosest: {
      en: "We will look for spots closest to this date.",
      pt: "Iremos buscar as vagas mais próximas desta data.",
      es: "Buscaremos las plazas más cercanas a esta fecha.",
    },
    supportContactConfirm: {
      en: "Support will contact you to confirm the final schedule.",
      pt: "O suporte entrará em contato para confirmar o agendamento final.",
      es: "El soporte se pondrá en contacto para confirmar el agendamiento final.",
    },
    confirmPreference: {
      en: "Confirm Preference",
      pt: "Confirmar Preferência",
      es: "Confirmar Preferencia",
    },
    monitoringStartDesc: {
      en: "By confirming, our team will start the spot monitoring process in the consular systems.",
      pt: "Ao confirmar, nossa equipe iniciará o processo de monitoramento de vagas nos sistemas consulares.",
      es: "Al confirmar, nuestro equipo iniciará el proceso de monitoreo de plazas en los sistemas consulares.",
    },
    preferredDateSaved: {
      en: "Preferred date saved successfully!",
      pt: "Data preferencial salva com sucesso!",
      es: "¡Fecha preferencial guardada con éxito!",
    },
    errorSavingSchedule: {
      en: "Error saving schedule.",
      pt: "Erro ao salvar agendamento.",
      es: "Error al guardar el agendamiento.",
    },
    feeProcessing: {
      title: {
        en: "Fee Processing",
        pt: "Taxa em Processamento",
        es: "Procesamiento de Tasa",
      },
      desc: {
        en: "We are preparing the creation of your account on the official US consulate portal.",
        pt: "Estamos preparando a criação da sua conta no portal oficial do consulado americano.",
        es: "Estamos preparando la creación de su cuenta en el portal oficial del consulado estadounidense.",
      },
      nextStep: { en: "NEXT STEP", pt: "PRÓXIMA ETAPA", es: "Siguiente Paso" },
      consularAccountTitle: {
        en: "Consular Account Creation",
        pt: "Criação de Conta Consular",
        es: "Creación de Cuenta Consular",
      },
      consularAccountDesc: {
        en: "To continue with your visa, we will create your official access.",
        pt: "Para dar continuidade ao seu visto, criaremos seu acesso oficial.",
        es: "Para continuar con su visa, crearemos su acceso oficial.",
      },
      accountEmailTitle: {
        en: "Account with your Email",
        pt: "Conta com seu E-mail",
        es: "Cuenta con su Email",
      },
      accountEmailDesc: {
        en: "An account was created using your email. Please check your inbox.",
        pt: "Uma conta foi criada utilizando seu email. Por favor, verifique sua caixa de entrada.",
        es: "Se ha creado una cuenta con su correo electrónico. Por favor, revise su bandeja de entrada.",
      },
      watchEmailTitle: {
        en: "Watch your Email",
        pt: "Fique Atento ao E-mail",
        es: "Atento al Email",
      },
      // Carousel translation keys
      slide1Title: {
        en: "Your account is being created",
        pt: "Sua conta está sendo criada",
        es: "Su cuenta está siendo creada",
      },
      slide1Desc: {
        en: "Our team is registering you on the official consulate portal to generate the MRV fee payment slip.",
        pt: "Nossa equipe está realizando seu cadastro no portal oficial do consulado para gerar o boleto de pagamento da taxa MRV.",
        es: "Nuestro equipo lo está registrando en el portal oficial del consulado para generar el recibo de pago de la tarifa MRV.",
      },
      slide2Title: {
        en: "Temporary password",
        pt: "Senha temporária",
        es: "Contraseña temporal",
      },
      slide2Desc: {
        en: "You will receive an email with a temporary password. You can change it later if you want.",
        pt: "Você receberá um e-mail com uma senha provisória. Você poderá alterá-la depois se quiser.",
        es: "Recibirá un correo electrónico con una contraseña provisional. Podrá cambiarla después si lo desea.",
      },
      slide3Title: {
        en: "MRV Fee Payment",
        pt: "Pagamento da Taxa MRV",
        es: "Pago de la Tarifa MRV",
      },
      slide3Desc: {
        en: "Once the account is created, you will have access to the payment slip. This fee is mandatory for the US visa.",
        pt: "Assim que a conta for criada, você terá acesso ao boleto de pagamento. Essa taxa é obrigatória para o visto americano.",
        es: "Una vez creada la cuenta, tendrá acceso al recibo de pago. Esta tarifa es obligatoria para la visa estadounidense.",
      },
      slide4Title: {
        en: "Stay tuned to your email",
        pt: "Fique atento ao seu e-mail",
        es: "Esté atento a su correo electrónico",
      },
      slide4Desc: {
        en: "If you have already received the confirmation email and the payment slip, click the button below to continue.",
        pt: "Se você já recebeu o e-mail de confirmação e o boleto, clique no botão abaixo para prosseguir.",
        es: "Si ya recibió el correo electrónico de confirmación y el recibo de pago, haga clic en el botón de abajo para continuar.",
      },
      watchEmailDesc: {
        en: "Stay tuned to your inbox and spam folder to confirm your email by clicking the link once it arrives.",
        pt: "Fique atento à sua caixa de entrada e spam para confirmar o email clicando no link assim que ele chegar.",
        es: "Esté atento a su bandeja de entrada y carpeta de spam para confirmar su correo electrónico haciendo clic en el enlace una vez que llegue.",
      },
      alreadyConfirmedEmail: {
        en: "I'VE ALREADY CONFIRMED THE EMAIL",
        pt: "JÁ CONFIRMEI O EMAIL",
        es: "Ya He Confirmado el Email",
      },
      securityPriority: {
        en: "Data security is our top priority.",
        pt: "A segurança dos seus dados é nossa prioridade total.",
        es: "La seguridad de sus datos es nuestra prioridad absoluta.",
      },
      creatingCredentialsTitle: {
        en: "Creating your credentials...",
        pt: "Criando suas credenciais...",
        es: "Creando sus credenciales...",
      },
      creatingCredentialsDesc: {
        en: "Our team is setting up your access in the consular system. This should be quick.",
        pt: "Nossa equipe está configurando seu acesso no sistema consular. Isso costuma ser rápido.",
        es: "Nuestro equipo está configurando su acceso en el sistema consular. Debería ser rápido.",
      },
      successMsg: {
        en: "Great! Now let's proceed to payment.",
        pt: "Ótimo! Agora vamos para o pagamento.",
        es: "¡Genial! Ahora procedamos al pago.",
      },
      errorUpdatingStatus: {
        en: "Error updating status.",
        pt: "Erro ao atualizar status.",
        es: "Error al actualizar el estado.",
      },
    },
    processingStatus: {
      processingDS160: {
        en: "Processing DS-160",
        pt: "Processando DS-160",
        es: "Procesando DS-160",
      },
      awaitingReview: {
        en: "Awaiting Review",
        pt: "Aguardando Revisão",
        es: "Esperando Revisión",
      },
      reviewingDocs: {
        en: "Reviewing Documents",
        pt: "Revisando Documentos",
        es: "Revisando Documentos",
      },
      awaitingScheduling: {
        en: "Awaiting Scheduling",
        pt: "Aguardando Agendamento",
        es: "Esperando Agendamiento",
      },
      awaitingUpload: {
        en: "Awaiting Upload",
        pt: "Aguardando Upload",
        es: "Esperando Carga",
      },
      processingDataTitle: {
        en: "Processing your data",
        pt: "Processando seus dados",
        es: "Procesando sus datos",
      },
      processingDataDesc: {
        en: "Our specialists are reviewing your information and preparing the official DS-160 form.",
        pt: "Nossos especialistas estão revisando suas informações e preparando o formulário DS-160 oficial.",
        es: "Nuestros especialistas están revisando su información y preparando el formulario DS-160 oficial.",
      },
      documentsReceivedTitle: {
        en: "Documents Received",
        pt: "Documentos Recebidos",
        es: "Documentos Recibidos",
      },
      documentsReceivedDesc: {
        en: "Excellent! Your documents have been received and are being analyzed by our team.",
        pt: "Excelente! Seus documentos foram recebidos e estão sendo analisados pela nossa equipe.",
        es: "¡Excelente! Sus documentos han sido recibidos y están siendo analizados por nuestro equipo.",
      },
      currentStatus: {
        en: "Current Status",
        pt: "Status Atual",
        es: "Estado Actual",
      },
      trackProgress: {
        en: "You can track the progress of your application on this screen.",
        pt: "Você pode acompanhar o andamento da sua solicitação por esta tela.",
        es: "Puede hacer un seguimiento del progreso de su solicitud en esta pantalla.",
      },
      contactExtraData: {
        en: "We will contact you if we need any extra information.",
        pt: "Entraremos em contato caso precisemos de algum dado extra.",
        es: "Nos pondremos en contacto con usted si necesitamos información adicional.",
      },
      thankYou: {
        en: "Thank you for trusting our services!",
        pt: "Obrigado por confiar em nossos serviços!",
        es: "¡Gracias por confiar en nuestros servicios!",
      },
    },
    reviewAndSign: {
      tutorialTitle: {
        en: "How to sign your DS-160",
        pt: "Como assinar sua DS-160",
        es: "Cómo firmar su DS-160",
      },
      tutorialSubtitle: {
        en: "Follow the steps below to correctly download, sign, and upload your DS-160 form.",
        pt: "Siga os passos abaixo para baixar, assinar e enviar o seu formulário DS-160 corretamente.",
        es: "Siga los pasos a continuación para descargar, firmar y enviar su formulario DS-160 correctamente.",
      },
      stepLabel: { en: "Step", pt: "Passo", es: "Paso" },
      of: { en: "of", pt: "de", es: "de" },
      previous: { en: "Previous", pt: "Anterior", es: "Anterior" },
      nextStep: { en: "Next Step", pt: "Próximo Passo", es: "Siguiente Paso" },
      tutorialSteps: [
        {
          title: {
            en: "Retrieve Your Application",
            pt: "Recupere sua Aplicação",
            es: "Recupere su Solicitud",
          },
          desc: {
            en: "Fill in the information. Select the application location and enter your Application ID and the code provided. Then enter the first 5 letters of your last name, your year of birth, and your mother's mother's name, and click on 'Retrieve an Application'.",
            pt: "Preencha as informações. Selecione o local da aplicação e informe sua Application ID e o código informado. Depois coloque as primeiras 5 letras do seu sobrenome, o ano de nascimento e o nome da mãe da sua mãe, e clique em 'Retrieve an Application'.",
            es: "Complete la información. Seleccione el lugar de la solicitud e ingrese su Application ID y el código proporcionado. Luego escriba las primeras 5 letras de su apellido, su año de nacimiento y el nombre de la madre de su madre, y haga clic en 'Retrieve an Application'.",
          },
        },
        {
          title: {
            en: "Review, Print and Sign",
            pt: "Revise, Imprima e Assine",
            es: "Revise, Imprima y Firme",
          },
          desc: {
            en: "On the left side you can review all the information you have filled in. After confirming your data, enter your passport information and click on 'Sign and Submit Application' to sign.",
            pt: "Na lateral esquerda você poderá confirmar todos os dados que preencheu. Após revisar suas informações, preencha com os dados do seu passaporte e clique em 'Sign and Submit Application' para assinar.",
            es: "En el lado izquierdo podrá confirmar todos los datos que ha completado. Después de revisar su información, ingrese los datos de su pasaporte y haga clic en 'Sign and Submit Application' para firmar.",
          },
        },
        {
          title: {
            en: "Sign and Download",
            pt: "Assine e Faça o Download",
            es: "Firme y Descargue",
          },
          desc: {
            en: "Click on 'Next: Confirmation', then download both 'Print Confirmation' and 'Print Application'.",
            pt: "Clique em 'Next: Confirmation' e depois realize o download de 'Print Confirmation' e 'Print Application'.",
            es: "Haga clic en 'Next: Confirmation' y luego descargue 'Print Confirmation' y 'Print Application'.",
          },
        },
        {
          title: {
            en: "Upload the File",
            pt: "Faça o Upload do Arquivo",
            es: "Suba el Archivo",
          },
          desc: {
            en: "Upload the file below to finalize the step.",
            pt: "Envie o arquivo aqui abaixo para finalizar a etapa.",
            es: "Suba el archivo aquí abajo para finalizar el paso.",
          },
        },
      ],
      securityDataTitle: {
        en: "Your Security Data",
        pt: "Seus Dados de Segurança",
        es: "Sus Datos de Seguridad",
      },
      securityDataSubtitle: {
        en: "Use these details to access the consular system if necessary.",
        pt: "Utilize estes dados para acessar o sistema consular caso necessário.",
        es: "Utilice estos datos para acceder al sistema consular si es necesario.",
      },
      birthDate: { en: "Birth Date", pt: "Data de Nasc.", es: "Fecha de Nac." },
      grandmaName: {
        en: "Grandma's Name",
        pt: "Nome da Avó",
        es: "Nombre de la Abuela",
      },
      copied: { en: "Copied!", pt: "Copiado!", es: "¡Copiado!" },
      documentUploadTitle: {
        en: "Required Documents",
        pt: "Documentos Obrigatórios",
        es: "Documentos Requeridos",
      },
      remove: { en: "Remove", pt: "Remover", es: "Eliminar" },
      uploading: { en: "Uploading...", pt: "Enviando...", es: "Enviando..." },
      uploadFile: {
        en: "Upload File",
        pt: "Enviar Arquivo",
        es: "Subir Archivo",
      },
      requiredDocs: {
        ds160_assinada: {
          title: {
            en: "Signed DS-160",
            pt: "DS-160 Assinada",
            es: "DS-160 Firmada",
          },
          description: {
            en: "The printed, signed and scanned PDF document.",
            pt: "O documento PDF impresso, assinado e digitalizado.",
            es: "El documento PDF impreso, firmado y escaneado.",
          },
        },
        ds160_comprovante: {
          title: {
            en: "Payment Receipt",
            pt: "Comprovante da Taxa MRV",
            es: "Comprobante de Pago MRV",
          },
          description: {
            en: "The receipt of payment of the consular fee.",
            pt: "O boleto ou comprovante de pagamento da taxa consular.",
            es: "El comprobante de pago de la tarifa consular.",
          },
        },
        ds160_comprovante_sevis: {
          title: {
            en: "DS-160 Confirmation Page",
            pt: "Comprovante de Envio da DS-160",
            es: "Página de Confirmación DS-160",
          },
          description: {
            en: "The DS-160 confirmation page showing the application was successfully submitted.",
            pt: "A página de confirmação mostrando que a DS-160 foi enviada com sucesso.",
            es: "La página de confirmación que muestra que la DS-160 fue enviada correctamente.",
          },
        },
      },
    },
    interviewGuide: {
      title: {
        en: "Interview Guide",
        pt: "Guia de Entrevista",
        es: "Guía de Entrevista",
      },
      subtitle: {
        en: "Master the visa interview",
        pt: "Domine a entrevista para o visto",
        es: "Domina la entrevista para la visa",
      },
      back: { en: "Back", pt: "Voltar", es: "Volver" },
      finalTipTitle: { en: "Final Tip", pt: "Dica Final", es: "Consejo Final" },
      finalTipDesc: {
        en: "Be calm and honest.",
        pt: "Mantenha a calma e seja honesto(a).",
        es: "Mantén la calma y sé honesto(a).",
      },
      sections: {
        checklist: {
          title: {
            en: "1. Documents Checklist",
            pt: "1. Checklist de Documentos",
            es: "1. Lista de Documentos",
          },
          content: {
            en: "Make sure to bring the following printed items:\n• Valid current passport (and previous ones if they have visas)\n• DS-160 confirmation page (with barcode)\n• Appointment confirmation (Instructions Page)\n• Recent 5x5 photo (if requested at CASV)\n• Supporting documents (Tax returns, bank statements, payslips, ties)",
            pt: "Certifique-se de levar os seguintes itens impressos:\n• Passaporte atual válido (e anteriores se houver visto)\n• Página de confirmação da DS-160 (com código de barras)\n• Comprovante do agendamento (Página de Instruções)\n• Foto 5x5 recente (caso solicitado no CASV)\n• Documentos de suporte (IR, extratos, holerites, vínculos)",
            es: "Asegúrese de llevar los siguientes artículos impresos:\n• Pasaporte actual válido (y anteriores si tienen visas)\n• Página de confirmación de la DS-160 (con código de barras)\n• Confirmación de la cita (Página de Instrucciones)\n• Foto 5x5 reciente (si se solicita en el CASV)\n• Documentos de respaldo (Declaraciones de impuestos, extractos bancarios, nóminas, vínculos)",
          },
        },
        behavior: {
          title: {
            en: "2. Behavior and Posture",
            pt: "2. Comportamento e Postura",
            es: "2. Comportamiento y Postura",
          },
          content: {
            en: "First impressions matter a lot:\n• Dress casual-smart (avoid flashy clothes)\n• Be honest and direct in your answers\n• Maintain eye contact with the officer\n• Answer only what is asked\n• Speak slowly and clearly",
            pt: "A primeira impressão conta muito:\n• Vista-se de forma casual-fina (evite roupas chamativas)\n• Seja honesto e direto nas respostas\n• Mantenha o contato visual com o oficial\n• Responda apenas o que lhe for perguntado\n• Fale pausadamente e com clareza",
            es: "La primera impresión cuenta mucho:\n• Vístase de forma casual-elegante (evite ropa llamativa)\n• Sea honesto y directo en sus respuestas\n• Mantenga el contacto visual con el oficial\n• Responda solo lo que se le pregunte\n• Hable despacio y con claridad",
          },
        },
        commonQuestions: {
          title: {
            en: "3. Common Questions",
            pt: "3. Perguntas Frequentes",
            es: "3. Preguntas Frecuentes",
          },
          content: {
            en: "Prepare for these classic questions:\n• 'What is the purpose of your trip?'\n• 'Where are you going and how long will you stay?'\n• 'Who will pay for the trip costs?'\n• 'What do you do in Brazil?' (Your job/business)\n• 'Do you have relatives in the United States?'",
            pt: "Prepare-se para estas perguntas clássicas:\n• 'Qual o propósito da sua viagem?'\n• 'Para onde você vai e quanto tempo ficará?'\n• 'Quem pagará pelos custos da viagem?'\n• 'O que você faz no Brasil?' (Seu trabalho/empresa)\n• 'Você tem parentes nos Estados Unidos?'",
            es: "Prepárese para estas preguntas clásicas:\n• '¿Cuál es el propósito de su viaje?'\n• '¿A dónde va y cuánto tiempo se quedará?'\n• '¿Quién pagará los costos del viaje?'\n• '¿Qué hace en su país?' (Su trabajo/empresa)\n• '¿Tiene parientes en los Estados Unidos?'",
          },
        },
        notToDo: {
          title: {
            en: "4. What NOT to do",
            pt: "4. O que NÃO fazer",
            es: "4. Qué NO hacer",
          },
          content: {
            en: "Avoid these common mistakes:\n• DO NOT hand over documents before being requested\n• DO NOT give long answers or tell irrelevant stories\n• DO NOT use your cell phone inside the consulate (prohibited)\n• DO NOT try to memorize answers (be natural)\n• DO NOT panic if the officer is serious",
            pt: "Evite estes erros comuns:\n• NÃO entregue documentos antes de serem solicitados\n• NÃO dê respostas longas ou conte histórias irrelevantes\n• NÃO use o celular dentro do consulado (é proibido)\n• NÃO tente decorar respostas (seja natural)\n• NÃO entre em pânico se o oficial for sério",
            es: "Evite estos errores comunes:\n• NO entregue documentos antes de que se los pidan\n• NO dé respuestas largas ni cuente historias irrelevantes\n• NO use el teléfono celular dentro del consulado (está prohibido)\n• NO intente memorizar las respuestas (sea natural)\n• NO se asuste si el oficial es serio",
          },
        },
      },
    },
    specialistTraining: {
      mentoringTitle: {
        en: "Specialist Mentoring",
        pt: "Mentoria com Especialista",
        es: "Mentoría con Especialista",
      },
      mentoringSubtitle: {
        en: "Personalized preparation for your case",
        pt: "Preparação personalizada para o seu caso",
        es: "Preparación personalizada para tu caso",
      },
      topicsTitle: {
        en: "What we'll cover:",
        pt: "O que iremos abordar:",
        es: "Lo que cubriremos:",
      },
      topic1: {
        en: "DS-160 analysis",
        pt: "Análise da DS-160",
        es: "Análisis de la DS-160",
      },
      topic2: {
        en: "Common questions",
        pt: "Perguntas comuns",
        es: "Preguntas comunes",
      },
      topic3: {
        en: "Evidence review",
        pt: "Revisão de evidências",
        es: "Revisión de evidencias",
      },
      packageSuccess: {
        en: "Training package activated!",
        pt: "Pacote de treinamento ativado!",
        es: "¡Paquete de entrenamiento activado!",
      },
      scheduleNow: {
        en: "Schedule Now",
        pt: "Agendar Agora",
        es: "Agendar Ahora",
      },
      notAvailable: {
        en: "Scheduling not available.",
        pt: "Agendamento não disponível.",
        es: "Agendamiento no disponible.",
      },
      individual: {
        en: "Individual Session",
        pt: "Sessão Individual",
        es: "Sesión Individual",
      },
      trainingSession: {
        en: "1 Training Session",
        pt: "1 Aula de Treinamento",
        es: "1 Sesión de Entrenamiento",
      },
      mentoring45: {
        en: "45 min mentoring",
        pt: "45 min de mentoria",
        es: "45 min de mentoría",
      },
      interviewSim: {
        en: "Interview simulation",
        pt: "Simulado de perguntas",
        es: "Simulacro de entrevista",
      },
      immediateFeedback: {
        en: "Immediate feedback",
        pt: "Feedback imediato",
        es: "Comentarios inmediatos",
      },
      bronzePackage: {
        en: "Bronze Package",
        pt: "Pacote Bronze",
        es: "Paquete Bronce",
      },
      sessions2Training: {
        en: "2 Training Sessions",
        pt: "2 Aulas de Treinamento",
        es: "2 Sesiones de Entrenamiento",
      },
      mentoring2x45: {
        en: "2x 45 min mentoring",
        pt: "2x 45 min de mentoria",
        es: "2x 45 min de mentoría",
      },
      deepProfileAnalysis: {
        en: "Deep profile analysis",
        pt: "Análise profunda de perfil",
        es: "Análisis profundo de perfil",
      },
      advancedSim: {
        en: "Advanced simulation",
        pt: "Simulado avançado",
        es: "Simulacro avanzado",
      },
      whatsappSupport: {
        en: "WhatsApp support",
        pt: "Suporte via WhatsApp",
        es: "Soporte vía WhatsApp",
      },
      goldPackage: { en: "Gold Package", pt: "Pacote Gold", es: "Paquete Oro" },
      sessions3Training: {
        en: "3 Training Sessions",
        pt: "3 Aulas de Treinamento",
        es: "3 Sesiones de Entrenamiento",
      },
      mentoring3x45: {
        en: "3x 45 min mentoring",
        pt: "3x 45 min de mentoria",
        es: "3x 45 min de mentoría",
      },
      fullPreparation: {
        en: "Full Preparation",
        pt: "Preparação Completa",
        es: "Preparación Completa",
      },
      responseStrategy: {
        en: "Response Strategy",
        pt: "Estratégia de Resposta",
        es: "Estrategia de Respuesta",
      },
      documentReview: {
        en: "Document Review",
        pt: "Revisão de Documentos",
        es: "Revisión de Documentos",
      },
      vipSupport: { en: "VIP Support", pt: "Suporte VIP", es: "Soporte VIP" },
      reviewTopic: {
        en: "Refusal Analysis",
        pt: "Análise de Recusa",
        es: "Análisis de Rechazo",
      },
      reviewDescShort: {
        en: "Refusal analysis and action plan",
        pt: "Análise da recusa e plano de ação",
        es: "Análisis del rechazo y plan de acción",
      },
      detailedRefusalAnalysis: {
        en: "Detailed refusal analysis",
        pt: "Análise detalhada da recusa",
        es: "Análisis detallado del rechazo",
      },
      specialistMentoring45: {
        en: "45 min with specialist",
        pt: "45 min com especialista",
        es: "45 min con especialista",
      },
      customActionPlan: {
        en: "Custom action plan",
        pt: "Plano de ação personalizado",
        es: "Plan de acción personalizado",
      },
      nextStepsGuidance: {
        en: "Next steps guidance",
        pt: "Orientação para próximos passos",
        es: "Orientación para los próximos pasos",
      },
      paymentProcessed: {
        en: "Payment processed successfully!",
        pt: "Pagamento processado com sucesso!",
        es: "¡Pago procesado con éxito!",
      },
      sessionScheduledToast: {
        en: "Session scheduled successfully!",
        pt: "Sessão agendada com sucesso!",
        es: "¡Sesión programada con éxito!",
      },
      errorStartingPayment: {
        en: "Error starting payment.",
        pt: "Erro ao iniciar pagamento.",
        es: "Error al iniciar el pago.",
      },
      successTitle: {
        en: "Package Activated!",
        pt: "Pacote Ativado!",
        es: "¡Paquete Activado!",
      },
      purchasedPkg: {
        en: "You purchased: {name} ({classes} sessions)",
        pt: "Você adquiriu: {name} ({classes} aulas)",
        es: "Has adquirido: {name} ({classes} sesiones)",
      },
      sessionsScheduled: {
        en: "{count} of {total} sessions scheduled",
        pt: "{count} de {total} aulas agendadas",
        es: "{count} de {total} sesiones programadas",
      },
      allScheduled: {
        en: "All sessions scheduled!",
        pt: "Todas as aulas agendadas!",
        es: "¡Todas las sesiones programadas!",
      },
      checkEmail: {
        en: "Check your email for confirmation and links.",
        pt: "Verifique seu e-mail para confirmação e links.",
        es: "Revise su correo electrónico para confirmación y enlaces.",
      },
      mobileAccuracy: {
        en: "For better accuracy, please open Calendly on a desktop or in a new tab.",
        pt: "Para melhor precisão, abra o Calendly em um computador ou em uma nova aba.",
        es: "Para mayor precisión, abra Calendly en una computadora o en una nueva pestaña.",
      },
      backToDashboard: {
        en: "Back to Dashboard",
        pt: "Voltar para o Painel",
        es: "Volver al Panel",
      },
      mentoringTopic: {
        en: "Mentoring with Specialist",
        pt: "Mentoria com Especialista",
        es: "Mentoría con Especialista",
      },
      mentoringDesc: {
        en: "Choose the package that best fits your preparation needs.",
        pt: "Escolha o pacote que melhor se adapta às suas necessidades de preparação.",
        es: "Elija el paquete que mejor se adapte a sus necesidades de preparación.",
      },
      reviewDesc: {
        en: "Understand why your visa was refused and how to fix it.",
        pt: "Entenda por que seu visto foi negado e como corrigir isso.",
        es: "Entienda por qué su visa fue rechazada y cómo corregirlo.",
      },
      mostPopular: {
        en: "Most Popular",
        pt: "Mais Popular",
        es: "Más Popular",
      },
      perSession: { en: "per session", pt: "por sessão", es: "por sesión" },
      total: { en: "total", pt: "total", es: "total" },
      chooseThis: {
        en: "Choose This Package",
        pt: "Escolher este Pacote",
        es: "Elegir este Paquete",
      },
      securePayment: {
        en: "Secure Payment via Stripe",
        pt: "Pagamento Seguro via Stripe",
        es: "Pago Seguro vía Stripe",
      },
    },
    aiInterviewChat: {
      practiceTitle: {
        en: "AI Interview Practice",
        pt: "Treino de Entrevista com IA",
        es: "Práctica de Entrevista con IA",
      },
      practiceSubtitle: {
        en: "Practice your answers anytime",
        pt: "Treine suas respostas a qualquer momento",
        es: "Practica tus respuestas en cualquier momento",
      },
      placeholder: {
        en: "Type your answer...",
        pt: "Digite sua resposta...",
        es: "Escriba su respuesta...",
      },
      restart: {
        en: "Restart Simulation",
        pt: "Reiniciar Simulado",
        es: "Reiniciar Simulacro",
      },
      initialMessage: {
        en: "Hello! I'm your AI interviewer. Shall we start?",
        pt: "Olá! Sou seu entrevistador IA. Vamos começar?",
        es: "¡Hola! Soy su entrevistador IA. ¿Empezamos?",
      },
      errorMessage: {
        en: "I'm sorry, I'm having trouble connecting right now.",
        pt: "Desculpe, estou com problemas de conexão no momento.",
        es: "Lo siento, tengo problemas de conexión en este momento.",
      },
      errorConnecting: {
        en: "Error connecting to AI.",
        pt: "Erro ao conectar com a IA.",
        es: "Error al conectar con la IA.",
      },
      leaveTraining: {
        en: "Leave Training",
        pt: "Sair do Treino",
        es: "Salir del Entrenamiento",
      },
      typeHere: {
        en: "Type your answer here...",
        pt: "Digite sua resposta aqui...",
        es: "Escriba su respuesta aquí...",
      },
      trainingRestarted: {
        en: "Training restarted!",
        pt: "Treino reiniciado!",
        es: "¡Entrenamiento reiniciado!",
      },
      aiSimulated: {
        en: "AI Simulated Interview",
        pt: "Entrevista Simulada por IA",
        es: "Entrevista Simulada por IA",
      },
      onlineReady: {
        en: "Online & Ready",
        pt: "Online e Pronto",
        es: "En línea y listo",
      },
    },
    notifications: {
      reviewTitle: {
        en: "Review: {name}",
        pt: "Revisão: {name}",
        es: "Revisión: {name}",
      },
      reviewMessage: {
        en: "Customer finished DS-160 and awaits review.",
        pt: "O cliente finalizou o formulário DS-160 e aguarda revisão.",
        es: "El cliente finalizó el formulario DS-160 y espera revisión.",
      },
      docsTitle: { en: "Docs: {name}", pt: "Docs: {name}", es: "Docs: {name}" },
      docsMessage: {
        en: "Customer attached new documents for analysis.",
        pt: "O cliente anexou novos documentos para análise.",
        es: "El cliente adjuntó nuevos documentos para análisis.",
      },
      scheduleTitle: {
        en: "Schedule: {name}",
        pt: "Agenda: {name}",
        es: "Agenda: {name}",
      },
      scheduleMessage: {
        en: "Customer informed scheduling preferences.",
        pt: "O cliente informou as preferências de agendamento.",
        es: "El cliente informó las preferencias de agendamiento.",
      },
      actionDocsTitle: {
        en: "Action Required: Documents",
        pt: "Ação Necessária: Documentos",
        es: "Acción Necesaria: Documentos",
      },
      actionDocsMessage: {
        en: "Documents are missing. Upload them now.",
        pt: "Identificamos que faltam documentos. Faça o upload agora para analisarmos seu processo.",
        es: "Identificamos que faltan documentos. Cargue ahora para analizar su proceso.",
      },
      actionScheduleTitle: {
        en: "Action Required: Scheduling",
        pt: "Ação Necessária: Agendamento",
        es: "Acción Necesaria: Agendamiento",
      },
      actionScheduleMessage: {
        en: "Please inform your date and location preferences.",
        pt: "Por favor, informe suas preferências de data e local para prosseguirmos com o agendamento.",
        es: "Por favor, informe sus preferencias de fecha y lugar para continuar con el agendamiento.",
      },
      actionFeeTitle: {
        en: "Action Required: Consular Fee",
        pt: "Ação Necessária: Taxa Consular",
        es: "Acción Necesaria: Tasa Consular",
      },
      actionFeeMessage: {
        en: "Pay your consular fee to proceed.",
        pt: "Pague sua taxa consular e acesse suas credenciais para agendarmos sua entrevista.",
        es: "Pague su tasa consular y acceda a sus credenciales para agendar su entrevista.",
      },
      actionInterviewTitle: {
        en: "Action Required: Interview",
        pt: "Ação Necessária: Entrevista",
        es: "Acción Necesaria: Entrevista",
      },
      actionInterviewMessage: {
        en: "Prepare for your interview: review guidelines.",
        pt: "Prepare-se para a entrevista: revise as orientações e leve os documentos físicos necessários.",
        es: "Prepárese para la entrevista: revise las pautas y lleve los documentos físicos necesarios.",
      },
      actionPendingTitle: {
        en: "Action Required: Pending Issues",
        pt: "Ação Necessária: Pendências",
        es: "Acción Necesaria: Pendientes",
      },
      actionPendingMessage: {
        en: "Issue found. Fix pending items to continue.",
        pt: "Houve um problema com sua solicitação. Corrija as pendências indicadas para continuarmos o processo.",
        es: "Hubo un problema con su solicitud. Corrija los pendientes indicados para continuar el proceso.",
      },
    },
    paymentPending: {
      title: {
        en: "CONSULAR FEE PAYMENT",
        pt: "PAGAMENTO DA TAXA CONSULAR",
        es: "PAGO DE LA TASA CONSULAR",
      },
      desc: {
        en: "Select the desired payment method to proceed with scheduling.",
        pt: "Selecione a forma de pagamento desejada para prosseguir com o agendamento.",
        es: "Seleccione el método de pago deseado para continuar con el agendamiento.",
      },
      loadingInfo: {
        en: "Loading information...",
        pt: "Carregando informações...",
        es: "Cargando información...",
      },
      feeInProcessing: {
        en: "FEE IN PROCESSING",
        pt: "TAXA EM PROCESSAMENTO",
        es: "Tasa en Procesamiento",
      },
      excellentEmailReceived: {
        en: "Excellent! Your email confirmation has been received. Now our team is generating your slip for the MRV fee payment.",
        pt: "Excelente! Sua confirmação de e-mail foi recebida. Agora nossa equipe está gerando o seu boleto para pagamento da taxa MRV.",
        es: "¡Excelente! Su confirmación de correo electrónico ha sido recibida. Ahora nuestro equipo está generando su boleto para el pago de la tasa MRV.",
      },
      generatingSlip: {
        en: "Generating Slip...",
        pt: "Gerando Boleto...",
        es: "Generando Boleto...",
      },
      processMinutes: {
        en: "This process usually takes a few minutes. Once ready, the payment options will appear here.",
        pt: "Este processo geralmente leva alguns minutos. Assim que estiver pronto, as opções de pagamento aparecerão aqui.",
        es: "Este proceso suele durar unos minutos. Una vez listo, las opciones de pago aparecerán aquí.",
      },
      refreshStatus: {
        en: "REFRESH STATUS",
        pt: "ATUALIZAR STATUS",
        es: "Actualizar Estado",
      },
      slipDetails: {
        en: "SLIP DETAILS",
        pt: "DETALHES DO BOLETO",
        es: "Detalles del Boleto",
      },
      cardDetails: {
        en: "CARD DETAILS",
        pt: "DETALHES DO CARTÃO",
        es: "Detalles de la Tarjeta",
      },
      bankSlip: {
        en: "Bank Slip",
        pt: "Boleto Bancário",
        es: "Boleto Bancario",
      },
      payAnyBank: {
        en: "Pay at any bank or convenience store.",
        pt: "Pague em qualquer banco ou casa lotérica.",
        es: "Pague en cualquier banco o casa de lotería.",
      },
      creditCard: {
        en: "Credit Card",
        pt: "Cartão de Crédito",
        es: "Tarjeta de Crédito",
      },
      immediatePayment: {
        en: "Immediate payment via consulate portal.",
        pt: "Pagamento imediato via portal do consulado.",
        es: "Pago inmediato a través del portal del consulado.",
      },
      slide1Title: {
        en: "Access the Portal",
        pt: "Acesse o Portal",
        es: "Acceda al Portal",
      },
      slide1Desc: {
        en: "Click the button below to access the official consulate portal and log in using the credentials provided here.",
        pt: "Clique no botão abaixo para acessar o portal oficial do consulado e faça login usando as credenciais fornecidas aqui.",
        es: "Haga clic en el botón de abajo para acceder al portal oficial del consulado e inicie sesión usando las credenciales proporcionadas aquí.",
      },
      slide2Title: {
        en: "Navigate to Payment",
        pt: "Navegue para o Pagamento",
        es: "Navegue al Pago",
      },
      slide2Desc: {
        en: "In the portal, locate the 'Pay Visa Fee' button to proceed with your application and reach the payment section.",
        pt: "No portal, localize o botão 'Pagar taxa de visto' para prosseguir com sua solicitação e chegar à seção de pagamento.",
        es: "En el portal, busque el botón 'Pagar tasa de visa' para continuar con su solicitud y llegar a la sección de pago.",
      },
      slide3Title: {
        en: "Select Credit Card",
        pt: "Selecione Cartão de Crédito",
        es: "Seleccione Tarjeta de Crédito",
      },
      slide3Desc: {
        en: "Choose the 'Credit Card' option as the payment method to pay the MRV fee instantly.",
        pt: "Escolha a opção 'Cartão de Crédito' como forma de pagamento para pagar a taxa MRV instantaneamente.",
        es: "Elija la opción 'Tarjeta de Crédito' como método de pago para pagar la tarifa MRV al instante.",
      },
      slide4Title: {
        en: "Confirm Payment",
        pt: "Confirme o Pagamento",
        es: "Confirme el Pago",
      },
      slide4Desc: {
        en: "After successfully paying, return here and click 'I've already paid the fee' to continue scheduling your interview.",
        pt: "Após pagar com sucesso, retorne aqui e clique em 'Já paguei a taxa' para continuar agendando sua entrevista.",
        es: "Después de pagar con éxito, regrese aquí y haga clic en 'Ya pagué la tarifa' para continuar programando su entrevista.",
      },
      downloadPdfSlip: {
        en: "Download PDF Slip",
        pt: "Baixar Boleto PDF",
        es: "Descargar Boleto PDF",
      },
      officialSlipAvailable: {
        en: "The official slip is now available.",
        pt: "O boleto oficial já está disponível.",
        es: "El boleto oficial ya está disponible.",
      },
      importantInfo: {
        en: "IMPORTANT INFO",
        pt: "INFORMAÇÃO IMPORTANTE",
        es: "Información Importante",
      },
      compensationDesc: {
        en: "Slip clearing can take up to 48 business hours. Only after this period will our system release your scheduling.",
        pt: "A compensação do boleto pode levar até 48 horas úteis. Somente após esse prazo nosso sistema liberará o seu agendamento.",
        es: "La acreditación del pago puede tardar hasta 48 horas hábiles. Solo después de este plazo nuestro sistema liberará su agendamiento.",
      },
      portalPayment: {
        en: "Portal Payment",
        pt: "Pagamento via Portal",
        es: "Pago vía Portal",
      },
      accessOfficialPortal: {
        en: "To pay with a credit card, you must access the official consulate portal with the details below:",
        pt: "Para pagar com cartão de crédito, você deve acessar o portal oficial do consulado com os dados abaixo:",
        es: "Para pagar con tarjeta de crédito, debe acceder al portal oficial del consulado con los datos a continuación:",
      },
      password: { en: "Password", pt: "Senha", es: "Contraseña" },
      goToPortal: {
        en: "GO TO PORTAL",
        pt: "IR PARA O PORTAL",
        es: "Ir al Portal",
      },
      advantage: { en: "ADVANTAGE", pt: "VANTAGEM", es: "Ventaja" },
      creditCardInstant: {
        en: "Payments via credit card are usually cleared instantly, speeding up your process.",
        pt: "Pagamentos via cartão de crédito costumam ser compensados instantaneamente, agilizando o seu processo.",
        es: "Los pagos con tarjeta de crédito suelen acreditarse instantaneamente, acelerando su proceso.",
      },
      alreadyPaid: {
        en: "I HAVE COMPLETED THE PAYMENT",
        pt: "JÁ REALIZEI O PAGAMENTO",
        es: "Ya He Realizado el Pago",
      },
      secureEnvironment: {
        en: "Secure and encrypted environment",
        pt: "Ambiente seguro e criptografado",
        es: "Ambiente seguro y encriptado",
      },
      successPaymentMsg: {
        en: "Payment confirmed! Now wait for the interview.",
        pt: "Pagamento confirmado! Agora aguarde a entrevista.",
        es: "¡Pago confirmado! Ahora espere por la entrevista.",
      },
      errorConfirmingPayment: {
        en: "Error confirming payment.",
        pt: "Erro ao confirmar pagamento.",
        es: "Error al confirmar el pago.",
      },
    },
    awaitingInterview: {
      tools: {
        guide: {
          title: {
            en: "Interview Guide",
            pt: "Guia de Entrevista",
            es: "Guía de Entrevista",
          },
          desc: {
            en: "Everything you need to know to do well.",
            pt: "Tudo o que você precisa saber para se sair bem.",
            es: "Todo lo que necesitas saber para que te vaya bien.",
          },
        },
        ai: {
          title: {
            en: "AI Interview Sim",
            pt: "Simulado com IA",
            es: "Simulacro con IA",
          },
          desc: {
            en: "Practice your answers with our AI.",
            pt: "Treine suas respostas com nossa inteligência artificial.",
            es: "Entrena tus respuestas con nuestra inteligencia artificial.",
          },
        },
        specialist: {
          title: {
            en: "Train with Specialist",
            pt: "Treinar com Especialista",
            es: "Entrenar con Especialista",
          },
          desc: {
            en: "1-on-1 mentoring for complex cases.",
            pt: "Mentoria individual para casos complexos.",
            es: "Mentoría individual para casos complejos.",
          },
        },
      },
      outcome: { en: "Outcome", pt: "Resultado", es: "Resultado" },
      visaRefusedTitle: {
        en: "Visa Refused",
        pt: "Visto Negado",
        es: "Visa Negada",
      },
      visaRefusedDesc: {
        en: "Unfortunately, this time your visa was not approved by the consular officer. We know how frustrating this is.",
        pt: "Infelizmente, desta vez o seu visto não foi aprovado pelo oficial consular. Sabemos como isso é frustrante.",
        es: "Lamentablemente, esta vez su visa no fue aprobada por el oficial consular. Sabemos lo frustrante que esto es.",
      },
      reviewCaseSpecialist: {
        en: "Talk to Specialist",
        pt: "Falar com Especialista",
        es: "Hablar con Especialista",
      },
      startAgain: {
        en: "Start again",
        pt: "Recomeçar novamente",
        es: "Empezar de nuevo",
      },
      reapplyTitle: {
        en: "Don't Give Up — Reapply with a Discount",
        pt: "Não Desista — Reaplique com Desconto",
        es: "No Se Rinda — Vuelva a Aplicar con Descuento",
      },
      reapplyDesc: {
        en: "Many clients get approved on the second attempt. We've learned from this process and are ready to help you try again — with an exclusive 20% discount.",
        pt: "Muitos clientes são aprovados na segunda tentativa. Aprendemos com esse processo e estamos prontos para te ajudar a tentar de novo — com 20% de desconto exclusivo.",
        es: "Muchos clientes son aprobados en el segundo intento. Aprendemos de este proceso y estamos listos para ayudarle a intentarlo de nuevo — con un 20% de descuento exclusivo.",
      },
      reapplyDiscount: {
        en: "20% OFF for Second Attempt",
        pt: "20% OFF para 2ª Tentativa",
        es: "20% DESCUENTO para 2.º Intento",
      },
      reapplyCTA: {
        en: "I Want to Reapply",
        pt: "Quero Reaplicar",
        es: "Quiero Volver a Aplicar",
      },
      reapplyDecline: {
        en: "No, thank you",
        pt: "Não, obrigado",
        es: "No, gracias",
      },
      reapplyProcessing: {
        en: "Opening checkout...",
        pt: "Abrindo checkout...",
        es: "Abriendo pago...",
      },
      interviewDateArrived: {
        en: "Interview Date Arrived",
        pt: "Data da Entrevista Chegou",
        es: "Llegó la Fecha de la Entrevista",
      },
      finalStagePrep: {
        en: "Final Stage: Preparation",
        pt: "Etapa Final: Preparação",
        es: "Etapa Final: Preparación",
      },
      howWasInterview: {
        en: "How was your interview?",
        pt: "Como foi sua entrevista?",
        es: "¿Cómo fue su entrevista?",
      },
      awaitingInterviewTitle: {
        en: "Awaiting Interview",
        pt: "Aguardando Entrevista",
        es: "Esperando Entrevista",
      },
      interviewArrivedDesc: {
        en: "Your consulate interview date has arrived! Scroll down and let us know the outcome to update your process.",
        pt: "A data da sua entrevista no consulado já chegou! Role para baixo e nos informe o resultado para atualizarmos seu processo.",
        es: "¡Llegó la fecha de su entrevista en el consulado! Desplácese hacia abajo e infórmenos el resultado para actualizar su proceso.",
      },
      datesConfirmedDesc: {
        en: "Your dates are confirmed! Now focus on your preparation with our exclusive tools.",
        pt: "Suas datas estão confirmadas! Agora foque em sua preparação com nossas ferramentas exclusivas.",
        es: "¡Sus fechas están confirmadas! Ahora enfóquese en su preparación con nuestras herramientas exclusivas.",
      },
      successTag: { en: "Success!", pt: "Sucesso!", es: "¡Éxito!" },
      visaApprovedTitle: {
        en: "Visa Approved!",
        pt: "Visto Aprovado!",
        es: "¡Visa Aprobada!",
      },
      visaApprovedDesc: {
        en: "Congratulations on the approval of your US visa! Now we just need to know how you intend to pick up your passport.",
        pt: "Parabéns pela aprovação do seu visto americano! Agora precisamos apenas saber como você pretende pegar o seu passaporte.",
        es: "¡Felicidades por la aprobación de su visa estadounidense! Ahora solo necesitamos saber cómo pretende recoger su pasaporte.",
      },
      visaApprovedDisclaimerTitle: {
        en: "Important: Passport Delivery",
        pt: "Atenção: Entrega do Passaporte",
        es: "Importante: Entrega del Pasaporte",
      },
      visaApprovedDisclaimerBody: {
        en: "Home delivery via postal service is only available if requested on the day of your interview ({date}). After this date, you will only be able to pick it up in person at the CASV.",
        pt: "A opção de receber o passaporte em casa pelos correios só estará disponível se o procedimento for realizado no dia da sua entrevista ({date}). Após essa data, o passaporte só poderá ser retirado pessoalmente no CASV.",
        es: "La opción de entrega a domicilio solo está disponible si se solicita el día de su entrevista ({date}). Después de esta fecha, solo podrá recogerlo en persona en el CASV.",
      },
      confirmedCasvDate: {
        en: "CONFIRMED CASV DATE",
        pt: "DATA CONFIRMADA CASV",
        es: "FECHA CONFIRMADA CASV",
      },
      processing: {
        en: "Processing...",
        pt: "Em processamento...",
        es: "En procesamiento...",
      },
      casvLocation: {
        en: "CASV LOCATION",
        pt: "LOCALIDADE CASV",
        es: "UBICACIÓN CASV",
      },
      informedShortly: {
        en: "To be informed shortly",
        pt: "Será informado em breve",
        es: "Se informará en breve",
      },
      confirmedConsulateDate: {
        en: "CONFIRMED CONSULATE DATE",
        pt: "DATA CONFIRMADA CONSULADO",
        es: "FECHA CONFIRMADA CONSULADO",
      },
      consulate: { en: "CONSULATE", pt: "CONSULADO", es: "CONSULADO" },
      howReceiveVisa: {
        en: "How do you want to receive your visa?",
        pt: "Como deseja receber seu visto?",
        es: "¿Cómo desea recibir su visa?",
      },
      consulateRetainsDesc: {
        en: "The Consulate keeps your passport to stamp the visa. Choose an option to see the guide:",
        pt: "O Consulado retém seu passaporte para estampar o visto. Escolha uma opção para ver o guia:",
        es: "El Consulado retiene su pasaporte para estampar la visa. Elija una opción para ver la guía:",
      },
      postalHome: {
        en: "Postal Service (Home)",
        pt: "Correios (Em Casa)",
        es: "Servicio Postal (En Casa)",
      },
      postalHomeDesc: {
        en: "Receive your passport via Premium Mail at the address provided in your DS-160.",
        pt: "Receba seu passaporte via Correios Premium no endereço informado na DS-160.",
        es: "Reciba su pasaporte a través de Correo Premium en la dirección proporcionada en su DS-160.",
      },
      viewGuide: { en: "View Guide →", pt: "Ver Guia →", es: "Ver Guía →" },
      pickUpCasv: {
        en: "Pick up at CASV",
        pt: "Retirar no CASV",
        es: "Recoger en el CASV",
      },
      pickUpCasvDesc: {
        en: "You or an authorized representative returns to the CASV to collect the passport in person.",
        pt: "Você ou um representante autorizado retorna ao CASV para retirar o passaporte pessoalmente.",
        es: "Usted o un representante autorizado regresa al CASV para recoger el pasaporte en persona.",
      },
      back: { en: "Back", pt: "Voltar", es: "Volver" },
      postalServiceDelivery: {
        en: "Postal Service Delivery",
        pt: "Recebimento pelos Correios",
        es: "Entrega por Servicio Postal",
      },
      receivePassportHomeGuide: {
        en: "Complete guide to receive your passport at home",
        pt: "Guia completo para receber seu passaporte em casa",
        es: "Guía completa para recibir su pasaporte en casa",
      },
      chooseAnother: {
        en: "Choose another option",
        pt: "Escolher outra opção",
        es: "Elegir otra opción",
      },
      casvPickup: {
        en: "CASV Pickup",
        pt: "Retirada no CASV",
        es: "Recogida en el CASV",
      },
      collectPassportPersonGuide: {
        en: "Complete guide to collect your passport in person",
        pt: "Guia completo para retirar seu passaporte pessoalmente",
        es: "Guía completa para recoger su pasaporte en persona",
      },
      usEntryGuide: {
        en: "US Entry Guide",
        pt: "Guia de Entrada nos EUA",
        es: "Guía de Entrada a EE.UU.",
      },
      whatExpectImmigration: {
        en: "What to expect at US immigration and how to prepare",
        pt: "O que esperar na imigração americana e como se preparar",
        es: "Qué esperar en la inmigración estadounidense y cómo prepararse",
      },
      nextStep: { en: "NEXT STEP", pt: "PRÓXIMO PASSO", es: "PRÓXIMO PASO" },
      usEntryGuideDesc: {
        en: "Learn what to expect at US immigration: queue, biometrics, questions and essential tips.",
        pt: "Saiba o que esperar na imigração americana: fila, biométricos, perguntas e dicas essenciais.",
        es: "Sepa qué esperar en la inmigración estadounidense: fila, biométricos, preguntas y consejos esenciales.",
      },
      interviewTakenPlace: {
        en: "Has your interview already taken place?",
        pt: "Sua entrevista já aconteceu?",
        es: "¿Ya se realizó su entrevista?",
      },
      informOutcome: {
        en: "Let us know the final outcome to update your process in the system.",
        pt: "Informe-nos o resultado final para atualizarmos seu processo no sistema.",
        es: "Infórmenos el resultado final para que actualicemos su proceso en el sistema.",
      },
      iWasApproved: {
        en: "I WAS APPROVED!",
        pt: "FUI APROVADO(A)!",
        es: "¡FUI APROBADO(A)!",
      },
      iWasRefused: {
        en: "I WAS REFUSED",
        pt: "FUI REPROVADO(A)",
        es: "FUI REPROBADO(A)",
      },
      prepTools: {
        en: "PREPARATION TOOLS",
        pt: "FERRAMENTAS DE PREPARAÇÃO",
        es: "HERRAMIENTAS DE PREPARACIÓN",
      },
      prepApproval: {
        en: "Prepare for approval",
        pt: "Prepare-se para aprovação",
        es: "Prepárese para la aprobación",
      },
      guides: {
        correios: [
          {
            title: {
              en: "Consulate confirmation",
              pt: "Confirmação pelo consulado",
              es: "Confirmación del consulado",
            },
            desc: {
              en: "After approval, the consulate will process the visa stamping in your passport.",
              pt: "Após a aprovação, o consulado processará a estampagem do visto no seu passaporte.",
              es: "Tras la aprobación, el consulado procesará el estampado de la visa en su pasaporte.",
            },
          },
          {
            title: {
              en: "Shipping request",
              pt: "Solicitação de envio",
              es: "Solicitud de envío",
            },
            desc: {
              en: "Shipping will be made to the address provided in your DS-160. Confirm that the address is correct.",
              pt: "O envio será feito para o endereço informado na sua DS-160. Confirme que o endereço está correto.",
              es: "El envío se realizará a la dirección proporcionada en su DS-160. Confirme que la dirección es correcta.",
            },
          },
          {
            title: {
              en: "Shipping fee",
              pt: "Taxa de envio",
              es: "Tasa de envío",
            },
            desc: {
              en: "The consulate may charge an additional fee for Premium Mail. Watch your email.",
              pt: "O consulado pode cobrar uma taxa adicional pelos Correios Premium. Fique atento ao e-mail.",
              es: "El consulado puede cobrar una tasa adicional por Correo Premium. Esté atento a su correo electrónico.",
            },
          },
          {
            title: {
              en: "Delivery time",
              pt: "Prazo de entrega",
              es: "Plazo de entrega",
            },
            desc: {
              en: "The normal timeframe is 5 to 10 business days after visa stamping.",
              pt: "O prazo normal é de 5 a 10 dias úteis após a estampagem do visto.",
              es: "El plazo normal es de 5 a 10 días hábiles después del estampado de la visa.",
            },
          },
        ],
        casv: [
          {
            title: {
              en: "Wait for the notice",
              pt: "Aguarde o aviso",
              es: "Espere el aviso",
            },
            desc: {
              en: "The consulate will send an email advising that your passport is ready for collection at the CASV.",
              pt: "O consulado enviará um e-mail avisando que seu passaporte está pronto para retirada no CASV.",
              es: "El secretario enviará un correo electrónico avisando que su pasaporte está listo para ser recogido en el CASV.",
            },
          },
          {
            title: {
              en: "Who can collect",
              pt: "Quem pode retirar",
              es: "Quién puede retirar",
            },
            desc: {
              en: "You or an authorized representative with a power of attorney can collect the passport from the CASV.",
              pt: "Você ou um representante autorizado com procuração pode retirar o passaporte no CASV.",
              es: "Usted o un representante autorizado con un poder notarial puede recoger el pasaporte en el CASV.",
            },
          },
          {
            title: {
              en: "Required documents",
              pt: "Documentos necessários",
              es: "Documentos necesarios",
            },
            desc: {
              en: "Bring the scheduling confirmation and a valid identity document for collection.",
              pt: "Leve o comprovante de agendamento e um documento de identidade válido para a retirada.",
              es: "Lleve el comprobante de agendamiento y un documento de identidad válido para la recogida.",
            },
          },
          {
            title: {
              en: "No additional cost",
              pt: "Sem custo adicional",
              es: "Sin costo adicional",
            },
            desc: {
              en: "CASV pickup is exempt from additional consular fees.",
              pt: "A retirada no CASV é isenta de taxas adicionais do consulado.",
              es: "La recogida en el CASV está exenta de tasas consulares adicionales.",
            },
          },
        ],
        usEntry: [
          {
            title: {
              en: "Arrival at the airport",
              pt: "Chegada ao aeroporto",
              es: "Llegada al aeropuerto",
            },
            desc: {
              en: "Upon arriving in the US, follow the signs for 'Immigration' or 'Customs'. Have your passport and boarding pass ready.",
              pt: "Ao chegar nos EUA, siga as placas de 'Immigration' ou 'Customs'. Tenha seu passaporte e o cartão de embarque à mão.",
              es: "Al llegar a EE.UU., siga las señales de 'Inmigración' o 'Aduana'. Tenga a mano su pasaporte y tarjeta de embarque.",
            },
          },
          {
            title: {
              en: "Immigration line",
              pt: "Fila de imigração",
              es: "Fila de inmigración",
            },
            desc: {
              en: "Join the line for international visitors. You'll go through an APC kiosk to scan your passport and answer on-screen questions.",
              pt: "Entre na fila para visitantes internacionais. Você passará por um quiosque APC onde escaneará seu passaporte e responderá perguntas na tela.",
              es: "Haga la fila para visitantes internacionales. Pasará por un quiosco APC donde escaneará su pasaporte y responderá preguntas en pantalla.",
            },
          },
          {
            title: {
              en: "Agent interview",
              pt: "Entrevista com o agente",
              es: "Entrevista con el agente",
            },
            desc: {
              en: "The officer will review your passport, collect biometrics, and may ask about your visit purpose, length of stay, and accommodation.",
              pt: "O agente revisará seu passaporte, coletará biométricos e poderá perguntar sobre o motivo da visita, tempo de estadia e onde ficará.",
              es: "El agente revisará su pasaporte, recopilará datos biométricos y podrá preguntarle sobre el motivo de su visita, el tiempo de estancia y dónde se alojará.",
            },
          },
          {
            title: {
              en: "Recommended documents",
              pt: "Documentos recomendados",
              es: "Documentos recomendados",
            },
            desc: {
              en: "Have with you: passport with visa, accommodation proof, return ticket, and proof of financial means.",
              pt: "Tenha consigo: passaporte com visto, comprovante de hospedagem, passagem de volta e comprovante de meios financeiros.",
              es: "Lleve consigo: pasaporte con visa, comprobante de alojamiento, boleto de regreso y comprobante de medios financieros.",
            },
          },
          {
            title: {
              en: "Baggage claim",
              pt: "Recolhimento de bagagem",
              es: "Recogida de equipaje",
            },
            desc: {
              en: "After immigration, collect your luggage and go through Customs. Declare mandatory items. Most tourists pass through quickly.",
              pt: "Após a imigração, retire suas malas e passe pela alfândega. Declare itens obrigatórios. A maioria dos turistas passa rapidamente.",
              es: "Tras la inmigración, recoja sus maletas y pase por la aduana. Declare los artículos obligatorios. La mayoría de los turistas pasan rápidamente.",
            },
          },
          {
            title: {
              en: "Important tips",
              pt: "Dicas importantes",
              es: "Consejos importantes",
            },
            desc: {
              en: "Be honest with officers. Answer only what is asked. Avoid security-related jokes. Stay calm and be polite.",
              pt: "Seja honesto com os agentes. Responda apenas o que for perguntado. Evite piadas sobre segurança. Mantenha a calma e seja educado.",
              es: "Sea honesto con los agentes. Responda solo lo que se le pregunte. Evite bromas sobre seguridad. Mantenga la calma y sea educado.",
            },
          },
        ],
      },
      errorUpdatingStatus: {
        en: "Error updating status.",
        pt: "Erro ao atualizar status.",
        es: "Error al actualizar el estado.",
      },
    },
  },

  ds160: {
    steps: {
      en: [
        "Personal Info 1",
        "Personal Info 2",
        "Travel Info",
        "Companions",
        "Previous US Travel",
        "Address & Phone",
        "Social Media",
        "Passport Info",
        "US Contact",
        "Family Info",
        "Work & Education",
        "Additional Info",
      ],
      pt: [
        "Info Pessoal 1",
        "Info Pessoal 2",
        "Info de Viagem",
        "Acompanhantes",
        "Viagens Anteriores",
        "Endereço e Telefone",
        "Mídias Sociais",
        "Passaporte",
        "Contato nos EUA",
        "Informações de Família",
        "Trabalho e Educação",
        "Informações Adicionais",
      ],
      es: [
        "Info Personal 1",
        "Info Personal 2",
        "Info de Viaje",
        "Acompañantes",
        "Viajes Anteriores",
        "Dirección y Teléfono",
        "Redes Sociales",
        "Pasaporte",
        "Contacto en EE.UU.",
        "Información Familiar",
        "Trabajo y Educación",
        "Información Adicional",
      ],
    },
    interview: {
      title: {
        en: "Interview Location",
        pt: "Local da Entrevista",
        es: "Lugar de la Entrevista",
      },
      location: {
        en: "Location where you plan to have your interview",
        pt: "Localidade onde pretende realizar sua entrevista",
        es: "Localidad donde planea realizar su entrevista",
      },
      options: [
        { en: "Brasília", pt: "Brasília", es: "Brasilia" },
        { en: "Porto Alegre", pt: "Porto Alegre", es: "Porto Alegre" },
        { en: "Recife", pt: "Recife", es: "Recife" },
        { en: "Rio de Janeiro", pt: "Rio de Janeiro", es: "Río de Janeiro" },
        { en: "São Paulo", pt: "São Paulo", es: "São Paulo" },
      ],
      fillNotice: {
        en: "You are currently in the DS-160 filling stage. Please complete all steps carefully to ensure your application is generated correctly.",
        pt: "Você está na etapa de preenchimento da sua DS-160. Por favor, complete todas as etapas com atenção para garantir que sua aplicação seja gerada corretamente.",
        es: "Usted se encontra en la etapa de completar su DS-160. Por favor, complete todos los pasos con atención para asegurar que su solicitud se genere correctamente.",
      },
    },
    personal1: {
      title: {
        en: "Personal Information 1",
        pt: "Informações Pessoais 1",
        es: "Información Personal 1",
      },
      email: { en: "Email", pt: "E-mail", es: "Correo electrónico" },
      firstName: { en: "Given Names", pt: "Nome", es: "Nombres" },
      lastName: { en: "Surname", pt: "Sobrenome", es: "Apellidos" },
      fullNameHelper: {
        en: "Put your first name and middle name(s) here. Example: Your name; Silvio Santos Pereira. Given Names = Silvio Santos. NOTE: Put exactly as it appears in your passport!",
        pt: "Coloque aqui seu primeiro nome e nome(s) do meio Exemplo: Seu nome; Silvio Santos Pereira. Given Names = Silvio Santos. OBS: Coloque exatamente como consta em seu passaporte!",
        es: "Ponga aquí su primer nombre y nombre(s) intermedio(s). Ejemplo: Su nombre; Silvio Santos Pereira. Given Names = Silvio Santos. NOTA: ¡Ponga exactamente como aparece en su pasaporte!",
      },
      fullNamePassport: {
        en: "Full name as it appears in the passport:",
        pt: "Nome completo como consta no passaporte:",
        es: "Nombre completo como aparece en el pasaporte:",
      },
      hasOtherNames: {
        en: "Have you ever used other names? (Maiden, religious, professional, or alias)",
        pt: "Você já teve outro nome? (Nome de solteiro(a), religioso, profissional ou pseudónimo)",
        es: "¿Alguna vez ha usado otros nombres? (Soltero/a, religioso, profesional o seudónimo)",
      },
      hasTelecode: {
        en: "Do you have a telecode that represents your name?",
        pt: "Tem um telecódigo que representa o seu nome?",
        es: "¿Tiene un telecódigo que represente su nombre?",
      },
      gender: { en: "Sex", pt: "Sexo", es: "Sexo" },
      genderOptions: {
        male: { en: "Male", pt: "Masculino", es: "Masculino" },
        female: { en: "Female", pt: "Feminino", es: "Femenino" },
      },
      maritalStatus: {
        en: "Marital Status",
        pt: "Estado Civil",
        es: "Estado Civil",
      },
      maritalOptions: {
        married: { en: "Married", pt: "Casado (a)", es: "Casado (a)" },
        single: { en: "Single", pt: "Solteiro (a)", es: "Soltero (a)" },
        widowed: { en: "Widowed", pt: "Viúvo (a)", es: "Viudo (a)" },
        divorced: {
          en: "Divorced",
          pt: "Divorciado (a)",
          es: "Divorciado (a)",
        },
        separated: {
          en: "Legally Separated",
          pt: "Separado (a) Legalmente",
          es: "Separado (a) Legalmente",
        },
      },
      dob: {
        en: "Date of Birth",
        pt: "Data de Nascimento",
        es: "Fecha de Nacimiento",
      },
      cityBirth: {
        en: "City of birth:",
        pt: "Cidade onde nasceu:",
        es: "Ciudad de nacimiento:",
      },
      stateBirth: {
        en: "State of birth:",
        pt: "Estado onde nasceu:",
        es: "Estado de nacimiento:",
      },
      countryBirth: {
        en: "Country of birth:",
        pt: "País onde nasceu:",
        es: "País de nacimiento:",
      },
    },
    personal2: {
      title: {
        en: "Personal Information 2",
        pt: "Informações Pessoais 2",
        es: "Información Personal 2",
      },
      nationality: {
        en: "Nationality",
        pt: "Nacionalidade",
        es: "Nacionalidad",
      },
      hasOtherNationality: {
        en: "Do you have or have you ever had any nationality other than the one indicated above?",
        pt: "Tem ou teve outra nacionalidade diferente da que indicou acima?",
        es: "¿Tiene o ha tenido alguna otra nacionalidad diferente a la indicada anteriormente?",
      },
      hasPassportOtherCountry: {
        en: "Do you hold a passport from the country of the nationality mentioned above?",
        pt: "Você possui passaporte do país referente a nacionalidade mencionada acima?",
        es: "¿Posee pasaporte del país referente a la nacionalidad mencionada anteriormente?",
      },
      passportNumber: {
        en: "If yes, passport number:",
        pt: "Se sim, número do passaporte:",
        es: "Si es así, número de pasaporte:",
      },
      permanentResidentOther: {
        en: "Are you a permanent resident of a country/region other than your country/region of origin indicated?",
        pt: "Você é residente permanente de um país/região diferente do seu país/região de origem indicada",
        es: "¿Es residente permanente de un país/región diferente a su país/región de origen indicado?",
      },
      nationalID: {
        en: "National Identification Number (SSN/CPF):",
        pt: "Número de identificação Nacional (informar o seu CPF):",
        es: "Número de identificación nacional (informar su CPF/DNI):",
      },
      ssn: {
        en: "U.S. Social Security Number (if any):",
        pt: "Número do Seguro Social E.U.A.:(caso tenha):",
        es: "Número de Seguro Social de EE.UU. (si aplica):",
      },
      taxID: {
        en: "U.S. Taxpayer ID Number (if any):",
        pt: "Número de identificação fiscal dos E.U.A.:(caso tenha):",
        es: "Número de identificación fiscal de EE.UU. (si aplica):",
      },
    },
    travel: {
      title: {
        en: "Travel Information",
        pt: "Informações de Viagem",
        es: "Información de Viaje",
      },
      specificPlan: {
        en: "Do you have a specific travel plan?",
        pt: "Você tem um plano de viagem específico?",
        es: "¿Tiene un plan de viaje específico?",
      },
      arrivalDate: {
        en: "Arrival Date",
        pt: "Data de Chegada",
        es: "Fecha de llegada",
      },
      arrivalHelper: {
        en: "Provide the date you will arrive in the US. This date is only a travel forecast, it does not mean that you have to already have your tickets purchased.",
        pt: "Aqui você coloca a data que chegará nos EUA, Essa data é apenas uma previsão de viagem, não significa que você tem que já estar com as passagens compradas. O próprio consulado recomenda às pessoas que comprem suas passagens somente após estarem com visto em mãos.",
        es: "Aquí pone la fecha en que llegará a los EE.UU. Esta fecha es solo una previsión de viaje, no significa que ya tenga que tener los boletos comprados.",
      },
      visitLocations: {
        en: "Provide the locations you plan to visit in the US:",
        pt: "Forneça os locais que planeja visitar nos EUA (localização)",
        es: "Proporcione los lugares que planea visitar en los EE.UU. (ubicación):",
      },
      visitHelper: {
        en: "Mention here the locations you plan to visit.",
        pt: "Mencione aqui os locais que você planeja visitar, ponha todos que tem vontade de visitar.",
        es: "Mencione aquí los lugares que planea visitar.",
      },
      stayAddress: {
        en: "Address where you intend to stay in the US:",
        pt: "Endereço que pretende ficar nos EUA:",
        es: "Dirección donde planea quedarse en los EE.UU.:",
      },
      stayHelper: {
        en: "If you don't know yet, put a hotel as a reference.",
        pt: "Se você não sabe ainda, coloque algum hotel como referência.",
        es: "Si aún no lo sabe, ponga algún hotel como referencia.",
      },
      stayCity: {
        en: "City where you intend to stay in the US:",
        pt: "Cidade que pretende ficar nos EUA:",
        es: "Ciudad donde planea quedarse en los EE.UU.:",
      },
      stayState: {
        en: "State where you intend to stay in the US:",
        pt: "Estado que pretende ficar nos EUA:",
        es: "Estado donde planea quedarse en los EE.UU.:",
      },
      stayZip: {
        en: "ZIP Code of the place you intend to stay in the US:",
        pt: "CEP do local que pretende ficar nos EUA:",
        es: "Código ZIP del lugar donde planea quedarse en los EE.UU.:",
      },
      payer: {
        en: "Who is paying for your trip:",
        pt: "Quem vai pagar pela sua viagem:",
        es: "¿Quién pagará por su viaje?:",
      },
      payerOptions: {
        self: { en: "Self", pt: "Self/Você", es: "Mismo" },
        other: { en: "Other Person", pt: "Outra pessoa", es: "Otra persona" },
        org: { en: "Organization/Company", pt: "Empresa", es: "Empresa" },
        employer: {
          en: "Current Employer",
          pt: "Atual Empregador",
          es: "Empleador actual",
        },
        usEmployer: {
          en: "Employer in the US",
          pt: "Empregador nos EUA",
          es: "Empleador en EE.UU.",
        },
      },
      payerHelper: {
        en: "Self: If it's yourself. Other person: If it's someone else, then specify name and relationship.",
        pt: "Self: Se for você mesmo. Other person: Se for outra pessoa e então deverá preencher o nome e o grau parentesco com você.",
        es: "Self: Si es usted mismo. Other person: Si es otra persona, entonces deberá completar el nombre y el parentesco con usted.",
      },
    },
    companions: {
      title: {
        en: "Travel Companions Information",
        pt: "Informações sobre companheiros de viagem",
        es: "Información sobre compañeros de viaje",
      },
      hasCompanions: {
        en: "Is there another person traveling with you?",
        pt: "Tem outra pessoa viajando com você?",
        es: "¿Hay otra persona viajando con usted?",
      },
      companionHelper: {
        en: "If you mark 'yes', you will have to fill in the data of the person who is going with you.",
        pt: "Se você marcar ”sim”, terá que preencher os dados da pessoa com quem está indo com você.",
        es: "Si marca 'sí', tendrá que completar los datos de la persona que va con usted.",
      },
      isGrpup: {
        en: "Are you traveling with a group or organization?",
        pt: "Está viajando com um grupo ou organização",
        es: "¿Está viajando con un grupo u organización?",
      },
    },
    previousTravel: {
      title: {
        en: "Previous US Travel Information",
        pt: "INFORMAÇÕES DE VIAGEM ANTERIORES DOS EUA",
        es: "Información de viajes anteriores a EE.UU.",
      },
      beenToUS: {
        en: "Have you ever been to the US?",
        pt: "Já esteve nos EUA?",
        es: "¿Ha estado alguna vez en los EE.UU.?",
      },
      hasUSLicense: {
        en: "Do you have or have you ever had a US driver's license?",
        pt: "Tem ou já teve carteira de habilitação dos EUA?",
        es: "¿Tiene o ha tenido alguna vez licencia de conducir de EE.UU.?",
      },
      hasUSVisa: {
        en: "Have you ever had or do you possess a US visa?",
        pt: "Já teve ou possui visto americano?",
        es: "¿Alguna vez ha tenido o posee una visa estadounidense?",
      },
      visaRefused: {
        en: "Have you ever been refused a US visa, refused admission to the United States, or withdrawn your application for admission at the port of entry?",
        pt: "Alguma vez lhe foi recusado um visto americano, foi-lhe recusada a admissão nos Estados Unidos, ou retirado o seu pedido de admissão no ponto de entrada?",
        es: "¿Alguna vez se le ha negado una visa estadounidense, se le ha negado la admisión a los Estados Unidos o ha retirado su solicitud de admisión en el punto de entrada?",
      },
      immigrationPetition: {
        en: "Has anyone ever filed an immigrant petition on your behalf with the United States Citizenship and Immigration Services?",
        pt: "Alguém alguma vez apresentou uma petição de imigração em seu nome aos Serviços de Cidadania e Imigração dos Estados Unidos?",
        es: "¿Alguien ha presentado alguna vez una petición de inmigración en su nombre ante los Servicios de Ciudadanía e Inmigración de los Estados Unidos?",
      },
      petitionHelper: {
        en: "Check 'yes' only if you have already completed an immigration and citizenship petition in the United States.",
        pt: "Marque “sim” apenas se já tiver preenchido uma petição de imigração e cidadania nos Estados Unidos.",
        es: "Marque 'sí' solo si ya ha completado una petición de inmigración y ciudadanía en los Estados Unidos.",
      },
    },
    addressPhone: {
      title: {
        en: "Address and Phone Information",
        pt: "ENDEREÇO E INFORMAÇÕES TELEFÔNICAS",
        es: "Información de dirección y teléfono",
      },
      homeAddress: {
        en: "Home Address:",
        pt: "Endereço residencial:",
        es: "Dirección residencial:",
      },
      city: { en: "City:", pt: "Cidade:", es: "Ciudad:" },
      state: {
        en: "State/Province:",
        pt: "Estado/Município:",
        es: "Estado/Provincia:",
      },
      zip: {
        en: "ZIP/Postal Code:",
        pt: "CEP/Código Postal:",
        es: "Código Postal:",
      },
      country: { en: "Country:", pt: "País", es: "País:" },
      mailingSame: {
        en: "Is the mailing address the same as the one informed above?",
        pt: "Endereço de correspondência é o mesmo informado acima?",
        es: "¿La dirección de correspondencia es la misma que la informada anteriormente?",
      },
      mobilePhone: {
        en: "Mobile Phone:",
        pt: "Telefone Celular",
        es: "Teléfono Celular:",
      },
      homePhone: {
        en: "Home Phone:",
        pt: "Telefone residencial:",
        es: "Teléfono residencial:",
      },
      workPhone: {
        en: "Work Phone:",
        pt: "Telefone do trabalho:",
        es: "Teléfono del trabajo:",
      },
      otherPhone5Years: {
        en: "Have you had another phone in the last 5 years?",
        pt: "Você teve outro telefone nos últimos 5 anos?",
        es: "¿Ha tenido otro teléfono en los últimos 5 años?",
      },
      otherEmail5Years: {
        en: "Have you had another email in the last 5 years?",
        pt: "Você teve outro email nos últimos 5 anos?",
        es: "¿Ha tenido otro correo electrónico en los últimos 5 anos?",
      },
      addressLabel: { en: "Address:", pt: "Endereço:", es: "Dirección:" },
      mailingAddressLabel: {
        en: "Mailing address:",
        pt: "Endereço de correspondência:",
        es: "Dirección de correspondencia:",
      },
      otherPhonesLabel: {
        en: "Enter other phone numbers:",
        pt: "Informe os outros números de telefone:",
        es: "Ingrese otros números de teléfono:",
      },
      otherEmailsLabel: {
        en: "Enter other email addresses:",
        pt: "Informe os outros endereços de email:",
        es: "Ingrese otras direcciones de correo electrónico:",
      },
      yes: { en: "Yes", pt: "Sim", es: "Sí" },
      no: { en: "No", pt: "Não", es: "No" },
    },
    socialMedia: {
      title: { en: "Social Media", pt: "MÍDIAS SOCIAIS", es: "Redes Sociales" },
      helper: {
        en: "Inform the social media you have and add your account identifier. EX: Platform: Instagram Identifier: @JohnDoe",
        pt: "Informe as mídias sociais que você possui e adicione o identificador da sua conta. EX: Nome da plataforma: Instagram Identificador: @JoãoSilva",
        es: "Informe las redes sociales que tiene y agregue el identificador de su cuenta. EJ: Plataforma: Instagram Identificador: @JuanPerez",
      },
      platformLabel1: {
        en: "Platform Name / Identifier 1 *",
        pt: "Nome da Plataforma/ Identificador 1 *",
        es: "Nombre de la Plataforma / Identificador 1 *",
      },
      platformLabel2: {
        en: "Platform Name / Identifier 2",
        pt: "Nome da Plataforma/ Identificador 2",
        es: "Nombre de la Plataforma / Identificador 2",
      },
      platformLabel3: {
        en: "Platform Name / Identifier 3",
        pt: "Nome da Plataforma/ Identificador 3",
        es: "Nombre de la Plataforma / Identificador 3",
      },
    },
    passport: {
      title: {
        en: "Passport Information",
        pt: "INFORMAÇÃO DO PASSAPORTE",
        es: "Información del Pasaporte",
      },
      type: {
        en: "Passport Type:",
        pt: "Tipo de passaporte:",
        es: "Tipo de pasaporte:",
      },
      typeOptions: {
        regular: { en: "Regular", pt: "Regular", es: "Regular" },
        official: { en: "Official", pt: "Oficial", es: "Oficial" },
        diplomatic: { en: "Diplomatic", pt: "Diplomático", es: "Diplomático" },
        laissezPasser: {
          en: "Laissez Passer",
          pt: "Laissez Passer",
          es: "Laissez Passer",
        },
        other: { en: "Other", pt: "Outros", es: "Otros" },
      },
      typeHelper: {
        en: "Mark 'Regular' for common passports, which is the case for most.",
        pt: "Marque a opção “Regular” para passaportes comuns, que é o caso da maioria.",
        es: "Marque 'Regular' para pasaportes comunes, que es el caso de la mayoría.",
      },
      number: {
        en: "Passport Number:",
        pt: "Número do Passaporte:",
        es: "Número de Pasaporte:",
      },
      numberHelper: {
        en: "Enter your passport number",
        pt: "Coloque o número do seu passaporte",
        es: "Ingrese su número de pasaporte",
      },
      authority: {
        en: "Passport Issuing Authority:",
        pt: "Autoridade que emitiu o passaporte:",
        es: "Autoridad que emitió el pasaporte:",
      },
      city: {
        en: "City where issued:",
        pt: "Cidade onde o passaporte foi emitido:",
        es: "Ciudad donde se emitió:",
      },
      state: {
        en: "State where issued:",
        pt: "Estado onde o passaporte foi emitido:",
        es: "Estado donde se emitió:",
      },
      country: {
        en: "Country where issued:",
        pt: "País onde o passaporte foi emitido:",
        es: "País donde se emitió:",
      },
      issuanceDate: {
        en: "Issuance Date:",
        pt: "Data de emissão:",
        es: "Fecha de emisión:",
      },
      expirationDate: {
        en: "Expiration Date:",
        pt: "Data de expiração:",
        es: "Fecha de expiración:",
      },
      lostStolen: {
        en: "Have you ever had a passport lost or stolen?",
        pt: "Já teve algum passaporte roubado ou extraviado:",
        es: "¿Alguna vez le han robado o se le ha extraviado un pasaporte?",
      },
      select: { en: "Select...", pt: "Selecione...", es: "Seleccionar..." },
      yes: { en: "Yes", pt: "Sim", es: "Sí" },
      no: { en: "No", pt: "Não", es: "No" },
      lostPassportNumber: {
        en: "Lost passport number:",
        pt: "Número do passaporte perdido:",
        es: "Número de pasaporte perdido:",
      },
      issuingCountry: {
        en: "Issuing country:",
        pt: "País emissor:",
        es: "País emisor:",
      },
      explanationLabel: {
        en: "Explain what happened:",
        pt: "Explique o que aconteceu:",
        es: "Explique lo que pasó:",
      },
    },
    contact: {
      title: {
        en: "US Point of Contact Information",
        pt: "INFORMAÇÕES DO PONTO DE CONTACTO DOS EUA",
        es: "Información del Punto de Contacto en EE.UU.",
      },
      hasContact: {
        en: "Do you have a contact in the United States? Person or Organization?",
        pt: "Possui contato nos Estados Unidos? Pessoa ou Organização nos Estados Unidos?",
        es: "¿Tiene un contacto en los Estados Unidos? ¿Persona u Organización?",
      },
      contactHelper: {
        en: "Enter Surname and Name. If B1/B2, we recommend marking 'Do Not Know'.",
        pt: "Informe o Sobrenome e nome. Caso seja F1, informamos nessa área o nome do responsável da instituição de ensino. Nessa Parte recomendamos marcar ”Do Not Know” em caso de B1/B2.",
        es: "Ingrese Apellido y Nombre. Si es B1/B2, recomendamos marcar 'No lo sé'.",
      },
      guidanceTitle: {
        en: "📌 Important Guidance:",
        pt: "📌 Orientações importantes:",
        es: "📌 Orientación Importante:",
      },
      guidance1: {
        en: "Enter Surname and Given Name of the contact.",
        pt: "Informe o Sobrenome e Nome do contato.",
        es: "Ingrese el Apellido y el Nombre del contacto.",
      },
      guidance2: {
        en: "For F1 Visas, provide the name of the school official.",
        pt: "Caso seja Visto F1, informe o nome do responsável da instituição de ensino.",
        es: "Para Visas F1, proporcione el nombre del oficial de la escuela.",
      },
      guidance3: {
        en: "For B1/B2 Visas, we recommend selecting 'Do Not Know' if you don't have a specific contact.",
        pt: "Para Visto B1/B2, recomendamos marcar 'Do Not Know' se não tiver um contato específico.",
        es: "Para Visas B1/B2, recomendamos seleccionar 'No lo sé' si no tiene um contacto específico.",
      },
      nameLabel: {
        en: "Contact Name and Surname:",
        pt: "Nome e Sobrenome do Contato:",
        es: "Nombre y Apellido del Contacto:",
      },
      orgName: {
        en: "Organization Name:",
        pt: "Nome da organização",
        es: "Nombre de la Organización:",
      },
      orgHelper: {
        en: "I recommend putting here the name of the hotel, school you will attend, or another place you entered previously.",
        pt: "Recomendo colocar aqui o nome do hotel, escola que vai frequentar, ou outro lugar no qual você inseriu anteriormente na parte onde ficará nos EUA, nesse caso você pode usar aquele lugar como referência.",
        es: "Recomiendo poner aquí el nombre del hotel, escuela a la que asistirá u otro lugar que ingresó anteriormente.",
      },
      relationship: {
        en: "Relationship to you:",
        pt: "Relação com você",
        es: "Relación con usted:",
      },
      relOptions: {
        relative: { en: "Relative", pt: "Parente", es: "Pariente" },
        spouse: { en: "Spouse", pt: "Cônjugue", es: "Cónyuge" },
        friend: { en: "Friend", pt: "Amigo", es: "Amigo" },
        business: {
          en: "Business Associate",
          pt: "Associação Comercial",
          es: "Socio Comercial",
        },
        employer: { en: "Employer", pt: "Empregador", es: "Empleador" },
        school: {
          en: "Educational Institution",
          pt: "Escola/Instituição de Ensino",
          es: "Institución Educativa",
        },
        other: { en: "Other", pt: "Outros", es: "Otro" },
      },
      relHelper: {
        en: "Mark 'Other' for a hotel. Mark 'Educational Institution' for a school.",
        pt: "Marque a opção ”Other” em caso de hotel. Marque a opção “Official School” em caso de escola",
        es: "Marque 'Otro' para un hotel. Marque 'Institución Educativa' para una escuela.",
      },
      addressPhone: {
        en: "Address and Phone Number of Contact in the US:",
        pt: "Endereço e número de telefone do contato nos EUA:",
        es: "Dirección y teléfono del contacto en EE.UU.:",
      },
      address: {
        en: "US Address:",
        pt: "Endereço nos EUA",
        es: "Dirección en EE.UU.:",
      },
      city: { en: "City:", pt: "Cidade:", es: "Ciudad:" },
      state: { en: "State:", pt: "Estado:", es: "Estado:" },
      zip: { en: "ZIP Code:", pt: "Zip Code/CEP:", es: "Código ZIP:" },
      phone: {
        en: "Phone Number:",
        pt: "Número de telefone:",
        es: "Número de teléfono:",
      },
      email: { en: "Email:", pt: "Email do local:", es: "Correo electrónico:" },
      emailHelper: {
        en: "Enter the same address you provided for the place you're staying. If you don't know the hotel's email, mark 'Does Not Apply'.",
        pt: "Insira o mesmo endereço que forneceu no lugar onde vai ficar nos EUA, se você não sabe qual é o e-mail do hotel, não tem problema, marque a opção “Does Not Apply”",
        es: "Ingrese la misma dirección que proporcionó para el lugar donde se hospedará. Si no conoce el correo del hotel, marque 'No aplica'.",
      },
    },
    family: {
      title: {
        en: "Family Information: Relatives",
        pt: "INFORMAÇÕES SOBRE A FAMÍLIA: PARENTE",
        es: "Información Familiar: Parientes",
      },
      fatherLast: {
        en: "Father's Surname:",
        pt: "Último nome do seu pai:",
        es: "Apellidos del padre:",
      },
      fatherFirst: {
        en: "Father's Given Names:",
        pt: "Primeiro nome e nome do meio do seu pai:",
        es: "Nombres del padre:",
      },
      fatherDOB: {
        en: "Father's Date of Birth:",
        pt: "Informe a data de nascimento do seu pai:",
        es: "Fecha de nacimiento del padre:",
      },
      isFatherInUS: {
        en: "Is your father in the United States?",
        pt: "Seu pai está nos Estados Unidos?",
        es: "¿Su padre está en el Estados Unidos?",
      },
      fatherStatus: {
        en: "Father's Status in the US:",
        pt: "Informe o Status do seu pai nos Estados Unidos",
        es: "Estado de su padre en EE.UU.:",
      },
      motherLast: {
        en: "Mother's Surname:",
        pt: "Último nome da sua mãe:",
        es: "Apellidos de la madre:",
      },
      motherFirst: {
        en: "Mother's Given Names:",
        pt: "Primeiro nome e nome do meio da sua Mãe:",
        es: "Nombres de la madre:",
      },
      motherDOB: {
        en: "Mother's Date of Birth:",
        pt: "Informe a data de nascimento da sua mãe:",
        es: "Fecha de nacimiento de la madre:",
      },
      isMotherInUS: {
        en: "Is your mother in the United States?",
        pt: "Sua mãe está nos Estados Unidos:",
        es: "¿Su madre está en EE.UU.?",
      },
      motherStatus: {
        en: "Mother's Status in the US:",
        pt: "Informe o Status da sua mãe nos Estados Unidos:",
        es: "Estado de su madre en EE.UU.:",
      },
      maternalGrandmotherName: {
        en: "Mother's mother's name:",
        pt: "Nome completo da sua avó materna (mãe da sua mãe):",
        es: "Nombre de la madre de su madre:",
      },
      statusOptions: {
        citizen: {
          en: "U.S. Citizen",
          pt: "Cidadão Americano",
          es: "Ciudadano estadounidense",
        },
        lpr: {
          en: "Legal Permanent Resident (LPR)",
          pt: "Residente Permanente Legal dos EUA (LPR)",
          es: "Residente Permanente Legal (LPR)",
        },
        nonImmigrant: {
          en: "Non-Immigrant",
          pt: "Não Imigrante",
          es: "No Inmigrante",
        },
        unknown: {
          en: "Other/I Don't Know",
          pt: "Outro/Não sei",
          es: "Otro / No lo sé",
        },
      },
      hasImmediateRelInUS: {
        en: "Do you have any immediate relatives, not including parents, in the United States?",
        pt: "Tem algum parente próxima, não incluindo os pais, nos Estados Unidos?",
        es: "¿Tiene algún pariente cercano, sin incluir a los padres, en los Estados Unidos?",
      },
      hasOtherRelInUS: {
        en: "Do you have any other relatives in the United States?",
        pt: "Tem mais algum parente nos Estados Unidos?",
        es: "¿Tiene algún otro pariente en los Estados Unidos?",
      },
    },
    workEducation: {
      title: {
        en: "Current Work / Education / Training Information",
        pt: "INFORMAÇÕES ATUAIS SOBRE O TRABALHO/EDUCAÇÃO/FORMAÇÃO NO MOMENTO",
        es: "Información actual de Trabajo / Educación / Capacitación",
      },
      primaryOccupation: {
        en: "Primary Occupation:",
        pt: "Trabalho atual/educação/formação. Qual a sua Ocupação primária:",
        es: "Ocupación Principal:",
      },
      occHelper: {
        en: "Select a function that fits your profile. Mark 'Other' if none match and specify below.",
        pt: "Insira uma das funções que se encaixa ao seu perfil, Marque “Other” Se nenhuma das alternativas bate com você, e então específica abaixo a sua profissão.",
        es: "Seleccione una función que se ajuste a su perfil. Marque 'Otro' si ninguna coincide y especifique abajo.",
      },
      employerName: {
        en: "Employer/Company or School Name:",
        pt: "Apresentar o nome do Empregador/Empresa ou Instituição de Ensino(para estudante):",
        es: "Nombre del Empleador / Empresa o Institución Educativa:",
      },
      employerHelper: {
        en: "Name of the company where you work or school you attend.",
        pt: "Nome da empresa onde você trabalha ou escola que frequenta.",
        es: "Nombre de la empresa donde trabaja o escuela a la que asiste.",
      },
      employerAddress: {
        en: "Employer or School Address:",
        pt: "Endereço atual do empregador ou Instituição de Ensino(para estudantes):",
        es: "Dirección del Empleador o Institución Educativa:",
      },
      addressHelper: {
        en: "Address where you work or study. (If you are young and don't work yet).",
        pt: "Coloque aqui o endereço onde você trabalha ou da escola em que estuda. (Se é ainda jovem e não trabalha)",
        es: "Dirección donde trabaja o estudia.",
      },
      city: {
        en: "Work/School City:",
        pt: "Cidade do trabalho/Instituição de ensino:",
        es: "Ciudad de trabajo / estudio:",
      },
      state: {
        en: "Work/School State:",
        pt: "Estado do trabalho/Instituição de ensino:",
        es: "Estado de trabajo / estudio:",
      },
      zip: {
        en: "Work/School ZIP Code:",
        pt: "Cep do trabalho/Instituição de ensino:",
        es: "Código ZIP de trabajo / estudio:",
      },
      phone: {
        en: "Work/School Phone:",
        pt: "Telefone da Instituição de ensino:",
        es: "Teléfono de trabajo / estudio:",
      },
      country: {
        en: "Work/School Country:",
        pt: "País do trabalho/Instituição de ensino:",
        es: "País de trabajo / estudio:",
      },
      startDate: {
        en: "Start Date:",
        pt: "Data em que iniciou o trabalho ou os estudos na instituição:",
        es: "Fecha de inicio:",
      },
      monthlyIncome: {
        en: "Monthly Income in Local Currency (if employed):",
        pt: "Rendimento mensal em Moeda Local (se empregado):",
        es: "Ingreso Mensual en Moneda Local (si está empleado):",
      },
      incomeHelper: {
        en: "Enter your gross income, Example: 5000",
        pt: "Coloque aqui sua renda bruta, Exemplo: Se você ganha R$5,000,00 Coloque este formato: 5000",
        es: "Ingrese su ingreso bruto, Ejemplo: 5000",
      },
      duties: {
        en: "Briefly describe your duties:",
        pt: "Descreva resumidamente as suas funções:",
        es: "Describa brevemente sus funciones:",
      },
      prevEmployed: {
        en: "Were you previously employed?",
        pt: "Você estava empregado Anteriormente?",
        es: "¿Estuvo empleado anteriormente?",
      },
      educationLevel: {
        en: "Have you attended any secondary or higher education level institution?",
        pt: "Você frequentou alguma instituição de ensino de nível secundário ou superior?",
        es: "¿Ha asistido a alguna institución de educación secundaria o superior?",
      },
      eduOptions: {
        secondary: {
          en: "Yes, Secondary Education",
          pt: "Sim, Ensino Secundário",
          es: "Sí, Educación Secundaria",
        },
        higher: {
          en: "Yes, Higher Education",
          pt: "Sim, Ensino Superior",
          es: "Sí, Educación Superior",
        },
        no: { en: "No", pt: "Não", es: "No" },
      },
      yes: { en: "Yes", pt: "Sim", es: "Sí" },
      no: { en: "No", pt: "Não", es: "No" },
      prevEmployerName: {
        en: "Previous employer name:",
        pt: "Nome do empregador anterior:",
        es: "Nombre del empleador anterior:",
      },
      jobTitle: { en: "Job title:", pt: "Cargo:", es: "Puesto de trabajo:" },
      period: {
        en: "Period (ex: 2018-2022):",
        pt: "Período (ex: 2018-2022):",
        es: "Periodo (ej: 2018-2022):",
      },
      supervisorName: {
        en: "Supervisor name:",
        pt: "Nome do supervisor:",
        es: "Nombre del supervisor:",
      },
      reasonLeaving: {
        en: "Reason for leaving:",
        pt: "Motivo de saída:",
        es: "Motivo de salida:",
      },
      institutionName: {
        en: "Institution name:",
        pt: "Nome da instituição de ensino:",
        es: "Nombre de la institución:",
      },
      completionDate: {
        en: "Completion date:",
        pt: "Data de conclusão:",
        es: "Fecha de graduación:",
      },
      degreeObtained: {
        en: "Degree obtained:",
        pt: "Grau obtido:",
        es: "Título obtenido:",
      },
    },
    additional: {
      title: {
        en: "Additional Information",
        pt: "INFORMAÇÕES ADICIONAIS",
        es: "Información Adicional",
      },
      clanTribue: {
        en: "Do you belong to a clan or tribe?",
        pt: "Pertence a um clã ou tribo:",
        es: "¿Pertenece a un clan o tribu?",
      },
      languages: {
        en: "Provide a list of languages you speak (if more than one):",
        pt: "Fornece uma lista de línguas que fala (caso fale mais de uma língua):",
        es: "Proporcione una lista de idiomas que habla (si es más de uno):",
      },
      countries5Years: {
        en: "Have you traveled to any country/region in the last five years?",
        pt: "Viajou para alguma região/país nos últimos cinco anos?",
        es: "¿Ha viajado a algún país/región en los últimos cinco años?",
      },
      yes: { en: "Yes", pt: "Sim", es: "Sí" },
      no: { en: "No", pt: "Não", es: "No" },
      clanNameLabel: {
        en: "Clan or tribe name:",
        pt: "Nome do clã ou tribo:",
        es: "Nombre del clan o tribu:",
      },
      listCountriesLabel: {
        en: "List countries and travel details:",
        pt: "Liste os países e detalhes das viagens:",
        es: "Lista de países y detalles del viaje:",
      },
      travelDetailsPlaceholder: {
        en: "Country, Departure date, Return date, Purpose...",
        pt: "País, Data de partida, Data de retorno, Motivo...",
        es: "País, Fecha de salida, Fecha de regreso, Propósito...",
      },
    },
  },

  // ──── Chat ────
  chat: {
    title: { en: "AI Chat", pt: "Chat IA", es: "Chat IA" },
    subtitle: {
      en: "AI helps organize data and documents. It does not offer legal advice.",
      pt: "A IA ajuda a organizar dados e documentos. Não oferece aconselhamento jurídico.",
      es: "La IA ayuda a organizar datos y documentos. No ofrece asesoría legal.",
    },
    initialMessage: {
      en: "Hello! I'm Aplikei's AI. I can help you organize your data and documents for the process. What would you like to know?\n\n**Remember:** I do not offer legal advice, do not analyze eligibility, and do not guarantee approval.",
      pt: "Olá! Sou a IA da Aplikei. Posso te ajudar a organizar seus dados e documentos para o processo. O que gostaria de saber?\n\n**Lembre-se:** Eu não ofereço aconselhamento jurídico, não analiso elegibilidade e não garanto aprovação.",
      es: "¡Hola! Soy la IA de Aplikei. Puedo ayudarte a organizar tus datos y documentos para el proceso. ¿Qué te gustaría saber?\n\n**Recuerda:** No ofrezco asesoría legal, no analizo elegibilidad y no garantizo aprobación.",
    },
    placeholder: {
      en: "Type your question...",
      pt: "Digite sua pergunta...",
      es: "Escribe tu pregunta...",
    },
    previewResponse: {
      en: "Thanks for your question! The AI system will be connected in the final version. For now, this is a chat preview.",
      pt: "Obrigado pela sua pergunta! Para uma resposta completa, o sistema de IA será conectado na versão final. Por enquanto, este é um preview do chat.",
      es: "¡Gracias por tu pregunta! El sistema de IA se conectará en la versión final. Por ahora, esto es una vista previa del chat.",
    },
    aiProblem: {
      en: "Sorry, I had a problem.",
      pt: "Desculpe, tive um problema.",
      es: "Lo siento, tuve un problema.",
    },
    aiError: {
      en: "Error talking to AI.",
      pt: "Erro ao falar com a IA.",
      es: "Error al hablar con la IA.",
    },
  },

  // ──── Uploads ────
  uploads: {
    title: { en: "Documents", pt: "Documentos", es: "Documentos" },
    subtitle: {
      en: "Upload your documents by category. Accepted: JPG, PNG (max. 10MB).",
      pt: "Envie seus documentos por categoria. Aceitos: JPG, PNG (máx. 10MB).",
      es: "Sube tus documentos por categoría. Aceptados: JPG, PNG (máx. 10MB).",
    },
    tip: {
      en: "Documents must be legible, uncropped, and in good resolution. Scans are preferred over photos.",
      pt: "Documentos devem estar legíveis, sem cortes e em boa resolução. Escaneamentos são preferíveis a fotos.",
      es: "Los documentos deben ser legibles, sin recortes y en buena resolución. Los escaneos son preferibles a las fotos.",
    },
    received: { en: "Received", pt: "Recebido", es: "Recibido" },
    pending: { en: "Pending", pt: "Pendente", es: "Pendiente" },
    resubmit: { en: "Resubmit", pt: "Reenviar", es: "Reenviar" },
    upload: { en: "Upload", pt: "Upload", es: "Subir" },
    docs: {
      en: [
        "Passport (main page)",
        "5x5cm photo",
        "Financial proof",
        "Proof of ties",
      ],
      pt: [
        "Passaporte (página principal)",
        "Foto 5x5cm",
        "Comprovante financeiro",
        "Comprovante de vínculo",
      ],
      es: [
        "Pasaporte (página principal)",
        "Foto 5x5cm",
        "Comprobante financiero",
        "Comprobante de vínculo",
      ],
    },
    successMsg: {
      en: "Document uploaded successfully!",
      pt: "Documento enviado com sucesso!",
      es: "¡Documento subido con éxito!",
    },
    approved: { en: "Approved", pt: "Aprovado", es: "Aprobado" },
    tipLabel: { en: "Tip:", pt: "Dica:", es: "Consejo:" },
    uploadingMsg: { en: "Uploading...", pt: "Enviando...", es: "Subiendo..." },
  },

  // ──── Package PDF ────
  packagePDF: {
    title: {
      en: "Final Package (PDF)",
      pt: "Pacote Final (PDF)",
      es: "Paquete Final (PDF)",
    },
    subtitle: {
      en: "Generate your PDF with final checklist, case summary, and next step instructions.",
      pt: "Gere seu PDF com checklist final, resumo do caso e instruções dos próximos passos.",
      es: "Genera tu PDF con checklist final, resumen del caso e instrucciones de próximos pasos.",
    },
    disclaimer: {
      en: "The Final Package is an organizational summary. It does not constitute legal advice and does not guarantee approval.",
      pt: "O Pacote Final é um resumo organizacional. Não constitui aconselhamento jurídico e não garante aprovação.",
      es: "El Paquete Final es un resumen organizacional. No constituye asesoría legal y no garantiza aprobación.",
    },
    generate: {
      en: "Generate Final Package",
      pt: "Gerar Pacote Final",
      es: "Generar Paquete Final",
    },
    generateDesc: {
      en: "Complete onboarding to generate your personalized PDF.",
      pt: "Complete o onboarding para gerar seu PDF personalizado.",
      es: "Completa el onboarding para generar tu PDF personalizado.",
    },
    generateBtn: {
      en: "Generate PDF (complete onboarding)",
      pt: "Gerar PDF (complete o onboarding)",
      es: "Generar PDF (completa el onboarding)",
    },
    pdfContains: {
      en: "What the PDF contains:",
      pt: "O que o PDF contém:",
      es: "Qué contiene el PDF:",
    },
    pdfItems: {
      en: [
        "Final document checklist",
        "Case summary (provided data)",
        "Next step instructions",
        "Letter templates (when applicable)",
      ],
      pt: [
        "Checklist final de documentos",
        "Resumo do caso (dados fornecidos)",
        "Instruções dos próximos passos",
        "Modelos de cartas (quando aplicável)",
      ],
      es: [
        "Checklist final de documentos",
        "Resumen del caso (datos proporcionados)",
        "Instrucciones de próximos pasos",
        "Modelos de cartas (cuando aplique)",
      ],
    },
    history: {
      en: "PDF History",
      pt: "Histórico de PDFs",
      es: "Historial de PDFs",
    },
    draft: { en: "Draft", pt: "Rascunho", es: "Borrador" },
    download: { en: "Download", pt: "Baixar", es: "Descargar" },
    finalPackage: {
      en: "Final Package",
      pt: "Pacote Final",
      es: "Paquete Final",
    },
  },

  // ──── Help Center ────
  helpCenter: {
    title: {
      en: "Friendly Platform Support",
      pt: "Suporte Amigável da Plataforma",
      es: "Soporte Amigable de la Plataforma",
    },
    subtitle: {
      en: "Our human support team helps you navigate the platform so you can focus on your application.",
      pt: "Nossa equipe de suporte humano ajuda você a navegar pela plataforma para que você possa focar na sua aplicação.",
      es: "Nuestro equipo de soporte humano te ayuda a navegar la plataforma para que puedas enfocarte en tu aplicación.",
    },
    warning: {
      en: "We do not answer questions about strategy, eligibility, chances, or legal advice. Only operational questions about platform usage.",
      pt: "Não respondemos dúvidas de estratégia, elegibilidade, chances ou aconselhamento jurídico. Apenas questões operacionais sobre uso da plataforma.",
      es: "No respondemos preguntas sobre estrategia, elegibilidad, probabilidades o asesoría legal. Solo preguntas operacionales sobre uso de la plataforma.",
    },
    importantText: { en: "Important:", pt: "Importante:", es: "Importante:" },
    weHelpWith: {
      en: "✅ What our support team helps with:",
      pt: "✅ Com o que nosso suporte ajuda:",
      es: "✅ En qué ayuda nuestro equipo de soporte:",
    },
    weHelpItems: {
      en: [
        "How to use the system and navigate the platform",
        "Where and how to upload your documents",
        "How to pay consular/USCIS fees",
        "How to schedule appointments",
        "How to track your process status",
        "How to download your final PDF package",
      ],
      pt: [
        "Como usar o sistema e navegar pela plataforma",
        "Onde e como fazer upload dos seus documentos",
        "Como pagar taxas consulares/USCIS",
        "Como agendar compromissos",
        "Como acompanhar o status do seu processo",
        "Como baixar seu pacote final em PDF",
      ],
      es: [
        "Cómo usar el sistema y navegar la plataforma",
        "Dónde y cómo subir tus documentos",
        "Cómo pagar tarifas consulares/USCIS",
        "Cómo agendar citas",
        "Cómo dar seguimiento al estado de tu proceso",
        "Cómo descargar tu paquete final en PDF",
      ],
    },
    weDoNotLabel: {
      en: "❌ What our support does NOT do:",
      pt: "❌ O que nosso suporte NÃO faz:",
      es: "❌ Lo que nuestro soporte NO hace:",
    },
    weDoNotItems: {
      en: [
        "Provide legal advice or immigration strategy",
        "Analyze eligibility or approval chances",
        "Fill out official government forms for you",
        "Represent you before consulates or USCIS",
        "Guarantee visa or petition approval",
      ],
      pt: [
        "Dar aconselhamento jurídico ou estratégia imigratória",
        "Analisar elegibilidade ou chances de aprovação",
        "Preencher formulários oficiais do governo por você",
        "Representá-lo perante consulados ou USCIS",
        "Garantir aprovação de visto ou petição",
      ],
      es: [
        "Dar asesoría legal o estrategia migratoria",
        "Analizar elegibilidad o probabilidades de aprobación",
        "Llenar formularios oficiales del gobierno por ti",
        "Representarte ante consulados o USCIS",
        "Garantizar la aprobación de visa o petición",
      ],
    },
    faqTitle: {
      en: "Frequently asked questions",
      pt: "Perguntas frequentes",
      es: "Preguntas frecuentes",
    },
    faqItems: [
      {
        q: {
          en: "How do I upload documents?",
          pt: "Como faço upload de documentos?",
          es: "¿Cómo subo documentos?",
        },
        a: {
          en: "Go to Documents in the sidebar, click the Upload button next to each document, and select the file (PDF, JPG, or PNG, max. 10MB).",
          pt: "Vá em Documentos no menu lateral, clique no botão Upload ao lado de cada documento e selecione o arquivo (PDF, JPG ou PNG, máx. 10MB).",
          es: "Ve a Documentos en el menú lateral, haz clic en el botón Subir junto a cada documento y selecciona el archivo (PDF, JPG o PNG, máx. 10MB).",
        },
      },
      {
        q: {
          en: "How do I pay consular/USCIS fees?",
          pt: "Como pago as taxas consulares/USCIS?",
          es: "¿Cómo pago las tarifas consulares/USCIS?",
        },
        a: {
          en: "The guide includes detailed instructions on how to pay fees. It's usually done on the official consulate or USCIS website. Aplikei does not process these fees.",
          pt: "O guia inclui instruções detalhadas sobre como pagar as taxas. Geralmente é feito no site oficial do consulado ou USCIS. A Aplikei não processa essas taxas.",
          es: "La guía incluye instrucciones detalladas sobre cómo pagar las tarifas. Generalmente se hace en el sitio oficial del consulado o USCIS. Aplikei no procesa estas tarifas.",
        },
      },
      {
        q: {
          en: "How do I schedule a consulate interview?",
          pt: "Como agendar a entrevista no consulado?",
          es: "¿Cómo agendo la entrevista en el consulado?",
        },
        a: {
          en: "After paying the MRV fee, visit the CASV website to schedule. The guide explains the step-by-step process.",
          pt: "Após pagar a taxa MRV, acesse o site do CASV para agendar. O guia explica o passo a passo.",
          es: "Después de pagar la tarifa MRV, visita el sitio web del CASV para agendar. La guía explica el paso a paso.",
        },
      },
      {
        q: {
          en: "How do I track my process status?",
          pt: "Como acompanho o status do meu processo?",
          es: "¿Cómo doy seguimiento al estado de mi proceso?",
        },
        a: {
          en: "If applicable, you can check status on the USCIS website with your receipt number. The guide explains how.",
          pt: "Se aplicável, você pode verificar o status no site do USCIS com seu receipt number. O guia explica como.",
          es: "Si aplica, puedes verificar el estado en el sitio de USCIS con tu número de recibo. La guía explica cómo.",
        },
      },
      {
        q: {
          en: "How do I use the AI chat?",
          pt: "Como usar o chat da IA?",
          es: "¿Cómo uso el chat de IA?",
        },
        a: {
          en: "Click 'AI Chat' in the sidebar. AI answers questions about data and document organization. It does not offer legal advice.",
          pt: "Clique em 'Chat IA' no menu lateral. A IA responde perguntas sobre organização de dados e documentos. Ela não oferece aconselhamento jurídico.",
          es: "Haz clic en 'Chat IA' en el menú lateral. La IA responde preguntas sobre organización de datos y documentos. No ofrece asesoría legal.",
        },
      },
    ],
    ticketTitle: {
      en: "Open a help ticket",
      pt: "Abrir ticket de ajuda",
      es: "Abrir ticket de ayuda",
    },
    ticketSubtitle: {
      en: "Select a category and describe your operational question.",
      pt: "Selecione a categoria e descreva sua dúvida operacional.",
      es: "Selecciona la categoría y describe tu pregunta operacional.",
    },
    category: {
      en: "Category (required)",
      pt: "Categoria (obrigatória)",
      es: "Categoría (obligatoria)",
    },
    selectCategory: {
      en: "Select...",
      pt: "Selecione...",
      es: "Selecciona...",
    },
    categories: {
      en: [
        "How to use the system",
        "Where to upload documents",
        "How to pay fees",
        "How to schedule",
        "How to track status",
      ],
      pt: [
        "Como usar o sistema",
        "Onde subir documentos",
        "Como pagar taxas",
        "Como agendar",
        "Como acompanhar status",
      ],
      es: [
        "Cómo usar el sistema",
        "Dónde subir documentos",
        "Cómo pagar tarifas",
        "Cómo agendar",
        "Cómo dar seguimiento",
      ],
    },
    yourQuestion: { en: "Your question", pt: "Sua dúvida", es: "Tu pregunta" },
    questionPlaceholder: {
      en: "Describe your operational question...",
      pt: "Descreva sua dúvida operacional...",
      es: "Describe tu pregunta operacional...",
    },
    submit: { en: "Submit ticket", pt: "Enviar ticket", es: "Enviar ticket" },
  },

  // ──── Legal pages ────
  legal: {
    lastUpdated: {
      en: "Last updated: February 2026",
      pt: "Última atualização: Fevereiro de 2026",
      es: "Última actualización: Febrero de 2026",
    },
    terms: {
      title: { en: "Terms of Use", pt: "Termos de Uso", es: "Términos de Uso" },
      sections: {
        en: [
          {
            title: "1. About Aplikei",
            content:
              "Aplikei is a digital platform that offers step-by-step guides with artificial intelligence assistance for simple immigration processes. Aplikei is not a law firm, does not offer legal advice, and does not guarantee visa or petition approvals.",
          },
          {
            title: "2. Services offered",
            content:
              "When purchasing a guide, the user receives: a step-by-step digital guide, AI access during the process (bonus), N1 operational human support (bonus), and final package PDF generation. Human support is strictly operational and limited to: system usage, document uploads, fee payments, scheduling, and status tracking.",
          },
          {
            title: "3. Limitations",
            content:
              "Aplikei does not: analyze eligibility, offer strategy, assess approval chances, fill out official forms, represent clients before consulates or USCIS, or provide any type of legal advice.",
          },
          {
            title: "4. User responsibility",
            content:
              "The user is responsible for the accuracy of information provided, filling out official forms, submitting applications, and attending interviews. Aplikei is not responsible for decisions made based on the educational content provided.",
          },
          {
            title: "5. Privacy and data",
            content:
              "Data provided is protected under our Privacy Policy. Aplikei uses encryption and security best practices to protect personal information.",
          },
          {
            title: "6. Refund",
            content:
              "See our Refund Policy for detailed information about cancellations and returns.",
          },
        ],
        pt: [
          {
            title: "1. Sobre a Aplikei",
            content:
              "A Aplikei é uma plataforma digital que oferece guias passo a passo com auxílio de inteligência artificial para processos imigratórios simples. A Aplikei não é escritório de advocacia, não oferece aconselhamento jurídico e não garante aprovação de vistos ou petições.",
          },
          {
            title: "2. Serviços oferecidos",
            content:
              "Ao adquirir um guia, o usuário recebe: guia digital passo a passo, acesso à IA durante o processo (bônus), suporte humano N1 operacional (bônus) e geração de pacote final em PDF. O suporte humano é estritamente operacional e limitado a: uso do sistema, upload de documentos, pagamento de taxas, agendamentos e acompanhamento de status.",
          },
          {
            title: "3. Limitações",
            content:
              "A Aplikei não: analisa elegibilidade, oferece estratégia, avalia chances de aprovação, preenche formulários oficiais, representa o cliente perante consulado ou USCIS, ou fornece qualquer tipo de aconselhamento jurídico.",
          },
          {
            title: "4. Responsabilidade do usuário",
            content:
              "O usuário é responsável pela veracidade das informações fornecidas, pelo preenchimento dos formulários oficiais, pela submissão da aplicação e pelo comparecimento a entrevistas. A Aplikei não se responsabiliza por decisões tomadas com base no conteúdo educacional fornecido.",
          },
          {
            title: "5. Privacidade e dados",
            content:
              "Os dados fornecidos são protegidos conforme nossa Política de Privacidade. A Aplikei utiliza criptografia e boas práticas de segurança para proteger informações pessoais.",
          },
          {
            title: "6. Reembolso",
            content:
              "Consulte nossa Política de Reembolso para informações detalhadas sobre cancelamentos e devoluções.",
          },
        ],
        es: [
          {
            title: "1. Sobre Aplikei",
            content:
              "Aplikei es una plataforma digital que ofrece guías paso a paso con asistencia de inteligencia artificial para procesos migratorios simples. Aplikei no es un despacho de abogados, no ofrece asesoría legal y no garantiza la aprobación de visas o peticiones.",
          },
          {
            title: "2. Servicios ofrecidos",
            content:
              "Al adquirir una guía, el usuario recibe: guía digital paso a paso, acceso a la IA durante el proceso (bonus), soporte humano N1 operacional (bonus) y generación de paquete final en PDF. El soporte humano es estrictamente operacional y se limita a: uso del sistema, subida de documentos, pago de tarifas, agendamiento y seguimiento de estado.",
          },
          {
            title: "3. Limitaciones",
            content:
              "Aplikei no: analiza elegibilidad, ofrece estrategia, evalúa probabilidades de aprobación, llena formularios oficiales, representa al cliente ante consulados o USCIS, ni proporciona ningún tipo de asesoría legal.",
          },
          {
            title: "4. Responsabilidad del usuario",
            content:
              "El usuario es responsable de la veracidad de la información proporcionada, del llenado de formularios oficiales, del envío de la solicitud y de asistir a entrevistas. Aplikei no se responsabiliza por decisiones tomadas con base en el contenido educativo proporcionado.",
          },
          {
            title: "5. Privacidad y datos",
            content:
              "Los datos proporcionados están protegidos según nuestra Política de Privacidad. Aplikei utiliza cifrado y buenas prácticas de seguridad para proteger información personal.",
          },
          {
            title: "6. Reembolso",
            content:
              "Consulta nuestra Política de Reembolso para información detallada sobre cancelaciones y devoluciones.",
          },
        ],
      },
      acceptNotice: {
        en: "By using Aplikei, you declare that you have read and agreed to these Terms of Use, the Privacy Policy, and the Disclaimers.",
        pt: "Ao utilizar a Aplikei, você declara ter lido e concordado com estes Termos de Uso, a Política de Privacidade e os Disclaimers.",
        es: "Al usar Aplikei, declaras haber leído y aceptado estos Términos de Uso, la Política de Privacidad y los Avisos.",
      },
    },
    privacy: {
      title: {
        en: "Privacy Policy",
        pt: "Política de Privacidade",
        es: "Política de Privacidad",
      },
      sections: {
        en: [
          {
            title: "1. Data collected",
            content:
              "We collect: registration data (name, email), immigration process data (personal information, documents), platform usage data, and payment data (processed by secure third parties).",
          },
          {
            title: "2. Data usage",
            content:
              "Your data is used to: provide the contracted service, personalize the guide and final package, process payments, provide operational support, and improve the platform.",
          },
          {
            title: "3. Sharing",
            content:
              "We do not sell personal data. We only share with: payment processors, infrastructure services (hosting, database), and when required by law.",
          },
          {
            title: "4. Security",
            content:
              "We use encryption in transit and at rest, access controls, and information security best practices to protect your data.",
          },
          {
            title: "5. Your rights",
            content:
              "You can request access, correction, or deletion of your personal data at any time through the platform's contact channel.",
          },
          {
            title: "6. Cookies",
            content:
              "We use essential cookies for platform operation and analytics cookies to improve user experience.",
          },
        ],
        pt: [
          {
            title: "1. Dados coletados",
            content:
              "Coletamos: dados de cadastro (nome, e-mail), dados do processo imigratório (informações pessoais, documentos), dados de uso da plataforma e dados de pagamento (processados por terceiros seguros).",
          },
          {
            title: "2. Uso dos dados",
            content:
              "Seus dados são utilizados para: fornecer o serviço contratado, personalizar o guia e o pacote final, processar pagamentos, fornecer suporte operacional e melhorar a plataforma.",
          },
          {
            title: "3. Compartilhamento",
            content:
              "Não vendemos dados pessoais. Compartilhamos apenas com: processadores de pagamento, serviços de infraestrutura (hospedagem, banco de dados) e quando exigido por lei.",
          },
          {
            title: "4. Segurança",
            content:
              "Utilizamos criptografia em trânsito e em repouso, controles de acesso e boas práticas de segurança da informação para proteger seus dados.",
          },
          {
            title: "5. Seus direitos",
            content:
              "Você pode solicitar acesso, correção ou exclusão dos seus dados pessoais a qualquer momento através do canal de contato da plataforma.",
          },
          {
            title: "6. Cookies",
            content:
              "Utilizamos cookies essenciais para o funcionamento da plataforma e cookies de análise para melhorar a experiência do usuário.",
          },
        ],
        es: [
          {
            title: "1. Datos recopilados",
            content:
              "Recopilamos: datos de registro (nombre, correo), datos del proceso migratorio (información personal, documentos), datos de uso de la plataforma y datos de pago (procesados por terceros seguros).",
          },
          {
            title: "2. Uso de datos",
            content:
              "Tus datos se utilizan para: proporcionar el servicio contratado, personalizar la guía y el paquete final, procesar pagos, brindar soporte operacional y mejorar la plataforma.",
          },
          {
            title: "3. Compartir",
            content:
              "No vendemos datos personales. Solo compartimos con: procesadores de pago, servicios de infraestructura (hosting, base de datos) y cuando lo exija la ley.",
          },
          {
            title: "4. Seguridad",
            content:
              "Usamos cifrado en tránsito y en reposo, controles de acceso y buenas prácticas de seguridad de la información para proteger tus datos.",
          },
          {
            title: "5. Tus derechos",
            content:
              "Puedes solicitar acceso, corrección o eliminación de tus datos personales en cualquier momento a través del canal de contacto de la plataforma.",
          },
          {
            title: "6. Cookies",
            content:
              "Usamos cookies esenciales para el funcionamiento de la plataforma y cookies de análisis para mejorar la experiencia del usuario.",
          },
        ],
      },
    },
    refund: {
      title: {
        en: "Refund Policy",
        pt: "Política de Reembolso",
        es: "Política de Reembolso",
      },
      sections: {
        en: [
          {
            title: "1. Refund period",
            content:
              "You can request a refund within 7 days of purchase, as long as you have not generated the Final Package (PDF).",
          },
          {
            title: "2. Conditions",
            content:
              "Refund is available when: the Final Package has not been generated, the 7-day period has not been exceeded, and the service has not been used abusively.",
          },
          {
            title: "3. How to request",
            content:
              "To request a refund, open a ticket in the Help Center (N1) selecting the category 'How to use the system' and mentioning your refund request.",
          },
          {
            title: "4. Processing",
            content:
              "The refund will be processed using the same payment method used for the purchase, within 10 business days after approval.",
          },
          {
            title: "5. Exceptions",
            content:
              "We do not offer refunds after generating the Final Package, after the 7-day period, or in cases of platform abuse.",
          },
        ],
        pt: [
          {
            title: "1. Prazo de reembolso",
            content:
              "Você pode solicitar reembolso em até 7 dias após a compra, desde que não tenha gerado o Pacote Final (PDF).",
          },
          {
            title: "2. Condições",
            content:
              "O reembolso está disponível quando: o Pacote Final não foi gerado, o prazo de 7 dias não foi excedido e o serviço não foi utilizado de forma abusiva.",
          },
          {
            title: "3. Como solicitar",
            content:
              'Para solicitar reembolso, abra um ticket na Central de Ajuda (N1) selecionando a categoria "Como usar o sistema" e mencionando sua solicitação de reembolso.',
          },
          {
            title: "4. Processamento",
            content:
              "O reembolso será processado na mesma forma de pagamento utilizada na compra, em até 10 dias úteis após a aprovação da solicitação.",
          },
          {
            title: "5. Exceções",
            content:
              "Não oferecemos reembolso após a geração do Pacote Final, após o prazo de 7 dias, ou em casos de uso abusivo da plataforma.",
          },
        ],
        es: [
          {
            title: "1. Plazo de reembolso",
            content:
              "Puedes solicitar un reembolso dentro de los 7 días posteriores a la compra, siempre que no hayas generado el Paquete Final (PDF).",
          },
          {
            title: "2. Condiciones",
            content:
              "El reembolso está disponible cuando: el Paquete Final no ha sido generado, el plazo de 7 días no ha sido excedido y el servicio no ha sido utilizado de forma abusiva.",
          },
          {
            title: "3. Cómo solicitar",
            content:
              "Para solicitar un reembolso, abre un ticket en el Centro de Ayuda (N1) seleccionando la categoría 'Cómo usar el sistema' y mencionando tu solicitud de reembolso.",
          },
          {
            title: "4. Procesamiento",
            content:
              "El reembolso se procesará con el mismo método de pago utilizado en la compra, dentro de 10 días hábiles después de la aprobación.",
          },
          {
            title: "5. Excepciones",
            content:
              "No ofrecemos reembolso después de generar el Paquete Final, después del plazo de 7 días, o en casos de uso abusivo de la plataforma.",
          },
        ],
      },
    },
    disclaimersPage: {
      title: { en: "Disclaimers", pt: "Disclaimers", es: "Avisos" },
      readCarefully: {
        en: "Read carefully before using the platform.",
        pt: "Leia atentamente antes de utilizar a plataforma.",
        es: "Lee atentamente antes de usar la plataforma.",
      },
      natureTitle: {
        en: "Nature of service",
        pt: "Natureza do serviço",
        es: "Naturaleza del servicio",
      },
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
      offersTitle: {
        en: "What Aplikei offers",
        pt: "O que a Aplikei oferece",
        es: "Qué ofrece Aplikei",
      },
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
      supportTitle: {
        en: "Human Support — Limitations",
        pt: "Suporte Humano — Limitações",
        es: "Soporte Humano — Limitaciones",
      },
      supportDesc: {
        en: "Human support is strictly operational (N1) and limited to:",
        pt: "O suporte humano é apenas operacional (N1) e se limita a:",
        es: "El soporte humano es solo operacional (N1) y se limita a:",
      },
      supportItems: {
        en: [
          "How to use the system",
          "Where to upload documents",
          "How to pay fees",
          "How to schedule",
          "How to track status",
        ],
        pt: [
          "Como usar o sistema",
          "Onde subir documentos",
          "Como pagar taxas",
          "Como agendar",
          "Como acompanhar status",
        ],
        es: [
          "Cómo usar el sistema",
          "Dónde subir documentos",
          "Cómo pagar tarifas",
          "Cómo agendar",
          "Cómo dar seguimiento",
        ],
      },
      supportWarning: {
        en: "We do not answer questions about strategy, eligibility, chances, or legal advice.",
        pt: "Não respondemos dúvidas de estratégia, elegibilidade, chances ou aconselhamento jurídico.",
        es: "No respondemos preguntas sobre estrategia, elegibilidad, probabilidades o asesoría legal.",
      },
      recommendationTitle: {
        en: "Recommendation",
        pt: "Recomendação",
        es: "Recomendación",
      },
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
      title: {
        en: "B1/B2 Consular Visa Guide",
        pt: "Guia Visto Consular B1/B2",
        es: "Guía Visa Consular B1/B2",
      },
      shortTitle: { en: "B1/B2 Visa", pt: "Visto B1/B2", es: "Visa B1/B2" },
      subtitle: {
        en: "Tourism & Business — for foreigners applying from overseas",
        pt: "Turismo e Negócios — para estrangeiros aplicando de fora dos EUA",
        es: "Turismo y Negocios — para extranjeros aplicando desde el exterior",
      },
      dependentPrice: { en: "US$ 50.00", pt: "US$ 50,00", es: "US$ 50,00" },
      price: { en: "US$ 200.00", pt: "US$ 200,00", es: "US$ 200,00" },
      basePrice: 200,
      depPrice: 50,
      originalPrice: { en: "US$ 400.00", pt: "US$ 400,00", es: "US$ 400,00" },
      description: {
        en: "Complete step-by-step guide to apply for the tourism/business visa (B1/B2) at the American consulate. Includes document checklist, DS-160 guidance, and interview preparation.",
        pt: "Guia completo passo a passo para aplicar ao visto de turismo/negócios (B1/B2) no consulado americano. Inclui checklist de documentos, orientação para preenchimento do DS-160 e preparação para a entrevista.",
        es: "Guía completa paso a paso para solicitar la visa de turismo/negocios (B1/B2) en el consulado americano. Incluye checklist de documentos, orientación para el DS-160 y preparación para la entrevista.",
      },
      forWhom: {
        en: [
          "Foreigners living outside the US",
          "First-time or B1/B2 visa renewal",
          "Tourism, family visit, or short business trips",
        ],
        pt: [
          "Estrangeiros que moram fora dos EUA",
          "Primeira vez ou renovação de visto B1/B2",
          "Viagens a turismo, visita familiar ou negócios curtos",
        ],
        es: [
          "Extranjeros que viven fuera de EE.UU.",
          "Primera vez o renovación de visa B1/B2",
          "Viajes de turismo, visita familiar o negocios cortos",
        ],
      },
      notForWhom: {
        en: [
          "Those already in the US wanting to extend their stay",
          "Those needing a work or student visa",
          "Those needing legal representation before the consulate",
        ],
        pt: [
          "Quem já está nos EUA e quer estender permanência",
          "Quem precisa de visto de trabalho ou estudante",
          "Quem precisa de representação legal perante o consulado",
        ],
        es: [
          "Quienes ya están en EE.UU. y quieren extender su estadía",
          "Quienes necesitan visa de trabajo o estudiante",
          "Quienes necesitan representación legal ante el consulado",
        ],
      },
      included: {
        en: [
          "Lifetime access digital step-by-step guide",
          "Complete document checklist",
          "DS-160 filling guidance",
          "Interview preparation tips",
          "Bonus: AI during the process to organize data and documents",
          "Bonus: N1 Operational Human Support (platform usage and basic steps)",
          "Final package in PDF (checklist + summary + instructions)",
        ],
        pt: [
          "Guia digital passo a passo (acesso vitalício)",
          "Checklist completo de documentos",
          "Orientação para preenchimento do DS-160",
          "Dicas de preparação para entrevista",
          "Bônus: IA durante o processo para organizar dados e documentos",
          "Bônus: Suporte humano N1 Operacional (uso da plataforma e passos básicos)",
          "Pacote final em PDF (checklist + resumo + instruções)",
        ],
        es: [
          "Guía digital paso a paso (acceso vitalicio)",
          "Checklist completo de documentos",
          "Orientación para llenado del DS-160",
          "Consejos de preparación para entrevista",
          "Bonus: IA durante el proceso para organizar datos y documentos",
          "Bonus: Soporte humano N1 Operacional (uso de la plataforma y pasos básicos)",
          "Paquete final en PDF (checklist + resumen + instrucciones)",
        ],
      },
      notIncluded: {
        en: [
          "Legal advice or eligibility analysis",
          "Visa approval guarantee",
          "Representation before the consulate",
          "DS-160 form completion for you",
          "Chance analysis or strategy",
          "In-person interview accompaniment",
        ],
        pt: [
          "Aconselhamento jurídico ou análise de elegibilidade",
          "Garantia de aprovação do visto",
          "Representação perante o consulado",
          "Preenchimento do DS-160 por você",
          "Análise de chances ou estratégia",
          "Acompanhamento presencial na entrevista",
        ],
        es: [
          "Asesoría legal o análisis de elegibilidad",
          "Garantía de aprobación de visa",
          "Representación ante el consulado",
          "Llenado del DS-160 por usted",
          "Análisis de probabilidades o estrategia",
          "Acompañamiento presencial en la entrevista",
        ],
      },
      requirements: {
        en: [
          "Valid passport",
          "Recent digital photo (5x5cm, white background)",
          "Financial proof (last 3 months)",
          "Proof of ties to home country (employment, property, family)",
          "Consular fee (MRV) paid",
        ],
        pt: [
          "Passaporte válido",
          "Foto digital recente (5x5cm, fundo branco)",
          "Comprovantes financeiros (últimos 3 meses)",
          "Comprovante de vínculo com o país de origem (emprego, imóvel, família)",
          "Taxa consular (MRV) paga",
        ],
        es: [
          "Pasaporte válido",
          "Foto digital reciente (5x5cm, fondo blanco)",
          "Comprobantes financieros (últimos 3 meses)",
          "Comprobante de vínculo con el país de origen (empleo, inmueble, familia)",
          "Tarifa consular (MRV) pagada",
        ],
      },
      steps: {
        en: [
          "Create your account and accept the terms",
          "Choose the service and make payment",
          "Start the AI-guided onboarding",
          "Fill in your data and upload documents",
          "Review everything and generate your Final Package (PDF)",
          "Follow the instructions to schedule and attend the interview",
        ],
        pt: [
          "Crie sua conta e aceite os termos",
          "Escolha o serviço e realize o pagamento",
          "Inicie o onboarding guiado pela IA",
          "Preencha seus dados e faça upload dos documentos",
          "Revise tudo e gere seu Pacote Final (PDF)",
          "Siga as instruções para agendar e comparecer à entrevista",
        ],
        es: [
          "Crea tu cuenta y acepta los términos",
          "Elige el servicio y realiza el pago",
          "Inicia el onboarding guiado por IA",
          "Completa tus datos y sube los documentos",
          "Revisa todo y genera tu Paquete Final (PDF)",
          "Sigue las instrucciones para agendar y asistir a la entrevista",
        ],
      },
      faq: [
        {
          q: {
            en: "Does Aplikei fill out the DS-160 for me?",
            pt: "A Aplikei preenche o DS-160 para mim?",
            es: "¿Aplikei llena el DS-160 por mí?",
          },
          a: {
            en: "No. We provide detailed guidance so you can fill it out confidently. The guide explains field by field what to enter.",
            pt: "Não. Nós fornecemos orientação detalhada para que você mesmo preencha com confiança. O guia explica campo a campo o que preencher.",
            es: "No. Proporcionamos orientación detallada para que lo llenes con confianza. La guía explica campo por campo qué ingresar.",
          },
        },
        {
          q: {
            en: "Does Aplikei guarantee my visa will be approved?",
            pt: "A Aplikei garante que meu visto será aprovado?",
            es: "¿Aplikei garantiza que mi visa será aprobada?",
          },
          a: {
            en: "No. No company can guarantee visa approval. The decision is exclusively made by the American consulate.",
            pt: "Não. Nenhuma empresa pode garantir aprovação de visto. A decisão é exclusiva do consulado americano.",
            es: "No. Ninguna empresa puede garantizar la aprobación de visa. La decisión es exclusiva del consulado americano.",
          },
        },
        {
          q: {
            en: "Can I use it if I've been denied before?",
            pt: "Posso usar se já tive visto negado?",
            es: "¿Puedo usarlo si me negaron la visa antes?",
          },
          a: {
            en: "Yes, the guide is for anyone applying from overseas. However, we do not offer chance analysis or strategy for prior denial cases.",
            pt: "Sim, o guia serve para qualquer pessoa aplicando de fora dos EUA. Porém, não oferecemos análise de chances ou estratégia para casos de negativa anterior.",
            es: "Sí, la guía es para cualquier persona que aplique desde el exterior. Sin embargo, no ofrecemos análisis de probabilidades o estrategia para casos de negativa previa.",
          },
        },
      ],
    },
    {
      slug: "visto-f1",
      title: {
        en: "F-1 Consular Visa Guide",
        pt: "Guia Visto Consular F-1",
        es: "Guía Visa Consular F-1",
      },
      shortTitle: { en: "F-1 Visa", pt: "Visto F-1", es: "Visa F-1" },
      subtitle: {
        en: "Student — for foreigners applying from overseas",
        pt: "Estudante — para estrangeiros aplicando de fora dos EUA",
        es: "Estudiante — para extranjeros aplicando desde el exterior",
      },
      dependentPrice: { en: "US$ 100.00", pt: "US$ 100,00", es: "US$ 100,00" },
      price: { en: "US$ 350.00", pt: "US$ 350,00", es: "US$ 350,00" },
      basePrice: 350,
      depPrice: 100,
      originalPrice: { en: "US$ 700.00", pt: "US$ 700,00", es: "US$ 700,00" },
      description: {
        en: "Step-by-step guide to apply for the F-1 student visa. Guidance on I-20, DS-160, SEVIS, financial documentation, and consulate interview preparation.",
        pt: "Guia passo a passo para aplicar ao visto de estudante F-1. Orientação sobre I-20, DS-160, SEVIS, documentação financeira e preparação para entrevista no consulado.",
        es: "Guía paso a paso para solicitar la visa de estudiante F-1. Orientación sobre I-20, DS-160, SEVIS, documentación financiera y preparación para la entrevista consular.",
      },
      forWhom: {
        en: [
          "Foreigners accepted at a US educational institution",
          "Those who already have the I-20 from the school/university",
          "Undergraduate, graduate, or language course students",
        ],
        pt: [
          "Estrangeiros aceitos em instituição de ensino nos EUA",
          "Quem já possui I-20 da escola/universidade",
          "Estudantes de graduação, pós-graduação ou cursos de idioma",
        ],
        es: [
          "Extranjeros aceptados en una institución educativa en EE.UU.",
          "Quienes ya tienen el I-20 de la escuela/universidad",
          "Estudiantes de grado, posgrado o cursos de idiomas",
        ],
      },
      notForWhom: {
        en: [
          "Those not yet accepted at any institution",
          "Those needing advice on choosing a school/university",
          "Those already in the US needing to change status",
        ],
        pt: [
          "Quem ainda não foi aceito em nenhuma instituição",
          "Quem precisa de assessoria para escolher escola/universidade",
          "Quem já está nos EUA e precisa trocar status",
        ],
        es: [
          "Quienes aún no han sido aceptados en ninguna institución",
          "Quienes necesitan asesoría para elegir escuela/universidad",
          "Quienes ya están en EE.UU. y necesitan cambiar estatus",
        ],
      },
      included: {
        en: [
          "Lifetime access digital step-by-step guide",
          "Complete F-1 document checklist",
          "I-20, SEVIS, and DS-160 guidance",
          "Consular interview preparation tips",
          "Bonus: AI during the process to organize data and documents",
          "Bonus: N1 Operational Human Support (platform usage and basic steps)",
          "Final package in PDF (checklist + summary + instructions)",
        ],
        pt: [
          "Guia digital passo a passo (acesso vitalício)",
          "Checklist completo de documentos para F-1",
          "Orientação sobre I-20, SEVIS e DS-160",
          "Dicas de preparação para entrevista consular",
          "Bônus: IA durante o processo para organizar dados e documentos",
          "Bônus: Suporte humano N1 Operacional (uso da plataforma e passos básicos)",
          "Pacote final em PDF (checklist + resumo + instruções)",
        ],
        es: [
          "Guía digital paso a paso (acceso vitalicio)",
          "Checklist completo de documentos para F-1",
          "Orientación sobre I-20, SEVIS y DS-160",
          "Consejos de preparación para entrevista consular",
          "Bonus: IA durante el proceso para organizar datos y documentos",
          "Bonus: Soporte humano N1 Operacional (uso de la plataforma y pasos básicos)",
          "Paquete final en PDF (checklist + resumen + instrucciones)",
        ],
      },
      notIncluded: {
        en: [
          "Legal advice or eligibility analysis",
          "Visa approval guarantee",
          "School/university selection advice",
          "Representation before the consulate",
          "Chance analysis or strategy",
        ],
        pt: [
          "Aconselhamento jurídico ou análise de elegibilidade",
          "Garantia de aprovação do visto",
          "Assessoria para escolha de escola/universidade",
          "Representação perante o consulado",
          "Análise de chances ou estratégia",
        ],
        es: [
          "Asesoría legal o análisis de elegibilidad",
          "Garantía de aprobación de visa",
          "Asesoría para elegir escuela/universidad",
          "Representación ante el consulado",
          "Análisis de probabilidades o estrategia",
        ],
      },
      requirements: {
        en: [
          "I-20 issued by the educational institution",
          "Valid passport",
          "SEVIS payment receipt (I-901)",
          "Financial proof (sponsor or own)",
          "Acceptance letter from the institution",
        ],
        pt: [
          "I-20 emitido pela instituição de ensino",
          "Passaporte válido",
          "Comprovante de pagamento SEVIS (I-901)",
          "Comprovantes financeiros (sponsor ou próprios)",
          "Carta de aceitação da instituição",
        ],
        es: [
          "I-20 emitido por la institución educativa",
          "Pasaporte válido",
          "Comprobante de pago SEVIS (I-901)",
          "Comprobantes financieros (patrocinador o propios)",
          "Carta de aceptación de la institución",
        ],
      },
      steps: {
        en: [
          "Create your account and accept the terms",
          "Choose the service and make payment",
          "Start the AI-guided onboarding",
          "Fill in your academic and financial data",
          "Upload documents and the I-20",
          "Review everything and generate your Final Package (PDF)",
          "Follow the instructions to schedule and attend the interview",
        ],
        pt: [
          "Crie sua conta e aceite os termos",
          "Escolha o serviço e realize o pagamento",
          "Inicie o onboarding guiado pela IA",
          "Preencha seus dados acadêmicos e financeiros",
          "Faça upload dos documentos e do I-20",
          "Revise tudo e gere seu Pacote Final (PDF)",
          "Siga as instruções para agendar e comparecer à entrevista",
        ],
        es: [
          "Crea tu cuenta y acepta los términos",
          "Elige el servicio y realiza el pago",
          "Inicia el onboarding guiado por IA",
          "Completa tus datos académicos y financieros",
          "Sube los documentos y el I-20",
          "Revisa todo y genera tu Paquete Final (PDF)",
          "Sigue las instrucciones para agendar y asistir a la entrevista",
        ],
      },
      faq: [
        {
          q: {
            en: "Do I need the I-20 to use the guide?",
            pt: "Preciso já ter o I-20 para usar o guia?",
            es: "¿Necesito tener el I-20 para usar la guía?",
          },
          a: {
            en: "Yes. The guide is for those already accepted by the institution and who have the I-20 in hand.",
            pt: "Sim. O guia é para quem já foi aceito pela instituição e possui o I-20 em mãos.",
            es: "Sí. La guía es para quienes ya fueron aceptados por la institución y tienen el I-20 en mano.",
          },
        },
        {
          q: {
            en: "Does Aplikei help choose a school?",
            pt: "A Aplikei ajuda a escolher a escola?",
            es: "¿Aplikei ayuda a elegir la escuela?",
          },
          a: {
            en: "No. Our focus is on the visa process after institution acceptance.",
            pt: "Não. Nosso foco é no processo de visto após a aceitação pela instituição.",
            es: "No. Nuestro enfoque es en el proceso de visa después de la aceptación por la institución.",
          },
        },
        {
          q: {
            en: "Does the guide work for language courses?",
            pt: "O guia serve para cursos de idioma?",
            es: "¿La guía sirve para cursos de idiomas?",
          },
          a: {
            en: "Yes, as long as the course requires an F-1 visa and you have the I-20.",
            pt: "Sim, desde que o curso exija visto F-1 e você tenha o I-20.",
            es: "Sí, siempre que el curso requiera visa F-1 y tengas el I-20.",
          },
        },
      ],
    },
    {
      slug: "extensao-status",
      title: {
        en: "Status Extension Guide (I-539)",
        pt: "Guia Extensão de Status (I-539)",
        es: "Guía Extensión de Estatus (I-539)",
      },
      shortTitle: {
        en: "Status Extension",
        pt: "Extensão de Status",
        es: "Extensión de Estatus",
      },
      subtitle: {
        en: "For those already in the US needing to extend their stay",
        pt: "Para quem já está nos EUA e precisa estender a permanência",
        es: "Para quienes ya están en EE.UU. y necesitan extender su estadía",
      },
      dependentPrice: { en: "US$ 100.00", pt: "US$ 100,00", es: "US$ 100,00" },
      price: { en: "US$ 200.00", pt: "US$ 200,00", es: "US$ 200,00" },
      basePrice: 200,
      depPrice: 100,
      originalPrice: { en: "US$ 400.00", pt: "US$ 400,00", es: "US$ 400,00" },
      description: {
        en: "Guide to request status extension with USCIS using Form I-539. Ideal for those in the US with a valid visa needing more time before returning.",
        pt: "Guia para solicitar extensão de status junto ao USCIS usando o formulário I-539. Ideal para quem está nos EUA com visto válido e precisa de mais tempo antes de retornar.",
        es: "Guía para solicitar extensión de estatus ante USCIS usando el formulario I-539. Ideal para quienes están en EE.UU. con visa válida y necesitan más tiempo antes de regresar.",
      },
      forWhom: {
        en: [
          "Foreigners already in the US with valid status",
          "Those needing to extend their stay (tourism, visitor, etc.)",
          "Applications within the I-94 validity period",
        ],
        pt: [
          "Estrangeiros que já estão nos EUA com status válido",
          "Quem precisa estender permanência (turismo, visitante, etc.)",
          "Aplicações dentro do prazo de validade do I-94",
        ],
        es: [
          "Extranjeros que ya están en EE.UU. con estatus válido",
          "Quienes necesitan extender su estadía (turismo, visitante, etc.)",
          "Solicitudes dentro del plazo de validez del I-94",
        ],
      },
      notForWhom: {
        en: [
          "Those with expired status (overstay)",
          "Those needing to change visa category",
          "Those needing legal advice on eligibility",
        ],
        pt: [
          "Quem já está com status vencido (overstay)",
          "Quem precisa trocar de categoria de visto",
          "Quem precisa de aconselhamento jurídico sobre elegibilidade",
        ],
        es: [
          "Quienes tienen estatus vencido (overstay)",
          "Quienes necesitan cambiar de categoría de visa",
          "Quienes necesitan asesoría legal sobre elegibilidad",
        ],
      },
      included: {
        en: [
          "Digital step-by-step I-539 guide",
          "Extension document checklist",
          "I-539 filling guidance",
          "USCIS deadlines and fees information",
          "Bonus: AI during the process to organize data and documents",
          "Bonus: N1 Operational Human Support (platform usage and basic steps)",
          "Final package in PDF (checklist + summary + instructions)",
        ],
        pt: [
          "Guia digital passo a passo para I-539",
          "Checklist de documentos para extensão",
          "Orientação sobre preenchimento do I-539",
          "Informações sobre prazos e taxas do USCIS",
          "Bônus: IA durante o processo para organizar dados e documentos",
          "Bônus: Suporte humano N1 Operacional (uso da plataforma e passos básicos)",
          "Pacote final em PDF (checklist + resumo + instruções)",
        ],
        es: [
          "Guía digital paso a paso para I-539",
          "Checklist de documentos para extensión",
          "Orientación sobre llenado del I-539",
          "Información sobre plazos y tarifas de USCIS",
          "Bonus: IA durante el proceso para organizar datos y documentos",
          "Bonus: Soporte humano N1 Operacional (uso de la plataforma y pasos básicos)",
          "Paquete final en PDF (checklist + resumen + instrucciones)",
        ],
      },
      notIncluded: {
        en: [
          "Legal advice or eligibility analysis",
          "Extension approval guarantee",
          "Representation before USCIS",
          "Overstay case analysis",
          "Chance analysis or strategy",
        ],
        pt: [
          "Aconselhamento jurídico ou análise de elegibilidade",
          "Garantia de aprovação da extensão",
          "Representação perante o USCIS",
          "Análise de casos de overstay",
          "Análise de chances ou estratégia",
        ],
        es: [
          "Asesoría legal o análisis de elegibilidad",
          "Garantía de aprobación de extensión",
          "Representación ante USCIS",
          "Análisis de casos de overstay",
          "Análisis de probabilidades o estrategia",
        ],
      },
      requirements: {
        en: [
          "Valid passport",
          "I-94 (US entry record)",
          "Copy of current visa",
          "Financial proof",
          "Justification for extension",
        ],
        pt: [
          "Passaporte válido",
          "I-94 (registro de entrada nos EUA)",
          "Cópia do visto atual",
          "Comprovantes financeiros",
          "Justificativa para extensão",
        ],
        es: [
          "Pasaporte válido",
          "I-94 (registro de entrada en EE.UU.)",
          "Copia de la visa actual",
          "Comprobantes financieros",
          "Justificación para la extensión",
        ],
      },
      steps: {
        en: [
          "Create your account and accept the terms",
          "Choose the service and make payment",
          "Start the AI-guided onboarding",
          "Fill in your data and I-94 information",
          "Upload required documents",
          "Review everything and generate your Final Package (PDF)",
          "Follow the instructions to submit to USCIS",
        ],
        pt: [
          "Crie sua conta e aceite os termos",
          "Escolha o serviço e realize o pagamento",
          "Inicie o onboarding guiado pela IA",
          "Preencha seus dados e informações do I-94",
          "Faça upload dos documentos necessários",
          "Revise tudo e gere seu Pacote Final (PDF)",
          "Siga as instruções para enviar ao USCIS",
        ],
        es: [
          "Crea tu cuenta y acepta los términos",
          "Elige el servicio y realiza el pago",
          "Inicia el onboarding guiado por IA",
          "Completa tus datos e información del I-94",
          "Sube los documentos necesarios",
          "Revisa todo y genera tu Paquete Final (PDF)",
          "Sigue las instrucciones para enviar al USCIS",
        ],
      },
      faq: [
        {
          q: {
            en: "Can I use it if my I-94 has expired?",
            pt: "Posso usar se meu I-94 já venceu?",
            es: "¿Puedo usarlo si mi I-94 ya venció?",
          },
          a: {
            en: "The guide is for applications within the deadline. Overstay situations may involve complexities that require legal advice.",
            pt: "O guia é voltado para aplicações dentro do prazo. Situações de overstay podem envolver complexidades que exigem aconselhamento jurídico.",
            es: "La guía está orientada a solicitudes dentro del plazo. Las situaciones de overstay pueden involucrar complejidades que requieren asesoría legal.",
          },
        },
        {
          q: {
            en: "Does Aplikei submit my application to USCIS?",
            pt: "A Aplikei envia minha aplicação ao USCIS?",
            es: "¿Aplikei envía mi solicitud al USCIS?",
          },
          a: {
            en: "No. We guide the process so you can submit it yourself with confidence.",
            pt: "Não. Nós orientamos o processo para que você envie por conta própria com confiança.",
            es: "No. Orientamos el proceso para que lo envíes por tu cuenta con confianza.",
          },
        },
      ],
    },
    {
      slug: "troca-status",
      title: {
        en: "Change of Status Guide",
        pt: "Guia Troca de Status (Change of Status)",
        es: "Guía Cambio de Estatus",
      },
      shortTitle: {
        en: "Change of Status",
        pt: "Troca de Status",
        es: "Cambio de Estatus",
      },
      subtitle: {
        en: "For those in the US needing to change visa category",
        pt: "Para quem está nos EUA e precisa mudar a categoria do visto",
        es: "Para quienes están en EE.UU. y necesitan cambiar la categoría de visa",
      },
      dependentPrice: { en: "US$ 100.00", pt: "US$ 100,00", es: "US$ 100,00" },
      price: { en: "US$ 350.00", pt: "US$ 350,00", es: "US$ 350,00" },
      basePrice: 350,
      depPrice: 100,
      originalPrice: { en: "US$ 700.00", pt: "US$ 700,00", es: "US$ 700,00" },
      description: {
        en: "Step-by-step guide to request Change of Status within the US via Form I-539 or equivalent. For those needing to change from one visa category to another without leaving the country.",
        pt: "Guia passo a passo para solicitar troca de status (Change of Status) dentro dos EUA via formulário I-539 ou equivalente. Para quem precisa mudar de uma categoria de visto para outra sem sair do país.",
        es: "Guía paso a paso para solicitar cambio de estatus (Change of Status) dentro de EE.UU. vía formulario I-539 o equivalente. Para quienes necesitan cambiar de una categoría de visa a otra sin salir del país.",
      },
      forWhom: {
        en: [
          "Foreigners in the US with valid status needing to change category",
          "Example: B1/B2 to F-1 (when applicable via I-539)",
          "Applications within the I-94 validity period",
        ],
        pt: [
          "Estrangeiros nos EUA com status válido que precisam mudar de categoria",
          "Exemplo: de B1/B2 para F-1 (quando aplicável via I-539)",
          "Aplicações dentro do prazo de validade do I-94",
        ],
        es: [
          "Extranjeros en EE.UU. con estatus válido que necesitan cambiar de categoría",
          "Ejemplo: de B1/B2 a F-1 (cuando aplique vía I-539)",
          "Solicitudes dentro del plazo de validez del I-94",
        ],
      },
      notForWhom: {
        en: [
          "Those with expired status",
          "Those needing a work visa (H-1B, L-1, etc.)",
          "Those needing specialized legal advice",
        ],
        pt: [
          "Quem está com status vencido",
          "Quem precisa de visto de trabalho (H-1B, L-1, etc.)",
          "Quem precisa de aconselhamento jurídico especializado",
        ],
        es: [
          "Quienes tienen estatus vencido",
          "Quienes necesitan visa de trabajo (H-1B, L-1, etc.)",
          "Quienes necesitan asesoría legal especializada",
        ],
      },
      included: {
        en: [
          "Digital step-by-step Change of Status guide",
          "Status change document checklist",
          "Applicable forms guidance",
          "USCIS deadlines and fees information",
          "Bonus: AI during the process to organize data and documents",
          "Bonus: N1 Operational Human Support (platform usage and basic steps)",
          "Final package in PDF (checklist + summary + instructions)",
        ],
        pt: [
          "Guia digital passo a passo para Change of Status",
          "Checklist de documentos para troca de status",
          "Orientação sobre formulários aplicáveis",
          "Informações sobre prazos e taxas do USCIS",
          "Bônus: IA durante o processo para organizar dados e documentos",
          "Bônus: Suporte humano N1 Operacional (uso da plataforma e passos básicos)",
          "Pacote final em PDF (checklist + resumo + instruções)",
        ],
        es: [
          "Guía digital paso a paso para Cambio de Estatus",
          "Checklist de documentos para cambio de estatus",
          "Orientación sobre formularios aplicables",
          "Información sobre plazos y tarifas de USCIS",
          "Bonus: IA durante el proceso para organizar datos y documentos",
          "Bonus: Soporte humano N1 Operacional (uso de la plataforma y pasos básicos)",
          "Paquete final en PDF (checklist + resumen + instrucciones)",
        ],
      },
      notIncluded: {
        en: [
          "Legal advice or eligibility analysis",
          "Status change approval guarantee",
          "Representation before USCIS",
          "Complex or overstay case analysis",
          "Work visa petitions",
        ],
        pt: [
          "Aconselhamento jurídico ou análise de elegibilidade",
          "Garantia de aprovação da troca de status",
          "Representação perante o USCIS",
          "Análise de casos complexos ou de overstay",
          "Petições de visto de trabalho",
        ],
        es: [
          "Asesoría legal o análisis de elegibilidad",
          "Garantía de aprobación del cambio de estatus",
          "Representación ante USCIS",
          "Análisis de casos complejos o de overstay",
          "Peticiones de visa de trabajo",
        ],
      },
      requirements: {
        en: [
          "Valid passport",
          "Valid I-94 (not expired)",
          "Documentation for the new intended category",
          "Financial proof",
          "Justification for the status change",
        ],
        pt: [
          "Passaporte válido",
          "I-94 válido (não vencido)",
          "Documentação da nova categoria pretendida",
          "Comprovantes financeiros",
          "Justificativa para a troca de status",
        ],
        es: [
          "Pasaporte válido",
          "I-94 válido (no vencido)",
          "Documentación de la nueva categoría pretendida",
          "Comprobantes financieros",
          "Justificación para el cambio de estatus",
        ],
      },
      steps: {
        en: [
          "Create your account and accept the terms",
          "Choose the service and make payment",
          "Start the AI-guided onboarding",
          "Fill in your data and process information",
          "Upload required documents",
          "Review everything and generate your Final Package (PDF)",
          "Follow the instructions to submit to USCIS",
        ],
        pt: [
          "Crie sua conta e aceite os termos",
          "Escolha o serviço e realize o pagamento",
          "Inicie o onboarding guiado pela IA",
          "Preencha seus dados e informações do processo",
          "Faça upload dos documentos necessários",
          "Revise tudo e gere seu Pacote Final (PDF)",
          "Siga as instruções para enviar ao USCIS",
        ],
        es: [
          "Crea tu cuenta y acepta los términos",
          "Elige el servicio y realiza el pago",
          "Inicia el onboarding guiado por IA",
          "Completa tus datos e información del proceso",
          "Sube los documentos necesarios",
          "Revisa todo y genera tu Paquete Final (PDF)",
          "Sigue las instrucciones para enviar al USCIS",
        ],
      },
      faq: [
        {
          q: {
            en: "Is every status change possible?",
            pt: "Qualquer troca de status é possível?",
            es: "¿Todo cambio de estatus es posible?",
          },
          a: {
            en: "Not every change is eligible. The guide covers common processes via I-539. For complex situations, we recommend consulting an immigration attorney.",
            pt: "Nem toda troca é elegível. O guia cobre processos comuns via I-539. Para situações complexas, recomendamos consultar um advogado de imigração.",
            es: "No todo cambio es elegible. La guía cubre procesos comunes vía I-539. Para situaciones complejas, recomendamos consultar a un abogado de inmigración.",
          },
        },
        {
          q: {
            en: "Can I change from B1/B2 to F-1?",
            pt: "Posso trocar de B1/B2 para F-1?",
            es: "¿Puedo cambiar de B1/B2 a F-1?",
          },
          a: {
            en: "In many cases, yes, as long as you meet the requirements. The guide walks you through the process but does not analyze individual eligibility.",
            pt: "Em muitos casos, sim, desde que você atenda aos requisitos. O guia orienta o processo, mas não analisa elegibilidade individual.",
            es: "En muchos casos, sí, siempre que cumplas los requisitos. La guía orienta el proceso, pero no analiza elegibilidad individual.",
          },
        },
      ],
    },
  ],

  f1f2: {
    steps: {
      en: [
        "Personal Info 1",
        "Personal Info 2",
        "Travel Info",
        "Travel History",
        "Address & Phone",
        "Social Media",
        "Passport Info",
        "Upload Documents",
      ],
      pt: [
        "Info Pessoal 1",
        "Info Pessoal 2",
        "Info de Viagem",
        "Histórico de Viagem",
        "Endereço e Telefone",
        "Mídias Sociais",
        "Info do Passaporte",
        "Upload de Docs",
      ],
      es: [
        "Info Personal 1",
        "Info Personal 2",
        "Info de Viaje",
        "Historial de Viaje",
        "Dirección y Tel.",
        "Redes Sociales",
        "Info del Pasaporte",
        "Carga de Docs",
      ],
    },
    schoolName: {
      en: "School Name",
      pt: "Nome da Escola/Instituição",
      es: "Nombre de la Escuela/Institución",
    },
    schoolAddress: {
      en: "School Address",
      pt: "Endereço da Escola",
      es: "Dirección de la Escuela",
    },
    courseName: {
      en: "Course Name",
      pt: "Nome do Curso",
      es: "Nombre del Curso",
    },
    courseStartDate: {
      en: "Course Start Date",
      pt: "Data de Início do Curso",
      es: "Fecha de Inicio del Curso",
    },
    courseEndDate: {
      en: "Course End Date",
      pt: "Data de Término do Curso",
      es: "Fecha de Finalización del Curso",
    },
    sevisId: {
      en: "SEVIS ID",
      pt: "SEVIS ID (Nº do documento I-20)",
      es: "SEVIS ID (Nº del I-20)",
    },
    i20Document: {
      en: "I-20 Form (Upload)",
      pt: "Formulário I-20 (Upload)",
      es: "Formulario I-20 (Cargar)",
    },
    i20DocumentDesc: {
      en: "Upload a copy of your signed I-20 form issued by the school.",
      pt: "Faça o upload de uma cópia do seu formulário I-20 assinado, emitido pela instituição de ensino.",
      es: "Cargue una copia de su formulario I-20 firmado, emitido por la institución educativa.",
    },
  },

  // ──── 404 ────
  notFound: {
    title: {
      en: "Page not found",
      pt: "Página não encontrada",
      es: "Página no encontrada",
    },
    back: {
      en: "Return to Home",
      pt: "Voltar ao início",
      es: "Volver al inicio",
    },
  },
} as const;

// Helper type
export type TranslationKey = keyof typeof translations;

export const t = translations;
