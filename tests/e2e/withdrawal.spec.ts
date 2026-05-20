import { expect, test } from "@playwright/test";
import { mockAdminSupabase } from "./support/admin";

test.describe("Withdrawal Flow", () => {
  test("office admin can request a withdrawal", async ({ page }) => {
    await mockAdminSupabase(page, { role: "admin_lawyer" });

    page.on('pageerror', err => console.log('PAGE ERROR:', err));
    page.on('console', msg => console.log('CONSOLE:', msg.text()));

    // Go to dashboard overview
    await page.goto("/admin");

    // Wait for the overview stats to load. It should show a "Withdrawal" or "Solicitar Saque" button because available balance is > 0
    // "Solicitar Saque" (pt) or "Withdrawal" (en) - depends on locale. Let's use a robust selector based on text or role.
    const withdrawBtn = page.locator("button:has-text('Withdrawal'), button:has-text('Solicitar Saque')").first();
    await expect(withdrawBtn).toBeVisible({ timeout: 10000 });
    await withdrawBtn.click();

    // Verify modal is open
    const modalHeading = page.locator("h2:has-text('Solicitar Saque'), h2:has-text('Withdrawal')").first();
    await expect(modalHeading).toBeVisible();

    // Fill in the amount
    const amountInput = page.getByPlaceholder("0.00").first();
    await amountInput.fill("500");

    // Select Stripe link (default) and fill link
    const linkInput = page.getByPlaceholder("https://buy.stripe.com/...");
    if (await linkInput.isVisible()) {
      await linkInput.fill("https://buy.stripe.com/test12345");
    }

    // Submit
    const submitBtn = page.getByRole("button", { name: /Confirm Request|Confirmar Solicitação/i }).last();
    await submitBtn.click();

    // Verify success toast
    await expect(page.getByText(/Withdrawal request created successfully!|Solicitação de saque enviada!/i).first()).toBeVisible();
  });

  test("master admin can approve a withdrawal", async ({ page }) => {
    await mockAdminSupabase(page, { role: "master" });

    // Go to payments page
    await page.goto("/master/payments");

    // Click on the Office Requests tab
    await page.getByRole("button", { name: /Office Requests|Solicitações de Saque/i }).click();

    // We should see the pending withdrawal in the table
    await expect(page.getByText("Playwright Office").first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("$500.00").first()).toBeVisible();
    await expect(page.locator("p:has-text('pending')").first()).toBeVisible();

    // Click the approve button (it has title="Approve request")
    const approveBtn = page.locator("button[title='Approve request']").first();
    await expect(approveBtn).toBeVisible();
    await approveBtn.click();

    // Verify success toast
    await expect(page.getByText(/updated to approved|successfully updated/i).first()).toBeVisible();
  });
});
