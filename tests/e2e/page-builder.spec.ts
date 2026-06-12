import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { mockAdminSupabase } from "./support/admin";

async function mockPageBuilderOffice(page: Page) {
  await page.route("**/rest/v1/offices**", async (route) => {
    const request = route.request();
    const accept = request.headers()["accept"] ?? "";
    const payload = {
      id: "office-1",
      name: "Playwright Office",
      slug: "playwright-office",
      logo_url: null,
      landing_page_config: {
        pageTitle: "Playwright Landing",
        heroTitle: "Original page builder headline",
        heroSubtitle: "Original page builder subtitle.",
        isLandingLive: true,
      },
      address: "Sao Paulo, SP",
      phone: "+55 11 99999-9999",
      cnpj: null,
      email: "office@example.com",
      website: "https://example.com",
      instagram_url: null,
      linkedin_url: null,
      facebook_url: null,
      owner_id: "user-admin",
      payment_links: { stripe: "https://buy.stripe.com/test", zelle: "" },
      zelle_details: { name: "Admin", identifier: "admin@example.com" },
    };

    if (request.method() !== "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(payload),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: accept.includes("application/vnd.pgrst.object+json")
        ? "application/vnd.pgrst.object+json"
        : "application/json",
      body: JSON.stringify(accept.includes("application/vnd.pgrst.object+json") ? payload : [payload]),
    });
  });
}

test.describe("Page builder", () => {
  test("updates the landing preview and supports responsive preview modes", async ({ page }) => {
    await mockAdminSupabase(page, { role: "admin_lawyer" });
    await mockPageBuilderOffice(page);

    await page.goto("/admin/page-builder");

    await expect(page.getByRole("heading", { name: "Landing Builder" })).toBeVisible({ timeout: 10000 });

    const previewFrame = page.frameLocator('iframe[title="Landing preview"]');
    await expect(previewFrame.getByRole("heading", { name: "Original page builder headline" })).toBeVisible({
      timeout: 10000,
    });

    await page.getByRole("button", { name: /Tablet/i }).click();
    await expect(page.getByRole("button", { name: /Tablet/i })).toHaveClass(/bg-primary|border-transparent/);

    await page.getByRole("button", { name: /Mobile/i }).click();
    await expect(page.getByRole("button", { name: /Mobile/i })).toHaveClass(/bg-primary|border-transparent/);

    await page.locator("summary").filter({ hasText: "Hero" }).click();
    await page.locator("#hero-title").fill("A precise legal plan for your visa");
    await expect(previewFrame.getByRole("heading", { name: "A precise legal plan for your visa" })).toBeVisible();

    await page.getByRole("button", { name: /Desktop/i }).click();
    const iframe = page.locator('iframe[title="Landing preview"]');
    const frame = await iframe.elementHandle().then((element) => element?.contentFrame());
    expect(frame).not.toBeNull();

    const themeBefore = await frame!.evaluate(() => document.documentElement.dataset.theme);
    await frame!.getByRole("button", { name: /Alternar tema/i }).click();
    await expect
      .poll(() => frame!.evaluate(() => document.documentElement.dataset.theme))
      .not.toBe(themeBefore);
  });
});
