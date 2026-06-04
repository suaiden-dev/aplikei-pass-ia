import { expect, test } from "@playwright/test";
import { mockCOSSupabase } from "./support/cos";

test.describe("COS onboarding", () => {
  const runAllStepsSuite = (processSlug: "troca-status" | "extensao-status", suiteLabel: string) => {
    test(`covers all onboarding steps from 0 to 11 (${suiteLabel})`, async ({ page }) => {
      test.setTimeout(90000);
      const basePath = `/dashboard/processes/${processSlug}/onboarding`;

      const assertStep = async (step: number) => {
        await page.unrouteAll({ behavior: "ignoreErrors" });
        await mockCOSSupabase(page, {
          slug: processSlug,
          currentStep: step,
          stepData: {
            currentVisa: "B1/B2",
            targetVisa: "F1",
            i94Date: "2026-12-31",
            finalPackagePdfUrl: "https://example.com/final.pdf",
          },
        });

        await page.goto(`${basePath}?step=${step}`);

        if (step === 0) {
          await expect(page.getByRole("heading", { name: "Formulário Inicial" }).first()).toBeVisible();
          await expect(page.getByText("Qual o seu visto atual?")).toBeVisible();
          return;
        }

        if (step === 1) {
          await expect(page.getByRole("heading", { name: "Envios de Documentos" }).first()).toBeVisible();
          await expect(page.getByText("Instruções do I-94")).toBeVisible();
          return;
        }

        // admin_action steps redirect to ProcessDetailPage showing "EM REVISÃO"
        if (step === 2) {
          await expect(page.getByText(/EM REVISÃO/i).first()).toBeVisible();
          return;
        }

        if (step === 3) {
          await expect(page.getByRole("heading", { name: "Upload do I-20" }).first()).toBeVisible();
          return;
        }

        if (step === 4) {
          await expect(page.getByText("Confirmação de Pagamento").first()).toBeVisible();
          await expect(page.getByText(/Taxa SEVIS/i).first()).toBeVisible();
          return;
        }

        if (step === 5) {
          await expect(page.getByText("Carta de Suporte").first()).toBeVisible();
          return;
        }

        // admin_action steps redirect to ProcessDetailPage showing "EM REVISÃO"
        if (step === 6) {
          await expect(page.getByText(/EM REVISÃO/i).first()).toBeVisible();
          return;
        }

        if (step === 7) {
          // I-539 step renders section cards (no single "Formulário I-539" heading).
          await expect(page.getByText(/Parte 1|Part 1/i).first()).toBeVisible();
          return;
        }

        // admin_action steps redirect to ProcessDetailPage showing "EM REVISÃO"
        if (step === 8) {
          await expect(page.getByText(/EM REVISÃO/i).first()).toBeVisible();
          return;
        }

        if (step === 9) {
          if (processSlug === "extensao-status") {
            // EOS step 9 is eos_uscis_fee — same SevisFeeStep component as COS sevis
            await expect(page.getByText("Confirmação de Pagamento").first()).toBeVisible();
            return;
          }
          await expect(page.getByText(/Formulário Final|Final Form/i).first()).toBeVisible();
          await expect(page.getByText(/Form G-1145/i).first()).toBeVisible();
          return;
        }

        // admin_action steps redirect to ProcessDetailPage showing "EM REVISÃO"
        if (step === 10) {
          await expect(page.getByText(/EM REVISÃO/i).first()).toBeVisible();
          return;
        }

        if (step === 11) {
          if (processSlug === "extensao-status") {
            // EOS step 11 is eos_final_review — FinalFormsStep (same as COS cos_final_forms)
            await expect(page.getByText(/Formulário Final|Final Form/i).first()).toBeVisible();
            return;
          }
          await expect(page.getByText("Pacote Pronto!")).toBeVisible();
          await expect(page.getByText(/Siga os passos finais/i)).toBeVisible();
        }
      };

      for (let step = 0; step <= 11; step += 1) {
        await test.step(`step ${step}`, async () => {
          await assertStep(step);
        });
      }
    });
  };

  runAllStepsSuite("troca-status", "COS");
  runAllStepsSuite("extensao-status", "EOS");
});
