import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import ServicosPage from "./index";

vi.mock("@app/app/i18n", () => ({
  useLocale: () => ({
    lang: "pt",
  }),
  useT: () => ({
    servicesPage: {
      hero: {
        tag: "Soluções",
        title: "Tudo o que seu escritório precisa",
        subtitle: "Subtítulo",
      },
      sections: [
        {
          title: "Produtos digitais",
          description: "Transforme serviços em produtos.",
          features: ["Feature 1", "Feature 2"],
        },
        {
          title: "Checkout personalizado",
          description: "Venda com a identidade do escritório.",
          features: ["Feature 3", "Feature 4"],
        },
        {
          title: "Gestão de processos",
          description: "Acompanhe cada caso com clareza.",
          features: ["Feature 5", "Feature 6"],
        },
        {
          title: "IA aplicada à operação",
          description: "Reduza tarefas repetitivas.",
          features: ["Feature 7", "Feature 8"],
        },
      ],
      info: {
        leadership: {
          title: "Foco em clareza",
          description: "Descrição",
        },
        rigor: {
          title: "Segurança de dados",
          description: "Descrição",
        },
      },
      cta: {
        title: "Veja a Aplikei na prática",
        description: "Descrição",
        button: "Falar com especialista",
      },
    },
  }),
}));

describe("ServicosPage", () => {
  it("renders the conteúdos menu and keeps the active solution highlighted", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/solucoes"]}>
        <ServicosPage />
      </MemoryRouter>,
    );

    const menu = screen.getByRole("navigation", { name: "Conteúdos" });
    expect(menu).toBeInTheDocument();
    expect(within(menu).getByRole("link", { name: /Produtos digitais/, current: "page" })).toBeInTheDocument();

    const firstArticle = document.getElementById("produtos-digitais");
    expect(firstArticle).not.toBeNull();

    await user.click(within(menu).getByRole("link", { name: /IA aplicada à operação/ }));

    expect(window.location.hash).toBe("#ia-aplicada");
  });
});
