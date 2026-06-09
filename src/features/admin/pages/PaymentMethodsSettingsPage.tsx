import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { CreditCard, Save, ShieldCheck, Link2, Link2Off, Loader2 } from "lucide-react";
import { DashboardPageHeader } from "@shared/components/organisms/DashboardUI";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter, Switch, Button, Input, Textarea, Label, Badge } from "@shared/components/atoms";
import { useT } from "@app/app/i18n";
import { useAuth } from "@shared/hooks/useAuth";
import {
  createStripeConnectUrl,
  disconnectStripeAccount,
  handleStripeConnectCallback,
} from "@features/admin/services/stripeConnectService";
import { usePaymentSettings } from "@features/payments/hooks/usePaymentSettings";
import type { StripeConfig, ZelleConfig, ParcelowConfig } from "@features/payments/types";
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
  const t = useT("admin");
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

  const masked = "••••••••••••••••••••••••";

  return (
    <div className="space-y-2 text-left">
      <div className="flex items-center justify-between">
        <label className="text-sm font-black text-text-muted uppercase tracking-widest">{label}</label>
        {hasSavedValue && !editing && !disabled && (
          <button
            type="button"
            onClick={handleEdit}
            className="text-xs font-bold text-primary hover:underline uppercase tracking-tight"
          >
            {t.paymentMethods.shared.change}
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
          className="w-full rounded-xl border border-border bg-bg-subtle px-3 py-3 text-sm font-medium text-text focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 transition-all"
        />
      ) : (
        <div className="flex items-center rounded-xl border border-border bg-bg-subtle px-3 py-3 text-sm font-mono text-text-muted select-none">
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
          ? t.paymentMethods.aplikei.activeSuccess
          : t.paymentMethods.aplikei.inactiveSuccess
      );
    } catch (err: unknown) {
      setUseAplicei(!value);
      toast.error(`${t.paymentMethods.aplikei.saveError}${err instanceof Error ? err.message : t.shared.error}`);
    } finally {
      setSavingAplicei(false);
    }
  };

  const [searchParams, setSearchParams] = useSearchParams();

  // Stripe Connect State
  const [stripeActive, setStripeActive] = useState(false);
  const [stripeConfig, setStripeConfig] = useState<StripeConfig>({ client_id: "", account_id: "" });
  const [stripeConnecting, setStripeConnecting] = useState(false);
  const [stripeDisconnecting, setStripeDisconnecting] = useState(false);

  const isStripeConnected = Boolean(stripeConfig.account_id === "__REDACTED__" || (stripeConfig.account_id && stripeConfig.account_id !== "__REDACTED__"));

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

  const handleToggleStripe = async (value: boolean) => {
    setStripeActive(value);
    try {
      await saveSetting({ provider: "stripe", is_active: value, config: stripeConfig });
    } catch {
      setStripeActive(!value);
      toast.error(t.paymentMethods.stripe.messages.statusError);
    }
  };

  const handleToggleZelle = async (value: boolean) => {
    setZelleActive(value);
    try {
      await saveSetting({ provider: "zelle", is_active: value, config: zelleConfig });
    } catch {
      setZelleActive(!value);
      toast.error(t.paymentMethods.zelle.messages.statusError);
    }
  };

  const handleToggleParcelow = async (value: boolean) => {
    setParcelowActive(value);
    try {
      await saveSetting({ provider: "parcelow", is_active: value, config: parcelowConfig });
    } catch {
      setParcelowActive(!value);
      toast.error(t.paymentMethods.parcelow.messages.statusError);
    }
  };

  useEffect(() => {
    if (settings) {
      const stripe = settings.find((s) => s.provider === "stripe");
      if (stripe) {
        setStripeActive(stripe.is_active);
        const cfg = stripe.config as StripeConfig;
        setStripeConfig({
          client_id: cfg.client_id || "",
          account_id: cfg.account_id ? "__REDACTED__" : "",
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

  // Handle Stripe Connect OAuth callback (code + state in URL)
  useEffect(() => {
    const code = searchParams.get("stripe_code") || searchParams.get("code");
    const state = searchParams.get("state");
    if (!code || !state || !user?.id) return;

    const exchange = async () => {
      setStripeConnecting(true);
      try {
        await handleStripeConnectCallback({ code, state });
        setStripeConfig((prev) => ({ ...prev, account_id: "__REDACTED__" }));
        setStripeActive(true);
        toast.success(t.paymentMethods.stripe.messages.connectSuccess);
      } catch (err: unknown) {
        toast.error(`${t.paymentMethods.stripe.messages.connectError}${err instanceof Error ? err.message : t.shared.error}`);
      } finally {
        setStripeConnecting(false);
        // Remove OAuth params from URL
        const next = new URLSearchParams(searchParams);
        next.delete("code");
        next.delete("stripe_code");
        next.delete("state");
        setSearchParams(next, { replace: true });
      }
    };
    void exchange();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const handleStripeConnect = async () => {
    if (!user?.id) return;
    if (!stripeConfig.client_id.trim()) {
      toast.error(t.paymentMethods.stripe.messages.missingClientId);
      return;
    }
    setStripeConnecting(true);
    try {
      const redirectUri = `${window.location.origin}/settings/payment-methods`;
      const url = await createStripeConnectUrl({
        userId: user.id,
        clientId: stripeConfig.client_id.trim(),
        redirectUri,
      });
      window.location.href = url;
    } catch (err: unknown) {
      toast.error(`${t.paymentMethods.stripe.messages.initError}${err instanceof Error ? err.message : t.shared.error}`);
      setStripeConnecting(false);
    }
  };

  const handleStripeDisconnect = async () => {
    if (!user?.id) return;
    setStripeDisconnecting(true);
    try {
      await disconnectStripeAccount(user.id);
      setStripeConfig((prev) => ({ ...prev, account_id: "" }));
      setStripeActive(false);
      toast.success(t.paymentMethods.stripe.messages.disconnectSuccess);
    } catch (err: unknown) {
      toast.error(`${t.paymentMethods.stripe.messages.disconnectError}${err instanceof Error ? err.message : t.shared.error}`);
    } finally {
      setStripeDisconnecting(false);
    }
  };

  const handleSaveZelle = async () => {
    if (zelleActive && !zelleConfig.email && !zelleConfig.phone) {
      toast.error(t.paymentMethods.zelle.messages.missingFields);
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
      toast.error(t.paymentMethods.parcelow.messages.missingFields);
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

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl pb-10">
      <DashboardPageHeader
        eyebrow={t.nav.settings}
        title={t.paymentMethods.title}
        description={t.paymentMethods.subtitle}
      />

      {/* APLIKEI CARD */}
      <div className={`rounded-[24px] border-2 p-6 flex items-center justify-between gap-6 transition-all shadow-sm ${
        useAplicei
          ? "border-success bg-success/5 shadow-success/10"
          : "border-border bg-card"
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
            useAplicei ? "bg-success/15 text-success" : "bg-bg-subtle text-text-muted"
          }`}>
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="text-left">
            <p className="font-black text-text text-sm uppercase tracking-tight">{t.paymentMethods.aplikei.title}</p>
            <p className="text-xs text-text-muted mt-0.5 font-medium">
              {useAplicei
                ? t.paymentMethods.aplikei.activeDesc
                : t.paymentMethods.aplikei.inactiveDesc}
            </p>
          </div>
        </div>
        <Switch
          checked={useAplicei}
          onCheckedChange={handleToggleAplicei}
          disabled={savingAplicei}
        />
      </div>

      <div className={`grid gap-6 transition-all duration-500 ${useAplicei ? "opacity-30 grayscale pointer-events-none select-none blur-[1px]" : ""}`}>
        {/* STRIPE CARD */}
        <Card className="overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-bg-subtle/30 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
                <CreditCard className="h-6 w-6" />
              </div>
              <div className="text-left">
                <CardTitle className="uppercase tracking-tight font-black">{t.paymentMethods.stripe.title}</CardTitle>
                <CardDescription className="font-medium">{t.paymentMethods.stripe.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={stripeActive ? "default" : "secondary"} className="uppercase font-black text-[10px] tracking-widest px-3 py-1">
                {stripeActive ? t.paymentMethods.shared.active : t.paymentMethods.shared.inactive}
              </Badge>
              <Switch checked={stripeActive} onCheckedChange={handleToggleStripe} />
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {!isStripeConnected && (
              <div className="mb-6 space-y-4 text-left">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-text-muted uppercase tracking-widest">
                    {t.paymentMethods.stripe.clientId}
                  </Label>
                  <Input
                    placeholder="ca_..."
                    value={stripeConfig.client_id}
                    onChange={(e) => setStripeConfig({ ...stripeConfig, client_id: e.target.value })}
                    className="font-mono text-sm h-12 rounded-xl"
                  />
                  <p className="text-[11px] text-text-muted font-bold italic">
                    {t.paymentMethods.stripe.clientIdHint}
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-bg-subtle/50 p-5 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">{t.paymentMethods.stripe.redirectUri}</p>
                  <div className="flex items-center justify-between gap-3 p-3 bg-card border border-border rounded-xl">
                    <p className="text-xs font-mono text-text break-all select-all font-bold">
                      {`${window.location.origin}/settings/payment-methods`}
                    </p>
                  </div>
                  <p className="text-[10px] text-text-muted font-bold italic">
                    {t.paymentMethods.stripe.redirectUriHint}
                  </p>
                </div>
              </div>
            )}

            {isStripeConnected ? (
              <div className="flex items-center justify-between rounded-2xl border border-success/30 bg-success/5 px-6 py-5 shadow-inner">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/15 text-success shadow-sm">
                    <Link2 className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-text uppercase tracking-tight">{t.paymentMethods.stripe.connected}</p>
                    <p className="text-xs text-text-muted mt-0.5 font-medium">{t.paymentMethods.stripe.connectedDesc}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleStripeDisconnect}
                  disabled={stripeDisconnecting}
                  className="h-11 px-6 rounded-xl text-danger border-danger/30 hover:bg-danger/10 font-bold uppercase text-xs tracking-widest"
                >
                  {stripeDisconnecting
                    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    : <Link2Off className="mr-2 h-4 w-4" />}
                  {t.paymentMethods.stripe.disconnectBtn}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 py-8 text-center bg-bg-subtle/30 rounded-3xl border border-dashed border-border">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xl shadow-primary/5">
                  <CreditCard className="h-8 w-8" />
                </div>
                <div>
                  <p className="font-black text-text uppercase tracking-tight text-lg">{t.paymentMethods.stripe.connectTitle}</p>
                  <p className="mt-2 text-sm text-text-muted max-w-sm font-medium">
                    {t.paymentMethods.stripe.connectDesc}
                  </p>
                </div>
                <Button onClick={handleStripeConnect} disabled={stripeConnecting} className="h-12 px-10 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20">
                  {stripeConnecting
                    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    : <Link2 className="mr-2 h-4 w-4" />}
                  {stripeConnecting ? t.paymentMethods.stripe.redirecting : t.paymentMethods.stripe.connectBtn}
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t border-border/50 bg-bg-subtle/10 px-8 py-4">
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest opacity-60">
              {t.paymentMethods.stripe.footerHint}
            </p>
          </CardFooter>
        </Card>

        {/* ZELLE CARD */}
        <Card className="overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-bg-subtle/30 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-info/10 text-info shadow-sm">
                <CreditCard className="h-6 w-6" />
              </div>
              <div className="text-left">
                <CardTitle className="uppercase tracking-tight font-black">{t.paymentMethods.zelle.title}</CardTitle>
                <CardDescription className="font-medium">{t.paymentMethods.zelle.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={zelleActive ? "default" : "secondary"} className="uppercase font-black text-[10px] tracking-widest px-3 py-1">
                {zelleActive ? t.paymentMethods.shared.active : t.paymentMethods.shared.inactive}
              </Badge>
              <Switch checked={zelleActive} onCheckedChange={handleToggleZelle} />
            </div>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div className="grid gap-6 md:grid-cols-3">
              <MaskedField
                label={t.paymentMethods.zelle.recipientName}
                value={zelleConfig.recipient_name}
                onChange={(v) => setZelleConfig({ ...zelleConfig, recipient_name: v })}
              />
              <MaskedField
                label={t.paymentMethods.zelle.email}
                value={zelleConfig.email}
                onChange={(v) => setZelleConfig({ ...zelleConfig, email: v })}
              />
              <MaskedField
                label={t.paymentMethods.zelle.phone}
                value={zelleConfig.phone}
                onChange={(v) => setZelleConfig({ ...zelleConfig, phone: v })}
              />
            </div>
            <div className="space-y-3 text-left">
              <Label className="text-xs font-black text-text-muted uppercase tracking-widest">{t.paymentMethods.zelle.instructions}</Label>
              <Textarea
                placeholder={t.paymentMethods.zelle.instructionsPlaceholder}
                className="min-h-[120px] rounded-2xl bg-bg-subtle p-4 border-border font-medium text-sm transition-all focus:ring-2 focus:ring-primary/20"
                value={zelleConfig.instructions}
                onChange={(e) => setZelleConfig({ ...zelleConfig, instructions: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-border/50 bg-bg-subtle/10 px-8 py-5">
            <Button onClick={handleSaveZelle} disabled={isSaving} className="h-11 px-8 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/10">
              <Save className="mr-2 h-4 w-4" />
              {t.shared.save}
            </Button>
          </CardFooter>
        </Card>

        {/* PARCELOW CARD */}
        <Card className="overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-bg-subtle/30 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning/10 text-warning shadow-sm">
                <CreditCard className="h-6 w-6" />
              </div>
              <div className="text-left">
                <CardTitle className="uppercase tracking-tight font-black">{t.paymentMethods.parcelow.title}</CardTitle>
                <CardDescription className="font-medium">{t.paymentMethods.parcelow.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={parcelowActive ? "default" : "secondary"} className="uppercase font-black text-[10px] tracking-widest px-3 py-1">
                {parcelowActive ? t.paymentMethods.shared.active : t.paymentMethods.shared.inactive}
              </Badge>
              <Switch checked={parcelowActive} onCheckedChange={handleToggleParcelow} />
            </div>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div className="grid gap-6 md:grid-cols-2">
              <MaskedField
                label={t.paymentMethods.parcelow.accountIdentifier}
                placeholder="merchant_..."
                value={parcelowConfig.account_identifier}
                onChange={(v) => setParcelowConfig({ ...parcelowConfig, account_identifier: v })}
              />
              <MaskedField
                label={t.paymentMethods.parcelow.checkoutLink}
                placeholder="https://..."
                value={parcelowConfig.checkout_link}
                onChange={(v) => setParcelowConfig({ ...parcelowConfig, checkout_link: v })}
              />
            </div>
            <div className="space-y-3 text-left">
              <Label className="text-xs font-black text-text-muted uppercase tracking-widest">{t.paymentMethods.parcelow.instructions}</Label>
              <Textarea
                placeholder={t.paymentMethods.parcelow.instructionsPlaceholder}
                className="min-h-[120px] rounded-2xl bg-bg-subtle p-4 border-border font-medium text-sm transition-all focus:ring-2 focus:ring-primary/20"
                value={parcelowConfig.instructions}
                onChange={(e) => setParcelowConfig({ ...parcelowConfig, instructions: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-border/50 bg-bg-subtle/10 px-8 py-5">
            <Button onClick={handleSaveParcelow} disabled={isSaving} className="h-11 px-8 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/10">
              <Save className="mr-2 h-4 w-4" />
              {t.shared.save}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
