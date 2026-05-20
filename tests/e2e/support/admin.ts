import type { Page } from "@playwright/test";

export function getProjectRef() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error("Missing VITE_SUPABASE_URL for Playwright tests.");
  }
  return new URL(supabaseUrl).hostname.split(".")[0];
}

export function getSupabaseStorageKey() {
  return `sb-${getProjectRef()}-auth-token`;
}

export function buildAuthSession(overrides?: any) {
  const now = new Date();
  const userId = overrides?.id ?? "user-admin";
  const role = overrides?.role ?? "admin_lawyer";
  
  return {
    access_token: "playwright-access-token",
    refresh_token: "playwright-refresh-token",
    expires_in: 3600,
    expires_at: Math.floor(now.getTime() / 1000) + 3600,
    token_type: "bearer",
    user: {
      id: userId,
      email: "admin@example.com",
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      aud: "authenticated",
      role: "authenticated",
      app_metadata: {},
      user_metadata: {
        full_name: "Admin Lawyer",
        role: role,
        officeId: "office-1",
      },
    },
  };
}

export async function mockAdminSupabase(page: Page, options?: { role?: "master" | "admin_lawyer" }) {
  const role = options?.role ?? "admin_lawyer";
  const session = buildAuthSession({ role });
  const userId = session.user.id;

  await page.addInitScript(
    ({ storageKey, value }) => {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    },
    {
      storageKey: getSupabaseStorageKey(),
      value: session,
    },
  );

  // v_office_current_subscription mock
  await page.route("**/rest/v1/v_office_current_subscription**", async (route) => {
    const accept = route.request().headers()["accept"] ?? "";
    const payload = {
      office_id: "office-1",
      status: "active",
      plan_name: "Premium",
      plan_type: "PERCENTAGE",
      fixed_fee: 0,
      percentage_fee: 20,
      current_period_end: new Date(Date.now() + 30 * 86400000).toISOString()
    };
    await route.fulfill({
      status: 200,
      contentType: accept.includes("application/vnd.pgrst.object+json") ? "application/vnd.pgrst.object+json" : "application/json",
      body: JSON.stringify(accept.includes("application/vnd.pgrst.object+json") ? payload : [payload]),
    });
  });

  // user_accounts mock
  await page.route("**/rest/v1/user_accounts**", async (route) => {
    const accept = route.request().headers()["accept"] ?? "";
    const payload = {
      id: userId,
      role: role,
      office_id: "office-1",
      full_name: role === "master" ? "Master Admin" : "Admin Lawyer",
      has_completed_onboarding: true
    };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(accept.includes("application/vnd.pgrst.object+json") ? payload : [payload]),
    });
  });

  await page.route("**/rest/v1/offices**", async (route) => {
    const accept = route.request().headers()["accept"] ?? "";
    const payload = {
      id: "office-1",
      name: "Playwright Office",
      payment_links: { stripe: "https://buy.stripe.com/test", zelle: "" },
      zelle_details: { name: "Admin", identifier: "admin@example.com" }
    };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(accept.includes("application/vnd.pgrst.object+json") ? payload : [payload]),
    });
  });

  // office_payment_settings mock
  await page.route("**/rest/v1/office_payment_settings**", async (route) => {
    const accept = route.request().headers()["accept"] ?? "";
    const payload = {
      office_id: "office-1",
      default_payout_method: "stripe",
      zelle_name: "Admin",
      zelle_identifier: "admin@example.com"
    };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(accept.includes("application/vnd.pgrst.object+json") ? payload : [payload]),
    });
  });

  await page.route("**/rest/v1/orders**", async (route) => {
    const isMaster = role === "master";
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: "order-1",
          office_id: "office-1",
          total_price_usd: 1000,
          office_net_amount_usd: 800,
          office_fee_amount_usd: 200,
          payment_status: "paid",
          subscription_available_after_minutes: 0,
          created_at: new Date(Date.now() - 15 * 86400000).toISOString() // 15 days ago
        }
      ]),
    });
  });

  await page.route("**/rest/v1/user_services**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  // Default empty withdrawals
  await page.route("**/rest/v1/office_withdrawals**", async (route) => {
    // Determine what to return based on whether we're master or not
    if (role === "master") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([{
          id: "withdrawal-1",
          office_id: "office-1",
          amount: 500,
          status: "pending",
          payment_method: "stripe",
          created_at: new Date().toISOString(),
          offices: {
            name: "Playwright Office"
          }
        }]),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    }
  });

  // Mock withdrawal edge function
  await page.route("**/functions/v1/withdrawals", async (route) => {
    const postData = route.request().postDataJSON();
    if (postData?.action === "request") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          withdrawal: {
            id: "withdrawal-new",
            office_id: postData.office_id,
            amount: postData.amount,
            method: postData.method,
            status: "pending",
            created_at: new Date().toISOString()
          }
        }),
      });
    } else if (postData?.action === "approve") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          withdrawal: {
            id: postData.withdrawal_id,
            office_id: "office-1",
            amount: 500,
            status: "approved",
            created_at: new Date().toISOString()
          }
        }),
      });
    } else {
      await route.fulfill({ status: 400 });
    }
  });
}
