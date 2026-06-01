import { describe, expect, it } from "vitest";
import { localizeNotificationContent } from "./localizeNotification";

const labels = {
  system: "Sistema",
  stepApproved: "Etapa aprovada traduzida",
  stepApprovedMessage: "Sua etapa foi aprovada.",
  actionRequiredReview: "Revisar etapa",
  clientCompletedStepMessage: "Cliente concluiu {{step}} em {{service}}.",
  underReview: "Estamos analisando",
  underReviewMessage: "Nossa equipe está revisando sua etapa.",
};

describe("localizeNotificationContent", () => {
  it("uses template metadata when present", () => {
    expect(localizeNotificationContent({
      title: "",
      message: "",
      metadata: {
        template: "payment_confirmed",
        service_name: "B1/B2",
      },
    }, "pt", labels)).toEqual({
      title: "Pagamento Confirmado!",
      message: "Seu pagamento para B1/B2 foi processado com sucesso.",
    });
  });

  it("translates known legacy titles using provided labels", () => {
    expect(localizeNotificationContent({
      title: "Step Approved",
      message: "Old message",
    }, "pt", labels)).toEqual({
      title: "Etapa aprovada traduzida",
      message: "Sua etapa foi aprovada.",
    });
  });

  it("translates admin review messages with captured step and service names", () => {
    expect(localizeNotificationContent({
      title: "Action required: review step",
      message: 'Client completed step "Documents" in F1 and is waiting for your review.',
    }, "pt", labels)).toEqual({
      title: "Revisar etapa",
      message: "Cliente concluiu Documents em F1.",
    });
  });

  it("falls back to original content for unknown notifications", () => {
    expect(localizeNotificationContent({
      title: "",
      message: "Raw message",
    }, "pt", labels)).toEqual({
      title: "Sistema",
      message: "Raw message",
    });
  });
});
