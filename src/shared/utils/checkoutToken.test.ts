import { describe, expect, it } from "vitest";
import { decodeCheckoutToken, encodeCheckoutToken } from "./checkoutToken";

describe("checkout token", () => {
  it("round-trips an office, product and UUID reference", () => {
    const payload = {
      office: "silva-law",
      product: "visa-b1b2",
      ref: "550e8400-e29b-41d4-a716-446655440000",
    };

    expect(decodeCheckoutToken(encodeCheckoutToken(payload))).toEqual(payload);
  });

  it("supports office slugs that contain dots", () => {
    const token = encodeCheckoutToken({
      office: "ny.silva-law",
      product: "consulta",
      ref: "550e8400-e29b-41d4-a716-446655440000",
    });

    expect(decodeCheckoutToken(token)).toEqual({
      office: "ny.silva-law",
      product: "consulta",
      ref: "550e8400-e29b-41d4-a716-446655440000",
    });
  });

  it("returns null for malformed tokens", () => {
    expect(decodeCheckoutToken("missing-parts")).toBeNull();
    expect(decodeCheckoutToken(".product.ref")).toBeNull();
    expect(decodeCheckoutToken("office..ref")).toBeNull();
  });
});
