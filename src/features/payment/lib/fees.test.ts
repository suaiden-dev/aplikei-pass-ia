import { describe, it, expect } from "vitest";
import { parsePriceUSD, estimateCardTotal, estimatePixTotal } from "./fees";

describe("fees logic", () => {
  describe("parsePriceUSD", () => {
    it("should parse US$ 497,00 to 497", () => {
      expect(parsePriceUSD("US$ 497,00")).toBe(497);
    });

    it("should handle strings without symbols", () => {
      expect(parsePriceUSD("123,45")).toBe(123.45);
    });

    it("should handle empty or invalid strings", () => {
      expect(parsePriceUSD("")).toBe(0);
      expect(parsePriceUSD("abc")).toBe(0);
    });
  });

  describe("estimateCardTotal", () => {
    it("should correctly estimate card total with fees", () => {
      // (100 + 0.3) / (1 - 0.039) = 100.3 / 0.961 = 104.3704...
      const total = estimateCardTotal(100);
      expect(total).toBeCloseTo(104.37, 2);
    });
  });

  describe("estimatePixTotal", () => {
    it("should correctly estimate pix total with exchange and taxes", () => {
      // 100 * 5.7 = 570
      // 570 / (1 - 0.018) = 570 / 0.982 = 580.448...
      // 580.448 * (1 + 0.035) = 580.448 * 1.035 = 600.76...
      const total = estimatePixTotal(100, 5.7);
      expect(total).toBeCloseTo(600.76, 2);
    });
  });
});
