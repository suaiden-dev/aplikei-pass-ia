import { describe, expect, it } from "vitest";
import { shouldPromptForIdentityPhoto } from "./identityPhotoPrompt";
import type { UserAccount } from "../../../models";

const baseUser: UserAccount = {
  id: "user-1",
  fullName: "Teste User",
  email: "teste@example.com",
  phoneNumber: "+55 11 99999-9999",
  avatarUrl: null,
  passportPhotoUrl: null,
  role: "customer",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("shouldPromptForIdentityPhoto", () => {
  it("does not prompt while auth is still loading", () => {
    expect(
      shouldPromptForIdentityPhoto(baseUser, { current_step: 0 }, "loading", false),
    ).toBe(false);
  });

  it("does not prompt when a passport photo already exists", () => {
    expect(
      shouldPromptForIdentityPhoto(
        { ...baseUser, passportPhotoUrl: "https://example.com/passport.jpg" },
        { current_step: 0 },
        "authenticated",
        true,
      ),
    ).toBe(false);
  });

  it("does not prompt before account hydration finishes", () => {
    expect(shouldPromptForIdentityPhoto(baseUser, { current_step: 0 }, "authenticated", false)).toBe(false);
  });

  it("prompts only for new users without a stored identity photo", () => {
    expect(shouldPromptForIdentityPhoto(baseUser, { current_step: 0 }, "authenticated", true)).toBe(true);
  });
});
