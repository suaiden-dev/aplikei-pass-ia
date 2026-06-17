import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import SolucoesPage from "./index";

vi.mock("@app/app/i18n", () => ({
  useLocale: () => ({
    lang: "pt",
  }),
}));

describe("SolucoesPage", () => {
  it("renders only one solution page and updates the active menu item on navigation", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/solucoes/fluxo-b1b2"]}>
        <Routes>
          <Route path="/solucoes/:slug" element={<SolucoesPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { level: 1, name: /Fluxo B1\/B2/ })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Menu de soluções" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Fluxo B1\/B2/, current: "page" })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /Gerenciar Processos/ }));

    expect(screen.getByRole("heading", { level: 1, name: /Gerenciar Processos/ })).toBeInTheDocument();
    expect(within(screen.getByRole("navigation", { name: "Menu de soluções" })).getByRole("link", {
      name: /Gerenciar Processos/,
      current: "page",
    })).toBeInTheDocument();
  });
});
