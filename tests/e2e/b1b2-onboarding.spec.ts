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

  test("renders creating credentials notice at step 2", async ({ page }) => {
    await mockB1B2Supabase(page, {
      slug: "visto-b1-b2",
      currentStep: 2,
    });

    await page.goto("/dashboard/processes/visto-b1-b2/onboarding?step=2");

    await expect(page.getByText("Criando suas credenciais...")).toBeVisible();
    await expect(
      page.getByText("Nossa equipe está configurando seu acesso no sistema consular. Isso costuma ser rápido.")
    ).toBeVisible();
  });

  test("renders review and sign stage at step 3", async ({ page }) => {
    await mockB1B2Supabase(page, {
      slug: "visto-b1-b2",
      currentStep: 3,
      stepData: {
        ds160_application_id: "AA00123456",
        ds160_security_answer: "SILVA",
        ds160_birth_date: "1990",
      },
    });

    await page.goto("/dashboard/processes/visto-b1-b2/onboarding?step=3");

    await expect(page.getByText("Assinatura da DS-160")).toBeVisible();
    await expect(page.getByText("Application ID")).toBeVisible();
  });

  test("renders CASV scheduling preference stage at step 5", async ({ page }) => {
    await mockB1B2Supabase(page, {
      slug: "visto-b1-b2",
      currentStep: 5,
    });

    await page.goto("/dashboard/processes/visto-b1-b2/onboarding?step=5");

    await expect(page.getByRole("heading", { name: "AGENDAMENTO CASV / CONSULADO" })).toBeVisible();
  });

  test("renders account creation notice at step 6", async ({ page }) => {
    await mockB1B2Supabase(page, {
      slug: "visto-b1-b2",
      currentStep: 6,
    });

    await page.goto("/dashboard/processes/visto-b1-b2/onboarding?step=6");

    await expect(
      page.getByText("UMA CONTA SERÁ CRIADA UTILIZANDO SEU EMAIL NO SITE DO CONSULADO.")
    ).toBeVisible();
  });

  test("renders confirm email stage at step 7", async ({ page }) => {
    await mockB1B2Supabase(page, {
      slug: "visto-b1-b2",
      currentStep: 7,
    });

    await page.goto("/dashboard/processes/visto-b1-b2/onboarding?step=7");

    await expect(page.getByRole("heading", { name: "Confirmação de E-mail" })).toBeVisible();
  });

  test("renders MRV fee payment stage at step 9", async ({ page }) => {
    await mockB1B2Supabase(page, {
      slug: "visto-b1-b2",
      currentStep: 9,
    });

    await page.goto("/dashboard/processes/visto-b1-b2/onboarding?step=9");

    await expect(page.getByRole("heading", { name: "Pagamento da Taxa MRV" })).toBeVisible();
  });

  test("renders final preparation stage at step 10", async ({ page }) => {
    await mockB1B2Supabase(page, {
      slug: "visto-b1-b2",
      currentStep: 10,
    });

    await page.goto("/dashboard/processes/visto-b1-b2/onboarding?step=10");

    await expect(page.getByRole("heading", { name: "Aguardando Agendamento Final" })).toBeVisible();
  });
});
