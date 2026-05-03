/**
 * Localized overrides for the four featured service pages.
 * Only text fields are translated — slugs, prices, heroImage, etc. remain in the source.
 * Add more locales as needed by following the same structure.
 */

type ServiceTextFields = {
  title: string;
  subtitle: string;
  description: string;
  forWhom: string[];
  notForWhom: string[];
  included: string[];
  requirements: string[];
  faq: { q: string; a: string }[];
};

type ServiceLocaleMap = Record<string, ServiceTextFields>;

const servicesI18n: Record<string, ServiceLocaleMap> = {
  en: {
    "visto-b1-b2": {
      title: "B1/B2 Tourism & Business Visa",
      subtitle: "Complete step-by-step guide with checklist, document preparation, and consular interview simulator.",
      description:
        "The Aplikei B1/B2 guide was developed for those who wish to visit the US for tourism or business. We cover everything from DS-160 completion to consular interview preparation, with detailed checklists and document templates.",
      forWhom: [
        "First-time tourists planning to visit the US",
        "Professionals traveling for business without US employment",
        "People needing to renew an expired B1/B2 visa",
        "Anyone seeking to organize their documentation independently",
      ],
      notForWhom: [
        "Those who intend to work formally in the US",
        "Cases with prior consular denials (we recommend an attorney)",
        "Those requiring personalized legal advice",
      ],
      included: [
        "DS-160 Guide: Detailed instructions to fill out the form without errors",
        "Document Checklist: Complete list of everything you need to gather",
        "Interview Preparation: Common questions and how to answer them",
        "Final PDF Package: Organized document ready to print and submit",
      ],
      requirements: [
        "Valid passport",
        "DS-160 form",
        "Proof of income",
        "Bank statement",
        "Proof of ties",
        "Invitation letter (if applicable)",
        "5x5cm photos",
        "Payment receipt",
        "Travel itinerary",
      ],
      faq: [
        { q: "How long do I have access to the guide?", a: "You have access for 90 days from purchase — enough time to organize all your documentation." },
        { q: "Does the guide guarantee visa approval?", a: "No. The decision is exclusively the consulate's. Our guide maximizes your chances by ensuring organized and complete documentation." },
        { q: "Can I add dependents?", a: "Yes. Each dependent (spouse or minor child) can be included for an additional US$ 50.00." },
        { q: "Does it work for visa renewal?", a: "Yes. The guide covers both first-time applications and B1/B2 visa renewals." },
      ],
    },
    "visto-f1": {
      title: "F-1 Student Visa",
      subtitle: "Detailed instructions for obtaining the I-20, interview preparation, and complete documentation.",
      description:
        "The Aplikei F-1 guide leads the student through all stages of the process: from acceptance at a US institution to visa approval, including SEVIS guidance and consular interview preparation.",
      forWhom: [
        "Students accepted at US universities or language schools",
        "Those who want to understand the I-20 and SEVIS process",
        "Students needing to renew their F-1 visa",
      ],
      notForWhom: [
        "Those who do not yet have an acceptance letter from a US institution",
        "Cases with a history of status violations (we recommend an attorney)",
      ],
      included: [
        "I-20 Guide: How to request and correctly interpret the document",
        "SEVIS Checklist: Step-by-step payment and registration process",
        "Interview Preparation: Questions specific to students",
        "Final PDF Package: Complete organization for interview day",
      ],
      requirements: [
        "Valid passport",
        "DS-160 form",
        "Acceptance letter (I-20)",
        "SEVIS payment receipt",
        "Financial proof",
        "Academic transcript",
        "5x5cm photos",
        "Payment receipt",
      ],
      faq: [
        { q: "Do I need the I-20 before purchasing the guide?", a: "No, but you need the acceptance letter. The guide walks you through requesting the I-20 from the institution." },
        { q: "Does the guide cover language courses too?", a: "Yes. The guide covers any institution that issues an I-20, including language schools." },
        { q: "What if my visa is denied?", a: "Our guide maximizes your chances, but we do not guarantee approval. If denied, we recommend consulting an attorney." },
      ],
    },
    "extensao-status": {
      title: "Extension of Status (EOS)",
      subtitle: "Learn how to legally extend your stay in the US without having to leave the country.",
      description:
        "The Extension of Status guide supports those in the US on a temporary visa who wish to remain longer legally, using Form I-539 with USCIS.",
      forWhom: [
        "Those in the US on a valid B1/B2 visa who wish to stay longer",
        "Visa-holder dependents who need to extend their status",
      ],
      notForWhom: [
        "Those already past their status expiration (overstay) — we recommend an attorney",
        "Those who want to change visa categories (use the COS guide)",
      ],
      included: [
        "I-539 Guide: Detailed completion instructions",
        "Document Checklist: Everything USCIS requires",
        "Support Letter: Template of explanatory letter",
        "Final PDF Package: Organized submission to USCIS",
      ],
      requirements: [
        "Valid passport",
        "Current I-94",
        "Form I-539",
        "Financial proof",
        "Explanatory letter",
        "Photos",
        "USCIS fee payment",
      ],
      faq: [
        { q: "When should I apply for the extension?", a: "It is recommended to apply at least 45 days before your current status expires." },
        { q: "Can I stay in the US while waiting?", a: "Yes. If you submitted the application before expiration, you are in 'authorized stay' while awaiting the decision." },
      ],
    },
    "troca-status": {
      title: "Change of Status (COS)",
      subtitle: "Change your visa category in the US without having to return to your home country.",
      description:
        "The Change of Status guide supports those in the US who wish to change their visa category — for example, from tourist (B2) to student (F-1) — without leaving the country.",
      forWhom: [
        "B1/B2 tourists who were accepted at a US institution",
        "Those who wish to change status before their current one expires",
      ],
      notForWhom: [
        "Those with expired status — we recommend an attorney",
        "Cases involving a change to work status (H-1B, L-1)",
      ],
      included: [
        "I-539 Guide: Instructions for the category change",
        "Complete Checklist: Documents specific to the new category",
        "Explanatory Letter: Justification template for the change",
        "Final PDF Package: Organized submission to USCIS",
      ],
      requirements: [
        "Valid passport",
        "Current I-94",
        "Form I-539",
        "I-20 (if F-1)",
        "Financial proof",
        "Explanatory letter",
        "USCIS fee payment",
      ],
      faq: [
        { q: "Can I work during the F-1 status change?", a: "No. You cannot work until the new F-1 status is approved." },
        { q: "How long does approval take?", a: "Generally between 3 and 6 months. USCIS may request additional documents (RFE)." },
      ],
    },
  },

  es: {
    "visto-b1-b2": {
      title: "Visa de Turismo y Negocios B1/B2",
      subtitle: "Guía completa paso a paso con checklist, preparación de documentos y simulador de entrevista consular.",
      description:
        "La guía Aplikei B1/B2 fue desarrollada para quienes desean visitar los EE.UU. por turismo o negocios. Cubrimos desde el llenado del DS-160 hasta la preparación para la entrevista consular, con checklists detallados y modelos de documentos.",
      forWhom: [
        "Turistas que desean visitar los EE.UU. por primera vez",
        "Profesionales que viajan por negocios sin empleo en EE.UU.",
        "Personas que necesitan renovar su visa B1/B2 vencida",
        "Quienes buscan organizar su documentación de forma independiente",
      ],
      notForWhom: [
        "Quienes desean trabajar formalmente en los EE.UU.",
        "Casos con negativas consulares anteriores (recomendamos un abogado)",
        "Quienes requieren asesoría jurídica personalizada",
      ],
      included: [
        "Guía DS-160: Instrucciones detalladas para completar el formulario sin errores",
        "Checklist de Documentos: Lista completa de todo lo que necesitas reunir",
        "Preparación para la Entrevista: Preguntas frecuentes y cómo responderlas",
        "Paquete PDF Final: Documento organizado y listo para imprimir y enviar",
      ],
      requirements: [
        "Pasaporte válido",
        "Formulario DS-160",
        "Comprobante de ingresos",
        "Estado de cuenta bancario",
        "Comprobante de vínculos",
        "Carta de invitación (si aplica)",
        "Fotos 5x5cm",
        "Comprobante de pago",
        "Itinerario de viaje",
      ],
      faq: [
        { q: "¿Cuánto tiempo tengo acceso a la guía?", a: "Tienes acceso por 90 días desde la compra, tiempo suficiente para organizar toda tu documentación." },
        { q: "¿La guía garantiza la aprobación del visa?", a: "No. La decisión es exclusiva del consulado. Nuestra guía maximiza tus posibilidades al garantizar documentación organizada y completa." },
        { q: "¿Puedo agregar dependientes?", a: "Sí. Cada dependiente (cónyuge o hijo menor) puede ser incluido por US$ 50.00 adicionales." },
        { q: "¿Funciona para la renovación de visa?", a: "Sí. La guía cubre tanto la primera solicitud como la renovación de la visa B1/B2." },
      ],
    },
    "visto-f1": {
      title: "Visa de Estudiante F-1",
      subtitle: "Instrucciones detalladas para obtener el I-20, preparación para la entrevista y documentación completa.",
      description:
        "La guía F-1 de Aplikei guía al estudiante por todas las etapas del proceso: desde la aceptación en una institución estadounidense hasta la aprobación de la visa, incluyendo orientaciones sobre SEVIS y preparación para la entrevista consular.",
      forWhom: [
        "Estudiantes aceptados en universidades o escuelas de idiomas en EE.UU.",
        "Quienes desean entender el proceso del I-20 y SEVIS",
        "Estudiantes que necesitan renovar su visa F-1",
      ],
      notForWhom: [
        "Quienes aún no tienen carta de aceptación de una institución estadounidense",
        "Casos con historial de violación de estatus (recomendamos un abogado)",
      ],
      included: [
        "Guía I-20: Cómo solicitar e interpretar correctamente el documento",
        "Checklist SEVIS: Paso a paso del pago y registro",
        "Preparación para la Entrevista: Preguntas específicas para estudiantes",
        "Paquete PDF Final: Organización completa para el día de la entrevista",
      ],
      requirements: [
        "Pasaporte válido",
        "Formulario DS-160",
        "Carta de aceptación (I-20)",
        "Comprobante SEVIS",
        "Comprobante financiero",
        "Historial académico",
        "Fotos 5x5cm",
        "Comprobante de pago",
      ],
      faq: [
        { q: "¿Necesito tener el I-20 antes de comprar la guía?", a: "No, pero sí necesitas la carta de aceptación. La guía te orienta para solicitar el I-20 a la institución." },
        { q: "¿La guía cubre cursos de idiomas también?", a: "Sí. La guía cubre cualquier institución que emita un I-20, incluyendo escuelas de idiomas." },
        { q: "¿Qué pasa si mi visa es negada?", a: "Nuestra guía maximiza tus posibilidades, pero no garantizamos aprobación. En caso de negativa, recomendamos consultar a un abogado." },
      ],
    },
    "extensao-status": {
      title: "Extensión de Estatus (EOS)",
      subtitle: "Aprende cómo extender legalmente tu estadía en los EE.UU. sin necesidad de salir del país.",
      description:
        "La guía de Extensión de Estatus apoya a quienes están en los EE.UU. con visa temporal y desean permanecer más tiempo de forma legal, utilizando el formulario I-539 ante el USCIS.",
      forWhom: [
        "Quienes están en los EE.UU. con visa B1/B2 válida y desean quedarse más tiempo",
        "Dependientes de titulares de visa que necesitan extender su estatus",
      ],
      notForWhom: [
        "Quienes ya tienen el estatus vencido (overstay) — recomendamos un abogado",
        "Quienes desean cambiar de categoría de visa (usa la guía COS)",
      ],
      included: [
        "Guía I-539: Instrucciones detalladas de llenado",
        "Checklist de Documentos: Todo lo que el USCIS requiere",
        "Carta de Apoyo: Modelo de carta explicativa",
        "Paquete PDF Final: Envío organizado al USCIS",
      ],
      requirements: [
        "Pasaporte válido",
        "I-94 actual",
        "Formulario I-539",
        "Comprobante financiero",
        "Carta explicativa",
        "Fotos",
        "Pago de tarifa USCIS",
      ],
      faq: [
        { q: "¿Cuándo debo solicitar la extensión?", a: "Se recomienda solicitarla al menos 45 días antes de que venza tu estatus actual." },
        { q: "¿Puedo quedarme en los EE.UU. mientras espero?", a: "Sí. Si enviaste la solicitud antes del vencimiento, estás en 'authorized stay' mientras aguardas la decisión." },
      ],
    },
    "troca-status": {
      title: "Cambio de Estatus (COS)",
      subtitle: "Cambia tu categoría de visa en los EE.UU. sin necesidad de regresar a tu país.",
      description:
        "La guía de Cambio de Estatus apoya a quienes están en los EE.UU. y desean cambiar de categoría de visa — por ejemplo, de turista (B2) a estudiante (F-1) — sin salir del país.",
      forWhom: [
        "Turistas B1/B2 que fueron aceptados en una institución estadounidense",
        "Quienes desean cambiar de estatus antes de que venza el actual",
      ],
      notForWhom: [
        "Quienes tienen el estatus vencido — recomendamos un abogado",
        "Casos que implican cambio a estatus de trabajo (H-1B, L-1)",
      ],
      included: [
        "Guía I-539: Instrucciones para el cambio de categoría",
        "Checklist Completo: Documentos específicos de la nueva categoría",
        "Carta Explicativa: Modelo de justificación para el cambio",
        "Paquete PDF Final: Envío organizado al USCIS",
      ],
      requirements: [
        "Pasaporte válido",
        "I-94 actual",
        "Formulario I-539",
        "I-20 (si es F-1)",
        "Comprobante financiero",
        "Carta explicativa",
        "Pago de tarifa USCIS",
      ],
      faq: [
        { q: "¿Puedo trabajar durante el cambio de estatus a F-1?", a: "No. No puedes trabajar hasta que se apruebe el nuevo estatus F-1." },
        { q: "¿Cuánto tiempo tarda la aprobación?", a: "Generalmente entre 3 y 6 meses. El USCIS puede solicitar documentos adicionales (RFE)." },
      ],
    },
  },
};

/**
 * Returns the localized text fields for a service, falling back to PT (source) data.
 */
export function getServiceLocale(
  slug: string,
  lang: string,
): ServiceTextFields | null {
  return servicesI18n[lang]?.[slug] ?? null;
}
