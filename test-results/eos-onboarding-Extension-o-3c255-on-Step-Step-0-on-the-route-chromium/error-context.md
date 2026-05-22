# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: eos-onboarding.spec.ts >> Extension of Status (EOS) onboarding >> renders EOS Application Step (Step 0) on the route
- Location: tests/e2e/eos-onboarding.spec.ts:5:3

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
  4  | test.describe("Extension of Status (EOS) onboarding", () => {
  5  |   test("renders EOS Application Step (Step 0) on the route", async ({ page }) => {
  6  |     await mockCOSEOSSupabase(page, {
  7  |       slug: "extensao-status",
  8  |       currentStep: 0,
  9  |     });
  10 | 
  11 |     await page.goto("/dashboard/processes/extensao-status/onboarding");
  12 | 
  13 |     // Check headers and timelines
> 14 |     await expect(page.getByRole("heading", { name: /Onboarding/i })).toBeVisible();
     |                                                                      ^ Error: expect(locator).toBeVisible() failed
  15 |     await expect(page.getByText(/Step 1 \/ 13/i)).toBeVisible();
  16 |     await expect(page.getByRole("heading", { name: /Formulário I-539/i }).first()).toBeVisible();
  17 |   });
  18 | 
  19 |   test("renders Form I-539 (Step 0) in EOS with masking and validations", async ({ page }) => {
  20 |     await mockCOSEOSSupabase(page, {
  21 |       slug: "extensao-status",
  22 |       currentStep: 0,
  23 |       dependentsCount: 1,
  24 |     });
  25 | 
  26 |     await page.goto("/dashboard/processes/extensao-status/onboarding?step=0");
  27 | 
  28 |     await expect(page.getByText(/Step 1 \/ 13/i)).toBeVisible();
  29 |     await expect(page.getByRole("heading", { name: /Formulário I-539/i }).first()).toBeVisible();
  30 | 
  31 |     const mainANumber = page.locator('input[name="alienNumber"]');
  32 |     const mainUSCISAccount = page.locator('input[name="uscisOnlineAccountNumber"]');
  33 |     
  34 |     await expect(mainANumber).toBeVisible();
  35 |     await expect(mainUSCISAccount).toBeVisible();
  36 | 
  37 |     // Masking checks - main A-Number accepts letters, USCIS Account strips them
  38 |     await mainANumber.fill("A123");
  39 |     await expect(mainANumber).toHaveValue("A123");
  40 | 
  41 |     await mainUSCISAccount.fill("account-9876");
  42 |     await expect(mainUSCISAccount).toHaveValue("9876");
  43 | 
  44 |     // Check dependents A-Number and USCIS Account inputs
  45 |     const depANumber = page.locator('input[name="dependentsA.0.alienNumber"]');
  46 |     const depUSCISAccount = page.locator('input[name="dependentsA.0.uscisOnlineAccountNumber"]');
  47 |     
  48 |     await depANumber.scrollIntoViewIfNeeded();
  49 |     await expect(depANumber).toBeVisible();
  50 |     await expect(depUSCISAccount).toBeVisible();
  51 | 
  52 |     // Test letters are accepted on dependents A-Number, and masked on USCIS Account
  53 |     await depANumber.fill("a7890");
  54 |     await expect(depANumber).toHaveValue("a7890");
  55 | 
  56 |     await depUSCISAccount.fill("u-12345-n");
  57 |     await expect(depUSCISAccount).toHaveValue("12345");
  58 | 
  59 |     // Trigger validation and check error messages
  60 |     const submitBtn = page.getByRole("button", { name: /Enviar Formulário/i });
  61 |     await submitBtn.scrollIntoViewIfNeeded();
  62 |     await submitBtn.click();
  63 | 
  64 |     // Check validation error messages
  65 |     await expect(page.getByText("Invalid A-Number format / Formato de A-Number inválido").first()).toBeVisible();
  66 |     await expect(page.getByText("USCIS Online Account Number must be exactly 12 digits / Número da Conta Online do USCIS deve ter exatamente 12 dígitos").first()).toBeVisible();
  67 |   });
  68 | });
  69 | 
```