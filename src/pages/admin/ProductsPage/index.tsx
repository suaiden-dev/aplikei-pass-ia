import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  RiEditLine,
  RiCheckLine,
  RiCloseLine,
  RiMoneyDollarCircleLine,
  RiPriceTag3Line,
  RiToggleLine,
  RiToggleFill,
  RiEyeOffLine,
  RiEyeLine,
} from "react-icons/ri";
import { supabase } from "../../../lib/supabase";
import { useT } from "../../../i18n";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServicePrice {
  id: string;
  service_id: string;
  name: string;
  price: number;
  currency: string;
  is_active: boolean;
}

// ─── Inline edit row ──────────────────────────────────────────────────────────

function ProductRow({ product, onSaved }: { product: ServicePrice; onSaved: () => void }) {
  const t = useT("admin");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(product.price.toFixed(2));
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [isActive, setIsActive] = useState(product.is_active ?? true);

  const handleSave = async () => {
    const newPrice = parseFloat(draft);
    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error(t.products.messages.invalidValue);
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("services_prices")
      .update({ price: newPrice })
      .eq("id", product.id)
      .select("id, price");

    if (error) {
      toast.error(t.products.messages.updateError.replace('{{error}}', error.message));
    } else if (!data || data.length === 0) {
      toast.error(t.products.messages.noPermission);
    } else {
      toast.success(t.products.messages.updateSuccess.replace('{{name}}', product.name));
      setEditing(false);
      onSaved();
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setDraft(product.price.toFixed(2));
    setEditing(false);
  };

  const handleToggle = async () => {
    setToggling(true);
    const newValue = !isActive;
    const { data, error } = await supabase
      .from("services_prices")
      .update({ is_active: newValue })
      .eq("id", product.id)
      .select("id, is_active");

    if (error) {
      toast.error(t.products.messages.statusError.replace('{{error}}', error.message));
    } else if (!data || data.length === 0) {
      toast.error(t.products.messages.noPermission);
    } else {
      setIsActive(newValue);
      toast.success(
        newValue
          ? t.products.messages.statusActivated.replace('{{name}}', product.name)
          : t.products.messages.statusDeactivated.replace('{{name}}', product.name)
      );
      onSaved();
    }
    setToggling(false);
  };

  return (
    <tr
      className={`border-b border-slate-100 last:border-0 transition-colors group ${
        isActive ? "hover:bg-slate-50/40" : "bg-slate-50/60 opacity-70"
      }`}
    >
      {/* Service ID */}
      <td className="px-6 py-4 text-left">
        <span className="font-mono text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">
          {product.service_id}
        </span>
      </td>

      {/* Name */}
      <td className="px-6 py-4 text-left">
        <p className={`text-sm font-semibold ${isActive ? "text-slate-800" : "text-slate-400 font-bold"}`}>
          {product.name}
        </p>
      </td>

      {/* Currency */}
      <td className="px-6 py-4 text-left">
        <span className="text-xs font-bold text-slate-400 uppercase">{product.currency}</span>
      </td>

      {/* Price */}
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
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
                  autoFocus
                  className="pl-7 pr-3 py-1.5 w-28 rounded-lg border-2 border-primary/40 text-sm font-bold text-slate-800 focus:outline-none focus:border-primary"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-200 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <span className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <RiCheckLine className="text-sm" />
                )}
              </button>
              <button
                onClick={handleCancel}
                className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
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
              <span className={`text-base font-black ${isActive ? "text-primary" : "text-slate-400"}`}>
                ${product.price.toFixed(2)}
              </span>
              <button
                onClick={() => setEditing(true)}
                className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-all font-black uppercase tracking-widest"
              >
                <RiEditLine />
                {t.products.table.edit}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </td>

      {/* Status */}
      <td className="px-6 py-4 text-left">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${
            isActive
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-slate-100 text-slate-400 border-slate-200"
          }`}
        >
          {isActive ? <RiEyeLine className="text-xs" /> : <RiEyeOffLine className="text-xs" />}
          {isActive ? t.products.table.active : t.products.table.inactive}
        </span>
      </td>

      {/* Toggle */}
      <td className="px-6 py-4">
        <button
          onClick={handleToggle}
          disabled={toggling}
          title={isActive ? t.products.table.deactivate : t.products.table.activate}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 ${
            isActive
              ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200"
          }`}
        >
          {toggling ? (
            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isActive ? (
            <RiToggleFill className="text-base" />
          ) : (
            <RiToggleLine className="text-base" />
          )}
          {isActive ? t.products.table.deactivate : t.products.table.activate}
        </button>
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const t = useT("admin");
  const [products, setProducts] = useState<ServicePrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categoryOf = useCallback((serviceId: string): string => {
    const CATEGORY_MAP: Record<string, string> = {
      "visto-b1-b2":          t.products.categories.main,
      "visto-f1":             t.products.categories.main,
      "extensao-status":      t.products.categories.main,
      "troca-status":         t.products.categories.main,
      "dependente-b1-b2":     t.products.categories.dependents,
      "dependente-estudante": t.products.categories.dependents,
      "mentoria-individual":  t.products.categories.mentorships,
      "mentoria-bronze":      t.products.categories.mentorships,
      "mentoria-gold":        t.products.categories.mentorships,
      "analise-rfe-cos":      t.products.categories.additionalSupport,
      "analise-especialista-cos": t.products.categories.additionalSupport,
    };
    return CATEGORY_MAP[serviceId] ?? t.products.categories.others;
  }, [t]);

  const load = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("services_prices")
      .select("*")
      .order("service_id");
    if (error) {
      toast.error(t.cases.messages.errorAction);
    } else {
      setProducts(
        (data ?? []).map((p) => ({
          ...p,
          is_active: p.is_active ?? true,
        })) as ServicePrice[]
      );
    }
    setIsLoading(false);
  }, [t]);

  useEffect(() => {
    const loadTimerId = window.setTimeout(() => {
      void load();
    }, 0);

    return () => {
      window.clearTimeout(loadTimerId);
    };
  }, [load]);

  // Group by category
  const grouped = products.reduce<Record<string, ServicePrice[]>>((acc, p) => {
    const cat = categoryOf(p.service_id);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  const mainServices = grouped[t.products.categories.main] ?? [];
  const activeCount = products.filter((p) => p.is_active !== false).length;
  const inactiveCount = products.length - activeCount;

  const totalRevenue = mainServices.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="p-8 w-full">
      {/* Header */}
      <div className="mb-8 text-left">
        <h1 className="font-display text-3xl font-black text-slate-800 uppercase tracking-tight">
          {t.products.title}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {t.products.subtitle}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: t.products.stats.totalProducts,
            value: products.length,
            icon: RiPriceTag3Line,
            bg: "bg-blue-50",
            color: "text-primary",
          },
          {
            label: t.products.stats.activeCount,
            value: activeCount,
            icon: RiEyeLine,
            bg: "bg-emerald-50",
            color: "text-emerald-600",
          },
          {
            label: t.products.stats.inactiveCount,
            value: inactiveCount,
            icon: RiEyeOffLine,
            bg: "bg-red-50",
            color: "text-red-500",
          },
          {
            label: t.products.stats.avgTicket,
            value: `$${(totalRevenue / Math.max(mainServices.length, 1)).toFixed(0)}`,
            icon: RiMoneyDollarCircleLine,
            bg: "bg-violet-50",
            color: "text-violet-600",
          },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4"
            >
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`text-lg ${s.color}`} />
              </div>
              <div className="text-left">
                <p className="text-2xl font-black text-slate-800 leading-none">{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tables by category */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-display font-black text-slate-700 text-sm uppercase tracking-tight">{category}</h2>
                <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">
                  {items.length === 1 
                    ? t.products.table.itemCount.replace('{{count}}', '1') 
                    : t.products.table.itemsCount.replace('{{count}}', String(items.length))}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-50 bg-slate-50/50">
                      {[t.products.table.serviceId, t.products.table.name, t.products.table.currency, t.products.table.price, t.products.table.status, t.products.table.actions].map((h) => (
                        <th key={h} className="px-6 py-4 text-left text-[10px] font-black text-slate-400 tracking-widest uppercase">
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

      <p className="mt-8 text-[10px] font-black text-slate-400 text-center uppercase tracking-widest opacity-60">
        {t.products.footerHint}
      </p>
    </div>
  );
}
