import { err, json, options } from "./http.ts";
import { createLogger } from "./logger.ts";

const log = createLogger("handler");

function statusFromError(e: unknown): number {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg === "Unauthorized") return 401;
  if (msg === "Forbidden") return 403;
  if (/not found/i.test(msg)) return 404;
  return 400;
}

export function handler(
  fn: (req: Request) => Promise<Response>,
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    if (req.method === "OPTIONS") return options();
    try {
      return await fn(req);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      log.error("unhandled", e);
      return err(msg, statusFromError(e));
    }
  };
}
