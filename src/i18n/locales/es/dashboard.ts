const dashboard = {
  dashboard: {
    title: "Panel",
    welcome: "¡Bienvenido! Continúa tu proceso.",
    overallProgress: "Progreso general",
    onboarding: "Onboarding",
    complete: "completado",
    cards: {
      currentService: "Mi servicio actual",
      currentServiceDesc: "Visa B1/B2 — Turismo y Negocios",
      inProgress: "En progreso",
      checklist: "Checklist de documentos",
      checklistDesc: "3 de 8 documentos enviados",
      chatAI: "Chatear con la IA",
      chatAIDesc: "Haz preguntas y organiza tu proceso",
      uploads: "Subir archivos",
      uploadsDesc: "Sube y administra tus documentos",
      generatePDF: "Generar paquete final (PDF)",
      generatePDFDesc: "Disponible cuando el onboarding esté completo",
      help: "Soporte",
      helpDesc: "Preguntas sobre uso de la plataforma",
    },
    access: "Acceder",
    selfieModal: {
      title: "Configuración Inicial: Fotos Requeridas",
      desc: "Para continuar, necesitamos dos fotos: una sosteniendo su pasaporte para verificado de identidad, y una foto digital (5x5) para la solicitud.",
      step1Title: "Paso 1: Verificación de Identidad",
      step1Desc:
        "Tómate una selfie sosteniendo tu pasaporte al lado de tu cara. Asegúrate de que los datos del pasaporte sean legibles.",
      step2Title: "Paso 2: Foto Digital para la Visa",
      step2Desc:
        "Sube una foto digital de 5x5cm reciente con fondo blanco, mirando hacia adelante, sin gafas ni sombreros.",
      uploadBtn: "Seleccionar Foto",
      selectVisaPhoto: "Seleccionar Foto 5x5",
      nextStep: "Siguiente Paso",
      finish: "Finalizar Configuración",
      submitting: "Subiendo...",
      success: "¡Fotos subidas con éxito!",
    },
    activeProcesses: "Tus Procesos Activos",
    selectProcess: "Seleccionar Proceso",
    getProcesses: "Obtener Procesos",
    comingSoon: "Próximamente",
    getStarted: "Contratar Ahora",
    available: "Disponible",
    paymentSuccess: "¡Pago confirmado! Tu nueva guía está disponible abajo.",
    errorUploadingSelfie: "Error al subir selfie",
    remove: "Eliminar",
    selectSelfie: "Selecciona tu selfie",
    or: "o",
    status: {
      ds160InProgress: "Llenando DS-160",
      ds160Processing: "Procesando DS-160",
      ds160uploadDocuments: "3. Adjuntar Documentos",
      ds160AwaitingReviewAndSignature: "4. Revisión y Firma",
      uploadsUnderReview: "4. Revisión de Documentos",
      casvSchedulingPending: "5. Programación Pendiente",
      casvFeeProcessing: "6. Tarifa en Procesamiento",
      casvPaymentPending: "7. Pago CASV Pendiente",
      awaitingInterview: "8. Esperando Entrevista",
      approved: "9. Aprobado",
      rejectedText: "Proceso Denegado",
      rejectedLabel: "Rechazado",
      stepOf: "Paso [step] de [total]",
    },
    myProcesses: "Mis Procesos",
    trackStatus: "Sigue el estado de todas tus guías y solicitudes.",
    noActiveProcesses: "Aún no tienes procesos activos.",
    progress: "Progreso",
    accessDetails: "ACCEDER DETALLES",
  },
  sidebar: {
    dashboard: "Panel",
    onboarding: "Onboarding",
    chatAI: "Chat IA",
    documents: "Documentos",
    finalPackage: "Paquete Final",
    help: "Soporte",
    logout: "Salir",
  },
  chat: {
    title: "Chat IA",
    subtitle: "La IA ayuda a organizar datos y documentos. No ofrece asesoría legal.",
    initialMessage:
      "¡Hola! Soy la IA de Aplikei. Puedo ayudarte a organizar tus datos y documentos para el proceso. ¿Qué te gustaría saber?\n\n**Recuerda:** No ofrezco asesoría legal, no analizo elegibilidad y no garantizo aprobación.",
    placeholder: "Escribe tu pregunta...",
    previewResponse:
      "¡Gracias por tu pregunta! El sistema de IA se conectará en la versión final. Por ahora, esto es una vista previa del chat.",
    aiProblem: "Lo siento, tuve un problema.",
    aiError: "Error al hablar con la IA.",
  },
  uploads: {
    title: "Documentos",
    subtitle: "Sube tus documentos por categoría. Aceptados: JPG, PNG (máx. 10MB).",
    tip: "Los documentos deben ser legibles, sin recortes y en buena resolución. Los escaneos son preferibles a las fotos.",
    received: "Recibido",
    pending: "Pendiente",
    resubmit: "Reenviar",
    upload: "Subir",
    docs: [
      "Pasaporte (página principal)",
      "Foto 5x5cm",
      "Comprobante financiero",
      "Comprobante de vínculo",
    ],
    successMsg: "¡Documento subido con éxito!",
    approved: "Aprobado",
    tipLabel: "Consejo:",
    uploadingMsg: "Subiendo...",
  },
  packagePDF: {
    title: "Paquete Final (PDF)",
    subtitle:
      "Genera tu PDF con checklist final, resumen del caso e instrucciones de próximos pasos.",
    disclaimer:
      "El Paquete Final es un resumen organizacional. No constituye asesoría legal y no garantiza aprobación.",
    generate: "Generar Paquete Final",
    generateDesc: "Completa el onboarding para generar tu PDF personalizado.",
    generateBtn: "Generar PDF (completa el onboarding)",
    pdfContains: "Qué contiene el PDF:",
    pdfItems: [
      "Checklist final de documentos",
      "Resumen del caso (datos proporcionados)",
      "Instrucciones de próximos pasos",
      "Modelos de cartas (cuando aplique)",
    ],
    history: "Historial de PDFs",
    draft: "Borrador",
    download: "Descargar",
    finalPackage: "Paquete Final",
  },
  helpCenter: {
    title: "Soporte Amigable de la Plataforma",
    subtitle:
      "Nuestro equipo de soporte humano te ayuda a navegar la plataforma para que puedas enfocarte en tu aplicación.",
    warning:
      "No respondemos preguntas sobre estrategia, elegibilidad, probabilidades o asesoría legal. Solo preguntas operacionales sobre uso de la plataforma.",
    importantText: "Importante:",
    weHelpWith: "✅ En qué ayuda nuestro equipo de soporte:",
    weHelpItems: [
      "Cómo usar el sistema y navegar la plataforma",
      "Dónde y cómo subir tus documentos",
      "Cómo pagar tarifas consulares/USCIS",
      "Cómo agendar citas",
      "Cómo dar seguimiento al estado de tu proceso",
      "Cómo descargar tu paquete final en PDF",
    ],
    weDoNotLabel: "❌ Lo que nuestro soporte NO hace:",
    weDoNotItems: [
      "Dar asesoría legal o estrategia migratoria",
      "Analizar elegibilidad o probabilidades de aprobación",
      "Llenar formularios oficiales del gobierno por ti",
      "Representarte ante consulados o USCIS",
      "Garantizar la aprobación de visa o petición",
    ],
    faqTitle: "Preguntas frecuentes",
    faqItems: [
      {
        q: "¿Cómo subo documentos?",
        a: "Ve a Documentos en el menú lateral, haz clic en el botón Subir junto a cada documento y selecciona el archivo (PDF, JPG o PNG, máx. 10MB).",
      },
      {
        q: "¿Cómo pago las tarifas consulares/USCIS?",
        a: "La guía incluye instrucciones detalladas sobre cómo pagar las tarifas. Generalmente se hace en el sitio oficial del consulado o USCIS. Aplikei no procesa estas tarifas.",
      },
      {
        q: "¿Cómo agendo la entrevista en el consulado?",
        a: "Después de pagar la tarifa MRV, visita el sitio web del CASV para agendar. La guía explica el paso a paso.",
      },
      {
        q: "¿Cómo doy seguimiento al estado de mi proceso?",
        a: "Si aplica, puedes verificar el estado en el sitio de USCIS con tu número de recibo. La guía explica cómo.",
      },
      {
        q: "¿Cómo uso el chat de IA?",
        a: "Haz clic en 'Chat IA' en el menú lateral. La IA responde preguntas sobre organización de datos y documentos. No ofrece asesoría legal.",
      },
    ],
    ticketTitle: "Abrir ticket de ayuda",
    ticketSubtitle: "Selecciona la categoría y describe tu pregunta operacional.",
    category: "Categoría (obligatoria)",
    selectCategory: "Selecciona...",
    categories: [
      "Cómo usar el sistema",
      "Dónde subir documentos",
      "Cómo pagar tarifas",
      "Cómo agendar",
      "Cómo dar seguimiento",
    ],
    yourQuestion: "Tu pregunta",
    questionPlaceholder: "Describe tu pregunta operacional...",
    submit: "Enviar ticket",
  },
  legal: {
    lastUpdated: "Última actualización: Febrero de 2026",
    terms: {
      title: "Términos de Uso",
      sections: [
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
      acceptNotice:
        "Al usar Aplikei, declaras haber leído y aceptado estos Términos de Uso, la Política de Privacidad y los Avisos.",
    },
    privacy: {
      title: "Política de Privacidad",
      sections: [
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
    refund: {
      title: "Política de Reembolso",
      sections: [
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
    disclaimersPage: {
      title: "Avisos",
      readCarefully: "Lee atentamente antes de usar la plataforma.",
      natureTitle: "Naturaleza del servicio",
      natureItems: [
        "Aplikei no es un despacho de abogados y no cuenta con abogados que presten servicios legales a los usuarios.",
        "No ofrecemos asesoría legal, análisis de elegibilidad, evaluación de probabilidades o estrategia migratoria.",
        "No garantizamos la aprobación de visas, extensiones, cambios de estatus o cualquier petición migratoria.",
        "No representamos al cliente ante consulados americanos, USCIS o cualquier agencia gubernamental.",
      ],
      offersTitle: "Qué ofrece Aplikei",
      offersItems: [
        "Guías digitales educativas paso a paso para procesos migratorios simples.",
        "IA para la organización de datos y documentos (no para análisis legal).",
        "Soporte humano exclusivamente operacional (N1): uso del sistema, carga de archivos, tasas, programación y estado.",
        "Generación de paquete final (PDF) con lista de verificación, resumen e instrucciones.",
      ],
    },
  },
} as const;

export default dashboard;
