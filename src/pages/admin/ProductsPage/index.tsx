import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  RiEditLine,
  RiCheckLine,
  RiCloseLine,
  RiMoneyDollarCircleLine,
  RiPriceTag3Line,
  RiEyeLine,
  RiEyeOffLine,
  RiInformationLine,
} from "react-icons/ri";
import { supabase } from "../../../shared/lib/supabase";
import { useT } from "../../../i18n";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../components/atoms/tooltip";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServicePrice {
  id: string;
  office_id: string;
  service_id: string;
  name: string;
  description: string | null;
  category: string;
  slug: string;
  price: number;
  currency: string;
  is_active: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  main_visa: "Vistos Principais",
  dependent: "Dependentes",
  analysis: "Análises",
  mentoring: "Mentorias",
  consultancy: "Consultoria",
  other: "Outros",
};

function categoryLabel(cat: string): string {
  return CATEGORY_LABELS[cat] ?? cat;
}

// ─── Inline edit row ──────────────────────────────────────────────────────────

function ProductRow({
  product,
  onSaved,
}: {
  product: ServicePrice;
  onSaved: () => void;
}) {
  const t = useT("admin");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(product.price.toFixed(2));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const newPrice = parseFloat(draft);
    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error(t.products.messages.invalidValue);
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("user_service_prices")
      .update({ price: newPrice })
      .eq("id", product.id)
      .select("id, price");

    if (error) {
      toast.error(
        t.products.messages.updateError.replace("{{error}}", error.message),
      );
    } else if (!data || data.length === 0) {
      toast.error(t.products.messages.noPermission);
    } else {
      toast.success(
        t.products.messages.updateSuccess.replace("{{name}}", product.name),
      );
      setEditing(false);
      onSaved();
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setDraft(product.price.toFixed(2));
    setEditing(false);
  };

  return (
    <tr className="border-b border-border last:border-0 transition-colors hover:bg-bg-subtle/40">
      {/* Nome */}
      <td className="px-6 py-4 text-left">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-text">{product.name}</p>
          {product.description && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-text-muted/60 hover:text-primary transition-colors cursor-default">
                    <RiInformationLine className="text-base" />
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="max-w-xs rounded-xl border border-border bg-card px-4 py-3 text-xs text-text-muted leading-relaxed shadow-xl"
                >
                  {product.description}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4 text-left">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${
            product.is_active
              ? "bg-success/10 text-success border-success/20"
              : "bg-bg-subtle text-text-muted border-border"
          }`}
        >
          {product.is_active ? (
            <RiEyeLine className="text-xs" />
          ) : (
            <RiEyeOffLine className="text-xs" />
          )}
          {product.is_active ? "Ativo" : "Inativo"}
        </span>
      </td>

      {/* Moeda */}
      <td className="px-6 py-4 text-left">
        <span className="text-xs font-bold text-text-muted uppercase">
          {product.currency}
        </span>
      </td>

      {/* Preço + Editar */}
      <td className="px-6 py-4 text-left">
        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-bold">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                    if (e.key === "Escape") handleCancel();
                  }}
                  autoFocus
                  className="pl-7 pr-3 py-1.5 w-28 rounded-lg border-2 border-primary/40 bg-card text-sm font-bold text-text focus:outline-none focus:border-primary"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-7 h-7 rounded-lg bg-success/10 text-success flex items-center justify-center hover:bg-success/20 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <span className="w-3 h-3 border-2 border-success border-t-transparent rounded-full animate-spin" />
                ) : (
                  <RiCheckLine className="text-sm" />
                )}
              </button>
              <button
                onClick={handleCancel}
                className="w-7 h-7 rounded-lg bg-bg-subtle text-text-muted flex items-center justify-center hover:bg-border/30 transition-colors"
              >
                <RiCloseLine className="text-sm" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <span className="text-base font-black text-primary">
                ${product.price.toFixed(2)}
              </span>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black text-text-muted hover:bg-bg-subtle transition-all uppercase tracking-widest border border-border"
              >
                <RiEditLine />
                Editar
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const t = useT("admin");
  const [products, setProducts] = useState<ServicePrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("user_service_prices")
      .select(
        "id, office_id, service_id, price, currency, is_active, services(name, category, slug, description)",
      )
      .order("service_id");

    if (error) {
      toast.error(t.cases.messages.errorAction);
    } else {
      setProducts(
        (
          (data ?? []) as Array<{
            id: string;
            office_id: string;
            service_id: string;
            price: number;
            currency: string;
            is_active: boolean | null;
            services: {
              name: string;
              category: string;
              slug: string;
              description: string | null;
            } | null;
          }>
        ).map((p) => ({
          id: p.id,
          office_id: p.office_id,
          service_id: p.service_id,
          name: p.services?.name ?? p.service_id,
          description: p.services?.description ?? null,
          category: p.services?.category ?? "other",
          slug: p.services?.slug ?? p.service_id,
          price: p.price,
          currency: p.currency,
          is_active: p.is_active ?? true,
        })),
      );
    }
    setIsLoading(false);
  }, [t]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void load();
    }, 0);
    return () => {
      window.clearTimeout(timerId);
    };
  }, [load]);

  const grouped = products.reduce<Record<string, ServicePrice[]>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  const mainServices = grouped["main_visa"] ?? [];
  const avgTicket =
    mainServices.reduce((sum, p) => sum + p.price, 0) /
    Math.max(mainServices.length, 1);

  return (
    <div className="p-8 w-full">
      {/* Cabeçalho */}
      <div className="mb-8 text-left">
        <h1 className="font-display text-3xl font-black text-text uppercase tracking-tight">
          Produtos & Preços
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Visualize e edite os preços dos seus serviços.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8 max-w-sm">
        {[
          {
            label: "Total de Produtos",
            value: products.length,
            icon: RiPriceTag3Line,
            bg: "bg-info/10",
            color: "text-info",
          },
          {
            label: "Ticket Médio",
            value: `$${avgTicket.toFixed(0)}`,
            icon: RiMoneyDollarCircleLine,
            bg: "bg-primary/10",
            color: "text-primary",
          },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl border border-border shadow-sm p-5 flex items-center gap-4"
            >
              <div
                className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}
              >
                <Icon className={`text-lg ${s.color}`} />
              </div>
              <div className="text-left">
                <p className="text-2xl font-black text-text leading-none">
                  {s.value}
                </p>
                <p className="text-xs text-text-muted mt-0.5">{s.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tabelas por categoria */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RiPriceTag3Line className="text-4xl text-text-muted" />
          <p className="text-sm text-text-muted">Nenhum produto encontrado.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, items]) => (
            <div
              key={category}
              className="bg-card rounded-2xl border border-border shadow-xl shadow-black/5 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-display font-black text-text text-sm uppercase tracking-tight">
                  {categoryLabel(category)}
                </h2>
                <span className="text-[10px] font-black text-text-muted bg-bg-subtle px-3 py-1 rounded-full uppercase tracking-widest">
                  {items.length === 1 ? "1 item" : `${items.length} itens`}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-bg-subtle/50">
                      {["Nome", "Status", "Moeda", "Preço"].map((h) => (
                        <th
                          key={h}
                          className="px-6 py-4 text-left text-[10px] font-black text-text-muted tracking-widest uppercase"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((p) => (
                      <ProductRow key={p.id} product={p} onSaved={load} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-8 text-[10px] font-black text-text-muted text-center uppercase tracking-widest opacity-60">
        Clique em "Editar" para alterar o preço de um produto.
      </p>
    </div>
  );
}
