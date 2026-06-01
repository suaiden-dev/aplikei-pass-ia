import { describe, expect, it } from "vitest";
import { v } from "./validators";

const validate = (validator: ReturnType<typeof v.required>, value: string) => validator(value, {});

describe("form validators", () => {
  it("treats optional empty values as valid except for required and mustBeTrue", () => {
    expect(validate(v.email(), "")).toBeUndefined();
    expect(validate(v.minLength(3), "")).toBeUndefined();
    expect(validate(v.required(), "")).toBe("Campo obrigatório");
    expect(v.mustBeTrue()(false as unknown as string, {})).toBe("Campo obrigatório");
  });

  it("validates common formats", () => {
    expect(validate(v.email(), "user@example.com")).toBeUndefined();
    expect(validate(v.email(), "invalid")).toBe("E-mail inválido");
    expect(validate(v.url(), "https://aplikei.com")).toBeUndefined();
    expect(validate(v.url(), "aplikei")).toBe("URL inválida");
    expect(validate(v.date(), "29/02/2024")).toBeUndefined();
    expect(validate(v.date(), "31/02/2024")).toBe("Data inválida");
  });

  it("validates Brazilian documents and contact fields", () => {
    expect(validate(v.cpf(), "529.982.247-25")).toBeUndefined();
    expect(validate(v.cpf(), "111.111.111-11")).toBe("CPF inválido");
    expect(validate(v.cnpj(), "11.222.333/0001-81")).toBeUndefined();
    expect(validate(v.cnpj(), "11.111.111/1111-11")).toBe("CNPJ inválido");
    expect(validate(v.phone(), "(11) 98765-4321")).toBeUndefined();
    expect(validate(v.cep(), "12345-678")).toBeUndefined();
  });

  it("validates numbers and relational fields", () => {
    expect(validate(v.numeric(), "abc")).toBe("Apenas números");
    expect(validate(v.integer(), "-10")).toBeUndefined();
    expect(validate(v.min(10), "9")).toBe("Valor mínimo: 10");
    expect(validate(v.max(10), "11")).toBe("Valor máximo: 10");
    expect(v.matches<{ password: string }>("password")("secret", { password: "secret" })).toBeUndefined();
    expect(validate(v.oneOf(["pt", "en"]), "es")).toBe("Opção inválida");
  });

  it("compose stops at the first validation error", () => {
    const validator = v.compose(v.required("Required"), v.minLength(6, "Too short"));

    expect(validator("", {})).toBe("Required");
    expect(validator("abc", {})).toBe("Too short");
    expect(validator("abcdef", {})).toBeUndefined();
  });
});
