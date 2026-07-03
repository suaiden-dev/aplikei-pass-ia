const landing = {
  nav: { pain: "Problemas", automation: "Automatización", howItWorks: "Cómo funciona", pricing: "Planes", signIn: "Ingresar", bookDemo: "Agendar demo" },
  hero: {
    badge: "Plataforma de visas consulares", title: "Sitio, checkout y procesos para su despacho de inmigración", titleAccent: "en un solo sistema.",
    lead: "Aplikei reemplaza el sitio estático, links de pago sueltos y hojas de cálculo por una operación única para vender, atender y acompañar procesos migratorios.",
    bullets: ["Sitio con la identidad del despacho", "Checkout para vender consultas y procesos", "Equipo y casos organizados con apoyo de IA"],
    ctaPrimary: "Comenzar ahora", ctaSecondary: "Ver la plataforma",
    stat1: { v: "−70%", l: "tiempo de preparación" }, stat2: { v: "3×", l: "más casos por equipo" }, stat3: { v: "+10 mil", l: "procesos organizados" },
    mockTitle: "Casos", mockSearch: "Buscar casos…", mockFilter: "Filtro",
    mockCols: ["Cliente", "Estado", "Visa", "Progreso", "Inicio"],
    floatLabel: "Tiempo de preparación",
    statusLabels: { b: "Cambio estatus", g: "Finalizado", "": "En revisión" },
  },
  logos: { label: "Aprobado por más de 10 despachos socios", hint: "" },
  pain: {
    title: "Su despacho no necesita operar entre sitio, WhatsApp, links de pago y hojas de cálculo.",
    lead: "El problema no es falta de demanda. El problema es intentar vender, cobrar, atender y acompañar procesos en herramientas separadas que no muestran qué está pasando.",
    items: [
      { title: "Sitio sin checkout", desc: "El cliente entiende el servicio, pero todavía paga por Pix, invoice o link suelto sin la identidad del despacho." },
      { title: "Atención dispersa", desc: "WhatsApp, email y hojas de cálculo compiten por la atención del equipo, sin responsable claro, plazo ni historial centralizado." },
      { title: "Cliente sin visibilidad", desc: "Cuando el cliente no sabe en qué etapa está, pregunta otra vez y aumenta la carga de respuesta del equipo." },
      { title: "Abogado en el centro de todo", desc: "Cuando la operación no tiene un flujo claro, cada duda vuelve al abogado y el despacho pierde capacidad de escala." },
    ],
    barText: "Aplikei conecta sitio, checkout, equipo y proceso en un solo flujo.",
    barSub: "Menos improvisación entre herramientas. Más claridad para vender, operar y acompañar cada caso.",
    barBadge: "Sin WhatsApp como sistema operativo.",
  },
  solutions: {
    title: "Del sitio al seguimiento del caso, todo conectado.", lead: "Aplikei pone su despacho en línea, vende con checkout propio y mantiene al equipo organizado después de la contratación.",
    items: [
      { title: "Sitio con la marca del despacho", badge: "En línea sin agencia" as string | null, desc: "Presente sus servicios, identidad y canales de contacto en una experiencia pública lista para convertir visitantes en clientes." },
      { title: "Checkout para vender servicios", badge: "Pago con identidad" as string | null, desc: "Venda consultas y procesos con una página de pago propia, precio, dependientes y métodos como tarjeta, Pix y Zelle." },
      { title: "Equipo y procesos en un solo flujo", badge: "Cada caso con responsable" as string | null, desc: "Acompañe etapas, responsables y pendientes sin depender de hojas de cálculo, grupos de WhatsApp o preguntas sueltas al abogado." },
      { title: "IA para acelerar la operación", badge: "Apoyo revisable" as string | null, desc: "Transforme datos y mensajes del cliente en checklists, preguntas de entrevista y próximos pasos para revisión del equipo." },
    ],
  },
  showcase: {
    title: "Un espacio de trabajo real para que su equipo tenga visibilidad de cada caso activo.",
    lead: "Finanzas, soluciones y seguimiento de casos en el mismo flujo operativo — para que el equipo siempre sepa qué está pendiente, quién es responsable y cuál es el próximo paso.",
    bullets: [
      "Métricas claras para decisiones de negocio y equipo",
      "Un solo lugar para monitorear soluciones y casos activos",
      "Una experiencia más profesional para clientes y personal",
    ],
  },
  automation: {
    title: "IA para acelerar lo que su equipo ya organizó.", titleAccent: "",
    features: [
      { title: "Checklists a partir del caso", desc: "La IA transforma datos y mensajes del cliente en pendientes claros para que el equipo los revise." },
      { title: "Preparación para entrevista", desc: "Genere preguntas y puntos de atención según el perfil del proceso antes de la entrevista consular." },
      { title: "Próximos pasos sugeridos", desc: "Reciba sugerencias de documentos, recordatorios y acciones para mantener el caso avanzando con revisión humana." },
    ],
    engineTitle: "Motor de automatización consular", engineSub: "Automatización de formularios consulares activa", engineLive: "IA activa · 99% precisión",
    aiPanel: {
      clientName: "Carlos Silva",
      clientVisa: "Visa F-1",
      clientStatus: "En proceso",
      tasks: [
        { done: true, title: "Checklist del caso generado", sub: "Documentos y pendientes extraídos de los datos del cliente" },
        { done: true, title: "Preguntas de entrevista preparadas", sub: "Guía basada en el perfil del proceso F-1" },
        { done: false, title: "Revisar próximos pasos", sub: "Esperando validación del equipo antes de enviar al cliente" },
      ],
      saved: "Menos tareas manuales en este caso",
    },
    ctaFill: "Iniciar llenado", ctaReview: "Revisar respuestas",
  },
  howItWorks: {
    title: "Del primer acceso al seguimiento del caso, todo en un flujo claro.",
    lead: "Aplikei organiza la operación del despacho en etapas simples: presencia online, venta del servicio, entrada del cliente y seguimiento interno.",
    steps: [
      { n: "01", title: "Configure su despacho", desc: "Cargue identidad visual, equipo, servicios e información principal para montar la base de la operación." },
      { n: "02", title: "Publique servicios y checkout", desc: "Cree consultas y procesos con precio, descripción, documentos necesarios y link de pago con la marca del despacho." },
      { n: "03", title: "Reciba clientes en un flujo organizado", desc: "Después del pago, el cliente entra en una jornada clara para enviar datos, documentos y seguir pendientes." },
      { n: "04", title: "Acompañe casos con equipo e IA", desc: "Su equipo visualiza responsables, etapas y próximos pasos, con IA apoyando checklists, entrevistas y tareas repetitivas." },
    ],
  },
  excellence: {
    title: "Excelencia institucional en cada proceso.",
    cards: [
      { title: "Ganancia de productividad", desc: "Atienda 3× más clientes con el mismo equipo operativo." },
      { title: "Reducción de errores", desc: "Minimice RFEs con la doble validación automatizada." },
    ],
    mediaLabel: "[ foto de la oficina / equipo usando la plataforma ]",
  },
  testimonials: {
    title: "Comprobado por firmas que escalaron",
    items: [
      { quote: ["La implementación de Aplikei transformó drásticamente nuestra entrega. ", "Redujimos el tiempo operativo en 60%", " en la preparación de documentos de visas consulares."], name: "Ricardo Mendes", role: "Socio · Mendes Lex", initials: "RM" },
      { quote: ["Por fin una plataforma que entiende la burocracia de las visas consulares. ", "La automatización de formularios es quirúrgica", " y extremadamente confiable."], name: "Juliana Costa", role: "Líder de Operaciones · GlobalVisa", initials: "JC" },
    ],
  },
  pricing: {
    title: "Planes disponibles para activación",
    lead: "Elija uno de los planes disponibles hoy en la plataforma. Tras la contratación, el admin_lawyer puede activar la suscripción y liberar los módulos premium.",
    plans: [
      { label: "Esencial (Fijo)", price: "US$ 497", period: "por mes", description: "Para equipos que necesitan previsibilidad y una cuota fija mensual.", features: ["Cuota fija mensual", "Ideal para operación estable", "Listo para activar tras la contratación"], cta: "Elegir plan", highlighted: false },
      { label: "Crecimiento (Variable)", price: "5%", period: "de la facturación", description: "Pague a medida que la operación crece, con mínimo mensual y tope de cobro.", features: ["Mínimo mensual de US$ 197", "Tope mensual de US$ 2.997", "Excelente para empezar con menor riesgo"], cta: "Quiero este plan", highlighted: true },
      { label: "Oficina Pro (Híbrido)", price: "US$ 297 + 2%", period: "por mes", description: "La mejor relación costo-beneficio para firmas en expansión.", features: ["Cuota fija reducida", "Porcentaje menor sobre ventas", "Más previsibilidad para crecer"], cta: "Activar plan", highlighted: false },
    ],
  },
  faq: {
    title: "Preguntas frecuentes",
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
