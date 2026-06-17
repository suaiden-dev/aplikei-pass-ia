import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowRight, Check, ChevronRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useLocale } from "@app/app/i18n";
import { cn } from "@shared/utils/cn";
import { PublicButton } from "@shared/components/atoms/PublicButton";
import wernerLogo from "@assets/logos/Logotipo-Werner-Advocacia.png";
import logoHorizontal from "@assets/logos/logo-horizontal-CyOfyqfY.png";
import marquesLogo from "@assets/logos/MARQUES-ADVOGADOS-.png";
import logotipoLogo from "@assets/logos/cropped-LOGOTIPO-Logotipo.webp";
import msgLogo from "@assets/logos/cropped-logo-MSG-azul.png";
import genericLogo from "@assets/logos/4085d7be-8277-487c-af1e-7190ed407c7f-e1729658650101.png";
import mattosLogo from "@assets/logos/Logo-03-1024x818.png";
import {
  defaultSolutionSlug,
  getSolutionBySlug,
  getSolutionsByGroup,
  solutionMenuGroups,
} from "@shared/data/solutions";

const pageCopy = {
  pt: {
    tag: "Soluções",
    title: "Uma solução por página, com foco total no que importa.",
    lead:
      "Cada página aprofunda uma solução específica, com imagem dedicada, benefícios claros e navegação lateral para as outras ofertas.",
    menuTitle: "Menu de soluções",
    menuLead: "Escolha uma solução para abrir a página correspondente.",
    cta: "Falar com especialista",
    back: "Ver todas as soluções",
  },
  en: {
    tag: "Solutions",
    title: "One solution per page, with full focus on what matters.",
    lead:
      "Each page goes deeper into a specific solution, with a dedicated image, clear benefits and a right-side menu for the other offers.",
    menuTitle: "Solutions menu",
    menuLead: "Choose a solution to open its dedicated page.",
    cta: "Talk to an expert",
    back: "View all solutions",
  },
  es: {
    tag: "Soluciones",
    title: "Una solución por página, con foco total en lo importante.",
    lead:
      "Cada página profundiza en una solución específica, con una imagen dedicada, beneficios claros y un menú lateral para las demás ofertas.",
    menuTitle: "Menú de soluciones",
    menuLead: "Elija una solución para abrir su página dedicada.",
    cta: "Hablar con especialista",
    back: "Ver todas las soluciones",
  },
} as const;

const FIRM_LOGOS = [
  { name: "Werner Advocacia", src: wernerLogo },
  { name: "Logo Horizontal", src: logoHorizontal },
  { name: "Marques Advogados", src: marquesLogo },
  { name: "Logotipo", src: logotipoLogo },
  { name: "MSG Advocacia", src: msgLogo },
  { name: "Advocacia", src: genericLogo },
  { name: "Mattos Advogados", src: mattosLogo },
] as const;

type PreviewKind = "pipeline" | "finance" | "chat" | "catalog" | "team" | "discount" | "coupon" | "sales" | "history";

type PreviewMeta = {
  kind: PreviewKind;
  eyebrow: string;
  title: string;
  description: string;
};

function getPreviewKind(slug: string, index: number): PreviewKind {
  switch (slug) {
    case "analise-das-financas":
      return ["finance", "finance", "history"][index] ?? "finance";
    case "chat-para-servicos-personalizados":
      return ["chat", "catalog", "history"][index] ?? "chat";
    case "criar-cupons-customizados":
      return ["coupon", "discount", "history"][index] ?? "coupon";
    case "gerenciar-processos":
    case "gerir-fluxo-de-casos":
    case "fluxo-b1b2":
    case "fluxo-f1":
    case "fluxo-extensao-status":
    case "fluxo-troca-status":
      return ["pipeline", "history", "pipeline"][index] ?? "pipeline";
    case "gerenciar-regras-de-desconto":
      return ["discount", "discount", "history"][index] ?? "discount";
    case "gerenciar-servicos":
      return ["catalog", "catalog", "history"][index] ?? "catalog";
    case "gerenciar-time":
      return ["team", "team", "history"][index] ?? "team";
    case "plataforma-para-vendedores":
      return ["sales", "catalog", "history"][index] ?? "sales";
    default:
      return ["pipeline", "history", "catalog"][index] ?? "pipeline";
  }
}

function getPreviewMeta(slug: string, index: number, feature: string, lang: "pt" | "en" | "es"): PreviewMeta {
  const kind = getPreviewKind(slug, index);
  const titles: Record<PreviewKind, Record<"pt" | "en" | "es", string>> = {
    pipeline: {
      pt: "Fluxo operacional",
      en: "Operational flow",
      es: "Flujo operacional",
    },
    finance: {
      pt: "Resumo financeiro",
      en: "Financial snapshot",
      es: "Resumen financiero",
    },
    chat: {
      pt: "Atendimento contextual",
      en: "Contextual chat",
      es: "Chat contextual",
    },
    catalog: {
      pt: "Catálogo organizado",
      en: "Organized catalog",
      es: "Catálogo organizado",
    },
    team: {
      pt: "Visão de equipe",
      en: "Team view",
      es: "Vista de equipo",
    },
    discount: {
      pt: "Regras e aprovação",
      en: "Rules and approvals",
      es: "Reglas y aprobaciones",
    },
    coupon: {
      pt: "Cupom e campanha",
      en: "Coupon and campaign",
      es: "Cupón y campaña",
    },
    sales: {
      pt: "Funil comercial",
      en: "Sales funnel",
      es: "Embudo comercial",
    },
    history: {
      pt: "Linha do tempo",
      en: "Timeline",
      es: "Cronología",
    },
  };

  const subtitles: Record<PreviewKind, Record<"pt" | "en" | "es", string>> = {
    pipeline: {
      pt: "Etapas, responsáveis e pendências em um só fluxo.",
      en: "Stages, owners and pending items in one flow.",
      es: "Etapas, responsables y pendientes en un solo flujo.",
    },
    finance: {
      pt: "Receita, margem e transações em destaque.",
      en: "Revenue, margin and transactions highlighted.",
      es: "Ingresos, margen y transacciones destacados.",
    },
    chat: {
      pt: "Conversa com contexto e histórico unificado.",
      en: "Conversation with context and unified history.",
      es: "Conversación con contexto e historial unificado.",
    },
    catalog: {
      pt: "Itens, escopo e disponibilidade centralizados.",
      en: "Items, scope and availability centralized.",
      es: "Items, alcance y disponibilidad centralizados.",
    },
    team: {
      pt: "Capacidade do time e fila de tarefas visíveis.",
      en: "Team capacity and task queue visible.",
      es: "Capacidad del equipo y cola de tareas visible.",
    },
    discount: {
      pt: "Limites, exceções e aprovações claras.",
      en: "Clear limits, exceptions and approvals.",
      es: "Límites, excepciones y aprobaciones claras.",
    },
    coupon: {
      pt: "Cupons, validade e uso com controle.",
      en: "Coupons, validity and usage under control.",
      es: "Cupones, vigencia y uso bajo control.",
    },
    sales: {
      pt: "Ofertas, pipeline e conversão à vista.",
      en: "Offers, pipeline and conversion in sight.",
      es: "Ofertas, pipeline y conversión a la vista.",
    },
    history: {
      pt: "Histórico consolidado para consulta rápida.",
      en: "Consolidated history for quick review.",
      es: "Historial consolidado para consulta rápida.",
    },
  };

  return {
    kind,
    eyebrow: titles[kind][lang],
    title: feature,
    description: subtitles[kind][lang],
  };
}

function FeaturePreview({
  meta,
  lang,
}: {
  meta: PreviewMeta;
  lang: "pt" | "en" | "es";
}) {
  const scenedata = {
    finance: {
      stats: [
        { label: "Revenue", value: "US$ 86k", tone: "primary" },
        { label: "Margin", value: "38%", tone: "success" },
        { label: "Transactions", value: "124", tone: "warning" },
      ],
      lines: [
        { label: "January", value: 72 },
        { label: "February", value: 54 },
        { label: "March", value: 84 },
        { label: "April", value: 63 },
        { label: "May", value: 90 },
      ],
      table: [
        { a: "Fee collected", b: "US$ 1,200", c: "Approved" },
        { a: "Product sold", b: "US$ 350", c: "Pending" },
        { a: "Refund rule", b: "US$ 0", c: "Locked" },
      ],
    },
    chat: {
      messages: [
        { side: "client", text: "I need to finish my service without losing the context." },
        { side: "agent", text: "Your steps, files and next action are already grouped." },
        { side: "client", text: "Can I see what is missing?" },
      ],
    },
    catalog: {
      rows: [
        { title: "Service A", subtitle: "Main offer", status: "Active" },
        { title: "Service B", subtitle: "Add-on", status: "Draft" },
        { title: "Service C", subtitle: "Legacy", status: "Archived" },
      ],
    },
    team: {
      members: [
        { name: "Ana", role: "Intake", pct: 82 },
        { name: "Bruno", role: "Review", pct: 64 },
        { name: "Clara", role: "Ops", pct: 48 },
      ],
    },
    discount: {
      rules: [
        { label: "Limit per offer", value: "20%" },
        { label: "Approval", value: "Manager" },
        { label: "Exceptions", value: "Logged" },
      ],
    },
    coupon: {
      code: "SAVE20",
      detail: "20% off · 30 days · 1 use",
    },
    sales: {
      kpis: [
        { label: "Leads", value: "48" },
        { label: "Deals", value: "12" },
        { label: "Close", value: "31%" },
      ],
      steps: ["Offer list", "Pipeline", "Sales flow"],
    },
    pipeline: {
      cases: [
        { id: "CASE-901", customer: "Ana Silva", visaType: "B1/B2", currentStep: "Validação documental", status: "Em andamento", progress: 42 },
        { id: "CASE-902", customer: "Carlos Costa", visaType: "F-1", currentStep: "Recebimento do I-20", status: "Pendente", progress: 28 },
        { id: "CASE-903", customer: "Mariana Lima", visaType: "Troca Status", currentStep: "Validação de status", status: "Em andamento", progress: 64 },
      ],
    },
    history: {
      rows: [
        { label: "Created", value: "Today" },
        { label: "Updated", value: "2h ago" },
        { label: "Review", value: "Pending" },
      ],
    },
  } as const;

  const shellTitle = {
    pt: "Painel da solução",
    en: "Solution dashboard",
    es: "Panel de la solución",
  }[lang];

  return (
    <div className="overflow-hidden rounded-[30px] border border-border/70 bg-card shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between border-b border-border/60 bg-bg-subtle px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-400/80" />
            <span className="h-3 w-3 rounded-full bg-amber-400/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted">{shellTitle}</span>
        </div>
        <div className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
          {meta.eyebrow}
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="border-b border-border/60 bg-bg-subtle/70 p-4 lg:border-b-0 lg:border-r">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Workspace</p>
              <p className="mt-1 text-sm font-bold text-text">Aplikei</p>
            </div>
            <nav className="grid gap-2">
              {["Dashboard", "Cases", "Finance", "Team", "Settings"].map((item, index) => (
                <div
                  key={item}
                  className={cn(
                    "rounded-2xl px-3 py-2 text-sm font-semibold",
                    index === 1 ? "bg-primary/10 text-primary" : "text-text-muted",
                  )}
                >
                  {item}
                </div>
              ))}
            </nav>
          </div>
        </aside>

        <div className="p-4 sm:p-5 lg:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{meta.description}</p>
              <h4 className="mt-1 font-display text-2xl font-bold tracking-tight text-text">{meta.title}</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-bg-subtle px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">Live</span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary">Preview</span>
            </div>
          </div>

          <div className="mt-5 rounded-[28px] border border-border/60 bg-bg-subtle p-4 sm:p-5">
            {meta.kind === "finance" && (
              <div className="grid gap-4">
                <div className="grid grid-cols-3 gap-3">
                  {scenedata.finance.stats.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-border/60 bg-card p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">{item.label}</p>
                      <p className="mt-2 text-2xl font-black text-text">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-text">Revenue trend</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">6 months</p>
                  </div>
                  <div className="mt-4 flex h-44 items-end gap-3">
                    {scenedata.finance.lines.map((item) => (
                      <div key={item.label} className="flex-1">
                        <div className="flex h-36 items-end rounded-2xl bg-bg-subtle p-2">
                          <div className="w-full rounded-xl bg-primary/80" style={{ height: `${item.value}%` }} />
                        </div>
                        <p className="mt-2 text-center text-[10px] font-black uppercase tracking-[0.16em] text-text-muted">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
                  {scenedata.finance.table.map((row) => (
                    <div key={row.a} className="grid grid-cols-[1.3fr_0.8fr_0.7fr] gap-3 border-t border-border/60 px-4 py-3 first:border-t-0">
                      <div>
                        <p className="text-sm font-bold text-text">{row.a}</p>
                        <p className="text-[11px] text-text-muted">{meta.description}</p>
                      </div>
                      <p className="text-sm font-black text-text">{row.b}</p>
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">{row.c}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {meta.kind === "chat" && (
              <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                <div className="space-y-3">
                  {scenedata.chat.messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        "max-w-[85%] rounded-[24px] p-4",
                        message.side === "client" ? "bg-card border border-border/60" : "ml-auto bg-primary/10 border border-primary/20",
                      )}
                    >
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                        {message.side === "client" ? "Client" : "Agent"}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-text">{message.text}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-[24px] border border-border/60 bg-card p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">Context</p>
                  <div className="mt-3 space-y-2">
                    {["Service details", "Required docs", "Next steps"].map((item) => (
                      <div key={item} className="rounded-2xl border border-border/60 bg-bg-subtle px-3 py-2 text-sm font-semibold text-text-muted">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {meta.kind === "catalog" && (
              <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
                {scenedata.catalog.rows.map((row) => (
                  <div key={row.title} className="grid grid-cols-[1.2fr_1fr_auto] items-center gap-3 border-t border-border/60 px-4 py-3 first:border-t-0">
                    <div>
                      <p className="text-sm font-bold text-text">{row.title}</p>
                      <p className="text-[11px] text-text-muted">{row.subtitle}</p>
                    </div>
                    <div className="h-2 rounded-full bg-bg-subtle">
                      <div className="h-full w-[72%] rounded-full bg-primary" />
                    </div>
                    <span className="rounded-full bg-bg-subtle px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                      {row.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {meta.kind === "team" && (
              <div className="grid gap-3">
                {scenedata.team.members.map((member) => (
                  <div key={member.name} className="rounded-[22px] border border-border/60 bg-card p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-text">{member.name}</p>
                        <p className="text-[11px] text-text-muted">{member.role}</p>
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">{member.pct}%</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg-subtle">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${member.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {meta.kind === "discount" && (
              <div className="grid gap-3 lg:grid-cols-[1fr_240px]">
                <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
                  {scenedata.discount.rules.map((rule) => (
                    <div key={rule.label} className="flex items-center justify-between border-t border-border/60 px-4 py-3 first:border-t-0">
                      <span className="text-sm font-bold text-text">{rule.label}</span>
                      <span className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">{rule.value}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Approval flow</p>
                  <div className="mt-3 space-y-3">
                    {["Seller", "Manager", "Audit"].map((item, index) => (
                      <div key={item} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-card text-[10px] font-black text-text">{index + 1}</div>
                        <p className="text-sm font-semibold text-text-muted">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {meta.kind === "coupon" && (
              <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
                <div className="rounded-[24px] border border-primary/20 bg-primary/10 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Coupon</p>
                  <p className="mt-2 font-display text-3xl font-black tracking-tight text-text">SAVE20</p>
                  <p className="mt-1 text-sm text-text-muted">{scenedata.coupon.detail}</p>
                  <div className="mt-4 rounded-2xl border border-border/60 bg-card p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">Usage</p>
                    <div className="mt-2 flex items-end gap-2">
                      {[64, 42, 78, 58, 90].map((bar, index) => (
                        <div key={index} className="flex-1 rounded-t-xl bg-primary/20" style={{ height: `${bar}%` }}>
                          <div className="h-full rounded-t-xl bg-primary/80" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {["Campaign", "Validity", "Limit", "Approved by"].map((item, index) => (
                    <div key={item} className="flex items-center justify-between rounded-2xl border border-border/60 bg-card px-4 py-3">
                      <span className="text-sm font-bold text-text">{item}</span>
                      <span className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">{index === 0 ? "Launch" : index === 1 ? "30 days" : index === 2 ? "1 use" : "Manager"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {meta.kind === "sales" && (
              <div className="grid gap-4">
                <div className="grid grid-cols-3 gap-3">
                  {scenedata.sales.kpis.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-border/60 bg-card p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">{item.label}</p>
                      <p className="mt-2 text-2xl font-black text-text">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="grid gap-3 lg:grid-cols-3">
                  {scenedata.sales.steps.map((item, index) => (
                    <div key={item} className="rounded-2xl border border-border/60 bg-card p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">0{index + 1}</p>
                      <p className="mt-2 text-sm font-bold text-text">{item}</p>
                      <div className="mt-3 h-2 rounded-full bg-bg-subtle">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${70 - index * 15}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <p className="text-sm font-bold text-text">Sales pipeline</p>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {["Leads", "Opportunities", "Closed"].map((col, index) => (
                      <div key={col} className="rounded-2xl border border-border/60 bg-bg-subtle p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">{col}</p>
                        <div className="mt-3 space-y-2">
                          {["One", "Two"].slice(0, 2 - (index === 2 ? 1 : 0)).map((_, i) => (
                            <div key={i} className="rounded-xl border border-border/60 bg-card px-3 py-2 text-xs text-text-muted">
                              Deal {i + 1}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {meta.kind === "pipeline" && (
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
                  <div className="border-b border-border/60 px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">Seus Casos Ativos</p>
                  </div>
                  <div className="divide-y divide-border/60">
                    {scenedata.pipeline.cases.map((item) => (
                      <div key={item.id} className="grid gap-3 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-bold text-text">{item.customer}</p>
                            <span className="rounded-full bg-bg-subtle px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                              {item.visaType}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-muted">{item.currentStep}</p>
                          <div className="mt-3 h-2 rounded-full bg-bg-subtle">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${item.progress}%` }} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">{item.status}</span>
                          <span className="text-2xl font-black text-text">{item.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">Progresso geral</p>
                  <div className="mt-4 space-y-3">
                    {[
                      { label: "Checklist de documentos", value: 78 },
                      { label: "Revisão interna", value: 56 },
                      { label: "Próximos passos", value: 34 },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border border-border/60 bg-bg-subtle p-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-bold text-text">{item.label}</span>
                          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">{item.value}%</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-card">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${item.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/10 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Next step</p>
                    <p className="mt-2 text-sm font-bold text-text">
                      {lang === "en"
                        ? "Open the current step and continue the guided flow."
                        : "Abra a etapa atual e continue o fluxo guiado."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {meta.kind === "history" && (
              <div className="grid gap-3 lg:grid-cols-[1fr_280px]">
                <div className="space-y-3">
                  {scenedata.history.rows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between rounded-2xl border border-border/60 bg-card px-4 py-3">
                      <span className="text-sm font-bold text-text">{row.label}</span>
                      <span className="text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">{row.value}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">Timeline</p>
                  <div className="mt-4 space-y-4">
                    {["Created", "Reviewed", "Ready"].map((item, index) => (
                      <div key={item} className="flex items-start gap-3">
                        <div className={cn("mt-1 h-3 w-3 rounded-full", index === 2 ? "bg-emerald-500" : "bg-primary")} />
                        <div>
                          <p className="text-sm font-bold text-text">{item}</p>
                          <p className="text-[11px] text-text-muted">
                            {index === 0 ? "Today" : index === 1 ? "2 hours ago" : "In progress"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SolucoesPage() {
  const { slug } = useParams<{ slug?: string }>();
  const { lang } = useLocale();
  const copy = pageCopy[lang as keyof typeof pageCopy] ?? pageCopy.pt;

  if (!slug) {
    return <Navigate to={`/solucoes/${defaultSolutionSlug}`} replace />;
  }

  const current = getSolutionBySlug(slug);

  if (current.slug !== slug) {
    return <Navigate to={`/solucoes/${defaultSolutionSlug}`} replace />;
  }

  const featureList = current.features[lang] ?? current.features.pt;

  return (
    <div className="public-page text-text">
      <section className="public-section relative overflow-hidden border-b border-border/70 bg-bg">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(45,99,255,0.16),transparent_28%),radial-gradient(circle_at_84%_14%,rgba(99,102,241,0.12),transparent_26%),radial-gradient(circle_at_50%_100%,rgba(34,197,94,0.08),transparent_26%)]" />
        <div className="relative mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-12">
          <div className="grid items-center gap-16 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="max-w-3xl"
            >
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-card/90 px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary shadow-sm">
                {copy.tag}
              </span>
              <h1 className="mt-6 max-w-[13ch] font-display text-5xl font-black leading-[0.95] tracking-[-0.05em] text-text sm:text-6xl lg:text-[5.75rem]">
                {current.title[lang]}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-muted sm:text-xl">
                {copy.lead}
              </p>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-text-muted">
                {current.detail[lang] ?? current.detail.pt}
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <PublicButton asChild tone="solid">
                  <Link to="/contato">
                    {copy.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </PublicButton>
                <PublicButton asChild tone="outline">
                  <Link to={`/solucoes/${defaultSolutionSlug}`}>
                    {copy.back}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </PublicButton>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-[32px] border border-border/70 bg-card shadow-[0_30px_100px_rgba(15,23,42,0.12)]">
                <div className="border-b border-border/60 bg-bg-subtle px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-primary">
                      {copy.tag}
                    </span>
                    <span className="text-xs font-semibold text-text-muted">
                      {current.slug}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_25%,rgba(45,99,255,0.18),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0))]" />
                  <img
                    src={current.image}
                    alt={current.imageAlt[lang] ?? current.imageAlt.pt}
                    className="relative aspect-[16/10] w-full object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-10 pt-10">
            <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-6 px-6 sm:px-8 lg:px-12">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-text-muted/80">
                {lang === "en" ? "Trusted by the best" : lang === "es" ? "Confiado por los mejores" : "Confiado pelos melhores"}
              </p>
              <div className="grid w-full grid-cols-2 items-center justify-items-center gap-x-14 gap-y-10 sm:grid-cols-3 xl:grid-cols-7">
                {FIRM_LOGOS.map((firm) => (
                  <div key={firm.name} className="flex min-h-12 items-center justify-center">
                    <img
                      src={firm.src}
                      alt={firm.name}
                      className="h-14 w-auto max-w-[190px] object-contain object-center opacity-100 transition-transform duration-200 hover:scale-[1.03]"
                      style={{
                        filter: "drop-shadow(0 1px 1px rgba(15, 23, 42, 0.06))",
                      }}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              {copy.tag}
            </span>
            <h2 className="mt-6 font-display text-4xl font-black tracking-tight text-text sm:text-5xl">
              {lang === "en"
                ? "More detail, organized in one page"
                : lang === "es"
                  ? "Mais detalhes, organizados em uma página"
                  : "Mais detalhes, organizados em uma página"}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-text-muted">
              {lang === "en"
                ? "The second section now carries the explanatory depth, while the hero stays clean and focused."
                : lang === "es"
                  ? "A segunda seção carrega a profundidade explicativa, enquanto o hero permanece limpo e focado."
                  : "A segunda seção carrega a profundidade explicativa, enquanto o hero permanece limpo e focado."}
            </p>
          </div>

          <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            <div className="grid gap-8">
              <article className="rounded-[28px] border border-border bg-card p-8 shadow-sm sm:p-10">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-primary">
                    {current.slug}
                  </span>
                  <span className="text-sm font-semibold text-text-muted">
                    {current.summary[lang] ?? current.summary.pt}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-3xl font-bold tracking-tight lg:text-4xl">
                  {current.title[lang]}
                </h3>
                <p className="mt-5 max-w-4xl text-lg leading-relaxed text-text-muted">
                  {current.detail[lang] ?? current.detail.pt}
                </p>
              </article>

              <div className="grid gap-10">
                {featureList.slice(0, 3).map((feature, index) => (
                  <FeaturePreview
                    key={feature}
                    lang={lang as "pt" | "en" | "es"}
                    meta={getPreviewMeta(current.slug, index, feature, lang as "pt" | "en" | "es")}
                  />
                ))}
              </div>

              <article className="rounded-[28px] border border-border bg-card p-8 shadow-sm sm:p-10">
                <h3 className="font-display text-2xl font-bold tracking-tight">
                  {lang === "en" ? "What this solution delivers" : lang === "es" ? "O que esta solução entrega" : "O que esta solução entrega"}
                </h3>
                <ul className="mt-7 grid gap-4">
                  {featureList.map((feature) => (
                    <li key={feature} className="grid grid-cols-[auto_1fr] gap-4 rounded-[18px] border border-border bg-card p-5 text-sm leading-relaxed">
                      <Check className="mt-0.5 h-5 w-5 text-success" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>

            <aside className="lg:sticky lg:top-28">
              <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-text-muted">
                  {copy.menuTitle}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">{copy.menuLead}</p>
                <nav className="mt-6 grid gap-3" aria-label={copy.menuTitle}>
                  {solutionMenuGroups.map((group) => (
                    <div key={group.key} className="space-y-2">
                      <p className="px-2 text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                        {group.label[lang] ?? group.label.pt}
                      </p>
                      <div className="grid gap-2">
                        {getSolutionsByGroup(group.key).map((solution) => {
                          const isActive = solution.slug === current.slug;
                          return (
                            <Link
                              key={solution.slug}
                              to={`/solucoes/${solution.slug}`}
                              aria-current={isActive ? "page" : undefined}
                              className={cn(
                                "group flex items-start gap-4 rounded-2xl border px-5 py-4 text-left transition-all",
                                isActive
                                  ? "border-primary/20 bg-primary/10 shadow-sm"
                                  : "border-transparent hover:border-border hover:bg-bg-subtle",
                              )}
                            >
                              <span className="min-w-0">
                                <span
                                  className={cn(
                                    "block text-sm font-bold tracking-tight transition-colors",
                                    isActive ? "text-text" : "text-text-muted group-hover:text-text",
                                  )}
                                >
                                  {solution.title[lang]}
                                </span>
                                <span className="mt-1 block text-xs leading-relaxed text-text-muted">
                                  {solution.summary[lang]}
                                </span>
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
