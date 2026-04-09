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

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServicePrice {
  id: string;
  service_id: string;
  name: string;
  price: number;
  currency: string;
  is_active: boolean;
}

// ─── Category grouping ────────────────────────────────────────────────────────

const CATEGORY: Record<string, string> = {
  "visto-b1-b2":          "Serviços Principais",
  "visto-f1":             "Serviços Principais",
  "extensao-status":      "Serviços Principais",
  "troca-status":         "Serviços Principais",
  "dependente-b1-b2":     "Dependentes",
  "dependente-estudante": "Dependentes",
  "mentoria-individual":  "Mentorias",
  "mentoria-bronze":      "Mentorias",
  "mentoria-gold":        "Mentorias",
  "analise-rfe-cos":      "Suporte Adicional",
  "analise-especialista-cos": "Suporte Adicional",
};

function categoryOf(serviceId: string): string {
  return CATEGORY[serviceId] ?? "Outros";
}

// ─── Inline edit row ──────────────────────────────────────────────────────────

function ProductRow({ product, onSaved }: { product: ServicePrice; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(product.price.toFixed(2));
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  // Local state so UI updates immediately, independent of schema cache
  const [isActive, setIsActive] = useState(product.is_active ?? true);

  const handleSave = async () => {
    const newPrice = parseFloat(draft);
    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("services_prices")
      .update({ price: newPrice })
      .eq("id", product.id)
      .select("id, price");

    if (error) {
      toast.error(`Erro ao salvar preço: ${error.message}`);
    } else if (!data || data.length === 0) {
      toast.error("Sem permissão para alterar este produto. Verifique as políticas RLS no Supabase.");
    } else {
      toast.success(`Preço de "${product.name}" atualizado.`);
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
      toast.error(`Erro ao alterar status: ${error.message}`);
    } else if (!data || data.length === 0) {
      toast.error("Sem permissão para alterar este produto. Verifique as políticas RLS no Supabase.");
    } else {
      setIsActive(newValue);
      toast.success(
        newValue
          ? `"${product.name}" ativado. Clientes podem contratar.`
          : `"${product.name}" desativado. Contratações bloqueadas.`
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
      <td className="px-6 py-4">
        <span className="font-mono text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">
          {product.service_id}
        </span>
      </td>

      {/* Name */}
      <td className="px-6 py-4">
        <p className={`text-sm font-semibold ${isActive ? "text-slate-800" : "text-slate-400"}`}>
          {product.name}
        </p>
      </td>

      {/* Currency */}
      <td className="px-6 py-4">
        <span className="text-xs font-bold text-slate-400 uppercase">{product.currency}</span>
      </td>

      {/* Price */}
      <td className="px-6 py-4">
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
                className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-all"
              >
                <RiEditLine />
                Editar
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${
            isActive
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-slate-100 text-slate-400 border-slate-200"
          }`}
        >
          {isActive ? <RiEyeLine className="text-xs" /> : <RiEyeOffLine className="text-xs" />}
          {isActive ? "Ativo" : "Inativo"}
        </span>
      </td>

      {/* Toggle */}
      <td className="px-6 py-4">
        <button
          onClick={handleToggle}
          disabled={toggling}
          title={isActive ? "Desativar produto" : "Ativar produto"}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
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
          {isActive ? "Desativar" : "Ativar"}
        </button>
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const [products, setProducts] = useState<ServicePrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("services_prices")
      .select("*")
      .order("service_id");
    if (error) {
      toast.error("Erro ao carregar produtos.");
    } else {
      setProducts(
        (data ?? []).map((p) => ({
          ...p,
          is_active: p.is_active ?? true,
        })) as ServicePrice[]
      );
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Group by category
  const grouped = products.reduce<Record<string, ServicePrice[]>>((acc, p) => {
    const cat = categoryOf(p.service_id);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  const mainServices = grouped["Serviços Principais"] ?? [];
  const activeCount = products.filter((p) => p.is_active !== false).length;
  const inactiveCount = products.length - activeCount;

  const totalRevenue = mainServices.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="p-8 w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-slate-800 uppercase tracking-tight">
          Produtos & Preços
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Ative ou desative produtos e edite preços. Alterações afetam contratações imediatamente.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total de Produtos",
            value: products.length,
            icon: RiPriceTag3Line,
            bg: "bg-blue-50",
            color: "text-primary",
          },
          {
            label: "Ativos",
            value: activeCount,
            icon: RiEyeLine,
            bg: "bg-emerald-50",
            color: "text-emerald-600",
          },
          {
            label: "Inativos",
            value: inactiveCount,
            icon: RiEyeOffLine,
            bg: "bg-red-50",
            color: "text-red-500",
          },
          {
            label: "Ticket Médio",
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
              <div>
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
            <div key={category} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-display font-bold text-slate-700 text-sm">{category}</h2>
                <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {items.length} {items.length === 1 ? "item" : "itens"}
                </span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-50">
                    {["ID do Serviço", "Nome", "Moeda", "Preço", "Status", "Ação"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-400 tracking-wide">
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
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-slate-300 text-center">
        Passe o mouse sobre o preço e clique "Editar" para alterar. Use "Desativar/Ativar" para controlar a disponibilidade.
      </p>
    </div>
  );
}
