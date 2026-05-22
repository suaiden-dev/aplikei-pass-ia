# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: b1b2-onboarding.spec.ts >> B1/B2 onboarding >> covers all onboarding steps from 0 to 10
- Location: tests/e2e/b1b2-onboarding.spec.ts:44:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://127.0.0.1:4173/dashboard/processes/visto-b1-b2/onboarding?step=4", waiting until "load"

```

# Test source

```ts
  1   | import { expect, test } from "@playwright/test";
  2   | import { mockB1B2Supabase } from "./support/b1b2";
  3   | 
  4   | test.describe("B1/B2 onboarding", () => {
  5   |   test("renders the guided DS-160 flow on the base route", async ({ page }) => {
  6   |     await mockB1B2Supabase(page, {
  7   |       slug: "visto-b1-b2",
  8   |       currentStep: 0,
  9   |     });
  10  | 
  11  |     await page.goto("/dashboard/processes/visto-b1-b2/onboarding");
  12  | 
  13  |     await expect(page.getByRole("heading", { name: "Formulário DS-160" })).toBeVisible();
  14  |     await expect(page.getByText("Etapa 1 de 11")).toBeVisible();
  15  |     await expect(page.getByRole("button", { name: "Salvar Rascunho" })).toBeVisible();
  16  |     await expect(page.getByRole("button", { name: "Próxima seção" })).toBeVisible();
  17  |   });
  18  | 
  19  |   test("shows the reapplication subtitle when the route contains reaplicacao", async ({ page }) => {
  20  |     await mockB1B2Supabase(page, {
  21  |       slug: "visa-b1b2-reaplicacao",
  22  |       currentStep: 0,
  23  |     });
  24  | 
  25  |     await page.goto("/dashboard/processes/visa-b1b2-reaplicacao/onboarding");
  26  | 
  27  |     await expect(page.getByRole("heading", { name: "Formulário DS-160" })).toBeVisible();
  28  |     await expect(page.getByText("Visto B1/B2 (Reaplicação) — Preenchimento Guiado")).toBeVisible();
  29  |   });
  30  | 
  31  |   test("renders the consular fee notice at step 8", async ({ page }) => {
  32  |     await mockB1B2Supabase(page, {
  33  |       slug: "visto-b1-b2",
  34  |       currentStep: 8,
  35  |     });
  36  | 
  37  |     await page.goto("/dashboard/processes/visto-b1-b2/onboarding?step=8");
  38  | 
  39  |     await expect(page.getByRole("heading", { name: "Taxa Consular" })).toBeVisible();
  40  |     await expect(page.getByText("Voltar para Dashboard")).toBeVisible();
  41  |     await expect(page.getByText(/Estamos finalizando a emissão do seu boleto MRV/i)).toBeVisible();
  42  |   });
  43  | 
  44  |   test("covers all onboarding steps from 0 to 10", async ({ page }) => {
  45  |     const processSlug = "visto-b1-b2";
  46  |     const basePath = `/dashboard/processes/${processSlug}/onboarding`;
  47  | 
  48  |     const assertStep = async (step: number) => {
  49  |       await mockB1B2Supabase(page, {
  50  |         slug: processSlug,
  51  |         currentStep: step,
  52  |         stepData: {
  53  |           homeCountry: "Brasil",
  54  |           securityExceptions: "nao",
  55  |           interviewLocation: "São Paulo",
  56  |         },
  57  |       });
  58  | 
> 59  |       await page.goto(`${basePath}?step=${step}`);
      |                  ^ Error: page.goto: Test timeout of 30000ms exceeded.
  60  | 
  61  |       if (step <= 1 || step === 4) {
  62  |         await expect(page.getByRole("heading", { name: "Formulário DS-160" })).toBeVisible();
  63  |         await expect(page.getByText(`Etapa ${step + 1} de 11`)).toBeVisible();
  64  |         await expect(page.getByRole("button", { name: "Salvar Rascunho" })).toBeVisible();
  65  |         return;
  66  |       }
  67  | 
  68  |       if (step === 2) {
  69  |         await expect(page.getByText(/Criando suas credenciais/i)).toBeVisible();
  70  |         await expect(page.getByRole("button", { name: /Voltar para Dashboard/i })).toBeVisible();
  71  |         return;
  72  |       }
  73  | 
  74  |       if (step === 3) {
  75  |         await expect(page.getByRole("heading", { name: /Assinatura da DS-160/i })).toBeVisible();
  76  |         await expect(page.getByText(/Acesse o site do CEAC/i)).toBeVisible();
  77  |         return;
  78  |       }
  79  | 
  80  |       if (step === 5) {
  81  |         await expect(page.getByRole("heading", { name: /AGENDAMENTO CASV/i })).toBeVisible();
  82  |         await expect(page.getByRole("button", { name: /CONFIRMAR DATA E SOLICITAR AGENDAMENTO/i })).toBeVisible();
  83  |         return;
  84  |       }
  85  | 
  86  |       if (step === 6) {
  87  |         await expect(page.getByText(/UMA CONTA SERÁ CRIADA UTILIZANDO SEU EMAIL/i)).toBeVisible();
  88  |         await expect(page.getByRole("button", { name: /Voltar para Dashboard/i })).toBeVisible();
  89  |         return;
  90  |       }
  91  | 
  92  |       if (step === 7) {
  93  |         await expect(page.getByRole("heading", { name: /Confirmação de E-mail/i })).toBeVisible();
  94  |         await expect(page.getByRole("button", { name: /JÁ CONFIRMEI O EMAIL/i })).toBeVisible();
  95  |         return;
  96  |       }
  97  | 
  98  |       if (step === 8) {
  99  |         await expect(page.getByRole("heading", { name: /Taxa Consular/i })).toBeVisible();
  100 |         await expect(page.getByRole("button", { name: /Voltar para Dashboard/i })).toBeVisible();
  101 |         return;
  102 |       }
  103 | 
  104 |       if (step === 9) {
  105 |         await expect(page.getByRole("heading", { name: /Pagamento da Taxa MRV/i })).toBeVisible();
  106 |         await expect(page.getByRole("button", { name: /Cartão de Crédito/i })).toBeVisible();
  107 |         await expect(page.getByRole("button", { name: /Boleto Bancário/i })).toBeVisible();
  108 |         return;
  109 |       }
  110 | 
  111 |       await expect(page.getByRole("heading", { name: /Agendamento Final e Preparação/i })).toBeVisible();
  112 |       await expect(page.getByText(/Guia de Entrevista/i)).toBeVisible();
  113 |       await expect(page.getByText(/Simulado com IA|Treino de Entrevista com IA/i)).toBeVisible();
  114 |     };
  115 | 
  116 |     for (let step = 0; step <= 10; step += 1) {
  117 |       await test.step(`step ${step}`, async () => {
  118 |         await assertStep(step);
  119 |       });
  120 |     }
  121 |   });
  122 | });
  123 | 
```