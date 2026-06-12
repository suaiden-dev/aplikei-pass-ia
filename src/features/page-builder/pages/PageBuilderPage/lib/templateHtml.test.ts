import { describe, expect, it } from "vitest";
import { defaultLandingPageConfig } from "../hooks/usePageBuilder";
import { getLandingTemplateHtml } from "../templates/LandingTemplate";
import type { LandingPageConfig } from "../types";
import { applyTemplateConfig } from "./templateHtml";

function renderTemplate(overrides: Partial<LandingPageConfig> = {}) {
  const config: LandingPageConfig = {
    ...defaultLandingPageConfig,
    sectionOrder: [...defaultLandingPageConfig.sectionOrder],
    ...overrides,
  };

  return applyTemplateConfig(getLandingTemplateHtml(), config);
}

describe("applyTemplateConfig", () => {
  it("injects SEO metadata, theme colors, and component style variables", () => {
    const html = renderTemplate({
      pageTitle: "Silva Immigration",
      seoDescription: "Visa strategy for families and founders.",
      seoImageUrl: "https://example.com/share.jpg",
      lightPrimaryColor: "#1257ff",
      darkPrimaryColor: "#80b4ff",
      primaryButtonColor: "#0f62fe",
      secondaryButtonColor: "#eef5ff",
      cardRadius: "14",
      cardShadowStyle: "strong",
      buttonRadiusStyle: "soft",
    });

    expect(html).toContain("<title>Silva Immigration</title>");
    expect(html).toContain('<meta name="description" content="Visa strategy for families and founders.">');
    expect(html).toContain('<meta property="og:image" content="https://example.com/share.jpg">');
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image">');
    expect(html).toContain("--primary: #1257ff;");
    expect(html).toContain("--primary: #80b4ff;");
    expect(html).toContain("--card-button-bg: #0f62fe;");
    expect(html).toContain("--secondary-button-bg: #eef5ff;");
    expect(html).toContain("--radius: 14px;");
    expect(html).toContain("--button-radius: 10px;");
    expect(html).toContain("0 22px 70px rgba(13, 22, 48, 0.22)");
  });

  it("replaces client portal content and clamps progress values", () => {
    const html = renderTemplate({
      portalClientName: "Ana Prado",
      portalClientInitials: "AP",
      portalCaseType: "B1/B2 renewal",
      portalCaseTitle: "Consular preparation",
      portalStatus: "Ready",
      portalProgress: "140",
      portalNextStepTitle: "Interview prep",
      portalNextStepDesc: "Review the mock interview notes.",
      portalTask1Title: "Profile complete",
      portalTask1Desc: "Client profile has been reviewed.",
      portalDoc1Name: "Passport scan",
      portalDoc1Status: "Approved",
    });

    expect(html).toContain('<span class="portal-user-avatar">AP</span>');
    expect(html).toContain('<span class="portal-user-name">Ana Prado</span>');
    expect(html).toContain('<div class="portal-case-type">B1/B2 renewal</div>');
    expect(html).toContain('<div class="portal-case-title">Consular preparation</div>');
    expect(html).toContain('<span class="portal-pill">Ready</span>');
    expect(html).toContain('<strong class="portal-progress-value">100%</strong>');
    expect(html).toContain('<span class="portal-progress-bar"><span style="width:100%"></span></span>');
    expect(html).toContain('<strong class="portal-help-title">Interview prep</strong>');
    expect(html).toContain('<span class="portal-help-desc">Review the mock interview notes.</span>');
    expect(html).toContain('<strong class="portal-task-title">Profile complete</strong>');
    expect(html).toContain('<span class="portal-task-desc">Client profile has been reviewed.</span>');
    expect(html).toContain('<span class="portal-doc-name">Passport scan</span>');
    expect(html).toContain('<span class="portal-doc-status">Approved</span>');
  });

  it("renders testimonial copy, authors, roles, and uploaded photos", () => {
    const html = renderTemplate({
      testimonialsTitle: "Client proof",
      testimonialsSubtitle: "Real client results.",
      testimonial1Text: "The process became clear.",
      testimonial1PhotoUrl: "https://example.com/ana.jpg",
      testimonial1Author: "Ana Prado",
      testimonial1Role: "Founder",
    });

    expect(html).toContain('<h2 class="section-title">Client proof</h2>');
    expect(html).toContain('<p class="section-subtitle">Real client results.</p>');
    expect(html).toContain('<p class="testimonial-text">The process became clear.</p>');
    expect(html).toContain('<img class="testimonial-photo" src="https://example.com/ana.jpg" alt="Ana Prado"');
    expect(html).toContain('<span class="author-name">Ana Prado</span>');
    expect(html).toContain('<span class="author-role">Founder</span>');
  });

  it("hides disabled sections and respects configured section order", () => {
    const html = renderTemplate({
      showProofBandSection: false,
      sectionOrder: ["faq", "testimonials", "services", "proof-band", "how-it-works"],
    });

    const faqIndex = html.indexOf('<section class="faq">');
    const testimonialsIndex = html.indexOf('<section class="testimonials">');
    const servicesIndex = html.indexOf('<section class="services">');
    const howItWorksIndex = html.indexOf('<section class="how-it-works">');

    expect(html).not.toContain('<section class="proof-band"');
    expect(faqIndex).toBeGreaterThan(-1);
    expect(testimonialsIndex).toBeGreaterThan(faqIndex);
    expect(servicesIndex).toBeGreaterThan(testimonialsIndex);
    expect(howItWorksIndex).toBeGreaterThan(servicesIndex);
  });

  it("applies footer links and removes disabled service cards", () => {
    const html = renderTemplate({
      officeSlug: "silva-law",
      primaryCtaLabel: "Start now",
      serviceF1Enabled: false,
      serviceEOSEnabled: false,
      footerLink1Label: "Practice areas",
      footerLink1Url: "/services",
      footerSocialInstagramLabel: "IG",
      footerSocialInstagramUrl: "https://instagram.com/silva",
      footerSocialLinkedinLabel: "",
    });

    expect(html).toContain('<a href="/services">Practice areas</a>');
    expect(html).toContain('<a href="https://instagram.com/silva">IG</a>');
    expect(html).not.toContain(">LinkedIn</a>");
    expect(html).toContain('/checkout?office=silva-law&amp;product=visa-b1b2');
    expect(html).toContain('/checkout?office=silva-law&amp;product=visa-cos');
    expect(html).not.toContain('/checkout?office=silva-law&amp;product=visa-f1');
    expect(html).not.toContain('/checkout?office=silva-law&amp;product=visa-eos');
    expect(html).toContain('class="btn btn-card">Start now</a>');
  });

  it("sanitizes unsafe configured URLs before rendering links and images", () => {
    const html = renderTemplate({
      primaryCtaUrl: "javascript:alert(1)",
      secondaryCtaUrl: "data:text/html,<script>alert(1)</script>",
      footerLink1Url: "vbscript:msgbox(1)",
      footerSocialInstagramUrl: "javascript:alert(2)",
      testimonial1PhotoUrl: "data:image/svg+xml,<svg onload=alert(1)>",
      seoImageUrl: "javascript:alert(3)",
      logoUrl: "data:image/svg+xml,<svg onload=alert(4)>",
      faviconUrl: "javascript:alert(5)",
    });

    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("vbscript:");
    expect(html).not.toContain("data:text");
    expect(html).not.toContain("data:image");
    expect(html).toMatch(new RegExp(`<a href="#"[^>]*>${defaultLandingPageConfig.primaryCtaLabel}</a>`));
    expect(html).toContain('<meta name="twitter:card" content="summary">');
    expect(html).not.toContain('property="og:image"');
    expect(html).toMatch(/src="(?:http:\/\/localhost:3000)?\/logo\.png" alt="Logo"/);
    expect(html).toMatch(/<link rel="icon" href="(?:http:\/\/localhost:3000)?\/logo\.png" \/>/);
  });
});
