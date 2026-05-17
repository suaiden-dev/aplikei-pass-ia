import { Activity, BadgeDollarSign, BriefcaseBusiness, Users } from "lucide-react";
import { DashboardPageHeader, DashboardSection, KpiCard, StatusBadge } from "@shared/components/organisms/DashboardUI";

const masterOverviewMetrics = [
  { label: "Receita do mês", value: 184500, delta: "+18,2%" },
  { label: "Clientes ativos", value: 248, delta: "+12 novos" },
  { label: "Conversão comercial", value: 0.347, delta: "+4,1 p.p." },
  { label: "Cases em operação", value: 63, delta: "9 críticos" },
];

const paymentRecords = [
  { id: "PAY-1048", customer: "Ana Silva", product: "Visto B1/B2 Premium", method: "PIX", amount: 4200, status: "paid" as const, date: "2026-04-27T15:20:00.000Z" },
  { id: "PAY-1047", customer: "Carlos Costa", product: "Consultoria F-1", method: "Cartão", amount: 3200, status: "pending" as const, date: "2026-04-27T13:10:00.000Z" },
  { id: "PAY-1046", customer: "Mariana Lima", product: "Troca de Status", method: "Boleto", amount: 5100, status: "paid" as const, date: "2026-04-26T17:40:00.000Z" },
  { id: "PAY-1045", customer: "John Miller", product: "Extensão de Status", method: "PIX", amount: 2800, status: "refunded" as const, date: "2026-04-26T11:20:00.000Z" },
  { id: "PAY-1044", customer: "Julia Rocha", product: "Visto B1/B2", method: "Cartão", amount: 3900, status: "failed" as const, date: "2026-04-25T14:55:00.000Z" },
  { id: "PAY-1043", customer: "Pedro Santos", product: "Mentoria Consular", method: "PIX", amount: 1800, status: "paid" as const, date: "2026-04-25T09:15:00.000Z" },
];

const chatRecords = [
  { id: "CH-220", customer: "Beatriz Melo", channel: "WhatsApp" as const, lastMessage: "Preciso revisar os documentos hoje.", waitingMinutes: 7, unreadCount: 3, priority: "high" as const, assignedTo: "Marco", status: "open" as const },
  { id: "CH-219", customer: "Thomas Lee", channel: "Instagram" as const, lastMessage: "Pode me mandar o link do produto?", waitingMinutes: 18, unreadCount: 1, priority: "medium" as const, assignedTo: "Lia", status: "waiting" as const },
  { id: "CH-218", customer: "Luciana Prado", channel: "Site" as const, lastMessage: "Obrigada, vou concluir o pagamento.", waitingMinutes: 2, unreadCount: 0, priority: "low" as const, assignedTo: "Marco", status: "resolved" as const },
  { id: "CH-217", customer: "Gustavo Alves", channel: "WhatsApp" as const, lastMessage: "Meu case está em que etapa?", waitingMinutes: 24, unreadCount: 5, priority: "high" as const, assignedTo: "Sarah", status: "open" as const },
  { id: "CH-216", customer: "Fernanda Ortiz", channel: "Site" as const, lastMessage: "Quero aplicar um cupom no checkout.", waitingMinutes: 11, unreadCount: 2, priority: "medium" as const, assignedTo: "Lia", status: "waiting" as const },
];

const caseRecords = [
  { id: "CASE-901", customer: "Ana Silva", visaType: "B1/B2", owner: "Sarah", priority: "medium" as const, status: "in_review", updatedAt: "2026-04-27T14:20:00.000Z" },
  { id: "CASE-902", customer: "Mariana Lima", visaType: "F-1", owner: "Bruno", priority: "high" as const, status: "docs_pending", updatedAt: "2026-04-27T12:05:00.000Z" },
  { id: "CASE-903", customer: "John Miller", visaType: "COS", owner: "Bianca", priority: "high" as const, status: "attention", updatedAt: "2026-04-27T10:10:00.000Z" },
  { id: "CASE-904", customer: "Fernanda Ortiz", visaType: "EOS", owner: "Bruno", priority: "low" as const, status: "approved", updatedAt: "2026-04-26T16:40:00.000Z" },
  { id: "CASE-905", customer: "Gustavo Alves", visaType: "B1/B2", owner: "Sarah", priority: "medium" as const, status: "in_review", updatedAt: "2026-04-26T11:15:00.000Z" },
];

const revenueByChannel = [
  { label: "Inbound organico", value: 68400 },
  { label: "Parcerias", value: 45200 },
  { label: "Instagram", value: 38900 },
  { label: "Remarketing", value: 32000 },
];

const activityFeed = [
  "Master aprovou nova campanha de coupons para F-1.",
  "Time de cases sinalizou 3 processos exigindo revisao imediata.",
  "Comercial bateu 118% da meta semanal em payments.",
  "Operacao liberou novo pacote premium de products.",
];
import { formatCompactNumber, formatCurrency, formatDate, formatPercent } from "@shared/utils/format";

export default function OverviewPage() {
  const openChats = chatRecords.filter((chat) => chat.status !== "resolved").length;
  const totalRevenue = paymentRecords
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const metricIcons = [BadgeDollarSign, Users, Activity, BriefcaseBusiness] as const;
  const metricValues = [
    formatCurrency(masterOverviewMetrics[0].value),
    formatCompactNumber(masterOverviewMetrics[1].value),
    formatPercent(masterOverviewMetrics[2].value),
    String(masterOverviewMetrics[3].value),
  ];

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Master control"
        title="Visão geral da operação"
        description="Acompanhe a saúde comercial, financeira e operacional da Aplikei em uma área centralizada para a role master."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {masterOverviewMetrics.map((metric, index) => (
          <KpiCard
            key={metric.label}
            label={metric.label}
            value={metricValues[index]}
            delta={metric.delta}
            icon={metricIcons[index]}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <DashboardSection
          title="Receita por canal"
          description={`Receita paga acumulada de ${formatCurrency(totalRevenue)} com ${openChats} conversas ainda exigindo acompanhamento.`}
        >
          <div className="space-y-4">
            {revenueByChannel.map((channel) => {
              const percent = totalRevenue > 0 ? (channel.value / totalRevenue) * 100 : 0;
              return (
                <div key={channel.label}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-text">{channel.label}</p>
                      <p className="text-xs text-text-muted">{percent.toFixed(1)}% do faturamento pago</p>
                    </div>
                    <p className="font-display text-lg font-black text-text">{formatCurrency(channel.value)}</p>
                  </div>
                  <div className="h-2 rounded-full bg-bg-subtle">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(percent, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </DashboardSection>

        <DashboardSection
          title="Feed executivo"
          description="Sinais rápidos para tomada de decisao master."
        >
          <div className="space-y-3">
            {activityFeed.map((item) => (
              <div key={item} className="rounded-2xl border border-border bg-bg-subtle p-4">
                <p className="text-sm font-medium text-text">{item}</p>
              </div>
            ))}
          </div>
        </DashboardSection>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardSection title="Últimos payments" description="Movimentações mais recentes do caixa mockado.">
          <div className="space-y-3">
            {paymentRecords.slice(0, 4).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-bg-subtle p-4">
                <div>
                  <p className="font-semibold text-text">{payment.customer}</p>
                  <p className="text-sm text-text-muted">{payment.product} • {formatDate(payment.date)}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-black text-text">{formatCurrency(payment.amount)}</p>
                  <StatusBadge
                    label={payment.status}
                    tone={
                      payment.status === "paid"
                        ? "green"
                        : payment.status === "pending"
                          ? "amber"
                          : payment.status === "refunded"
                            ? "blue"
                            : "red"
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </DashboardSection>

        <DashboardSection title="Cases críticos" description="Fila priorizada para atuação imediata.">
          <div className="space-y-3">
            {caseRecords
              .filter((item) => item.priority !== "low")
              .map((item) => (
                <div key={item.id} className="rounded-2xl border border-border bg-bg-subtle p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-text">{item.customer}</p>
                      <p className="text-sm text-text-muted">{item.visaType} • owner {item.owner}</p>
                    </div>
                    <StatusBadge
                      label={item.status.replace("_", " ")}
                      tone={item.status === "approved" ? "green" : item.status === "attention" ? "red" : "amber"}
                    />
                  </div>
                  <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-text-muted">
                    Atualizado em {formatDate(item.updatedAt)}
                  </p>
                </div>
              ))}
          </div>
        </DashboardSection>
      </div>
    </div>
  );
}
