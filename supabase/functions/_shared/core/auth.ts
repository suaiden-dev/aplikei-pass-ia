type SupabaseLikeClient = {
  auth: {
    getUser: (token: string) => Promise<{
      data: { user: { id: string } | null };
      error: unknown;
    }>;
  };
};

function readBearerToken(req: Request, headerNames: string[]): string | null {
  for (const headerName of headerNames) {
    const value = req.headers.get(headerName);
    if (!value?.startsWith("Bearer ")) continue;

    const token = value.replace("Bearer ", "").trim();
    if (token && token !== "null" && token !== "undefined") {
      return token;
    }
  }

  return null;
}

import { createLogger } from "./logger.ts";

const log = createLogger("auth");

export async function getOptionalUserId(
  req: Request,
  supabase: SupabaseLikeClient,
  headerNames = ["X-Customer-Auth", "Authorization", "authorization"],
): Promise<string | null> {
  const token = readBearerToken(req, headerNames);
  if (!token) return null;

  try {
    const { data, error } = await supabase.auth.getUser(token);
    return error || !data.user ? null : data.user.id;
  } catch (error) {
    log.warn("skip user retrieval due to invalid/expired JWT", { error: String(error) });
    return null;
  }
}

export async function requireUser(
  req: Request,
  supabase: SupabaseLikeClient,
  headerNames = ["Authorization", "authorization"],
) {
  const token = readBearerToken(req, headerNames);
  if (!token) return null;

  const { data, error } = await supabase.auth.getUser(token);
  return error || !data.user ? null : data.user;
}
