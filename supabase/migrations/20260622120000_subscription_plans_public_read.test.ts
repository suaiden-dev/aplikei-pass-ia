import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migrationSql = readFileSync(
  path.resolve(process.cwd(), "supabase/migrations/20260622120000_subscription_plans_public_read.sql"),
  "utf8",
).toLowerCase();

describe("subscription plans public read migration", () => {
  it("allows public select for active subscription plans only", () => {
    expect(migrationSql).toContain("drop policy if exists \"public read active subscription_plans\"");
    expect(migrationSql).toContain("create policy \"public read active subscription_plans\"");
    expect(migrationSql).toContain("on public.subscription_plans");
    expect(migrationSql).toContain("for select");
    expect(migrationSql).toContain("to public");
    expect(migrationSql).toContain("using (is_active = true)");
  });
});
