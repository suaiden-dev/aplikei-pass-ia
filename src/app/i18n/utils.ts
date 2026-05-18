/**
 * Pure utility functions for the i18n system.
 * No React dependencies — fully testable in isolation.
 */

// ─────────────────────────────────────────
// Interpolation
// ─────────────────────────────────────────

/**
 * Replaces `{key}` placeholders in a string with the corresponding value
 * from `vars`. Unknown placeholders are left as-is.
 *
 * @example
 *   interpolate("Hello {name}, you have {count} messages.", { name: "Ana", count: 3 })
 *   // → "Hello Ana, you have 3 messages."
 *
 *   interpolate("Expires in {s}s", { s: 30 })
 *   // → "Expires in 30s"
 */
export function interpolate(
  str: string,
  vars: Record<string, string | number>,
): string {
  return str.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

// ─────────────────────────────────────────
// Object traversal
// ─────────────────────────────────────────

/**
 * Navigates a nested object by a dot-separated path and returns the value at
 * that path, or `undefined` if any segment is missing.
 *
 * @example
 *   getByPath({ auth: { login: { title: "Sign In" } } }, "auth.login.title")
 *   // → "Sign In"
 *
 *   getByPath({ a: 1 }, "b.c")
 *   // → undefined
 */
export function getByPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((cursor, segment) => {
    if (cursor !== null && cursor !== undefined && typeof cursor === "object") {
      return (cursor as Record<string, unknown>)[segment];
    }
    return undefined;
  }, obj);
}
