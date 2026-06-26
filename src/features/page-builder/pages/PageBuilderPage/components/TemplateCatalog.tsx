import { RiGraduationCapLine, RiPlaneLine, RiFileTextLine, RiRefreshLine, RiLinkM } from "react-icons/ri";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Switch } from "@shared/components/atoms/switch";
import type { LandingPageConfig } from "../types";

interface Product {
  enabledKey: keyof LandingPageConfig;
  serviceSlug: string;
  label: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const PRODUCTS: Product[] = [
  {
    enabledKey: "serviceB1B2Enabled",
    serviceSlug: "visa-b1b2",
    label: "Tourist Visa",
    badge: "B1/B2",
    description: "Tourism and business support with profile preparation and DS-160 guidance.",
    icon: <RiPlaneLine size={18} />,
    color: "text-sky-600 bg-sky-50 border-sky-200",
  },
  {
    enabledKey: "serviceF1Enabled",
    serviceSlug: "visa-f1",
    label: "Student Visa",
    badge: "F1",
    description: "Complete plan for students with academic documentation support.",
    icon: <RiGraduationCapLine size={18} />,
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
  },
  {
    enabledKey: "serviceEOSEnabled",
    serviceSlug: "visa-eos",
    label: "Status Extension",
    badge: "EOS",
    description: "Technical filing to extend lawful stay.",
    icon: <RiFileTextLine size={18} />,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  {
    enabledKey: "serviceCOSEnabled",
    serviceSlug: "visa-cos",
    label: "Change of Status",
    badge: "COS",
    description: "Category change with risk mitigation strategy.",
    icon: <RiRefreshLine size={18} />,
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
];

interface TemplateCatalogProps {
  config: LandingPageConfig;
  onUpdateConfig: <K extends keyof LandingPageConfig>(key: K, value: LandingPageConfig[K]) => void;
}

export function TemplateCatalog({ config, onUpdateConfig }: TemplateCatalogProps) {
  const hasOffice = Boolean(config.officeSlug);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const buildCheckoutUrl = (serviceSlug: string) => {
    if (!hasOffice || typeof window === "undefined") return null;
    const url = new URL("/checkout", window.location.origin);
    url.searchParams.set("office", config.officeSlug);
    url.searchParams.set("product", serviceSlug);
    return url.toString();
  };

  const copyCheckoutLink = (slug: string, url: string) => {
    void navigator.clipboard.writeText(url).then(() => {
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 1500);
    });
  };

  return (
    <aside className="w-full shrink-0 overflow-y-auto border-b border-border bg-card px-3 py-3 lg:w-72 lg:border-b-0 lg:border-r">
      <h2 className="text-sm font-black uppercase tracking-wide text-text">Products</h2>
      <p className="mt-1 text-xs text-text-muted">
        Enable the services that will appear on the page for purchase.
      </p>

      {!hasOffice && (
        <div className="mt-3 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2">
          <p className="text-[11px] text-warning font-medium">
            Create an office so checkout links can be generated automatically.
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {PRODUCTS.map((product) => {
          const isEnabled = config[product.enabledKey] as boolean;
          const checkoutUrl = buildCheckoutUrl(product.serviceSlug);

          return (
            <article
              key={product.badge}
              className={`rounded-xl border transition-all ${
                isEnabled ? "border-primary/30 bg-primary/5" : "border-border bg-bg-subtle"
              }`}
            >
              <div className="flex items-center gap-3 p-3">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${product.color}`}
                >
                  {product.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-text">{product.label}</span>
                    <span className="rounded-full bg-border px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-text-muted">
                      {product.badge}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-text-muted">
                    {product.description}
                  </p>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(checked) => onUpdateConfig(product.enabledKey, checked)}
                />
              </div>

              {isEnabled && checkoutUrl && (
                <div className="flex items-start gap-1.5 border-t border-border/50 px-3 pb-2.5 pt-2">
                  <RiLinkM size={12} className="mt-0.5 shrink-0 text-text-muted" />
                  <span className="min-w-0 flex-1 break-all font-mono text-[10px] leading-relaxed text-text-muted">
                    {checkoutUrl}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyCheckoutLink(product.serviceSlug, checkoutUrl)}
                    className="shrink-0 rounded border border-border p-1.5 text-text-muted transition-colors hover:text-text"
                    title="Copy service link"
                  >
                    {copiedSlug === product.serviceSlug ? (
                      <Check size={12} className="text-success" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </aside>
  );
}
