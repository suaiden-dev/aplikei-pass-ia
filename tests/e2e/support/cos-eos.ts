import type { Page } from "@playwright/test";

type AccountFixture = {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  avatar_url: string | null;
  avatar_offset_x: number;
  avatar_offset_y: number;
  avatar_zoom: number;
  passport_photo_url: string | null;
  role: string;
  office_id: string | null;
  has_completed_onboarding: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function getProjectRef() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error("Missing VITE_SUPABASE_URL for Playwright tests.");
  }
  return new URL(supabaseUrl).hostname.split(".")[0];
}

export function getSupabaseStorageKey() {
  return `sb-${getProjectRef()}-auth-token`;
}

export function buildAuthSession(overrides?: Partial<AccountFixture>) {
  const now = new Date();
  const userId = overrides?.id ?? "user-cos-eos";
  const email = overrides?.email ?? "cliente@example.com";
  const fullName = overrides?.full_name ?? "Cliente COS/EOS";

  return {
    access_token: "playwright-access-token",
    refresh_token: "playwright-refresh-token",
    expires_in: 3600,
    expires_at: Math.floor(now.getTime() / 1000) + 3600,
    token_type: "bearer",
    user: {
      id: userId,
      email,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      aud: "authenticated",
      role: "authenticated",
      app_metadata: {},
      user_metadata: {
        full_name: fullName,
        phone_number: overrides?.phone_number ?? "+55 11 99999-9999",
        role: "customer",
      },
    },
  };
}

export function buildCOSEOSFixtures(options?: {
  slug?: string;
  currentStep?: number;
  stepData?: Record<string, unknown>;
  dependentsCount?: number;
}) {
  const userId = "user-cos-eos";
  const slug = options?.slug ?? "troca-status";
  const currentStep = options?.currentStep ?? 0;
  const stepData = options?.stepData ?? {};
  const dependentsCount = options?.dependentsCount ?? 0;

  const account: AccountFixture = {
    id: userId,
    full_name: "Cliente COS/EOS",
    email: "cliente@example.com",
    phone_number: "+55 11 99999-9999",
    avatar_url: null,
    avatar_offset_x: 0,
    avatar_offset_y: 0,
    avatar_zoom: 1,
    passport_photo_url: null,
    role: "customer",
    office_id: null,
    has_completed_onboarding: false,
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  };

  const product = {
    id: "prod-cos-eos-123",
    name: "Change/Extension of Status",
    slug: slug,
  };

  const instance = {
    id: "inst-cos-eos-1",
    user_id: userId,
    product_id: product.id,
    status: currentStep >= 11 ? "approved" : "in_progress",
    metadata: { paid_dependents: dependentsCount },
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  };

  const stepTemplates = [
    { id: "cos_application_form", title: "Formulário de Inscrição", order: 0, type: "form" },
    { id: "cos_documents", title: "Documentos Básicos", order: 1, type: "upload" },
    { id: "cos_official_forms", title: "Formulários Oficiais (I-539)", order: 2, type: "form" },
    { id: "cos_final_package", title: "Pacote de Revisão Final", order: 3, type: "final_package" },
    { id: "step-4", title: "Step 4", order: 4, type: "info" },
    { id: "step-5", title: "Step 5", order: 5, type: "info" },
    { id: "step-6", title: "Step 6", order: 6, type: "info" },
    { id: "step-7", title: "Step 7", order: 7, type: "info" },
    { id: "step-8", title: "Step 8", order: 8, type: "info" },
    { id: "step-9", title: "Step 9", order: 9, type: "info" },
    { id: "step-10", title: "Step 10", order: 10, type: "info" },
    { id: "step-11", title: "Step 11", order: 11, type: "info" },
  ];

  const steps = stepTemplates.map((tpl, idx) => {
    let status = "pending";
    if (idx < currentStep) status = "completed";
    else if (idx === currentStep) status = "in_progress";

    let data: Record<string, unknown> = {};
    if (idx === 0) {
      const dependentsArray = Array.from({ length: dependentsCount }, (_, i) => ({
        id: `dep-${i}`,
        name: `Dependente ${i + 1}`,
        relation: "spouse",
        birthDate: "1995-05-15",
        marriageDate: "2020-01-10",
        i94Date: "2026-12-31"
      }));
      data = {
        currentVisa: "B2",
        targetVisa: "F1",
        i94Date: "2026-12-31",
        dependents: dependentsArray,
      };
    } else if (idx === 2) {
      data = stepData;
    }

    return {
      id: `step-instance-${idx}`,
      user_product_id: instance.id,
      product_step_id: tpl.id,
      status: status,
      data: data,
      files: idx === 1 && idx < currentStep ? [
        { name: "i94", path: "mock://i94.pdf", url: "mock://i94.pdf" },
        { name: "passportVisa", path: "mock://passport.pdf", url: "mock://passport.pdf" },
        { name: "proofBrazil", path: "mock://proof.pdf", url: "mock://proof.pdf" },
        { name: "bankStatement", path: "mock://bank.pdf", url: "mock://bank.pdf" }
      ] : [],
      submitted_at: idx < currentStep ? "2026-01-01T01:00:00.000Z" : null,
      reviewed_at: idx < currentStep ? "2026-01-01T02:00:00.000Z" : null,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
      product_step: tpl,
    };
  });

  const userServiceStepData: Record<string, unknown> = {
    paid_dependents: dependentsCount,
  };

  if (currentStep >= 1 || slug === "extensao-status" || dependentsCount > 0) {
    userServiceStepData.currentVisa = "B2";
    userServiceStepData.targetVisa = "F1";
    userServiceStepData.i94Date = "2026-12-31";
    userServiceStepData.dependents = Array.from({ length: dependentsCount }, (_, i) => ({
      id: `dep-${i}`,
      name: `Dependente ${i + 1}`,
      relation: "spouse",
      birthDate: "1995-05-15",
      marriageDate: "2020-01-10",
      i94Date: "2026-12-31"
    }));
  }
  if (currentStep >= 2) {
    Object.assign(userServiceStepData, stepData);
  }

  const userService = {
    id: instance.id,
    user_id: userId,
    service_slug: slug,
    status: instance.status === "approved" ? "completed" : "active",
    current_step: currentStep,
    step_data: userServiceStepData,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  };

  return {
    account,
    product,
    instance,
    userService,
    steps,
    session: buildAuthSession(account),
  };
}

export async function seedCOSEOSSession(page: Page, session: ReturnType<typeof buildAuthSession>) {
  await page.addInitScript(
    ({ storageKey, value }) => {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    },
    {
      storageKey: getSupabaseStorageKey(),
      value: session,
    },
  );
}

export async function mockCOSEOSSupabase(page: Page, options?: {
  slug?: string;
  currentStep?: number;
  stepData?: Record<string, unknown>;
  dependentsCount?: number;
}) {
  const fixtures = buildCOSEOSFixtures(options);

  await seedCOSEOSSession(page, fixtures.session);

  // Mock User Account
  await page.route("**/rest/v1/user_accounts**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([fixtures.account]),
    });
  });

  // Mock User Services
  await page.route("**/rest/v1/user_services**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([fixtures.userService]),
    });
  });

  // Mock Product Slug Resolution
  await page.route("**/rest/v1/products**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([fixtures.product]),
    });
  });

  // Mock Instances
  await page.route("**/rest/v1/user_product_instances**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([fixtures.instance]),
    });
  });

  // Mock Steps
  await page.route("**/rest/v1/user_steps**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(fixtures.steps),
    });
  });

  // Mock Reviews
  await page.route("**/rest/v1/step_reviews**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  // Mock RPC Calls
  await page.route("**/rest/v1/rpc/start_product_instance**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(fixtures.instance.id),
    });
  });

  return fixtures;
}
