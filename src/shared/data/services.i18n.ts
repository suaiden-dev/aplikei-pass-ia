/**
 * Localized overrides for the featured service pages.
 * Only text fields are translated — slugs, prices, heroImage, etc. remain in the source.
 * Add more locales as needed by following the same structure.
 */

import type { StepConfig } from "../components/templates/ServiceDetailTemplate";

type ServiceTextFields = {
  title: string;
  subtitle: string;
  description: string;
  forWhom: string[];
  notForWhom: string[];
  included: string[];
  requirements: string[];
  steps?: Array<Pick<StepConfig, "title" | "description">>;
  faq: { q: string; a: string }[];
};

type ServiceLocaleMap = Record<string, ServiceTextFields>;

const servicesI18n: Record<string, ServiceLocaleMap> = {
  en: {
    "visto-b1-b2": {
      title: "Tourism and Business (B1/B2)",
      subtitle: "Complete step-by-step guide",
      description: "Complete guide for applying for a U.S. tourism and business visa.",
      forWhom: ["Tourists", "Business owners"],
      notForWhom: [],
      included: ["DS-160 guide", "Document checklist", "Interview simulator"],
      requirements: ["Valid passport"],
      steps: [
        { title: "Initial Form", description: "Fill in your personal and professional information." },
        { title: "Technical Review", description: "Our specialists review your application." },
        { title: "Consular Credentials", description: "Set up the profile in the consular system." },
        { title: "Review and Signature", description: "Final validation of the submitted data." },
        { title: "Final Review", description: "Review of the signed documents." },
        { title: "CASV Scheduling", description: "Choose the date for biometrics and photo." },
        { title: "Account Creation", description: "Complete the consular profile." },
        { title: "Email Confirmation", description: "Validate the consular account." },
        { title: "MRV Fee Generation", description: "Issue the consular fee slip." },
        { title: "Fee Payment", description: "Confirm payment of the consular fee." },
        { title: "Final Scheduling", description: "Confirm the interview date." },
      ],
      faq: [],
    },
    "visto-b1-b2-reaplicacao": {
      title: "B1/B2 Reapplication",
      subtitle: "Focused entirely on overturning the denial",
      description: "Specialized guide for applicants who have already been denied a visa.",
      forWhom: ["Anyone recently denied a visa"],
      notForWhom: [],
      included: ["Denial analysis", "Reapplication strategy", "Interview training"],
      requirements: ["Valid passport", "Previous refusal letter"],
      steps: [
        { title: "Initial Form", description: "Fill in your information with a focus on the previous denial." },
        { title: "Strategic Review", description: "Assessment of the reasons for the previous denial." },
        { title: "Consular Credentials", description: "Set up the profile in the consular system." },
        { title: "Review and Signature", description: "Final validation of the submitted data." },
        { title: "Final Review", description: "Review of the signed documents." },
        { title: "CASV Scheduling", description: "Choose the date for biometrics and photo." },
        { title: "Account Creation", description: "Complete the consular profile." },
        { title: "Email Confirmation", description: "Validate the consular account." },
        { title: "MRV Fee Generation", description: "Issue the consular fee slip." },
        { title: "Fee Payment", description: "Confirm payment of the consular fee." },
        { title: "Final Scheduling", description: "Confirm the interview date." },
      ],
      faq: [],
    },
  },
  es: {},
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
