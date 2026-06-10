/// <reference types="node" />

import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(__dirname, "../..");

const allowed = new Set([
  "src/features/admin/pages/ProcessDetailPage/index.tsx",
]);

const forbiddenPatterns = [
  /\bsupabase\s*\.\s*from\s*\(/,
  /\bsupabase\s*\.\s*rpc\s*\(/,
  /\bsupabase\s*\.\s*storage\s*\./,
  /\bfunctions\s*\.\s*invoke\s*\(/,
  /\bgetSupabaseClient\s*\(/,
];

function listPageFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) return listPageFiles(fullPath);
    if (!/\.(ts|tsx)$/.test(entry)) return [];
    return [relative(ROOT, fullPath)];
  });
}

describe("page architecture", () => {
  it("keeps direct Supabase calls out of page components", () => {
    const pages = listPageFiles(resolve(ROOT, "src/features"))
      .filter((file) => file.includes("/pages/"));

    const violations = pages.flatMap((file) => {
      if (allowed.has(file)) return [];
      const source = readFileSync(resolve(ROOT, file), "utf8");
      return forbiddenPatterns.some((pattern) => pattern.test(source))
        ? [relative(ROOT, resolve(ROOT, file))]
        : [];
    });

    expect(violations).toEqual([]);
  });
});
