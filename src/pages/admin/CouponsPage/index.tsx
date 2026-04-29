import { useState, useEffect, useCallback } from "react";
import { useFormik } from "formik";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  RiTicket2Line, 
  RiAddLine, 
  RiFileCopyLine, 
  RiEyeLine, 
  RiEyeOffLine,
  RiRefreshLine,
  RiCalendarLine,
  RiSettings4Line,
  RiHistoryLine,
  RiCheckLine,
  RiCloseLine
} from "react-icons/ri";
import { supabase } from "../../../lib/supabase";
import { useT } from "../../../i18n";
import { Input } from "../../../components/Input";
import { Label } from "../../../components/Label";
import { zodValidate } from "../../../utils/zodValidate";
import { formatCouponCode } from "../../../services/coupon.service";
import { servicesData } from "../../../data/services";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_uses: number | null;
  uses_count: number;
  applicable_slugs: string[] | null;
  min_purchase_usd: number;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

// ─── Components ───────────────────────────────────────────────────────────────

export default function CouponsPage() {
  const t = useT("admin").coupons;
  const tShared = useT("admin").shared;
  
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCoupons = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("discount_coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(t.messages.createError.replace("{{error}}", message));
    } finally {
      setIsLoading(false);
    }
  }, [t.messages.createError]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const stats = {
    total: coupons.length,
    active: coupons.filter(c => c.is_active && new Date(c.expires_at) > new Date()).length,
    expired: coupons.filter(c => new Date(c.expires_at) <= new Date()).length,
    totalUses: coupons.reduce((sum, c) => sum + c.uses_count, 0)
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean, code: string) => {
    try {
      const { error } = await supabase
        .from("discount_coupons")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      
      toast.success(t.messages.toggleSuccess
        .replace("{{code}}", code)
        .replace("{{status}}", !currentStatus ? t.status.active : t.status.inactive)
      );
      fetchCoupons();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(t.messages.toggleError.replace("{{error}}", message));
    }
  };

  const formik = useFormik({
    initialValues: {
      code: "",
      discount_type: "percentage",
      discount_value: 0,
      max_uses: "",
      expiration_type: "7d",
      custom_date: "",
      applicable_slugs: [] as string[],
      min_purchase_usd: 0,
    },
    validate: zodValidate(z.object({
      code: z.string().min(3, t.messages.invalidCode),
      discount_value: z.number().min(0.01, t.messages.invalidValue),
      min_purchase_usd: z.number().min(0),
    })),
    onSubmit: async (values) => {
      try {
        let expiresAt: Date;
        if (values.expiration_type === "custom") {
          expiresAt = new Date(values.custom_date);
        } else {
          const now = new Date();
          const map: Record<string, number> = {
            "1h": 1, "6h": 6, "12h": 12, "24h": 24, "48h": 48, "7d": 24*7, "30d": 24*30
          };
          expiresAt = new Date(now.getTime() + map[values.expiration_type] * 60 * 60 * 1000);
        }

        const { error } = await supabase.from("discount_coupons").insert({
          code: formatCouponCode(values.code),
          discount_type: values.discount_type,
          discount_value: values.discount_value,
          max_uses: values.max_uses === "" ? null : parseInt(values.max_uses),
          applicable_slugs: values.applicable_slugs.length === 0 ? null : values.applicable_slugs,
          min_purchase_usd: values.min_purchase_usd,
          expires_at: expiresAt.toISOString(),
          is_active: true,
        });

        if (error) throw error;

        toast.success(t.messages.createSuccess.replace("{{code}}", values.code));
        setIsModalOpen(false);
        formik.resetForm();
        fetchCoupons();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro desconhecido";
        toast.error(t.messages.createError.replace("{{error}}", message));
      }
    }
  });

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    formik.setFieldValue("code", code);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t.messages.copied);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-left">
          <h1 className="text-2xl font-bold font-display text-slate-800">{t.title}</h1>
          <p className="text-sm text-slate-500">{t.subtitle}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
        >
          <RiAddLine className="text-lg" />
          {t.createNew}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t.stats.total, value: stats.total, icon: RiTicket2Line, color: "text-blue-600", bg: "bg-blue-50" },
          { label: t.stats.active, value: stats.active, icon: RiSettings4Line, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: t.stats.expired, value: stats.expired, icon: RiHistoryLine, color: "text-amber-600", bg: "bg-amber-50" },
          { label: t.stats.totalUses, value: stats.totalUses, icon: RiRefreshLine, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={22} />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800 leading-none mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t.table.code}</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t.table.type}</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t.table.value}</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t.table.uses}</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t.table.expiresAt}</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t.table.status}</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">{t.table.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                      {tShared.loading}
                    </td>
                  </tr>
                ) : coupons.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                      {t.table.noResults}
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => {
                    const isExpired = new Date(coupon.expires_at) <= new Date();
                    const isDepleted = coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses;
                    const isActive = coupon.is_active && !isExpired && !isDepleted;

                    return (
                      <motion.tr 
                        key={coupon.id} 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs">
                              {coupon.code}
                            </span>
                            <button 
                                onClick={() => copyToClipboard(coupon.code)}
                                className="text-slate-300 hover:text-primary transition-colors"
                            >
                              <RiFileCopyLine size={14} />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                          {coupon.discount_type === "percentage" ? t.form.percentage : t.form.fixed}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-black text-slate-800">
                            {coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : `$${coupon.discount_value.toFixed(2)}`}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700">{coupon.uses_count} / {coupon.max_uses || t.table.unlimited}</span>
                            <div className="w-20 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                              <div 
                                className="h-full bg-primary" 
                                style={{ width: `${Math.min(100, (coupon.uses_count / (coupon.max_uses || 100)) * 100)}%` }} 
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {new Date(coupon.expires_at).toLocaleDateString()}
                          <span className="block text-[10px] opacity-60">
                            {new Date(coupon.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                            isActive ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
                            isExpired ? "bg-amber-50 text-amber-600 border border-amber-100" :
                            isDepleted ? "bg-rose-50 text-rose-600 border border-rose-100" :
                            "bg-slate-100 text-slate-400 border border-slate-200"
                          }`}>
                            {isActive ? t.status.active : isExpired ? t.status.expired : isDepleted ? t.status.depleted : t.status.inactive}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleToggleStatus(coupon.id, coupon.is_active, coupon.code)}
                            className={`p-2 rounded-lg transition-colors ${
                                coupon.is_active ? "text-slate-400 hover:text-amber-500 hover:bg-amber-50" : "text-slate-300 hover:text-emerald-500 hover:bg-emerald-50"
                            }`}
                            title={coupon.is_active ? t.table.deactivate : t.table.activate}
                          >
                            {coupon.is_active ? <RiEyeLine size={18} /> : <RiEyeOffLine size={18} />}
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-display font-bold text-slate-800 text-lg flex items-center gap-2">
                  <RiTicket2Line className="text-primary" />
                  {t.createNew}
                </h3>
                <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <RiCloseLine size={20} className="text-slate-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <form id="coupon-form" onSubmit={formik.handleSubmit} className="space-y-5">
                  {/* Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="code">{t.form.code}</Label>
                      <div className="flex gap-2">
                        <Input
                          id="code"
                          name="code"
                          placeholder={t.form.codePlaceholder}
                          value={formik.values.code}
                          onChange={formik.handleChange}
                          className="uppercase font-mono uppercase"
                        />
                        <button
                          type="button"
                          onClick={generateRandomCode}
                          className="px-3 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                          title={t.form.generateRandom}
                        >
                          <RiRefreshLine />
                        </button>
                      </div>
                      {formik.touched.code && formik.errors.code && (
                        <p className="text-[10px] text-red-500">{formik.errors.code}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="discount_type">{t.form.discountType}</Label>
                      <select
                        id="discount_type"
                        name="discount_type"
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        value={formik.values.discount_type}
                        onChange={formik.handleChange}
                      >
                        <option value="percentage">{t.form.percentage}</option>
                        <option value="fixed">{t.form.fixed}</option>
                      </select>
                    </div>
                  </div>

                  {/* Value & Max Uses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="discount_value">{t.form.value}</Label>
                      <Input
                        id="discount_value"
                        name="discount_value"
                        type="number"
                        placeholder={t.form.valuePlaceholder}
                        value={formik.values.discount_value}
                        onChange={formik.handleChange}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="max_uses">{t.form.maxUses}</Label>
                      <Input
                        id="max_uses"
                        name="max_uses"
                        type="number"
                        placeholder={t.form.maxUsesPlaceholder}
                        value={formik.values.max_uses}
                        onChange={formik.handleChange}
                      />
                    </div>
                  </div>

                  {/* Expiration */}
                  <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <Label className="flex items-center gap-2">
                      <RiCalendarLine className="text-primary" />
                      {t.form.expiration}
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.entries(t.form.expirationOptions as Record<string, string>).map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => formik.setFieldValue("expiration_type", key)}
                          className={`py-2 px-1 rounded-lg text-[10px] font-bold border transition-all ${
                            formik.values.expiration_type === key 
                              ? "bg-slate-900 text-white border-slate-900" 
                              : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    {formik.values.expiration_type === "custom" && (
                      <Input
                        type="datetime-local"
                        name="custom_date"
                        value={formik.values.custom_date}
                        onChange={formik.handleChange}
                        className="mt-2"
                      />
                    )}
                  </div>

                  {/* Min Purchase */}
                  <div className="space-y-1.5">
                    <Label htmlFor="min_purchase_usd">{t.form.minPurchase}</Label>
                    <Input
                      id="min_purchase_usd"
                      name="min_purchase_usd"
                      type="number"
                      placeholder={t.form.minPurchasePlaceholder}
                      value={formik.values.min_purchase_usd}
                      onChange={formik.handleChange}
                    />
                  </div>

                  {/* Applicable Slugs (Simple multiselect) */}
                  <div className="space-y-1.5">
                    <Label>{t.form.applicableSlugs}</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-100 rounded-xl bg-white">
                      <label className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formik.values.applicable_slugs.length === 0}
                          onChange={() => formik.setFieldValue("applicable_slugs", [])}
                          className="rounded text-primary"
                        />
                        <span className="text-xs text-slate-600">{t.form.allServices}</span>
                      </label>
                      {servicesData.map(s => (
                        <label key={s.slug} className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formik.values.applicable_slugs.includes(s.slug)}
                            onChange={(e) => {
                              const next = e.target.checked 
                                ? [...formik.values.applicable_slugs, s.slug] 
                                : formik.values.applicable_slugs.filter(slug => slug !== s.slug);
                              formik.setFieldValue("applicable_slugs", next);
                            }}
                            className="rounded text-primary"
                          />
                          <span className="text-xs text-slate-600 truncate">{s.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  {tShared.cancel}
                </button>
                <button
                  type="submit"
                  form="coupon-form"
                  disabled={formik.isSubmitting}
                  className="px-8 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center gap-2"
                >
                  {formik.isSubmitting ? (
                    <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <RiRefreshLine />
                    </motion.div>
                  ) : (
                    <RiCheckLine />
                  )}
                  {t.form.submit}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
