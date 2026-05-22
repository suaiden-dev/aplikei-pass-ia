import { expect, test } from "@playwright/test";
import { mockCOSEOSSupabase } from "./support/cos-eos";

test.describe("Change of Status (COS) onboarding", () => {
  test("renders COS Application Step (Step 0) on the route", async ({ page }) => {
    await mockCOSEOSSupabase(page, {
      slug: "troca-status",
      currentStep: 0,
    });

    await page.goto("/dashboard/processes/troca-status/onboarding");

    // Check header
    await expect(page.getByRole("heading", { name: /Onboarding/i })).toBeVisible();
    await expect(page.getByText(/Step 1 \/ 12/i)).toBeVisible();
    
    // Check selections
    await expect(page.getByText(/Qual o seu visto atual/i)).toBeVisible();
    await expect(page.getByText(/Para qual visto você deseja trocar/i)).toBeVisible();
  });

  test("renders COS Documents Step (Step 1) correctly", async ({ page }) => {
    await mockCOSEOSSupabase(page, {
      slug: "troca-status",
      currentStep: 1,
    });

    await page.goto("/dashboard/processes/troca-status/onboarding?step=1");

    await expect(page.getByText(/Step 2 \/ 12/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /Envios de Documentos/i }).first()).toBeVisible();
    await expect(page.getByText(/Form I-94 \(Principal\)/i)).toBeVisible();
    await expect(page.getByText(/Passport and Visa \(Principal\)/i)).toBeVisible();
  });

  test("renders Form I-539 (Step 7) and performs A-Number & USCIS Online Account Number validation", async ({ page }) => {
    await mockCOSEOSSupabase(page, {
      slug: "troca-status",
      currentStep: 7,
      dependentsCount: 1,
    });

    await page.goto("/dashboard/processes/troca-status/onboarding?step=7");

    await expect(page.getByText(/Step 8 \/ 12/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /Formulário I-539/i }).first()).toBeVisible();

    // Verify main applicant identifier fields exist
    const mainANumber = page.locator('input[name="alienNumber"]');
    const mainUSCISAccount = page.locator('input[name="uscisOnlineAccountNumber"]');
    await expect(mainANumber).toBeVisible();
    await expect(mainUSCISAccount).toBeVisible();

    // Test input masking - main A-Number accepts letters, USCIS Account strips them
    await mainANumber.fill("A123");
    await expect(mainANumber).toHaveValue("A123");

    await mainUSCISAccount.fill("account-9876");
    await expect(mainUSCISAccount).toHaveValue("9876");

    // Test dependents A-Number and USCIS Account inputs
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
