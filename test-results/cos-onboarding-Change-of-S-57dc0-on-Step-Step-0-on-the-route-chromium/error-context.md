# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cos-onboarding.spec.ts >> Change of Status (COS) onboarding >> renders COS Application Step (Step 0) on the route
- Location: tests/e2e/cos-onboarding.spec.ts:5:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /Onboarding/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /Onboarding/i })

```

```yaml
- region "Notifications alt+T"
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | import { mockCOSEOSSupabase } from "./support/cos-eos";
  3  | 
  4  | test.describe("Change of Status (COS) onboarding", () => {
  5  |   test("renders COS Application Step (Step 0) on the route", async ({ page }) => {
  6  |     await mockCOSEOSSupabase(page, {
  7  |       slug: "troca-status",
  8  |       currentStep: 0,
  9  |     });
  10 | 
  11 |     await page.goto("/dashboard/processes/troca-status/onboarding");
  12 | 
  13 |     // Check header
> 14 |     await expect(page.getByRole("heading", { name: /Onboarding/i })).toBeVisible();
     |                                                                      ^ Error: expect(locator).toBeVisible() failed
  15 |     await expect(page.getByText(/Step 1 \/ 12/i)).toBeVisible();
  16 |     
  17 |     // Check selections
  18 |     await expect(page.getByText(/Qual o seu visto atual/i)).toBeVisible();
  19 |     await expect(page.getByText(/Para qual visto você deseja trocar/i)).toBeVisible();
  20 |   });
  21 | 
  22 |   test("renders COS Documents Step (Step 1) correctly", async ({ page }) => {
  23 |     await mockCOSEOSSupabase(page, {
  24 |       slug: "troca-status",
  25 |       currentStep: 1,
  26 |     });
  27 | 
  28 |     await page.goto("/dashboard/processes/troca-status/onboarding?step=1");
  29 | 
  30 |     await expect(page.getByText(/Step 2 \/ 12/i)).toBeVisible();
  31 |     await expect(page.getByRole("heading", { name: /Envios de Documentos/i }).first()).toBeVisible();
  32 |     await expect(page.getByText(/Form I-94 \(Principal\)/i)).toBeVisible();
  33 |     await expect(page.getByText(/Passport and Visa \(Principal\)/i)).toBeVisible();
  34 |   });
  35 | 
  36 |   test("renders Form I-539 (Step 7) and performs A-Number & USCIS Online Account Number validation", async ({ page }) => {
  37 |     await mockCOSEOSSupabase(page, {
  38 |       slug: "troca-status",
  39 |       currentStep: 7,
  40 |       dependentsCount: 1,
  41 |     });
  42 | 
  43 |     await page.goto("/dashboard/processes/troca-status/onboarding?step=7");
  44 | 
  45 |     await expect(page.getByText(/Step 8 \/ 12/i)).toBeVisible();
  46 |     await expect(page.getByRole("heading", { name: /Formulário I-539/i }).first()).toBeVisible();
  47 | 
  48 |     // Verify main applicant identifier fields exist
  49 |     const mainANumber = page.locator('input[name="alienNumber"]');
  50 |     const mainUSCISAccount = page.locator('input[name="uscisOnlineAccountNumber"]');
  51 |     await expect(mainANumber).toBeVisible();
  52 |     await expect(mainUSCISAccount).toBeVisible();
  53 | 
  54 |     // Test input masking - main A-Number accepts letters, USCIS Account strips them
  55 |     await mainANumber.fill("A123");
  56 |     await expect(mainANumber).toHaveValue("A123");
  57 | 
  58 |     await mainUSCISAccount.fill("account-9876");
  59 |     await expect(mainUSCISAccount).toHaveValue("9876");
  60 | 
  61 |     // Test dependents A-Number and USCIS Account inputs
  62 |     const depANumber = page.locator('input[name="dependentsA.0.alienNumber"]');
  63 |     const depUSCISAccount = page.locator('input[name="dependentsA.0.uscisOnlineAccountNumber"]');
  64 |     
  65 |     await depANumber.scrollIntoViewIfNeeded();
  66 |     await expect(depANumber).toBeVisible();
  67 |     await expect(depUSCISAccount).toBeVisible();
  68 | 
  69 |     // Test letters are accepted on dependents A-Number, and masked on USCIS Account
  70 |     await depANumber.fill("a7890");
  71 |     await expect(depANumber).toHaveValue("a7890");
  72 | 
  73 |     await depUSCISAccount.fill("u-12345-n");
  74 |     await expect(depUSCISAccount).toHaveValue("12345");
  75 | 
  76 |     // Trigger validation and check error messages
  77 |     const submitBtn = page.getByRole("button", { name: /Enviar Formulário/i });
  78 |     await submitBtn.scrollIntoViewIfNeeded();
  79 |     await submitBtn.click();
  80 | 
  81 |     // Check validation error messages
  82 |     await expect(page.getByText("Invalid A-Number format / Formato de A-Number inválido").first()).toBeVisible();
  83 |     await expect(page.getByText("USCIS Online Account Number must be exactly 12 digits / Número da Conta Online do USCIS deve ter exatamente 12 dígitos").first()).toBeVisible();
  84 |   });
  85 | });
  86 | 
```