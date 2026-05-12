import { Check, Copy, ImageUp } from "lucide-react";
import { useState } from "react";
import { Input } from "../../../components/atoms/input";
import { Label } from "../../../components/atoms/label";
import { Textarea } from "../../../components/atoms/textarea";
import type { LandingPageConfig } from "../types";

interface InspectorPanelProps {
  config: LandingPageConfig;
  isUploadingLogo?: boolean;
  isUploadingFavicon?: boolean;
  onUploadLogo?: (file: File) => Promise<void>;
  onUploadFavicon?: (file: File) => Promise<void>;
  onUpdateConfig: <K extends keyof LandingPageConfig>(
    key: K,
    value: LandingPageConfig[K],
  ) => void;
}

export function InspectorPanel({
  config,
  isUploadingLogo = false,
  isUploadingFavicon = false,
  onUploadLogo,
  onUploadFavicon,
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
          <Label htmlFor="favicon-upload">Upload do favicon</Label>
          <div className="rounded-xl border border-dashed border-border bg-bg-subtle p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="rounded-lg bg-card p-2 text-text-muted">
                  <ImageUp size={14} />
                </span>
                <p className="truncate text-xs text-text-muted">
                  {isUploadingFavicon ? "Enviando favicon..." : "PNG, JPG ou SVG (recomendado 64x64)."}
                </p>
              </div>
              <label
                htmlFor="favicon-upload"
                className="cursor-pointer rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-text hover:bg-bg-subtle"
              >
                Selecionar
              </label>
            </div>
            <Input
              id="favicon-upload"
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isUploadingFavicon}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file || !onUploadFavicon) return;
                void onUploadFavicon(file);
                e.currentTarget.value = "";
              }}
            />
          </div>
          {config.faviconUrl ? (
            <img
              src={config.faviconUrl}
              alt="Favicon"
              className="h-8 w-8 rounded border border-border"
            />
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="logo-upload">Upload da logo</Label>
          <div className="rounded-xl border border-dashed border-border bg-bg-subtle p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="rounded-lg bg-card p-2 text-text-muted">
                  <ImageUp size={14} />
                </span>
                <p className="truncate text-xs text-text-muted">
                  {isUploadingLogo ? "Enviando logo..." : "PNG, JPG ou SVG (recomendado fundo transparente)."}
                </p>
              </div>
              <label
                htmlFor="logo-upload"
                className="cursor-pointer rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-text hover:bg-bg-subtle"
              >
                Selecionar
              </label>
            </div>
            <Input
              id="logo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isUploadingLogo}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file || !onUploadLogo) return;
                void onUploadLogo(file);
                e.currentTarget.value = "";
              }}
            />
          </div>
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
          <Label htmlFor="hero-badge">Badge do topo</Label>
          <Input
            id="hero-badge"
            value={config.heroBadge}
            onChange={(e) => onUpdateConfig("heroBadge", e.target.value)}
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
          <Label htmlFor="expert-tag">Tag do card do especialista</Label>
          <Input
            id="expert-tag"
            value={config.expertTag}
            onChange={(e) => onUpdateConfig("expertTag", e.target.value)}
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
        <div className="space-y-2">
          <Label htmlFor="services-title">Título da seção serviços</Label>
          <Input
            id="services-title"
            value={config.servicesTitle}
            onChange={(e) => onUpdateConfig("servicesTitle", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="services-subtitle">Subtítulo da seção serviços</Label>
          <Textarea
            id="services-subtitle"
            value={config.servicesSubtitle}
            onChange={(e) => onUpdateConfig("servicesSubtitle", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="service-b1-name">Serviço B1/B2 - Nome</Label>
          <Input id="service-b1-name" value={config.serviceB1B2Name} onChange={(e) => onUpdateConfig("serviceB1B2Name", e.target.value)} />
          <Label htmlFor="service-b1-desc">Serviço B1/B2 - Descrição</Label>
          <Textarea id="service-b1-desc" value={config.serviceB1B2Desc} onChange={(e) => onUpdateConfig("serviceB1B2Desc", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="service-f1-name">Serviço F1 - Nome</Label>
          <Input id="service-f1-name" value={config.serviceF1Name} onChange={(e) => onUpdateConfig("serviceF1Name", e.target.value)} />
          <Label htmlFor="service-f1-desc">Serviço F1 - Descrição</Label>
          <Textarea id="service-f1-desc" value={config.serviceF1Desc} onChange={(e) => onUpdateConfig("serviceF1Desc", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="service-eos-name">Serviço EOS - Nome</Label>
          <Input id="service-eos-name" value={config.serviceEOSName} onChange={(e) => onUpdateConfig("serviceEOSName", e.target.value)} />
          <Label htmlFor="service-eos-desc">Serviço EOS - Descrição</Label>
          <Textarea id="service-eos-desc" value={config.serviceEOSDesc} onChange={(e) => onUpdateConfig("serviceEOSDesc", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="service-cos-name">Serviço COS - Nome</Label>
          <Input id="service-cos-name" value={config.serviceCOSName} onChange={(e) => onUpdateConfig("serviceCOSName", e.target.value)} />
          <Label htmlFor="service-cos-desc">Serviço COS - Descrição</Label>
          <Textarea id="service-cos-desc" value={config.serviceCOSDesc} onChange={(e) => onUpdateConfig("serviceCOSDesc", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="how-title">Título do Como Funciona</Label>
          <Input id="how-title" value={config.howItWorksTitle} onChange={(e) => onUpdateConfig("howItWorksTitle", e.target.value)} />
          <Label htmlFor="how-subtitle">Subtítulo do Como Funciona</Label>
          <Textarea id="how-subtitle" value={config.howItWorksSubtitle} onChange={(e) => onUpdateConfig("howItWorksSubtitle", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="step-1-title">Etapa 1 - Título</Label>
          <Input id="step-1-title" value={config.step1Title} onChange={(e) => onUpdateConfig("step1Title", e.target.value)} />
          <Label htmlFor="step-1-desc">Etapa 1 - Descrição</Label>
          <Textarea id="step-1-desc" value={config.step1Desc} onChange={(e) => onUpdateConfig("step1Desc", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="step-2-title">Etapa 2 - Título</Label>
          <Input id="step-2-title" value={config.step2Title} onChange={(e) => onUpdateConfig("step2Title", e.target.value)} />
          <Label htmlFor="step-2-desc">Etapa 2 - Descrição</Label>
          <Textarea id="step-2-desc" value={config.step2Desc} onChange={(e) => onUpdateConfig("step2Desc", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="step-3-title">Etapa 3 - Título</Label>
          <Input id="step-3-title" value={config.step3Title} onChange={(e) => onUpdateConfig("step3Title", e.target.value)} />
          <Label htmlFor="step-3-desc">Etapa 3 - Descrição</Label>
          <Textarea id="step-3-desc" value={config.step3Desc} onChange={(e) => onUpdateConfig("step3Desc", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="faq-title">Título do FAQ</Label>
          <Input id="faq-title" value={config.faqTitle} onChange={(e) => onUpdateConfig("faqTitle", e.target.value)} />
          <Label htmlFor="faq-subtitle">Subtítulo do FAQ</Label>
          <Textarea id="faq-subtitle" value={config.faqSubtitle} onChange={(e) => onUpdateConfig("faqSubtitle", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="faq-1-q">FAQ 1 - Pergunta</Label>
          <Input id="faq-1-q" value={config.faq1Question} onChange={(e) => onUpdateConfig("faq1Question", e.target.value)} />
          <Label htmlFor="faq-1-a">FAQ 1 - Resposta</Label>
          <Textarea id="faq-1-a" value={config.faq1Answer} onChange={(e) => onUpdateConfig("faq1Answer", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="footer-desc">Descrição do rodapé</Label>
          <Textarea id="footer-desc" value={config.footerDescription} onChange={(e) => onUpdateConfig("footerDescription", e.target.value)} />
          <Label htmlFor="footer-contact-email">Contato - Email</Label>
          <Input id="footer-contact-email" value={config.footerContactEmail} onChange={(e) => onUpdateConfig("footerContactEmail", e.target.value)} />
          <Label htmlFor="footer-contact-phone">Contato - Telefone</Label>
          <Input id="footer-contact-phone" value={config.footerContactPhone} onChange={(e) => onUpdateConfig("footerContactPhone", e.target.value)} />
          <Label htmlFor="footer-contact-location">Contato - Localização</Label>
          <Input id="footer-contact-location" value={config.footerContactLocation} onChange={(e) => onUpdateConfig("footerContactLocation", e.target.value)} />
        </div>
      </div>
    </aside>
  );
}
