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

  test("covers all onboarding steps from 0 to 10", async ({ page }) => {
    const processSlug = "visto-b1-b2";
    const basePath = `/dashboard/processes/${processSlug}/onboarding`;

    const assertStep = async (step: number) => {
      await mockB1B2Supabase(page, {
        slug: processSlug,
        currentStep: step,
        stepData: {
          homeCountry: "Brasil",
          securityExceptions: "nao",
          interviewLocation: "São Paulo",
        },
      });

      await page.goto(`${basePath}?step=${step}`);

      if (step <= 1 || step === 4) {
        await expect(page.getByRole("heading", { name: "Formulário DS-160" })).toBeVisible();
        await expect(page.getByText(`Etapa ${step + 1} de 11`)).toBeVisible();
        await expect(page.getByRole("button", { name: "Salvar Rascunho" })).toBeVisible();
        return;
      }

      if (step === 2) {
        await expect(page.getByText(/Criando suas credenciais/i)).toBeVisible();
        await expect(page.getByRole("button", { name: /Voltar para Dashboard/i })).toBeVisible();
        return;
      }

      if (step === 3) {
        await expect(page.getByRole("heading", { name: /Assinatura da DS-160/i })).toBeVisible();
        await expect(page.getByText(/Acesse o site do CEAC/i)).toBeVisible();
        return;
      }

      if (step === 5) {
        await expect(page.getByRole("heading", { name: /AGENDAMENTO CASV/i })).toBeVisible();
        await expect(page.getByRole("button", { name: /CONFIRMAR DATA E SOLICITAR AGENDAMENTO/i })).toBeVisible();
        return;
      }

      if (step === 6) {
        await expect(page.getByText(/UMA CONTA SERÁ CRIADA UTILIZANDO SEU EMAIL/i)).toBeVisible();
        await expect(page.getByRole("button", { name: /Voltar para Dashboard/i })).toBeVisible();
        return;
      }

      if (step === 7) {
        await expect(page.getByRole("heading", { name: /Confirmação de E-mail/i })).toBeVisible();
        await expect(page.getByRole("button", { name: /JÁ CONFIRMEI O EMAIL/i })).toBeVisible();
        return;
      }

      if (step === 8) {
        await expect(page.getByRole("heading", { name: /Taxa Consular/i })).toBeVisible();
        await expect(page.getByRole("button", { name: /Voltar para Dashboard/i })).toBeVisible();
        return;
      }

      if (step === 9) {
        await expect(page.getByRole("heading", { name: /Pagamento da Taxa MRV/i })).toBeVisible();
        await expect(page.getByRole("button", { name: /Cartão de Crédito/i })).toBeVisible();
        await expect(page.getByRole("button", { name: /Boleto Bancário/i })).toBeVisible();
        return;
      }

      await expect(page.getByRole("heading", { name: /Agendamento Final e Preparação/i })).toBeVisible();
      await expect(page.getByText(/Guia de Entrevista/i)).toBeVisible();
      await expect(page.getByText(/Simulado com IA|Treino de Entrevista com IA/i)).toBeVisible();
    };

    for (let step = 0; step <= 10; step += 1) {
      await test.step(`step ${step}`, async () => {
        await assertStep(step);
      });
    }
  });
});
