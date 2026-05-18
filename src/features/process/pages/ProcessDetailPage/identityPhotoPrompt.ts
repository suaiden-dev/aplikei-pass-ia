import type { UserAccount } from "@shared/types";

export function shouldPromptForIdentityPhoto(
  user: UserAccount | null,
  proc: { current_step?: number | null } | null,
  status: "loading" | "authenticated" | "unauthenticated",
  accountHydrated: boolean,
): boolean {
  if (!user || !proc || status === "loading" || !accountHydrated) {
    return false;
  }

  return !user.passportPhotoUrl && !user.avatarUrl && (proc.current_step ?? 0) === 0;
}
