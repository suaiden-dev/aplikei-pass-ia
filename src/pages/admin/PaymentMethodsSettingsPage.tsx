import { useState, useEffect, useRef } from "react";
import { CreditCard, Save, ShieldCheck } from "lucide-react";
import { DashboardPageHeader, DashboardSection, StatusBadge } from "../../components/organisms/DashboardUI";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter, Switch, Button, Input, Textarea, Label, Badge } from "../../components/atoms";
import { Field } from "../../components/molecules/Field";
import { useT } from "../../i18n";
import { useAuth } from "../../hooks/useAuth";
import { usePaymentSettings } from "../../features/payment/hooks/usePaymentSettings";
import type { StripeConfig, ZelleConfig, ParcelowConfig, PaymentMethodConfig } from "../../features/payment/types";
import { toast } from "sonner";

function MaskedField({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isRedacted = value === "__REDACTED__";
  const hasSavedValue = value.length > 0;

  const handleEdit = () => {
    // Clear the sentinel so the user types a fresh value
    if (isRedacted) onChange("");
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const masked = "acct_••••••••••••••••";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-text">{label}</label>
        {hasSavedValue && !editing && !disabled && (
          <button
            type="button"
            onClick={handleEdit}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Alterar
          </button>
        )}
      </div>
      {(editing && !isRedacted) || !hasSavedValue ? (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => { if (value.length > 0) setEditing(false); }}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-xl border border-border bg-bg-subtle px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
        />
      ) : (
        <div className="flex items-center rounded-xl border border-border bg-bg-subtle px-3 py-2 text-sm font-mono text-text-muted select-none">
          {masked}
        </div>
      )}
    </div>
  );
}

export default function PaymentMethodsSettingsPage() {
  const t = useT("admin");
  const { user } = useAuth();
  const { settings, isLoading, saveSetting, isSaving } = usePaymentSettings(user?.id);

  // Aplikei accounts override
  const [useAplicei, setUseAplicei] = useState(false);
  const [savingAplicei, setSavingAplicei] = useState(false);

  const handleToggleAplicei = async (value: boolean) => {
    setUseAplicei(value);
    setSavingAplicei(true);
    try {
      await saveSetting({ provider: "aplikei", is_active: value, config: {} });
      toast.success(
        value
          ? "Pagamentos serão processados pela Aplikei."
          : "Suas contas próprias estão ativas novamente."
      );
    } catch (err: unknown) {
      setUseAplicei(!value);
      toast.error(`Erro ao salvar: ${err instanceof Error ? err.message : "tente novamente"}`);
    } finally {
      setSavingAplicei(false);
    }
  };

  // Stripe State
  const [stripeActive, setStripeActive] = useState(false);
  const [stripeConfig, setStripeConfig] = useState<StripeConfig>({
    stripe_account_id: "",
    connection_status: "disconnected",
  });

  // Zelle State
  const [zelleActive, setZelleActive] = useState(false);
  const [zelleConfig, setZelleConfig] = useState<ZelleConfig>({
    recipient_name: "",
    email: "",
    phone: "",
    instructions: "",
  });

  // Parcelow State
  const [parcelowActive, setParcelowActive] = useState(false);
  const [parcelowConfig, setParcelowConfig] = useState<ParcelowConfig>({
    account_identifier: "",
    checkout_link: "",
    instructions: "",
  });

  useEffect(() => {
    if (settings) {
      const stripe = settings.find((s) => s.provider === "stripe");
      if (stripe) {
        setStripeActive(stripe.is_active);
        const cfg = stripe.config as StripeConfig;
        setStripeConfig({
          ...cfg,
          // Never expose the real account ID to the frontend — use a sentinel
          stripe_account_id: cfg.stripe_account_id ? "__REDACTED__" : "",
        });
      }

      const zelle = settings.find((s) => s.provider === "zelle");
      if (zelle) {
        setZelleActive(zelle.is_active);
        setZelleConfig(zelle.config as ZelleConfig);
      }

      const parcelow = settings.find((s) => s.provider === "parcelow");
      if (parcelow) {
        setParcelowActive(parcelow.is_active);
        setParcelowConfig(parcelow.config as ParcelowConfig);
      }

      const aplikei = settings.find((s) => s.provider === "aplikei");
      if (aplikei) setUseAplicei(aplikei.is_active);
    }
  }, [settings]);

  const handleSaveStripe = async () => {
    try {
      const config: StripeConfig = { ...stripeConfig };
      // If the user didn't change the account ID, omit it from the update
      // so the real value stored in the DB is preserved
      if (config.stripe_account_id === "__REDACTED__") {
        delete (config as Partial<StripeConfig>).stripe_account_id;
      }
      await saveSetting({
        provider: "stripe",
        is_active: stripeActive,
        config,
      });
      toast.success(t.paymentMethods.saveSuccess);
    } catch {
      toast.error("Erro ao salvar configuração do Stripe.");
    }
  };

  const handleSaveZelle = async () => {
    if (zelleActive && !zelleConfig.email && !zelleConfig.phone) {
      toast.error("Zelle exige e-mail ou telefone quando ativo.");
      return;
    }
    try {
      await saveSetting({
        provider: "zelle",
        is_active: zelleActive,
        config: zelleConfig,
      });
      toast.success(t.paymentMethods.saveSuccess);
    } catch (err) {}
  };

  const handleSaveParcelow = async () => {
    if (parcelowActive && (!parcelowConfig.account_identifier || !parcelowConfig.checkout_link)) {
      toast.error("Parcelow exige identificador e link quando ativo.");
      return;
    }
    try {
      await saveSetting({
        provider: "parcelow",
        is_active: parcelowActive,
        config: parcelowConfig,
      });
      toast.success(t.paymentMethods.saveSuccess);
    } catch (err) {}
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Configurações"
        title={t.paymentMethods.title}
        description={t.paymentMethods.subtitle}
      />

      {/* APLIKEI CARD */}
      <div className={`rounded-2xl border-2 p-6 flex items-center justify-between gap-6 transition-colors ${
        useAplicei
          ? "border-success bg-success/5"
          : "border-border bg-card"
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            useAplicei ? "bg-success/15 text-success" : "bg-bg-subtle text-text-muted"
          }`}>
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-text text-sm">Receber pela Aplikei</p>
            <p className="text-xs text-text-muted mt-0.5">
              {useAplicei
                ? "Todos os pagamentos são processados pelas contas da Aplikei."
                : "Ative para usar as contas da Aplikei no lugar das suas."}
            </p>
          </div>
        </div>
        <Switch
          checked={useAplicei}
          onCheckedChange={handleToggleAplicei}
          disabled={savingAplicei}
        />
      </div>

      <div className={`grid gap-6 transition-opacity ${useAplicei ? "opacity-40 pointer-events-none select-none" : ""}`}>
        {/* STRIPE CARD */}
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card to-primary/5">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-card/50 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>{t.paymentMethods.stripe.title}</CardTitle>
                <CardDescription>{t.paymentMethods.stripe.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={stripeActive ? "default" : "secondary"}>
                {stripeActive ? "Active" : "Inactive"}
              </Badge>
              <Switch checked={stripeActive} onCheckedChange={setStripeActive} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <MaskedField
              label={t.paymentMethods.stripe.accountId}
              placeholder="acct_..."
              value={stripeConfig.stripe_account_id}
              onChange={(v) => setStripeConfig({ ...stripeConfig, stripe_account_id: v })}
              disabled={stripeActive}
            />
          </CardContent>
          <CardFooter className="flex justify-end border-t border-border/50 bg-card/50 px-6 py-4">
            <Button onClick={handleSaveStripe} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {t.shared.save}
            </Button>
          </CardFooter>
        </Card>

        {/* ZELLE CARD */}
        <Card className="overflow-hidden border-info/20 bg-gradient-to-br from-card to-info/5">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-card/50 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10 text-info">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>{t.paymentMethods.zelle.title}</CardTitle>
                <CardDescription>{t.paymentMethods.zelle.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={zelleActive ? "default" : "secondary"}>
                {zelleActive ? "Active" : "Inactive"}
              </Badge>
              <Switch checked={zelleActive} onCheckedChange={setZelleActive} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Field
                label={t.paymentMethods.zelle.recipientName}
                value={zelleConfig.recipient_name}
                onChange={(e) => setZelleConfig({ ...zelleConfig, recipient_name: e.target.value })}
              />
              <Field
                label={t.paymentMethods.zelle.email}
                type="email"
                value={zelleConfig.email}
                onChange={(e) => setZelleConfig({ ...zelleConfig, email: e.target.value })}
              />
              <Field
                label={t.paymentMethods.zelle.phone}
                value={zelleConfig.phone}
                onChange={(e) => setZelleConfig({ ...zelleConfig, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.paymentMethods.zelle.instructions}</Label>
              <Textarea
                placeholder={t.paymentMethods.zelle.instructionsPlaceholder}
                className="min-h-[100px] rounded-2xl"
                value={zelleConfig.instructions}
                onChange={(e) => setZelleConfig({ ...zelleConfig, instructions: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-border/50 bg-card/50 px-6 py-4">
            <Button onClick={handleSaveZelle} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {t.shared.save}
            </Button>
          </CardFooter>
        </Card>

        {/* PARCELOW CARD */}
        <Card className="overflow-hidden border-amber-500/20 bg-gradient-to-br from-card to-amber-500/5">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-card/50 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>{t.paymentMethods.parcelow.title}</CardTitle>
                <CardDescription>{t.paymentMethods.parcelow.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={parcelowActive ? "default" : "secondary"}>
                {parcelowActive ? "Active" : "Inactive"}
              </Badge>
              <Switch checked={parcelowActive} onCheckedChange={setParcelowActive} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Field
                label={t.paymentMethods.parcelow.accountIdentifier}
                placeholder="merchant_..."
                value={parcelowConfig.account_identifier}
                onChange={(e) => setParcelowConfig({ ...parcelowConfig, account_identifier: e.target.value })}
              />
              <Field
                label={t.paymentMethods.parcelow.checkoutLink}
                placeholder="https://..."
                value={parcelowConfig.checkout_link}
                onChange={(e) => setParcelowConfig({ ...parcelowConfig, checkout_link: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.paymentMethods.parcelow.instructions}</Label>
              <Textarea
                placeholder={t.paymentMethods.parcelow.instructionsPlaceholder}
                className="min-h-[100px] rounded-2xl"
                value={parcelowConfig.instructions}
                onChange={(e) => setParcelowConfig({ ...parcelowConfig, instructions: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-border/50 bg-card/50 px-6 py-4">
            <Button onClick={handleSaveParcelow} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {t.shared.save}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
