import type { LandingPageConfig } from "../types";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function replaceFirst(html: string, pattern: RegExp, replacement: string) {
  return html.replace(pattern, replacement);
}

function replaceAnchorByText(html: string, text: string, href: string, label?: string) {
  const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(
    `<a\\s+href="[^"]*"([^>]*)>\\s*${escapedText}\\s*<\\/a>`,
    "i",
  );
  return html.replace(
    regex,
    `<a href="${escapeHtml(href)}"$1>${escapeHtml(label ?? text)}</a>`,
  );
}

function serviceHref(config: LandingPageConfig, product: string) {
  return `/checkout?office=${encodeURIComponent(config.officeSlug)}&product=${encodeURIComponent(product)}`;
}

function replaceServiceCardLinkByTitle(
  html: string,
  serviceTitle: string,
  href: string,
) {
  const escapedTitle = serviceTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(
    `(<div class="service-card">[\\s\\S]*?<h3 class="service-name">${escapedTitle}<\\/h3>[\\s\\S]*?<a\\s+href=")([^"]*)(" class="btn btn-card">Contratar serviço<\\/a>)`,
    "i",
  );
  return html.replace(regex, `$1${escapeHtml(href)}$3`);
}

function removeServiceCard(html: string, serviceTitle: string) {
  const escapedTitle = serviceTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(
    `<div class="service-card">[\\s\\S]*?<h3 class="service-name">${escapedTitle}<\\/h3>[\\s\\S]*?<\\/div>\\s*`,
    "i",
  );
  return html.replace(regex, "");
}

export function applyTemplateConfig(baseHtml: string, config: LandingPageConfig) {
  let html = baseHtml;

  html = replaceFirst(html, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(config.pageTitle)}</title>`);
  if (/<link\s+rel="icon"/i.test(html)) {
    html = replaceFirst(html, /<link\s+rel="icon"[^>]*>/i, `<link rel="icon" href="${escapeHtml(config.faviconUrl)}" />`);
  } else {
    html = replaceFirst(html, /<\/head>/i, `  <link rel="icon" href="${escapeHtml(config.faviconUrl)}" />\n</head>`);
  }
  html = replaceFirst(html, /<h1 class="hero-title">[\s\S]*?<\/h1>/i, `<h1 class="hero-title">${escapeHtml(config.heroTitle)}</h1>`);
  html = replaceFirst(html, /<p class="hero-description">[\s\S]*?<\/p>/i, `<p class="hero-description">${escapeHtml(config.heroSubtitle)}</p>`);
  html = replaceFirst(html, /<h3 class="expert-name">[\s\S]*?<\/h3>/i, `<h3 class="expert-name">${escapeHtml(config.lawyerName)}</h3>`);
  html = replaceFirst(html, /<p class="expert-title">[\s\S]*?<\/p>/i, `<p class="expert-title">${escapeHtml(config.lawyerCtaText)}</p>`);

  html = html.replace(
    /<span class="logo-text">[\s\S]*?<\/span>/gi,
    `<img src="${escapeHtml(config.logoUrl)}" alt="Logo" style="height:40px;width:auto;object-fit:contain" />`,
  );

  html = replaceAnchorByText(html, "Entrar", config.loginUrl, config.loginButtonLabel);
  html = replaceAnchorByText(html, "Quero análise do meu caso", config.primaryCtaUrl, config.primaryCtaLabel);
  html = replaceAnchorByText(html, "Falar com especialista", config.secondaryCtaUrl, config.secondaryCtaLabel);

  html = replaceServiceCardLinkByTitle(html, "Visto de Turismo", serviceHref(config, "visa-b1b2"));
  html = replaceServiceCardLinkByTitle(html, "Visto de Estudante", serviceHref(config, "visa-f1"));
  html = replaceServiceCardLinkByTitle(html, "Extensão de Status", serviceHref(config, "visa-eos"));
  html = replaceServiceCardLinkByTitle(html, "Troca de Status", serviceHref(config, "visa-cos"));
  html = replaceAnchorByText(html, "WhatsApp", config.contactUrl);

  if (!config.serviceB1B2Enabled) html = removeServiceCard(html, "Visto de Turismo");
  if (!config.serviceF1Enabled) html = removeServiceCard(html, "Visto de Estudante");
  if (!config.serviceEOSEnabled) html = removeServiceCard(html, "Extensão de Status");
  if (!config.serviceCOSEnabled) html = removeServiceCard(html, "Troca de Status");

  return html;
}
