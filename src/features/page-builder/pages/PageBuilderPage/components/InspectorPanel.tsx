import { Check, Copy, HelpCircle, ImageUp } from "lucide-react";
import { useState } from "react";
import { Input } from "@shared/components/atoms/input";
import { Label } from "@shared/components/atoms/label";
import { Textarea } from "@shared/components/atoms/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shared/components/atoms/tooltip";
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

interface FieldTooltipProps {
  content: string;
}

function FieldTooltip({ content }: FieldTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="text-text-muted hover:text-text focus:outline-none transition-colors"
          tabIndex={-1}
        >
          <HelpCircle size={14} className="inline-block" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-[240px] text-xs bg-popover text-popover-foreground border border-border p-2 shadow-md">
        {content}
      </TooltipContent>
    </Tooltip>
  );
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
    tooltip?: string,
  ) => (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={id}>{label}</Label>
        {tooltip && <FieldTooltip content={tooltip} />}
      </div>
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
          title="Copy link"
        >
          {copiedKey === id ? <Check size={14} className="text-success" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <aside className="w-full shrink-0 overflow-y-auto border-t border-border bg-card px-3 py-3 lg:w-96 lg:border-l lg:border-t-0">
        <h2 className="text-sm font-black uppercase tracking-wide text-text">
          Landing Configuration
        </h2>
        <p className="mt-1 text-xs text-text-muted">
          Edit links, logo, favicon, and page copy.
        </p>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="page-title">Page title</Label>
              <FieldTooltip content="Título da página que aparece na aba do navegador." />
            </div>
            <Input
              id="page-title"
              value={config.pageTitle}
              onChange={(e) => onUpdateConfig("pageTitle", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="favicon-upload">Favicon upload</Label>
              <FieldTooltip content="Ícone pequeno exibido na aba do navegador (recomendado: formato PNG ou SVG, tamanho 64x64)." />
            </div>
            <div className="rounded-xl border border-dashed border-border bg-bg-subtle p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="rounded-lg bg-card p-2 text-text-muted">
                    <ImageUp size={14} />
                  </span>
                  <p className="truncate text-xs text-text-muted">
                    {isUploadingFavicon ? "Uploading favicon..." : "PNG, JPG, or SVG (recommended 64x64)."}
                  </p>
                </div>
                <label
                  htmlFor="favicon-upload"
                  className="cursor-pointer rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-text hover:bg-bg-subtle"
                >
                  Select
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
            <div className="flex items-center gap-1.5">
              <Label htmlFor="logo-upload">Logo upload</Label>
              <FieldTooltip content="Logotipo da empresa exibido no cabeçalho e rodapé da página." />
            </div>
            <div className="rounded-xl border border-dashed border-border bg-bg-subtle p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="rounded-lg bg-card p-2 text-text-muted">
                    <ImageUp size={14} />
                  </span>
                  <p className="truncate text-xs text-text-muted">
                    {isUploadingLogo ? "Uploading logo..." : "PNG, JPG, or SVG (transparent background recommended)."}
                  </p>
                </div>
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-text hover:bg-bg-subtle"
                >
                  Select
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
            <div className="flex items-center gap-1.5">
              <Label htmlFor="lawyer-name">Lawyer name</Label>
              <FieldTooltip content="Nome do advogado ou do escritório a ser exibido na página." />
            </div>
            <Input
              id="lawyer-name"
              value={config.lawyerName}
              onChange={(e) => onUpdateConfig("lawyerName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="hero-badge">Top badge</Label>
              <FieldTooltip content="Texto em destaque de tamanho menor exibido logo no topo da página (ex: 'Especialistas em Imigração')." />
            </div>
            <Input
              id="hero-badge"
              value={config.heroBadge}
              onChange={(e) => onUpdateConfig("heroBadge", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="lawyer-cta">Lawyer authority copy</Label>
              <FieldTooltip content="Texto curto destacando a autoridade ou credenciais do advogado." />
            </div>
            <Textarea
              id="lawyer-cta"
              value={config.lawyerCtaText}
              onChange={(e) => onUpdateConfig("lawyerCtaText", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="expert-tag">Specialist card tag</Label>
              <FieldTooltip content="Texto/etiqueta pequena do card do especialista (ex: 'Disponível')." />
            </div>
            <Input
              id="expert-tag"
              value={config.expertTag}
              onChange={(e) => onUpdateConfig("expertTag", e.target.value)}
            />
          </div>
          {linkField(
            "admin-lawyer-url",
            "admin_lawyer panel URL",
            config.adminLawyerUrl,
            (next) => onUpdateConfig("adminLawyerUrl", next),
            "https://yourdomain.com/master",
            undefined,
            "Link de redirecionamento para o painel administrativo do advogado.",
          )}
          <div className="space-y-2">
            <p className="text-[11px] text-text-muted">
              Link that directs the lawyer to the management dashboard.
            </p>
          </div>
          {linkField(
            "login-url",
            "Login button link",
            config.loginUrl,
            (next) => onUpdateConfig("loginUrl", next),
            undefined,
            undefined,
            "Link para onde o usuário será direcionado ao clicar no botão de Login.",
          )}
          {linkField(
            "contact-url",
            "Contact link (WhatsApp)",
            config.contactUrl,
            (next) => onUpdateConfig("contactUrl", next),
            undefined,
            undefined,
            "Link direto para atendimento (geralmente do WhatsApp).",
          )}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="hero-title">Main title</Label>
              <FieldTooltip content="Título principal de destaque (Hero) no centro da página." />
            </div>
            <Input
              id="hero-title"
              value={config.heroTitle}
              onChange={(e) => onUpdateConfig("heroTitle", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="hero-subtitle">Subtitle</Label>
              <FieldTooltip content="Subtítulo de apoio abaixo do título principal para detalhar o serviço." />
            </div>
            <Textarea
              id="hero-subtitle"
              value={config.heroSubtitle}
              onChange={(e) => onUpdateConfig("heroSubtitle", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="login-label">Login button text</Label>
              <FieldTooltip content="Texto que será exibido no botão de login do cabeçalho." />
            </div>
            <Input
              id="login-label"
              value={config.loginButtonLabel}
              onChange={(e) => onUpdateConfig("loginButtonLabel", e.target.value)}
            />
          </div>
          {linkField(
            "primary-cta-url",
            "Primary CTA link",
            config.primaryCtaUrl,
            (next) => onUpdateConfig("primaryCtaUrl", next),
            undefined,
            undefined,
            "Link de destino do botão de ação principal (ex: iniciar cadastro).",
          )}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="primary-cta-label">Primary CTA text</Label>
              <FieldTooltip content="Texto do botão de ação principal." />
            </div>
            <Input
              id="primary-cta-label"
              value={config.primaryCtaLabel}
              onChange={(e) => onUpdateConfig("primaryCtaLabel", e.target.value)}
            />
          </div>
          {linkField(
            "secondary-cta-url",
            "Secondary CTA link",
            config.secondaryCtaUrl,
            (next) => onUpdateConfig("secondaryCtaUrl", next),
            undefined,
            undefined,
            "Link de destino do botão de ação secundário (ex: tirar dúvidas).",
          )}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="secondary-cta-label">Secondary CTA text</Label>
              <FieldTooltip content="Texto do botão de ação secundário." />
            </div>
            <Input
              id="secondary-cta-label"
              value={config.secondaryCtaLabel}
              onChange={(e) =>
                onUpdateConfig("secondaryCtaLabel", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="services-title">Services section title</Label>
              <FieldTooltip content="Título da seção que lista os serviços prestados." />
            </div>
            <Input
              id="services-title"
              value={config.servicesTitle}
              onChange={(e) => onUpdateConfig("servicesTitle", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="services-subtitle">Services section subtitle</Label>
              <FieldTooltip content="Texto explicativo curto abaixo do título da seção de serviços." />
            </div>
            <Textarea
              id="services-subtitle"
              value={config.servicesSubtitle}
              onChange={(e) => onUpdateConfig("servicesSubtitle", e.target.value)}
            />
          </div>
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="service-b1-name">B1/B2 Service - Name</Label>
              <FieldTooltip content="Nome do serviço para vistos de turismo e negócios (B1/B2)." />
            </div>
            <Input id="service-b1-name" value={config.serviceB1B2Name} onChange={(e) => onUpdateConfig("serviceB1B2Name", e.target.value)} />
            <div className="flex items-center gap-1.5 mt-2">
              <Label htmlFor="service-b1-desc">B1/B2 Service - Description</Label>
              <FieldTooltip content="Breve descrição sobre o serviço B1/B2." />
            </div>
            <Textarea id="service-b1-desc" value={config.serviceB1B2Desc} onChange={(e) => onUpdateConfig("serviceB1B2Desc", e.target.value)} />
          </div>
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="service-f1-name">F1 Service - Name</Label>
              <FieldTooltip content="Nome do serviço para visto de estudante (F1)." />
            </div>
            <Input id="service-f1-name" value={config.serviceF1Name} onChange={(e) => onUpdateConfig("serviceF1Name", e.target.value)} />
            <div className="flex items-center gap-1.5 mt-2">
              <Label htmlFor="service-f1-desc">F1 Service - Description</Label>
              <FieldTooltip content="Breve descrição sobre o serviço F1." />
            </div>
            <Textarea id="service-f1-desc" value={config.serviceF1Desc} onChange={(e) => onUpdateConfig("serviceF1Desc", e.target.value)} />
          </div>
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="service-eos-name">EOS Service - Name</Label>
              <FieldTooltip content="Nome do serviço para Extensão de Status (EOS)." />
            </div>
            <Input id="service-eos-name" value={config.serviceEOSName} onChange={(e) => onUpdateConfig("serviceEOSName", e.target.value)} />
            <div className="flex items-center gap-1.5 mt-2">
              <Label htmlFor="service-eos-desc">EOS Service - Description</Label>
              <FieldTooltip content="Breve descrição sobre o serviço EOS." />
            </div>
            <Textarea id="service-eos-desc" value={config.serviceEOSDesc} onChange={(e) => onUpdateConfig("serviceEOSDesc", e.target.value)} />
          </div>
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="service-cos-name">COS Service - Name</Label>
              <FieldTooltip content="Nome do serviço para Mudança de Status (COS)." />
            </div>
            <Input id="service-cos-name" value={config.serviceCOSName} onChange={(e) => onUpdateConfig("serviceCOSName", e.target.value)} />
            <div className="flex items-center gap-1.5 mt-2">
              <Label htmlFor="service-cos-desc">COS Service - Description</Label>
              <FieldTooltip content="Breve descrição sobre o serviço COS." />
            </div>
            <Textarea id="service-cos-desc" value={config.serviceCOSDesc} onChange={(e) => onUpdateConfig("serviceCOSDesc", e.target.value)} />
          </div>
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="how-title">How It Works title</Label>
              <FieldTooltip content="Título da seção que explica os passos do processo." />
            </div>
            <Input id="how-title" value={config.howItWorksTitle} onChange={(e) => onUpdateConfig("howItWorksTitle", e.target.value)} />
            <div className="flex items-center gap-1.5 mt-2">
              <Label htmlFor="how-subtitle">Subtitle do Como Funciona</Label>
              <FieldTooltip content="Texto de apoio para a seção de passos." />
            </div>
            <Textarea id="how-subtitle" value={config.howItWorksSubtitle} onChange={(e) => onUpdateConfig("howItWorksSubtitle", e.target.value)} />
          </div>
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="step-1-title">Step 1 - Title</Label>
              <FieldTooltip content="Título do primeiro passo do processo." />
            </div>
            <Input id="step-1-title" value={config.step1Title} onChange={(e) => onUpdateConfig("step1Title", e.target.value)} />
            <div className="flex items-center gap-1.5 mt-2">
              <Label htmlFor="step-1-desc">Step 1 - Description</Label>
              <FieldTooltip content="Descrição detalhada do que acontece no primeiro passo." />
            </div>
            <Textarea id="step-1-desc" value={config.step1Desc} onChange={(e) => onUpdateConfig("step1Desc", e.target.value)} />
          </div>
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="step-2-title">Step 2 - Title</Label>
              <FieldTooltip content="Título do segundo passo do processo." />
            </div>
            <Input id="step-2-title" value={config.step2Title} onChange={(e) => onUpdateConfig("step2Title", e.target.value)} />
            <div className="flex items-center gap-1.5 mt-2">
              <Label htmlFor="step-2-desc">Step 2 - Description</Label>
              <FieldTooltip content="Descrição detalhada do que acontece no segundo passo." />
            </div>
            <Textarea id="step-2-desc" value={config.step2Desc} onChange={(e) => onUpdateConfig("step2Desc", e.target.value)} />
          </div>
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="step-3-title">Step 3 - Title</Label>
              <FieldTooltip content="Título do terceiro passo do processo." />
            </div>
            <Input id="step-3-title" value={config.step3Title} onChange={(e) => onUpdateConfig("step3Title", e.target.value)} />
            <div className="flex items-center gap-1.5 mt-2">
              <Label htmlFor="step-3-desc">Step 3 - Description</Label>
              <FieldTooltip content="Descrição detalhada do que acontece no terceiro passo." />
            </div>
            <Textarea id="step-3-desc" value={config.step3Desc} onChange={(e) => onUpdateConfig("step3Desc", e.target.value)} />
          </div>
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="faq-title">FAQ title</Label>
              <FieldTooltip content="Título da seção de perguntas frequentes." />
            </div>
            <Input id="faq-title" value={config.faqTitle} onChange={(e) => onUpdateConfig("faqTitle", e.target.value)} />
            <div className="flex items-center gap-1.5 mt-2">
              <Label htmlFor="faq-subtitle">Subtitle do FAQ</Label>
              <FieldTooltip content="Texto de apoio para a seção de perguntas frequentes." />
            </div>
            <Textarea id="faq-subtitle" value={config.faqSubtitle} onChange={(e) => onUpdateConfig("faqSubtitle", e.target.value)} />
          </div>
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="faq-1-q">FAQ 1 - Question</Label>
              <FieldTooltip content="Pergunta mais comum/frequente a ser respondida." />
            </div>
            <Input id="faq-1-q" value={config.faq1Question} onChange={(e) => onUpdateConfig("faq1Question", e.target.value)} />
            <div className="flex items-center gap-1.5 mt-2">
              <Label htmlFor="faq-1-a">FAQ 1 - Answer</Label>
              <FieldTooltip content="Resposta detalhada para a pergunta acima." />
            </div>
            <Textarea id="faq-1-a" value={config.faq1Answer} onChange={(e) => onUpdateConfig("faq1Answer", e.target.value)} />
          </div>
          <div className="space-y-2 border-t border-border pt-4 pb-6">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="footer-desc">Footer description</Label>
              <FieldTooltip content="Texto descritivo exibido na parte inferior da página (ex: termos e direitos)." />
            </div>
            <Textarea id="footer-desc" value={config.footerDescription} onChange={(e) => onUpdateConfig("footerDescription", e.target.value)} />
            <div className="flex items-center gap-1.5 mt-2">
              <Label htmlFor="footer-contact-email">Contact - Email</Label>
              <FieldTooltip content="E-mail de contato que aparecerá no rodapé." />
            </div>
            <Input id="footer-contact-email" value={config.footerContactEmail} onChange={(e) => onUpdateConfig("footerContactEmail", e.target.value)} />
            <div className="flex items-center gap-1.5 mt-2">
              <Label htmlFor="footer-contact-phone">Contact - Phone</Label>
              <FieldTooltip content="Telefone de contato que aparecerá no rodapé." />
            </div>
            <Input id="footer-contact-phone" value={config.footerContactPhone} onChange={(e) => onUpdateConfig("footerContactPhone", e.target.value)} />
            <div className="flex items-center gap-1.5 mt-2">
              <Label htmlFor="footer-contact-location">Contact - Location</Label>
              <FieldTooltip content="Endereço ou localização do escritório exibida no rodapé." />
            </div>
            <Input id="footer-contact-location" value={config.footerContactLocation} onChange={(e) => onUpdateConfig("footerContactLocation", e.target.value)} />
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}

