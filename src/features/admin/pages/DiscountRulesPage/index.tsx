import { useState, useEffect } from "react";
import { RiPercentLine, RiMoneyDollarCircleLine, RiTicket2Line, RiUserLine, RiSaveLine, RiInformationLine } from "react-icons/ri";
import {
  DEFAULT_DISCOUNT_RULES,
  fetchOfficeDiscountRules,
  saveOfficeDiscountRules,
} from "@features/admin/services/discountRulesService";
import type { DiscountRules } from "@features/admin/types";
import { useAuth } from "@shared/hooks/useAuth";
import { fetchOfficeByOwner } from "@features/offices/services/officeOps";
import { Switch } from "@shared/components/atoms/switch";
import { Input } from "@shared/components/atoms/input";
import { Label } from "@shared/components/atoms/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@shared/components/atoms/tooltip";
import { toast } from "sonner";
import { useT } from "@app/app/i18n";

function FieldInfo({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={text}
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg-subtle hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <RiInformationLine size={14} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

function FieldLabel({ label, info }: { label: string; info: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Label className="text-xs">{label}</Label>
      <FieldInfo text={info} />
    </div>
  );
}

function RuleCard({ icon, title, description, children }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <p className="text-sm font-black text-text">{title}</p>
          <p className="text-xs text-text-muted mt-0.5">{description}</p>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function NumericInput({
  label, info, value, onChange, placeholder = "No limit", suffix, min = 0, blankFieldText,
}: {
  label: string;
  info: string;
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder?: string;
  suffix?: string;
  min?: number;
  blankFieldText?: string;
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel label={label} info={info} />
      <div className="relative">
        <Input
          type="number"
          min={min}
          placeholder={placeholder}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          className={suffix ? "pr-12" : ""}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">
            {suffix}
          </span>
        )}
      </div>
      {value === null && blankFieldText && (
        <p className="text-[10px] text-text-muted">{blankFieldText}</p>
      )}
    </div>
  );
}

export default function DiscountRulesPage() {
  const t = useT("admin");
  const { user } = useAuth();
  const [officeId, setOfficeId] = useState<string | null>(null);
  const [rules, setRules] = useState<DiscountRules>(DEFAULT_DISCOUNT_RULES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const office = await fetchOfficeByOwner(user.id);
        if (!office) { setIsLoading(false); return; }
        setOfficeId(office.id);
        setRules(await fetchOfficeDiscountRules(office.id));
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [user?.id]);

  const save = async () => {
    if (!officeId) { toast.error(t.discountRules.messages.officeNotFound); return; }
    setIsSaving(true);
    try {
      await saveOfficeDiscountRules(officeId, rules);
      toast.success(t.discountRules.messages.saveSuccess);
    } catch {
      toast.error(t.discountRules.messages.saveError);
    } finally {
      setIsSaving(false);
    }
  };

  const set = <K extends keyof DiscountRules>(key: K, value: DiscountRules[K]) =>
    setRules((prev) => ({ ...prev, [key]: value }));

  if (isLoading) {
    return <div className="flex min-h-[40vh] items-center justify-center text-text-muted text-sm">{t.discountRules.loading}</div>;
  }

  if (!officeId) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-warning/30 bg-warning/5 p-6 text-sm text-warning font-medium">
          {t.discountRules.noOffice}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-6 p-6 pb-20 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight text-text">{t.discountRules.title}</h1>
          <p className="mt-1 text-sm text-text-muted">
            {t.discountRules.subtitle}
          </p>
        </div>
        <button
          onClick={save}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          <RiSaveLine size={16} />
          {isSaving ? t.discountRules.savingBtn : t.discountRules.saveBtn}
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-info/20 bg-info/5 p-4">
        <RiInformationLine className="text-info mt-0.5 shrink-0" size={16} />
        <p className="text-xs text-info leading-relaxed">
          {t.discountRules.infoBanner}
        </p>
      </div>

      {/* Tipo de desconto permitido */}
      <RuleCard
        icon={<RiPercentLine size={18} />}
        title={t.discountRules.types.title}
        description={t.discountRules.types.description}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-xl border border-border bg-bg-subtle px-4 py-3">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-text">{t.discountRules.types.percentageTitle}</p>
                <FieldInfo text={t.discountRules.types.percentageInfo} />
              </div>
              <p className="text-xs text-text-muted">{t.discountRules.types.percentageExample}</p>
            </div>
            <Switch
              checked={rules.seller_allow_percentage}
              onCheckedChange={(v) => set("seller_allow_percentage", v)}
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border bg-bg-subtle px-4 py-3">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-text">{t.discountRules.types.fixedTitle}</p>
                <FieldInfo text={t.discountRules.types.fixedInfo} />
              </div>
              <p className="text-xs text-text-muted">{t.discountRules.types.fixedExample}</p>
            </div>
            <Switch
              checked={rules.seller_allow_fixed}
              onCheckedChange={(v) => set("seller_allow_fixed", v)}
            />
          </div>
        </div>
      </RuleCard>

      {/* Limites de valor */}
      <RuleCard
        icon={<RiMoneyDollarCircleLine size={18} />}
        title={t.discountRules.valueLimits.title}
        description={t.discountRules.valueLimits.description}
      >
        <div className="grid grid-cols-2 gap-4">
          <NumericInput
            label={t.discountRules.valueLimits.maxPctLabel}
            info={t.discountRules.valueLimits.maxPctInfo}
            value={rules.seller_max_pct}
            onChange={(v) => set("seller_max_pct", v)}
            placeholder={t.discountRules.valueLimits.noLimit}
            suffix="%"
            min={0}
            blankFieldText={t.discountRules.blankFieldNoLimit}
          />
          <NumericInput
            label={t.discountRules.valueLimits.maxFixedLabel}
            info={t.discountRules.valueLimits.maxFixedInfo}
            value={rules.seller_max_fixed}
            onChange={(v) => set("seller_max_fixed", v)}
            placeholder={t.discountRules.valueLimits.noLimit}
            suffix="US$"
            min={0}
            blankFieldText={t.discountRules.blankFieldNoLimit}
          />
        </div>
        <NumericInput
          label={t.discountRules.valueLimits.minPurchaseLabel}
          info={t.discountRules.valueLimits.minPurchaseInfo}
          value={rules.seller_min_purchase_usd}
          onChange={(v) => set("seller_min_purchase_usd", v)}
          placeholder={t.discountRules.valueLimits.noMinimum}
          suffix="US$"
          min={0}
          blankFieldText={t.discountRules.blankFieldNoLimit}
        />
      </RuleCard>

      {/* Limites de uso */}
      <RuleCard
        icon={<RiTicket2Line size={18} />}
        title={t.discountRules.usageLimits.title}
        description={t.discountRules.usageLimits.description}
      >
        <div className="grid grid-cols-2 gap-4">
          <NumericInput
            label={t.discountRules.usageLimits.maxUsesLabel}
            info={t.discountRules.usageLimits.maxUsesInfo}
            value={rules.seller_max_uses}
            onChange={(v) => set("seller_max_uses", v)}
            placeholder={t.discountRules.usageLimits.unlimited}
            min={1}
            blankFieldText={t.discountRules.blankFieldNoLimit}
          />
          <NumericInput
            label={t.discountRules.usageLimits.maxCouponsLabel}
            info={t.discountRules.usageLimits.maxCouponsInfo}
            value={rules.seller_max_coupons}
            onChange={(v) => set("seller_max_coupons", v)}
            placeholder={t.discountRules.usageLimits.unlimited}
            min={1}
            blankFieldText={t.discountRules.blankFieldNoLimit}
          />
        </div>
      </RuleCard>

      {/* Preview das regras ativas */}
      <div className="rounded-2xl border border-border bg-bg-subtle p-5">
        <div className="flex items-center gap-2 mb-3">
          <RiUserLine className="text-text-muted" size={14} />
          <p className="text-xs font-black uppercase tracking-widest text-text-muted">{t.discountRules.summary.title}</p>
        </div>
        <ul className="space-y-1.5 text-xs text-text-muted">
          <li>
            • {t.discountRules.summary.types} 
            {[
              rules.seller_allow_percentage && t.discountRules.summary.percentage, 
              rules.seller_allow_fixed && t.discountRules.summary.fixed
            ].filter(Boolean).join(", ") || t.discountRules.summary.none}
          </li>
          <li>
            • {t.discountRules.summary.maxPct} 
            {rules.seller_max_pct != null ? `${rules.seller_max_pct}%` : t.discountRules.valueLimits.noLimit}
          </li>
          <li>
            • {t.discountRules.summary.maxFixed} 
            {rules.seller_max_fixed != null ? `US$ ${rules.seller_max_fixed}` : t.discountRules.valueLimits.noLimit}
          </li>
          <li>
            • {t.discountRules.summary.minPurchase} 
            {rules.seller_min_purchase_usd != null ? `US$ ${rules.seller_min_purchase_usd}` : t.discountRules.valueLimits.noMinimum}
          </li>
          <li>
            • {t.discountRules.summary.usesPerCoupon} 
            {rules.seller_max_uses != null ? rules.seller_max_uses : t.discountRules.usageLimits.unlimited}
          </li>
          <li>
            • {t.discountRules.summary.couponsPerSeller} 
            {rules.seller_max_coupons != null ? rules.seller_max_coupons : t.discountRules.usageLimits.unlimited}
          </li>
        </ul>
      </div>
    </div>
    </TooltipProvider>
  );
}
