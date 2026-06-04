import { expect, test } from "@playwright/test";
import { mockCOSSupabase } from "./support/cos";

test.describe("COS recovery flows", () => {
  test("renders motion customer proposal step (pay and accept)", async ({ page }) => {
    const processSlug = "troca-status";
    const basePath = `/dashboard/processes/${processSlug}/onboarding`;

    await mockCOSSupabase(page, {
      slug: processSlug,
      currentStep: 21,
      stepData: {
        uscis_official_result: "denied",
        motion_proposal_text: "Plano técnico para Motion com revisão completa.",
        motion_proposal_amount: 1750,
      },
    });

    await page.goto(`${basePath}?step=21`);

    await expect(page.getByTestId("motion-proposal-step")).toBeVisible();
    await expect(page.getByTestId("motion-proposal-text")).toContainText("Plano técnico para Motion");
    await expect(page.getByTestId("motion-proposal-amount")).toContainText("1750.00");
    await expect(page.getByTestId("motion-proposal-accept-btn")).toBeVisible();
  });

  test("shows cumulative RFE history across multiple consecutive cycles", async ({ page }) => {
    const processSlug = "troca-status";
    const basePath = `/dashboard/processes/${processSlug}/onboarding`;

    await mockCOSSupabase(page, {
      slug: processSlug,
      currentStep: 13,
      stepData: {
        uscis_official_result: "rfe",
        rfe_history: [
          {
            proposal_text: "Ciclo 1 - estratégia inicial",
            proposal_amount: 900,
            result: "rfe",
            sent_at: "2026-05-01T10:00:00.000Z",
          },
          {
            proposal_text: "Ciclo 2 - reforço documental",
            proposal_amount: 1200,
            result: "denied",
            sent_at: "2026-05-10T10:00:00.000Z",
          },
          {
            proposal_text: "Ciclo 3 - ajuste final",
            proposal_amount: 1400,
            result: "approved",
            sent_at: "2026-05-20T10:00:00.000Z",
          },
        ],
      },
    });

    await page.goto(`${basePath}?step=13`);

    await expect(page.getByTestId("rfe-history-panel")).toBeVisible();
    await expect(page.getByTestId("rfe-history-item")).toHaveCount(3);
    await expect(page.getByTestId("rfe-history-proposal").filter({ hasText: "Ciclo 1 - estratégia inicial" })).toHaveCount(1);
    await expect(page.getByTestId("rfe-history-proposal").filter({ hasText: "Ciclo 2 - reforço documental" })).toHaveCount(1);
    await expect(page.getByTestId("rfe-history-proposal").filter({ hasText: "Ciclo 3 - ajuste final" })).toHaveCount(1);
  });

  test("switches from RFE to motion context after denied RFE", async ({ page }) => {
    const processSlug = "troca-status";
    const basePath = `/dashboard/processes/${processSlug}/onboarding`;

    await mockCOSSupabase(page, {
      slug: processSlug,
      currentStep: 19,
      stepData: {
        uscis_official_result: "denied",
        uscis_rfe_result: "denied",
        rfe_history: [
          {
            proposal_text: "RFE negada, iniciando Motion",
            proposal_amount: 1500,
            result: "denied",
            sent_at: "2026-05-21T10:00:00.000Z",
          },
        ],
      },
    });

    await page.goto(`${basePath}?step=19`);

    await expect(page.getByTestId("motion-explanation-step")).toBeVisible();
  });

  const recoverySlugs: Array<"troca-status" | "extensao-status"> = [
    "troca-status",
    "extensao-status",
  ];

  for (const processSlug of recoverySlugs) {
    test(`renders RFE pay-and-accept step with fallback texts and 3 outcome buttons (${processSlug})`, async ({
      page,
    }) => {
      const basePath = `/dashboard/processes/${processSlug}/onboarding`;

      await mockCOSSupabase(page, {
        slug: processSlug,
        currentStep: 16,
        stepData: {
          uscis_official_result: "rfe",
          rfe_proposal_text: "Estratégia de resposta RFE com checklist documental.",
          rfe_proposal_amount: 950,
          rfe_proposal_paid: true,
        },
      });

      await page.goto(`${basePath}?step=16`);

      await expect(page.getByText(/RFE — Aceitar e Pagar/i)).toBeVisible();
      await expect(page.getByText(/Nossa Estratégia de Resposta|Plano de Ação/i).first()).toBeVisible();
      await expect(page.getByTestId("rfe-proposal-text")).toContainText(
        "Estratégia de resposta RFE",
      );
      await expect(page.getByTestId("rfe-proposal-amount")).toContainText("950.00");
      await expect(page.getByTestId("rfe-proposal-accept-btn")).toBeVisible();
      await expect(page.getByRole("button", { name: /^Aprovado$/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /^RFE$/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /^Reprovado$/i })).toBeVisible();
    });

    test(`renders Motion final step with only approved/rejected actions (no RFE button) (${processSlug})`, async ({
      page,
    }) => {
      const basePath = `/dashboard/processes/${processSlug}/onboarding`;

      await mockCOSSupabase(page, {
        slug: processSlug,
        currentStep: 23,
        stepData: {
          uscis_official_result: "denied",
          motion_proposal_text: "Plano técnico Motion",
          motion_proposal_amount: 1800,
        },
      });

      await page.goto(`${basePath}?step=23`);

      await expect(page.getByText(/Como foi o resultado da Motion\?/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /^Aprovado$/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /^Negado$/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /^RFE$/i })).toHaveCount(0);
    });
  }
});
