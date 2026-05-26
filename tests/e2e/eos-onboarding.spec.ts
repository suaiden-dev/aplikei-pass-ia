import { expect, test } from "@playwright/test";
import { mockCOSEOSSupabase } from "./support/cos-eos";

test.describe("Extension of Status (EOS) onboarding", () => {
  test("renders EOS Application Step (Step 0) on the route", async ({ page }) => {
    await mockCOSEOSSupabase(page, {
      slug: "extensao-status",
      currentStep: 0,
    });

    await page.goto("/dashboard/processes/extensao-status/onboarding");

    // Check headers and timelines
    await expect(page.getByRole("heading", { name: /Onboarding/i })).toBeVisible();
    await expect(page.getByText(/Step 1 \/ 13/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /Formulário I-539/i }).first()).toBeVisible();
  });

  test("renders Form I-539 (Step 0) in EOS with masking and validations", async ({ page }) => {
    await mockCOSEOSSupabase(page, {
      slug: "extensao-status",
      currentStep: 0,
      dependentsCount: 1,
    });

    await page.goto("/dashboard/processes/extensao-status/onboarding?step=0");

    await expect(page.getByText(/Step 1 \/ 13/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /Formulário I-539/i }).first()).toBeVisible();

    const mainANumber = page.locator('input[name="alienNumber"]');
    const mainUSCISAccount = page.locator('input[name="uscisOnlineAccountNumber"]');
    
    await expect(mainANumber).toBeVisible();
    await expect(mainUSCISAccount).toBeVisible();

    // Masking checks - main A-Number accepts letters, USCIS Account strips them
    await mainANumber.fill("A123");
    await expect(mainANumber).toHaveValue("A123");

    await mainUSCISAccount.fill("account-9876");
    await expect(mainUSCISAccount).toHaveValue("9876");

    // Check dependents A-Number and USCIS Account inputs
    const depANumber = page.locator('input[name="dependentsA.0.alienNumber"]');
    const depUSCISAccount = page.locator('input[name="dependentsA.0.uscisOnlineAccountNumber"]');
    
    await depANumber.scrollIntoViewIfNeeded();
    await expect(depANumber).toBeVisible();
    await expect(depUSCISAccount).toBeVisible();

    // Test letters are accepted on dependents A-Number, and masked on USCIS Account
    await depANumber.fill("a7890");
    await expect(depANumber).toHaveValue("a7890");

    await depUSCISAccount.fill("u-12345-n");
    await expect(depUSCISAccount).toHaveValue("12345");

    // Trigger validation and check error messages
    const submitBtn = page.getByRole("button", { name: /Enviar Formulário/i });
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();

    // Check validation error messages
    await expect(page.getByText("Invalid A-Number format / Formato de A-Number inválido").first()).toBeVisible();
    await expect(page.getByText("USCIS Online Account Number must be exactly 12 digits / Número da Conta Online do USCIS deve ter exatamente 12 dígitos").first()).toBeVisible();
  });
});
