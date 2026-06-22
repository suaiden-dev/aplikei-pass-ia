const landing = {
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
  logos: { label: "Firmas que ya organizan visas consulares en Aplikei", hint: "Desliza para ver más logos" },
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
      { title: "Visión general", badge: "Panel admin" as string | null, desc: "Vea ingresos, fees, casos activos y saldo disponible para retiro en un solo lugar." },
      { title: "Análisis de finanzas", badge: "Control de ingresos" as string | null, desc: "Siga el crecimiento, el rendimiento mensual, las ventas por solución y la mezcla de transacciones." },
      { title: "Gestionar soluciones", badge: "Catálogo" as string | null, desc: "Active visas, mentorías y complementos con precios y control de estado." },
      { title: "Acompañar el caso", badge: "Flujo del caso" as string | null, desc: "Siga documentos, revisiones, datos del vendedor y todo el recorrido del cliente." },
    ],
  },
  showcase: {
    kicker: "Plataforma en acción",
    title: "Un espacio de trabajo real para que su equipo tenga visibilidad de cada caso activo.",
    lead: "Finanzas, soluciones y seguimiento de casos en el mismo flujo operativo — para que el equipo siempre sepa qué está pendiente, quién es responsable y cuál es el próximo paso.",
    bullets: [
      "Métricas claras para decisiones de negocio y equipo",
      "Un solo lugar para monitorear soluciones y casos activos",
      "Una experiencia más profesional para clientes y personal",
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
      { quote: ["La implementación de Aplikei transformó drásticamente nuestra entrega. ", "Redujimos el tiempo operativo en 60%", " en la preparación de documentos de visas consulares."], name: "Ricardo Mendes", role: "Socio · Mendes Lex", initials: "RM" },
      { quote: ["Por fin una plataforma que entiende la burocracia de las visas consulares. ", "La automatización de formularios es quirúrgica", " y extremadamente confiable."], name: "Juliana Costa", role: "Líder de Operaciones · GlobalVisa", initials: "JC" },
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
  mobileUI: {
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
};

export default landing;
