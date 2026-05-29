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

function replaceLoginHeaderButton(html: string, href: string, label: string) {
  const regex = /<a\s+href="[^"]*"\s+class="btn btn-outline btn-sm">[\s\S]*?<\/a>/i;
  return html.replace(
    regex,
    `<a href="${escapeHtml(href)}" class="btn btn-outline btn-sm">${escapeHtml(label)}</a>`,
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
  const cardRegex = /<div class="service-card">[\s\S]*?<a\s+href="[^"]*" class="btn btn-card">Contratar serviço<\/a>[\s\S]*?<\/div>/gi;
  const matches = html.match(cardRegex);
  if (!matches || !matches[index]) return html;
  return html.replace(matches[index], updater(matches[index]));
}

function replaceServiceCardLinkByIndex(html: string, index: number, href: string) {
  return replaceServiceCardByIndex(html, index, (cardHtml) =>
    cardHtml.replace(/(<a\s+href=")[^"]*(" class="btn btn-card">Contratar serviço<\/a>)/i, `$1${escapeHtml(href)}$2`),
  );
}

function removeServiceCardByIndex(html: string, index: number) {
  const cardRegex = /<div class="service-card">[\s\S]*?<a\s+href="[^"]*" class="btn btn-card">Contratar serviço<\/a>[\s\S]*?<\/div>\s*/gi;
  const matches = html.match(cardRegex);
  if (!matches || !matches[index]) return html;
  return html.replace(matches[index], "");
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
    `<img src="${escapeHtml(config.logoUrl)}" alt="Logo" style="height:40px;width:auto;object-fit:contain" />`,
  );

  html = replaceLoginHeaderButton(html, config.loginUrl, config.loginButtonLabel);
  html = replaceAnchorByText(html, "Entrar", config.loginUrl, config.loginButtonLabel);
  html = replaceAnchorByText(html, "Log in", config.loginUrl, config.loginButtonLabel);
  html = replaceAnchorByText(html, "Quero análise do meu caso", config.primaryCtaUrl, config.primaryCtaLabel);
  html = replaceAnchorByText(html, "I want my case reviewed", config.primaryCtaUrl, config.primaryCtaLabel);
  html = replaceAnchorByText(html, "Falar com especialista", config.secondaryCtaUrl, config.secondaryCtaLabel);
  html = replaceAnchorByText(html, "Talk to a specialist", config.secondaryCtaUrl, config.secondaryCtaLabel);
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
  html = replaceByClassNth(html, "span", "author-name", 0, config.testimonial1Author);
  html = replaceByClassNth(html, "span", "author-role", 0, config.testimonial1Role);
  html = replaceByClassNth(html, "p", "testimonial-text", 1, config.testimonial2Text);
  html = replaceByClassNth(html, "span", "author-name", 1, config.testimonial2Author);
  html = replaceByClassNth(html, "span", "author-role", 1, config.testimonial2Role);
  html = replaceByClassNth(html, "p", "testimonial-text", 2, config.testimonial3Text);
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
  html = replaceAnchorByText(html, "Serviços", "#", config.footerLink1Label);
  html = replaceAnchorByText(html, "Services", "#", config.footerLink1Label);
  html = replaceAnchorByText(html, "Sobre Nós", "#", config.footerLink2Label);
  html = replaceAnchorByText(html, "About Us", "#", config.footerLink2Label);
  html = replaceAnchorByText(html, "Depoimentos", "#", config.footerLink3Label);
  html = replaceAnchorByText(html, "Testimonials", "#", config.footerLink3Label);
  html = replaceAnchorByText(html, "FAQ", "#", config.footerLink4Label);
  html = replaceFirst(html, /<div class="footer-contact">[\s\S]*?<h4>[\s\S]*?<\/h4>/i, `<div class="footer-contact">\n                    <h4>${escapeHtml(config.footerContactTitle)}</h4>`);
  html = replaceFooterContactItem(html, 0, config.footerContactEmail);
  html = replaceFooterContactItem(html, 1, config.footerContactPhone);
  html = replaceFooterContactItem(html, 2, config.footerContactLocation);
  html = replaceFirst(html, /<div class="footer-bottom">[\s\S]*?<p>[\s\S]*?<\/p>/i, `<div class="footer-bottom">\n                <p>${escapeHtml(config.footerCopyright)}</p>`);
  html = replaceAnchorByText(html, "Instagram", "#", config.footerSocialInstagramLabel);
  html = replaceAnchorByText(html, "LinkedIn", "#", config.footerSocialLinkedinLabel);
  html = replaceAnchorByText(html, "WhatsApp", config.contactUrl, config.footerSocialWhatsappLabel);

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

  return html;
}
