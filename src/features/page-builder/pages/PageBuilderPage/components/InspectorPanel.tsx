import { Check, Copy, ImageUp } from "lucide-react";
import { useState } from "react";
import { Input } from "@shared/components/atoms/input";
import { Label } from "@shared/components/atoms/label";
import { Textarea } from "@shared/components/atoms/textarea";
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
          title="Copy link"
        >
          {copiedKey === id ? <Check size={14} className="text-success" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );

  return (
    <aside className="w-full shrink-0 overflow-y-auto border-t border-border bg-card px-3 py-3 lg:w-96 lg:border-l lg:border-t-0">
      <h2 className="text-sm font-black uppercase tracking-wide text-text">
        Landing Configuration
      </h2>
      <p className="mt-1 text-xs text-text-muted">
        Edit links, logo, favicon, and page copy.
      </p>

      <div className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="page-title">Page title</Label>
          <Input
            id="page-title"
            value={config.pageTitle}
            onChange={(e) => onUpdateConfig("pageTitle", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="favicon-upload">Favicon upload</Label>
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
          <Label htmlFor="logo-upload">Logo upload</Label>
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
          <Label htmlFor="lawyer-name">Lawyer name</Label>
          <Input
            id="lawyer-name"
            value={config.lawyerName}
            onChange={(e) => onUpdateConfig("lawyerName", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hero-badge">Top badge</Label>
          <Input
            id="hero-badge"
            value={config.heroBadge}
            onChange={(e) => onUpdateConfig("heroBadge", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lawyer-cta">Lawyer authority copy</Label>
          <Textarea
            id="lawyer-cta"
            value={config.lawyerCtaText}
            onChange={(e) => onUpdateConfig("lawyerCtaText", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expert-tag">Specialist card tag</Label>
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
        )}
        {linkField(
          "contact-url",
          "Contact link (WhatsApp)",
          config.contactUrl,
          (next) => onUpdateConfig("contactUrl", next),
        )}
        <div className="space-y-2">
          <Label htmlFor="hero-title">Main title</Label>
          <Input
            id="hero-title"
            value={config.heroTitle}
            onChange={(e) => onUpdateConfig("heroTitle", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hero-subtitle">Subtitle</Label>
          <Textarea
            id="hero-subtitle"
            value={config.heroSubtitle}
            onChange={(e) => onUpdateConfig("heroSubtitle", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-label">Login button text</Label>
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
        )}
        <div className="space-y-2">
          <Label htmlFor="primary-cta-label">Primary CTA text</Label>
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
        )}
        <div className="space-y-2">
          <Label htmlFor="secondary-cta-label">Secondary CTA text</Label>
          <Input
            id="secondary-cta-label"
            value={config.secondaryCtaLabel}
            onChange={(e) =>
              onUpdateConfig("secondaryCtaLabel", e.target.value)
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="services-title">Services section title</Label>
          <Input
            id="services-title"
            value={config.servicesTitle}
            onChange={(e) => onUpdateConfig("servicesTitle", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="services-subtitle">Services section subtitle</Label>
          <Textarea
            id="services-subtitle"
            value={config.servicesSubtitle}
            onChange={(e) => onUpdateConfig("servicesSubtitle", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="service-b1-name">B1/B2 Service - Name</Label>
          <Input id="service-b1-name" value={config.serviceB1B2Name} onChange={(e) => onUpdateConfig("serviceB1B2Name", e.target.value)} />
          <Label htmlFor="service-b1-desc">B1/B2 Service - Description</Label>
          <Textarea id="service-b1-desc" value={config.serviceB1B2Desc} onChange={(e) => onUpdateConfig("serviceB1B2Desc", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="service-f1-name">F1 Service - Name</Label>
          <Input id="service-f1-name" value={config.serviceF1Name} onChange={(e) => onUpdateConfig("serviceF1Name", e.target.value)} />
          <Label htmlFor="service-f1-desc">F1 Service - Description</Label>
          <Textarea id="service-f1-desc" value={config.serviceF1Desc} onChange={(e) => onUpdateConfig("serviceF1Desc", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="service-eos-name">EOS Service - Name</Label>
          <Input id="service-eos-name" value={config.serviceEOSName} onChange={(e) => onUpdateConfig("serviceEOSName", e.target.value)} />
          <Label htmlFor="service-eos-desc">EOS Service - Description</Label>
          <Textarea id="service-eos-desc" value={config.serviceEOSDesc} onChange={(e) => onUpdateConfig("serviceEOSDesc", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="service-cos-name">COS Service - Name</Label>
          <Input id="service-cos-name" value={config.serviceCOSName} onChange={(e) => onUpdateConfig("serviceCOSName", e.target.value)} />
          <Label htmlFor="service-cos-desc">COS Service - Description</Label>
          <Textarea id="service-cos-desc" value={config.serviceCOSDesc} onChange={(e) => onUpdateConfig("serviceCOSDesc", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="how-title">How It Works title</Label>
          <Input id="how-title" value={config.howItWorksTitle} onChange={(e) => onUpdateConfig("howItWorksTitle", e.target.value)} />
          <Label htmlFor="how-subtitle">Subtitle do Como Funciona</Label>
          <Textarea id="how-subtitle" value={config.howItWorksSubtitle} onChange={(e) => onUpdateConfig("howItWorksSubtitle", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="step-1-title">Step 1 - Title</Label>
          <Input id="step-1-title" value={config.step1Title} onChange={(e) => onUpdateConfig("step1Title", e.target.value)} />
          <Label htmlFor="step-1-desc">Step 1 - Description</Label>
          <Textarea id="step-1-desc" value={config.step1Desc} onChange={(e) => onUpdateConfig("step1Desc", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="step-2-title">Step 2 - Title</Label>
          <Input id="step-2-title" value={config.step2Title} onChange={(e) => onUpdateConfig("step2Title", e.target.value)} />
          <Label htmlFor="step-2-desc">Step 2 - Description</Label>
          <Textarea id="step-2-desc" value={config.step2Desc} onChange={(e) => onUpdateConfig("step2Desc", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="step-3-title">Step 3 - Title</Label>
          <Input id="step-3-title" value={config.step3Title} onChange={(e) => onUpdateConfig("step3Title", e.target.value)} />
          <Label htmlFor="step-3-desc">Step 3 - Description</Label>
          <Textarea id="step-3-desc" value={config.step3Desc} onChange={(e) => onUpdateConfig("step3Desc", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="faq-title">FAQ title</Label>
          <Input id="faq-title" value={config.faqTitle} onChange={(e) => onUpdateConfig("faqTitle", e.target.value)} />
          <Label htmlFor="faq-subtitle">Subtitle do FAQ</Label>
          <Textarea id="faq-subtitle" value={config.faqSubtitle} onChange={(e) => onUpdateConfig("faqSubtitle", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="faq-1-q">FAQ 1 - Question</Label>
          <Input id="faq-1-q" value={config.faq1Question} onChange={(e) => onUpdateConfig("faq1Question", e.target.value)} />
          <Label htmlFor="faq-1-a">FAQ 1 - Answer</Label>
          <Textarea id="faq-1-a" value={config.faq1Answer} onChange={(e) => onUpdateConfig("faq1Answer", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="footer-desc">Footer description</Label>
          <Textarea id="footer-desc" value={config.footerDescription} onChange={(e) => onUpdateConfig("footerDescription", e.target.value)} />
          <Label htmlFor="footer-contact-email">Contact - Email</Label>
          <Input id="footer-contact-email" value={config.footerContactEmail} onChange={(e) => onUpdateConfig("footerContactEmail", e.target.value)} />
          <Label htmlFor="footer-contact-phone">Contact - Phone</Label>
          <Input id="footer-contact-phone" value={config.footerContactPhone} onChange={(e) => onUpdateConfig("footerContactPhone", e.target.value)} />
          <Label htmlFor="footer-contact-location">Contact - Location</Label>
          <Input id="footer-contact-location" value={config.footerContactLocation} onChange={(e) => onUpdateConfig("footerContactLocation", e.target.value)} />
        </div>
      </div>
    </aside>
  );
}
