import { expect, test } from "@playwright/test";
import { mockAdminSupabase } from "./support/admin";

test.describe("Coupon & Discount Rules Flow", () => {
  test("user can apply and remove a discount coupon on the checkout page", async ({ page }) => {
    // We use mockAdminSupabase to mock all initial requirements (current subscription, services, office)
    await mockAdminSupabase(page, { role: "admin_lawyer" });

    // Mock validate_coupon RPC call
    await page.route("**/rest/v1/rpc/validate_coupon", async (route) => {
      const body = route.request().postDataJSON();
      if (body?.p_code === "DISCOUNT15") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            valid: true,
            coupon_id: "coupon-15",
            discount_type: "percentage",
            discount_value: 15,
            min_purchase_usd: 0
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            valid: false,
            error: "INVALID_OR_EXPIRED"
          }),
        });
      }
    });

    // We navigate to checkout with a real service slug (mentoria-individual)
    await page.goto("/checkout/mentoria-individual?office_id=office-1");

    // Check if the service title and initial subtotal (197.00) are visible
    await expect(page.getByText("Pacote Bronze").first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("US$ 197.00").first()).toBeVisible();

    // Input the coupon code
    const couponInput = page.locator("input[placeholder*='Enter code'], input[placeholder*='código'], input[placeholder*='SAVE20']").first();
    await expect(couponInput).toBeVisible();
    await couponInput.fill("DISCOUNT15");

    // Click Apply coupon
    const applyBtn = page.locator("button:has-text('Apply'), button:has-text('Aplicar')").first();
    await applyBtn.click();

    // Verify success toast
    await expect(page.getByText(/Coupon applied!|Cupom aplicado!/i).first()).toBeVisible();

    // Verify that the discount line is rendered in the price summary
    // 197.00 * 0.15 = 29.55 -> discount should be - US$ 29.55
    await expect(page.getByText("- US$ 29.55").first()).toBeVisible();

    // Click Remove coupon button (button with class text-red-500)
    const removeBtn = page.locator("button.text-red-500").first();
    await expect(removeBtn).toBeVisible();
    await removeBtn.click();

    // Verify that the discount line is no longer visible
    await expect(page.getByText("- US$ 29.55")).toBeHidden();
  });

  test("seller coupons creation enforces active discount rules", async ({ page }) => {
    // Log in as seller
    await mockAdminSupabase(page, { role: "seller" as any });

    page.on('pageerror', err => console.log('PAGE ERROR:', err));
    page.on('console', msg => console.log('CONSOLE:', msg.text()));
    page.on('request', request => console.log('REQ:', request.method(), request.url()));
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log('RESP ERROR:', response.status(), response.url());
      }
    });
    
    // Mock discount rules on offices to be highly restrictive:
    // Allow percentage (max 20%), don't allow fixed, max uses 10.
    await page.route("**/rest/v1/offices**", async (route) => {
      const method = route.request().method();
      if (method === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: "office-1",
            name: "Playwright Office",
            discount_rules: {
              seller_max_pct: 20,
              seller_max_fixed: 50,
              seller_allow_percentage: true,
              seller_allow_fixed: false,
              seller_max_coupons: 5,
              seller_max_uses: 10,
              seller_min_purchase_usd: 100
            }
          }),
        });
      } else {
        await route.fallback();
      }
    });

    // Mock active services list in coupons page query
    await page.route("**/rest/v1/services**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { slug: "visto-b1-b2", name: "B1/B2 Visa", category: "main_visa", is_active: true }
        ]),
      });
    });

    // Mock discount_coupons GET (initially empty)
    await page.route("**/rest/v1/discount_coupons**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    // Go to coupons page
    await page.goto("/seller/coupons");

    // Verify page header
    await expect(page.locator("h1:has-text('Discount Coupons'), h1:has-text('Cupons de Desconto')").first()).toBeVisible({ timeout: 10000 });

    // Click "Create New Coupon"
    const createBtn = page.locator("button:has-text('Create New'), button:has-text('Criar Novo')").first();
    await createBtn.click();

    // Verify modal is open
    await expect(page.locator("h3:has-text('Create New'), h3:has-text('Novo Cupom')").first()).toBeVisible();

    // Wait for rules to load and display in form labels
    await expect(page.locator("span:has-text('MAX 20%')").first()).toBeVisible({ timeout: 5000 });

    // Fill in coupon code
    await page.locator("input[name='code']").first().fill("RESTRICTED25");

    // Enter discount value of 25% (limit is 20%)
    await page.locator("input[name='discount_value']").first().fill("25");

    // Submit form
    const submitBtn = page.locator("button[type='submit']").first();
    await submitBtn.click();

    // Expect error toast indicating max percentage exceeded
    await expect(page.getByText(/Maximum allowed discount: 20%|Desconto máximo permitido: 20%/i).first()).toBeVisible();

    // Correct the discount value to 15% (valid)
    await page.locator("input[name='discount_value']").first().fill("15");

    // Enter max uses of 15 (limit is 10)
    await page.locator("input[name='max_uses']").first().fill("15");

    // Submit form again
    await submitBtn.click();

    // Expect error toast indicating max uses exceeded
    await expect(page.getByText(/Maximum usage limit per coupon: 10|Limite máximo de usos por cupom: 10/i).first()).toBeVisible();
  });

  test("admin lawyer can configure discount rules", async ({ page }) => {
    // Log in as admin_lawyer
    await mockAdminSupabase(page, { role: "admin_lawyer" });

    // Mock GET office
    const officePayload = {
      id: "office-1",
      name: "Playwright Office",
      discount_rules: {
        seller_max_pct: 20,
        seller_max_fixed: 50,
        seller_allow_percentage: true,
        seller_allow_fixed: false,
        seller_max_coupons: 5,
        seller_max_uses: 10,
        seller_min_purchase_usd: 100
      }
    };

    // Keep track of the PATCH payload to assert later
    let patchPayload: any = null;

    await page.route("**/rest/v1/offices**", async (route) => {
      const method = route.request().method();
      if (method === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(officePayload),
        });
      } else if (method === "PATCH") {
        patchPayload = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      }
    });

    // Go to settings discount rules page
    await page.goto("/admin/settings/discount-rules");

    // Verify page header
    await expect(page.locator("h1:has-text('Discount Rules'), h1:has-text('Regras de Desconto')").first()).toBeVisible({ timeout: 10000 });

    // Change Maximum discount % to 30
    const pctInput = page.locator("input[type='number']").first();
    await expect(pctInput).toBeVisible();
    await pctInput.fill("30");

    // Click Save / Salvar
    const saveBtn = page.locator("button:has-text('Save'), button:has-text('Salvar')").first();
    await saveBtn.click();

    // Verify success toast
    await expect(page.getByText(/Discount rules saved|Regras de desconto salvas/i).first()).toBeVisible();

    // Assert that PATCH updated discount rules correctly
    expect(patchPayload).not.toBeNull();
    expect(patchPayload.discount_rules.seller_max_pct).toBe(30);
  });
});
