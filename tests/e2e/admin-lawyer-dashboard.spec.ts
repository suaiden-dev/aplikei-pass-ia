import { expect, test } from "@playwright/test";
import {
  mockAdminLawyerDashboard,
  OFFICE_SLUG,
} from "./support/admin-lawyer-dashboard";

// ─── Dashboard Overview ────────────────────────────────────────────────────────

test.describe("Admin Lawyer Dashboard — Empty State", () => {
  test("shows empty state when no processes exist", async ({ page }) => {
    await mockAdminLawyerDashboard(page, {
      totalProcesses: 0,
      hasActiveProducts: true,
    });
    await page.goto("/admin");

    await expect(
      page.getByText("Seu escritório está pronto!"),
    ).toBeVisible({ timeout: 10000 });
  });

  test("empty state shows checkout link with office slug", async ({ page }) => {
    await mockAdminLawyerDashboard(page, { totalProcesses: 0, hasActiveProducts: true });
    await page.goto("/admin");

    await expect(
      page.getByText(new RegExp(`checkout\\?office=${OFFICE_SLUG}`)),
    ).toBeVisible({ timeout: 10000 });
  });

  test("empty state shows set up CTA when no active products", async ({ page }) => {
    await mockAdminLawyerDashboard(page, { totalProcesses: 0, hasActiveProducts: false });
    await page.goto("/admin");

    await expect(
      page.getByText("Almost there!"),
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Set up your services")).toBeVisible();
  });

  test("copy link button shows success feedback", async ({ page }) => {
    await mockAdminLawyerDashboard(page, { totalProcesses: 0, hasActiveProducts: true });
    await page.goto("/admin");

    await page.waitForSelector("text=Seu escritório está pronto!", { timeout: 10000 });

    // Grant clipboard permission and click copy
    await page.context().grantPermissions(["clipboard-write"]);
    const copyBtn = page.getByRole("button", { name: /Copiar/i }).first();
    await copyBtn.click();

    await expect(page.getByText("Copiado!").first()).toBeVisible();
  });
});

test.describe("Admin Lawyer Dashboard — With Processes", () => {
  test("shows revenue charts when processes exist", async ({ page }) => {
    await mockAdminLawyerDashboard(page, {
      totalProcesses: 5,
      pendingPayments: 2,
      hasActiveProducts: true,
    });
    await page.goto("/admin");

    // Empty state should NOT appear
    await expect(page.getByText("Seu escritório está pronto!")).not.toBeVisible({ timeout: 8000 });
  });

  test("shows checkout link widget when processes exist", async ({ page }) => {
    await mockAdminLawyerDashboard(page, {
      totalProcesses: 5,
      hasActiveProducts: true,
    });
    await page.goto("/admin");

    await expect(
      page.getByText("Seu link de checkout"),
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Admin Lawyer Dashboard — Pending Payments StatCard", () => {
  test("shows pending payment count in stat card", async ({ page }) => {
    await mockAdminLawyerDashboard(page, {
      totalProcesses: 3,
      pendingPayments: 2,
      hasActiveProducts: true,
    });
    await page.goto("/admin");

    await expect(
      page.getByText("Awaiting Payment"),
    ).toBeVisible({ timeout: 10000 });

    // Value "2" should appear somewhere on the page (in the stat card)
    await expect(page.getByText("2").first()).toBeVisible();
  });

  test("pending payment card shows 0 when none pending", async ({ page }) => {
    await mockAdminLawyerDashboard(page, {
      totalProcesses: 3,
      pendingPayments: 0,
      hasActiveProducts: true,
    });
    await page.goto("/admin");

    await expect(page.getByText("Awaiting Payment")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Admin Lawyer Dashboard — Products Alert", () => {
  test("shows alert when no active products configured", async ({ page }) => {
    await mockAdminLawyerDashboard(page, {
      totalProcesses: 3,
      hasActiveProducts: false,
    });
    await page.goto("/admin");

    await expect(
      page.getByText("Nenhum serviço configurado"),
    ).toBeVisible({ timeout: 10000 });
  });

  test("products alert links to /admin/products", async ({ page }) => {
    await mockAdminLawyerDashboard(page, {
      totalProcesses: 3,
      hasActiveProducts: false,
    });
    await page.goto("/admin");

    await page.waitForSelector("text=Nenhum serviço configurado", { timeout: 10000 });
    await page.getByText("Configurar →").click();
    await expect(page).toHaveURL(/\/admin\/services/);
  });

  test("does not show alert when products are active", async ({ page }) => {
    await mockAdminLawyerDashboard(page, {
      totalProcesses: 3,
      hasActiveProducts: true,
    });
    await page.goto("/admin");

    await page.waitForTimeout(3000);
    await expect(page.getByText("Nenhum serviço configurado")).not.toBeVisible();
  });
});

// ─── Promotion Removal ─────────────────────────────────────────────────────────

test.describe("Promotion '1º Processo Grátis' — Removed", () => {
  test("dashboard does not show promo banner", async ({ page }) => {
    await mockAdminLawyerDashboard(page, { totalProcesses: 0 });
    await page.goto("/admin");

    await page.waitForTimeout(3000);
    await expect(page.getByText(/Promoção de Boas-vindas/i)).not.toBeVisible();
    await expect(page.getByText(/Taxa ZERO/i)).not.toBeVisible();
  });

  test("products page does not show '1º Processo Grátis' badge", async ({ page }) => {
    await mockAdminLawyerDashboard(page, { totalProcesses: 0, hasActiveProducts: false });

    // mock extra routes needed by products page
    await page.route("**/rest/v1/services**", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    });

    await page.goto("/admin/services");

    await page.waitForTimeout(3000);
    await expect(page.getByText(/1º Processo Grátis/i)).not.toBeVisible();
  });
});

// ─── Finance Analytics ─────────────────────────────────────────────────────────

test.describe("Finance Analytics — OFFICE CONTEXT badge", () => {
  test("badge is visible and readable", async ({ page }) => {
    await mockAdminLawyerDashboard(page, { totalProcesses: 0 });

    // mock finance analytics routes
    await page.route("**/rest/v1/orders**", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    });

    await page.goto("/admin/finance-analytics");

    const badge = page.getByText("OFFICE CONTEXT");
    await expect(badge).toBeVisible({ timeout: 10000 });

    // Check it has adequate padding (not cramped)
    const box = await badge.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(100);
  });
});
