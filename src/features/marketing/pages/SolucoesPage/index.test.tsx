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
  useT: () => ({
    solutionsPage: {
      tag: "Soluções",
      lead: "Cada solução mostra como a Aplikei ajuda o escritório a reduzir retrabalho, ganhar controle e vender com mais previsibilidade.",
      cta: "Falar com especialista",
      signup: "Quero entender melhor",
    },
    solutionsEnhanced: {
      compareTag: "Por que mudar",
      compareTitle: "Da operação improvisada para um escritório com controle e escala.",
      compareLead: "Veja a diferença entre gastar energia com tarefas soltas e ter um fluxo que sustenta crescimento comercial.",
      beforeLabel: "Sem a Aplikei",
      beforeItems: ["Informações espalhadas em planilhas, e-mails e mensagens.", "Retrabalho e perda de histórico a cada novo caso.", "Falta de visão clara do que está em andamento."],
      afterLabel: "Com a Aplikei",
      afterItems: ["Tudo centralizado em uma única operação organizada.", "Histórico, status e responsáveis sempre visíveis.", "Fluxo padronizado que o time segue sem improviso."],
      showcaseTitle: "O que o escritório ganha com essa solução",
      capabilitiesTag: "Recursos",
      capabilitiesTitle: "Recursos pensados para vender com mais controle",
      capabilitiesLead: "Cada bloco traduz o impacto prático da solução na rotina do escritório.",
    },
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
