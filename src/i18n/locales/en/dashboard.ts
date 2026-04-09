const dashboard = {
  dashboard: {
    title: "Dashboard",
    welcome: "Welcome back! Continue your process.",
    overallProgress: "Overall progress",
    onboarding: "Onboarding",
    complete: "complete",
    cards: {
      currentService: "My current service",
      currentServiceDesc: "B1/B2 Visa — Tourism and Business",
      inProgress: "In progress",
      checklist: "Document checklist",
      checklistDesc: "3 of 8 documents uploaded",
      chatAI: "Chat with AI",
      chatAIDesc: "Ask questions and organize your process",
      uploads: "Uploads",
      uploadsDesc: "Upload and manage your documents",
      generatePDF: "Generate final package (PDF)",
      generatePDFDesc: "Available when onboarding is complete",
      help: "Support",
      helpDesc: "Questions about platform usage",
    },
    access: "Access",
    selfieModal: {
      title: "Initial Setup: Photos Required",
      desc: "To proceed, we need two photos: one holding your passport for identity verification, and one digital photo (5x5) for the application.",
      step1Title: "Step 1: Identity Verification",
      step1Desc:
        "Take a selfie holding your passport next to your face. Ensure the passport data is legible.",
      step2Title: "Step 2: Digital Visa Photo",
      step2Desc:
        "Upload a recent 5x5cm digital photo with a plain white background, facing forward, with no glasses or hats.",
      uploadBtn: "Select Photo",
      selectVisaPhoto: "Select 5x5 Photo",
      nextStep: "Next Step",
      finish: "Complete Setup",
      submitting: "Uploading...",
      success: "Photos uploaded successfully!",
    },
    activeProcesses: "Your Active Processes",
    selectProcess: "Select Process",
    getProcesses: "Get Processes",
    comingSoon: "Coming Soon",
    getStarted: "Get Started",
    available: "Available",
    paymentSuccess: "Payment confirmed! Your new guide is available below.",
    errorUploadingSelfie: "Error uploading selfie",
    remove: "Remove",
    selectSelfie: "Select your selfie",
    or: "or",
    status: {
      ds160Processing: "Processing DS-160",
      cosInProgress: "Onboarding: Info & Photo",
      cosProcessing: "Reviewing Application",
      cosOfficialForms: "3. Official Forms",
      ds160uploadDocuments: "3. Upload Documents",
      ds160AwaitingReviewAndSignature: "4. Review and Signature",
      uploadsUnderReview: "4. Documents Review",
      casvSchedulingPending: "5. Scheduling Pending",
      casvFeeProcessing: "6. Fee in Processing",
      casvPaymentPending: "7. CASV Payment Pending",
      awaitingInterview: "8. Awaiting Interview",
      approved: "9. Approved",
      rejectedText: "Process Denied",
      rejectedLabel: "Rejected",
      stepOf: "Step [step] of [total]",
    },
    myProcesses: "My Processes",
    trackStatus: "Track the status of all your guides and applications.",
    noActiveProcesses: "You don't have any active processes yet.",
    progress: "Progress",
    accessDetails: "ACCESS DETAILS",
  },
  sidebar: {
    dashboard: "Dashboard",
    onboarding: "Onboarding",
    chatAI: "AI Chat",
    documents: "Documents",
    finalPackage: "Final Package",
    help: "Support",
    logout: "Log out",
    myProcesses: "My Processes",
    status: "Status",
  },
  chat: {
    title: "AI Chat",
    subtitle: "AI helps organize data and documents. It does not offer legal advice.",
    initialMessage:
      "Hello! I'm Aplikei's AI. I can help you organize your data and documents for the process. What would you like to know?\n\n**Remember:** I do not offer legal advice, do not analyze eligibility, and do not guarantee approval.",
    placeholder: "Type your question...",
    previewResponse:
      "Thanks for your question! The AI system will be connected in the final version. For now, this is a chat preview.",
    aiProblem: "Sorry, I had a problem.",
    aiError: "Error talking to AI.",
  },
  uploads: {
    title: "Documents",
    subtitle: "Upload your documents by category. Accepted: JPG, PNG (max. 10MB).",
    tip: "Documents must be legible, uncropped, and in good resolution. Scans are preferred over photos.",
    received: "Received",
    pending: "Pending",
    resubmit: "Resubmit",
    upload: "Upload",
    docs: [
      "Passport (main page)",
      "5x5cm photo",
      "Financial proof",
      "Proof of ties",
    ],
    successMsg: "Document uploaded successfully!",
    approved: "Approved",
    tipLabel: "Tip:",
    uploadingMsg: "Uploading...",
  },
  packagePDF: {
    title: "Final Package (PDF)",
    subtitle:
      "Generate your PDF with final checklist, case summary, and next step instructions.",
    disclaimer:
      "The Final Package is an organizational summary. It does not constitute legal advice and does not guarantee approval.",
    generate: "Generate Final Package",
    generateDesc: "Complete onboarding to generate your personalized PDF.",
    generateBtn: "Generate PDF (complete onboarding)",
    pdfContains: "What the PDF contains:",
    pdfItems: [
      "Final document checklist",
      "Case summary (provided data)",
      "Next step instructions",
      "Letter templates (when applicable)",
    ],
    history: "PDF History",
    draft: "Draft",
    download: "Download",
    finalPackage: "Final Package",
  },
  helpCenter: {
    title: "Friendly Platform Support",
    subtitle:
      "Our human support team helps you navigate the platform so you can focus on your application.",
    warning:
      "We do not answer questions about strategy, eligibility, chances, or legal advice. Only operational questions about platform usage.",
    importantText: "Important:",
    weHelpWith: "✅ What our support team helps with:",
    weHelpItems: [
      "How to use the system and navigate the platform",
      "Where and how to upload your documents",
      "How to pay consular/USCIS fees",
      "How to schedule appointments",
      "How to track your process status",
      "How to download your final PDF package",
    ],
    weDoNotLabel: "❌ What our support does NOT do:",
    weDoNotItems: [
      "Provide legal advice or immigration strategy",
      "Analyze eligibility or approval chances",
      "Fill out official government forms for you",
      "Represent you before consulates or USCIS",
      "Guarantee visa or petition approval",
    ],
    faqTitle: "Frequently asked questions",
    faqItems: [
      {
        q: "How do I upload documents?",
        a: "Go to Documents in the sidebar, click the Upload button next to each document, and select the file (PDF, JPG, or PNG, max. 10MB).",
      },
      {
        q: "How do I pay consular/USCIS fees?",
        a: "The guide includes detailed instructions on how to pay fees. It's usually done on the official consulate or USCIS website. Aplikei does not process these fees.",
      },
      {
        q: "How do I schedule a consulate interview?",
        a: "After paying the MRV fee, visit the CASV website to schedule. The guide explains the step-by-step process.",
      },
      {
        q: "How do I track my process status?",
        a: "If applicable, you can check status on the USCIS website with your receipt number. The guide explains how.",
      },
      {
        q: "How do I use the AI chat?",
        a: "Click 'AI Chat' in the sidebar. AI answers questions about data and document organization. It does not offer legal advice.",
      },
    ],
    ticketTitle: "Open a help ticket",
    ticketSubtitle: "Select a category and describe your operational question.",
    category: "Category (required)",
    selectCategory: "Select...",
    categories: [
      "How to use the system",
      "Where to upload documents",
      "How to pay fees",
      "How to schedule",
      "How to track status",
    ],
    yourQuestion: "Your question",
    questionPlaceholder: "Describe your operational question...",
    submit: "Submit ticket",
  },
  legal: {
    lastUpdated: "Last updated: February 2026",
    terms: {
      title: "Terms of Use",
      sections: [
        {
          title: "1. About Aplikei",
          content:
            "Aplikei is a digital platform that offers step-by-step guides with artificial intelligence assistance for simple immigration processes. Aplikei is not a law firm, does not offer legal advice, and does not guarantee visa or petition approvals.",
        },
        {
          title: "2. Services offered",
          content:
            "When purchasing a guide, the user receives: a step-by-step digital guide, AI access during the process (bonus), N1 operational human support (bonus), and final package PDF generation. Human support is strictly operational and limited to: system usage, document uploads, fee payments, scheduling, and status tracking.",
        },
        {
          title: "3. Limitations",
          content:
            "Aplikei does not: analyze eligibility, offer strategy, assess approval chances, fill out official forms, represent clients before consulates or USCIS, or provide any type of legal advice.",
        },
        {
          title: "4. User responsibility",
          content:
            "The user is responsible for the accuracy of information provided, filling out official forms, submitting applications, and attending interviews. Aplikei is not responsible for decisions made based on the educational content provided.",
        },
        {
          title: "5. Privacy and data",
          content:
            "Data provided is protected under our Privacy Policy. Aplikei uses encryption and security best practices to protect personal information.",
        },
        {
          title: "6. Refund",
          content:
            "See our Refund Policy for detailed information about cancellations and returns.",
        },
      ],
      acceptNotice:
        "By using Aplikei, you declare that you have read and agreed to these Terms of Use, the Privacy Policy, and the Disclaimers.",
    },
    privacy: {
      title: "Privacy Policy",
      sections: [
        {
          title: "1. Data collected",
          content:
            "We collect: registration data (name, email), immigration process data (personal information, documents), platform usage data, and payment data (processed by secure third parties).",
        },
        {
          title: "2. Data usage",
          content:
            "Your data is used to: provide the contracted service, personalize the guide and final package, process payments, provide operational support, and improve the platform.",
        },
        {
          title: "3. Sharing",
          content:
            "We do not sell personal data. We only share with: payment processors, infrastructure services (hosting, database), and when required by law.",
        },
        {
          title: "4. Security",
          content:
            "We use encryption in transit and at rest, access controls, and information security best practices to protect your data.",
        },
        {
          title: "5. Your rights",
          content:
            "You can request access, correction, or deletion of your personal data at any time through the platform's contact channel.",
        },
        {
          title: "6. Cookies",
          content:
            "We use essential cookies for platform operation and analytics cookies to improve user experience.",
        },
      ],
    },
    refund: {
      title: "Refund Policy",
      sections: [
        {
          title: "1. Refund period",
          content:
            "You can request a refund within 7 days of purchase, as long as you have not generated the Final Package (PDF).",
        },
        {
          title: "2. Conditions",
          content:
            "Refund is available when: the Final Package has not been generated, the 7-day period has not been exceeded, and the service has not been used abusively.",
        },
        {
          title: "3. How to request",
          content:
            "To request a refund, open a ticket in the Help Center (N1) selecting the category 'How to use the system' and mentioning your refund request.",
        },
        {
          title: "4. Processing",
          content:
            "The refund will be processed using the same payment method used for the purchase, within 10 business days after approval.",
        },
        {
          title: "5. Exceptions",
          content:
            "We do not offer refunds after generating the Final Package, after the 7-day period, or in cases of platform abuse.",
        },
      ],
    },
    disclaimersPage: {
      title: "Disclaimers",
      readCarefully: "Read carefully before using the platform.",
      natureTitle: "Nature of service",
      natureItems: [
        "Aplikei is not a law firm and does not have attorneys providing legal services to users.",
        "We do not offer legal advice, eligibility analysis, chance assessment, or immigration strategy.",
        "We do not guarantee approval of visas, extensions, status changes, or any immigration petition.",
        "We do not represent clients before American consulates, USCIS, or any government agency.",
      ],
      offersTitle: "What Aplikei offers",
      offersItems: [
        "Educational step-by-step digital guides for simple immigration processes.",
        "AI for data and document organization (not for legal analysis).",
        "Exclusively operational human support (N1): system usage, uploads, fees, scheduling, and status.",
        "Final package (PDF) generation with checklist, summary, and instructions.",
      ],
    },
  },
} as const;

export default dashboard;
