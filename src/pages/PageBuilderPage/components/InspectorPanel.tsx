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
  return (
    <aside className="w-96 shrink-0 overflow-y-auto border-l border-border bg-card px-3 py-3">
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
        <div className="space-y-2">
          <Label htmlFor="admin-lawyer-url">URL do painel admin_lawyer</Label>
          <Input
            id="admin-lawyer-url"
            value={config.adminLawyerUrl}
            onChange={(e) => onUpdateConfig("adminLawyerUrl", e.target.value)}
            placeholder="https://seudominio.com/admin"
          />
          <p className="text-[11px] text-text-muted">
            Link que direciona o advogado ao painel de gestão.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-url">Link do botão de login</Label>
          <Input
            id="login-url"
            value={config.loginUrl}
            onChange={(e) => onUpdateConfig("loginUrl", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-url">Link de contato (WhatsApp)</Label>
          <Input
            id="contact-url"
            value={config.contactUrl}
            onChange={(e) => onUpdateConfig("contactUrl", e.target.value)}
          />
        </div>
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
        <div className="space-y-2">
          <Label htmlFor="primary-cta-url">Link do CTA principal</Label>
          <Input
            id="primary-cta-url"
            value={config.primaryCtaUrl}
            onChange={(e) => onUpdateConfig("primaryCtaUrl", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="primary-cta-label">Texto do CTA principal</Label>
          <Input
            id="primary-cta-label"
            value={config.primaryCtaLabel}
            onChange={(e) => onUpdateConfig("primaryCtaLabel", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="secondary-cta-url">Link do CTA secundário</Label>
          <Input
            id="secondary-cta-url"
            value={config.secondaryCtaUrl}
            onChange={(e) => onUpdateConfig("secondaryCtaUrl", e.target.value)}
          />
        </div>
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
