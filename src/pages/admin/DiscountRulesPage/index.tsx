import { useState, useEffect } from "react";
import { RiPercentLine, RiMoneyDollarCircleLine, RiTicket2Line, RiUserLine, RiSaveLine, RiInformationLine } from "react-icons/ri";
import { supabase } from "../../../shared/lib/supabase";
import { useAuth } from "../../../hooks/useAuth";
import { fetchOfficeByOwner } from "../../../features/admin/roles/lib/officeOps";
import { Switch } from "../../../components/atoms/switch";
import { Input } from "../../../components/atoms/input";
import { Label } from "../../../components/atoms/label";
import { toast } from "sonner";

interface DiscountRules {
  seller_max_pct: number | null;
  seller_max_fixed: number | null;
  seller_allow_percentage: boolean;
  seller_allow_fixed: boolean;
  seller_max_coupons: number | null;
  seller_max_uses: number | null;
  seller_min_purchase_usd: number | null;
}

const DEFAULTS: DiscountRules = {
  seller_max_pct: 20,
  seller_max_fixed: 50,
  seller_allow_percentage: true,
  seller_allow_fixed: false,
  seller_max_coupons: null,
  seller_max_uses: null,
  seller_min_purchase_usd: null,
};

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
  label, value, onChange, placeholder = "Sem limite", suffix, min = 0,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder?: string;
  suffix?: string;
  min?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
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
      {value === null && (
        <p className="text-[10px] text-text-muted">Campo vazio = sem limite</p>
      )}
    </div>
  );
}

export default function DiscountRulesPage() {
  const { user } = useAuth();
  const [officeId, setOfficeId] = useState<string | null>(null);
  const [rules, setRules] = useState<DiscountRules>(DEFAULTS);
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

        const { data } = await supabase
          .from("offices")
          .select("discount_rules")
          .eq("id", office.id)
          .single();

        if (data?.discount_rules && Object.keys(data.discount_rules).length > 0) {
          setRules({ ...DEFAULTS, ...(data.discount_rules as Partial<DiscountRules>) });
        }
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [user?.id]);

  const save = async () => {
    if (!officeId) { toast.error("Escritório não encontrado."); return; }
    setIsSaving(true);
    const { error } = await supabase
      .from("offices")
      .update({ discount_rules: rules })
      .eq("id", officeId);
    setIsSaving(false);
    if (error) toast.error("Erro ao salvar regras.");
    else toast.success("Regras de desconto salvas.");
  };

  const set = <K extends keyof DiscountRules>(key: K, value: DiscountRules[K]) =>
    setRules((prev) => ({ ...prev, [key]: value }));

  if (isLoading) {
    return <div className="flex min-h-[40vh] items-center justify-center text-text-muted text-sm">Carregando...</div>;
  }

  if (!officeId) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-warning/30 bg-warning/5 p-6 text-sm text-warning font-medium">
          Você ainda não tem um escritório cadastrado. Configure um escritório primeiro.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 pb-20 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight text-text">Regras de Desconto</h1>
          <p className="mt-1 text-sm text-text-muted">
            Defina os limites de desconto que seus sellers podem oferecer.
          </p>
        </div>
        <button
          onClick={save}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          <RiSaveLine size={16} />
          {isSaving ? "Salvando..." : "Salvar"}
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-info/20 bg-info/5 p-4">
        <RiInformationLine className="text-info mt-0.5 shrink-0" size={16} />
        <p className="text-xs text-info leading-relaxed">
          Estas regras se aplicam exclusivamente aos sellers do seu escritório ao criar cupons de desconto.
          Campos em branco significam sem restrição.
        </p>
      </div>

      {/* Tipo de desconto permitido */}
      <RuleCard
        icon={<RiPercentLine size={18} />}
        title="Tipos de desconto permitidos"
        description="Quais modalidades de desconto o seller pode oferecer."
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-xl border border-border bg-bg-subtle px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-text">Desconto percentual (%)</p>
              <p className="text-xs text-text-muted">Ex: 10% de desconto</p>
            </div>
            <Switch
              checked={rules.seller_allow_percentage}
              onCheckedChange={(v) => set("seller_allow_percentage", v)}
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border bg-bg-subtle px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-text">Desconto fixo (US$)</p>
              <p className="text-xs text-text-muted">Ex: $50 de desconto</p>
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
        title="Limites de valor de desconto"
        description="Teto máximo que o seller pode configurar em cada tipo."
      >
        <div className="grid grid-cols-2 gap-4">
          <NumericInput
            label="Desconto máximo (%)"
            value={rules.seller_max_pct}
            onChange={(v) => set("seller_max_pct", v)}
            placeholder="Sem limite"
            suffix="%"
            min={0}
          />
          <NumericInput
            label="Desconto máximo (fixo)"
            value={rules.seller_max_fixed}
            onChange={(v) => set("seller_max_fixed", v)}
            placeholder="Sem limite"
            suffix="US$"
            min={0}
          />
        </div>
        <NumericInput
          label="Compra mínima para usar cupom (US$)"
          value={rules.seller_min_purchase_usd}
          onChange={(v) => set("seller_min_purchase_usd", v)}
          placeholder="Sem mínimo"
          suffix="US$"
          min={0}
        />
      </RuleCard>

      {/* Limites de uso */}
      <RuleCard
        icon={<RiTicket2Line size={18} />}
        title="Limites de uso dos cupons"
        description="Controle quantos cupons e usos cada seller pode gerar."
      >
        <div className="grid grid-cols-2 gap-4">
          <NumericInput
            label="Máx. usos por cupom"
            value={rules.seller_max_uses}
            onChange={(v) => set("seller_max_uses", v)}
            placeholder="Ilimitado"
            min={1}
          />
          <NumericInput
            label="Máx. cupons por seller"
            value={rules.seller_max_coupons}
            onChange={(v) => set("seller_max_coupons", v)}
            placeholder="Ilimitado"
            min={1}
          />
        </div>
      </RuleCard>

      {/* Preview das regras ativas */}
      <div className="rounded-2xl border border-border bg-bg-subtle p-5">
        <div className="flex items-center gap-2 mb-3">
          <RiUserLine className="text-text-muted" size={14} />
          <p className="text-xs font-black uppercase tracking-widest text-text-muted">Resumo das regras ativas</p>
        </div>
        <ul className="space-y-1.5 text-xs text-text-muted">
          <li>• Tipos: {[rules.seller_allow_percentage && "Percentual", rules.seller_allow_fixed && "Fixo"].filter(Boolean).join(", ") || "Nenhum"}</li>
          <li>• Desconto % máximo: {rules.seller_max_pct != null ? `${rules.seller_max_pct}%` : "Sem limite"}</li>
          <li>• Desconto fixo máximo: {rules.seller_max_fixed != null ? `US$ ${rules.seller_max_fixed}` : "Sem limite"}</li>
          <li>• Compra mínima: {rules.seller_min_purchase_usd != null ? `US$ ${rules.seller_min_purchase_usd}` : "Sem mínimo"}</li>
          <li>• Usos por cupom: {rules.seller_max_uses != null ? rules.seller_max_uses : "Ilimitado"}</li>
          <li>• Cupons por seller: {rules.seller_max_coupons != null ? rules.seller_max_coupons : "Ilimitado"}</li>
        </ul>
      </div>
    </div>
  );
}
