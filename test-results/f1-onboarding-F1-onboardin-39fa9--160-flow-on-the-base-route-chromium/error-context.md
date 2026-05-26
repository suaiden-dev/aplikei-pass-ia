# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: f1-onboarding.spec.ts >> F1 onboarding >> renders the guided DS-160 flow on the base route
- Location: tests/e2e/f1-onboarding.spec.ts:5:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Formulário DS-160' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Formulário DS-160' })

```

```yaml
- region "Notifications alt+T"
```

# Test source

```ts
  1   | import { expect, test } from "@playwright/test";
  2   | import { mockF1Supabase } from "./support/f1";
  3   | 
  4   | test.describe("F1 onboarding", () => {
  5   |   test("renders the guided DS-160 flow on the base route", async ({ page }) => {
  6   |     await mockF1Supabase(page, {
  7   |       slug: "visto-f1",
  8   |       currentStep: 0,
  9   |     });
  10  | 
  11  |     await page.goto("/dashboard/processes/visto-f1/onboarding");
  12  | 
> 13  |     await expect(page.getByRole("heading", { name: "Formulário DS-160" })).toBeVisible();
      |                                                                            ^ Error: expect(locator).toBeVisible() failed
  14  |     await expect(page.getByText("Etapa 1 de 13")).toBeVisible();
  15  |     await expect(page.getByRole("button", { name: "Salvar Rascunho" })).toBeVisible();
  16  |     await expect(page.getByRole("button", { name: "Próxima seção" })).toBeVisible();
  17  |   });
  18  | 
  19  |   test("shows the reapplication subtitle when the route contains reaplicacao", async ({ page }) => {
  20  |     await mockF1Supabase(page, {
  21  |       slug: "visa-f1-reaplicacao",
  22  |       currentStep: 0,
  23  |     });
  24  | 
  25  |     await page.goto("/dashboard/processes/visa-f1-reaplicacao/onboarding");
  26  | 
  27  |     await expect(page.getByRole("heading", { name: "Formulário DS-160" })).toBeVisible();
  28  |     await expect(page.getByText("Visto de Estudante F-1 (Reaplicação) — Preenchimento Guiado")).toBeVisible();
  29  |   });
  30  | 
  31  |   test("renders I-20 upload stage at step 1", async ({ page }) => {
  32  |     await mockF1Supabase(page, {
  33  |       slug: "visto-f1",
  34  |       currentStep: 1,
  35  |     });
  36  | 
  37  |     await page.goto("/dashboard/processes/visto-f1/onboarding?step=1");
  38  | 
  39  |     await expect(page.getByText("Upload do I-20")).toBeVisible();
  40  |     await expect(page.getByText("Selecionar Arquivo")).toBeVisible();
  41  |   });
  42  | 
  43  |   test("renders admin document review notice at step 2", async ({ page }) => {
  44  |     await mockF1Supabase(page, {
  45  |       slug: "visto-f1",
  46  |       currentStep: 2,
  47  |     });
  48  | 
  49  |     await page.goto("/dashboard/processes/visto-f1/onboarding?step=2");
  50  | 
  51  |     await expect(page.getByText("Revisando Documentos").first()).toBeVisible();
  52  |     await expect(
  53  |       page.getByText("Excelente! Seus documentos foram recebidos e estão sendo analisados pela nossa equipe.")
  54  |     ).toBeVisible();
  55  |   });
  56  | 
  57  |   test("renders review and sign stage at step 3", async ({ page }) => {
  58  |     await mockF1Supabase(page, {
  59  |       slug: "visto-f1",
  60  |       currentStep: 3,
  61  |       stepData: {
  62  |         ds160_application_id: "AA00123456",
  63  |         ds160_security_answer: "SILVA",
  64  |         ds160_birth_date: "1990",
  65  |       },
  66  |     });
  67  | 
  68  |     await page.goto("/dashboard/processes/visto-f1/onboarding?step=3");
  69  | 
  70  |     await expect(page.getByText("Assinatura da DS-160")).toBeVisible();
  71  |     await expect(page.getByText("Application ID")).toBeVisible();
  72  |   });
  73  | 
  74  |   test("renders admin final analysis notice at step 5", async ({ page }) => {
  75  |     await mockF1Supabase(page, {
  76  |       slug: "visto-f1",
  77  |       currentStep: 5,
  78  |     });
  79  | 
  80  |     await page.goto("/dashboard/processes/visto-f1/onboarding?step=5");
  81  | 
  82  |     await expect(
  83  |       page.getByText("Nossos especialistas estão revisando suas informações e preparando o formulário DS-160 oficial.")
  84  |     ).toBeVisible();
  85  |   });
  86  | 
  87  |   test("renders CASV scheduling preference stage at step 6", async ({ page }) => {
  88  |     await mockF1Supabase(page, {
  89  |       slug: "visto-f1",
  90  |       currentStep: 6,
  91  |     });
  92  | 
  93  |     await page.goto("/dashboard/processes/visto-f1/onboarding?step=6");
  94  | 
  95  |     await expect(page.getByRole("heading", { name: "AGENDAMENTO CASV / CONSULADO" })).toBeVisible();
  96  |   });
  97  | 
  98  |   test("renders account creation notice at step 7", async ({ page }) => {
  99  |     await mockF1Supabase(page, {
  100 |       slug: "visto-f1",
  101 |       currentStep: 7,
  102 |     });
  103 | 
  104 |     await page.goto("/dashboard/processes/visto-f1/onboarding?step=7");
  105 | 
  106 |     await expect(
  107 |       page.getByText("UMA CONTA SERÁ CRIADA NO SITE DO CONSULADO PARA SEU VISTO F-1.").first()
  108 |     ).toBeVisible();
  109 |   });
  110 | 
  111 |   test("renders confirm email stage at step 8", async ({ page }) => {
  112 |     await mockF1Supabase(page, {
  113 |       slug: "visto-f1",
```