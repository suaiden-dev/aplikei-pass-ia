import type { AuthStatus } from "../../../contexts/AuthContext/context";
import type { UserAccount } from "../../../models";

export function shouldPromptForIdentityPhoto(
  user: UserAccount | null,
  proc: { current_step?: number | null } | null,
  status: AuthStatus,
  accountHydrated: boolean,
): boolean {
  if (!user || !proc || status === "loading" || !accountHydrated) {
    return false;
  }

  return !user.passportPhotoUrl && !user.avatarUrl && (proc.current_step ?? 0) === 0;
}
