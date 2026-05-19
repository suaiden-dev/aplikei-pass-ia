import { expect, test } from "@playwright/test";
import { mockB1B2Supabase } from "./support/b1b2";

test.describe("B1/B2 onboarding", () => {
  test("renders the guided DS-160 flow on the base route", async ({ page }) => {
    await mockB1B2Supabase(page, {
      slug: "visto-b1-b2",
      currentStep: 0,
    });

    await page.goto("/dashboard/processes/visto-b1-b2/onboarding");

    await expect(page.getByRole("heading", { name: "Formulário DS-160" })).toBeVisible();
    await expect(page.getByText("Etapa 1 de 11")).toBeVisible();
    await expect(page.getByRole("button", { name: "Salvar Rascunho" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Próxima seção" })).toBeVisible();
  });

  test("shows the reapplication subtitle when the route contains reaplicacao", async ({ page }) => {
    await mockB1B2Supabase(page, {
      slug: "visa-b1b2-reaplicacao",
      currentStep: 0,
    });

    await page.goto("/dashboard/processes/visa-b1b2-reaplicacao/onboarding");

    await expect(page.getByRole("heading", { name: "Formulário DS-160" })).toBeVisible();
    await expect(page.getByText("Visto B1/B2 (Reaplicação) — Preenchimento Guiado")).toBeVisible();
  });

  test("renders the consular fee notice at step 8", async ({ page }) => {
    await mockB1B2Supabase(page, {
      slug: "visto-b1-b2",
      currentStep: 8,
    });

    await page.goto("/dashboard/processes/visto-b1-b2/onboarding?step=8");

    await expect(page.getByRole("heading", { name: "Taxa Consular" })).toBeVisible();
    await expect(page.getByText("Voltar para Dashboard")).toBeVisible();
    await expect(page.getByText(/Estamos finalizando a emissão do seu boleto MRV/i)).toBeVisible();
  });
});
