import { Percent, Plus, Sparkles, TicketPercent, TrendingUp } from "lucide-react";
import { Button } from "../../components/Button";
import {
  DashboardPageHeader,
  DashboardSection,
  DashboardToolbar,
  InlineMetric,
  KpiCard,
  StatusBadge,
  ToolbarPill,
} from "../../components/master/DashboardUI";
import { couponRecords } from "../../mocks/master-dashboard";
import { formatDate } from "../../utils/format";

export default function CouponsPage() {
  const activeCount = couponRecords.filter((coupon) => coupon.status === "active").length;
  const redeemedCount = couponRecords.reduce((sum, coupon) => sum + coupon.redemptions, 0);
  const utilizationRate = couponRecords.reduce((sum, coupon) => sum + coupon.redemptions / coupon.limit, 0) / couponRecords.length;

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Campanhas"
        title="Coupons"
        description="Área promocional com cards hero, campanhas ativas e leitura rápida de aproveitamento."
        actions={(
          <Button className="h-11 rounded-2xl px-4 font-semibold">
            <Plus className="h-4 w-4" />
            Criar campanha
          </Button>
        )}
      />

      <DashboardToolbar>
        <div className="flex flex-wrap items-center gap-2">
          <ToolbarPill label="Ativos" active />
          <ToolbarPill label="F-1" />
          <ToolbarPill label="A vencer" />
          <ToolbarPill label="Baixo uso" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <InlineMetric label="AOV uplift" value="+12%" helper="Quando há cupom ativo" />
          <InlineMetric label="Expiração" value="2 campanhas" helper="Nos próximos 7 dias" />
          <InlineMetric label="ROI mockado" value="3,4x" helper="Campanhas institucionais" />
        </div>
      </DashboardToolbar>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Cupons ativos" value={String(activeCount)} delta="Campanhas em venda" icon={TicketPercent} />
        <KpiCard label="Resgates" value={String(redeemedCount)} delta="Uso acumulado" icon={TrendingUp} />
        <KpiCard label="Utilizacao media" value={`${(utilizationRate * 100).toFixed(0)}%`} delta="Limite acompanhado" icon={Percent} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_1.2fr]">
        <DashboardSection title="Hero campaigns" description="Cards de campanha mais visuais, lembrando o estilo do produto referência.">
          <div className="space-y-4">
            {couponRecords.slice(0, 2).map((coupon) => (
              <div key={coupon.id} className="overflow-hidden rounded-[1.5rem] border border-border bg-highlight p-5 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <StatusBadge
                    label={coupon.status}
                    tone={coupon.status === "active" ? "green" : coupon.status === "scheduled" ? "purple" : "slate"}
                  />
                </div>
                <p className="mt-5 font-display text-3xl font-black tracking-[-0.03em]">{coupon.code}</p>
                <p className="mt-2 text-sm text-slate-300">{coupon.description}</p>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-white/5 p-3">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Desconto</p>
                    <p className="mt-1 font-bold">{coupon.discount}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Uso</p>
                    <p className="mt-1 font-bold">{coupon.redemptions}/{coupon.limit}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Expira</p>
                    <p className="mt-1 font-bold">{formatDate(coupon.expiresAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DashboardSection>

        <DashboardSection title="Campaign board" description="Leitura consolidada de campaigns e performance.">
          <div className="space-y-3">
            {couponRecords.map((coupon) => (
              <div key={coupon.id} className="rounded-[1.5rem] border border-border bg-bg-subtle p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-display text-2xl font-black tracking-[-0.03em] text-text">{coupon.code}</p>
                      <StatusBadge
                        label={coupon.status}
                        tone={coupon.status === "active" ? "green" : coupon.status === "scheduled" ? "purple" : "slate"}
                      />
                    </div>
                    <p className="mt-2 text-sm font-medium text-text">{coupon.description}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <InlineMetric label="Desconto" value={coupon.discount} />
                    <InlineMetric label="Uso" value={`${coupon.redemptions}/${coupon.limit}`} />
                    <InlineMetric label="Expira" value={formatDate(coupon.expiresAt)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DashboardSection>
      </div>
    </div>
  );
}
