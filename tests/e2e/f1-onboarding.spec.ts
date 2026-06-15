import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { buildAuthSession, getSupabaseStorageKey, mockF1Supabase } from "./support/f1";

const USER_ID = "user-f1";
const OFFICE_ID = "office-1";
const REJECTED_PROC_ID = "proc-f1-rejected";
const CONSULTATION_PROC_ID = "proc-consult-f1-negativa";

async function seedRejectedSession(page: Page) {
  const session = buildAuthSession({
    id: USER_ID,
    email: "estudante@example.com",
    full_name: "Cliente F1",
  });

  await page.addInitScript(
    ({ storageKey, value }) => {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    },
    { storageKey: getSupabaseStorageKey(), value: session },
  );

  await page.route("**/auth/v1/user**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: USER_ID,
        email: "estudante@example.com",
        aud: "authenticated",
        role: "authenticated",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
        user_metadata: { full_name: "Cliente F1", role: "customer" },
        app_metadata: {},
      }),
    });
  });

  await page.route("**/rest/v1/user_accounts**", async (route) => {
    const accept = route.request().headers()["accept"] ?? "";
    const single = accept.includes("application/vnd.pgrst.object+json");
    const row = {
      id: USER_ID,
      full_name: "Cliente F1",
      email: "estudante@example.com",
      role: "customer",
      office_id: OFFICE_ID,
      has_completed_onboarding: true,
      is_active: true,
    };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(single ? row : [row]),
    });
  });
}

async function mockRejectedF1FinalStep(page: Page, options?: { consultationPurchased?: boolean }) {
  const mainProcess = {
    id: REJECTED_PROC_ID,
    user_id: USER_ID,
    service_slug: "visto-f1",
    status: "rejected",
    current_step: 11,
    office_id: OFFICE_ID,
    step_data: {
      final_casv_date: "2026-06-12",
      final_casv_time: "08:00",
      final_casv_location: "São Paulo",
      final_consulado_date: "2026-06-13",
      final_consulado_time: "09:00",
      final_consulado_location: "São Paulo",
      interview_outcome: "rejected",
    },
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  };

  const consultationProcess = {
    id: CONSULTATION_PROC_ID,
    user_id: USER_ID,
    service_slug: "consultoria-f1-negativa",
    status: "active",
    current_step: 0,
    office_id: OFFICE_ID,
    step_data: { parent_process_id: REJECTED_PROC_ID },
    created_at: "2026-01-02T00:00:00.000Z",
    updated_at: "2026-01-02T00:00:00.000Z",
  };

  await seedRejectedSession(page);

  await page.route("**/rest/v1/user_services**", async (route) => {
    const method = route.request().method();
    const accept = route.request().headers()["accept"] ?? "";
    const single = accept.includes("application/vnd.pgrst.object+json");
    const rawUrl = decodeURIComponent(route.request().url());

    if (method !== "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
      return;
    }

    if (rawUrl.includes("consultoria-f1-negativa") || rawUrl.includes("consultancy-negative-f1")) {
      const body = options?.consultationPurchased
        ? (single ? consultationProcess : [consultationProcess])
        : (single ? null : []);
      await route.fulfill({
        status: 200,
        contentType: single ? "application/vnd.pgrst.object+json" : "application/json",
        body: JSON.stringify(body),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: single ? "application/vnd.pgrst.object+json" : "application/json",
      body: JSON.stringify(single ? mainProcess : [mainProcess]),
    });
  });

  await page.route("**/rest/v1/services**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.route("**/rest/v1/user_service_prices**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  if (options?.consultationPurchased) {
    await page.route("**/rest/v1/conversations**", async (route) => {
      const method = route.request().method();
      const accept = route.request().headers()["accept"] ?? "";
      const single = accept.includes("application/vnd.pgrst.object+json");

      if (method === "POST") {
        await route.fulfill({
          status: 201,
          contentType: single ? "application/vnd.pgrst.object+json" : "application/json",
          body: JSON.stringify(single ? { id: "conv-consultation" } : [{ id: "conv-consultation" }]),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: single ? "application/vnd.pgrst.object+json" : "application/json",
        body: JSON.stringify(single ? null : []),
      });
    });

    await page.route("**/rest/v1/conversation_messages**", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify([{}]),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
        headers: { "Content-Range": "*/0" },
      });
    });
  }
}

test.describe("F1 onboarding", () => {
  test("renders the guided DS-160 flow on the base route", async ({ page }) => {
    await mockF1Supabase(page, {
      slug: "visto-f1",
      currentStep: 0,
    });

    await page.goto("/dashboard/processes/visto-f1/onboarding");

    await expect(page.getByRole("heading", { name: "Formulário DS-160" })).toBeVisible();
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

  test("rejected final step opens the post-negative chat when consultation was purchased", async ({ page }) => {
    await mockRejectedF1FinalStep(page, { consultationPurchased: true });

    await page.goto(`/dashboard/processes/visto-f1/onboarding?slug=${REJECTED_PROC_ID}&step=11`);

    await expect(page.getByRole("button", { name: "Ir para o chat" })).toBeVisible();
    await page.getByRole("button", { name: "Ir para o chat" }).click();
    await page.waitForURL(`**/dashboard/support?processId=${CONSULTATION_PROC_ID}`, { timeout: 10000 });
  });

  test("rejected final step sends restart to checkout so the client can buy again", async ({ page }) => {
    await mockRejectedF1FinalStep(page, { consultationPurchased: false });

    await page.goto(`/dashboard/processes/visto-f1/onboarding?slug=${REJECTED_PROC_ID}&step=11`);

    await expect(page.getByRole("button", { name: "Recomeçar Processo" })).toBeVisible();
    await page.getByRole("button", { name: "Recomeçar Processo" }).click();
    await page.waitForURL("**/checkout/visa-f1?restart=true**", { timeout: 10000 });
    await expect(page).toHaveURL(/restart=true/);
    await expect(page).toHaveURL(/office_id=office-1/);
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
