const landing = {
  nav: { pain: "Problem", automation: "Solution", howItWorks: "How it works", pricing: "Plans", signIn: "Sign in", bookDemo: "Book a demo" },
  hero: {
    badge: "Digital operations for immigration firms",
    title: "Website, checkout and processes for your immigration firm",
    titleAccent: "in one system.",
    lead: "Aplikei replaces a static website, loose payment links and spreadsheets with one operation to sell, serve and track immigration cases.",
    bullets: ["A website with your firm's identity", "Checkout to sell consultations and cases", "Team and cases organized with AI support"],
    ctaPrimary: "Get started now", ctaSecondary: "See how it works",
    stat1: { v: "−70%", l: "less time per case" }, stat2: { v: "10k+", l: "active processes" }, stat3: { v: "3×", l: "more cases per team" },
    mockTitle: "Cases", mockSearch: "Search cases…", mockFilter: "Filter",
    mockCols: ["Client", "Status", "Visa", "Progress", "Start"],
    floatLabel: "Digital operation",
    statusLabels: { b: "Status change", g: "Done", "": "In review" },
  },
  logos: { label: "Approved by more than 10 partner law firms", hint: "" },
  pain: {
    title: "Your firm does not need to run across a website, WhatsApp, payment links and spreadsheets.",
    lead: "The problem is not lack of demand. The problem is trying to sell, collect, serve and track cases in separate tools that do not show what is happening.",
    items: [
      { title: "Website without checkout", desc: "The client understands the service but still has to pay through Pix, invoices or loose payment links without the firm's identity." },
      { title: "Scattered support", desc: "WhatsApp, email and spreadsheets compete for the team's attention, without clear ownership, deadlines or centralized history." },
      { title: "Clients lack visibility", desc: "When clients do not know the current stage, they ask again and increase the team's support workload." },
      { title: "The attorney becomes the hub", desc: "Without a clear operational flow, every question returns to the attorney and the firm loses capacity to scale." },
    ],
    barText: "Aplikei connects website, checkout, team and cases in one flow.",
    barSub: "Less improvisation across tools. More clarity to sell, operate and track each case.",
    barBadge: "No WhatsApp as the operating system.",
  },
  solutions: {
    title: "From website to case tracking, everything connected.", lead: "Aplikei puts your firm online, sells through branded checkout and keeps the team organized after the client hires you.",
    items: [
      { title: "A website with your firm's brand", badge: "Live without an agency" as string | null, desc: "Present your services, identity and contact channels in a public experience designed to convert visitors into clients." },
      { title: "Checkout to sell services", badge: "Branded payment" as string | null, desc: "Sell consultations and cases with your own payment page, pricing, dependents and methods like card, Pix and Zelle." },
      { title: "Team and processes in one flow", badge: "Every case has an owner" as string | null, desc: "Track stages, owners and pending work without relying on spreadsheets, WhatsApp groups or loose questions to the attorney." },
      { title: "AI to speed up operations", badge: "Reviewable support" as string | null, desc: "Turn client data and messages into checklists, interview questions and next steps your team can review." },
    ],
  },
  showcase: {
    title: "A real workspace for teams that need a clear picture of every active case.",
    lead: "Finances, solutions and case tracking in the same operational flow — so your team always knows what is pending, who is responsible, and what comes next.",
    bullets: [
      "Clear metrics for business and team decisions",
      "One place to monitor all active solutions and cases",
      "A more professional experience for clients and staff",
    ],
  },
  automation: {
    title: "AI to accelerate what your team has already organized.", titleAccent: "",
    features: [
      { title: "Case-based checklists", desc: "AI turns client data and messages into clear pending items for your team to review." },
      { title: "Interview preparation", desc: "Generate questions and attention points based on the case profile before the consular interview." },
      { title: "Suggested next steps", desc: "Get document, reminder and action suggestions to keep the case moving with human review." },
    ],
    engineTitle: "AI applied to operations", engineSub: "Operational assistance active", engineLive: "AI active · focused on routine",
    aiPanel: {
      clientName: "Carlos Silva",
      clientVisa: "F-1 Visa",
      clientStatus: "In progress",
      tasks: [
        { done: true, title: "Case checklist generated", sub: "Documents and pending items extracted from client data" },
        { done: true, title: "Interview questions prepared", sub: "Script based on the F-1 case profile" },
        { done: false, title: "Review next steps", sub: "Waiting for team validation before sending to the client" },
      ],
      saved: "Fewer manual tasks on this case",
    },
    ctaFill: "Get started now", ctaReview: "See how it works",
  },
  howItWorks: {
    title: "From first access to case tracking, everything in one clear flow.",
    lead: "Aplikei organizes your firm's operation into simple stages: online presence, service sale, client intake and internal case tracking.",
    steps: [
      { n: "01", title: "Set up your firm", desc: "Add your brand identity, team, services and core information to build the foundation of the operation." },
      { n: "02", title: "Publish services and checkout", desc: "Create consultations and case offers with pricing, descriptions, required documents and a payment link branded to your firm." },
      { n: "03", title: "Bring clients into an organized flow", desc: "After payment, the client enters a clear journey to submit data, upload documents and track pending items." },
      { n: "04", title: "Track cases with team and AI", desc: "Your team sees owners, stages and next steps while AI supports checklists, interview prep and repetitive tasks." },
    ],
  },
  excellence: {
    title: "Clients should not feel lost after hiring your firm.",
    cards: [
      { title: "More clarity", desc: "Each client enters a clearer, organized flow without depending on scattered messages." },
      { title: "More professionalism", desc: "Your team knows what to follow and the experience improves from start to finish." },
    ],
    mediaLabel: "[ office / team using Aplikei ]",
  },
  testimonials: {
    title: "From improvised operation to digital process",
    items: [
      { quote: ["Before, the team lived on WhatsApp and spreadsheets. ", "Now everything is centralized", " in an operation we can actually control."], name: "Ricardo Mendes", role: "Partner · Mendes Lex", initials: "RM" },
      { quote: ["AI reduced a lot of repetitive work. ", "We gained organization and speed", " without losing legal control."], name: "Juliana Costa", role: "Operations · GlobalVisa", initials: "JC" },
    ],
  },
  pricing: {
    title: "Plans available for activation",
    lead: "Choose one of the plans currently available on the platform. After purchase, the admin_lawyer can activate the subscription and unlock premium modules.",
    plans: [
      { label: "Essential (Fixed)", price: "$497", period: "per month", description: "For teams that need predictable monthly costs and a fixed fee.", features: ["Fixed monthly fee", "Ideal for stable operations", "Ready to activate after purchase"], cta: "Choose plan", highlighted: false },
      { label: "Growth (Variable)", price: "5%", period: "of billed revenue", description: "Pay as the operation grows, with a monthly minimum and a pricing cap.", features: ["$197 monthly minimum", "$2,997 monthly cap", "Great for lower-risk entry"], cta: "Pick this plan", highlighted: true },
      { label: "Pro Office (Hybrid)", price: "$297 + 2%", period: "per month", description: "The best value for scaling firms with recurring revenue.", features: ["Reduced fixed fee", "Lower percentage fee", "More room to scale"], cta: "Activate plan", highlighted: false },
    ],
  },
  faq: {
    title: "Common questions",
    lead: "Quick answers about getting started, using the platform and managing your operation.",
    items: [
      { q: "How do I get started with Aplikei?", a: "Create your account, set up your firm and activate the solutions you want to sell. Then you can start using checkout, processes and team workflows." },
      { q: "What services can I sell on the platform?", a: "You can sell visas, consultations, RFE, COS and other immigration services with their own price, description, documents and workflow." },
      { q: "Can I migrate existing clients and cases?", a: "Yes. The platform is designed to centralize your operation and continue existing cases without losing history." },
      { q: "Does Aplikei replace the lawyer?", a: "No. It organizes the operation and reduces manual work, but the legal analysis and final decisions stay with your team." },
    ],
  },
  cta: { title: "Ready to turn your immigration firm into a digital operation?", desc: "Sell your services with personalized checkout, track each client in an organized flow and gain more control over processes, team, payments, payouts and operational tasks with AI support.", btn: "Get started now" },
  footer: {
    tagline: "Solutions, checkout, processes, team, finance and artificial intelligence integrated in one platform.",
    platform: "Platform", company: "Company", contact: "Contact",
    links: { solve: "Problem", automation: "Solution", how: "How it works", pricing: "Plans", about: "Who we are", security: "Data security", support: "Talk to a specialist" },
    legal: "© 2026 Aplikei Technologies. Aplikei is a technology platform, not a law firm.",
    terms: "Terms", privacy: "Privacy",
  },
  mobileUI: {
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
};

export default landing;
