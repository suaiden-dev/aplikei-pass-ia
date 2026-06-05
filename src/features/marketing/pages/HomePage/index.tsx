import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@shared/hooks/useAuth";
import { useLocale } from "@app/app/i18n";
import { useTheme } from "@shared/hooks/useTheme";
import { getDefaultRouteForRole } from "@app/app/router/authRedirect";
import Flag from "@shared/components/atoms/flag";
import { LANGUAGE_FLAG_CODE } from "@shared/components/atoms/flags";
import "./landing.css";

type Lang = "pt" | "en" | "es";

// ── Inline translations ────────────────────────────────────────────
const T = {
  pt: {
    nav: {
      pain: "Dores", automation: "Automação", howItWorks: "Como funciona",
      pricing: "Planos", signIn: "Entrar", bookDemo: "Agendar demo",
    },
    hero: {
      badge: "Plataforma de vistos consulares",
      title: "A plataforma completa para gerir",
      titleAccent: "vistos consulares",
      lead: "Centralize casos, documentos e prazos. Reduza o tempo de preparação e a dor de cabeça do seu escritório — com automação exatamente onde importa: DS-160, B1/B2, F-1, troca e extensão de status.",
      ctaPrimary: "Agendar demo", ctaSecondary: "Ver a plataforma",
      stat1: { v: "−70%", l: "tempo de preparação" },
      stat2: { v: "3×", l: "mais casos por equipe" },
      stat3: { v: "+10 mil", l: "processos organizados" },
      mockTitle: "Casos", mockSearch: "Buscar casos…", mockFilter: "Filtro",
      mockCols: ["Cliente", "Status", "Visto", "Progresso", "Início"],
      floatLabel: "Tempo de preparação",
      statusLabels: { b: "Troca status", g: "Finalizado", "": "Em análise" },
    },
    logos: { label: "Escritórios que já organizam vistos consulares na Aplikei" },
    pain: {
      kicker: "Diagnóstico", title: "Dores que resolvemos",
      lead: "Falta de direção, retrabalho documental e comunicação fragmentada atrasam decisões críticas. Nós centralizamos a estratégia e transformamos cada etapa em execução previsível.",
      items: [
        { title: "Processos espalhados", desc: "Fluxos quebrados entre e-mails, pastas locais e mensagens que criam caos operacional." },
        { title: "Controle manual", desc: "Planilhas e anotações sujeitas a erro humano em etapas críticas." },
        { title: "Tempo desperdiçado", desc: "Horas gastas em tarefas puramente burocráticas e repetitivas." },
        { title: "Falta de padrão", desc: "Inconsistência na entrega que compromete a credibilidade do escritório." },
      ],
      barText: "Da incerteza ao plano de ação",
      barSub: "Transformamos incerteza em etapas, responsáveis e prazos previsíveis.",
      barBadge: "Menos retrabalho. Mais clareza.",
    },
    operation: {
      kicker: "A plataforma", title: "Sua operação em outro nível",
      items: [
        { title: "Centralização", badge: null as string | null, desc: "Um só lugar para todos os casos, documentos e a comunicação com o cliente." },
        { title: "Automação por IA", badge: "−70% tempo" as string | null, desc: "Modelos assistidos, treinados em vistos consulares, preenchem formulários complexos em segundos." },
        { title: "Pacotes prontos", badge: null as string | null, desc: "Pacotes estruturados por tipo de visto, garantindo que nenhum item essencial seja esquecido." },
      ],
    },
    automation: {
      kicker: "Inteligência aplicada",
      title: "Sua gestão de vistos consulares",
      titleAccent: "potencializada por IA",
      features: [
        { title: "Preenchimento DS-160 cirúrgico", desc: "Use modelos assistidos para preencher formulários consulares (DS-160) em segundos, eliminando 70% do trabalho manual." },
        { title: "Portal do cliente simplificado", desc: "Ofereça uma interface limpa para upload seguro de documentos e acompanhamento de status em tempo real." },
        { title: "Workspace de auditoria & regras", desc: "Controle total de qualidade. Revise, aplique regras e aprove antes da submissão oficial." },
      ],
      engineTitle: "Motor de automação consular",
      engineSub: "Preenchimento inteligente DS-160 ativo",
      engineLive: "IA ativa · 99% precisão",
      rows: [
        { k: "Formulário alvo", v: "DS-160 — B1/B2" },
        { k: "Vistos suportados", v: "B1/B2 · F-1 · troca e extensão" },
        { k: "Tempo estimado", v: "24s (−55 min)" },
        { k: "Validação de campos", v: "Dupla validação ok" },
      ],
      ctaFill: "Iniciar preenchimento", ctaReview: "Revisar respostas",
    },
    howItWorks: {
      kicker: "Comece em minutos", title: "Do cadastro à entrega",
      lead: "Um fluxo direto, com etapas claras e sem ruído operacional.",
      steps: [
        { n: "01", title: "Crie sua conta", desc: "Cadastre-se na plataforma de forma rápida e segura em poucos cliques." },
        { n: "02", title: "Configure o escritório", desc: "Configure seu escritório e equipe com poucos passos simples e automatizados." },
        { n: "03", title: "Centralize os casos", desc: "Importe os casos atuais e organize os documentos em um só lugar." },
        { n: "04", title: "Gerencie e entregue", desc: "Passe a gerir os processos de vistos dos seus clientes com qualidade consistente." },
      ],
    },
    excellence: {
      kicker: "Excelência garantida", title: "Excelência institucional em cada processo.",
      cards: [
        { title: "Ganho de produtividade", desc: "Atenda 3× mais clientes com a mesma equipe operacional." },
        { title: "Redução de erros", desc: "Minimize RFEs com a dupla validação automatizada." },
      ],
      mediaLabel: "[ foto do escritório / equipe usando a plataforma ]",
    },
    metrics: [
      { v: "−70%", l: "tempo de preparação" }, { v: "3×", l: "mais casos por equipe" },
      { v: "+10 mil", l: "processos organizados" }, { v: "99%", l: "consistência na entrega" },
    ],
    testimonials: {
      kicker: "O que dizem os parceiros", title: "Comprovado por escritórios que escalaram",
      items: [
        { quote: ["A implementação da Aplikei transformou drasticamente nossa entrega. ", "Reduzimos o tempo operacional em 60%", " na preparação de documentos de vistos consulares."], name: "Ricardo Mendes", role: "Sócio · Mendes Lex", initials: "RM" },
        { quote: ["Enfim uma plataforma que entende a burocracia dos vistos consulares. ", "A automação de formulários é cirúrgica", " e extremamente confiável."], name: "Juliana Costa", role: "Líder de Operações · GlobalVisa", initials: "JC" },
      ],
    },
    pricing: {
      kicker: "Planos", title: "Comece com o plano do seu tamanho",
      plans: [
        { label: "Advogado solo", price: "R$ —", period: "por mês", features: ["Casos ilimitados", "DS-160 assistido", "Portal do cliente"], cta: "Escolher", highlighted: false },
        { label: "Mais escolhido", price: "R$ —", period: "por mês", features: ["Tudo do Solo", "Equipe multiusuário", "Workspace de auditoria"], cta: "Começar agora", highlighted: true },
        { label: "Escritório / volume", price: "Sob consulta", period: "personalizado", features: ["Tudo do Escritório", "Suporte prioritário", "Onboarding incluso"], cta: "Falar com vendas", highlighted: false },
      ],
    },
    faq: {
      kicker: "FAQ", title: "Perguntas frequentes",
      lead: "Respostas objetivas para reduzir o atrito antes da decisão.",
      items: [
        { q: "A plataforma é segura para dados jurídicos sensíveis?", a: "Sim. Os dados são criptografados em trânsito e em repouso, com controle de acesso granular por usuário e registro completo de ações para auditoria." },
        { q: "Como a automação ajuda no preenchimento do DS-160?", a: "O motor reaproveita os dados do cliente e aplica regras consulares para pré-preencher campos complexos, com dupla validação antes da submissão — você mantém o controle final." },
        { q: "Como funciona o acesso para os meus clientes?", a: "Cada cliente recebe um portal simplificado para enviar documentos com segurança e acompanhar o status do caso em tempo real, sem expor a sua operação interna." },
        { q: "É difícil migrar meus casos atuais?", a: "Não. O onboarding guia a importação dos casos e documentos existentes, e nosso time apoia a transição para você começar a produzir de imediato." },
      ],
    },
    cta: { title: "Pronto para escalar sua operação?", desc: "Junte-se aos escritórios que já organizam milhares de processos de vistos consulares com precisão e tecnologia moderna.", btn: "Agendar demo" },
    footer: {
      tagline: "Simplificando a gestão de vistos consulares com tecnologia e automação.",
      platform: "Plataforma", company: "Empresa", contact: "Contato",
      links: { solve: "O que resolvemos", automation: "Automação", how: "Como funciona", pricing: "Planos", about: "Quem somos", security: "Segurança de dados", support: "Suporte" },
      legal: "© 2026 Aplikei Technologies. A Aplikei é uma plataforma de tecnologia, não um escritório de advocacia.",
      terms: "Termos de uso", privacy: "Privacidade",
    },
  },
  en: {
    nav: { pain: "Pain points", automation: "Automation", howItWorks: "How it works", pricing: "Pricing", signIn: "Sign in", bookDemo: "Book a demo" },
    hero: {
      badge: "Consular visa platform", title: "The complete platform to manage", titleAccent: "consular visas",
      lead: "Centralize cases, documents and deadlines. Cut preparation time and the headaches of your firm — with automation exactly where it matters: DS-160, B1/B2, F-1, status change and extension.",
      ctaPrimary: "Book a demo", ctaSecondary: "See the platform",
      stat1: { v: "−70%", l: "preparation time" }, stat2: { v: "3×", l: "more cases per team" }, stat3: { v: "+10k", l: "processes organized" },
      mockTitle: "Cases", mockSearch: "Search cases…", mockFilter: "Filter",
      mockCols: ["Client", "Status", "Visa", "Progress", "Start"],
      floatLabel: "Preparation time",
      statusLabels: { b: "Status change", g: "Done", "": "In review" },
    },
    logos: { label: "Firms already organizing consular visas on Aplikei" },
    pain: {
      kicker: "Diagnosis", title: "Pain points we solve",
      lead: "Lack of direction, document rework and fragmented communication delay critical decisions. We centralize the strategy and turn every step into predictable execution.",
      items: [
        { title: "Scattered processes", desc: "Fragmented workflows across emails, local folders and chat that create operational chaos." },
        { title: "Manual control", desc: "Spreadsheets and notes prone to critical human error." },
        { title: "Wasted time", desc: "Hours spent on purely bureaucratic, repetitive tasks." },
        { title: "No standardization", desc: "Inconsistent delivery that can compromise your firm's credibility." },
      ],
      barText: "From uncertainty to action plan",
      barSub: "We turn uncertainty into clear steps, owners and deadlines.",
      barBadge: "Less rework. More clarity.",
    },
    operation: {
      kicker: "The platform", title: "Your operation on another level",
      items: [
        { title: "Centralization", badge: null as string | null, desc: "One single place for all cases, documents and client communication." },
        { title: "AI Automation", badge: "−70% time" as string | null, desc: "Assisted models trained on consular visas fill complex forms in seconds." },
        { title: "Ready-to-go packages", badge: null as string | null, desc: "Structured packages per visa type, so no essential item is ever forgotten." },
      ],
    },
    automation: {
      kicker: "Applied intelligence", title: "Your consular visa management", titleAccent: "powered by AI",
      features: [
        { title: "Surgical DS-160 filling", desc: "Use assisted models to fill consular forms (DS-160) in seconds, removing 70% of manual work." },
        { title: "Simplified client portal", desc: "Offer applicants a clean interface for secure document upload and real-time status tracking." },
        { title: "Audit & rules workspace", desc: "Full quality control. Review, apply rules and approve before the official submission." },
      ],
      engineTitle: "Consular automation engine", engineSub: "Smart DS-160 filling active", engineLive: "AI active · 99% precision",
      rows: [
        { k: "Target form", v: "DS-160 — B1/B2" }, { k: "Supported visas", v: "B1/B2 · F-1 · status change & ext." },
        { k: "Estimated time", v: "24s (−55 min)" }, { k: "Field validation", v: "Double check done" },
      ],
      ctaFill: "Start filling", ctaReview: "Review answers",
    },
    howItWorks: {
      kicker: "Get started in minutes", title: "From sign-up to delivery",
      lead: "A direct flow, with clear steps and no operational noise.",
      steps: [
        { n: "01", title: "Create your account", desc: "Sign up on the platform quickly and securely in a few clicks." },
        { n: "02", title: "Configure the firm", desc: "Set up your firm and team with a few simple, automated steps." },
        { n: "03", title: "Centralize cases", desc: "Import existing cases and organize documents in one place." },
        { n: "04", title: "Manage & deliver", desc: "Start managing your clients' visa processes with consistent quality." },
      ],
    },
    excellence: {
      kicker: "Guaranteed excellence", title: "Institutional excellence in every process.",
      cards: [
        { title: "Productivity gain", desc: "Serve 3× more clients with the same operational team." },
        { title: "Error reduction", desc: "Minimize RFEs with automated double validation." },
      ],
      mediaLabel: "[ office / team photo using the platform ]",
    },
    metrics: [
      { v: "−70%", l: "preparation time" }, { v: "3×", l: "more cases per team" },
      { v: "+10k", l: "processes organized" }, { v: "99%", l: "delivery consistency" },
    ],
    testimonials: {
      kicker: "What partners say", title: "Proven by firms that scaled",
      items: [
        { quote: ["The rollout of Aplikei drastically transformed our delivery. ", "We cut operational time by 60%", " on consular visa document preparation."], name: "Ricardo Mendes", role: "Managing Partner · Mendes Lex", initials: "RM" },
        { quote: ["Finally a platform that understands consular visa bureaucracy. ", "The form automation is surgical", " and extremely reliable."], name: "Juliana Costa", role: "Operations Lead · GlobalVisa", initials: "JC" },
      ],
    },
    pricing: {
      kicker: "Pricing", title: "Start with the plan that fits you",
      plans: [
        { label: "Solo lawyer", price: "$—", period: "per month", features: ["Unlimited cases", "Assisted DS-160", "Client portal"], cta: "Choose", highlighted: false },
        { label: "Most chosen", price: "$—", period: "per month", features: ["Everything in Solo", "Multi-user team", "Audit workspace"], cta: "Get started", highlighted: true },
        { label: "Firm / volume", price: "On request", period: "tailored", features: ["Everything in Firm", "Priority support", "Onboarding included"], cta: "Talk to sales", highlighted: false },
      ],
    },
    faq: {
      kicker: "FAQ", title: "Frequently asked questions",
      lead: "Objective answers to reduce friction before you decide.",
      items: [
        { q: "Is the platform secure for sensitive legal data?", a: "Yes. Data is encrypted in transit and at rest, with granular access control per user and full action logs for audit." },
        { q: "How does automation help fill the DS-160?", a: "The engine reuses client data and applies consular rules to pre-fill complex fields, with double validation before submission — you keep final control." },
        { q: "How does access work for my clients?", a: "Each client gets a simplified portal to upload documents securely and follow their case status in real time, without exposing your internal operation." },
        { q: "Is it hard to migrate my current cases?", a: "No. Onboarding guides the import of existing cases and documents, and our team supports the transition so you start producing right away." },
      ],
    },
    cta: { title: "Ready to scale your operation?", desc: "Join the firms that already organize thousands of consular visa processes with precision and modern technology.", btn: "Book a demo" },
    footer: {
      tagline: "Simplifying consular visa management with technology and automation.",
      platform: "Platform", company: "Company", contact: "Contact",
      links: { solve: "What we solve", automation: "Automation", how: "How it works", pricing: "Pricing", about: "Who we are", security: "Data security", support: "Support" },
      legal: "© 2026 Aplikei Technologies. Aplikei is a technology platform, not a law firm.",
      terms: "Terms", privacy: "Privacy",
    },
  },
  es: {
    nav: { pain: "Problemas", automation: "Automatización", howItWorks: "Cómo funciona", pricing: "Planes", signIn: "Ingresar", bookDemo: "Agendar demo" },
    hero: {
      badge: "Plataforma de visas consulares", title: "La plataforma completa para gestionar", titleAccent: "visas consulares",
      lead: "Centralice casos, documentos y plazos. Reduzca el tiempo de preparación y el dolor de cabeza de su firma — con automatización exactamente donde importa: DS-160, B1/B2, F-1, cambio y extensión de estatus.",
      ctaPrimary: "Agendar demo", ctaSecondary: "Ver la plataforma",
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
    operation: {
      kicker: "La plataforma", title: "Su operación en otro nivel",
      items: [
        { title: "Centralización", badge: null as string | null, desc: "Un único lugar para todos los casos, documentos y la comunicación con el cliente." },
        { title: "Automatización por IA", badge: "−70% tiempo" as string | null, desc: "Modelos asistidos, entrenados en visas consulares, completan formularios complejos en segundos." },
        { title: "Paquetes listos", badge: null as string | null, desc: "Paquetes estructurados por tipo de visa, garantizando que ningún elemento esencial sea olvidado." },
      ],
    },
    automation: {
      kicker: "Inteligencia aplicada", title: "Su gestión de visas consulares", titleAccent: "potenciada por IA",
      features: [
        { title: "Llenado DS-160 quirúrgico", desc: "Use modelos asistidos para completar formularios consulares (DS-160) en segundos, eliminando el 70% del trabajo manual." },
        { title: "Portal del cliente simplificado", desc: "Ofrezca una interfaz limpia para carga segura de documentos y seguimiento del estado en tiempo real." },
        { title: "Workspace de auditoría & reglas", desc: "Control total de calidad. Revise, aplique reglas y apruebe antes de la presentación oficial." },
      ],
      engineTitle: "Motor de automatización consular", engineSub: "Llenado inteligente DS-160 activo", engineLive: "IA activa · 99% precisión",
      rows: [
        { k: "Formulario objetivo", v: "DS-160 — B1/B2" }, { k: "Visas soportadas", v: "B1/B2 · F-1 · cambio y extensión" },
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
    metrics: [
      { v: "−70%", l: "tiempo de preparación" }, { v: "3×", l: "más casos por equipo" },
      { v: "+10 mil", l: "procesos organizados" }, { v: "99%", l: "consistencia en la entrega" },
    ],
    testimonials: {
      kicker: "Lo que dicen los socios", title: "Comprobado por firmas que escalaron",
      items: [
        { quote: ["La implementación de Aplikei transformó drásticamente nuestra entrega. ", "Redujimos el tiempo operativo en 60%", " en la preparación de documentos de visas consulares."], name: "Ricardo Mendes", role: "Socio · Mendes Lex", initials: "RM" },
        { quote: ["Por fin una plataforma que entiende la burocracia de las visas consulares. ", "La automatización de formularios es quirúrgica", " y extremadamente confiable."], name: "Juliana Costa", role: "Líder de Operaciones · GlobalVisa", initials: "JC" },
      ],
    },
    pricing: {
      kicker: "Planes", title: "Comience con el plan de su tamaño",
      plans: [
        { label: "Abogado solo", price: "$—", period: "por mes", features: ["Casos ilimitados", "DS-160 asistido", "Portal del cliente"], cta: "Elegir", highlighted: false },
        { label: "Más elegido", price: "$—", period: "por mes", features: ["Todo de Solo", "Equipo multiusuario", "Workspace de auditoría"], cta: "Comenzar ahora", highlighted: true },
        { label: "Firma / volumen", price: "A consultar", period: "personalizado", features: ["Todo de Firma", "Soporte prioritario", "Onboarding incluido"], cta: "Hablar con ventas", highlighted: false },
      ],
    },
    faq: {
      kicker: "FAQ", title: "Preguntas frecuentes",
      lead: "Respuestas objetivas para reducir la fricción antes de decidir.",
      items: [
        { q: "¿La plataforma es segura para datos jurídicos sensibles?", a: "Sí. Los datos están cifrados en tránsito y en reposo, con control de acceso granular por usuario y registro completo de acciones para auditoría." },
        { q: "¿Cómo ayuda la automatización en el llenado del DS-160?", a: "El motor reutiliza los datos del cliente y aplica reglas consulares para prellenar campos complejos, con doble validación antes de la presentación — usted mantiene el control final." },
        { q: "¿Cómo funciona el acceso para mis clientes?", a: "Cada cliente recibe un portal simplificado para enviar documentos de forma segura y seguir el estado del caso en tiempo real, sin exponer su operación interna." },
        { q: "¿Es difícil migrar mis casos actuales?", a: "No. El onboarding guía la importación de casos y documentos existentes, y nuestro equipo apoya la transición para que empiece a producir de inmediato." },
      ],
    },
    cta: { title: "¿Listo para escalar su operación?", desc: "Únase a las firmas que ya organizan miles de procesos de visas consulares con precisión y tecnología moderna.", btn: "Agendar demo" },
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
const LogoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M5 19L12 4l7 15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.2 13.5h7.6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);
const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M16.9 16.9l1.4 1.4M5.6 18.4l1.4-1.4M16.9 7.1l1.4-1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
);
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none"><path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
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

// ── Nav scroll-aware theming ───────────────────────────────────────
function useNavScroll(navRef: React.RefObject<HTMLElement | null>, isDark: boolean) {
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    if (!isDark) {
      nav.classList.add("on-light");
      return () => nav.classList.remove("on-light");
    }
    const navH = 70;
    function update() {
      const y = navH + 4;
      let onLight = false;
      document.querySelectorAll(".lp-section, .lp-footer").forEach((sec) => {
        const r = sec.getBoundingClientRect();
        if (r.top <= y && r.bottom > y) onLight = !sec.classList.contains("lp-dark-zone");
      });
      nav.classList.toggle("on-light", onLight);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [navRef, isDark]);
}

// ── Language toggle ────────────────────────────────────────────────
function LangToggle({ lang }: { lang: Lang }) {
  const { setLang } = useLocale();
  const labels: Record<Lang, string> = {
    pt: "Português",
    en: "English",
    es: "Español",
  };

  return (
    <div className="lp-lang-toggle">
      {(["pt", "en", "es"] as Lang[]).map((code) => (
        <button
          key={code}
          type="button"
          className={lang === code ? "active" : ""}
          onClick={() => setLang(code)}
          aria-label={labels[code]}
          title={labels[code]}
        >
          <Flag countryCode={LANGUAGE_FLAG_CODE[code]} alt={labels[code]} size={24} />
        </button>
      ))}
    </div>
  );
}

// ── Dashboard mockup ───────────────────────────────────────────────
function DashboardMock({ t }: { t: (typeof T)[Lang]["hero"] }) {
  const rows = [
    { name: "J. da Silva", status: "b" as "b" | "g" | "", visa: "F-1", pct: 65, date: "12/10" },
    { name: "M. Andrade", status: "" as "b" | "g" | "", visa: "J-1", pct: 40, date: "05/11" },
    { name: "R. Costa", status: "g" as "b" | "g" | "", visa: "O-1", pct: 100, date: "20/09" },
    { name: "L. Pereira", status: "" as "b" | "g" | "", visa: "B1/B2", pct: 80, date: "02/09" },
    { name: "A. Nunes", status: "b" as "b" | "g" | "", visa: "F-1", pct: 55, date: "12/09" },
  ];

  return (
    <div className="lp-mock" role="img" aria-label="Dashboard Aplikei">
      <aside className="lp-mock-side">
        <div className="lp-mock-brand">
          <div className="lp-mock-brand-mark">
            <svg viewBox="0 0 24 24" fill="none"><path d="M5 19L12 4l7 15" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          Aplikei
        </div>
        <nav className="lp-mock-nav">
          <div className="it"><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" /><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" /><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" /><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" /></svg>Painel</div>
          <div className="it"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>Clientes</div>
          <div className="it"><svg viewBox="0 0 24 24" fill="none"><path d="M3 7h18v12H3z" stroke="currentColor" strokeWidth="2" /><path d="M3 11h18" stroke="currentColor" strokeWidth="2" /></svg>Financeiro</div>
          <div className="it on"><svg viewBox="0 0 24 24" fill="none"><path d="M7 3h7l5 5v13H7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M13 3v6h6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>Processos</div>
          <div className="it"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>Ajustes</div>
        </nav>
      </aside>
      <main className="lp-mock-main">
        <div className="lp-mock-top">
          <h4>{t.mockTitle}</h4>
          <div className="lp-mock-av" />
        </div>
        <div className="lp-mock-tiles">
          <div className="lp-mock-tile"><b>24</b><span>Total</span></div>
          <div className="lp-mock-tile"><b>3</b><span>Revisão</span></div>
          <div className="lp-mock-tile hot"><b>15</b><span>Andamento</span></div>
          <div className="lp-mock-tile"><b>6</b><span>Concluídos</span></div>
        </div>
        <div className="lp-mock-search">
          <div className="lp-mock-inp">{t.mockSearch}</div>
          <div className="lp-mock-flt">
            <svg viewBox="0 0 24 24" fill="none" width="9" height="9"><path d="M3 5h18l-7 8v5l-4 2v-7L3 5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
            {t.mockFilter}
          </div>
        </div>
        <div className="lp-mock-table">
          <div className="hr">{t.mockCols.map((c) => <span key={c}>{c}</span>)}</div>
          {rows.map((row, i) => (
            <div key={i} className="lp-mock-row" style={i === rows.length - 1 ? { borderBottom: 0 } : {}}>
              <b>{row.name}</b>
              <span className={`lp-tag-s${row.status ? ` ${row.status}` : ""}`}>
                {t.statusLabels[row.status]}
              </span>
              <span>{row.visa}</span>
              <div className="lp-mock-bar"><i style={{ width: `${row.pct}%` }} /></div>
              <span>{row.date}</span>
            </div>
          ))}
        </div>
      </main>
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
const OP_ICONS = [
  <svg key={0} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="2" /><circle cx="5" cy="6" r="2" stroke="currentColor" strokeWidth="2" /><circle cx="19" cy="6" r="2" stroke="currentColor" strokeWidth="2" /><circle cx="5" cy="18" r="2" stroke="currentColor" strokeWidth="2" /><circle cx="19" cy="18" r="2" stroke="currentColor" strokeWidth="2" /><path d="M10 11L6.5 7.5M14 11l3.5-3.5M10 13l-3.5 3.5M14 13l3.5 3.5" stroke="currentColor" strokeWidth="1.6" /></svg>,
  <svg key={1} viewBox="0 0 24 24" fill="none"><path d="M5 3l1.2 3L9 7.2 6.2 8.4 5 11.4 3.8 8.4 1 7.2 3.8 6 5 3z" fill="currentColor" /><path d="M15 7l1.8 4.4L21 13l-4.2 1.6L15 19l-1.8-4.4L9 13l4.2-1.6L15 7z" fill="currentColor" /></svg>,
  <svg key={2} viewBox="0 0 24 24" fill="none"><path d="M12 3l8 4v5c0 4.5-3.2 7.7-8 9-4.8-1.3-8-4.5-8-9V7l8-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>,
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
  const { theme, toggleTheme } = useTheme();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const t = (T as Record<string, typeof T.pt>)[lang] ?? T.pt;
  const isDark = theme === "dark";

  // Redirect authenticated users once auth resolves — don't block rendering
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && user)
      navigate(getDefaultRouteForRole(user.role), { replace: true });
  }, [isAuthenticated, isAuthLoading, user, navigate]);

  useReveal(containerRef);
  useNavScroll(navRef, isDark);

  return (
    <div ref={containerRef} className={`landing-page${isDark ? " lp-dark" : ""}`}>

      {/* NAV */}
      <header ref={navRef} className="lp-nav lp-dark-zone" id="lp-top">
        <div className="lp-wrap lp-nav-inner">
          <a href="#lp-top" className="lp-brand">
            <span className="lp-brand-mark"><LogoIcon /></span>Aplikei
          </a>
          <nav className="lp-nav-links">
            <a href="#lp-pain">{t.nav.pain}</a>
            <a href="#lp-automation">{t.nav.automation}</a>
            <a href="#lp-how">{t.nav.howItWorks}</a>
            <a href="#lp-pricing">{t.nav.pricing}</a>
          </nav>
          <div className="lp-nav-right">
            <LangToggle lang={lang as Lang} />
            <button className="lp-theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
            <Link to="/login" className="lp-btn lp-btn-ghost">{t.nav.signIn}</Link>
            <a href="#lp-cta" className="lp-btn lp-btn-primary">{t.nav.bookDemo}</a>
            <button className="lp-menu-btn" aria-label="Menu"><MenuIcon /></button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="lp-section lp-dark-zone lp-hero">
        <div className="lp-glow" />
        <div className="lp-wrap lp-hero-grid">
          <div className="lp-hero-copy">
            <span className="lp-badge"><span className="lp-dot" />{t.hero.badge}</span>
            <h1 className="lp-h1">{t.hero.title} <span className="lp-accent-text">{t.hero.titleAccent}</span></h1>
            <p className="lp-lead">{t.hero.lead}</p>
            <div className="lp-hero-cta">
              <a href="#lp-cta" className="lp-btn lp-btn-primary lp-btn-lg">{t.hero.ctaPrimary} <ArrowRight /></a>
              <a href="#lp-automation" className="lp-btn lp-btn-ghost lp-btn-lg">{t.hero.ctaSecondary}</a>
            </div>
            <div className="lp-hero-stats">
              <div className="s"><b>{t.hero.stat1.v}</b><span>{t.hero.stat1.l}</span></div>
              <div className="div" />
              <div className="s"><b>{t.hero.stat2.v}</b><span>{t.hero.stat2.l}</span></div>
              <div className="div" />
              <div className="s"><b>{t.hero.stat3.v}</b><span>{t.hero.stat3.l}</span></div>
            </div>
          </div>
          <div className="lp-mock-wrap lp-reveal">
            <DashboardMock t={t.hero} />
            <div className="lp-float-card">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 1.8 3-.2 1 2.8 2.4 1.7-.9 2.9.9 2.9-2.4 1.7-1 2.8-3-.2L12 22l-2.4-1.8-3 .2-1-2.8L3.2 16l.9-2.9L3.2 10l2.4-1.7 1-2.8 3 .2L12 2z" fill="rgba(22,185,129,.15)" stroke="currentColor" strokeWidth="1.6" /><path d="M8.5 12l2.3 2.3 4.7-4.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div><div className="t">{t.hero.floatLabel}</div><div className="v">−70%</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* LOGOS */}
      <section className="lp-section tight">
        <div className="lp-wrap">
          <p className="lp-muted" style={{ textAlign: "center", fontSize: 13, letterSpacing: ".04em", marginBottom: 26 }}>{t.logos.label}</p>
          <div className="lp-logos-row lp-reveal">
            {[0, 1, 2, 3, 4, 5].map((i) => <span key={i} className="lp-logo-ph">escritório</span>)}
          </div>
        </div>
      </section>

      {/* PAIN */}
      <section className="lp-section lp-dark-zone" id="lp-pain">
        <div className="lp-wrap">
          <div className="lp-pain-intro lp-reveal">
            <div>
              <p className="lp-kicker">{t.pain.kicker}</p>
              <h2 className="lp-h2">{t.pain.title}</h2>
            </div>
            <div className="lp-card" style={{ display: "flex", alignItems: "center" }}>
              <p className="lp-lead" style={{ margin: 0 }}>{t.pain.lead}</p>
            </div>
          </div>
          <div className="lp-pain-grid lp-reveal">
            {t.pain.items.map((item, i) => (
              <div key={i} className="lp-pain-card">
                <div className="lp-icon-box">{PAIN_ICONS[i]}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="lp-pain-bar lp-reveal">
            <div>
              <p style={{ fontWeight: 700, fontSize: 15 }}>{t.pain.barText}</p>
              <p className="lp-pain-bar-sub">{t.pain.barSub}</p>
            </div>
            <span className="lp-badge">{t.pain.barBadge}</span>
          </div>
        </div>
      </section>

      {/* OPERATION */}
      <section className="lp-section">
        <div className="lp-wrap">
          <div className="lp-sec-head lp-reveal">
            <p className="lp-kicker" style={{ justifyContent: "center" }}>{t.operation.kicker}</p>
            <h2 className="lp-h2">{t.operation.title}</h2>
          </div>
          <div className="lp-op-list lp-reveal">
            {t.operation.items.map((item, i) => (
              <div key={i} className={`lp-op-row${i === 1 ? " hot" : ""}`}>
                <div className="lp-icon-box">{OP_ICONS[i]}</div>
                <div>
                  <h4>{item.title}{item.badge && <span className="lp-pill-mini">{item.badge}</span>}</h4>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
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
                <a href="#lp-cta" className="lp-btn lp-btn-primary">{t.automation.ctaFill}</a>
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
      <section className="lp-section lp-tint-zone">
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
            <span className="lbl">{t.excellence.mediaLabel}</span>
          </div>
        </div>
      </section>

      {/* METRICS */}
      <section className="lp-section lp-dark-zone tight">
        <div className="lp-wrap">
          <div className="lp-metrics lp-reveal">
            {t.metrics.map((m, i) => (
              <div key={i} className="lp-metric">
                <div className="v"><span className="lp-grad-text">{m.v}</span></div>
                <div className="l">{m.l}</div>
              </div>
            ))}
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
                  <span className="av">{item.initials}</span>
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
                <a href="#lp-cta" className={`lp-btn${plan.highlighted ? " lp-btn-primary" : " lp-btn-light"}`} style={{ width: "100%", justifyContent: "center" }}>{plan.cta}</a>
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
            <h2 className="lp-h2">{t.cta.title}</h2>
            <p>{t.cta.desc}</p>
            <Link to="/contato" className="lp-btn lp-btn-light lp-btn-lg">{t.cta.btn} <ArrowRight /></Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer lp-dark-zone">
        <div className="lp-wrap">
          <div className="lp-foot-grid">
            <div className="lp-foot-brand">
              <div className="lp-brand"><span className="lp-brand-mark"><LogoIcon /></span>Aplikei</div>
              <p>{t.footer.tagline}</p>
              <div className="lp-foot-soc">
                <a href="#" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 8.98h4V21H3zM9 8.98h3.8v1.64h.05c.53-1 1.83-2.06 3.76-2.06C20.4 8.56 22 10.3 22 14v7h-4v-6.2c0-1.48-.03-3.4-2.07-3.4-2.07 0-2.39 1.62-2.39 3.29V21H9z" /></svg></a>
                <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" /></svg></a>
              </div>
            </div>
            <div>
              <h5>{t.footer.platform}</h5>
              <a href="#lp-pain">{t.footer.links.solve}</a>
              <a href="#lp-automation">{t.footer.links.automation}</a>
              <a href="#lp-how">{t.footer.links.how}</a>
              <a href="#lp-pricing">{t.footer.links.pricing}</a>
            </div>
            <div>
              <h5>{t.footer.company}</h5>
              <Link to="/quem-somos">{t.footer.links.about}</Link>
              <a href="#">{t.footer.links.security}</a>
              <a href="#">{t.footer.links.support}</a>
            </div>
            <div>
              <h5>{t.footer.contact}</h5>
              <a href="mailto:contato@aplikei.com.br">contato@aplikei.com.br</a>
            </div>
          </div>
          <div className="lp-foot-bottom">
            <span>{t.footer.legal}</span>
            <div className="lp-foot-bottom-links">
              <Link to="/termos">{t.footer.terms}</Link>
              <Link to="/privacidade">{t.footer.privacy}</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
