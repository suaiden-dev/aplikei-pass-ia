import officeTeamImage from "@assets/images/group-business-executives-discussing-laptop-their-des.jpg";
import heroHomeImage from "@assets/images/herohome.png";
import wernerLogo from "@assets/logos/Logotipo-Werner-Advocacia.png";
import logoHorizontal from "@assets/logos/logo-horizontal-CyOfyqfY.png";
import marquesLogo from "@assets/logos/MARQUES-ADVOGADOS-.png";
import logotipoLogo from "@assets/logos/cropped-LOGOTIPO-Logotipo.webp";
import msgLogo from "@assets/logos/cropped-logo-MSG-azul.png";
import genericLogo from "@assets/logos/4085d7be-8277-487c-af1e-7190ed407c7f-e1729658650101.png";
import mattosLogo from "@assets/logos/Logo-03-1024x818.png";
import overviewVisual from "@assets/landing/solution-overview.svg";
import financeVisual from "@assets/landing/solution-finance.svg";
import productsVisual from "@assets/landing/solution-products.svg";
import caseVisual from "@assets/landing/solution-case.svg";

export type HomePageLang = "pt" | "en" | "es";

export const FIRM_LOGOS = [
  { name: "Werner Advocacia", src: wernerLogo },
  { name: "Logo Horizontal", src: logoHorizontal },
  { name: "Marques Advogados", src: marquesLogo },
  { name: "Logotipo", src: logotipoLogo },
  { name: "MSG Advocacia", src: msgLogo },
  { name: "Advocacia", src: genericLogo },
  { name: "Mattos Advogados", src: mattosLogo },
] as const;

export const MOBILE_SCREEN_UI = {
  pt: {
    nav: "MEUS CASOS",
    title: "VISTO F-1",
    subtitle: "ESTUDANTE/ACADÊMICO",
    office: "ALMEIDA & PARTNERS",
    step: "PREENCHIMENTO DS-160",
    cta: "INICIAR ETAPA 1",
    panel: "PAINEL",
    active: "ATIVO",
    progress: "0%",
    nextStep1: "RECEBER I-20",
    nextStep2: "AGENDAR ENTREVISTA",
  },
  en: {
    nav: "MY CASES",
    title: "F-1 VISA",
    subtitle: "STUDENT/ACADEMIC",
    office: "ALMEIDA & PARTNERS",
    step: "DS-160 FORM",
    cta: "START STEP 1",
    panel: "DASHBOARD",
    active: "ACTIVE",
    progress: "0%",
    nextStep1: "RECEIVE I-20",
    nextStep2: "SCHEDULE INTERVIEW",
  },
  es: {
    nav: "MIS CASOS",
    title: "VISA F-1",
    subtitle: "ESTUDIANTE/ACADÉMICO",
    office: "ALMEIDA & PARTNERS",
    step: "FORMULARIO DS-160",
    cta: "INICIAR ETAPA 1",
    panel: "PANEL",
    active: "ACTIVO",
    progress: "0%",
    nextStep1: "RECIBIR I-20",
    nextStep2: "AGENDAR ENTREVISTA",
  },
} as const;

export const PAIN_ICONS = [
  <svg key={0} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" /><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" /><path d="M14 7h4M16 5v4M5 14v5M3 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  <svg key={1} viewBox="0 0 24 24" fill="none"><path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /></svg>,
  <svg key={2} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="2" /><path d="M12 9v4M9 2h6M12 5V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  <svg key={3} viewBox="0 0 24 24" fill="none"><path d="M12 3l8 4v5c0 4.5-3.2 7.7-8 9-4.8-1.3-8-4.5-8-9V7l8-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
];

export const AUTO_ICONS = [
  <svg key={0} viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  <svg key={1} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  <svg key={2} viewBox="0 0 24 24" fill="none"><path d="M12 3l8 4v5c0 4.5-3.2 7.7-8 9-4.8-1.3-8-4.5-8-9V7l8-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
];

export const EXC_ICONS = [
  <svg key={0} viewBox="0 0 24 24" fill="none"><path d="M4 19V9M10 19V5M16 19v-8M22 19H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  <svg key={1} viewBox="0 0 24 24" fill="none"><path d="M12 3l8 4v5c0 4.5-3.2 7.7-8 9-4.8-1.3-8-4.5-8-9V7l8-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
];

export const T = {
  pt: {
    nav: {
      pain: "Problema", automation: "Solução", howItWorks: "Como funciona",
      pricing: "Planos", signIn: "Entrar", bookDemo: "Agendar demo",
    },
    hero: {
      badge: "Operação digital para escritórios de imigração",
      title: "Transforme seu escritório de imigração em uma",
      titleAccent: "operação digital.",
      lead: "Venda serviços de imigração como soluções digitais, com checkout personalizado, processos organizados, equipe integrada e IA para apoiar a operação.",
      ctaPrimary: "Começar agora", ctaSecondary: "Ver como funciona",
      stat1: { v: "Checkout", l: "personalizado" },
      stat2: { v: "Equipe", l: "integrada" },
      stat3: { v: "IA", l: "na operação" },
      mockTitle: "Casos", mockSearch: "Buscar casos…", mockFilter: "Filtro",
      mockCols: ["Cliente", "Status", "Visto", "Progresso", "Início"],
      floatLabel: "Operação digital",
      statusLabels: { b: "Troca status", g: "Finalizado", "": "Em análise" },
    },
    logos: { label: "Escritórios que já operam com a Aplikei" },
    pain: {
      kicker: "Problema", title: "Seu escritório cresceu. Mas sua operação acompanhou?",
      lead: "Muitos escritórios começam com WhatsApp, planilhas, links de pagamento e documentos enviados por vários canais. No começo funciona. Mas quando o volume cresce, a operação trava: mensagens se perdem, documentos ficam espalhados, pagamentos precisam ser conferidos manualmente e a equipe perde clareza sobre o que está pendente.",
      items: [
        { title: "Mensagens se perdem", desc: "O atendimento vira um fluxo disperso entre canais e ninguém sabe exatamente o que já foi respondido." },
        { title: "Documentos ficam espalhados", desc: "Arquivos chegam por vários lugares e a equipe perde tempo procurando o que deveria estar centralizado." },
        { title: "Pagamentos exigem conferência manual", desc: "O financeiro fica preso em checagens repetitivas e o escritório depende de controles paralelos." },
        { title: "A equipe vira refém do advogado", desc: "Quando não há um sistema claro, o advogado vira o centro de tudo e a operação deixa de escalar." },
      ],
      barText: "O problema não é usar WhatsApp ou planilhas.",
      barSub: "O problema é depender deles para operar processos complexos.",
      barBadge: "Menos improviso. Mais controle.",
    },
    solutions: {
      kicker: "Solução", title: "Tudo o que seu escritório precisa em uma única plataforma.", lead: "Da visão financeira à gestão de soluções e acompanhamento de casos, cada módulo mantém a operação alinhada e mais fácil de escalar.",
      items: [
        { title: "Visão geral", badge: "Painel administrativo" as string | null, desc: "Veja receita, fees, casos ativos e saldo para saque em um só lugar.", visual: overviewVisual },
        { title: "Análise financeira", badge: "Controle de receita" as string | null, desc: "Acompanhe crescimento, desempenho mensal, vendas de soluções e o mix de transações.", visual: financeVisual },
        { title: "Gerenciar soluções", badge: "Catálogo de soluções" as string | null, desc: "Ative vistos, pacotes de mentoria e complementos com preço e controle de status.", visual: productsVisual },
        { title: "Acompanhar o caso", badge: "Fluxo do caso" as string | null, desc: "Siga documentos, etapas de revisão, dados do vendedor e toda a jornada do cliente.", visual: caseVisual },
      ],
    },
    showcase: {
      kicker: "Plataforma em ação",
      title: "Um espaço de trabalho real para equipes que precisam de visibilidade e controle.",
      lead: "A Aplikei mantém finanças, soluções e acompanhamento de casos no mesmo fluxo operacional para o escritório andar com menos atrito.",
      bullets: [
        "Métricas claras para o negócio e para a equipe",
        "Um só lugar para monitorar soluções e casos ativos",
        "Uma experiência mais estruturada para clientes e equipe",
      ],
    },
    automation: {
      kicker: "Aplikei IA",
      title: "IA para reduzir trabalho manual e dar mais velocidade para sua equipe",
      titleAccent: "",
      features: [
        { title: "Treinamento para entrevista consular", desc: "A IA prepara o cliente com perguntas e respostas baseadas no perfil do caso antes da entrevista consular." },
        { title: "Geração de cartas consulares", desc: "Ela redige cartas de suporte e documentos complementares com base nos dados do processo, prontas para revisão do advogado." },
        { title: "Menos trabalho manual", desc: "Mais velocidade, menos retrabalho e um processo mais consistente para toda a equipe." },
      ],
      engineTitle: "",
      engineSub: "",
      engineLive: "",
      aiPanel: {
        clientName: "Carlos Silva",
        clientVisa: "Visto F-1",
        clientStatus: "Em andamento",
        tasks: [
          { done: true, title: "Treinamento para entrevista gerado", sub: "45 perguntas baseadas no perfil do caso" },
          { done: true, title: "Carta de suporte redigida em 18s", sub: "Gerada com base nos dados do processo" },
          { done: false, title: "Revisar e aprovar carta", sub: "Aguardando validação da equipe jurídica" },
        ],
        saved: "3h poupadas neste caso",
      },
      ctaFill: "Começar agora", ctaReview: "Ver como funciona",
    },
    howItWorks: {
      kicker: "Como funciona", title: "Em poucos passos, seu escritório começa a operar de forma digital.",
      lead: "Uma implantação direta, com etapas claras e sem ruído operacional.",
      steps: [
        { n: "01", title: "Cadastre seu escritório", desc: "Configure sua operação, identidade visual, equipe e informações principais." },
        { n: "02", title: "Ative suas soluções", desc: "Crie serviços como B1/B2, F1, RFE, COS, consultorias e outros processos do seu escritório." },
        { n: "03", title: "Configure preço e checkout", desc: "Defina valor, descrição, documentos necessários e gere um link de pagamento personalizado." },
        { n: "04", title: "Gerencie com apoio da IA", desc: "Acompanhe pagamentos, documentos, etapas, responsáveis e repasses com a IA apoiando sua equipe." },
      ],
    },
    excellence: {
      kicker: "Experiência do cliente", title: "O cliente não deveria ficar perdido depois de contratar seu escritório.",
      cards: [
        { title: "Mais clareza", desc: "Cada cliente entra em um fluxo mais claro e organizado, sem depender de mensagens soltas." },
        { title: "Mais profissionalismo", desc: "Sua equipe sabe o que acompanhar e a experiência fica melhor do início ao fim." },
      ],
      mediaLabel: "[ escritório / equipe usando a Aplikei ]",
    },
    testimonials: {
      kicker: "Antes e depois", title: "Da operação improvisada ao processo digital",
      items: [
        { quote: ["Antes a equipe vivia de WhatsApp e planilhas. ", "Agora tudo está centralizado", " em uma operação que conseguimos controlar."], name: "Ricardo Mendes", role: "Sócio · Mendes Lex", initials: "RM", image: officeTeamImage },
        { quote: ["A IA reduziu muito do trabalho repetitivo. ", "Ganhamos organização e velocidade", " sem perder controle jurídico."], name: "Juliana Costa", role: "Operações · GlobalVisa", initials: "JC", image: heroHomeImage },
      ],
    },
    pricing: {
      kicker: "Para quem é", title: "A Aplikei foi criada para escritórios que vendem processos de imigração.",
      plans: [
        { label: "Advogados de imigração", price: "Operação", period: "com mais controle", features: ["Escritórios especializados em vistos", "Consultorias migratórias", "Operação comercial e financeira integrada"], cta: "Começar agora", highlighted: false },
        { label: "Equipes em escala", price: "Equipe", period: "integrada", features: ["Vendedores, gestores e advogados", "Fluxos organizados por função", "Menos dependência de controles paralelos"], cta: "Começar agora", highlighted: true },
        { label: "Escritórios digitais", price: "IA", period: "aplicada", features: ["Venda online de serviços", "Página própria de vendas", "Apoio da IA nas tarefas repetitivas"], cta: "Falar com especialista", highlighted: false },
      ],
    },
    faq: {
      kicker: "FAQ", title: "Dúvidas frequentes",
      lead: "Respostas rápidas sobre compra, uso da plataforma e organização da operação.",
      items: [
        { q: "Como começo a usar a Aplikei?", a: "Crie sua conta, configure seu escritório e ative as soluções que deseja vender. A partir daí, você já pode usar checkout, processos e equipe." },
        { q: "Quais serviços posso vender na plataforma?", a: "Você pode vender vistos, consultorias, RFE, COS e outros serviços de imigração com preço, descrição, documentos e etapas próprias." },
        { q: "Posso migrar casos e clientes antigos?", a: "Sim. A plataforma foi pensada para centralizar a operação e dar continuidade aos casos já existentes sem perder histórico." },
        { q: "A Aplikei substitui o advogado?", a: "Não. Ela organiza a operação e reduz trabalho manual, mas a análise e a decisão continuam com a equipe jurídica." },
      ],
    },
    cta: { title: "Pronto para transformar seu escritório de imigração em uma operação digital?", desc: "Venda seus serviços com checkout personalizado, acompanhe cada cliente em um fluxo organizado e tenha mais controle sobre processos, equipe, pagamentos, repasses e tarefas operacionais com apoio de IA.", btn: "Começar agora" },
    footer: {
      tagline: "Produtos, checkout, processos, equipe, financeiro e inteligência artificial integrados em uma única plataforma.",
      platform: "Plataforma", company: "Empresa", contact: "Contato",
      links: { solve: "Problema", automation: "Solução", how: "Como funciona", pricing: "Planos", about: "Quem somos", security: "Segurança de dados", support: "Falar com especialista" },
      legal: "© 2026 Aplikei Technologies. A Aplikei é uma plataforma de tecnologia, não um escritório de advocacia.",
      terms: "Termos de uso", privacy: "Privacidade",
    },
  },
  en: {
    nav: { pain: "Problem", automation: "Solution", howItWorks: "How it works", pricing: "Plans", signIn: "Sign in", bookDemo: "Book a demo" },
    hero: {
      badge: "Digital operations for immigration firms",
      title: "Turn your immigration firm into a",
      titleAccent: "digital operation.",
      lead: "Sell immigration services as digital solutions, with personalized checkout, organized processes, an integrated team and AI to support the operation.",
      ctaPrimary: "Get started now", ctaSecondary: "See how it works",
      stat1: { v: "Checkout", l: "personalized" }, stat2: { v: "Team", l: "integrated" }, stat3: { v: "AI", l: "in operations" },
      mockTitle: "Cases", mockSearch: "Search cases…", mockFilter: "Filter",
      mockCols: ["Client", "Status", "Visa", "Progress", "Start"],
      floatLabel: "Digital operation",
      statusLabels: { b: "Status change", g: "Done", "": "In review" },
    },
    logos: { label: "Firms already operating with Aplikei" },
    pain: {
      kicker: "Problem", title: "Your firm grew. Did your operation keep up?",
      lead: "Many immigration firms start with WhatsApp, spreadsheets, payment links and documents sent through different channels. It works at first. But as volume grows, the operation breaks: messages get lost, documents are scattered, payments need manual checking, and the team loses clarity about what is pending.",
      items: [
        { title: "Messages get lost", desc: "Support becomes a fragmented flow across channels and nobody knows exactly what has already been answered." },
        { title: "Documents are scattered", desc: "Files arrive from multiple places and the team wastes time looking for what should already be centralized." },
        { title: "Payments need manual checking", desc: "Finance gets stuck in repetitive verification and the firm depends on parallel controls." },
        { title: "The team becomes dependent on the lawyer", desc: "Without a clear system, the lawyer becomes the center of everything and the operation stops scaling." },
      ],
      barText: "The problem is not using WhatsApp or spreadsheets.",
      barSub: "The problem is depending on them to run complex processes.",
      barBadge: "Less improvisation. More control.",
    },
    solutions: {
      kicker: "Solução", title: "A Aplikei organiza sua operação do primeiro clique à conclusão do processo.", lead: "Da visão financeira à gestão de soluções e acompanhamento de casos, cada módulo mantém a operação alinhada e mais fácil de escalar.",
      items: [
        { title: "Visão geral", badge: "Painel administrativo" as string | null, desc: "Veja receita, fees, casos ativos e saldo para saque em um só lugar.", visual: overviewVisual },
        { title: "Análise financeira", badge: "Controle de receita" as string | null, desc: "Acompanhe crescimento, desempenho mensal, vendas de soluções e o mix de transações.", visual: financeVisual },
        { title: "Gerenciar soluções", badge: "Catálogo de soluções" as string | null, desc: "Ative vistos, pacotes de mentoria e complementos com preço e controle de status.", visual: productsVisual },
        { title: "Acompanhar o caso", badge: "Fluxo do caso" as string | null, desc: "Siga documentos, etapas de revisão, dados do vendedor e toda a jornada do cliente.", visual: caseVisual },
      ],
    },
    showcase: {
      kicker: "Plataforma em ação",
      title: "Um espaço de trabalho real para equipes que precisam de visibilidade e controle.",
      lead: "A Aplikei mantém finanças, soluções e acompanhamento de casos no mesmo fluxo operacional para o escritório andar com menos atrito.",
      bullets: [
        "Métricas claras para o negócio e para a equipe",
        "Um só lugar para monitorar soluções e casos ativos",
        "Uma experiência mais estruturada para clientes e equipe",
      ],
    },
    automation: {
      kicker: "Aplikei AI", title: "AI to reduce manual work and give your team more speed.", titleAccent: "in practice",
      features: [
        { title: "Information organization", desc: "AI helps your team organize client data, identify missing items and keep the process clearer." },
        { title: "Operational support", desc: "It can help with operational replies, next steps and repetitive follow-ups without replacing the lawyer." },
        { title: "Less rework", desc: "More speed, more clarity and fewer manual tasks so the operation stays consistent." },
      ],
      engineTitle: "AI applied to operations", engineSub: "Operational assistance active", engineLive: "AI active · focused on routine",
      aiPanel: {
        clientName: "Carlos Silva",
        clientVisa: "F-1 Visa",
        clientStatus: "In progress",
        tasks: [
          { done: true, title: "3 pending items found", sub: "Documents organized automatically" },
          { done: true, title: "Follow-up sent in 12s", sub: "Generated by AI without manual input" },
          { done: false, title: "Request updated I-20", sub: "Next step suggested by AI" },
        ],
        saved: "2h saved on this case",
      },
      ctaFill: "Get started now", ctaReview: "See how it works",
    },
    howItWorks: {
      kicker: "How it works", title: "In a few steps, your firm starts operating digitally.",
      lead: "A direct rollout with clear steps and no operational noise.",
      steps: [
        { n: "01", title: "Register your firm", desc: "Set up your operation, brand identity, team and key information." },
        { n: "02", title: "Activate your solutions", desc: "Create services like B1/B2, F1, RFE, COS, consultations and other processes your firm offers." },
        { n: "03", title: "Configure price and checkout", desc: "Define value, description, required documents and generate a personalized payment link." },
        { n: "04", title: "Manage with AI support", desc: "Track payments, documents, steps, owners and payouts while AI helps your team stay organized." },
      ],
    },
    excellence: {
      kicker: "Client experience", title: "Clients should not feel lost after hiring your firm.",
      cards: [
        { title: "More clarity", desc: "Each client enters a clearer, organized flow without depending on scattered messages." },
        { title: "More professionalism", desc: "Your team knows what to follow and the experience improves from start to finish." },
      ],
      mediaLabel: "[ office / team using Aplikei ]",
    },
    testimonials: {
      kicker: "Before and after", title: "From improvised operation to digital process",
      items: [
        { quote: ["Before, the team lived on WhatsApp and spreadsheets. ", "Now everything is centralized", " in an operation we can actually control."], name: "Ricardo Mendes", role: "Partner · Mendes Lex", initials: "RM", image: officeTeamImage },
        { quote: ["AI reduced a lot of repetitive work. ", "We gained organization and speed", " without losing legal control."], name: "Juliana Costa", role: "Operations · GlobalVisa", initials: "JC", image: heroHomeImage },
      ],
    },
    pricing: {
      kicker: "Who it's for", title: "Aplikei was built for firms that sell immigration processes.",
      plans: [
        { label: "Immigration lawyers", price: "Operation", period: "with more control", features: ["Firms specialized in visas", "Migration consultancies", "Integrated commercial and financial operation"], cta: "Get started now", highlighted: false },
        { label: "Scaling teams", price: "Team", period: "integrated", features: ["Sales, managers and lawyers", "Flows organized by role", "Less dependence on parallel controls"], cta: "Get started now", highlighted: true },
        { label: "Digital firms", price: "AI", period: "applied", features: ["Sell services online", "Own sales page", "AI support for repetitive tasks"], cta: "Talk to a specialist", highlighted: false },
      ],
    },
    faq: {
      kicker: "FAQ", title: "Common questions",
      lead: "Quick answers about getting started, using the platform and managing your operation.",
      items: [
        { q: "How do I get started with Aplikei?", a: "Create your account, set up your firm and activate the solutions you want to sell. Then you can start using checkout, processes and team workflows." },
        { q: "What services can I sell on the platform?", a: "You can sell visas, consultations, RFE, COS and other immigration services with their own price, description, documents and workflow." },
        { q: "Can I migrate existing clients and cases?", a: "Yes. The platform is designed to centralize your operation and continue existing cases without losing history." },
        { q: "Does Aplikei replace the lawyer?", a: "No. It organizes the operation and reduces manual work, but the legal analysis and final decisions stay with your team." },
      ],
    },
    cta: { title: "Ready to turn your immigration firm into a digital operation?", desc: "Sell your services with personalized checkout, track each client in an organized flow and gain more control over processes, team, payments, payouts and operational tasks with AI support.", btn: "Get started now" },
    footer: {
      tagline: "Solutions, checkout, processes, team, finance and artificial intelligence integrated in one platform.",
      platform: "Platform", company: "Company", contact: "Contact",
      links: { solve: "Problem", automation: "Solution", how: "How it works", pricing: "Plans", about: "Who we are", security: "Data security", support: "Talk to a specialist" },
      legal: "© 2026 Aplikei Technologies. Aplikei is a technology platform, not a law firm.",
      terms: "Terms", privacy: "Privacy",
    },
  },
  es: {
    nav: { pain: "Problemas", automation: "Automatización", howItWorks: "Cómo funciona", pricing: "Planes", signIn: "Ingresar", bookDemo: "Agendar demo" },
    hero: {
      badge: "Plataforma de visas consulares", title: "La plataforma completa para gestionar", titleAccent: "visas consulares",
      lead: "Venda servicios migratorios como soluciones digitales, con checkout personalizado, procesos organizados, equipo integrado e IA para apoyar la operación.",
      ctaPrimary: "Comenzar ahora", ctaSecondary: "Ver la plataforma",
      stat1: { v: "−70%", l: "tiempo de preparación" }, stat2: { v: "3×", l: "más casos por equipo" }, stat3: { v: "+10 mil", l: "procesos organizados" },
      mockTitle: "Casos", mockSearch: "Buscar casos…", mockFilter: "Filtro",
      mockCols: ["Cliente", "Estado", "Visa", "Progreso", "Inicio"],
      floatLabel: "Tiempo de preparación",
      statusLabels: { b: "Cambio estatus", g: "Finalizado", "": "En revisión" },
    },
    logos: { label: "Firmas que ya organizan visas consulares en Aplikei" },
    pain: {
      kicker: "Diagnóstico", title: "Problemas que resolvemos",
      lead: "Falta de dirección, retrabajo documental y comunicación fragmentada retrasan decisiones críticas. Centralizamos la estrategia y convertimos cada etapa en ejecución predecible.",
      items: [
        { title: "Procesos dispersos", desc: "Flujos fragmentados entre correos, carpetas locales y mensajes que generan caos operativo." },
        { title: "Control manual", desc: "Hojas de cálculo y notas susceptibles a errores humanos críticos." },
        { title: "Tiempo desperdiciado", desc: "Horas gastadas en tareas puramente burocráticas y repetitivas." },
        { title: "Falta de estándar", desc: "Inconsistencia en la entrega que compromete la credibilidad de la firma." },
      ],
      barText: "De la incertidumbre al plan de acción",
      barSub: "Transformamos la incertidumbre en etapas, responsables y plazos predecibles.",
      barBadge: "Menos retrabajo. Más claridad.",
    },
    solutions: {
      kicker: "La plataforma", title: "Su operación en otro nivel", lead: "Desde visibilidad financiera hasta gestión de soluciones y seguimiento del caso, cada módulo mantiene la operación alineada y lista para escalar.",
      items: [
        { title: "Overview", badge: "Panel admin" as string | null, desc: "Vea ingresos, fees, casos activos y saldo disponible para retiro en un solo lugar.", visual: overviewVisual },
        { title: "Análisis de finanzas", badge: "Control de ingresos" as string | null, desc: "Siga el crecimiento, el rendimiento mensual, las ventas por solución y la mezcla de transacciones.", visual: financeVisual },
        { title: "Gestionar soluciones", badge: "Catálogo" as string | null, desc: "Active visas, mentorías y complementos con precios y control de estado.", visual: productsVisual },
        { title: "Acompañar el caso", badge: "Flujo del caso" as string | null, desc: "Siga documentos, revisiones, datos del vendedor y todo el recorrido del cliente.", visual: caseVisual },
      ],
    },
    showcase: {
      kicker: "Platform in action",
      title: "A real workspace for teams that need visibility and control.",
      lead: "Aplikei keeps finance, solutions and case tracking in the same operational flow so the office moves with less friction.",
      bullets: [
        "Clear metrics for the business and the team",
        "One place to monitor solutions and active cases",
        "A more structured experience for clients and staff",
      ],
    },
    automation: {
      kicker: "Inteligencia aplicada", title: "Su gestión de visas consulares", titleAccent: "potenciada por IA",
      features: [
        { title: "Formularios consulares más simples", desc: "Presentamos los formularios consulares de forma más clara y guiada para el cliente, con revisión del equipo administrativo antes del envío." },
        { title: "Portal del cliente simplificado", desc: "Ofrezca una interfaz limpia para carga segura de documentos y seguimiento del estado en tiempo real." },
        { title: "Cartas con apoyo de IA", desc: "Use IA para redactar cartas con más agilidad, manteniendo la revisión y aprobación final por parte de su equipo." },
      ],
      engineTitle: "Motor de automatización consular", engineSub: "Automatización de formularios consulares activa", engineLive: "IA activa · 99% precisión",
      aiPanel: {
        clientName: "Carlos Silva",
        clientVisa: "Visa F-1",
        clientStatus: "En proceso",
        tasks: [
          { done: true, title: "DS-160 completado y validado", sub: "Doble validación aprobada automáticamente" },
          { done: true, title: "Carta generada en 12s", sub: "Redactada con apoyo de IA" },
          { done: false, title: "Subir documentos de soporte", sub: "Próximo paso en el portal del cliente" },
        ],
        saved: "2h ahorradas en este caso",
      },
      ctaFill: "Iniciar llenado", ctaReview: "Revisar respuestas",
    },
    howItWorks: {
      kicker: "Comience en minutos", title: "Del registro a la entrega",
      lead: "Un flujo directo, con etapas claras y sin ruido operativo.",
      steps: [
        { n: "01", title: "Cree su cuenta", desc: "Regístrese en la plataforma de forma rápida y segura en pocos clics." },
        { n: "02", title: "Configure la firma", desc: "Configure su firma y equipo con pocos pasos simples y automatizados." },
        { n: "03", title: "Centralice los casos", desc: "Importe los casos actuales y organice los documentos en un solo lugar." },
        { n: "04", title: "Gestione y entregue", desc: "Comience a gestionar los procesos de visa de sus clientes con calidad consistente." },
      ],
    },
    excellence: {
      kicker: "Excelencia garantizada", title: "Excelencia institucional en cada proceso.",
      cards: [
        { title: "Ganancia de productividad", desc: "Atienda 3× más clientes con el mismo equipo operativo." },
        { title: "Reducción de errores", desc: "Minimice RFEs con la doble validación automatizada." },
      ],
      mediaLabel: "[ foto de la oficina / equipo usando la plataforma ]",
    },
    testimonials: {
      kicker: "Lo que dicen los socios", title: "Comprobado por firmas que escalaron",
      items: [
        { quote: ["La implementación de Aplikei transformó drásticamente nuestra entrega. ", "Redujimos el tiempo operativo en 60%", " en la preparación de documentos de visas consulares."], name: "Ricardo Mendes", role: "Socio · Mendes Lex", initials: "RM", image: officeTeamImage },
        { quote: ["Por fin una plataforma que entiende la burocracia de las visas consulares. ", "La automatización de formularios es quirúrgica", " y extremadamente confiable."], name: "Juliana Costa", role: "Líder de Operaciones · GlobalVisa", initials: "JC", image: heroHomeImage },
      ],
    },
    pricing: {
      kicker: "Planes", title: "Comience con el plan de su tamaño",
      plans: [
        { label: "Variable", price: "10%", period: "de la facturación", features: ["Modelo variable por ingresos", "Acceso a la plataforma", "Operación consular centralizada"], cta: "Elegir", highlighted: false },
        { label: "Hasta 10 casos", price: "US$ 2.000", period: "por mes", features: ["Hasta 10 casos activos", "Portal del cliente", "Formularios consulares guiados"], cta: "Comenzar ahora", highlighted: true },
        { label: "Hasta 30 casos", price: "US$ 4.000", period: "por mes", features: ["Hasta 30 casos activos", "Equipo multiusuario", "Flujos estandarizados"], cta: "Hablar con ventas", highlighted: false },
      ],
    },
    faq: {
      kicker: "FAQ", title: "Preguntas frecuentes",
      lead: "Respuestas rápidas sobre cómo empezar, qué vender y cómo organizar la operación.",
      items: [
        { q: "¿Cómo empiezo a usar Aplikei?", a: "Cree su cuenta, configure su oficina y active las soluciones que desea vender. Después ya puede usar checkout, procesos y equipo." },
        { q: "¿Qué servicios puedo vender en la plataforma?", a: "Puede vender visas, consultas, RFE, COS y otros servicios migratorios con su propio precio, descripción, documentos y flujo." },
        { q: "¿Puedo migrar clientes y casos existentes?", a: "Sí. La plataforma fue pensada para centralizar la operación y continuar con los casos ya abiertos sin perder historial." },
        { q: "¿Aplikei reemplaza al abogado?", a: "No. Organiza la operación y reduce el trabajo manual, pero el análisis legal y las decisiones finales siguen siendo de su equipo." },
      ],
    },
    cta: { title: "¿Listo para escalar su operación?", desc: "Únase a las firmas que ya organizan miles de procesos de visas consulares con precisión y tecnología moderna.", btn: "Comenzar ahora" },
    footer: {
      tagline: "Simplificando la gestión de visas consulares con tecnología y automatización.",
      platform: "Plataforma", company: "Empresa", contact: "Contacto",
      links: { solve: "Qué resolvemos", automation: "Automatización", how: "Cómo funciona", pricing: "Planes", about: "Quiénes somos", security: "Seguridad de datos", support: "Soporte" },
      legal: "© 2026 Aplikei Technologies. Aplikei es una plataforma de tecnología, no un estudio de abogados.",
      terms: "Términos", privacy: "Privacidad",
    },
  },
} as const;
