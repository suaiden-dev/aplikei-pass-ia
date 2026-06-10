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

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="pt-4 pb-1 text-[11px] font-semibold uppercase tracking-widest text-text-muted border-t border-border/50 first:border-t-0">
      {children}
    </p>
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
          value={value || ""}
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

  const toggleField = (
    id: string,
    label: string,
    checked: boolean,
    onChange: (next: boolean) => void,
  ) => (
    <label
      htmlFor={id}
      className="flex items-center justify-between gap-3 rounded border border-border bg-background px-3 py-2 text-sm text-text cursor-pointer hover:bg-bg-subtle/40 transition-colors"
    >
      <span>{label}</span>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-border text-brand focus:ring-brand cursor-pointer"
      />
    </label>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <aside className="w-full shrink-0 overflow-y-auto border-t border-border bg-card px-4 py-4 lg:w-96 lg:border-l lg:border-t-0">
        <h2 className="text-sm font-black uppercase tracking-wide text-text">
          Landing Configuration
        </h2>
        <p className="mt-1 text-xs text-text-muted">
          Edit links, logo, favicon, and page copy.
        </p>

        <div className="mt-4 space-y-4">
          {/* ── General ── */}
          <SectionHeading>General</SectionHeading>
          
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="page-title">Page title</Label>
              <FieldTooltip content="Título da página que aparece na aba do navegador." />
            </div>
            <Input
              id="page-title"
              value={config.pageTitle || ""}
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
                className="h-8 w-8 rounded border border-border mt-2"
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
                className="h-10 w-auto max-w-full rounded border border-border bg-white p-1 mt-2"
              />
            ) : null}
          </div>

          {/* ── Hero ── */}
          <SectionHeading>Hero</SectionHeading>
          
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="hero-badge">Top badge</Label>
              <FieldTooltip content="Texto em destaque de tamanho menor exibido no topo da página." />
            </div>
            <Input
              id="hero-badge"
              value={config.heroBadge || ""}
              onChange={(e) => onUpdateConfig("heroBadge", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="hero-title">Main title</Label>
              <FieldTooltip content="Título principal de destaque (Hero) no centro da página." />
            </div>
            <Input
              id="hero-title"
              value={config.heroTitle || ""}
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
              value={config.heroSubtitle || ""}
              onChange={(e) => onUpdateConfig("heroSubtitle", e.target.value)}
            />
          </div>

          {/* ── Lawyer card ── */}
          <SectionHeading>Lawyer card</SectionHeading>
          
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="lawyer-name">Lawyer name</Label>
              <FieldTooltip content="Nome do advogado ou do escritório a ser exibido na página." />
            </div>
            <Input
              id="lawyer-name"
              value={config.lawyerName || ""}
              onChange={(e) => onUpdateConfig("lawyerName", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="lawyer-cta">Lawyer authority copy</Label>
              <FieldTooltip content="Texto curto destacando a autoridade ou credenciais do advogado." />
            </div>
            <Textarea
              id="lawyer-cta"
              value={config.lawyerCtaText || ""}
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
              value={config.expertTag || ""}
              onChange={(e) => onUpdateConfig("expertTag", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expert-stat1-value">Stat 1 - Value</Label>
            <Input
              id="expert-stat1-value"
              value={config.expertStat1Value || ""}
              onChange={(e) => onUpdateConfig("expertStat1Value", e.target.value)}
            />
            <Label htmlFor="expert-stat1-label">Stat 1 - Label</Label>
            <Input
              id="expert-stat1-label"
              value={config.expertStat1Label || ""}
              onChange={(e) => onUpdateConfig("expertStat1Label", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expert-stat2-value">Stat 2 - Value</Label>
            <Input
              id="expert-stat2-value"
              value={config.expertStat2Value || ""}
              onChange={(e) => onUpdateConfig("expertStat2Value", e.target.value)}
            />
            <Label htmlFor="expert-stat2-label">Stat 2 - Label</Label>
            <Input
              id="expert-stat2-label"
              value={config.expertStat2Label || ""}
              onChange={(e) => onUpdateConfig("expertStat2Label", e.target.value)}
            />
          </div>

          {/* ── Links & CTAs ── */}
          <SectionHeading>Links &amp; CTAs</SectionHeading>
          
          {linkField(
            "admin-lawyer-url",
            "admin_lawyer panel URL",
            config.adminLawyerUrl,
            (next) => onUpdateConfig("adminLawyerUrl", next),
            "https://yourdomain.com/master",
            undefined,
            "Link de redirecionamento para o painel administrativo do advogado.",
          )}
          
          {linkField(
            "login-url",
            "Login button link",
            config.loginUrl,
            (next) => onUpdateConfig("loginUrl", next),
            undefined,
            undefined,
            "Link para onde o usuário será direcionado ao clicar no botão de Login.",
          )}
          
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="login-label">Login button text</Label>
              <FieldTooltip content="Texto que será exibido no botão de login do cabeçalho." />
            </div>
            <Input
              id="login-label"
              value={config.loginButtonLabel || ""}
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
              value={config.primaryCtaLabel || ""}
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
              value={config.secondaryCtaLabel || ""}
              onChange={(e) => onUpdateConfig("secondaryCtaLabel", e.target.value)}
            />
          </div>

          {linkField(
            "contact-url",
            "Contact link (WhatsApp)",
            config.contactUrl,
            (next) => onUpdateConfig("contactUrl", next),
            undefined,
            undefined,
            "Link direto para atendimento (geralmente do WhatsApp).",
          )}

          {/* ── Services ── */}
          <SectionHeading>Services</SectionHeading>
          
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="services-title">Section title</Label>
              <FieldTooltip content="Título da seção que lista os serviços prestados." />
            </div>
            <Input
              id="services-title"
              value={config.servicesTitle || ""}
              onChange={(e) => onUpdateConfig("servicesTitle", e.target.value)}
            />
            
            <div className="flex items-center gap-1.5">
              <Label htmlFor="services-subtitle">Section subtitle</Label>
              <FieldTooltip content="Texto explicativo curto abaixo do título da seção de serviços." />
            </div>
            <Textarea
              id="services-subtitle"
              value={config.servicesSubtitle || ""}
              onChange={(e) => onUpdateConfig("servicesSubtitle", e.target.value)}
            />
          </div>

          {/* B1/B2 */}
          <div className="space-y-2 border-t border-border/50 pt-3">
            {toggleField("service-b1-enabled", "Show B1/B2 card", config.serviceB1B2Enabled || false, (next) => onUpdateConfig("serviceB1B2Enabled", next))}
            <Label htmlFor="service-b1-tag">B1/B2 - Tag</Label>
            <Input id="service-b1-tag" value={config.serviceB1B2Tag || ""} onChange={(e) => onUpdateConfig("serviceB1B2Tag", e.target.value)} />
            <Label htmlFor="service-b1-name">B1/B2 - Name</Label>
            <Input id="service-b1-name" value={config.serviceB1B2Name || ""} onChange={(e) => onUpdateConfig("serviceB1B2Name", e.target.value)} />
            <Label htmlFor="service-b1-desc">B1/B2 - Description</Label>
            <Textarea id="service-b1-desc" value={config.serviceB1B2Desc || ""} onChange={(e) => onUpdateConfig("serviceB1B2Desc", e.target.value)} />
          </div>

          {/* F1 */}
          <div className="space-y-2 border-t border-border/50 pt-3">
            {toggleField("service-f1-enabled", "Show F1 card", config.serviceF1Enabled || false, (next) => onUpdateConfig("serviceF1Enabled", next))}
            <Label htmlFor="service-f1-tag">F1 - Tag</Label>
            <Input id="service-f1-tag" value={config.serviceF1Tag || ""} onChange={(e) => onUpdateConfig("serviceF1Tag", e.target.value)} />
            <Label htmlFor="service-f1-name">F1 - Name</Label>
            <Input id="service-f1-name" value={config.serviceF1Name || ""} onChange={(e) => onUpdateConfig("serviceF1Name", e.target.value)} />
            <Label htmlFor="service-f1-desc">F1 - Description</Label>
            <Textarea id="service-f1-desc" value={config.serviceF1Desc || ""} onChange={(e) => onUpdateConfig("serviceF1Desc", e.target.value)} />
          </div>

          {/* EOS */}
          <div className="space-y-2 border-t border-border/50 pt-3">
            {toggleField("service-eos-enabled", "Show EOS card", config.serviceEOSEnabled || false, (next) => onUpdateConfig("serviceEOSEnabled", next))}
            <Label htmlFor="service-eos-tag">EOS - Tag</Label>
            <Input id="service-eos-tag" value={config.serviceEOSTag || ""} onChange={(e) => onUpdateConfig("serviceEOSTag", e.target.value)} />
            <Label htmlFor="service-eos-name">EOS - Name</Label>
            <Input id="service-eos-name" value={config.serviceEOSName || ""} onChange={(e) => onUpdateConfig("serviceEOSName", e.target.value)} />
            <Label htmlFor="service-eos-desc">EOS - Description</Label>
            <Textarea id="service-eos-desc" value={config.serviceEOSDesc || ""} onChange={(e) => onUpdateConfig("serviceEOSDesc", e.target.value)} />
          </div>

          {/* COS */}
          <div className="space-y-2 border-t border-border/50 pt-3">
            {toggleField("service-cos-enabled", "Show COS card", config.serviceCOSEnabled || false, (next) => onUpdateConfig("serviceCOSEnabled", next))}
            <Label htmlFor="service-cos-tag">COS - Tag</Label>
            <Input id="service-cos-tag" value={config.serviceCOSTag || ""} onChange={(e) => onUpdateConfig("serviceCOSTag", e.target.value)} />
            <Label htmlFor="service-cos-name">COS - Name</Label>
            <Input id="service-cos-name" value={config.serviceCOSName || ""} onChange={(e) => onUpdateConfig("serviceCOSName", e.target.value)} />
            <Label htmlFor="service-cos-desc">COS - Description</Label>
            <Textarea id="service-cos-desc" value={config.serviceCOSDesc || ""} onChange={(e) => onUpdateConfig("serviceCOSDesc", e.target.value)} />
          </div>

          {/* ── How It Works ── */}
          <SectionHeading>How It Works</SectionHeading>
          
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="how-title">Section title</Label>
              <FieldTooltip content="Título da seção que explica os passos do processo." />
            </div>
            <Input id="how-title" value={config.howItWorksTitle || ""} onChange={(e) => onUpdateConfig("howItWorksTitle", e.target.value)} />
            
            <div className="flex items-center gap-1.5">
              <Label htmlFor="how-subtitle">Section subtitle</Label>
              <FieldTooltip content="Texto de apoio para a seção de passos." />
            </div>
            <Textarea id="how-subtitle" value={config.howItWorksSubtitle || ""} onChange={(e) => onUpdateConfig("howItWorksSubtitle", e.target.value)} />
          </div>

          <div className="space-y-2 border-t border-border/50 pt-3">
            <Label htmlFor="step-1-title">Step 1 - Title</Label>
            <Input id="step-1-title" value={config.step1Title || ""} onChange={(e) => onUpdateConfig("step1Title", e.target.value)} />
            <Label htmlFor="step-1-desc">Step 1 - Description</Label>
            <Textarea id="step-1-desc" value={config.step1Desc || ""} onChange={(e) => onUpdateConfig("step1Desc", e.target.value)} />
          </div>

          <div className="space-y-2 border-t border-border/50 pt-3">
            <Label htmlFor="step-2-title">Step 2 - Title</Label>
            <Input id="step-2-title" value={config.step2Title || ""} onChange={(e) => onUpdateConfig("step2Title", e.target.value)} />
            <Label htmlFor="step-2-desc">Step 2 - Description</Label>
            <Textarea id="step-2-desc" value={config.step2Desc || ""} onChange={(e) => onUpdateConfig("step2Desc", e.target.value)} />
          </div>

          <div className="space-y-2 border-t border-border/50 pt-3">
            <Label htmlFor="step-3-title">Step 3 - Title</Label>
            <Input id="step-3-title" value={config.step3Title || ""} onChange={(e) => onUpdateConfig("step3Title", e.target.value)} />
            <Label htmlFor="step-3-desc">Step 3 - Description</Label>
            <Textarea id="step-3-desc" value={config.step3Desc || ""} onChange={(e) => onUpdateConfig("step3Desc", e.target.value)} />
          </div>

          {/* ── Testimonials ── */}
          <SectionHeading>Testimonials</SectionHeading>
          
          <div className="space-y-2">
            <Label htmlFor="testimonials-title">Section title</Label>
            <Input id="testimonials-title" value={config.testimonialsTitle || ""} onChange={(e) => onUpdateConfig("testimonialsTitle", e.target.value)} />
            <Label htmlFor="testimonials-subtitle">Section subtitle</Label>
            <Textarea id="testimonials-subtitle" value={config.testimonialsSubtitle || ""} onChange={(e) => onUpdateConfig("testimonialsSubtitle", e.target.value)} />
          </div>

          <div className="space-y-2 border-t border-border/50 pt-3">
            <Label htmlFor="testimonial1-text">Testimonial 1 - Text</Label>
            <Textarea id="testimonial1-text" value={config.testimonial1Text || ""} onChange={(e) => onUpdateConfig("testimonial1Text", e.target.value)} />
            <Label htmlFor="testimonial1-author">Testimonial 1 - Author</Label>
            <Input id="testimonial1-author" value={config.testimonial1Author || ""} onChange={(e) => onUpdateConfig("testimonial1Author", e.target.value)} />
            <Label htmlFor="testimonial1-role">Testimonial 1 - Role</Label>
            <Input id="testimonial1-role" value={config.testimonial1Role || ""} onChange={(e) => onUpdateConfig("testimonial1Role", e.target.value)} />
          </div>

          <div className="space-y-2 border-t border-border/50 pt-3">
            <Label htmlFor="testimonial2-text">Testimonial 2 - Text</Label>
            <Textarea id="testimonial2-text" value={config.testimonial2Text || ""} onChange={(e) => onUpdateConfig("testimonial2Text", e.target.value)} />
            <Label htmlFor="testimonial2-author">Testimonial 2 - Author</Label>
            <Input id="testimonial2-author" value={config.testimonial2Author || ""} onChange={(e) => onUpdateConfig("testimonial2Author", e.target.value)} />
            <Label htmlFor="testimonial2-role">Testimonial 2 - Role</Label>
            <Input id="testimonial2-role" value={config.testimonial2Role || ""} onChange={(e) => onUpdateConfig("testimonial2Role", e.target.value)} />
          </div>

          <div className="space-y-2 border-t border-border/50 pt-3">
            <Label htmlFor="testimonial3-text">Testimonial 3 - Text</Label>
            <Textarea id="testimonial3-text" value={config.testimonial3Text || ""} onChange={(e) => onUpdateConfig("testimonial3Text", e.target.value)} />
            <Label htmlFor="testimonial3-author">Testimonial 3 - Author</Label>
            <Input id="testimonial3-author" value={config.testimonial3Author || ""} onChange={(e) => onUpdateConfig("testimonial3Author", e.target.value)} />
            <Label htmlFor="testimonial3-role">Testimonial 3 - Role</Label>
            <Input id="testimonial3-role" value={config.testimonial3Role || ""} onChange={(e) => onUpdateConfig("testimonial3Role", e.target.value)} />
          </div>

          {/* ── FAQ ── */}
          <SectionHeading>FAQ</SectionHeading>
          
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="faq-title">Section title</Label>
              <FieldTooltip content="Título da seção de perguntas frequentes." />
            </div>
            <Input id="faq-title" value={config.faqTitle || ""} onChange={(e) => onUpdateConfig("faqTitle", e.target.value)} />
            
            <div className="flex items-center gap-1.5">
              <Label htmlFor="faq-subtitle">Section subtitle</Label>
              <FieldTooltip content="Texto de apoio para a seção de perguntas frequentes." />
            </div>
            <Textarea id="faq-subtitle" value={config.faqSubtitle || ""} onChange={(e) => onUpdateConfig("faqSubtitle", e.target.value)} />
          </div>

          <div className="space-y-2 border-t border-border/50 pt-3">
            <Label htmlFor="faq-1-q">FAQ 1 - Question</Label>
            <Input id="faq-1-q" value={config.faq1Question || ""} onChange={(e) => onUpdateConfig("faq1Question", e.target.value)} />
            <Label htmlFor="faq-1-a">FAQ 1 - Answer</Label>
            <Textarea id="faq-1-a" value={config.faq1Answer || ""} onChange={(e) => onUpdateConfig("faq1Answer", e.target.value)} />
          </div>

          <div className="space-y-2 border-t border-border/50 pt-3">
            <Label htmlFor="faq-2-q">FAQ 2 - Question</Label>
            <Input id="faq-2-q" value={config.faq2Question || ""} onChange={(e) => onUpdateConfig("faq2Question", e.target.value)} />
            <Label htmlFor="faq-2-a">FAQ 2 - Answer</Label>
            <Textarea id="faq-2-a" value={config.faq2Answer || ""} onChange={(e) => onUpdateConfig("faq2Answer", e.target.value)} />
          </div>

          <div className="space-y-2 border-t border-border/50 pt-3">
            <Label htmlFor="faq-3-q">FAQ 3 - Question</Label>
            <Input id="faq-3-q" value={config.faq3Question || ""} onChange={(e) => onUpdateConfig("faq3Question", e.target.value)} />
            <Label htmlFor="faq-3-a">FAQ 3 - Answer</Label>
            <Textarea id="faq-3-a" value={config.faq3Answer || ""} onChange={(e) => onUpdateConfig("faq3Answer", e.target.value)} />
          </div>

          {/* ── Footer ── */}
          <SectionHeading>Footer</SectionHeading>
          
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="footer-desc">Description</Label>
              <FieldTooltip content="Texto descritivo exibido na parte inferior da página (ex: termos e direitos)." />
            </div>
            <Textarea id="footer-desc" value={config.footerDescription || ""} onChange={(e) => onUpdateConfig("footerDescription", e.target.value)} />
          </div>

          <div className="space-y-2 border-t border-border/50 pt-3">
            <Label htmlFor="footer-links-title">Links section title</Label>
            <Input id="footer-links-title" value={config.footerLinksTitle || ""} onChange={(e) => onUpdateConfig("footerLinksTitle", e.target.value)} />
            <Label htmlFor="footer-link-1">Footer link 1 label</Label>
            <Input id="footer-link-1" value={config.footerLink1Label || ""} onChange={(e) => onUpdateConfig("footerLink1Label", e.target.value)} />
            <Label htmlFor="footer-link-2">Footer link 2 label</Label>
            <Input id="footer-link-2" value={config.footerLink2Label || ""} onChange={(e) => onUpdateConfig("footerLink2Label", e.target.value)} />
            <Label htmlFor="footer-link-3">Footer link 3 label</Label>
            <Input id="footer-link-3" value={config.footerLink3Label || ""} onChange={(e) => onUpdateConfig("footerLink3Label", e.target.value)} />
            <Label htmlFor="footer-link-4">Footer link 4 label</Label>
            <Input id="footer-link-4" value={config.footerLink4Label || ""} onChange={(e) => onUpdateConfig("footerLink4Label", e.target.value)} />
          </div>

          <div className="space-y-2 border-t border-border/50 pt-3">
            <Label htmlFor="footer-contact-title">Contact section title</Label>
            <Input id="footer-contact-title" value={config.footerContactTitle || ""} onChange={(e) => onUpdateConfig("footerContactTitle", e.target.value)} />
            
            <div className="flex items-center gap-1.5">
              <Label htmlFor="footer-contact-email">Contact - Email</Label>
              <FieldTooltip content="E-mail de contato que aparecerá no rodapé." />
            </div>
            <Input id="footer-contact-email" value={config.footerContactEmail || ""} onChange={(e) => onUpdateConfig("footerContactEmail", e.target.value)} />
            
            <div className="flex items-center gap-1.5">
              <Label htmlFor="footer-contact-phone">Contact - Phone</Label>
              <FieldTooltip content="Telefone de contato que aparecerá no rodapé." />
            </div>
            <Input id="footer-contact-phone" value={config.footerContactPhone || ""} onChange={(e) => onUpdateConfig("footerContactPhone", e.target.value)} />
            
            <div className="flex items-center gap-1.5">
              <Label htmlFor="footer-contact-location">Contact - Location</Label>
              <FieldTooltip content="Endereço ou localização do escritório exibida no rodapé." />
            </div>
            <Input id="footer-contact-location" value={config.footerContactLocation || ""} onChange={(e) => onUpdateConfig("footerContactLocation", e.target.value)} />
          </div>

          <div className="space-y-2 border-t border-border/50 pt-3">
            <Label htmlFor="footer-copyright">Copyright</Label>
            <Input id="footer-copyright" value={config.footerCopyright || ""} onChange={(e) => onUpdateConfig("footerCopyright", e.target.value)} />
          </div>

          <div className="space-y-2 border-t border-border/50 pt-3 pb-6">
            <Label htmlFor="footer-instagram">Social - Instagram label</Label>
            <Input id="footer-instagram" value={config.footerSocialInstagramLabel || ""} onChange={(e) => onUpdateConfig("footerSocialInstagramLabel", e.target.value)} />
            <Label htmlFor="footer-linkedin">Social - LinkedIn label</Label>
            <Input id="footer-linkedin" value={config.footerSocialLinkedinLabel || ""} onChange={(e) => onUpdateConfig("footerSocialLinkedinLabel", e.target.value)} />
            <Label htmlFor="footer-whatsapp">Social - WhatsApp label</Label>
            <Input id="footer-whatsapp" value={config.footerSocialWhatsappLabel || ""} onChange={(e) => onUpdateConfig("footerSocialWhatsappLabel", e.target.value)} />
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
