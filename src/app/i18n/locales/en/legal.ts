const legal = {
  lastUpdated: "Last updated: March 2026",
  terms: {
    title: "Terms of Use",
    acceptNotice: "By using Aplikei, you declare that you have read and agreed to these Terms of Use, the Privacy Policy, and the Disclaimers.",
    sections: [
      {
        title: "1. About Aplikei",
        content: "Aplikei is a digital platform that offers step-by-step guides with artificial intelligence assistance for simple immigration processes. Aplikei is not a law firm, does not offer legal advice, and does not guarantee visa or petition approvals."
      },
      {
        title: "2. Services offered",
        content: "When purchasing a guide, the user receives: a step-by-step digital guide, AI access during the process (bonus), N1 operational human support (bonus), and final package PDF generation."
      },
      {
        title: "3. Limitations",
        content: "Aplikei does not: analyze eligibility, offer strategy, assess approval chances, fill out official forms, represent clients before consulates or USCIS, or provide any type of legal advice."
      },
      {
        title: "4. User responsibility",
        content: "The user is responsible for the accuracy of information provided, filling out official forms, submitting applications, and attending interviews."
      }
    ]
  },
  privacy: {
    title: "Privacy Policy",
    sections: [
      {
        title: "1. Data collected",
        content: "We collect: registration data (name, email), immigration process data (personal information, documents), platform usage data, and payment data."
      },
      {
        title: "2. Usage",
        content: "Your data is used to: provide the contracted service, personalize the guide and final package, process payments, and improve the platform."
      },
      {
        title: "3. Sharing",
        content: "We do not sell personal data. We only share with payment processors and infrastructure services strictly necessary for the service."
      }
    ]
  },
  refund: {
    title: "Refund Policy",
    sections: [
      {
        title: "1. Refund period",
        content: "You can request a refund within 7 days of purchase, as long as you have not generated the Final Package (PDF)."
      },
      {
        title: "2. Conditions",
        content: "Refund is available when: the Final Package has not been generated, the 7-day period has not been exceeded, and the service has not been used abusively."
      }
    ]
  },
  disclaimersPage: {
    title: "Disclaimers",
    readCarefully: "Read carefully before using the platform.",
    natureTitle: "Nature of Service",
    natureItems: [
      "Aplikei is not a law firm and does not have attorneys providing legal services to users.",
      "We do not offer legal advice, eligibility analysis, or immigration strategy.",
      "We do not guarantee approval of visas or any immigration petition.",
      "We do not represent clients before American consulates or USCIS."
    ],
    offersTitle: "What Aplikei offers",
    offersItems: [
      "Educational step-by-step digital guides.",
      "AI for data and document organization.",
      "Exclusively operational human support (N1).",
      "Organized final package (PDF) generation."
    ]
  },
  contract: {
    title: "Service Contract Terms",
    sections: [
      {
        title: "1. General Conditions",
        content: "By contracting our services, you agree that Aplikei provides educational guidance and technological tools. We do not represent you legally."
      },
      {
        title: "2. Responsibilities",
        content: "The user is exclusively responsible for the veracity of the documents and information provided."
      },
      {
        title: "3. Electronic Signature",
        content: "Your acceptance of these terms at the time of purchase constitutes a valid electronic signature linked to your ID and IP address."
      }
    ]
  }
} as const;

export default legal;
