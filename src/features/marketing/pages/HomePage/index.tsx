import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@shared/hooks/useAuth";
import { useLocale } from "@app/app/i18n";
import { useTheme } from "@shared/hooks/useTheme";
import { useDemoBooking } from "@shared/components/organisms/DemoBookingModal";
import { getDefaultRouteForRole } from "@app/app/router/authRedirect";
import officeTeamImage from "@assets/images/group-business-executives-discussing-laptop-their-des.jpg";
import heroHomeImage from "@assets/images/herohome.png";
import wernerLogo from "@assets/logos/Logotipo-Werner-Advocacia.png";
import marquesLogo from "@assets/logos/MARQUES-ADVOGADOS-.png";
import msgLogo from "@assets/logos/cropped-logo-MSG-azul.png";
import overviewVisual from "@assets/landing/solution-overview.svg";
import financeVisual from "@assets/landing/solution-finance.svg";
import productsVisual from "@assets/landing/solution-products.svg";
import caseVisual from "@assets/landing/solution-case.svg";
import { PublicFooter } from "@shared/components/organisms/PublicFooter";
import "./landing.css";

type Lang = "pt" | "en" | "es";

const MOBILE_SCREEN_UI = {
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

function MobilePlatformShowcase({ lang }: { lang: Lang }) {
  const ui = MOBILE_SCREEN_UI[lang];

  return (
    <div className="lp-mobile-stage" aria-hidden="true">
      <div className="lp-mobile-orb" />
      <div className="lp-mobile-card lp-mobile-card-back">
        <div className="lp-mobile-topbar">
          <span className="lp-mobile-menu" />
          <strong>{ui.panel}</strong>
          <span className="lp-mobile-bell" />
        </div>
        <div className="lp-mobile-body">
          <h4>{ui.panel}</h4>
          <p>{ui.subtitle}</p>
          <div className="lp-mobile-case-card">
            <div className="lp-mobile-case-head">
              <span className="lp-mobile-globe" />
              <span className="lp-mobile-pill">{ui.active}</span>
            </div>
            <h5>Reaplicação F-1</h5>
            <span className="lp-mobile-case-state">{ui.active}</span>
            <span className="lp-mobile-office">{ui.office}</span>
            <div className="lp-mobile-progress-head">
              <span>PROGRESSO</span>
              <strong>{ui.progress}</strong>
            </div>
            <div className="lp-mobile-progress-bar"><i /></div>
          </div>
        </div>
      </div>

      <div className="lp-mobile-card lp-mobile-card-front">
        <div className="lp-mobile-topbar">
          <span className="lp-mobile-menu" />
          <strong>{ui.nav}</strong>
          <span className="lp-mobile-bell" />
        </div>
        <div className="lp-mobile-body">
          <div className="lp-mobile-breadcrumb">← {ui.nav}</div>
          <div className="lp-mobile-detail-head">
            <span className="lp-mobile-appmark">A</span>
            <div>
              <h4>{ui.title}</h4>
              <p>{ui.subtitle}</p>
              <span className="lp-mobile-office">{ui.office}</span>
            </div>
          </div>
          <div className="lp-mobile-step-card">
            <div className="lp-mobile-step-num">1</div>
            <div>
              <h5>{ui.step}</h5>
              <p>{ui.subtitle}</p>
            </div>
            <div className="lp-mobile-step-box">
              <p>{ui.subtitle}</p>
              <button type="button">{ui.cta}</button>
            </div>
          </div>
          <div className="lp-mobile-step-lite">
            <span />
            <div>
              <h6>{ui.nextStep1}</h6>
              <p>I-20</p>
            </div>
          </div>
          <div className="lp-mobile-step-lite">
            <span />
            <div>
              <h6>{ui.nextStep2}</h6>
              <p>DS-160</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Inline translations ────────────────────────────────────────────
const T = {
  pt: {
    nav: {
      pain: "Problema", automation: "Solução", howItWorks: "Como funciona",
      pricing: "Planos", signIn: "Entrar", bookDemo: "Agendar demo",
    },
    hero: {
      badge: "Operação digital para escritórios de imigração",
      title: "Transforme seu escritório de imigração em uma",
      titleAccent: "operação digital.",
      lead: "Venda serviços de imigração como produtos digitais, com checkout personalizado, processos organizados, equipe integrada e IA para apoiar a operação.",
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
      kicker: "Solução", title: "Everything your firm needs in one platform.", lead: "From financial visibility to product management and case tracking, each module keeps the operation aligned and easier to scale.",
      items: [
        { title: "Overview", badge: "Admin dashboard" as string | null, desc: "See revenue, fees, active cases and withdrawal balance in one place.", visual: overviewVisual },
        { title: "Finance analysis", badge: "Revenue control" as string | null, desc: "Track growth, monthly performance, product sales and the transaction mix.", visual: financeVisual },
        { title: "Manage products", badge: "Product catalog" as string | null, desc: "Activate visas, mentoring packages and add-ons with pricing and status controls.", visual: productsVisual },
        { title: "Track the case", badge: "Case flow" as string | null, desc: "Follow documents, review steps, seller data and the full client journey.", visual: caseVisual },
      ],
    },
    showcase: {
      kicker: "Platform in action",
      title: "A real workspace for teams that need visibility and control.",
      lead: "Aplikei keeps finance, products and case tracking in the same operational flow so the office moves with less friction.",
      bullets: [
        "Clear metrics for the business and the team",
        "One place to monitor products and active cases",
        "A more structured experience for clients and staff",
      ],
    },
    automation: {
      kicker: "Aplikei IA",
      title: "IA para reduzir trabalho manual e dar mais velocidade para sua equipe.",
      titleAccent: "na prática",
      features: [
        { title: "Organização de informações", desc: "A IA ajuda sua equipe a organizar dados do cliente, identificar pendências e manter o processo mais claro." },
        { title: "Suporte operacional", desc: "Ela pode apoiar respostas operacionais, próximos passos e cobranças repetitivas sem tomar o lugar do advogado." },
        { title: "Menos retrabalho", desc: "Mais velocidade, mais clareza e menos tarefas manuais para a operação ficar consistente." },
      ],
      engineTitle: "IA aplicada à operação",
      engineSub: "Assistência operacional ativa",
      engineLive: "IA ativa · foco na rotina",
      rows: [
        { k: "Fluxo principal", v: "Produtos, checkout e processos" },
        { k: "Vistos suportados", v: "B1/B2 · F-1 · RFE · COS" },
        { k: "Tempo estimado", v: "24s (−55 min)" },
        { k: "Validação de campos", v: "Dupla validação ok" },
      ],
      ctaFill: "Começar agora", ctaReview: "Ver como funciona",
    },
    howItWorks: {
      kicker: "Como funciona", title: "Em poucos passos, seu escritório começa a operar de forma digital.",
      lead: "Uma implantação direta, com etapas claras e sem ruído operacional.",
      steps: [
        { n: "01", title: "Cadastre seu escritório", desc: "Configure sua operação, identidade visual, equipe e informações principais." },
        { n: "02", title: "Ative seus produtos", desc: "Crie serviços como B1/B2, F1, RFE, COS, consultorias e outros processos do seu escritório." },
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
        { q: "Como começo a usar a Aplikei?", a: "Crie sua conta, configure seu escritório e ative os produtos que deseja vender. A partir daí, você já pode usar checkout, processos e equipe." },
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
      lead: "Sell immigration services as digital products, with personalized checkout, organized processes, an integrated team and AI to support the operation.",
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
      kicker: "Solution", title: "Aplikei organizes your operation from the first click to process completion.", lead: "From financial visibility to product management and case tracking, each module keeps the operation aligned and easier to scale.",
      items: [
        { title: "Overview", badge: "Admin dashboard" as string | null, desc: "See revenue, fees, active cases and withdrawal balance in one place.", visual: overviewVisual },
        { title: "Finance analysis", badge: "Revenue control" as string | null, desc: "Track growth, monthly performance, product sales and the transaction mix.", visual: financeVisual },
        { title: "Manage products", badge: "Product catalog" as string | null, desc: "Activate visas, mentoring packages and add-ons with pricing and status controls.", visual: productsVisual },
        { title: "Track the case", badge: "Case flow" as string | null, desc: "Follow documents, review steps, seller data and the full client journey.", visual: caseVisual },
      ],
    },
    showcase: {
      kicker: "Platform in action",
      title: "A real workspace for teams that need visibility and control.",
      lead: "Aplikei keeps finance, products and case tracking in the same operational flow so the office moves with less friction.",
      bullets: [
        "Clear metrics for the business and the team",
        "One place to monitor products and active cases",
        "A more structured experience for clients and staff",
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
      rows: [
        { k: "Main flow", v: "Products, checkout and processes" }, { k: "Supported visas", v: "B1/B2 · F-1 · RFE · COS" },
        { k: "Estimated time", v: "24s (−55 min)" }, { k: "Field validation", v: "Double check done" },
      ],
      ctaFill: "Get started now", ctaReview: "See how it works",
    },
    howItWorks: {
      kicker: "How it works", title: "In a few steps, your firm starts operating digitally.",
      lead: "A direct rollout with clear steps and no operational noise.",
      steps: [
        { n: "01", title: "Register your firm", desc: "Set up your operation, brand identity, team and key information." },
        { n: "02", title: "Activate your products", desc: "Create services like B1/B2, F1, RFE, COS, consultations and other processes your firm offers." },
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
        { q: "How do I get started with Aplikei?", a: "Create your account, set up your firm and activate the products you want to sell. Then you can start using checkout, processes and team workflows." },
        { q: "What services can I sell on the platform?", a: "You can sell visas, consultations, RFE, COS and other immigration services with their own price, description, documents and workflow." },
        { q: "Can I migrate existing clients and cases?", a: "Yes. The platform is designed to centralize your operation and continue existing cases without losing history." },
        { q: "Does Aplikei replace the lawyer?", a: "No. It organizes the operation and reduces manual work, but the legal analysis and final decisions stay with your team." },
      ],
    },
    cta: { title: "Ready to turn your immigration firm into a digital operation?", desc: "Sell your services with personalized checkout, track each client in an organized flow and gain more control over processes, team, payments, payouts and operational tasks with AI support.", btn: "Get started now" },
    footer: {
      tagline: "Products, checkout, processes, team, finance and artificial intelligence integrated in one platform.",
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
      lead: "Venda servicios migratorios como productos digitales, con checkout personalizado, procesos organizados, equipo integrado e IA para apoyar la operación.",
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
      kicker: "La plataforma", title: "Su operación en otro nivel", lead: "Desde visibilidad financiera hasta gestión de productos y seguimiento del caso, cada módulo mantiene la operación alineada y lista para escalar.",
      items: [
        { title: "Overview", badge: "Panel admin" as string | null, desc: "Vea ingresos, fees, casos activos y saldo disponible para retiro en un solo lugar.", visual: overviewVisual },
        { title: "Análisis de finanzas", badge: "Control de ingresos" as string | null, desc: "Siga el crecimiento, el rendimiento mensual, las ventas por producto y la mezcla de transacciones.", visual: financeVisual },
        { title: "Gestionar productos", badge: "Catálogo" as string | null, desc: "Active visas, mentorías y complementos con precios y control de estado.", visual: productsVisual },
        { title: "Acompañar el caso", badge: "Flujo del caso" as string | null, desc: "Siga documentos, revisiones, datos del vendedor y todo el recorrido del cliente.", visual: caseVisual },
      ],
    },
    showcase: {
      kicker: "Platform in action",
      title: "A real workspace for teams that need visibility and control.",
      lead: "Aplikei keeps finance, products and case tracking in the same operational flow so the office moves with less friction.",
      bullets: [
        "Clear metrics for the business and the team",
        "One place to monitor products and active cases",
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
      rows: [
        { k: "Flujo principal", v: "Formularios consulares guiados" }, { k: "Visas soportadas", v: "B1/B2 · F-1 · cambio y extensión" },
        { k: "Tiempo estimado", v: "24s (−55 min)" }, { k: "Validación de campos", v: "Doble validación ok" },
      ],
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
        { q: "¿Cómo empiezo a usar Aplikei?", a: "Cree su cuenta, configure su oficina y active los productos que desea vender. Después ya puede usar checkout, procesos y equipo." },
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

// ── SVG icons ──────────────────────────────────────────────────────
const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="13" height="13"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
);

// ── Reveal on scroll ───────────────────────────────────────────────
function useReveal(containerRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const els = Array.from(container.querySelectorAll(".lp-reveal"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px -50px 0px" },
    );
    els.forEach((el) => io.observe(el));
    setTimeout(() => {
      container.querySelectorAll(".lp-reveal:not(.in)").forEach((el) => el.classList.add("in"));
    }, 2500);
    return () => io.disconnect();
  }, [containerRef]);
}

function HeroArtwork() {
  return (
    <div className="lp-hero-art" aria-hidden="true">
      <div className="lp-hero-art-ring" />
      <div className="lp-hero-art-circle" />
      <div className="lp-hero-art-badge">
        <span className="lp-hero-art-badge-core">
          <span className="lp-hero-art-badge-letter">A</span>
        </span>
      </div>
      <div className="lp-hero-art-rays" />
      <div className="lp-hero-art-chip">USA Visa</div>
      <img src={heroHomeImage} alt="" className="lp-hero-art-image" />
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="lp-dash-mock" aria-hidden="true">
      <div className="lp-dash-topbar">
        <img src="/logo.png" alt="" className="lp-dash-logo" />
        <div className="lp-dash-search">
          <span>Buscar…</span>
          <span className="lp-dash-kbd">⌘K</span>
        </div>
        <div className="lp-dash-user">
          <span className="lp-dash-bell" />
          <span className="lp-dash-avatar" />
          <span className="lp-dash-user-info">
            <strong>Maria Oliveira</strong>
            <small>Administradora</small>
          </span>
        </div>
      </div>
      <div className="lp-dash-body">
        <nav className="lp-dash-sidebar">
          <span className="lp-dash-nav-group">Principal</span>
          <span className="lp-dash-nav-item active">Dashboard</span>
          <span className="lp-dash-nav-item">Produtos</span>
          <span className="lp-dash-nav-item">Processos</span>
          <span className="lp-dash-nav-item">Tarefas</span>
          <span className="lp-dash-nav-group">Gestão</span>
          <span className="lp-dash-nav-item">Equipe</span>
          <span className="lp-dash-nav-item">Documentos</span>
          <span className="lp-dash-nav-item">Clientes</span>
          <span className="lp-dash-nav-item">Relatórios</span>
          <span className="lp-dash-nav-group">Financeiro</span>
          <span className="lp-dash-nav-item">Financeiro</span>
          <span className="lp-dash-nav-item">Configurações</span>
        </nav>
        <div className="lp-dash-main">
          <div className="lp-dash-head">
            <h3>Dashboard</h3>
            <span className="lp-dash-period">Este mês ⌄</span>
          </div>
          <div className="lp-dash-stats">
            <div className="lp-dash-stat">
              <span>Processos ativos</span>
              <strong>128 <small className="up">+18%</small></strong>
            </div>
            <div className="lp-dash-stat">
              <span>Receita</span>
              <strong>R$ 236.540 <small className="up">+24%</small></strong>
            </div>
            <div className="lp-dash-stat">
              <span>Novos clientes</span>
              <strong>32 <small className="up">+14%</small></strong>
            </div>
            <div className="lp-dash-stat">
              <span>Conversão</span>
              <strong>42,6% <small className="up">+5,2%</small></strong>
            </div>
          </div>
          <div className="lp-dash-grid">
            <div className="lp-dash-card lp-dash-chart-card">
              <h4>Receita</h4>
              <svg className="lp-dash-line" viewBox="0 0 240 80" preserveAspectRatio="none">
                <polyline points="0,60 30,55 60,58 90,40 120,46 150,28 180,32 210,16 240,20" fill="none" stroke="#2d63ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="lp-dash-card lp-dash-tasks-card">
              <h4>Tarefas</h4>
              <ul className="lp-dash-tasks">
                <li><span className="dot" /> Revisar documentos <em className="hi">Alta</em></li>
                <li><span className="dot" /> Enviar proposta <em className="md">Média</em></li>
                <li><span className="dot" /> Acompanhar biometria <em className="hi">Alta</em></li>
              </ul>
            </div>
          </div>
          <div className="lp-dash-grid">
            <div className="lp-dash-card lp-dash-donut-card">
              <h4>Processos por status</h4>
              <div className="lp-dash-donut" />
              <ul className="lp-dash-legend">
                <li><span className="sw blue" /> Em andamento</li>
                <li><span className="sw cyan" /> Documentos</li>
                <li><span className="sw violet" /> Em análise</li>
              </ul>
            </div>
            <div className="lp-dash-card lp-dash-recent-card">
              <h4>Processos recentes</h4>
              <ul className="lp-dash-recent">
                <li><strong>Visto EB-2 NIW</strong><span>Roberto Ferreira</span><em className="badge-blue">Em andamento</em></li>
                <li><strong>Visto L-1A</strong><span>Tech Solutions Ltda.</span><em className="badge-amber">Em análise</em></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Section icon sets ──────────────────────────────────────────────
const PAIN_ICONS = [
  <svg key={0} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" /><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" /><path d="M14 7h4M16 5v4M5 14v5M3 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  <svg key={1} viewBox="0 0 24 24" fill="none"><path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /></svg>,
  <svg key={2} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="2" /><path d="M12 9v4M9 2h6M12 5V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  <svg key={3} viewBox="0 0 24 24" fill="none"><path d="M12 3l8 4v5c0 4.5-3.2 7.7-8 9-4.8-1.3-8-4.5-8-9V7l8-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
];
const AUTO_ICONS = [
  <svg key={0} viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  <svg key={1} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  <svg key={2} viewBox="0 0 24 24" fill="none"><path d="M12 3l8 4v5c0 4.5-3.2 7.7-8 9-4.8-1.3-8-4.5-8-9V7l8-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
];
const EXC_ICONS = [
  <svg key={0} viewBox="0 0 24 24" fill="none"><path d="M4 19V9M10 19V5M16 19v-8M22 19H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  <svg key={1} viewBox="0 0 24 24" fill="none"><path d="M12 3l8 4v5c0 4.5-3.2 7.7-8 9-4.8-1.3-8-4.5-8-9V7l8-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
];

// ── Main component ─────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { lang } = useLocale();
  const { theme } = useTheme();
  const { openDemoBooking } = useDemoBooking();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const t = (T as unknown as Record<Lang, typeof T.pt>)[lang as Lang] ?? T.pt;
  const isDark = theme === "dark";

  // Redirect authenticated users once auth resolves — don't block rendering
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && user)
      navigate(getDefaultRouteForRole(user.role), { replace: true });
  }, [isAuthenticated, isAuthLoading, user, navigate]);

  useReveal(containerRef);

  return (
    <div ref={containerRef} className={`landing-page${isDark ? " lp-dark" : ""}`}>
      {/* HERO */}
      <section className="lp-section lp-dark-zone lp-hero">
        <div className="lp-glow" />
        <div className="lp-wrap lp-hero-grid">
          <div className="lp-hero-copy">
            <span className="lp-badge"><span className="lp-dot" />{t.hero.badge}</span>
            <h1 className="lp-h1">{t.hero.title} <span className="lp-accent-text">{t.hero.titleAccent}</span></h1>
            <div className="lp-hero-lead-wrap">
              <p className="lp-lead">{t.hero.lead}</p>
              <div className="lp-hero-copy-swoosh" aria-hidden="true">
                <svg viewBox="0 0 240 140" fill="none">
                  <path d="M12 105c48-50 92-22 92 12 0 18-24 18-24 0 0-34 56-64 148-82" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="5 8" />
                  <path d="M213 24l15 3-8 12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <div className="lp-hero-cta">
              <Link to="/sign-up" className="lp-btn lp-btn-light lp-btn-lg">{t.hero.ctaPrimary} <ArrowRight /></Link>
              <button type="button" onClick={openDemoBooking} className="lp-btn lp-btn-primary lp-btn-lg">
                {t.nav.bookDemo}
              </button>
              <a href="#lp-automation" className="lp-btn lp-btn-ghost lp-btn-lg">{t.hero.ctaSecondary}</a>
            </div>
            <div className="lp-hero-proof">
              <div className="lp-hero-proof-avatars" aria-hidden="true">
                <img src={wernerLogo} alt="" className="av" />
                <img src={marquesLogo} alt="" className="av" />
                <img src={msgLogo} alt="" className="av" />
                <span className="plus">+</span>
              </div>
              <div className="lp-hero-proof-copy">
                <strong>4.9+ Ratings</strong>
                <span>Escritórios que já usam a Aplikei</span>
              </div>
            </div>
          </div>
          <div className="lp-mock-wrap lp-reveal">
            <HeroArtwork />
          </div>
        </div>
      </section>

      {/* PAIN */}
      <section className="lp-section lp-dark-zone" id="lp-pain">
        <div className="lp-wrap">
          <div className="lp-pain-showcase">
            <div className="lp-pain-copy lp-reveal">
              <p className="lp-kicker">{t.pain.kicker}</p>
              <h2 className="lp-h2">{t.pain.title}</h2>
              <p className="lp-lead">{t.pain.lead}</p>
              <div className="lp-pain-points">
                {t.pain.items.slice(0, 3).map((item, i) => (
                  <div key={i} className="lp-pain-point">
                    <div className="lp-icon-box">{PAIN_ICONS[i]}</div>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="lp-pain-note">
                <strong>{t.pain.barText}</strong>
                <span>{t.pain.barSub}</span>
              </div>
            </div>

            <div className="lp-pain-device lp-reveal">
              <MobilePlatformShowcase lang={lang as Lang} />
            </div>

          </div>
        </div>
      </section>

      {/* OPERATION */}
      <section className="lp-section">
        <div className="lp-wrap">
          <div className="lp-sol-grid">
            <div className="lp-sol-copy lp-reveal">
              <p className="lp-kicker">{t.solutions.kicker}</p>
              <h2 className="lp-h2">{t.solutions.title}</h2>
              <p className="lp-lead">{t.solutions.lead}</p>
              <div className="lp-sol-note">
                <strong>Overview, finance, products and case flow</strong>
                <span>Four connected views that help the office operate without switching tools all day.</span>
              </div>
            </div>
            <div className="lp-sol-cards lp-reveal">
              {t.solutions.items.map((item) => (
                <div key={item.title} className="lp-sol-card">
                  <div className="lp-sol-card-top">
                    <div>
                      <span className="lp-sol-badge">{item.badge}</span>
                      <h3>{item.title}</h3>
                    </div>
                    <span className="lp-sol-chip">Live</span>
                  </div>
                  <p>{item.desc}</p>
                  <div className="lp-sol-visual" aria-hidden="true">
                    <img src={item.visual} alt="" className="lp-sol-image" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SHOWCASE */}
      <section className="lp-section lp-tint-zone">
        <div className="lp-wrap">
          <div className="lp-showcase-grid">
            <div className="lp-showcase-copy lp-reveal">
              <p className="lp-kicker">{t.showcase.kicker}</p>
              <h2 className="lp-h2">{t.showcase.title}</h2>
              <p className="lp-lead">{t.showcase.lead}</p>
              <ul className="lp-showcase-list">
                {t.showcase.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
            <div className="lp-showcase-image-wrap lp-reveal">
              <div className="lp-showcase-float">
                <span className="lp-showcase-float-dot" />
                <span>Live workspace</span>
              </div>
              <img src={officeTeamImage} alt={t.showcase.title} className="lp-showcase-image" />
              <div className="lp-showcase-caption">
                <strong>Platform overview</strong>
                <span>Finance, products and cases in one operational view.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AUTOMATION */}
      <section className="lp-section lp-dark-zone" id="lp-automation">
        <div className="lp-glow" style={{ background: "radial-gradient(50% 60% at 90% 30%,rgba(45,99,255,.22),transparent 60%)" }} />
        <div className="lp-wrap" style={{ position: "relative", zIndex: 1 }}>
          <div className="lp-sec-head lp-reveal" style={{ marginBottom: 42 }}>
            <p className="lp-kicker" style={{ justifyContent: "center" }}>{t.automation.kicker}</p>
            <h2 className="lp-h2">{t.automation.title} <span className="lp-grad-text">{t.automation.titleAccent}</span></h2>
          </div>
          <div className="lp-ai-grid">
            <div className="lp-ai-feats lp-reveal">
              {t.automation.features.map((f, i) => (
                <div key={i} className={`lp-ai-feat${i === 0 ? " hot" : ""}`}>
                  <div className={`lp-icon-box${i === 0 ? " solid" : ""}`}>{AUTO_ICONS[i]}</div>
                  <div><h3>{f.title}</h3><p>{f.desc}</p></div>
                </div>
              ))}
            </div>
            <div className="lp-engine lp-reveal">
              <div className="lp-engine-top">
                <div><h3>{t.automation.engineTitle}</h3><p>{t.automation.engineSub}</p></div>
                <span className="lp-engine-live"><span className="d" />{t.automation.engineLive}</span>
              </div>
              <div className="lp-engine-rows">
                {t.automation.rows.map((row, i) => (
                  <div key={i} className="lp-engine-row">
                    <span className="k">{row.k}</span>
                    <span className="v">
                      {i === 2 ? <><span className="ok">24s</span> <span className="lp-muted" style={{ fontWeight: 400 }}>(−55 min)</span></> : i === 3 ? <span className="ok">{row.v}</span> : row.v}
                    </span>
                  </div>
                ))}
              </div>
              <div className="lp-engine-cta">
                <Link to="/sign-up" className="lp-btn lp-btn-primary">{t.automation.ctaFill}</Link>
                <a href="#lp-cta" className="lp-btn lp-btn-ghost">{t.automation.ctaReview}</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="lp-section" id="lp-how">
        <div className="lp-wrap">
          <div className="lp-sec-head lp-reveal">
            <p className="lp-kicker" style={{ justifyContent: "center" }}>{t.howItWorks.kicker}</p>
            <h2 className="lp-h2">{t.howItWorks.title}</h2>
            <p className="lp-lead">{t.howItWorks.lead}</p>
          </div>
          <div className="lp-steps lp-reveal">
            {t.howItWorks.steps.map((s) => (
              <div key={s.n} className="lp-step">
                <div className="n">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXCELLENCE */}
      <section className="lp-section lp-tint-zone" id="lp-who-we-are">
        <div className="lp-wrap lp-exc-grid">
          <div className="lp-reveal">
            <p className="lp-kicker">{t.excellence.kicker}</p>
            <h2 className="lp-h2">{t.excellence.title}</h2>
            <div className="lp-exc-cards">
              {t.excellence.cards.map((c, i) => (
                <div key={i} className="lp-card">
                  <div className="lp-icon-box">{EXC_ICONS[i]}</div>
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="lp-media-ph lp-reveal">
            <img src={officeTeamImage} alt={t.excellence.mediaLabel} className="lp-media-img" />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="lp-section lp-dark-zone">
        <div className="lp-wrap">
          <div className="lp-sec-head lp-reveal">
            <p className="lp-kicker" style={{ justifyContent: "center" }}>{t.testimonials.kicker}</p>
            <h2 className="lp-h2">{t.testimonials.title}</h2>
          </div>
          <div className="lp-tst-grid lp-reveal">
            {t.testimonials.items.map((item, i) => (
              <div key={i} className="lp-tst">
                <div className="lp-stars">★★★★★</div>
                <blockquote>"{item.quote[0]}<span className="hl">{item.quote[1]}</span>{item.quote[2]}"</blockquote>
                <div className="lp-tst-foot">
                  <span className="av">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="lp-tst-avatar"
                      loading="lazy"
                    />
                  </span>
                  <div><b>{item.name}</b><span>{item.role}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="lp-section" id="lp-pricing">
        <div className="lp-wrap">
          <div className="lp-sec-head lp-reveal">
            <p className="lp-kicker" style={{ justifyContent: "center" }}>{t.pricing.kicker}</p>
            <h2 className="lp-h2">{t.pricing.title}</h2>
          </div>
          <div className="lp-plans-grid lp-reveal">
            {t.pricing.plans.map((plan, i) => (
              <div key={i} className={`lp-plan${plan.highlighted ? " highlighted" : ""}`}>
                <p className="lp-plan-label">{plan.label}</p>
                <div className="lp-plan-price">{plan.price}</div>
                <p className="lp-plan-period">{plan.period}</p>
                <div className="lp-plan-features">{plan.features.map((f, j) => <p key={j}>✓ {f}</p>)}</div>
                <Link to="/sign-up" className={`lp-btn${plan.highlighted ? " lp-btn-primary" : " lp-btn-light"}`} style={{ width: "100%", justifyContent: "center" }}>{plan.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="lp-section lp-tint-zone">
        <div className="lp-wrap">
          <div className="lp-sec-head lp-reveal">
            <p className="lp-kicker" style={{ justifyContent: "center" }}>{t.faq.kicker}</p>
            <h2 className="lp-h2">{t.faq.title}</h2>
            <p className="lp-lead">{t.faq.lead}</p>
          </div>
          <div className="lp-faq lp-reveal">
            {t.faq.items.map((item, i) => (
              <div key={i} className={`lp-faq-item${openFaq === i ? " open" : ""}`}>
                <div className="lp-faq-q" role="button" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{item.q}</span>
                  <span className="lp-faq-pm"><PlusIcon /></span>
                </div>
                {openFaq === i && <div className="lp-faq-a">{item.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="lp-section" id="lp-cta">
        <div className="lp-wrap">
          <div className="lp-cta-block lp-reveal">
            <div className="lp-cta-grid">
              <div className="lp-cta-copy">
                <img src="/logo-dark.png" alt="Aplikei" className="lp-cta-logo" />
                <div className="lp-hero-proof-avatars" aria-hidden="true">
                  <img src={wernerLogo} alt="" className="av" />
                  <img src={marquesLogo} alt="" className="av" />
                  <img src={msgLogo} alt="" className="av" />
                  <span className="plus">125+</span>
                </div>
                <h2 className="lp-h2">{t.cta.title}</h2>
                <p className="lp-lead">{t.cta.desc}</p>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={openDemoBooking} className="lp-btn lp-btn-primary lp-btn-lg">
                    {t.nav.bookDemo}
                  </button>
                  <Link to="/sign-up" className="lp-btn lp-btn-light lp-btn-lg">{t.cta.btn} <ArrowRight /></Link>
                </div>
              </div>
              <div className="lp-cta-mock">
                <div className="lp-cta-monitor">
                  <DashboardMockup />
                </div>
                <div className="lp-cta-monitor-stand" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />

    </div>
  );
}
