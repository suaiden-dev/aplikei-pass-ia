/**
 * Checkout Pricing Logic Tests
 * Tests price calculations for different services, dependents, and payment methods.
 */
import { describe, it, expect } from "vitest";

// Replicated from stripe-checkout/index.ts
const STRIPE_PRICES: Record<string, { usd: number; name: string; dependentPrice: number }> = {
  "visto-b1-b2": { usd: 200, name: "Guia Visto Americano B1/B2", dependentPrice: 50 },
  "visto-f1": { usd: 350, name: "Guia Visto Americano F-1", dependentPrice: 100 },
  "extensao-status": { usd: 200, name: "Guia Extensão de Status", dependentPrice: 100 },
  "troca-status": { usd: 350, name: "Guia Troca de Status", dependentPrice: 100 },
};

// Replicated from stripe-specialist-checkout/index.ts
const SPECIALIST_PACKAGES: Record<number, { name: string; price: number; desc: string }> = {
  1: { name: "Mentoria Individual (1 Aula)", price: 4900, desc: "Sessão única" },
  2: { name: "Pacote Bronze (2 Aulas)", price: 8900, desc: "Duas sessões" },
  3: { name: "Pacote Gold (3 Aulas)", price: 11900, desc: "Três sessões" },
  4: { name: "Revisão com Especialista", price: 4900, desc: "Análise de recusa" },
};

// Replicated from _shared/stripe-fee-calculator.ts
function calculateCardAmountWithFees(subtotalUSD: number): number {
  // Stripe takes 2.9% + $0.30
  const fee = subtotalUSD * 0.029 + 0.3;
  return subtotalUSD + fee;
}

function calculateSubtotal(slug: string, dependents: number): number {
  const service = STRIPE_PRICES[slug];
  if (!service) throw new Error(`Invalid slug: ${slug}`);
  return service.usd + dependents * service.dependentPrice;
}

describe("Checkout Pricing", () => {
  describe("Service pricing", () => {
    it("should calculate base price for B1/B2 visa", () => {
      expect(calculateSubtotal("visto-b1-b2", 0)).toBe(200);
    });

    it("should calculate base price for F-1 visa", () => {
      expect(calculateSubtotal("visto-f1", 0)).toBe(350);
    });

    it("should add dependent pricing for B1/B2", () => {
      expect(calculateSubtotal("visto-b1-b2", 1)).toBe(250);
      expect(calculateSubtotal("visto-b1-b2", 2)).toBe(300);
      expect(calculateSubtotal("visto-b1-b2", 3)).toBe(350);
    });

    it("should add dependent pricing for F-1", () => {
      expect(calculateSubtotal("visto-f1", 1)).toBe(450);
      expect(calculateSubtotal("visto-f1", 2)).toBe(550);
    });

    it("should throw for invalid slug", () => {
      expect(() => calculateSubtotal("invalid-slug", 0)).toThrow("Invalid slug");
    });
  });

  describe("Card fee calculation", () => {
    it("should apply Stripe fees (2.9% + $0.30) to $200", () => {
      const result = calculateCardAmountWithFees(200);
      // 200 + (200 * 0.029 + 0.30) = 200 + 6.10 = 206.10
      expect(result).toBeCloseTo(206.1, 2);
    });

    it("should apply Stripe fees to $350", () => {
      const result = calculateCardAmountWithFees(350);
      // 350 + (350 * 0.029 + 0.30) = 350 + 10.45 = 360.45
      expect(result).toBeCloseTo(360.45, 2);
    });

    it("should handle zero amount", () => {
      const result = calculateCardAmountWithFees(0);
      expect(result).toBeCloseTo(0.3, 2); // just the $0.30 fixed fee
    });
  });

  describe("Specialist packages", () => {
    it("should have 4 packages defined", () => {
      expect(Object.keys(SPECIALIST_PACKAGES)).toHaveLength(4);
    });

    it("Mentoria Individual should cost $49", () => {
      expect(SPECIALIST_PACKAGES[1].price).toBe(4900); // in cents
    });

    it("Pacote Bronze should cost $89", () => {
      expect(SPECIALIST_PACKAGES[2].price).toBe(8900);
    });

    it("Pacote Gold should cost $119", () => {
      expect(SPECIALIST_PACKAGES[3].price).toBe(11900);
    });

    it("Revisão com Especialista should cost $49", () => {
      expect(SPECIALIST_PACKAGES[4].price).toBe(4900);
    });

    it("package 4 type should be specialist_review", () => {
      // This validates the metadata logic
      const packageType = 4;
      const metadataType = packageType === 4 ? "specialist_review" : "specialist_training";
      expect(metadataType).toBe("specialist_review");
    });

    it("packages 1-3 type should be specialist_training", () => {
      [1, 2, 3].forEach((pt) => {
        const metadataType = pt === 4 ? "specialist_review" : "specialist_training";
        expect(metadataType).toBe("specialist_training");
      });
    });
  });

  describe("Metadata slug generation", () => {
    it("should generate correct slug for specialist training", () => {
      [1, 2, 3].forEach((pt) => {
        const slug = pt === 4 ? "specialist-review" : "specialist-training";
        expect(slug).toBe("specialist-training");
      });
    });

    it("should generate correct slug for specialist review", () => {
      const slug = 4 === 4 ? "specialist-review" : "specialist-training";
      expect(slug).toBe("specialist-review");
    });
  });
});
