import { expect, test } from "@playwright/test";
import { mockF1Supabase } from "./support/f1";

test.describe("F1 onboarding", () => {
  test("renders the guided DS-160 flow on the base route", async ({ page }) => {
    await mockF1Supabase(page, {
      slug: "visto-f1",
      currentStep: 0,
    });

    await page.goto("/dashboard/processes/visto-f1/onboarding");

    await expect(page.getByRole("heading", { name: "Formulário DS-160" })).toBeVisible();
    await expect(page.getByText("Etapa 1 de 13")).toBeVisible();
    await expect(page.getByRole("button", { name: "Salvar Rascunho" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Próxima seção" })).toBeVisible();
  });

  test("shows the reapplication subtitle when the route contains reaplicacao", async ({ page }) => {
    await mockF1Supabase(page, {
      slug: "visa-f1-reaplicacao",
      currentStep: 0,
    });

    await page.goto("/dashboard/processes/visa-f1-reaplicacao/onboarding");

    await expect(page.getByRole("heading", { name: "Formulário DS-160" })).toBeVisible();
    await expect(page.getByText("Visto de Estudante F-1 (Reaplicação) — Preenchimento Guiado")).toBeVisible();
  });

  test("renders I-20 upload stage at step 1", async ({ page }) => {
    await mockF1Supabase(page, {
      slug: "visto-f1",
      currentStep: 1,
    });

    await page.goto("/dashboard/processes/visto-f1/onboarding?step=1");

    await expect(page.getByText("Upload do I-20")).toBeVisible();
    await expect(page.getByText("Selecionar Arquivo")).toBeVisible();
  });

  test("renders admin document review notice at step 2", async ({ page }) => {
    await mockF1Supabase(page, {
      slug: "visto-f1",
      currentStep: 2,
    });

    await page.goto("/dashboard/processes/visto-f1/onboarding?step=2");

    await expect(page.getByText("Revisando Documentos").first()).toBeVisible();
    await expect(
      page.getByText("Excelente! Seus documentos foram recebidos e estão sendo analisados pela nossa equipe.")
    ).toBeVisible();
  });

  test("renders review and sign stage at step 3", async ({ page }) => {
    await mockF1Supabase(page, {
      slug: "visto-f1",
      currentStep: 3,
      stepData: {
        ds160_application_id: "AA00123456",
        ds160_security_answer: "SILVA",
        ds160_birth_date: "1990",
      },
    });

    await page.goto("/dashboard/processes/visto-f1/onboarding?step=3");

    await expect(page.getByText("Assinatura da DS-160")).toBeVisible();
    await expect(page.getByText("Application ID")).toBeVisible();
  });

  test("renders admin final analysis notice at step 5", async ({ page }) => {
    await mockF1Supabase(page, {
      slug: "visto-f1",
      currentStep: 5,
    });

    await page.goto("/dashboard/processes/visto-f1/onboarding?step=5");

    await expect(
      page.getByText("Nossos especialistas estão revisando suas informações e preparando o formulário DS-160 oficial.")
    ).toBeVisible();
  });

  test("renders CASV scheduling preference stage at step 6", async ({ page }) => {
    await mockF1Supabase(page, {
      slug: "visto-f1",
      currentStep: 6,
    });

    await page.goto("/dashboard/processes/visto-f1/onboarding?step=6");

    await expect(page.getByRole("heading", { name: "AGENDAMENTO CASV / CONSULADO" })).toBeVisible();
  });

  test("renders account creation notice at step 7", async ({ page }) => {
    await mockF1Supabase(page, {
      slug: "visto-f1",
      currentStep: 7,
    });

    await page.goto("/dashboard/processes/visto-f1/onboarding?step=7");

    await expect(
      page.getByText("UMA CONTA SERÁ CRIADA NO SITE DO CONSULADO PARA SEU VISTO F-1.").first()
    ).toBeVisible();
  });

  test("renders confirm email stage at step 8", async ({ page }) => {
    await mockF1Supabase(page, {
      slug: "visto-f1",
      currentStep: 8,
    });

    await page.goto("/dashboard/processes/visto-f1/onboarding?step=8");

    await expect(page.getByRole("heading", { name: "Confirmação de E-mail" })).toBeVisible();
  });

  test("renders MRV fee notice at step 9", async ({ page }) => {
    await mockF1Supabase(page, {
      slug: "visto-f1",
      currentStep: 9,
    });

    await page.goto("/dashboard/processes/visto-f1/onboarding?step=9");

    await expect(page.getByRole("heading", { name: "Taxa Consular" })).toBeVisible();
    await expect(page.getByText(/Estamos finalizando a emissão do seu boleto MRV/i)).toBeVisible();
  });

  test("renders MRV fee payment stage at step 10", async ({ page }) => {
    await mockF1Supabase(page, {
      slug: "visto-f1",
      currentStep: 10,
    });

    await page.goto("/dashboard/processes/visto-f1/onboarding?step=10");

    await expect(page.getByRole("heading", { name: "Pagamento da Taxa MRV" })).toBeVisible();
  });

  test("renders final preparation stage at step 11", async ({ page }) => {
    await mockF1Supabase(page, {
      slug: "visto-f1",
      currentStep: 11,
    });

    await page.goto("/dashboard/processes/visto-f1/onboarding?step=11");

    await expect(page.getByRole("heading", { name: "Aguardando Agendamento F-1" })).toBeVisible();
  });

  test("covers all onboarding steps from 0 to 11", async ({ page }) => {
    const processSlug = "visto-f1";
    const basePath = `/dashboard/processes/${processSlug}/onboarding`;

    const assertStep = async (step: number) => {
      await mockF1Supabase(page, {
        slug: processSlug,
        currentStep: step,
        stepData: {
          homeCountry: "Brasil",
          securityExceptions: "nao",
          interviewLocation: "São Paulo",
          ds160_application_id: "AA00123456",
          ds160_security_answer: "SILVA",
          ds160_birth_date: "1990",
        },
      });

      await page.goto(`${basePath}?step=${step}`);

      if (step === 0 || step === 4) {
        await expect(page.getByRole("heading", { name: "Formulário DS-160" })).toBeVisible();
        return;
      }

      if (step === 1) {
        await expect(page.getByText("Upload do I-20")).toBeVisible();
        return;
      }

      if (step === 2) {
        await expect(page.getByText(/Revisando Documentos/i).first()).toBeVisible();
        return;
      }

      if (step === 3) {
        await expect(page.getByText("Assinatura da DS-160")).toBeVisible();
        return;
      }

      if (step === 5) {
        await expect(
          page.getByText("Nossos especialistas estão revisando suas informações e preparando o formulário DS-160 oficial."),
        ).toBeVisible();
        return;
      }

      if (step === 6) {
        await expect(page.getByRole("heading", { name: "AGENDAMENTO CASV / CONSULADO" })).toBeVisible();
        return;
      }

      if (step === 7) {
        await expect(
          page.getByText("UMA CONTA SERÁ CRIADA NO SITE DO CONSULADO PARA SEU VISTO F-1.").first(),
        ).toBeVisible();
        return;
      }

      if (step === 8) {
        await expect(page.getByRole("heading", { name: "Confirmação de E-mail" })).toBeVisible();
        return;
      }

      if (step === 9) {
        await expect(page.getByRole("heading", { name: "Taxa Consular" })).toBeVisible();
        return;
      }

      if (step === 10) {
        await expect(page.getByRole("heading", { name: "Pagamento da Taxa MRV" })).toBeVisible();
        return;
      }

      await expect(page.getByRole("heading", { name: "Aguardando Agendamento F-1" })).toBeVisible();
    };

    for (let step = 0; step <= 11; step += 1) {
      await test.step(`step ${step}`, async () => {
        await assertStep(step);
      });
    }
  });
});
