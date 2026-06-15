import type { LandingPageConfig, LandingSectionKey } from "../types";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeHref(value: string, fallback = "#") {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  if (raw.startsWith("#")) return raw;
  if (raw.startsWith("/")) return raw.startsWith("//") ? fallback : raw;

  try {
    const url = new URL(raw);
    const protocol = url.protocol.toLowerCase();
    if (protocol === "http:" || protocol === "https:" || protocol === "mailto:" || protocol === "tel:") {
      return url.toString();
    }
  } catch {
    return fallback;
  }

  return fallback;
}

function sanitizeImageUrl(value: string, fallback = "") {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;

  try {
    const url = new URL(raw);
    const protocol = url.protocol.toLowerCase();
    if (protocol === "http:" || protocol === "https:") {
      return url.toString();
    }
  } catch {
    return fallback;
  }

  return fallback;
}

function replaceFirst(html: string, pattern: RegExp, replacement: string) {
  return html.replace(pattern, replacement);
}

function replaceByClassNth(
  html: string,
  tag: string,
  className: string,
  index: number,
  value: string,
) {
  const regex = new RegExp(
    `<${tag} class="${className}">[\\s\\S]*?<\\/${tag}>`,
    "gi",
  );
  const matches = html.match(regex);
  if (!matches || !matches[index]) return html;
  return html.replace(matches[index], `<${tag} class="${className}">${escapeHtml(value)}</${tag}>`);
}

function replaceImageByClassNth(
  html: string,
  className: string,
  index: number,
  src: string,
  alt: string,
) {
  const regex = new RegExp(
    `<img class="${className}"[^>]*>`,
    "gi",
  );
  const matches = html.match(regex);
  if (!matches || !matches[index]) return html;
  const safeSrc = escapeHtml(toAbsoluteUrl(sanitizeImageUrl(src)));
  const safeAlt = escapeHtml(alt);
  const fallback = `this.style.opacity='0';this.removeAttribute('src');`;
  return html.replace(
    matches[index],
    `<img class="${className}" src="${safeSrc}" alt="${safeAlt}" loading="lazy" onerror="${fallback}" />`,
  );
}

function replaceFooterContactItem(html: string, index: number, value: string) {
  const blockRegex = /<div class="footer-contact">[\s\S]*?<\/div>\s*<\/div>/i;
  const match = html.match(blockRegex);
  if (!match) return html;

  const block = match[0];
  const liRegex = /<li>[\s\S]*?<\/li>/gi;
  const items = block.match(liRegex);
  if (!items || !items[index]) return html;

  const updatedBlock = block.replace(items[index], `<li>${escapeHtml(value)}</li>`);
  return html.replace(block, updatedBlock);
}

function removeAnchorByText(html: string, text: string) {
  const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`<a\\s+href="[^"]*"[^>]*>\\s*${escapedText}\\s*<\\/a>`, "i");
  return html.replace(regex, "");
}

function replaceAnchorByText(html: string, text: string, href: string, label?: string) {
  const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(
    `<a\\s+href="[^"]*"([^>]*)>\\s*${escapedText}\\s*<\\/a>`,
    "i",
  );
  return html.replace(
    regex,
    `<a href="${escapeHtml(sanitizeHref(href))}"$1>${escapeHtml(label ?? text)}</a>`,
  );
}

function replaceLoginHeaderButton(html: string, href: string, label: string) {
  const regex = /<a\s+href="[^"]*"\s+class="btn btn-outline btn-sm">[\s\S]*?<\/a>/i;
  return html.replace(
    regex,
    `<a href="${escapeHtml(sanitizeHref(href))}" class="btn btn-outline btn-sm">${escapeHtml(label)}</a>`,
  );
}

function replaceTrackCaseHeaderButton(html: string, href: string) {
  const regex = /<a\s+href="[^"]*"\s+class="btn btn-outline btn-sm btn-track">([\s\S]*?)<\/a>/i;
  return html.replace(
    regex,
    `<a href="${escapeHtml(sanitizeHref(href))}" class="btn btn-outline btn-sm btn-track">$1</a>`,
  );
}

function serviceHref(config: LandingPageConfig, product: string) {
  return `/checkout?office=${encodeURIComponent(config.officeSlug)}&product=${encodeURIComponent(product)}`;
}

function replaceServiceCardByIndex(
  html: string,
  index: number,
  updater: (cardHtml: string) => string,
) {
  const cardRegex = /<div class="service-card">[\s\S]*?<a\s+href="[^"]*" class="btn btn-card">[\s\S]*?<\/a>[\s\S]*?<\/div>/gi;
  const matches = html.match(cardRegex);
  if (!matches || !matches[index]) return html;
  return html.replace(matches[index], updater(matches[index]));
}

function replaceServiceCardLinkByIndex(html: string, index: number, href: string) {
  return replaceServiceCardByIndex(html, index, (cardHtml) =>
    cardHtml.replace(/(<a\s+href=")[^"]*(" class="btn btn-card">[\s\S]*?<\/a>)/i, `$1${escapeHtml(href)}$2`),
  );
}

function removeServiceCardByIndex(html: string, index: number) {
  const cardRegex = /<div class="service-card">[\s\S]*?<a\s+href="[^"]*" class="btn btn-card">[\s\S]*?<\/a>[\s\S]*?<\/div>\s*/gi;
  const matches = html.match(cardRegex);
  if (!matches || !matches[index]) return html;
  return html.replace(matches[index], "");
}

function removeBlockByClass(html: string, tag: string, className: string) {
  const regex = new RegExp(`<${tag} class="${className}"[\\s\\S]*?<\\/${tag}>\\s*`, "i");
  return html.replace(regex, "");
}

function getBlockByClass(html: string, tag: string, className: string) {
  const regex = new RegExp(`<${tag} class="${className}"[\\s\\S]*?<\\/${tag}>\\s*`, "i");
  return html.match(regex)?.[0] ?? "";
}

const DEFAULT_SECTION_ORDER: LandingSectionKey[] = ["services", "how-it-works", "proof-band", "testimonials", "faq"];

function normalizeSectionOrder(value: LandingPageConfig["sectionOrder"]) {
  const current = Array.isArray(value) ? value : [];
  return DEFAULT_SECTION_ORDER
    .map((section) => section)
    .sort((a, b) => {
      const aIndex = current.indexOf(a);
      const bIndex = current.indexOf(b);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });
}

function reorderSections(html: string, sectionOrder: LandingPageConfig["sectionOrder"]) {
  const blocks = new Map<LandingSectionKey, string>();
  DEFAULT_SECTION_ORDER.forEach((section) => {
    blocks.set(section, getBlockByClass(html, "section", section));
  });

  let withoutSections = html;
  DEFAULT_SECTION_ORDER.forEach((section) => {
    withoutSections = removeBlockByClass(withoutSections, "section", section);
  });

  const orderedBlocks = normalizeSectionOrder(sectionOrder)
    .map((section) => blocks.get(section))
    .filter(Boolean)
    .join("");

  return withoutSections.replace(/(<section class="hero"[\s\S]*?<\/section>\s*)/i, `$1${orderedBlocks}`);
}

function normalizePercent(value: string) {
  const numeric = Number.parseInt(String(value).replace(/\D/g, ""), 10);
  if (Number.isNaN(numeric)) return "0";
  return String(Math.min(100, Math.max(0, numeric)));
}

function toAbsoluteUrl(value: string) {
  if (!value) return value;
  if (/^https?:\/\//i.test(value)) return value;
  if (typeof window !== "undefined" && value.startsWith("/")) {
    return `${window.location.origin}${value}`;
  }
  return value;
}

function normalizeLoginHref(value: string, officeSlug?: string) {
  const legacyTrackPath = `/track-my-${"case"}`;

  if (officeSlug) return `/track-my-visa?office=${encodeURIComponent(officeSlug)}`;
  if (!value) return "/track-my-visa";

  try {
    const base = typeof window !== "undefined" ? window.location.origin : "https://aplikei.local";
    const url = new URL(value, base);
    const urlOfficeSlug = url.searchParams.get("office") || url.searchParams.get("office_id") || url.searchParams.get("officeId");

    if (urlOfficeSlug) {
      return `/track-my-visa?office=${encodeURIComponent(urlOfficeSlug)}`;
    }

    if (url.pathname === "/acompanhar-meu-caso" || url.pathname === legacyTrackPath) {
      url.pathname = "/track-my-visa";
    }

    if (value.startsWith("/") && typeof window === "undefined") {
      return `${url.pathname}${url.search}${url.hash}`;
    }

    return value.startsWith("/") && typeof window !== "undefined"
      ? `${url.pathname}${url.search}${url.hash}`
      : url.toString();
  } catch {
    return "/track-my-visa";
  }
}

function normalizeProfessionalLoginHref(value: string, officeSlug?: string) {
  if (officeSlug) return `/login?office=${encodeURIComponent(officeSlug)}`;
  if (!value) return "/login";

  try {
    const base = typeof window !== "undefined" ? window.location.origin : "https://aplikei.local";
    const url = new URL(value, base);
    const urlOfficeSlug = url.searchParams.get("office") || url.searchParams.get("office_id") || url.searchParams.get("officeId");

    if (urlOfficeSlug) {
      return `/login?office=${encodeURIComponent(urlOfficeSlug)}`;
    }

    return value.startsWith("/") ? `${url.pathname}${url.search}${url.hash}` : url.toString();
  } catch {
    return "/login";
  }
}

function normalizeHexColor(value: string | undefined, fallback: string) {
  const color = String(value ?? "").trim();
  return /^#[0-9a-f]{6}$/i.test(color) ? color : fallback;
}

function normalizePx(value: string | undefined, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function buttonRadiusValue(value: LandingPageConfig["buttonRadiusStyle"]) {
  if (value === "square") return "4px";
  if (value === "soft") return "10px";
  return "999px";
}

function shadowValues(value: LandingPageConfig["cardShadowStyle"]) {
  if (value === "none") {
    return {
      shadow: "none",
      soft: "none",
    };
  }
  if (value === "strong") {
    return {
      shadow: "0 22px 70px rgba(13, 22, 48, 0.22)",
      soft: "0 18px 48px rgba(13, 22, 48, 0.18)",
    };
  }
  return {
    shadow: "0 16px 48px rgba(13, 22, 48, 0.12)",
    soft: "0 10px 30px rgba(13, 22, 48, 0.08)",
  };
}

function buildColorVariables(config: LandingPageConfig) {
  const lightPrimary = normalizeHexColor(config.lightPrimaryColor, "#2d63ff");
  const lightBackground = normalizeHexColor(config.lightBackgroundColor, "#ffffff");
  const lightSurface = normalizeHexColor(config.lightSurfaceColor, "#ffffff");
  const lightText = normalizeHexColor(config.lightTextColor, "#0b1220");
  const lightMutedText = normalizeHexColor(config.lightMutedTextColor, "#516073");
  const darkPrimary = normalizeHexColor(config.darkPrimaryColor, "#6ea2ff");
  const darkBackground = normalizeHexColor(config.darkBackgroundColor, "#080d1c");
  const darkSurface = normalizeHexColor(config.darkSurfaceColor, "#101936");
  const darkText = normalizeHexColor(config.darkTextColor, "#eef4ff");
  const darkMutedText = normalizeHexColor(config.darkMutedTextColor, "#a9b8d4");
  const primaryButton = normalizeHexColor(config.primaryButtonColor, lightPrimary);
  const secondaryButton = normalizeHexColor(config.secondaryButtonColor, lightSurface);
  const radius = normalizePx(config.cardRadius, 8, 0, 24);
  const buttonRadius = buttonRadiusValue(config.buttonRadiusStyle);
  const shadows = shadowValues(config.cardShadowStyle);

  return `<style id="landing-config-colors">
    :root {
      --primary: ${lightPrimary};
      --primary-2: ${lightPrimary};
      --bg: ${lightBackground};
      --bg-soft: color-mix(in srgb, ${lightBackground} 92%, ${lightPrimary});
      --bg-panel: color-mix(in srgb, ${lightSurface} 94%, ${lightPrimary});
      --surface: ${lightSurface};
      --surface-strong: ${lightSurface};
      --ink: ${lightText};
      --muted: ${lightMutedText};
      --muted-2: ${lightMutedText};
      --hero-ink: ${lightText};
      --hero-muted: ${lightMutedText};
      --hero-highlight: ${lightPrimary};
      --metric-ink: ${lightText};
      --metric-muted: ${lightMutedText};
      --proof-ink: ${lightText};
      --proof-muted: ${lightMutedText};
      --footer-ink: ${lightText};
      --footer-muted: ${lightMutedText};
      --card-button-bg: ${primaryButton};
      --secondary-button-bg: ${secondaryButton};
      --radius: ${radius}px;
      --button-radius: ${buttonRadius};
      --shadow: ${shadows.shadow};
      --shadow-soft: ${shadows.soft};
    }
    :root[data-theme="dark"] {
      --primary: ${darkPrimary};
      --primary-2: ${darkPrimary};
      --bg: ${darkBackground};
      --bg-soft: color-mix(in srgb, ${darkBackground} 88%, ${darkPrimary});
      --bg-panel: color-mix(in srgb, ${darkSurface} 92%, ${darkPrimary});
      --surface: ${darkSurface};
      --surface-strong: ${darkSurface};
      --ink: ${darkText};
      --muted: ${darkMutedText};
      --muted-2: ${darkMutedText};
      --hero-ink: ${darkText};
      --hero-muted: ${darkMutedText};
      --hero-highlight: ${darkPrimary};
      --metric-ink: ${darkText};
      --metric-muted: ${darkMutedText};
      --proof-ink: ${darkText};
      --proof-muted: ${darkMutedText};
      --footer-ink: ${darkText};
      --footer-muted: ${darkMutedText};
      --card-button-bg: ${darkPrimary};
      --secondary-button-bg: color-mix(in srgb, ${darkSurface} 90%, ${darkPrimary});
    }
    .btn {
      border-radius: var(--button-radius);
    }
    .btn-primary {
      background: ${primaryButton};
      box-shadow: 0 14px 30px color-mix(in srgb, ${primaryButton} 34%, transparent);
    }
    .btn-primary:hover {
      background: color-mix(in srgb, ${primaryButton} 88%, #000000);
    }
    .btn-secondary,
    .btn-outline {
      background: var(--secondary-button-bg);
    }
  </style>`;
}

export function applyTemplateConfig(baseHtml: string, config: LandingPageConfig) {
  let html = baseHtml;

  const faviconUrl = toAbsoluteUrl(sanitizeImageUrl(config.faviconUrl, "/logo.png"));
  const loginUrl = normalizeProfessionalLoginHref(config.loginUrl, config.officeSlug);

  html = replaceFirst(html, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(config.pageTitle)}</title>`);
  html = replaceFirst(
    html,
    /<meta name="description" content="[^"]*">/i,
    `<meta name="description" content="${escapeHtml(config.seoDescription)}">`,
  );
  const seoImageUrl = toAbsoluteUrl(sanitizeImageUrl(config.seoImageUrl));
  const socialMeta = [
    `<meta property="og:title" content="${escapeHtml(config.pageTitle)}">`,
    `<meta property="og:description" content="${escapeHtml(config.seoDescription)}">`,
    seoImageUrl ? `<meta property="og:image" content="${escapeHtml(seoImageUrl)}">` : "",
    `<meta name="twitter:card" content="${seoImageUrl ? "summary_large_image" : "summary"}">`,
  ].filter(Boolean).join("\n    ");
  html = replaceFirst(html, /<\/head>/i, `    ${socialMeta}\n</head>`);
  if (/<link\s+rel="icon"/i.test(html)) {
    html = replaceFirst(html, /<link\s+rel="icon"[^>]*>/i, `<link rel="icon" href="${escapeHtml(faviconUrl)}" />`);
  } else {
    html = replaceFirst(html, /<\/head>/i, `  <link rel="icon" href="${escapeHtml(faviconUrl)}" />\n</head>`);
  }
  html = replaceFirst(html, /<\/head>/i, `${buildColorVariables(config)}\n</head>`);
  html = replaceFirst(html, /<h1 class="hero-title">[\s\S]*?<\/h1>/i, `<h1 class="hero-title">${escapeHtml(config.heroTitle)}</h1>`);
  html = replaceFirst(html, /<p class="hero-description">[\s\S]*?<\/p>/i, `<p class="hero-description">${escapeHtml(config.heroSubtitle)}</p>`);
  html = replaceFirst(html, /<div class="badge">[\s\S]*?<\/div>/i, `<div class="badge">${escapeHtml(config.heroBadge)}</div>`);
  html = replaceFirst(html, /<h3 class="expert-name">[\s\S]*?<\/h3>/i, `<h3 class="expert-name">${escapeHtml(config.lawyerName)}</h3>`);
  html = replaceFirst(html, /<p class="expert-title">[\s\S]*?<\/p>/i, `<p class="expert-title">${escapeHtml(config.lawyerCtaText)}</p>`);
  html = replaceFirst(html, /<span class="expert-tag">[\s\S]*?<\/span>/i, `<span class="expert-tag">${escapeHtml(config.expertTag)}</span>`);
  html = replaceByClassNth(html, "span", "stat-value", 0, config.expertStat1Value);
  html = replaceByClassNth(html, "span", "stat-label", 0, config.expertStat1Label);
  html = replaceByClassNth(html, "span", "stat-value", 1, config.expertStat2Value);
  html = replaceByClassNth(html, "span", "stat-label", 1, config.expertStat2Label);

  html = html.replace(
    /<span class="logo-text">[\s\S]*?<\/span>/gi,
    `<img src="${escapeHtml(toAbsoluteUrl(sanitizeImageUrl(config.logoUrl, "/logo.png")))}" alt="Logo" style="height:40px;width:auto;object-fit:contain" />`,
  );

  const trackCaseUrl = normalizeLoginHref("/track-my-visa", config.officeSlug);
  html = replaceTrackCaseHeaderButton(html, trackCaseUrl);

  html = replaceLoginHeaderButton(html, loginUrl, config.loginButtonLabel);
  html = replaceAnchorByText(html, "Entrar", loginUrl, config.loginButtonLabel);
  html = replaceAnchorByText(html, "Log in", loginUrl, config.loginButtonLabel);
  html = replaceAnchorByText(html, "Quero análise do meu caso", config.primaryCtaUrl, config.primaryCtaLabel);
  html = replaceAnchorByText(html, "I want my case reviewed", config.primaryCtaUrl, config.primaryCtaLabel);
  html = replaceAnchorByText(html, "Falar com especialista", config.secondaryCtaUrl, config.secondaryCtaLabel);
  html = replaceAnchorByText(html, "Talk to a specialist", config.secondaryCtaUrl, config.secondaryCtaLabel);

  html = replaceByClassNth(html, "strong", "portal-help-title", 0, config.portalNextStepTitle);
  html = replaceByClassNth(html, "span", "portal-help-desc", 0, config.portalNextStepDesc);
  html = replaceByClassNth(html, "div", "portal-case-type", 0, config.portalCaseType);
  html = replaceByClassNth(html, "div", "portal-case-title", 0, config.portalCaseTitle);
  html = replaceByClassNth(html, "span", "portal-pill", 0, config.portalStatus);
  html = replaceByClassNth(html, "strong", "portal-progress-value", 0, `${normalizePercent(config.portalProgress)}%`);
  html = replaceByClassNth(html, "span", "portal-user-avatar", 0, config.portalClientInitials);
  html = replaceByClassNth(html, "span", "portal-user-name", 0, config.portalClientName);
  html = replaceByClassNth(html, "strong", "portal-task-title", 0, config.portalTask1Title);
  html = replaceByClassNth(html, "span", "portal-task-desc", 0, config.portalTask1Desc);
  html = replaceByClassNth(html, "strong", "portal-task-title", 1, config.portalTask2Title);
  html = replaceByClassNth(html, "span", "portal-task-desc", 1, config.portalTask2Desc);
  html = replaceByClassNth(html, "strong", "portal-task-title", 2, config.portalTask3Title);
  html = replaceByClassNth(html, "span", "portal-task-desc", 2, config.portalTask3Desc);
  html = replaceByClassNth(html, "span", "portal-doc-name", 0, config.portalDoc1Name);
  html = replaceByClassNth(html, "span", "portal-doc-status", 0, config.portalDoc1Status);
  html = replaceByClassNth(html, "span", "portal-doc-name", 1, config.portalDoc2Name);
  html = replaceByClassNth(html, "span", "portal-doc-status", 1, config.portalDoc2Status);
  html = replaceByClassNth(html, "span", "portal-doc-name", 2, config.portalDoc3Name);
  html = replaceByClassNth(html, "span", "portal-doc-status", 2, config.portalDoc3Status);
  html = html.replace(/(<span class="portal-progress-bar"><span style="width:)[^"]*("[^>]*><\/span><\/span>)/i, `$1${normalizePercent(config.portalProgress)}%$2`);

  html = replaceByClassNth(html, "h2", "section-title", 0, config.servicesTitle);
  html = replaceByClassNth(html, "p", "section-subtitle", 0, config.servicesSubtitle);
  html = replaceByClassNth(html, "div", "service-tag", 0, config.serviceB1B2Tag);
  html = replaceByClassNth(html, "h3", "service-name", 0, config.serviceB1B2Name);
  html = replaceByClassNth(html, "p", "service-desc", 0, config.serviceB1B2Desc);
  html = replaceByClassNth(html, "div", "service-tag", 1, config.serviceF1Tag);
  html = replaceByClassNth(html, "h3", "service-name", 1, config.serviceF1Name);
  html = replaceByClassNth(html, "p", "service-desc", 1, config.serviceF1Desc);
  html = replaceByClassNth(html, "div", "service-tag", 2, config.serviceEOSTag);
  html = replaceByClassNth(html, "h3", "service-name", 2, config.serviceEOSName);
  html = replaceByClassNth(html, "p", "service-desc", 2, config.serviceEOSDesc);
  html = replaceByClassNth(html, "div", "service-tag", 3, config.serviceCOSTag);
  html = replaceByClassNth(html, "h3", "service-name", 3, config.serviceCOSName);
  html = replaceByClassNth(html, "p", "service-desc", 3, config.serviceCOSDesc);

  html = replaceServiceCardLinkByIndex(html, 0, serviceHref(config, "visa-b1b2"));
  html = replaceServiceCardLinkByIndex(html, 1, serviceHref(config, "visa-f1"));
  html = replaceServiceCardLinkByIndex(html, 2, serviceHref(config, "visa-eos"));
  html = replaceServiceCardLinkByIndex(html, 3, serviceHref(config, "visa-cos"));
  html = html.replace(/class="btn btn-card">Contratar serviço<\/a>/gi, 'class="btn btn-card">Hire service</a>');
  html = html.replace(/class="btn btn-card">Hire service<\/a>/gi, `class="btn btn-card">${escapeHtml(config.primaryCtaLabel || "Hire service")}</a>`);

  html = replaceByClassNth(html, "h2", "section-title", 1, config.howItWorksTitle);
  html = replaceByClassNth(html, "p", "section-subtitle", 1, config.howItWorksSubtitle);
  html = replaceByClassNth(html, "h3", "step-title", 0, config.step1Title);
  html = replaceByClassNth(html, "p", "step-desc", 0, config.step1Desc);
  html = replaceByClassNth(html, "h3", "step-title", 1, config.step2Title);
  html = replaceByClassNth(html, "p", "step-desc", 1, config.step2Desc);
  html = replaceByClassNth(html, "h3", "step-title", 2, config.step3Title);
  html = replaceByClassNth(html, "p", "step-desc", 2, config.step3Desc);

  html = replaceByClassNth(html, "h2", "section-title", 2, config.testimonialsTitle);
  html = replaceByClassNth(html, "p", "section-subtitle", 2, config.testimonialsSubtitle);
  html = replaceByClassNth(html, "p", "testimonial-text", 0, config.testimonial1Text);
  html = replaceImageByClassNth(html, "testimonial-photo", 0, config.testimonial1PhotoUrl, config.testimonial1Author);
  html = replaceByClassNth(html, "span", "author-name", 0, config.testimonial1Author);
  html = replaceByClassNth(html, "span", "author-role", 0, config.testimonial1Role);
  html = replaceByClassNth(html, "p", "testimonial-text", 1, config.testimonial2Text);
  html = replaceImageByClassNth(html, "testimonial-photo", 1, config.testimonial2PhotoUrl, config.testimonial2Author);
  html = replaceByClassNth(html, "span", "author-name", 1, config.testimonial2Author);
  html = replaceByClassNth(html, "span", "author-role", 1, config.testimonial2Role);
  html = replaceByClassNth(html, "p", "testimonial-text", 2, config.testimonial3Text);
  html = replaceImageByClassNth(html, "testimonial-photo", 2, config.testimonial3PhotoUrl, config.testimonial3Author);
  html = replaceByClassNth(html, "span", "author-name", 2, config.testimonial3Author);
  html = replaceByClassNth(html, "span", "author-role", 2, config.testimonial3Role);

  html = replaceByClassNth(html, "h2", "section-title", 3, config.faqTitle);
  html = replaceByClassNth(html, "p", "section-subtitle", 3, config.faqSubtitle);
  html = replaceByClassNth(html, "div", "faq-question", 0, config.faq1Question);
  html = replaceByClassNth(html, "div", "faq-answer", 0, config.faq1Answer);
  html = replaceByClassNth(html, "div", "faq-question", 1, config.faq2Question);
  html = replaceByClassNth(html, "div", "faq-answer", 1, config.faq2Answer);
  html = replaceByClassNth(html, "div", "faq-question", 2, config.faq3Question);
  html = replaceByClassNth(html, "div", "faq-answer", 2, config.faq3Answer);

  html = replaceFirst(html, /<p class="footer-desc">[\s\S]*?<\/p>/i, `<p class="footer-desc">${escapeHtml(config.footerDescription)}</p>`);
  html = replaceFirst(html, /<div class="footer-links">[\s\S]*?<h4>[\s\S]*?<\/h4>/i, `<div class="footer-links">\n                    <h4>${escapeHtml(config.footerLinksTitle)}</h4>`);
  html = replaceAnchorByText(html, "Serviços", config.footerLink1Url, config.footerLink1Label);
  html = replaceAnchorByText(html, "Services", config.footerLink1Url, config.footerLink1Label);
  html = replaceAnchorByText(html, "Sobre Nós", config.footerLink2Url, config.footerLink2Label);
  html = replaceAnchorByText(html, "About Us", config.footerLink2Url, config.footerLink2Label);
  html = replaceAnchorByText(html, "Depoimentos", config.footerLink3Url, config.footerLink3Label);
  html = replaceAnchorByText(html, "Testimonials", config.footerLink3Url, config.footerLink3Label);
  html = replaceAnchorByText(html, "FAQ", config.footerLink4Url, config.footerLink4Label);
  html = replaceFirst(html, /<div class="footer-contact">[\s\S]*?<h4>[\s\S]*?<\/h4>/i, `<div class="footer-contact">\n                    <h4>${escapeHtml(config.footerContactTitle)}</h4>`);
  html = replaceFooterContactItem(html, 0, config.footerContactEmail);
  html = replaceFooterContactItem(html, 1, config.footerContactPhone);
  html = replaceFooterContactItem(html, 2, config.footerContactLocation);
  html = replaceFirst(html, /<div class="footer-bottom">[\s\S]*?<p>[\s\S]*?<\/p>/i, `<div class="footer-bottom">\n                <p>${escapeHtml(config.footerCopyright)}</p>`);
  if (config.footerSocialInstagramLabel) {
    html = replaceAnchorByText(html, "Instagram", config.footerSocialInstagramUrl, config.footerSocialInstagramLabel);
  } else {
    html = removeAnchorByText(html, "Instagram");
  }
  if (config.footerSocialLinkedinLabel) {
    html = replaceAnchorByText(html, "LinkedIn", config.footerSocialLinkedinUrl, config.footerSocialLinkedinLabel);
  } else {
    html = removeAnchorByText(html, "LinkedIn");
  }
  if (config.footerSocialWhatsappLabel) {
    html = replaceAnchorByText(html, "WhatsApp", config.contactUrl, config.footerSocialWhatsappLabel);
  } else {
    html = removeAnchorByText(html, "WhatsApp");
  }

  const enabledByIndex = [
    config.serviceB1B2Enabled,
    config.serviceF1Enabled,
    config.serviceEOSEnabled,
    config.serviceCOSEnabled,
  ];

  for (let index = enabledByIndex.length - 1; index >= 0; index -= 1) {
    if (!enabledByIndex[index]) {
      html = removeServiceCardByIndex(html, index);
    }
  }

  html = reorderSections(html, config.sectionOrder);

  if (!config.showServicesSection) html = removeBlockByClass(html, "section", "services");
  if (!config.showHowItWorksSection) html = removeBlockByClass(html, "section", "how-it-works");
  if (!config.showProofBandSection) html = removeBlockByClass(html, "section", "proof-band");
  if (!config.showTestimonialsSection) html = removeBlockByClass(html, "section", "testimonials");
  if (!config.showFaqSection) html = removeBlockByClass(html, "section", "faq");

  return html;
}
