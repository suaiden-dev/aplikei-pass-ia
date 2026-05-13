import { useState, useEffect, useCallback } from "react";
import { useFormik } from "formik";
import { z } from "zod";
import { toast } from "sonner";
import {
  RiTicket2Line,
  RiAddLine,
  RiFileCopyLine,
  RiEyeLine,
  RiEyeOffLine,
  RiRefreshLine,
  RiCalendarLine,
  RiCheckLine,
  RiCloseLine,
  RiPercentLine,
  RiPriceTag3Line,
} from "react-icons/ri";
import { supabase } from "../../../shared/lib/supabase";
import { useAuth } from "../../../hooks/useAuth";
import { useT, useLocale } from "../../../i18n";
import { Input } from "../../../components/atoms/input";
import { Label } from "../../../components/atoms/label";
import { zodValidate } from "../../../utils/zodValidate";
import { formatCouponCode } from "../../../features/payment/lib/coupon";

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

interface ServiceOption {
  slug: string;
  name: string;
}

interface DiscountRules {
  seller_max_pct: number | null;
  seller_max_fixed: number | null;
  seller_allow_percentage: boolean;
  seller_allow_fixed: boolean;
  seller_max_coupons: number | null;
  seller_max_uses: number | null;
  seller_min_purchase_usd: number | null;
}

const NO_RULES: DiscountRules = {
  seller_max_pct: null,
  seller_max_fixed: null,
  seller_allow_percentage: true,
  seller_allow_fixed: true,
  seller_max_coupons: null,
  seller_max_uses: null,
  seller_min_purchase_usd: null,
};

function couponStatus(c: Coupon): "active" | "expired" | "depleted" | "inactive" {
  if (new Date(c.expires_at) <= new Date()) return "expired";
  if (c.max_uses !== null && c.uses_count >= c.max_uses) return "depleted";
  if (!c.is_active) return "inactive";
  return "active";
}

const STATUS_STYLES = {
  active:   "bg-success/10 text-success border-success/20",
  expired:  "bg-warning/10 text-warning border-warning/20",
  depleted: "bg-danger/10 text-danger border-danger/20",
  inactive: "bg-bg-subtle text-text-muted border-border",
};

export default function CouponsPage() {
  const t = useT("admin").coupons;
  const tShared = useT("admin").shared;
  const { lang: language } = useLocale();
  const { user } = useAuth();
  const isSeller = user?.role === "seller";
  const officeId = user?.officeId ?? null;

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [rules, setRules] = useState<DiscountRules>(NO_RULES);
  const [resolvedOfficeId, setResolvedOfficeId] = useState<string | null>(officeId);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSeller || !user?.id) return;
    if (officeId) { setResolvedOfficeId(officeId); return; }

    supabase
      .from("user_accounts")
      .select("office_id")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.office_id) setResolvedOfficeId(data.office_id as string);
      });
  }, [isSeller, user?.id, officeId]);

  const fetchCoupons = useCallback(async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("discount_coupons")
      .select("*")
      .order("created_at", { ascending: false });
    setCoupons(data ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => { void fetchCoupons(); }, [fetchCoupons]);

  useEffect(() => {
    let q = supabase.from("services").select("slug, name, category").eq("is_active", true).order("name");
    if (isSeller) q = q.eq("category", "main_visa");
    q.then(({ data }) => setServices((data as ServiceOption[]) ?? []));
  }, [isSeller]);

  useEffect(() => {
    if (!isSeller || !resolvedOfficeId) return;
    supabase
      .from("offices")
      .select("discount_rules")
      .eq("id", resolvedOfficeId)
      .single()
      .then(({ data }) => {
        if (data?.discount_rules && Object.keys(data.discount_rules).length > 0) {
          setRules({ ...NO_RULES, ...(data.discount_rules as Partial<DiscountRules>) });
        }
      });
  }, [isSeller, resolvedOfficeId]);

  const statsCount = {
    total: coupons.length,
    active: coupons.filter(c => couponStatus(c) === "active").length,
    expired: coupons.filter(c => couponStatus(c) === "expired").length,
    totalUses: coupons.reduce((s, c) => s + c.uses_count, 0),
  };

  const handleToggle = async (coupon: Coupon) => {
    setSavingId(coupon.id);
    const { error } = await supabase
      .from("discount_coupons")
      .update({ is_active: !coupon.is_active })
      .eq("id", coupon.id);
    
    if (error) {
      toast.error(t.messages.toggleError);
    } else {
      const statusText = !coupon.is_active ? t.messages.statusActivated : t.messages.statusDeactivated;
      toast.success(t.messages.toggleSuccess.replace("{{code}}", coupon.code).replace("{{status}}", statusText));
    }
    setSavingId(null);
    void fetchCoupons();
  };

  const formik = useFormik({
    initialValues: {
      code: "", discount_type: "percentage", discount_value: 0,
      max_uses: "", expiration_type: "7d", custom_date: "",
      applicable_slugs: [] as string[], min_purchase_usd: 0,
    },
    validate: zodValidate(z.object({
      code: z.string().min(3, t.messages.invalidCode),
      discount_value: z.number().min(0.01, t.messages.invalidValue),
      min_purchase_usd: z.number().min(0),
    })),
    onSubmit: async (values) => {
      let expiresAt: Date;
      if (values.expiration_type === "custom") {
        expiresAt = new Date(values.custom_date);
      } else {
        const hours: Record<string, number> = { "1h": 1, "6h": 6, "12h": 12, "24h": 24, "48h": 48, "7d": 168, "30d": 720 };
        expiresAt = new Date(Date.now() + (hours[values.expiration_type] ?? 168) * 3600000);
      }

      if (isSeller) {
        if (values.discount_type === "percentage" && !rules.seller_allow_percentage) {
          toast.error(t.messages.rulePercentageNotAllowed); return;
        }
        if (values.discount_type === "fixed" && !rules.seller_allow_fixed) {
          toast.error(t.messages.ruleFixedNotAllowed); return;
        }
        if (values.discount_type === "percentage" && rules.seller_max_pct !== null && values.discount_value > rules.seller_max_pct) {
          toast.error(t.messages.ruleMaxPct.replace("{{value}}", String(rules.seller_max_pct))); return;
        }
        if (values.discount_type === "fixed" && rules.seller_max_fixed !== null && values.discount_value > rules.seller_max_fixed) {
          toast.error(t.messages.ruleMaxFixed.replace("{{value}}", String(rules.seller_max_fixed))); return;
        }
        if (values.max_uses !== "" && rules.seller_max_uses !== null && parseInt(values.max_uses) > rules.seller_max_uses) {
          toast.error(t.messages.ruleMaxUses.replace("{{value}}", String(rules.seller_max_uses))); return;
        }
      }

      let applicableSlugs: string[] | null =
        values.applicable_slugs.length === 0 ? null : values.applicable_slugs;
      if (isSeller) {
        const mainVisaSlugs = services.map((s) => s.slug);
        applicableSlugs = applicableSlugs
          ? applicableSlugs.filter((sl) => mainVisaSlugs.includes(sl))
          : mainVisaSlugs;
        if (applicableSlugs.length === 0) applicableSlugs = mainVisaSlugs;
      }

      const { error } = await supabase.from("discount_coupons").insert({
        code: formatCouponCode(values.code),
        discount_type: values.discount_type,
        discount_value: values.discount_value,
        max_uses: values.max_uses === "" ? null : parseInt(values.max_uses),
        applicable_slugs: applicableSlugs,
        min_purchase_usd: values.min_purchase_usd,
        expires_at: expiresAt.toISOString(),
        is_active: true,
        created_by: user?.id ?? null,
        office_id: resolvedOfficeId,
      });
      if (error) { toast.error(t.messages.createError.replace("{{error}}", error.message)); return; }
      toast.success(t.messages.createSuccess.replace("{{code}}", values.code));
      setIsModalOpen(false);
      formik.resetForm();
      void fetchCoupons();
    },
  });

  const dateFormat = new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : 'en-US', {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  const timeFormat = new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : 'en-US', {
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-2xl font-black tracking-tight text-text uppercase">{t.title}</h1>
          <p className="text-sm text-text-muted mt-0.5 font-medium">{t.subtitle}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <RiAddLine className="text-lg" />
          {t.createNew}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
        {[
          { label: t.stats.total, value: statsCount.total, icon: RiTicket2Line, color: "text-info bg-info/10" },
          { label: t.stats.active, value: statsCount.active, icon: RiCheckLine, color: "text-success bg-success/10" },
          { label: t.stats.expired, value: statsCount.expired, icon: RiCalendarLine, color: "text-warning bg-warning/10" },
          { label: t.stats.totalUses, value: statsCount.totalUses, icon: RiPriceTag3Line, color: "text-primary bg-primary/10" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-[24px] border border-border p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${s.color}`}>
              <s.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-text leading-none tracking-tight">{s.value}</p>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-[32px] border border-border shadow-xl shadow-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg-subtle/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">
                  {t.table.code}
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">
                  {t.table.value}
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">
                  {t.table.uses}
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">
                  {t.table.expiresAt}
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">
                  {t.table.status}
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">
                  {t.table.actions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={6} className="px-8 py-20 text-center text-text-muted text-sm font-bold uppercase tracking-widest animate-pulse">{tShared.loading}</td></tr>
              ) : coupons.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-20 text-center text-text-muted text-sm font-black uppercase tracking-widest">{t.table.noResults}</td></tr>
              ) : coupons.map((c) => {
                const status = couponStatus(c);
                const pct = c.max_uses ? Math.min(100, (c.uses_count / c.max_uses) * 100) : 0;
                const remainingCount = c.max_uses != null ? c.max_uses - c.uses_count : null;

                return (
                  <tr key={c.id} className="hover:bg-bg-subtle/40 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-text bg-bg-subtle px-3 py-1.5 rounded-xl border border-border tracking-widest shadow-inner">
                          {c.code}
                        </span>
                        <button
                          onClick={() => { void navigator.clipboard.writeText(c.code); toast.success(t.messages.copied); }}
                          className="p-2 text-text-muted hover:text-primary transition-colors hover:bg-primary/10 rounded-lg"
                        >
                          <RiFileCopyLine size={14} />
                        </button>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <div className="flex items-center gap-1.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          {c.discount_type === "percentage"
                            ? <RiPercentLine className="text-primary text-sm shrink-0" />
                            : <span className="text-primary text-xs font-black">$</span>}
                        </div>
                        <span className="font-black text-text text-sm">
                          {c.discount_type === "percentage" ? `${c.discount_value}%` : `$${c.discount_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                        </span>
                      </div>
                    </td>

                    <td className="px-8 py-6 min-w-[180px]">
                      <div className="space-y-2">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-sm font-black text-text">{c.uses_count}</span>
                          <span className="text-[10px] font-black uppercase text-text-muted tracking-tight">
                            {c.max_uses != null
                              ? t.table.remaining.replace('{{total}}', String(c.max_uses)).replace('{{remaining}}', String(remainingCount! >= 0 ? remainingCount : 0))
                              : t.table.unlimited}
                          </span>
                        </div>
                        {c.max_uses != null && (
                          <div className="h-2 w-full rounded-full bg-bg-subtle overflow-hidden shadow-inner">
                            <div
                              className={`h-full rounded-full transition-all shadow-sm ${pct >= 100 ? "bg-danger" : pct >= 75 ? "bg-warning" : "bg-primary"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-8 py-6 whitespace-nowrap">
                      <p className="text-xs font-black text-text uppercase tracking-tight">
                        {dateFormat.format(new Date(c.expires_at))}
                      </p>
                      <p className="text-[10px] text-text-muted mt-1 font-bold">
                        {timeFormat.format(new Date(c.expires_at))}
                      </p>
                    </td>

                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${STATUS_STYLES[status]}`}>
                        {t.status[status]}
                      </span>
                    </td>

                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => void handleToggle(c)}
                        disabled={savingId === c.id}
                        className={`p-2.5 rounded-xl border transition-all disabled:opacity-40 shadow-sm hover:shadow-md ${
                          c.is_active
                            ? "border-border text-text-muted hover:border-warning/40 hover:bg-warning/10 hover:text-warning"
                            : "border-border text-text-muted hover:border-success/40 hover:bg-success/10 hover:text-success"
                        }`}
                      >
                        {c.is_active ? <RiEyeLine size={18} /> : <RiEyeOffLine size={18} />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-xl bg-card rounded-[32px] border border-border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-bg-subtle/30">
              <div className="text-left">
                <h3 className="font-black text-text text-xl flex items-center gap-3 uppercase tracking-tight">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <RiTicket2Line className="text-primary text-xl" />
                  </div>
                  {t.createNew}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center hover:bg-bg-subtle rounded-xl transition-colors">
                <RiCloseLine size={24} className="text-text-muted" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 text-left">
              <form id="coupon-form" onSubmit={formik.handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1">{t.form.code}</Label>
                    <div className="flex gap-2">
                      <Input
                        name="code" placeholder={t.form.codePlaceholder}
                        value={formik.values.code} onChange={formik.handleChange}
                        className="uppercase font-mono font-bold h-12 rounded-xl text-center tracking-widest"
                      />
                      <button type="button" onClick={() => {
                        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                        formik.setFieldValue("code", Array.from({length: 8}, () => chars[Math.floor(Math.random()*chars.length)]).join(""));
                      }} className="w-12 h-12 rounded-xl border border-border text-text-muted hover:bg-bg-subtle flex items-center justify-center shrink-0 transition-colors">
                        <RiRefreshLine size={18} />
                      </button>
                    </div>
                    {formik.touched.code && formik.errors.code && <p className="text-[10px] text-danger font-bold ml-1 uppercase">{formik.errors.code}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1">{t.form.discountType}</Label>
                    <select name="discount_type" value={formik.values.discount_type} onChange={formik.handleChange}
                      className="w-full h-12 px-4 rounded-xl border border-border bg-card text-sm font-bold text-text outline-none focus:ring-4 focus:ring-primary/5 transition-all">
                      {(!isSeller || rules.seller_allow_percentage) && (
                        <option value="percentage">{t.form.percentage}</option>
                      )}
                      {(!isSeller || rules.seller_allow_fixed) && (
                        <option value="fixed">{t.form.fixed}</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1">
                      {t.form.value}
                      {isSeller && formik.values.discount_type === "percentage" && rules.seller_max_pct !== null && (
                        <span className="ml-2 text-[10px] text-warning font-black">MAX {rules.seller_max_pct}%</span>
                      )}
                      {isSeller && formik.values.discount_type === "fixed" && rules.seller_max_fixed !== null && (
                        <span className="ml-2 text-[10px] text-warning font-black">MAX ${rules.seller_max_fixed}</span>
                      )}
                    </Label>
                    <Input name="discount_value" type="number" placeholder={t.form.valuePlaceholder}
                      max={isSeller ? (formik.values.discount_type === "percentage" ? (rules.seller_max_pct ?? undefined) : (rules.seller_max_fixed ?? undefined)) : undefined}
                      value={formik.values.discount_value} onChange={formik.handleChange} className="h-12 rounded-xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1">
                      {t.form.maxUses}
                      {isSeller && rules.seller_max_uses !== null && (
                        <span className="ml-2 text-[10px] text-warning font-black">MAX {rules.seller_max_uses}</span>
                      )}
                    </Label>
                    <Input name="max_uses" type="number"
                      placeholder={isSeller && rules.seller_max_uses !== null ? String(rules.seller_max_uses) : t.form.maxUsesPlaceholder}
                      max={isSeller && rules.seller_max_uses !== null ? rules.seller_max_uses : undefined}
                      value={formik.values.max_uses} onChange={formik.handleChange} className="h-12 rounded-xl font-bold" />
                  </div>
                </div>

                <div className="space-y-4 p-6 bg-bg-subtle rounded-3xl border border-border shadow-inner">
                  <Label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-muted ml-1"><RiCalendarLine className="text-primary text-lg" /> {t.form.expiration}</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(t.form.expirationOptions as Record<string, string>).map(([key, label]) => (
                      <button key={key} type="button" onClick={() => formik.setFieldValue("expiration_type", key)}
                        className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${formik.values.expiration_type === key ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-card text-text-muted border-border hover:border-primary/30"}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                  {formik.values.expiration_type === "custom" && (
                    <Input type="datetime-local" name="custom_date" value={formik.values.custom_date} onChange={formik.handleChange} className="mt-3 h-12 rounded-xl font-bold" />
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1">{t.form.minPurchase}</Label>
                  <Input name="min_purchase_usd" type="number" placeholder={t.form.minPurchasePlaceholder}
                    value={formik.values.min_purchase_usd} onChange={formik.handleChange} className="h-12 rounded-xl font-bold" />
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1">{t.form.applicableSlugs}</Label>
                  {isSeller && (
                    <div className="p-3 bg-warning/10 border border-warning/20 rounded-xl">
                      <p className="text-[10px] text-warning font-black uppercase tracking-wider">
                        {t.form.sellerHint}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-1 max-h-44 overflow-y-auto p-3 border border-border rounded-2xl bg-bg-subtle shadow-inner">
                    {!isSeller && (
                      <label className="flex items-center gap-3 p-2.5 hover:bg-card rounded-xl cursor-pointer transition-colors group">
                        <input type="checkbox" checked={formik.values.applicable_slugs.length === 0}
                          onChange={() => formik.setFieldValue("applicable_slugs", [])}
                          className="w-5 h-5 rounded-lg accent-primary border-border cursor-pointer" />
                        <span className="text-xs text-text-muted font-black uppercase tracking-widest group-hover:text-text">{t.form.allServices}</span>
                      </label>
                    )}
                    {services.map((s) => (
                      <label key={s.slug} className="flex items-center gap-3 p-2.5 hover:bg-card rounded-xl cursor-pointer transition-colors group">
                        <input type="checkbox" checked={formik.values.applicable_slugs.includes(s.slug)}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...formik.values.applicable_slugs, s.slug]
                              : formik.values.applicable_slugs.filter(sl => sl !== s.slug);
                            formik.setFieldValue("applicable_slugs", next);
                          }}
                          className="w-5 h-5 rounded-lg accent-primary border-border cursor-pointer" />
                        <span className="text-xs text-text-muted font-bold group-hover:text-text truncate">{s.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-3 bg-bg-subtle/30">
              <button type="button" onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-text-muted hover:bg-bg-subtle transition-colors">
                {tShared.cancel}
              </button>
              <button type="submit" form="coupon-form" disabled={formik.isSubmitting}
                className="px-8 py-3 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
                {formik.isSubmitting ? <RiRefreshLine className="animate-spin text-lg" /> : <RiCheckLine className="text-lg" />}
                {t.form.submit}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
