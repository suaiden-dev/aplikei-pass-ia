
import * as React from "react";
import { 
  Building2, 
  Save, 
  Loader2, 
  Landmark, 
  Wallet,
  ArrowDownCircle,
  CreditCard,
  Mail,
  QrCode,
  Link as LinkIcon,
  Zap,
  Info
} from "lucide-react";
import { supabase } from "@shared/lib/supabase";
import { useAuth } from "@shared/hooks/useAuth";
import { Button } from "@shared/components/atoms/button";
import { Input } from "@shared/components/atoms/input";
import { Label } from "@shared/components/atoms/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/atoms/card";
import { Switch } from "@shared/components/atoms/switch";
import { DashboardPageHeader } from "@shared/components/organisms/DashboardUI";
import { toast } from "sonner";
import { useT } from "@app/app/i18n";

interface PaymentSettings {
  id?: string;
  office_id: string;
  default_payout_method: string;
  stripe_enabled: boolean;
  zelle_enabled: boolean;
  zelle_name: string | null;
  zelle_identifier: string | null;
}

export default function PaymentSettingsPage() {
  const t = useT("admin");
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [settings, setSettings] = React.useState<PaymentSettings | null>(null);

  React.useEffect(() => {
    async function fetchSettings() {
      if (!user?.officeId) return;
      
      try {
        const { data, error } = await supabase
          .from("office_payment_settings")
          .select("id, office_id, default_payout_method, stripe_enabled, zelle_enabled, zelle_name, zelle_identifier")
          .eq("office_id", user.officeId)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setSettings({
            ...data,
            stripe_enabled: Boolean((data as any).stripe_enabled),
            zelle_enabled: Boolean((data as any).zelle_enabled),
          });
        } else {
          setSettings({
            office_id: user.officeId,
            default_payout_method: "stripe",
            stripe_enabled: false,
            zelle_enabled: false,
            zelle_name: "",
            zelle_identifier: ""
          });
        }
      } catch (err) {
        console.error("Error fetching payment settings:", err);
        toast.error(t?.payoutSettings?.messages?.loadError || "Error loading settings");
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, [user?.officeId, t]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !user?.officeId) return;
    if (!settings.stripe_enabled && !settings.zelle_enabled) {
      toast.error("Enable at least one withdrawal method before saving.");
      return;
    }

    setSaving(true);
    try {
      const defaultPayoutMethod =
        settings.default_payout_method === "zelle" && settings.zelle_enabled
          ? "zelle"
          : settings.stripe_enabled
          ? "stripe"
          : "zelle";

      const { error } = await supabase
        .from("office_payment_settings")
        .upsert({
          ...settings,
          default_payout_method: defaultPayoutMethod,
          office_id: user.officeId,
          updated_at: new Date().toISOString()
        }, { onConflict: 'office_id' });

      if (error) throw error;
      toast.success(t?.payoutSettings?.messages?.saveSuccess || "Settings saved!");
    } catch (err) {
      console.error("Error updating payment settings:", err);
      toast.error(t?.payoutSettings?.messages?.saveError || "Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const selectPayoutMethod = (method: "stripe" | "zelle", checked: boolean) => {
    setSettings((current) => current ? {
      ...current,
      default_payout_method: checked ? method : "",
      stripe_enabled: method === "stripe" ? checked : false,
      zelle_enabled: method === "zelle" ? checked : false,
    } : current);
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings) return null;

  const isStripeEnabled = Boolean(settings.stripe_enabled);
  const isZelleEnabled = Boolean(settings.zelle_enabled);
  const bothDisabled = !isStripeEnabled && !isZelleEnabled;

  return (
    <div className="space-y-6 max-w-5xl pb-10">
      <DashboardPageHeader
        eyebrow={t?.nav?.settings || "Settings"}
        title={t?.payoutSettings?.title || "Withdrawal Configuration"}
        description={t?.payoutSettings?.subtitle || "Configure your withdrawal preferences"}
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Method Selection Section */}
        <Card className="border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-bg-subtle/50 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Wallet className="h-5 w-5" />
              </div>
              <div className="text-left">
                <CardTitle className="uppercase">{t?.payoutSettings?.methodTitle || "Payout Method"}</CardTitle>
                <CardDescription>{t?.payoutSettings?.methodSubtitle || "Select how you want to be paid"}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-10 flex flex-col items-center justify-center space-y-8">
            <div className="w-full max-w-xl space-y-3 bg-bg-subtle/50 p-6 rounded-2xl border border-border">
              <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 text-[#635BFF]">
                  <CreditCard className="h-5 w-5" />
                  <span className="text-sm font-bold">Stripe</span>
                </div>
                <Switch
                  checked={isStripeEnabled}
                  onCheckedChange={(checked) => selectPayoutMethod("stripe", checked)}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 text-[#6D1ED1]">
                  <Zap className="h-5 w-5" />
                  <span className="text-sm font-bold">Zelle</span>
                </div>
                <Switch
                  checked={isZelleEnabled}
                  onCheckedChange={(checked) => selectPayoutMethod("zelle", checked)}
                />
              </div>
            </div>

            <div className="max-w-md w-full">
              {bothDisabled ? (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20 text-warning animate-in fade-in zoom-in-95 duration-300">
                  <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-center w-full">
                    Enable at least one withdrawal method and click save.
                  </p>
                </div>
              ) : isStripeEnabled ? (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-blue-600 animate-in fade-in zoom-in-95 duration-300">
                  <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-center w-full">
                    {t?.payoutSettings?.stripeInfo || "No configuration needed. You will provide your Stripe link during the withdrawal process."}
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-[#6D1ED1]/5 border border-[#6D1ED1]/10 text-[#6D1ED1] animate-in fade-in zoom-in-95 duration-300">
                  <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-center w-full">
                    {t?.payoutSettings?.zelleInfo || "Configure your Zelle details below to enable direct transfers to your account."}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Zelle Detailed Configuration - Only if Zelle is selected */}
        {isZelleEnabled && (
          <Card className="border-border bg-card shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
            <CardHeader className="border-b border-border/50 bg-[#6D1ED1]/5 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6D1ED1]/10 text-[#6D1ED1]">
                  <Zap className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <CardTitle className="uppercase">{t?.payoutSettings?.zelleTitle || "Zelle Details"}</CardTitle>
                  <CardDescription>{t?.payoutSettings?.zelleSubtitle || "Required information for Zelle payments"}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-2 text-left">
                <div className="space-y-2">
                  <Label htmlFor="zelleName">{t?.payoutSettings?.accountName || "Account Name"}</Label>
                  <Input
                    id="zelleName"
                    value={settings.zelle_name || ""}
                    onChange={(e) => setSettings({ ...settings, zelle_name: e.target.value })}
                    placeholder={t?.payoutSettings?.sections?.zelleConfig?.namePlaceholder || "Full Name on Account"}
                    className="rounded-xl border-border bg-bg-subtle"
                    required={isZelleEnabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zelleIdentifier">{t?.payoutSettings?.zelleId || "Zelle ID (Email or Phone)"}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <Input
                      id="zelleIdentifier"
                      value={settings.zelle_identifier || ""}
                      onChange={(e) => setSettings({ ...settings, zelle_identifier: e.target.value })}
                      placeholder={t?.payoutSettings?.sections?.zelleConfig?.identifierPlaceholder || "email@example.com or phone"}
                      className="pl-10 rounded-xl border-border bg-bg-subtle"
                      required={isZelleEnabled}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={saving} className="rounded-xl px-12 h-12 text-base font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all uppercase">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t?.payoutSettings?.savingBtn || "Saving..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                {t?.payoutSettings?.saveBtn || "Save Settings"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
