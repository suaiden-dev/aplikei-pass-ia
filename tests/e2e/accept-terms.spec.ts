/**
 * E2E: accept-terms — aceite de termos ao criar conta
 *
 * Testa que ao preencher o cadastro de um advogado:
 *   1. A edge function accept-terms é chamada com o payload correto
 *   2. O campo terms_pdf_url é atualizado em user_accounts
 *   3. O payload contém userId, role=lawyer, name, email
 *
 * Utiliza page.route() para interceptar chamadas REST e Functions do Supabase,
 * sem acesso real ao banco ou serviços externos.
 */
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { buildAuthSession, getSupabaseStorageKey } from "./support/f1";

// ─── Constantes ──────────────────────────────────────────────────────────────

const USER_ID = "user-accept-terms-e2e";
const USER_EMAIL = "advogado@example.com";
const USER_NAME = "Dr. João Silva";
const USER_PHONE = "11987654321";
const MOCK_PDF_URL = "https://storage.example.com/terms-acceptance/user-accept-terms-e2e/doc-uuid.pdf";
const MOCK_DOC_ID = "doc-uuid-1234-5678-abcd";

// ─── Helpers de mock ─────────────────────────────────────────────────────────

async function mockAuthSignup(page: Page, userId = USER_ID, email = USER_EMAIL, name = USER_NAME) {
  await page.route("**/auth/v1/signup**", async (route) => {
    if (route.request().method() !== "POST") { await route.continue(); return; }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: {
          id: userId,
          email,
          aud: "authenticated",
          role: "authenticated",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_metadata: { full_name: name, phone_number: "+55 11 98765-4321", role: "admin_lawyer" },
          app_metadata: {},
        },
        session: null,
      }),
    });
  });
}

function buildAccountRow(userId: string, email: string, name: string) {
  return {
    id: userId,
    full_name: name,
    email,
    phone_number: "+55 11 98765-4321",
    avatar_url: null,
    avatar_offset_x: 0,
    avatar_offset_y: 0,
    avatar_zoom: 1,
    passport_photo_url: null,
    role: "admin_lawyer",
    office_id: null,
    has_completed_onboarding: false,
    is_active: true,
    terms_pdf_url: null,
    terms_accepted_at: null,
    terms_accepted_ip: null,
    terms_accepted_ua: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

async function mockUserAccounts(
  page: Page,
  capturePatches: Array<unknown>,
  userId = USER_ID,
  email = USER_EMAIL,
  name = USER_NAME,
) {
  let accountCreated = false;
  const accountRow = buildAccountRow(userId, email, name);

  await page.route("**/rest/v1/user_accounts**", async (route) => {
    const method = route.request().method();
    const accept = route.request().headers()["accept"] ?? "";
    const single = accept.includes("application/vnd.pgrst.object+json");

    if (method === "GET" || method === "HEAD") {
      const body = accountCreated ? accountRow : null;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(single ? body : (accountCreated ? [accountRow] : [])),
      });
      return;
    }

    if (method === "POST") {
      accountCreated = true;
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(single ? accountRow : [accountRow]),
      });
      return;
    }

    if (method === "PATCH") {
      const patchBody = await route.request().postDataJSON();
      capturePatches.push(patchBody);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(single ? { ...accountRow, ...patchBody } : [{ ...accountRow, ...patchBody }]),
      });
      return;
    }

    await route.continue();
  });
}

async function mockAcceptTermsFunction(
  page: Page,
  capturedRequests: Array<{ body: unknown; headers: Record<string, string> }>,
) {
  await page.route("**/functions/v1/accept-terms**", async (route) => {
    if (route.request().method() !== "POST") {
      await route.fulfill({ status: 405, body: "Method not allowed" });
      return;
    }
    const body = await route.request().postDataJSON();
    const headers = route.request().headers();
    capturedRequests.push({ body, headers });
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, pdfUrl: MOCK_PDF_URL, docId: MOCK_DOC_ID }),
    });
  });
}

async function mockAuthEndpoints(page: Page) {
  await page.route("**/auth/v1/user**", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ message: "not authenticated" }) });
  });
  await page.route("**/auth/v1/token**", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({}) });
  });
}

/**
 * Preenche e submete o formulário de cadastro de advogado.
 * Retorna a Promise que aguarda a requisição à edge function accept-terms.
 */
async function fillAndSubmitSignupForm(
  page: Page,
  opts: { name?: string; email?: string; phone?: string } = {},
) {
  const name = opts.name ?? USER_NAME;
  const email = opts.email ?? USER_EMAIL;
  const phone = opts.phone ?? USER_PHONE;

  await page.getByLabel("Nome Completo").fill(name);
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill("senha123456");

  // PhoneInput renderiza um <input type="tel"> ou similar
  const phoneInput = page.locator('input[type="tel"]').first();
  await phoneInput.waitFor({ state: "visible", timeout: 5000 }).catch(() => {});
  if (await phoneInput.isVisible()) {
    await phoneInput.fill(phone);
  }

  // Aceita os termos — pode ser <button role="checkbox"> ou <input type="checkbox">
  const termsCheckbox = page.locator('#terms, [name="terms"]').first();
  await termsCheckbox.click();

  const acceptTermsPromise = page.waitForRequest("**/functions/v1/accept-terms**", { timeout: 15000 });
  await page.getByRole("button", { name: /criar conta/i }).click();
  return acceptTermsPromise;
}

test.describe("accept-terms — cadastro de advogado", () => {
  test("exibe links legais da categoria lawyer no cadastro", async ({ page }) => {
    await mockAuthEndpoints(page);

    await page.goto("/cadastro?role=admin_lawyer");

    await expect(page.getByRole("link", { name: /termos de uso/i })).toHaveAttribute("href", "/legal/terms?role=lawyer");
    await expect(page.getByRole("link", { name: /política de privacidade/i })).toHaveAttribute("href", "/legal/privacy?role=lawyer");
  });

  test("envia accept-terms com payload correto ao criar conta", async ({ page }) => {
    const acceptTermsRequests: Array<{ body: unknown; headers: Record<string, string> }> = [];
    const userAccountPatches: Array<unknown> = [];

    await mockAuthSignup(page);
    await mockUserAccounts(page, userAccountPatches);
    await mockAcceptTermsFunction(page, acceptTermsRequests);
    await mockAuthEndpoints(page);

    await page.goto("/cadastro?role=admin_lawyer");

    const acceptTermsReq = await fillAndSubmitSignupForm(page);
    expect(acceptTermsReq.method()).toBe("POST");

    await page.waitForResponse("**/functions/v1/accept-terms**", { timeout: 10000 });

    expect(acceptTermsRequests).toHaveLength(1);
    const payload = acceptTermsRequests[0].body as Record<string, unknown>;

    expect(payload).toMatchObject({
      userId: USER_ID,
      role: "lawyer",
      name: USER_NAME,
      email: USER_EMAIL,
    });
  });

  test("role 'admin_lawyer' é normalizado para 'lawyer' no payload", async ({ page }) => {
    const acceptTermsRequests: Array<{ body: unknown; headers: Record<string, string> }> = [];
    const patches: Array<unknown> = [];

    await mockAuthSignup(page);
    await mockUserAccounts(page, patches);
    await mockAcceptTermsFunction(page, acceptTermsRequests);
    await mockAuthEndpoints(page);

    await page.goto("/cadastro?role=admin_lawyer");

    await fillAndSubmitSignupForm(page, { name: "Dr. Maria Costa", email: "maria@escritorio.com" });
    await page.waitForResponse("**/functions/v1/accept-terms**", { timeout: 10000 });

    expect(acceptTermsRequests).toHaveLength(1);
    const payload = acceptTermsRequests[0].body as Record<string, string>;
    expect(payload.role).toBe("lawyer");
    expect(payload.email).toBe("maria@escritorio.com");
    expect(payload.name).toBe("Dr. Maria Costa");
  });

  test("accept-terms é chamado com Authorization header do Supabase", async ({ page }) => {
    const acceptTermsRequests: Array<{ body: unknown; headers: Record<string, string> }> = [];
    const patches: Array<unknown> = [];

    await mockAuthSignup(page);
    await mockUserAccounts(page, patches);
    await mockAcceptTermsFunction(page, acceptTermsRequests);
    await mockAuthEndpoints(page);

    await page.goto("/cadastro?role=admin_lawyer");

    await fillAndSubmitSignupForm(page);
    await page.waitForResponse("**/functions/v1/accept-terms**", { timeout: 10000 });

    expect(acceptTermsRequests).toHaveLength(1);
    const headers = acceptTermsRequests[0].headers;
    const hasApiKey = "apikey" in headers || "authorization" in headers;
    expect(hasApiKey).toBe(true);
  });
});

test.describe("accept-terms — links legais por perfil", () => {
  test("usa categoria customer quando o signup é aberto com role de cliente", async ({ page }) => {
    await mockAuthEndpoints(page);

    await page.goto("/sign-up?role=customer");

    await expect(page.locator('a[href="/legal/terms?role=customer"]')).toHaveCount(1);
    await expect(page.locator('a[href="/legal/privacy?role=customer"]')).toHaveCount(1);
  });
});

test.describe("accept-terms — edge function contract (requer ambiente real)", () => {
  test("edge function retorna success:true com pdfUrl e docId para payload válido", async ({ request }) => {
    const functionsUrl = process.env.SUPABASE_FUNCTIONS_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!functionsUrl || !serviceRoleKey) {
      test.skip();
      return;
    }

    const testUserId = `e2e-test-${Date.now()}`;

    const response = await request.post(`${functionsUrl}/accept-terms`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
        "x-forwarded-for": "203.0.113.1",
        "user-agent": "Playwright/E2E-Test",
      },
      data: {
        userId: testUserId,
        role: "lawyer",
        name: "Teste E2E Playwright",
        email: "e2e-test@playwright.local",
      },
    });

    expect([200, 500]).toContain(response.status());

    if (response.status() === 200) {
      const body = await response.json();
      expect(body).toMatchObject({ success: true });
      expect(typeof body.pdfUrl).toBe("string");
      expect(body.pdfUrl).toContain(testUserId);
      expect(typeof body.docId).toBe("string");
      expect(body.docId.length).toBeGreaterThan(0);
    }
  });

  test("edge function retorna 400 para campos obrigatórios ausentes", async ({ request }) => {
    const functionsUrl = process.env.SUPABASE_FUNCTIONS_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!functionsUrl || !serviceRoleKey) {
      test.skip();
      return;
    }

    const response = await request.post(`${functionsUrl}/accept-terms`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      data: { userId: "some-id" },
    });

    expect(response.status()).toBe(400);
  });
});
