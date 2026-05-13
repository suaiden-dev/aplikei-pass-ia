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
  RiLoader4Line
} from "react-icons/ri";
import { supabase } from "../../../shared/lib/supabase";
import { useT } from "../../../i18n";
import { useAuth } from "../../../hooks/useAuth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../components/atoms/tooltip";
import { Switch } from "../../../components/atoms/switch";

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

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
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
  const [toggling, setToggling] = useState(false);

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

  const handleToggle = async (checked: boolean) => {
    setToggling(true);
    const { error } = await supabase
      .from("user_service_prices")
      .update({ is_active: checked })
      .eq("id", product.id);

    if (error) {
      toast.error(t.products.messages.statusError);
      console.error(error);
    } else {
      toast.success(checked ? t.products.messages.statusActivated.replace("\"{{name}}\" ", "") : t.products.messages.statusDeactivated.replace("\"{{name}}\" ", ""));
      // Note: the replace above is a bit hacky, but better use a dedicated key if needed. 
      // Actually I'll just use the full message and replace the name.
      toast.success(checked 
        ? t.products.messages.statusActivated.replace("{{name}}", product.name) 
        : t.products.messages.statusDeactivated.replace("{{name}}", product.name)
      );
      onSaved();
    }
    setToggling(false);
  };

  return (
    <tr className="border-b border-border last:border-0 transition-colors hover:bg-bg-subtle/40">
      {/* Nome */}
      <td className="px-8 py-5 text-left min-w-[200px]">
        <div className="flex items-center gap-2">
          <p className={cn("text-sm font-semibold transition-opacity", !product.is_active && "opacity-50 text-text-muted")}>
            {product.name}
          </p>
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

      {/* Moeda */}
      <td className="px-8 py-5 text-left">
        <span className="text-[11px] font-black text-text-muted uppercase tracking-widest bg-bg-subtle/50 px-2.5 py-1 rounded-lg">
          {product.currency}
        </span>
      </td>

      {/* Preço + Editar */}
      <td className="px-8 py-5 text-left min-w-[180px]">
        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
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
                className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center hover:bg-success/20 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <span className="w-3 h-3 border-2 border-success border-t-transparent rounded-full animate-spin" />
                ) : (
                  <RiCheckLine className="text-sm" />
                )}
              </button>
              <button
                onClick={handleCancel}
                className="w-8 h-8 rounded-lg bg-bg-subtle text-text-muted flex items-center justify-center hover:bg-border/30 transition-colors"
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
              <span className={cn("text-base font-black text-primary transition-opacity", !product.is_active && "opacity-40 grayscale")}>
                ${product.price.toFixed(2)}
              </span>
              <button
                onClick={() => setEditing(true)}
                disabled={!product.is_active}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black text-text-muted hover:bg-primary/10 hover:text-primary transition-all uppercase tracking-widest bg-bg-subtle/50",
                  !product.is_active && "opacity-50 cursor-not-allowed pointer-events-none"
                )}
              >
                <RiEditLine className="text-xs" />
                {t.products.table.edit}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </td>

      {/* Ações (Toggle) */}
      <td className="px-8 py-5 text-right">
        <div className="flex items-center justify-end gap-4">
          <span
            className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border transition-all ${
              product.is_active
                ? "bg-success/10 text-success border-success/20"
                : "bg-bg-subtle text-text-muted border-border"
            }`}
          >
            {toggling ? (
              <RiLoader4Line className="animate-spin" />
            ) : product.is_active ? (
              <RiEyeLine className="text-[10px]" />
            ) : (
              <RiEyeOffLine className="text-[10px]" />
            )}
            {product.is_active ? t.products.table.active : t.products.table.inactive}
          </span>
          <div className="flex items-center py-1">
            <Switch 
              checked={product.is_active} 
              onCheckedChange={handleToggle}
              disabled={toggling}
            />
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const t = useT("admin");
  const { user } = useAuth();
  const [resolvedOfficeId, setResolvedOfficeId] = useState<string | null>(user?.officeId ?? null);
  const [products, setProducts] = useState<ServicePrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.officeId) {
      setResolvedOfficeId(user.officeId);
      return;
    }

    if (!user?.id) {
      setResolvedOfficeId(null);
      return;
    }

    supabase
      .from("offices")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setResolvedOfficeId(data?.id ?? null);
      });
  }, [user?.id, user?.officeId]);

  const load = useCallback(async () => {
    if (!resolvedOfficeId) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from("user_service_prices")
      .select(
        "id, office_id, service_id, price, currency, is_active, services(name, category, slug, description)",
      )
      .eq("office_id", resolvedOfficeId)
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
  }, [resolvedOfficeId, t]);

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
    <div className="p-8 w-full max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Cabeçalho */}
      <div className="mb-8 text-left">
        <h1 className="font-display text-4xl font-black text-text uppercase tracking-tighter">
          {t.products.title}
        </h1>
        <p className="text-base text-text-muted font-medium mt-1">
          {t.products.subtitle}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        {[
          {
            label: t.products.stats.totalProducts,
            value: products.length,
            icon: RiPriceTag3Line,
            bg: "bg-info/10",
            color: "text-info",
          },
          {
            label: t.products.stats.activeCount,
            value: products.filter(p => p.is_active).length,
            icon: RiEyeLine,
            bg: "bg-success/10",
            color: "text-success",
          },
          {
            label: t.products.stats.avgTicket,
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
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-3xl border border-border shadow-sm p-6 flex items-center gap-5"
            >
              <div
                className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center shrink-0 shadow-inner`}
              >
                <Icon className={`text-2xl ${s.color}`} />
              </div>
              <div className="text-left">
                <p className="text-3xl font-black text-text leading-none tracking-tight">
                  {s.value}
                </p>
                <p className="text-sm font-bold text-text-muted mt-1 uppercase tracking-widest">{s.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tabelas por categoria */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-card rounded-[32px] border border-border">
          <RiPriceTag3Line className="text-6xl text-text-muted/20" />
          <p className="text-lg font-bold text-text-muted">{t.coupons.table.noResults}</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([category, items]) => (
            <div
              key={category}
              className="bg-card rounded-[32px] border border-border shadow-2xl shadow-black/5 overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-bg-subtle/30">
                <h2 className="font-display font-black text-text text-base uppercase tracking-widest">
                  {t.products.categories[category as keyof typeof t.products.categories] ?? category}
                </h2>
                <span className="text-[11px] font-black text-text-muted bg-white border border-border px-4 py-1.5 rounded-full uppercase tracking-widest">
                  {items.length === 1 ? t.products.table.itemCount.replace("{{count}}", "1") : t.products.table.itemsCount.replace("{{count}}", items.length.toString())}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-bg-subtle/20">
                      {[t.products.table.productName, t.products.table.currency, t.products.table.price].map((h) => (
                        <th
                          key={h}
                          className="px-8 py-5 text-left text-[10px] font-black text-text-muted tracking-widest uppercase"
                        >
                          {h}
                        </th>
                      ))}
                      <th className="px-8 py-5 text-right text-[10px] font-black text-text-muted tracking-widest uppercase">
                        {t.products.table.actionsHeader}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
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

      <div className="mt-12 p-6 bg-bg-subtle/50 rounded-3xl border border-border text-center">
        <p className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center justify-center gap-2">
          <RiInformationLine className="text-lg text-primary" />
          {t.products.footerHint}
        </p>
      </div>
    </div>
  );
}
