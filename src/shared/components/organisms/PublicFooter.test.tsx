import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { PublicFooter } from "./PublicFooter";

vi.mock("@app/app/i18n", () => ({
  useT: () => ({
    description: "Simplifying consular visa management with technology and automation.",
    servicesHeader: "Services",
    howItWorks: "Who we are",
    services: "Services",
    platform: "Platform",
    legalHeader: "Legal",
    terms: "Terms of Use",
    privacy: "Privacy Policy",
    refund: "Refund Policy",
    contact: "Contact",
    copyright: "© 2026 Aplikei Technologies. All rights reserved.",
  }),
}));

vi.mock("../atoms/AppLogo", () => ({
  AppLogo: () => <div data-testid="app-logo" />,
}));

describe("PublicFooter", () => {
  it("renders only the Instagram social link with the configured URL", () => {
    render(
      <MemoryRouter>
        <PublicFooter />
      </MemoryRouter>,
    );

    const instagramLink = screen.getByRole("link", { name: "Instagram" });
    expect(instagramLink).toHaveAttribute(
      "href",
      "https://www.instagram.com/aplikei.app?utm_source=qr",
    );
    expect(screen.queryByRole("link", { name: "LinkedIn" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "WhatsApp" })).not.toBeInTheDocument();
  });
});
