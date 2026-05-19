import type { Page } from "@playwright/test";

type F1ProcessFixture = {
  id: string;
  user_id: string;
  service_slug: string;
  status: string;
  current_step: number;
  step_data: Record<string, unknown>;
  created_at: string;
};

type F1AccountFixture = {
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

export function buildAuthSession(overrides?: Partial<F1AccountFixture>) {
  const now = new Date();
  const userId = overrides?.id ?? "user-f1";
  const email = overrides?.email ?? "estudante@example.com";
  const fullName = overrides?.full_name ?? "Cliente F1";

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

export function buildF1Fixtures(options?: {
  slug?: string;
  currentStep?: number;
  stepData?: Record<string, unknown>;
}) {
  const userId = "user-f1";
  const slug = options?.slug ?? "visto-f1";
  const currentStep = options?.currentStep ?? 0;
  const stepData = options?.stepData ?? {
    homeCountry: "Brasil",
    securityExceptions: "nao",
  };

  const account: F1AccountFixture = {
    id: userId,
    full_name: "Cliente F1",
    email: "estudante@example.com",
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

  const process: F1ProcessFixture = {
    id: "proc-f1-1",
    user_id: userId,
    service_slug: slug,
    status: currentStep >= 9 ? "awaiting_review" : "in_progress",
    current_step: currentStep,
    step_data: stepData,
    created_at: "2026-01-01T00:00:00.000Z",
  };

  return {
    account,
    process,
    session: buildAuthSession(account),
  };
}

export async function seedF1Session(page: Page, session: ReturnType<typeof buildAuthSession>) {
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

export async function mockF1Supabase(page: Page, options?: {
  slug?: string;
  currentStep?: number;
  stepData?: Record<string, unknown>;
}) {
  const fixtures = buildF1Fixtures(options);

  await seedF1Session(page, fixtures.session);

  await page.route("**/rest/v1/user_accounts**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([fixtures.account]),
    });
  });

  await page.route("**/rest/v1/user_services**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([fixtures.process]),
    });
  });

  return fixtures;
}
