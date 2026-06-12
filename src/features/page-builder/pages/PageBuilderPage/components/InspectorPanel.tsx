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
  uploadingTestimonialPhoto?: 1 | 2 | 3 | null;
  onUploadLogo?: (file: File) => Promise<void>;
  onUploadFavicon?: (file: File) => Promise<void>;
  onUploadTestimonialPhoto?: (index: 1 | 2 | 3, file: File) => Promise<void>;
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

function isHexColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value);
}

type ThemeKey =
  | "lightPrimaryColor"
  | "lightBackgroundColor"
  | "lightSurfaceColor"
  | "lightTextColor"
  | "lightMutedTextColor"
  | "darkPrimaryColor"
  | "darkBackgroundColor"
  | "darkSurfaceColor"
  | "darkTextColor"
  | "darkMutedTextColor"
  | "primaryButtonColor"
  | "secondaryButtonColor";

const THEME_PRESETS: Array<{
  name: string;
  description: string;
  values: Pick<LandingPageConfig, ThemeKey>;
}> = [
  {
    name: "Aplikei",
    description: "Clean blue default.",
    values: {
      lightPrimaryColor: "#2d63ff",
      lightBackgroundColor: "#ffffff",
      lightSurfaceColor: "#ffffff",
      lightTextColor: "#0b1220",
      lightMutedTextColor: "#516073",
      darkPrimaryColor: "#6ea2ff",
      darkBackgroundColor: "#080d1c",
      darkSurfaceColor: "#101936",
      darkTextColor: "#eef4ff",
      darkMutedTextColor: "#a9b8d4",
      primaryButtonColor: "#2d63ff",
      secondaryButtonColor: "#ffffff",
    },
  },
  {
    name: "Legal Navy",
    description: "Institutional and restrained.",
    values: {
      lightPrimaryColor: "#164e63",
      lightBackgroundColor: "#f8fafc",
      lightSurfaceColor: "#ffffff",
      lightTextColor: "#0f172a",
      lightMutedTextColor: "#475569",
      darkPrimaryColor: "#67e8f9",
      darkBackgroundColor: "#06131f",
      darkSurfaceColor: "#0d2133",
      darkTextColor: "#ecfeff",
      darkMutedTextColor: "#a5b4c4",
      primaryButtonColor: "#164e63",
      secondaryButtonColor: "#ffffff",
    },
  },
  {
    name: "Premium Green",
    description: "Fresh, high-trust palette.",
    values: {
      lightPrimaryColor: "#047857",
      lightBackgroundColor: "#fbfefc",
      lightSurfaceColor: "#ffffff",
      lightTextColor: "#10201a",
      lightMutedTextColor: "#52645d",
      darkPrimaryColor: "#34d399",
      darkBackgroundColor: "#07140f",
      darkSurfaceColor: "#10251c",
      darkTextColor: "#ecfdf5",
      darkMutedTextColor: "#a7c7b7",
      primaryButtonColor: "#047857",
      secondaryButtonColor: "#ffffff",
    },
  },
];

const SECTION_LABELS: Record<LandingSectionKey, string> = {
  services: "Services",
  "how-it-works": "How it works",
  "proof-band": "Proof band",
  testimonials: "Testimonials",
  faq: "FAQ",
};

const DEFAULT_SECTION_ORDER: LandingSectionKey[] = ["services", "how-it-works", "proof-band", "testimonials", "faq"];

function hexToRgb(value: string) {
  if (!isHexColor(value)) return null;
  const hex = value.slice(1);
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

function luminance(value: string) {
  const rgb = hexToRgb(value);
  if (!rgb) return null;

  const channels = [rgb.r, rgb.g, rgb.b].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrastRatio(foreground: string, background: string) {
  const fg = luminance(foreground);
  const bg = luminance(background);
  if (fg === null || bg === null) return null;
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);
  return (lighter + 0.05) / (darker + 0.05);
}

function isLikelyUrl(value: string) {
  if (!value) return true;
  return /^(https?:\/\/|\/|#|mailto:|tel:)/i.test(value);
}

export function InspectorPanel({
  config,
  isUploadingLogo = false,
  isUploadingFavicon = false,
  uploadingTestimonialPhoto = null,
  onUploadLogo,
  onUploadFavicon,
  onUploadTestimonialPhoto,
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

  const colorField = (
    id: string,
    label: string,
    value: string,
    onChange: (next: string) => void,
  ) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="grid grid-cols-[44px_1fr] items-center gap-2">
        <Input
          id={id}
          type="color"
          value={isHexColor(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 cursor-pointer p-1"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#2d63ff"
        />
      </div>
    </div>
  );

  const testimonialPhotoUpload = (index: 1 | 2 | 3) => {
    const id = `testimonial${index}-photo-upload`;
    const isUploading = uploadingTestimonialPhoto === index;

    return (
      <div className="rounded-xl border border-dashed border-border bg-bg-subtle p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="rounded-lg bg-card p-2 text-text-muted">
              <ImageUp size={14} />
            </span>
            <p className="truncate text-xs text-text-muted">
              {isUploading ? "Uploading photo..." : "Upload JPG, PNG, or WebP."}
            </p>
          </div>
          <label
            htmlFor={id}
            className="cursor-pointer rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-text hover:bg-bg-subtle"
          >
            Select
          </label>
        </div>
        <Input
          id={id}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={isUploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file || !onUploadTestimonialPhoto) return;
            void onUploadTestimonialPhoto(index, file);
            e.currentTarget.value = "";
          }}
        />
      </div>
    );
  };

  const applyThemePreset = (preset: Pick<LandingPageConfig, ThemeKey>) => {
    (Object.entries(preset) as Array<[ThemeKey, string]>).forEach(([key, value]) => {
      onUpdateConfig(key, value);
    });
  };

  const resetTheme = () => applyThemePreset(THEME_PRESETS[0].values);
  const sectionOrder = DEFAULT_SECTION_ORDER.map((section) => section).sort((a, b) => {
    const currentOrder = config.sectionOrder?.length ? config.sectionOrder : DEFAULT_SECTION_ORDER;
    const aIndex = currentOrder.indexOf(a);
    const bIndex = currentOrder.indexOf(b);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });
  const moveSection = (section: LandingSectionKey, direction: -1 | 1) => {
    const currentIndex = sectionOrder.indexOf(section);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= sectionOrder.length) return;
    const nextOrder = [...sectionOrder];
    const [item] = nextOrder.splice(currentIndex, 1);
    nextOrder.splice(nextIndex, 0, item);
    onUpdateConfig("sectionOrder", nextOrder);
  };

  const contrastChecks = [
    {
      label: "Light background / text",
      ratio: contrastRatio(config.lightTextColor, config.lightBackgroundColor),
    },
    {
      label: "Light cards / text",
      ratio: contrastRatio(config.lightTextColor, config.lightSurfaceColor),
    },
    {
      label: "Dark background / text",
      ratio: contrastRatio(config.darkTextColor, config.darkBackgroundColor),
    },
    {
      label: "Dark cards / text",
      ratio: contrastRatio(config.darkTextColor, config.darkSurfaceColor),
    },
  ];

  const contrastIssues = contrastChecks.filter((check) => check.ratio !== null && check.ratio < 4.5);
  const urlIssues = [
    ["Primary CTA", config.primaryCtaUrl],
    ["Secondary CTA", config.secondaryCtaUrl],
    ["Contact", config.contactUrl],
    ["SEO image", config.seoImageUrl],
    ["Instagram", config.footerSocialInstagramUrl],
    ["LinkedIn", config.footerSocialLinkedinUrl],
  ].filter(([, value]) => !isLikelyUrl(String(value)));

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

        {/* ── Colors ── */}
        <SectionHeading>Colors</SectionHeading>
        <div className="space-y-2 rounded-lg border border-border bg-background p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-text">Theme presets</p>
            <button
              type="button"
              onClick={resetTheme}
              className="rounded border border-border px-2 py-1 text-[11px] font-semibold text-text-muted hover:text-text"
            >
              Reset
            </button>
          </div>
          <div className="grid gap-2">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyThemePreset(preset.values)}
                className="flex items-center justify-between gap-3 rounded border border-border bg-card px-3 py-2 text-left hover:bg-bg-subtle"
              >
                <span>
                  <span className="block text-xs font-semibold text-text">{preset.name}</span>
                  <span className="block text-[11px] text-text-muted">{preset.description}</span>
                </span>
                <span className="flex shrink-0 overflow-hidden rounded border border-border">
                  <span className="h-5 w-5" style={{ background: preset.values.lightPrimaryColor }} />
                  <span className="h-5 w-5" style={{ background: preset.values.lightBackgroundColor }} />
                  <span className="h-5 w-5" style={{ background: preset.values.darkBackgroundColor }} />
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div
            className="rounded-lg border p-3"
            style={{
              background: isHexColor(config.lightBackgroundColor) ? config.lightBackgroundColor : undefined,
              color: isHexColor(config.lightTextColor) ? config.lightTextColor : undefined,
              borderColor: isHexColor(config.lightSurfaceColor) ? config.lightSurfaceColor : undefined,
            }}
          >
            <div
              className="rounded-md p-2 text-xs font-semibold"
              style={{ background: isHexColor(config.lightSurfaceColor) ? config.lightSurfaceColor : undefined }}
            >
              Light preview
              <span
                className="mt-2 block rounded px-2 py-1 text-center text-[11px]"
                style={{
                  background: isHexColor(config.lightPrimaryColor) ? config.lightPrimaryColor : undefined,
                  color: "#ffffff",
                }}
              >
                Button
              </span>
            </div>
          </div>
          <div
            className="rounded-lg border p-3"
            style={{
              background: isHexColor(config.darkBackgroundColor) ? config.darkBackgroundColor : undefined,
              color: isHexColor(config.darkTextColor) ? config.darkTextColor : undefined,
              borderColor: isHexColor(config.darkSurfaceColor) ? config.darkSurfaceColor : undefined,
            }}
          >
            <div
              className="rounded-md p-2 text-xs font-semibold"
              style={{ background: isHexColor(config.darkSurfaceColor) ? config.darkSurfaceColor : undefined }}
            >
              Dark preview
              <span
                className="mt-2 block rounded px-2 py-1 text-center text-[11px]"
                style={{
                  background: isHexColor(config.darkPrimaryColor) ? config.darkPrimaryColor : undefined,
                  color: config.darkBackgroundColor,
                }}
              >
                Button
              </span>
            </div>
          </div>
        </div>
        {contrastIssues.length ? (
          <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-text">
            <p className="font-semibold">Contrast warnings</p>
            <ul className="mt-2 space-y-1 text-text-muted">
              {contrastIssues.map((issue) => (
                <li key={issue.label}>
                  {issue.label}: {issue.ratio?.toFixed(2)}:1. Recommended minimum is 4.5:1.
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {urlIssues.length ? (
          <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-text">
            <p className="font-semibold">URL warnings</p>
            <ul className="mt-2 space-y-1 text-text-muted">
              {urlIssues.map(([label]) => (
                <li key={label}>{label}: use http(s), /, #, mailto, or tel links.</li>
              ))}
            </ul>
          </div>
        ) : null}
        <details open className="rounded-lg border border-border bg-background p-3">
          <summary className="cursor-pointer text-xs font-semibold text-text">
            Light theme
          </summary>
          <div className="mt-3 space-y-3">
            {colorField("light-primary-color", "Primary color", config.lightPrimaryColor, (next) => onUpdateConfig("lightPrimaryColor", next))}
            {colorField("light-background-color", "Page background", config.lightBackgroundColor, (next) => onUpdateConfig("lightBackgroundColor", next))}
            {colorField("light-surface-color", "Cards and panels", config.lightSurfaceColor, (next) => onUpdateConfig("lightSurfaceColor", next))}
            {colorField("light-text-color", "Main text", config.lightTextColor, (next) => onUpdateConfig("lightTextColor", next))}
            {colorField("light-muted-text-color", "Secondary text", config.lightMutedTextColor, (next) => onUpdateConfig("lightMutedTextColor", next))}
          </div>
        </details>
        <details open className="rounded-lg border border-border bg-background p-3">
          <summary className="cursor-pointer text-xs font-semibold text-text">
            Dark theme
          </summary>
          <div className="mt-3 space-y-3">
            {colorField("dark-primary-color", "Primary color", config.darkPrimaryColor, (next) => onUpdateConfig("darkPrimaryColor", next))}
            {colorField("dark-background-color", "Page background", config.darkBackgroundColor, (next) => onUpdateConfig("darkBackgroundColor", next))}
            {colorField("dark-surface-color", "Cards and panels", config.darkSurfaceColor, (next) => onUpdateConfig("darkSurfaceColor", next))}
            {colorField("dark-text-color", "Main text", config.darkTextColor, (next) => onUpdateConfig("darkTextColor", next))}
            {colorField("dark-muted-text-color", "Secondary text", config.darkMutedTextColor, (next) => onUpdateConfig("darkMutedTextColor", next))}
          </div>
        </details>
        <details className="rounded-lg border border-border bg-background p-3">
          <summary className="cursor-pointer text-xs font-semibold text-text">
            Components
          </summary>
          <div className="mt-3 space-y-3">
            {colorField("primary-button-color", "Primary button color", config.primaryButtonColor, (next) => onUpdateConfig("primaryButtonColor", next))}
            {colorField("secondary-button-color", "Secondary button color", config.secondaryButtonColor, (next) => onUpdateConfig("secondaryButtonColor", next))}
            <div className="space-y-2">
              <Label htmlFor="card-radius">Card radius</Label>
              <Input
                id="card-radius"
                type="number"
                min="0"
                max="24"
                value={config.cardRadius}
                onChange={(e) => onUpdateConfig("cardRadius", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-shadow-style">Card shadow</Label>
              <select
                id="card-shadow-style"
                value={config.cardShadowStyle}
                onChange={(e) => onUpdateConfig("cardShadowStyle", e.target.value as LandingPageConfig["cardShadowStyle"])}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-text"
              >
                <option value="none">None</option>
                <option value="soft">Soft</option>
                <option value="strong">Strong</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="button-radius-style">Button shape</Label>
              <select
                id="button-radius-style"
                value={config.buttonRadiusStyle}
                onChange={(e) => onUpdateConfig("buttonRadiusStyle", e.target.value as LandingPageConfig["buttonRadiusStyle"])}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-text"
              >
                <option value="pill">Pill</option>
                <option value="soft">Soft</option>
                <option value="square">Square</option>
              </select>
            </div>
          </div>
        </details>

        <details className="rounded-lg border border-border bg-background">
          <summary className="cursor-pointer px-3 py-3 text-xs font-bold uppercase tracking-wide text-text">
            Hero
          </summary>
          <div className="space-y-4 border-t border-border p-3">
        {/* ── Hero ── */}
        <SectionHeading>Hero</SectionHeading>
        <div className="space-y-2">
          <Label htmlFor="hero-badge">Top badge</Label>
          <Input
            id="hero-badge"
            value={config.heroBadge}
            onChange={(e) => onUpdateConfig("heroBadge", e.target.value)}
          />
        </div>
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

        <SectionHeading>Client portal mockup</SectionHeading>
        <div className="space-y-2">
          <Label htmlFor="portal-client-name">Client name</Label>
          <Input id="portal-client-name" value={config.portalClientName} onChange={(e) => onUpdateConfig("portalClientName", e.target.value)} />
          <Label htmlFor="portal-client-initials">Client initials</Label>
          <Input id="portal-client-initials" value={config.portalClientInitials} onChange={(e) => onUpdateConfig("portalClientInitials", e.target.value)} />
          <Label htmlFor="portal-case-type">Case type</Label>
          <Input id="portal-case-type" value={config.portalCaseType} onChange={(e) => onUpdateConfig("portalCaseType", e.target.value)} />
          <Label htmlFor="portal-case-title">Case title</Label>
          <Input id="portal-case-title" value={config.portalCaseTitle} onChange={(e) => onUpdateConfig("portalCaseTitle", e.target.value)} />
          <Label htmlFor="portal-status">Status</Label>
          <Input id="portal-status" value={config.portalStatus} onChange={(e) => onUpdateConfig("portalStatus", e.target.value)} />
          <Label htmlFor="portal-progress">Progress percentage</Label>
          <Input id="portal-progress" value={config.portalProgress} onChange={(e) => onUpdateConfig("portalProgress", e.target.value)} />
          <Label htmlFor="portal-next-title">Next guidance title</Label>
          <Input id="portal-next-title" value={config.portalNextStepTitle} onChange={(e) => onUpdateConfig("portalNextStepTitle", e.target.value)} />
          <Label htmlFor="portal-next-desc">Next guidance description</Label>
          <Textarea id="portal-next-desc" value={config.portalNextStepDesc} onChange={(e) => onUpdateConfig("portalNextStepDesc", e.target.value)} />
        </div>
        <details className="rounded-lg border border-border bg-background p-3">
          <summary className="cursor-pointer text-xs font-semibold text-text">Portal checklist and documents</summary>
          <div className="mt-3 space-y-2">
            <Label htmlFor="portal-task1-title">Task 1 title</Label>
            <Input id="portal-task1-title" value={config.portalTask1Title} onChange={(e) => onUpdateConfig("portalTask1Title", e.target.value)} />
            <Label htmlFor="portal-task1-desc">Task 1 description</Label>
            <Textarea id="portal-task1-desc" value={config.portalTask1Desc} onChange={(e) => onUpdateConfig("portalTask1Desc", e.target.value)} />
            <Label htmlFor="portal-task2-title">Task 2 title</Label>
            <Input id="portal-task2-title" value={config.portalTask2Title} onChange={(e) => onUpdateConfig("portalTask2Title", e.target.value)} />
            <Label htmlFor="portal-task2-desc">Task 2 description</Label>
            <Textarea id="portal-task2-desc" value={config.portalTask2Desc} onChange={(e) => onUpdateConfig("portalTask2Desc", e.target.value)} />
            <Label htmlFor="portal-task3-title">Task 3 title</Label>
            <Input id="portal-task3-title" value={config.portalTask3Title} onChange={(e) => onUpdateConfig("portalTask3Title", e.target.value)} />
            <Label htmlFor="portal-task3-desc">Task 3 description</Label>
            <Textarea id="portal-task3-desc" value={config.portalTask3Desc} onChange={(e) => onUpdateConfig("portalTask3Desc", e.target.value)} />
            <Label htmlFor="portal-doc1-name">Document 1 name</Label>
            <Input id="portal-doc1-name" value={config.portalDoc1Name} onChange={(e) => onUpdateConfig("portalDoc1Name", e.target.value)} />
            <Label htmlFor="portal-doc1-status">Document 1 status</Label>
            <Input id="portal-doc1-status" value={config.portalDoc1Status} onChange={(e) => onUpdateConfig("portalDoc1Status", e.target.value)} />
            <Label htmlFor="portal-doc2-name">Document 2 name</Label>
            <Input id="portal-doc2-name" value={config.portalDoc2Name} onChange={(e) => onUpdateConfig("portalDoc2Name", e.target.value)} />
            <Label htmlFor="portal-doc2-status">Document 2 status</Label>
            <Input id="portal-doc2-status" value={config.portalDoc2Status} onChange={(e) => onUpdateConfig("portalDoc2Status", e.target.value)} />
            <Label htmlFor="portal-doc3-name">Document 3 name</Label>
            <Input id="portal-doc3-name" value={config.portalDoc3Name} onChange={(e) => onUpdateConfig("portalDoc3Name", e.target.value)} />
            <Label htmlFor="portal-doc3-status">Document 3 status</Label>
            <Input id="portal-doc3-status" value={config.portalDoc3Status} onChange={(e) => onUpdateConfig("portalDoc3Status", e.target.value)} />
          </div>
        </details>

        {/* ── Lawyer card ── */}
        <SectionHeading>Lawyer card</SectionHeading>
        <div className="space-y-2">
          <Label htmlFor="lawyer-name">Lawyer name</Label>
          <Input
            id="lawyer-name"
            value={config.lawyerName}
            onChange={(e) => onUpdateConfig("lawyerName", e.target.value)}
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
        <div className="space-y-2">
          <Label htmlFor="expert-stat1-value">Stat 1 - Value</Label>
          <Input
            id="expert-stat1-value"
            value={config.expertStat1Value}
            onChange={(e) => onUpdateConfig("expertStat1Value", e.target.value)}
          />
          <Label htmlFor="expert-stat1-label">Stat 1 - Label</Label>
          <Input
            id="expert-stat1-label"
            value={config.expertStat1Label}
            onChange={(e) => onUpdateConfig("expertStat1Label", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expert-stat2-value">Stat 2 - Value</Label>
          <Input
            id="expert-stat2-value"
            value={config.expertStat2Value}
            onChange={(e) => onUpdateConfig("expertStat2Value", e.target.value)}
          />
          <Label htmlFor="expert-stat2-label">Stat 2 - Label</Label>
          <Input
            id="expert-stat2-label"
            value={config.expertStat2Label}
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
        {linkField(
          "contact-url",
          "Contact link (WhatsApp)",
          config.contactUrl,
          (next) => onUpdateConfig("contactUrl", next),
        )}
          </div>
        </details>

        <details className="rounded-lg border border-border bg-background">
          <summary className="cursor-pointer px-3 py-3 text-xs font-bold uppercase tracking-wide text-text">
            Serviços
          </summary>
          <div className="space-y-4 border-t border-border p-3">
        {/* ── Services ── */}
        <SectionHeading>Visible sections</SectionHeading>
        <div className="space-y-2">
          {toggleField("show-services-section", "Show services section", config.showServicesSection, (next) => onUpdateConfig("showServicesSection", next))}
          {toggleField("show-how-section", "Show how it works section", config.showHowItWorksSection, (next) => onUpdateConfig("showHowItWorksSection", next))}
          {toggleField("show-proof-section", "Show proof band", config.showProofBandSection, (next) => onUpdateConfig("showProofBandSection", next))}
          {toggleField("show-testimonials-section", "Show testimonials section", config.showTestimonialsSection, (next) => onUpdateConfig("showTestimonialsSection", next))}
          {toggleField("show-faq-section", "Show FAQ section", config.showFaqSection, (next) => onUpdateConfig("showFaqSection", next))}
        </div>
        <SectionHeading>Section order</SectionHeading>
        <div className="space-y-2">
          {sectionOrder.map((section, index) => (
            <div
              key={section}
              className="flex items-center justify-between gap-3 rounded border border-border bg-background px-3 py-2 text-sm text-text"
            >
              <span>{SECTION_LABELS[section]}</span>
              <span className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveSection(section, -1)}
                  disabled={index === 0}
                  className="rounded border border-border p-1 text-text-muted hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
                  title="Move up"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(section, 1)}
                  disabled={index === sectionOrder.length - 1}
                  className="rounded border border-border p-1 text-text-muted hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
                  title="Move down"
                >
                  <ArrowDown size={14} />
                </button>
              </span>
            </div>
          ))}
        </div>

        <SectionHeading>Services</SectionHeading>
        <div className="space-y-2">
          <Label htmlFor="services-title">Section title</Label>
          <Input
            id="services-title"
            value={config.servicesTitle}
            onChange={(e) => onUpdateConfig("servicesTitle", e.target.value)}
          />
          <Label htmlFor="services-subtitle">Section subtitle</Label>
          <Textarea
            id="services-subtitle"
            value={config.servicesSubtitle}
            onChange={(e) => onUpdateConfig("servicesSubtitle", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          {toggleField("service-b1-enabled", "Show B1/B2 card", config.serviceB1B2Enabled, (next) => onUpdateConfig("serviceB1B2Enabled", next))}
          <Label htmlFor="service-b1-tag">B1/B2 - Tag</Label>
          <Input id="service-b1-tag" value={config.serviceB1B2Tag} onChange={(e) => onUpdateConfig("serviceB1B2Tag", e.target.value)} />
          <Label htmlFor="service-b1-name">B1/B2 - Name</Label>
          <Input id="service-b1-name" value={config.serviceB1B2Name} onChange={(e) => onUpdateConfig("serviceB1B2Name", e.target.value)} />
          <Label htmlFor="service-b1-desc">B1/B2 - Description</Label>
          <Textarea id="service-b1-desc" value={config.serviceB1B2Desc} onChange={(e) => onUpdateConfig("serviceB1B2Desc", e.target.value)} />
        </div>
        <div className="space-y-2">
          {toggleField("service-f1-enabled", "Show F1 card", config.serviceF1Enabled, (next) => onUpdateConfig("serviceF1Enabled", next))}
          <Label htmlFor="service-f1-tag">F1 - Tag</Label>
          <Input id="service-f1-tag" value={config.serviceF1Tag} onChange={(e) => onUpdateConfig("serviceF1Tag", e.target.value)} />
          <Label htmlFor="service-f1-name">F1 - Name</Label>
          <Input id="service-f1-name" value={config.serviceF1Name} onChange={(e) => onUpdateConfig("serviceF1Name", e.target.value)} />
          <Label htmlFor="service-f1-desc">F1 - Description</Label>
          <Textarea id="service-f1-desc" value={config.serviceF1Desc} onChange={(e) => onUpdateConfig("serviceF1Desc", e.target.value)} />
        </div>
        <div className="space-y-2">
          {toggleField("service-eos-enabled", "Show EOS card", config.serviceEOSEnabled, (next) => onUpdateConfig("serviceEOSEnabled", next))}
          <Label htmlFor="service-eos-tag">EOS - Tag</Label>
          <Input id="service-eos-tag" value={config.serviceEOSTag} onChange={(e) => onUpdateConfig("serviceEOSTag", e.target.value)} />
          <Label htmlFor="service-eos-name">EOS - Name</Label>
          <Input id="service-eos-name" value={config.serviceEOSName} onChange={(e) => onUpdateConfig("serviceEOSName", e.target.value)} />
          <Label htmlFor="service-eos-desc">EOS - Description</Label>
          <Textarea id="service-eos-desc" value={config.serviceEOSDesc} onChange={(e) => onUpdateConfig("serviceEOSDesc", e.target.value)} />
        </div>
        <div className="space-y-2">
          {toggleField("service-cos-enabled", "Show COS card", config.serviceCOSEnabled, (next) => onUpdateConfig("serviceCOSEnabled", next))}
          <Label htmlFor="service-cos-tag">COS - Tag</Label>
          <Input id="service-cos-tag" value={config.serviceCOSTag} onChange={(e) => onUpdateConfig("serviceCOSTag", e.target.value)} />
          <Label htmlFor="service-cos-name">COS - Name</Label>
          <Input id="service-cos-name" value={config.serviceCOSName} onChange={(e) => onUpdateConfig("serviceCOSName", e.target.value)} />
          <Label htmlFor="service-cos-desc">COS - Description</Label>
          <Textarea id="service-cos-desc" value={config.serviceCOSDesc} onChange={(e) => onUpdateConfig("serviceCOSDesc", e.target.value)} />
        </div>
        {/* ── How It Works ── */}
        <SectionHeading>How It Works</SectionHeading>
        <div className="space-y-2">
          <Label htmlFor="how-title">Section title</Label>
          <Input id="how-title" value={config.howItWorksTitle} onChange={(e) => onUpdateConfig("howItWorksTitle", e.target.value)} />
          <Label htmlFor="how-subtitle">Section subtitle</Label>
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
          </div>
        </details>

        <details className="rounded-lg border border-border bg-background">
          <summary className="cursor-pointer px-3 py-3 text-xs font-bold uppercase tracking-wide text-text">
            Depoimentos
          </summary>
          <div className="space-y-4 border-t border-border p-3">
        {/* ── Testimonials ── */}
        <SectionHeading>Testimonials</SectionHeading>
        <div className="space-y-2">
          <Label htmlFor="testimonials-title">Section title</Label>
          <Input id="testimonials-title" value={config.testimonialsTitle} onChange={(e) => onUpdateConfig("testimonialsTitle", e.target.value)} />
          <Label htmlFor="testimonials-subtitle">Section subtitle</Label>
          <Textarea id="testimonials-subtitle" value={config.testimonialsSubtitle} onChange={(e) => onUpdateConfig("testimonialsSubtitle", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="testimonial1-text">Testimonial 1 - Text</Label>
          <Textarea id="testimonial1-text" value={config.testimonial1Text} onChange={(e) => onUpdateConfig("testimonial1Text", e.target.value)} />
          <Label htmlFor="testimonial1-photo">Testimonial 1 - Photo URL</Label>
          <Input id="testimonial1-photo" value={config.testimonial1PhotoUrl} onChange={(e) => onUpdateConfig("testimonial1PhotoUrl", e.target.value)} />
          {testimonialPhotoUpload(1)}
          {config.testimonial1PhotoUrl ? <img src={config.testimonial1PhotoUrl} alt="" className="h-12 w-12 rounded-full border border-border object-cover" /> : null}
          <Label htmlFor="testimonial1-author">Testimonial 1 - Author</Label>
          <Input id="testimonial1-author" value={config.testimonial1Author} onChange={(e) => onUpdateConfig("testimonial1Author", e.target.value)} />
          <Label htmlFor="testimonial1-role">Testimonial 1 - Role</Label>
          <Input id="testimonial1-role" value={config.testimonial1Role} onChange={(e) => onUpdateConfig("testimonial1Role", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="testimonial2-text">Testimonial 2 - Text</Label>
          <Textarea id="testimonial2-text" value={config.testimonial2Text} onChange={(e) => onUpdateConfig("testimonial2Text", e.target.value)} />
          <Label htmlFor="testimonial2-photo">Testimonial 2 - Photo URL</Label>
          <Input id="testimonial2-photo" value={config.testimonial2PhotoUrl} onChange={(e) => onUpdateConfig("testimonial2PhotoUrl", e.target.value)} />
          {testimonialPhotoUpload(2)}
          {config.testimonial2PhotoUrl ? <img src={config.testimonial2PhotoUrl} alt="" className="h-12 w-12 rounded-full border border-border object-cover" /> : null}
          <Label htmlFor="testimonial2-author">Testimonial 2 - Author</Label>
          <Input id="testimonial2-author" value={config.testimonial2Author} onChange={(e) => onUpdateConfig("testimonial2Author", e.target.value)} />
          <Label htmlFor="testimonial2-role">Testimonial 2 - Role</Label>
          <Input id="testimonial2-role" value={config.testimonial2Role} onChange={(e) => onUpdateConfig("testimonial2Role", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="testimonial3-text">Testimonial 3 - Text</Label>
          <Textarea id="testimonial3-text" value={config.testimonial3Text} onChange={(e) => onUpdateConfig("testimonial3Text", e.target.value)} />
          <Label htmlFor="testimonial3-photo">Testimonial 3 - Photo URL</Label>
          <Input id="testimonial3-photo" value={config.testimonial3PhotoUrl} onChange={(e) => onUpdateConfig("testimonial3PhotoUrl", e.target.value)} />
          {testimonialPhotoUpload(3)}
          {config.testimonial3PhotoUrl ? <img src={config.testimonial3PhotoUrl} alt="" className="h-12 w-12 rounded-full border border-border object-cover" /> : null}
          <Label htmlFor="testimonial3-author">Testimonial 3 - Author</Label>
          <Input id="testimonial3-author" value={config.testimonial3Author} onChange={(e) => onUpdateConfig("testimonial3Author", e.target.value)} />
          <Label htmlFor="testimonial3-role">Testimonial 3 - Role</Label>
          <Input id="testimonial3-role" value={config.testimonial3Role} onChange={(e) => onUpdateConfig("testimonial3Role", e.target.value)} />
        </div>
          </div>
        </details>

        <details className="rounded-lg border border-border bg-background">
          <summary className="cursor-pointer px-3 py-3 text-xs font-bold uppercase tracking-wide text-text">
            FAQ/Footer
          </summary>
          <div className="space-y-4 border-t border-border p-3">
        {/* ── FAQ ── */}
        <SectionHeading>FAQ</SectionHeading>
        <div className="space-y-2">
          <Label htmlFor="faq-title">Section title</Label>
          <Input id="faq-title" value={config.faqTitle} onChange={(e) => onUpdateConfig("faqTitle", e.target.value)} />
          <Label htmlFor="faq-subtitle">Section subtitle</Label>
          <Textarea id="faq-subtitle" value={config.faqSubtitle} onChange={(e) => onUpdateConfig("faqSubtitle", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="faq-1-q">FAQ 1 - Question</Label>
          <Input id="faq-1-q" value={config.faq1Question} onChange={(e) => onUpdateConfig("faq1Question", e.target.value)} />
          <Label htmlFor="faq-1-a">FAQ 1 - Answer</Label>
          <Textarea id="faq-1-a" value={config.faq1Answer} onChange={(e) => onUpdateConfig("faq1Answer", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="faq-2-q">FAQ 2 - Question</Label>
          <Input id="faq-2-q" value={config.faq2Question} onChange={(e) => onUpdateConfig("faq2Question", e.target.value)} />
          <Label htmlFor="faq-2-a">FAQ 2 - Answer</Label>
          <Textarea id="faq-2-a" value={config.faq2Answer} onChange={(e) => onUpdateConfig("faq2Answer", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="faq-3-q">FAQ 3 - Question</Label>
          <Input id="faq-3-q" value={config.faq3Question} onChange={(e) => onUpdateConfig("faq3Question", e.target.value)} />
          <Label htmlFor="faq-3-a">FAQ 3 - Answer</Label>
          <Textarea id="faq-3-a" value={config.faq3Answer} onChange={(e) => onUpdateConfig("faq3Answer", e.target.value)} />
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
        <div className="space-y-2">
          <Label htmlFor="footer-links-title">Links section title</Label>
          <Input id="footer-links-title" value={config.footerLinksTitle} onChange={(e) => onUpdateConfig("footerLinksTitle", e.target.value)} />
          <Label htmlFor="footer-link-1">Footer link 1 label</Label>
          <Input id="footer-link-1" value={config.footerLink1Label} onChange={(e) => onUpdateConfig("footerLink1Label", e.target.value)} />
          <Label htmlFor="footer-link-1-url">Footer link 1 URL</Label>
          <Input id="footer-link-1-url" value={config.footerLink1Url} onChange={(e) => onUpdateConfig("footerLink1Url", e.target.value)} />
          <Label htmlFor="footer-link-2">Footer link 2 label</Label>
          <Input id="footer-link-2" value={config.footerLink2Label} onChange={(e) => onUpdateConfig("footerLink2Label", e.target.value)} />
          <Label htmlFor="footer-link-2-url">Footer link 2 URL</Label>
          <Input id="footer-link-2-url" value={config.footerLink2Url} onChange={(e) => onUpdateConfig("footerLink2Url", e.target.value)} />
          <Label htmlFor="footer-link-3">Footer link 3 label</Label>
          <Input id="footer-link-3" value={config.footerLink3Label} onChange={(e) => onUpdateConfig("footerLink3Label", e.target.value)} />
          <Label htmlFor="footer-link-3-url">Footer link 3 URL</Label>
          <Input id="footer-link-3-url" value={config.footerLink3Url} onChange={(e) => onUpdateConfig("footerLink3Url", e.target.value)} />
          <Label htmlFor="footer-link-4">Footer link 4 label</Label>
          <Input id="footer-link-4" value={config.footerLink4Label} onChange={(e) => onUpdateConfig("footerLink4Label", e.target.value)} />
          <Label htmlFor="footer-link-4-url">Footer link 4 URL</Label>
          <Input id="footer-link-4-url" value={config.footerLink4Url} onChange={(e) => onUpdateConfig("footerLink4Url", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="footer-contact-title">Contact section title</Label>
          <Input id="footer-contact-title" value={config.footerContactTitle} onChange={(e) => onUpdateConfig("footerContactTitle", e.target.value)} />
          <Label htmlFor="footer-contact-email">Contact - Email</Label>
          <Input id="footer-contact-email" value={config.footerContactEmail} onChange={(e) => onUpdateConfig("footerContactEmail", e.target.value)} />
          <Label htmlFor="footer-contact-phone">Contact - Phone</Label>
          <Input id="footer-contact-phone" value={config.footerContactPhone} onChange={(e) => onUpdateConfig("footerContactPhone", e.target.value)} />
          <Label htmlFor="footer-contact-location">Contact - Location</Label>
          <Input id="footer-contact-location" value={config.footerContactLocation} onChange={(e) => onUpdateConfig("footerContactLocation", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="footer-copyright">Copyright</Label>
          <Input id="footer-copyright" value={config.footerCopyright} onChange={(e) => onUpdateConfig("footerCopyright", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="footer-instagram">Social - Instagram label</Label>
          <Input id="footer-instagram" value={config.footerSocialInstagramLabel} onChange={(e) => onUpdateConfig("footerSocialInstagramLabel", e.target.value)} />
          <Label htmlFor="footer-instagram-url">Social - Instagram URL</Label>
          <Input id="footer-instagram-url" value={config.footerSocialInstagramUrl} onChange={(e) => onUpdateConfig("footerSocialInstagramUrl", e.target.value)} />
          <Label htmlFor="footer-linkedin">Social - LinkedIn label</Label>
          <Input id="footer-linkedin" value={config.footerSocialLinkedinLabel} onChange={(e) => onUpdateConfig("footerSocialLinkedinLabel", e.target.value)} />
          <Label htmlFor="footer-linkedin-url">Social - LinkedIn URL</Label>
          <Input id="footer-linkedin-url" value={config.footerSocialLinkedinUrl} onChange={(e) => onUpdateConfig("footerSocialLinkedinUrl", e.target.value)} />
          <Label htmlFor="footer-whatsapp">Social - WhatsApp label</Label>
          <Input id="footer-whatsapp" value={config.footerSocialWhatsappLabel} onChange={(e) => onUpdateConfig("footerSocialWhatsappLabel", e.target.value)} />
        </div>
          </div>
        </details>
      </div>
    </aside>
    </TooltipProvider>
  );
}
