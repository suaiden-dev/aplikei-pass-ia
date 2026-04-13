const legal = {
  lastUpdated: "Última actualización: Marzo de 2026",
  terms: {
    title: "Términos de Uso",
    acceptNotice: "Al usar Aplikei, declaras haber leído y aceptado estos Términos de Uso, la Política de Privacidad y los Avisos.",
    sections: [
      {
        title: "1. Sobre Aplikei",
        content: "Aplikei es una plataforma digital que ofrece guías paso a paso con asistencia de inteligencia artificial para procesos migratorios simples. Aplikei no es un despacho de abogados, no ofrece asesoría legal y no garantiza la aprobación de visas o peticiones."
      },
      {
        title: "2. Servicios ofrecidos",
        content: "Al adquirir una guía, el usuario recibe: guía digital paso a paso, acceso a la IA durante el proceso (bonus), soporte humano N1 operacional (bonus) y generación de paquete final en PDF."
      },
      {
        title: "3. Limitaciones",
        content: "Aplikei no: analiza elegibilidad, ofrece estrategia, evalúa probabilidades de aprobación, llena formularios oficiales, representa al cliente ante consulados o USCIS, ni proporciona ningún tipo de asesoría legal."
      },
      {
        title: "4. Responsabilidad del usuario",
        content: "El usuario es responsable de la veracidad de la información proporcionada, del llenado de formularios oficiales, del envío de la solicitud y de asistir a entrevistas."
      }
    ]
  },
  privacy: {
    title: "Política de Privacidad",
    sections: [
      {
        title: "1. Datos recopilados",
        content: "Recopilamos: datos de registro (nombre, correo), datos del proceso migratorio (información personal, documentos), datos de uso de la plataforma y datos de pago."
      },
      {
        title: "2. Uso de datos",
        content: "Tus datos se utilizan para: proporcionar el servicio contratado, personalizar la guía y el paquete final, procesar pagos y mejorar la plataforma."
      },
      {
        title: "3. Compartir",
        content: "No vendemos datos personales. Solo compartimos con procesadores de pago y servicios de infraestructura estrictamente necesarios para el servicio."
      }
    ]
  },
  refund: {
    title: "Política de Reembolso",
    sections: [
      {
        title: "1. Plazo de reembolso",
        content: "Puedes solicitar un reembolso dentro de los 7 días posteriores a la compra, siempre que no hayas generado el Paquete Final (PDF)."
      },
      {
        title: "2. Condiciones",
        content: "El reembolso está disponible cuando: no se ha generado el Paquete Final, não se ha superado el plazo de 7 días y el servicio não se ha utilizado de forma abusiva."
      }
    ]
  },
  disclaimersPage: {
    title: "Avisos Legales",
    readCarefully: "Lee atentamente antes de usar la plataforma.",
    natureTitle: "Naturaleza del Servicio",
    natureItems: [
      "Aplikei no es un despacho de abogados y no cuenta con abogados que presten servicios legales a los usuarios.",
      "No ofrecemos asesoría legal, análisis de elegibilidad ni estrategia migratoria.",
      "No garantizamos la aprobación de visas ni de ninguna petición migratoria.",
      "No representamos al cliente ante consulados americanos o USCIS."
    ],
    offersTitle: "Lo que ofrece Aplikei",
    offersItems: [
      "Guías digitales educativas paso a paso.",
      "IA para la organización de datos y documentos.",
      "Soporte humano exclusivamente operacional (N1).",
      "Generación de paquete final (PDF) organizado."
    ]
  },
  contract: {
    title: "Términos del Contrato de Servicio",
    sections: [
      {
        title: "1. Condiciones Generales",
        content: "Al contratar nuestros servicios, aceptas que Aplikei proporciona orientación educativa y herramientas tecnológicas. No te representamos legalmente."
      },
      {
        title: "2. Responsabilidades",
        content: "El usuario es exclusivamente responsable de la veracidad de los documentos e información proporcionada."
      },
      {
        title: "3. Firma Electrónica",
        content: "Su aceptación de estos términos en el momento de la compra constituye una firma electrónica válida, vinculada a su ID y dirección IP."
      }
    ]
  }
} as const;

export default legal;
