import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Input } from "../../../components/atoms/input";
import { Label } from "../../../components/atoms/label";
import { Textarea } from "../../../components/atoms/textarea";
import type { LandingPageConfig } from "../types";

interface InspectorPanelProps {
  config: LandingPageConfig;
  onUpdateConfig: <K extends keyof LandingPageConfig>(
    key: K,
    value: LandingPageConfig[K],
  ) => void;
}

export function InspectorPanel({
  config,
  onUpdateConfig,
}: InspectorPanelProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyValue = (key: string, value: string) => {
    if (!value) return;
    void navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    });
  };

  const linkField = (
    id: string,
    label: string,
    value: string,
    onChange: (next: string) => void,
    placeholder?: string,
    readonly?: boolean,
  ) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readonly}
        />
        <button
          type="button"
          onClick={() => copyValue(id, value)}
          className="shrink-0 rounded border border-border p-2 text-text-muted transition-colors hover:text-text"
          title="Copiar link"
        >
          {copiedKey === id ? <Check size={14} className="text-success" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );

  return (
    <aside className="w-full shrink-0 overflow-y-auto border-t border-border bg-card px-3 py-3 lg:w-96 lg:border-l lg:border-t-0">
      <h2 className="text-sm font-black uppercase tracking-wide text-text">
        Configuração da Landing
      </h2>
      <p className="mt-1 text-xs text-text-muted">
        Edite links, logo, favicon e textos da página pronta.
      </p>

      <div className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="page-title">Título da página</Label>
          <Input
            id="page-title"
            value={config.pageTitle}
            onChange={(e) => onUpdateConfig("pageTitle", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="favicon-url">URL do favicon</Label>
          <Input
            id="favicon-url"
            value={config.faviconUrl}
            onChange={(e) => onUpdateConfig("faviconUrl", e.target.value)}
          />
          {config.faviconUrl ? (
            <img
              src={config.faviconUrl}
              alt="Favicon"
              className="h-8 w-8 rounded border border-border"
            />
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="logo-url">URL da logo</Label>
          <Input
            id="logo-url"
            value={config.logoUrl}
            onChange={(e) => onUpdateConfig("logoUrl", e.target.value)}
          />
          {config.logoUrl ? (
            <img
              src={config.logoUrl}
              alt="Logo"
              className="h-10 w-auto max-w-full rounded border border-border bg-white p-1"
            />
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lawyer-name">Nome do advogado</Label>
          <Input
            id="lawyer-name"
            value={config.lawyerName}
            onChange={(e) => onUpdateConfig("lawyerName", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lawyer-cta">Texto de autoridade do advogado</Label>
          <Textarea
            id="lawyer-cta"
            value={config.lawyerCtaText}
            onChange={(e) => onUpdateConfig("lawyerCtaText", e.target.value)}
          />
        </div>
        {linkField(
          "admin-lawyer-url",
          "URL do painel admin_lawyer",
          config.adminLawyerUrl,
          (next) => onUpdateConfig("adminLawyerUrl", next),
          "https://seudominio.com/master",
        )}
        <div className="space-y-2">
          <p className="text-[11px] text-text-muted">
            Link que direciona o advogado ao painel de gestão.
          </p>
        </div>
        {linkField(
          "login-url",
          "Link do botão de login",
          config.loginUrl,
          (next) => onUpdateConfig("loginUrl", next),
        )}
        {linkField(
          "contact-url",
          "Link de contato (WhatsApp)",
          config.contactUrl,
          (next) => onUpdateConfig("contactUrl", next),
        )}
        <div className="space-y-2">
          <Label htmlFor="hero-title">Título principal</Label>
          <Input
            id="hero-title"
            value={config.heroTitle}
            onChange={(e) => onUpdateConfig("heroTitle", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hero-subtitle">Subtítulo</Label>
          <Textarea
            id="hero-subtitle"
            value={config.heroSubtitle}
            onChange={(e) => onUpdateConfig("heroSubtitle", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-label">Texto do botão de login</Label>
          <Input
            id="login-label"
            value={config.loginButtonLabel}
            onChange={(e) => onUpdateConfig("loginButtonLabel", e.target.value)}
          />
        </div>
        {linkField(
          "primary-cta-url",
          "Link do CTA principal",
          config.primaryCtaUrl,
          (next) => onUpdateConfig("primaryCtaUrl", next),
        )}
        <div className="space-y-2">
          <Label htmlFor="primary-cta-label">Texto do CTA principal</Label>
          <Input
            id="primary-cta-label"
            value={config.primaryCtaLabel}
            onChange={(e) => onUpdateConfig("primaryCtaLabel", e.target.value)}
          />
        </div>
        {linkField(
          "secondary-cta-url",
          "Link do CTA secundário",
          config.secondaryCtaUrl,
          (next) => onUpdateConfig("secondaryCtaUrl", next),
        )}
        <div className="space-y-2">
          <Label htmlFor="secondary-cta-label">Texto do CTA secundário</Label>
          <Input
            id="secondary-cta-label"
            value={config.secondaryCtaLabel}
            onChange={(e) =>
              onUpdateConfig("secondaryCtaLabel", e.target.value)
            }
          />
        </div>
      </div>
    </aside>
  );
}
