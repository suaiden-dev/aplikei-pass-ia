import { describe, expect, it } from "vitest";
import { masks } from "./masks";

describe("form masks", () => {
  it("formats Brazilian documents and limits extra digits", () => {
    expect(masks.cpf("12345678900999")).toBe("123.456.789-00");
    expect(masks.cnpj("11222333000181999")).toBe("11.222.333/0001-81");
    expect(masks.cep("123456789")).toBe("12345-678");
  });

  it("formats phone numbers with and without the ninth digit", () => {
    expect(masks.phone("11987654321")).toBe("(11) 98765-4321");
    expect(masks.phone("1133334444")).toBe("(11) 3333-4444");
    expect(masks.phoneIntl("+55 11 98765-4321")).toBe("+55 (11) 98765-4321");
  });

  it("formats payment fields", () => {
    expect(masks.creditCard("4111111111111111")).toBe("4111 1111 1111 1111");
    expect(masks.cardExpiry("1234")).toBe("12/34");
    expect(masks.cvv("12345")).toBe("1234");
    expect(masks.currencyBRL("123456")).toBe("R$ 1.234,56");
    expect(masks.currencyUSD("123456")).toBe("$ 1,234.56");
  });

  it("normalizes USCIS receipt numbers", () => {
    expect(masks.uscisReceiptNumber("abc1234567890")).toBe("ABC-123-4567890");
    expect(masks.uscisReceiptNumber("a*b c-123")).toBe("ABC-123");
  });

  it("composes masks in order", () => {
    const mask = masks.compose(masks.lettersOnly, masks.uppercase, masks.maxChars(4));

    expect(mask("a1b2 çde")).toBe("AB Ç");
  });
});
