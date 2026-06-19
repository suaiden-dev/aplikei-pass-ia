import { cleanup } from "@testing-library/react";
import { render, screen } from "@testing-library/react";
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
  it("renders solution pages by slug", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/solucoes/fluxo-b1b2"]}>
        <Routes>
          <Route path="/solucoes/:slug" element={<SolucoesPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Visto B1/B2" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Falar com especialista" })[0]).toHaveAttribute(
      "href",
      "/contato",
    );
    expect(screen.getAllByRole("link", { name: "Quero entender melhor" })[0]).toHaveAttribute(
      "href",
      "/cadastro",
    );

    cleanup();

    render(
      <MemoryRouter initialEntries={["/solucoes/gerenciar-processos"]}>
        <Routes>
          <Route path="/solucoes/:slug" element={<SolucoesPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Gerenciar Processos" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Simplifique seu fluxo de casos" })).toBeInTheDocument();
  });
});
