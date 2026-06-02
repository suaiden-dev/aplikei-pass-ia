import { describe, expect, it } from "vitest";
import { getByPath, interpolate } from "./utils";

describe("i18n utilities", () => {
  it("interpolates known variables and leaves unknown placeholders intact", () => {
    expect(interpolate("Hello {name}, you have {count} messages and {missing}.", {
      name: "Ana",
      count: 3,
    })).toBe("Hello Ana, you have 3 messages and {missing}.");
  });

  it("reads nested values by dot path", () => {
    const locale = { auth: { login: { title: "Entrar" } } };

    expect(getByPath(locale, "auth.login.title")).toBe("Entrar");
    expect(getByPath(locale, "auth.signup.title")).toBeUndefined();
    expect(getByPath(null, "auth.login.title")).toBeUndefined();
  });
});
