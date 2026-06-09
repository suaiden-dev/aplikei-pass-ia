import { describe, expect, it } from "vitest";
import { isMainVisaSlug, MAIN_VISA_SLUGS, SLUG_BEHAVIOR } from "./slugs";

describe("main visa slug catalog", () => {
  it("marks every main visa slug as standalone and non-auxiliary", () => {
    for (const slug of MAIN_VISA_SLUGS) {
      expect(isMainVisaSlug(slug), slug).toBe(true);
      expect(SLUG_BEHAVIOR[slug]?.strategy, slug).toBe("standalone");
      expect(SLUG_BEHAVIOR[slug]?.isAuxiliary, slug).not.toBe(true);
    }
  });

  it("normalizes case and whitespace when checking main visas", () => {
    expect(isMainVisaSlug(" VISA-B1B2 ")).toBe(true);
    expect(isMainVisaSlug("VISTO-F1")).toBe(true);
  });

  it("does not classify auxiliary services as main visas", () => {
    const auxiliarySlugs = [
      "dependent-f1",
      "dependent-cos",
      "dependent-eos",
      "mentoria-individual",
      "analysis-rfe-cos",
      "consultancy-motion-eos",
      "slot-dependente",
    ];

    for (const slug of auxiliarySlugs) {
      expect(isMainVisaSlug(slug), slug).toBe(false);
    }
  });
});
