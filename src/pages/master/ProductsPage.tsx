import { Boxes, Download, Package2, Plus, ShoppingBag, ShoppingCart } from "lucide-react";
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
import { productRecords } from "../../mocks/master-dashboard";
import { formatCompactNumber, formatCurrency } from "../../utils/format";

export default function ProductsPage() {
  const activeProducts = productRecords.filter((item) => item.status === "active").length;
  const totalSales = productRecords.reduce((sum, item) => sum + item.sales, 0);
  const estimatedRevenue = productRecords.reduce((sum, item) => sum + item.price * item.sales, 0);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Portfólio"
        title="Products"
        description="Catálogo administrativo em formato de dashboard SaaS, com destaque de ofertas, performance e estoque lógico."
        actions={(
          <>
            <Button variant="outline" className="h-11 rounded-2xl px-4 font-semibold">
              <Download className="h-4 w-4" />
              Exportar catálogo
            </Button>
            <Button className="h-11 rounded-2xl px-4 font-semibold">
              <Plus className="h-4 w-4" />
              Novo produto
            </Button>
          </>
        )}
      />

      <DashboardToolbar>
        <div className="flex flex-wrap items-center gap-2">
          <ToolbarPill label="Ativos" active />
          <ToolbarPill label="Imigração" />
          <ToolbarPill label="Turismo" />
          <ToolbarPill label="Baixo estoque" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <InlineMetric label="Take rate" value="31%" helper="Lead para venda" />
          <InlineMetric label="Upsell premium" value="18%" helper="Oferta de upgrade" />
          <InlineMetric label="Atualização" value="Hoje" helper="Último sync mockado" />
        </div>
      </DashboardToolbar>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Produtos ativos" value={String(activeProducts)} delta="Stack principal" icon={Package2} />
        <KpiCard label="Vendas acumuladas" value={formatCompactNumber(totalSales)} delta="Demanda aquecida" icon={ShoppingCart} />
        <KpiCard label="Receita estimada" value={formatCurrency(estimatedRevenue)} delta="Base mockada" icon={Boxes} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <DashboardSection title="Featured products" description="Cartões em destaque no estilo comercial do painel master.">
          <div className="grid gap-4 md:grid-cols-2">
            {productRecords.slice(0, 4).map((product) => (
              <div key={product.id} className="rounded-[1.5rem] border border-border bg-bg-subtle p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <StatusBadge
                    label={product.status}
                    tone={product.status === "active" ? "green" : product.status === "draft" ? "slate" : "amber"}
                  />
                </div>
                <p className="mt-5 font-display text-2xl font-black tracking-[-0.03em] text-text">{product.name}</p>
                <p className="mt-1 text-sm text-text-muted">{product.category}</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <InlineMetric label="Preço" value={formatCurrency(product.price)} />
                  <InlineMetric label="Sales" value={String(product.sales)} />
                </div>
              </div>
            ))}
          </div>
        </DashboardSection>

        <DashboardSection title="Catálogo operacional" description="Lista curta para decisões rápidas do master.">
          <div className="space-y-3">
            {productRecords.map((product) => (
              <div key={product.id} className="rounded-2xl border border-border bg-bg-subtle p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-text">{product.name}</p>
                    <p className="text-sm text-text-muted">{product.category} • {product.id}</p>
                  </div>
                  <StatusBadge
                    label={product.status}
                    tone={product.status === "active" ? "green" : product.status === "draft" ? "slate" : "amber"}
                  />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <InlineMetric label="Preço" value={formatCurrency(product.price)} />
                  <InlineMetric label="Sales" value={String(product.sales)} />
                  <InlineMetric label="Stock" value={String(product.stock)} />
                </div>
              </div>
            ))}
          </div>
        </DashboardSection>
      </div>
    </div>
  );
}
