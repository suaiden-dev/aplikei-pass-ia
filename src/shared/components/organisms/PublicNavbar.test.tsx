import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { PublicNavbar } from "./PublicNavbar";
import { DemoBookingProvider } from "./DemoBookingModal";

vi.mock("@app/app/i18n", () => ({
  useLocale: () => ({
    lang: "pt",
    setLang: vi.fn(),
  }),
  useT: () => ({
    home: "Início",
    howItWorks: "Quem somos",
    solutions: "Soluções",
    services: "Serviços",
    contact: "Fale Conosco",
    bookDemo: "Agendar demo",
    trackMyCase: "Acompanhar Caso",
    login: "Entrar",
  }),
}));

vi.mock("../atoms/AppLogo", () => ({
  AppLogo: () => <div data-testid="app-logo" />,
}));

describe("PublicNavbar", () => {
  it("opens the Soluções mega menu and does not show a direct Serviços top-level link", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <DemoBookingProvider>
          <PublicNavbar />
        </DemoBookingProvider>
      </MemoryRouter>,
    );

    expect(screen.queryByRole("link", { name: "Serviços" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Soluções" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Agendar demo" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Toggle theme")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Soluções" }));

    expect(screen.getByText("Vistos")).toBeInTheDocument();
    expect(screen.getByText("Operação")).toBeInTheDocument();
    expect(screen.getAllByText("Soluções").length).toBeGreaterThan(1);
    expect(screen.getByRole("link", { name: "Ver todas as soluções" })).toHaveAttribute(
      "href",
      "/solucoes/fluxo-b1b2",
    );
    expect(screen.getAllByRole("link", { name: "Visto B1/B2" })[0]).toHaveAttribute(
      "href",
      "/solucoes/fluxo-b1b2",
    );

    await user.click(screen.getByRole("button", { name: "Agendar demo" }));
    expect(screen.getByRole("dialog", { name: "Agendar demo" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nome completo")).toBeInTheDocument();
  });
});
