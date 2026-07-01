import type { Page } from "@playwright/test";
import { buildAuthSession, getSupabaseStorageKey } from "./admin";

const USER_ID = "user-admin-lawyer";
const OFFICE_ID = "office-1";
const OFFICE_SLUG = "playwright-office";

export { OFFICE_ID, OFFICE_SLUG, USER_ID };

export interface DashboardMockOptions {
  totalProcesses?: number;
  pendingPayments?: number;
  hasActiveProducts?: boolean;
}

export async function mockAdminLawyerDashboard(
  page: Page,
  options: DashboardMockOptions = {},
) {
  const { totalProcesses = 0, pendingPayments = 0, hasActiveProducts = false } = options;

  // Auth session
  const session = buildAuthSession({ id: USER_ID, role: "admin_lawyer" });
  await page.addInitScript(
    ({ storageKey, value }) => {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    },
    { storageKey: getSupabaseStorageKey(), value: session },
  );

  // Auth user endpoint
  await page.route("**/auth/v1/user**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: USER_ID,
        email: "lawyer@example.com",
        aud: "authenticated",
        role: "authenticated",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
        user_metadata: { full_name: "Admin Lawyer", role: "admin_lawyer" },
        app_metadata: {},
      }),
    });
  });

  // user_accounts
  await page.route("**/rest/v1/user_accounts**", async (route) => {
    const accept = route.request().headers()["accept"] ?? "";
    const single = accept.includes("application/vnd.pgrst.object+json");
    const payload = {
      id: USER_ID,
      role: "admin_lawyer",
      office_id: OFFICE_ID,
      full_name: "Admin Lawyer",
      email: "lawyer@example.com",
      has_completed_onboarding: true,
    };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(single ? payload : [payload]),
    });
  });

  // offices — inclui slug para useOfficeSlug
  await page.route("**/rest/v1/offices**", async (route) => {
    const accept = route.request().headers()["accept"] ?? "";
    const single = accept.includes("application/vnd.pgrst.object+json");
    const payload = {
      id: OFFICE_ID,
      name: "Playwright Office",
      slug: OFFICE_SLUG,
      owner_id: USER_ID,
      address: null,
      phone: null,
      cnpj: null,
      email: null,
      website: null,
      instagram_url: null,
      linkedin_url: null,
      facebook_url: null,
    };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(single ? payload : [payload]),
    });
  });

  // user_services — controla totalProcesses
  const services = Array.from({ length: totalProcesses }, (_, i) => ({
    id: `svc-${i}`,
    office_id: OFFICE_ID,
    status: "active",
    service_slug: "visa-f1",
  }));
  await page.route("**/rest/v1/user_services**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(services),
    });
  });

  // orders — controla pendingPayments e revenue
  const paidOrder = {
    id: "order-paid",
    office_id: OFFICE_ID,
    total_price_usd: 1000,
    office_net_amount_usd: 800,
    office_fee_amount_usd: 200,
    payment_status: "paid",
    subscription_available_after_minutes: 0,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  };
  const pendingOrders = Array.from({ length: pendingPayments }, (_, i) => ({
    id: `order-pending-${i}`,
    office_id: OFFICE_ID,
    total_price_usd: 500,
    office_net_amount_usd: 0,
    office_fee_amount_usd: 0,
    payment_status: "pending",
    subscription_available_after_minutes: 20160,
    created_at: new Date().toISOString(),
  }));
  const allOrders = totalProcesses > 0 ? [paidOrder, ...pendingOrders] : [...pendingOrders];
  await page.route("**/rest/v1/orders**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(allOrders),
    });
  });

  // user_service_prices — controla hasActiveProducts
  const prices = hasActiveProducts
    ? [
        {
          id: "price-f1",
          office_id: OFFICE_ID,
          service_id: "svc-f1",
          name: "F-1 Visa",
          category: "main_visa",
          slug: "visa-f1",
          price: 1500,
          currency: "USD",
          is_active: true,
        },
      ]
    : [
        {
          id: "price-f1",
          office_id: OFFICE_ID,
          service_id: "svc-f1",
          name: "F-1 Visa",
          category: "main_visa",
          slug: "visa-f1",
          price: 0,
          currency: "USD",
          is_active: false,
        },
      ];
  await page.route("**/rest/v1/user_service_prices**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(prices),
    });
  });

  // office_withdrawals
  await page.route("**/rest/v1/office_withdrawals**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  // subscription
  await page.route("**/rest/v1/v_office_current_subscription**", async (route) => {
    const accept = route.request().headers()["accept"] ?? "";
    const single = accept.includes("application/vnd.pgrst.object+json");
    const payload = {
      subscription_id: "sub-1",
      office_id: OFFICE_ID,
      status: "active",
      plan_id: "plan-1",
      plan_name: "Premium",
      plan_type: "PERCENTAGE",
      fixed_fee: 0,
      percentage_fee: 20,
    };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(single ? payload : [payload]),
    });
  });

  await page.route("**/rest/v1/office_payment_settings**", async (route) => {
    const accept = route.request().headers()["accept"] ?? "";
    const single = accept.includes("application/vnd.pgrst.object+json");
    const payload = {
      office_id: OFFICE_ID,
      default_payout_method: "stripe",
      zelle_name: null,
      zelle_identifier: null,
    };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(single ? payload : [payload]),
    });
  });
}
