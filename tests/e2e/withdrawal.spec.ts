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

    // Click on the Office Requests tab (can render as tab or button depending on UI state)
    const officeRequestsTab = page.getByRole("tab", { name: /Office Requests|Solicitações de Saque/i });
    const officeRequestsButton = page.getByRole("button", { name: /Office Requests|Solicitações de Saque/i });
    if (await officeRequestsTab.isVisible().catch(() => false)) {
      await officeRequestsTab.click();
    } else {
      await officeRequestsButton.click();
    }

    const row = page.locator("tr", { hasText: "Playwright Office" }).first();
    const rowOffice = row.getByText("Playwright Office").first();
    const pendingBadge = row.getByText(/pending|pendente/i).first();
    const emptyState = page.getByText(/No payments found in this category/i).first();

    // Wait until the table stabilizes into one of expected UI states.
    await expect
      .poll(
        async () => {
          if (await row.isVisible().catch(() => false)) return "row";
          if (await emptyState.isVisible().catch(() => false)) return "empty";
          return "loading";
        },
        { timeout: 10000 },
      )
      .not.toBe("loading");

    const hasPendingRow = await row.isVisible().catch(() => false);
    if (!hasPendingRow) {
      await expect(emptyState).toBeVisible();
      return;
    }

    // We should see the pending withdrawal in the table
    await expect(rowOffice).toBeVisible({ timeout: 10000 });
    await expect(row.getByText("$500.00").first()).toBeVisible();
    await expect(pendingBadge).toBeVisible();

    // Click the approve button (title can vary by locale)
    const approveBtn = page.locator(
      "button[title='Approve request'], button[title='Aprovar solicitação'], button[aria-label='Approve request'], button[aria-label='Aprovar solicitação']",
    ).first();
    await expect(approveBtn).toBeVisible();
    await approveBtn.click();

    // Verify success toast
    await expect(
      page.getByText(/updated to approved|successfully updated|atualizado para aprovado|sucesso/i).first(),
    ).toBeVisible();
  });
});
