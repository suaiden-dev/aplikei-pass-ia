import { Activity, BadgeDollarSign, BriefcaseBusiness, Users } from "lucide-react";
import { DashboardPageHeader, DashboardSection, KpiCard, StatusBadge } from "../../components/master/DashboardUI";
import {
  activityFeed,
  caseRecords,
  chatRecords,
  masterOverviewMetrics,
  paymentRecords,
  revenueByChannel,
} from "../../mocks/master-dashboard";
import { formatCompactNumber, formatCurrency, formatDate, formatPercent } from "../../utils/format";

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
