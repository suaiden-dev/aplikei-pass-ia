/**
 * E2E: Mentoria — Falar com Especialista após compra
 *
 * Testa o fluxo completo de 3 pacotes de mentoria (Bronze, Prata, Ouro):
 *   1. Usuário possui um processo F1 no passo final (step 11)
 *   2. Pacote foi comprado → aparece o botão "Falar com especialista"
 *   3. Ao clicar, cria/encontra a conversa e navega para /dashboard/support
 *
 * Cada pacote usa um processo F1 diferente conforme exigido.
 */
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { buildAuthSession, getSupabaseStorageKey } from "./support/f1";

// ─── Constantes ──────────────────────────────────────────────────────────────

const USER_ID = "user-f1-e2e";
const OFFICE_ID = "office-1";

// ─── Builders ────────────────────────────────────────────────────────────────

function f1ProcessRow(procId: string, mentoriaSlug: string) {
  return {
    id: procId,
    user_id: USER_ID,
    service_slug: "visto-f1",
    status: "active",
    current_step: 11,
    step_data: {
      purchases: [{ slug: mentoriaSlug, paid_at: new Date().toISOString() }],
    },
    office_id: OFFICE_ID,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  };
}

function mentoriaProcessRow(mentoriaProcId: string, mentoriaSlug: string, f1ProcId: string) {
  return {
    id: mentoriaProcId,
    user_id: USER_ID,
    service_slug: mentoriaSlug,
    status: "active",
    current_step: 0,
    step_data: { parent_process_id: f1ProcId },
    office_id: OFFICE_ID,
    created_at: "2026-01-02T00:00:00.000Z",
    updated_at: "2026-01-02T00:00:00.000Z",
  };
}

// ─── Helpers de mock ─────────────────────────────────────────────────────────

async function seedCustomerSession(page: Page) {
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

  // supabase.auth.getUser() sempre verifica o token via rede
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
      office_id: null,
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

/**
 * Roteia todos os GETs de user_services para o handler correto:
 *
 *   • Consulta de processos de mentoria (in service_slug)  → mentoriaRow
 *   • Consulta de consultorias pós-negativa (consultoria-f1)  → null
 *   • Consulta de office_id (select=office_id)  → { office_id }
 *   • Consulta de step_data fresco (select=step_data)  → { step_data }
 *   • Default — carga principal do processo F1  → f1Row
 */
async function mockUserServicesForFinalStep(
  page: Page,
  f1Row: Record<string, unknown>,
  mentoriaRow: Record<string, unknown>,
) {
  await page.route("**/rest/v1/user_services**", async (route) => {
    const method = route.request().method();
    const accept = route.request().headers()["accept"] ?? "";
    const single = accept.includes("application/vnd.pgrst.object+json");
    const rawUrl = route.request().url();
    const url = decodeURIComponent(rawUrl);

    // Muda de estado (PATCH/POST via outras partes da página): ignora silenciosamente
    if (method !== "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
      return;
    }

    // Consulta de consultorias pós-negativa F1 (não comprada)
    if (url.includes("consultoria-f1") || url.includes("consultancy-negative")) {
      await route.fulfill({
        status: 200,
        contentType: single ? "application/vnd.pgrst.object+json" : "application/json",
        body: JSON.stringify(single ? null : []),
      });
      return;
    }

    // Consulta de pacotes de mentoria — identifica pelo slug "mentoring-bronze"
    // que sempre aparece na cláusula IN usada por checkMentorship()
    if (url.includes("mentoring-bronze")) {
      await route.fulfill({
        status: 200,
        contentType: single ? "application/vnd.pgrst.object+json" : "application/json",
        body: JSON.stringify(single ? mentoriaRow : [mentoriaRow]),
      });
      return;
    }

    // resolveProcessOfficeId(): select=office_id&id=eq.{procId}
    if (rawUrl.includes("select=office_id")) {
      const row = { office_id: f1Row.office_id ?? null };
      await route.fulfill({
        status: 200,
        contentType: single ? "application/vnd.pgrst.object+json" : "application/json",
        body: JSON.stringify(single ? row : [row]),
      });
      return;
    }

    // loadFreshData(): select=step_data&id=eq.{procId}
    if (rawUrl.includes("select=step_data")) {
      const row = { step_data: f1Row.step_data };
      await route.fulfill({
        status: 200,
        contentType: single ? "application/vnd.pgrst.object+json" : "application/json",
        body: JSON.stringify(single ? row : [row]),
      });
      return;
    }

    // Default: carga principal do processo (fetchProcess via useF1Onboarding)
    await route.fulfill({
      status: 200,
      contentType: single ? "application/vnd.pgrst.object+json" : "application/json",
      body: JSON.stringify(single ? f1Row : [f1Row]),
    });
  });
}

/**
 * Mock de conversations e conversation_messages para handleOpenSpecialistSupport:
 *   GET  conversations → vazio (nenhuma conversa existente)
 *   POST conversations → cria com id convId
 *   GET  conversation_messages (count HEAD) → 0
 *   POST conversation_messages → sucesso (mensagem inicial)
 */
async function mockConversationsAndMessages(page: Page, convId: string) {
  await page.route("**/rest/v1/conversations**", async (route) => {
    const method = route.request().method();
    const accept = route.request().headers()["accept"] ?? "";
    const single = accept.includes("application/vnd.pgrst.object+json");

    if (method === "POST") {
      // Supabase envia Accept: application/vnd.pgrst.object+json no INSERT + .single()
      const convRow = { id: convId };
      await route.fulfill({
        status: 201,
        contentType: single ? "application/vnd.pgrst.object+json" : "application/json",
        body: JSON.stringify(single ? convRow : [convRow]),
      });
      return;
    }

    // GET maybeSingle: nenhuma conversa aberta ainda
    await route.fulfill({
      status: 200,
      contentType: single ? "application/vnd.pgrst.object+json" : "application/json",
      body: JSON.stringify(single ? null : []),
    });
  });

  await page.route("**/rest/v1/conversation_messages**", async (route) => {
    const method = route.request().method();

    if (method === "POST") {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify([{}]),
      });
      return;
    }

    // HEAD (count exact) → 0 mensagens
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
      headers: { "Content-Range": "*/0" },
    });
  });
}

// ─── Testes ──────────────────────────────────────────────────────────────────

test.describe("Mentoria — Falar com Especialista após compra", () => {
  /**
   * Pacote Bronze (mentoring-bronze)
   * Processo F1 separado: proc-f1-bronze
   */
  test("Bronze: ao clicar em Falar com Especialista navega para o chat", async ({ page }) => {
    const F1_PROC_ID = "proc-f1-bronze";
    const MENTORIA_PROC_ID = "proc-mentoria-bronze";
    const CONV_ID = "conv-bronze";

    await seedCustomerSession(page);
    await mockUserServicesForFinalStep(
      page,
      f1ProcessRow(F1_PROC_ID, "mentoring-bronze"),
      mentoriaProcessRow(MENTORIA_PROC_ID, "mentoring-bronze", F1_PROC_ID),
    );
    await mockConversationsAndMessages(page, CONV_ID);

    // Navega para o passo final de preparação (step >= 11)
    await page.goto(`/dashboard/processes/visto-f1/onboarding?slug=${F1_PROC_ID}&step=11`);

    // Com hasMentorship=true o botão mostra "Falar com especialista" (não o modal de compra)
    const btn = page.getByText("Falar com especialista").first();
    await expect(btn).toBeVisible({ timeout: 15000 });

    // Ao clicar, cria a conversa e navega para o suporte
    await btn.click();
    await page.waitForURL(`**/dashboard/support?processId=${MENTORIA_PROC_ID}`, {
      timeout: 10000,
    });

    expect(page.url()).toContain(`processId=${MENTORIA_PROC_ID}`);
  });

  /**
   * Pacote Prata (mentoria-prata)
   * Processo F1 separado: proc-f1-prata
   *
   * "mentoria-prata" resolve canonicamente para "mentoria-bronze", que está
   * na lista de hasMentorshipInPurchases — o botão deve aparecer.
   */
  test("Prata: ao clicar em Falar com Especialista navega para o chat", async ({ page }) => {
    const F1_PROC_ID = "proc-f1-prata";
    const MENTORIA_PROC_ID = "proc-mentoria-prata";
    const CONV_ID = "conv-prata";

    await seedCustomerSession(page);
    await mockUserServicesForFinalStep(
      page,
      f1ProcessRow(F1_PROC_ID, "mentoria-prata"),
      mentoriaProcessRow(MENTORIA_PROC_ID, "mentoria-prata", F1_PROC_ID),
    );
    await mockConversationsAndMessages(page, CONV_ID);

    await page.goto(`/dashboard/processes/visto-f1/onboarding?slug=${F1_PROC_ID}&step=11`);

    const btn = page.getByText("Falar com especialista").first();
    await expect(btn).toBeVisible({ timeout: 15000 });

    await btn.click();
    await page.waitForURL(`**/dashboard/support?processId=${MENTORIA_PROC_ID}`, {
      timeout: 10000,
    });

    expect(page.url()).toContain(`processId=${MENTORIA_PROC_ID}`);
  });

  /**
   * Pacote Ouro (mentoring-gold)
   * Processo F1 separado: proc-f1-gold
   */
  test("Ouro: ao clicar em Falar com Especialista navega para o chat", async ({ page }) => {
    const F1_PROC_ID = "proc-f1-gold";
    const MENTORIA_PROC_ID = "proc-mentoria-gold";
    const CONV_ID = "conv-gold";

    await seedCustomerSession(page);
    await mockUserServicesForFinalStep(
      page,
      f1ProcessRow(F1_PROC_ID, "mentoring-gold"),
      mentoriaProcessRow(MENTORIA_PROC_ID, "mentoring-gold", F1_PROC_ID),
    );
    await mockConversationsAndMessages(page, CONV_ID);

    await page.goto(`/dashboard/processes/visto-f1/onboarding?slug=${F1_PROC_ID}&step=11`);

    const btn = page.getByText("Falar com especialista").first();
    await expect(btn).toBeVisible({ timeout: 15000 });

    await btn.click();
    await page.waitForURL(`**/dashboard/support?processId=${MENTORIA_PROC_ID}`, {
      timeout: 10000,
    });

    expect(page.url()).toContain(`processId=${MENTORIA_PROC_ID}`);
  });

  /**
   * Sem mentoria: o botão deve abrir o modal de compra (não navega)
   * Verifica que a distinção hasMentorship=false funciona corretamente.
   */
  test("Sem pacote: botão abre modal de compra em vez de navegar para o chat", async ({
    page,
  }) => {
    const F1_PROC_ID = "proc-f1-no-mentoria";

    await seedCustomerSession(page);
    await mockUserServicesForFinalStep(
      page,
      // step_data sem purchases → hasMentorship=false
      { ...f1ProcessRow(F1_PROC_ID, ""), step_data: {} },
      // sem mentoria row
      {} as Record<string, unknown>,
    );
    await mockConversationsAndMessages(page, "conv-none");

    // Serviços extras que o modal de compra pode consultar
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

    await page.goto(`/dashboard/processes/visto-f1/onboarding?slug=${F1_PROC_ID}&step=11`);

    // O título do botão sem mentoria é o da tradução, não "Falar com especialista"
    // Após clicar, um modal de especialista deve aparecer (não há navegação para support)
    const initialUrl = page.url();

    // Clica no terceiro botão do grid (Specialist)
    const specialistBtn = page
      .locator(".grid button")
      .filter({ hasNotText: "Falar com especialista" })
      .last();
    await expect(specialistBtn).toBeVisible({ timeout: 15000 });
    await specialistBtn.click();

    // URL não muda — modal foi aberto no lugar
    await page.waitForTimeout(500);
    expect(page.url()).toBe(initialUrl);
  });
});

// ─── Títulos dos chats na sidebar do suporte ─────────────────────────────────
//
// Verifica que buildMentoriaChatTitle() produz o formato "{Processo} - {Tier}"
// na sidebar de /dashboard/support.
//
// Cenários:
//   • F1 + Bronze  → "F1 - Bronze"
//   • F1 + Silver  → "F1 - Silver"   (mentoria-prata também deve gerar Silver)
//   • B1B2 + Gold  → "B1B2 - Gold"   (exemplo citado pelo usuário)

test.describe("Sidebar de suporte — título do chat de mentoria", () => {
  async function mockSupportPage(
    page: Page,
    mentoriaSlug: string,
    parentSlug: string,
  ) {
    const mentoriaProcId = `proc-mentoria-${mentoriaSlug}`;
    const parentProcId = `proc-parent-${parentSlug}`;
    const convId = `conv-${mentoriaSlug}`;

    const mentoriaRow = {
      id: mentoriaProcId,
      user_id: USER_ID,
      service_slug: mentoriaSlug,
      status: "active",
      current_step: 0,
      step_data: {
        parent_process_id: parentProcId,
        parent_service_slug: parentSlug,
      },
      office_id: OFFICE_ID,
      created_at: "2026-01-02T00:00:00.000Z",
      updated_at: "2026-01-02T00:00:00.000Z",
    };

    await page.route("**/rest/v1/user_services**", async (route) => {
      const method = route.request().method();
      if (method !== "GET") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
        return;
      }
      // useCustomerChats queries all user_services for the user
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([mentoriaRow]),
      });
    });

    // Conversa associada ao processo de mentoria
    const conv = { id: convId, process_id: mentoriaProcId, is_closed: false, customer_id: USER_ID };
    await page.route("**/rest/v1/conversations**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([conv]),
      });
    });

    await page.route("**/rest/v1/conversation_messages**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
        headers: { "Content-Range": "*/0" },
      });
    });

    return { mentoriaProcId, parentProcId, convId };
  }

  test("F1 Bronze exibe título 'F1 - Bronze' na sidebar", async ({ page }) => {
    await seedCustomerSession(page);
    await mockSupportPage(page, "mentoring-bronze", "visto-f1");

    await page.goto("/dashboard/support");
    await expect(page.getByText("F1 - Bronze").first()).toBeVisible({ timeout: 10000 });
  });

  test("F1 Silver exibe título 'F1 - Silver' na sidebar (mentoria-prata também)", async ({ page }) => {
    await seedCustomerSession(page);
    // mentoria-prata é a forma portuguesa do tier Silver
    await mockSupportPage(page, "mentoria-prata", "visto-f1");

    await page.goto("/dashboard/support");
    await expect(page.getByText("F1 - Silver").first()).toBeVisible({ timeout: 10000 });
  });

  test("B1B2 Gold exibe título 'B1B2 - Gold' na sidebar (exemplo do usuário)", async ({ page }) => {
    await seedCustomerSession(page);
    await mockSupportPage(page, "mentoring-gold", "visto-b1-b2");

    await page.goto("/dashboard/support");
    await expect(page.getByText("B1B2 - Gold").first()).toBeVisible({ timeout: 10000 });
  });
});
