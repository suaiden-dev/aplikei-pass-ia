import type { CaseOnboardingRecord, CaseRecord } from "../models/case.model";

export interface MasterOverviewMetric {
  label: string;
  value: number;
  delta: string;
}

export interface PaymentRecord {
  id: string;
  customer: string;
  product: string;
  method: string;
  amount: number;
  status: "paid" | "pending" | "refunded" | "failed";
  date: string;
}

export interface ProductRecord {
  id: string;
  name: string;
  category: string;
  price: number;
  sales: number;
  status: "active" | "draft" | "low-stock";
  stock: number;
}

export interface ChatRecord {
  id: string;
  customer: string;
  channel: "WhatsApp" | "Instagram" | "Site";
  lastMessage: string;
  waitingMinutes: number;
  unreadCount: number;
  priority: "high" | "medium" | "low";
  assignedTo: string;
  status: "open" | "waiting" | "resolved";
}

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  stage: string;
  country: string;
  lifetimeValue: number;
  status: "active" | "new" | "risk";
  owner: string;
}

export interface CouponRecord {
  id: string;
  code: string;
  description: string;
  discount: string;
  redemptions: number;
  limit: number;
  expiresAt: string;
  status: "active" | "scheduled" | "expired";
}

export const masterOverviewMetrics: MasterOverviewMetric[] = [
  { label: "Receita do mês", value: 184500, delta: "+18,2%" },
  { label: "Clientes ativos", value: 248, delta: "+12 novos" },
  { label: "Conversão comercial", value: 0.347, delta: "+4,1 p.p." },
  { label: "Cases em operação", value: 63, delta: "9 críticos" },
];

export const paymentRecords: PaymentRecord[] = [
  { id: "PAY-1048", customer: "Ana Silva", product: "Visto B1/B2 Premium", method: "PIX", amount: 4200, status: "paid", date: "2026-04-27T15:20:00.000Z" },
  { id: "PAY-1047", customer: "Carlos Costa", product: "Consultoria F-1", method: "Cartão", amount: 3200, status: "pending", date: "2026-04-27T13:10:00.000Z" },
  { id: "PAY-1046", customer: "Mariana Lima", product: "Troca de Status", method: "Boleto", amount: 5100, status: "paid", date: "2026-04-26T17:40:00.000Z" },
  { id: "PAY-1045", customer: "John Miller", product: "Extensão de Status", method: "PIX", amount: 2800, status: "refunded", date: "2026-04-26T11:20:00.000Z" },
  { id: "PAY-1044", customer: "Julia Rocha", product: "Visto B1/B2", method: "Cartão", amount: 3900, status: "failed", date: "2026-04-25T14:55:00.000Z" },
  { id: "PAY-1043", customer: "Pedro Santos", product: "Mentoria Consular", method: "PIX", amount: 1800, status: "paid", date: "2026-04-25T09:15:00.000Z" },
];

export const productRecords: ProductRecord[] = [
  { id: "PRD-01", name: "Visto B1/B2 Premium", category: "Turismo", price: 4200, sales: 84, status: "active", stock: 999 },
  { id: "PRD-02", name: "Consultoria F-1", category: "Estudante", price: 3200, sales: 41, status: "active", stock: 999 },
  { id: "PRD-03", name: "Troca de Status", category: "Imigração", price: 5100, sales: 28, status: "active", stock: 999 },
  { id: "PRD-04", name: "Extensão de Status", category: "Imigração", price: 2800, sales: 16, status: "low-stock", stock: 3 },
  { id: "PRD-05", name: "Mentoria Consular", category: "Preparação", price: 1800, sales: 62, status: "draft", stock: 12 },
];

export const chatRecords: ChatRecord[] = [
  { id: "CH-220", customer: "Beatriz Melo", channel: "WhatsApp", lastMessage: "Preciso revisar os documentos hoje.", waitingMinutes: 7, unreadCount: 3, priority: "high", assignedTo: "Marco", status: "open" },
  { id: "CH-219", customer: "Thomas Lee", channel: "Instagram", lastMessage: "Pode me mandar o link do produto?", waitingMinutes: 18, unreadCount: 1, priority: "medium", assignedTo: "Lia", status: "waiting" },
  { id: "CH-218", customer: "Luciana Prado", channel: "Site", lastMessage: "Obrigada, vou concluir o pagamento.", waitingMinutes: 2, unreadCount: 0, priority: "low", assignedTo: "Marco", status: "resolved" },
  { id: "CH-217", customer: "Gustavo Alves", channel: "WhatsApp", lastMessage: "Meu case está em que etapa?", waitingMinutes: 24, unreadCount: 5, priority: "high", assignedTo: "Sarah", status: "open" },
  { id: "CH-216", customer: "Fernanda Ortiz", channel: "Site", lastMessage: "Quero aplicar um cupom no checkout.", waitingMinutes: 11, unreadCount: 2, priority: "medium", assignedTo: "Lia", status: "waiting" },
];

export const customerRecords: CustomerRecord[] = [
  { id: "CUS-301", name: "Ana Silva", email: "ana.silva@aplikei.com", stage: "Documentacao", country: "Brasil", lifetimeValue: 4200, status: "active", owner: "Sarah" },
  { id: "CUS-302", name: "Carlos Costa", email: "carlos.costa@demo.com", stage: "Fechamento", country: "Brasil", lifetimeValue: 3200, status: "new", owner: "Marco" },
  { id: "CUS-303", name: "Mariana Lima", email: "mariana.lima@demo.com", stage: "Consulado", country: "Portugal", lifetimeValue: 5100, status: "active", owner: "Sarah" },
  { id: "CUS-304", name: "John Miller", email: "john.miller@demo.com", stage: "Onboarding", country: "EUA", lifetimeValue: 2800, status: "risk", owner: "Lia" },
  { id: "CUS-305", name: "Julia Rocha", email: "julia.rocha@demo.com", stage: "Pendente pagamento", country: "Brasil", lifetimeValue: 3900, status: "risk", owner: "Marco" },
];

export const couponRecords: CouponRecord[] = [
  { id: "CP-10", code: "MASTER10", description: "Cupom institucional para novas vendas", discount: "10% off", redemptions: 32, limit: 100, expiresAt: "2026-05-12T23:59:00.000Z", status: "active" },
  { id: "CP-15", code: "F1SPRING", description: "Campanha do produto F-1", discount: "R$ 350", redemptions: 14, limit: 50, expiresAt: "2026-05-05T23:59:00.000Z", status: "active" },
  { id: "CP-16", code: "VIPCASE", description: "Upgrade para cases complexos", discount: "15% off", redemptions: 0, limit: 30, expiresAt: "2026-06-01T23:59:00.000Z", status: "scheduled" },
  { id: "CP-08", code: "APRILBOOST", description: "Campanha encerrada de abril", discount: "12% off", redemptions: 50, limit: 50, expiresAt: "2026-04-20T23:59:00.000Z", status: "expired" },
];

export const caseRecords: CaseRecord[] = [
  { id: "CASE-901", customer: "Ana Silva", visaType: "B1/B2", owner: "Sarah", priority: "medium", status: "in_review", updatedAt: "2026-04-27T14:20:00.000Z" },
  { id: "CASE-902", customer: "Mariana Lima", visaType: "F-1", owner: "Bruno", priority: "high", status: "docs_pending", updatedAt: "2026-04-27T12:05:00.000Z" },
  { id: "CASE-903", customer: "John Miller", visaType: "COS", owner: "Bianca", priority: "high", status: "attention", updatedAt: "2026-04-27T10:10:00.000Z" },
  { id: "CASE-904", customer: "Fernanda Ortiz", visaType: "EOS", owner: "Bruno", priority: "low", status: "approved", updatedAt: "2026-04-26T16:40:00.000Z" },
  { id: "CASE-905", customer: "Gustavo Alves", visaType: "B1/B2", owner: "Sarah", priority: "medium", status: "in_review", updatedAt: "2026-04-26T11:15:00.000Z" },
];

export const caseOnboardingRecords: CaseOnboardingRecord[] = [
  {
    caseId: "CASE-901",
    intakeOwner: "Sarah",
    checklistCompletion: 78,
    currentStage: "Validação documental",
    notes: ["Cliente enviou DS-160 preliminar.", "Aguardando conferência do passaporte."],
    steps: [
      {
        id: "step-1",
        title: "Kickoff com cliente",
        owner: "Sarah",
        dueLabel: "Concluído",
        status: "done",
        sentData: { channel: "whatsapp", owner_assigned: "Sarah", onboarding_mode: "guided" },
        receivedData: { meeting_confirmed: true, passport_received: false, client_score: 8 },
      },
      {
        id: "step-2",
        title: "Checklist documental",
        owner: "Bianca",
        dueLabel: "Hoje",
        status: "in_progress",
        sentData: { required_documents: 6, reminder_sent: true, ds160_version: "draft-v2" },
        receivedData: { uploaded_documents: 4, passport_valid: true, missing_item: "bank_statement" },
      },
      {
        id: "step-3",
        title: "Revisão consular",
        owner: "Sarah",
        dueLabel: "Amanhã",
        status: "pending",
        sentData: { reviewer: "Sarah", precheck_enabled: true, consular_type: "b1_b2" },
        receivedData: { ready_for_review: false, blocker: "document_checklist_pending", estimated_eta_days: 1 },
      },
    ],
    timeline: [
      { id: "timeline-1", title: "Case criado", description: "Onboarding iniciado no painel administrativo.", createdAt: "2026-04-24T09:00:00.000Z" },
      { id: "timeline-2", title: "Documentos recebidos", description: "Cliente anexou passaporte e formulário inicial.", createdAt: "2026-04-26T13:10:00.000Z" },
    ],
    logs: [
      {
        id: "log-1",
        level: "info",
        action: "Criou o onboarding inicial do case",
        actorType: "admin",
        actorName: "Sarah",
        details: "Kickoff disparado pelo painel administrativo com owner inicial definido.",
        createdAt: "2026-04-24T09:01:00.000Z",
      },
      {
        id: "log-2",
        level: "warning",
        action: "Marcou pendência no checklist documental",
        actorType: "operator",
        actorName: "Bianca",
        details: "Comprovante financeiro ainda não foi anexado pelo cliente.",
        createdAt: "2026-04-27T09:12:00.000Z",
      },
      {
        id: "log-3",
        level: "success",
        action: "Confirmou a reunião de revisão documental",
        actorType: "customer",
        actorName: "Ana Silva",
        details: "Cliente respondeu no WhatsApp e confirmou disponibilidade para hoje.",
        createdAt: "2026-04-27T11:42:00.000Z",
      },
    ],
  },
  {
    caseId: "CASE-902",
    intakeOwner: "Bruno",
    checklistCompletion: 54,
    currentStage: "Pendência de documentos",
    notes: ["Falta comprovante financeiro.", "Cliente pediu rechecagem do I-20."],
    steps: [
      {
        id: "step-1",
        title: "Entrevista inicial",
        owner: "Bruno",
        dueLabel: "Concluído",
        status: "done",
        sentData: { source: "campaign_f1", owner_assigned: "Bruno", interview_slot: "2026-04-22T14:00:00Z" },
        receivedData: { interview_completed: true, school_selected: true, visa_goal: "f1" },
      },
      {
        id: "step-2",
        title: "Recebimento do I-20",
        owner: "Bruno",
        dueLabel: "Hoje",
        status: "in_progress",
        sentData: { reminder_sent: true, required_forms: 3, escalation_level: "medium" },
        receivedData: { i20_received: false, financial_proof_received: false, blocker: "awaiting_school" },
      },
      {
        id: "step-3",
        title: "Aprovação final do onboarding",
        owner: "Master desk",
        dueLabel: "Após docs",
        status: "pending",
        sentData: { final_review_enabled: true, approval_owner: "Master desk", queue: "student-visa" },
        receivedData: { onboarding_ready: false, pending_dependencies: 2, approval_status: "waiting" },
      },
    ],
    timeline: [
      { id: "timeline-1", title: "Contato inicial", description: "Cliente entrou via campanha F-1 spring.", createdAt: "2026-04-22T15:30:00.000Z" },
      { id: "timeline-2", title: "Pendência sinalizada", description: "Equipe marcou ausência de comprovante financeiro.", createdAt: "2026-04-27T12:05:00.000Z" },
    ],
    logs: [
      {
        id: "log-1",
        level: "info",
        action: "Converteu o lead para o pipeline de estudante",
        actorType: "admin",
        actorName: "Bruno",
        details: "Lead veio da campanha F-1 e foi enviado ao onboarding acadêmico.",
        createdAt: "2026-04-22T15:31:00.000Z",
      },
      {
        id: "log-2",
        level: "warning",
        action: "Sinalizou ausência do I-20 final",
        actorType: "operator",
        actorName: "Bruno",
        details: "Escola ainda não enviou o documento final exigido para seguir.",
        createdAt: "2026-04-27T08:40:00.000Z",
      },
    ],
  },
  {
    caseId: "CASE-903",
    intakeOwner: "Bianca",
    checklistCompletion: 35,
    currentStage: "Escalada crítica",
    notes: ["Cliente precisa alinhar status anterior.", "Revisão jurídica sugerida."],
    steps: [
      {
        id: "step-1",
        title: "Auditoria do histórico",
        owner: "Bianca",
        dueLabel: "Concluído",
        status: "done",
        sentData: { audit_scope: "status-history", owner_assigned: "Bianca", risk_score: 9 },
        receivedData: { violations_found: 1, prior_status_verified: true, legal_review_required: true },
      },
      {
        id: "step-2",
        title: "Validação de status",
        owner: "Legal ops",
        dueLabel: "Hoje",
        status: "in_progress",
        sentData: { legal_queue: "priority", case_type: "cos", docs_shared: true },
        receivedData: { legal_feedback_ready: false, blocker: "awaiting_previous_status_doc", urgency: "high" },
      },
      {
        id: "step-3",
        title: "Plano de correção",
        owner: "Master desk",
        dueLabel: "Próximo passo",
        status: "pending",
        sentData: { action_plan_type: "corrective", escalation_target: "master", notify_customer: false },
        receivedData: { plan_ready: false, dependency: "legal_feedback", next_window_days: 2 },
      },
    ],
    timeline: [
      { id: "timeline-1", title: "Caso escalado", description: "Sinal amarelo convertido em atenção máxima.", createdAt: "2026-04-26T18:20:00.000Z" },
      { id: "timeline-2", title: "Revisão agendada", description: "Time jurídico foi notificado para parecer.", createdAt: "2026-04-27T10:10:00.000Z" },
    ],
    logs: [
      {
        id: "log-1",
        level: "warning",
        action: "Escalou o case para fila crítica",
        actorType: "master",
        actorName: "Master Aplikei",
        details: "Divergência documental exigiu revisão prioritária com apoio jurídico.",
        createdAt: "2026-04-26T18:25:00.000Z",
      },
      {
        id: "log-2",
        level: "info",
        action: "Recebeu o payload de validação do histórico",
        actorType: "system",
        actorName: "Legal pipeline",
        details: "Integração interna enviou o pacote para validação do histórico migratório.",
        createdAt: "2026-04-27T10:12:00.000Z",
      },
    ],
  },
];

export const revenueByChannel = [
  { label: "Inbound organico", value: 68400 },
  { label: "Parcerias", value: 45200 },
  { label: "Instagram", value: 38900 },
  { label: "Remarketing", value: 32000 },
];

export const activityFeed = [
  "Master aprovou nova campanha de coupons para F-1.",
  "Time de cases sinalizou 3 processos exigindo revisao imediata.",
  "Comercial bateu 118% da meta semanal em payments.",
  "Operacao liberou novo pacote premium de products.",
];
