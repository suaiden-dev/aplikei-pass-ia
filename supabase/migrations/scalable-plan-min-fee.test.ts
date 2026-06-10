import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { MAIN_VISA_SLUGS } from "../functions/_shared/domain/catalog/slugs";

const migrationSql = readFileSync(
  path.resolve(process.cwd(), "supabase/migrations/20260608120000_scalable_plan_min_fee_per_transaction.sql"),
  "utf8",
).toLowerCase();

describe("scalable plan minimum transaction fee migration", () => {
  it("adds the plan, order snapshot, and ledger mirror columns", () => {
    expect(migrationSql).toContain("alter table public.subscription_plans");
    expect(migrationSql).toContain("add column if not exists min_fee_per_transaction_usd numeric(10,2)");

    expect(migrationSql).toContain("alter table public.orders");
    expect(migrationSql).toContain("add column if not exists subscription_min_fee_per_transaction_usd numeric(10,2)");

    expect(migrationSql).toContain("alter table public.office_amounts_ledger");
    expect(migrationSql).toContain("add column if not exists min_fee_per_transaction_usd numeric(10,2)");
  });

  it("keeps the SQL main visa function in sync with the shared catalog", () => {
    expect(migrationSql).toContain("create or replace function public.is_main_visa_slug");

    for (const slug of MAIN_VISA_SLUGS) {
      expect(migrationSql, slug).toContain(`'${slug}'`);
    }

    expect(migrationSql).not.toContain("'dependent-f1'");
    expect(migrationSql).not.toContain("'dependent-cos'");
    expect(migrationSql).not.toContain("'dependent-eos'");
    expect(migrationSql).not.toContain("'mentoria-individual'");
  });

  it("snapshots and applies the minimum fee only after the percentage fee is calculated", () => {
    expect(migrationSql).toContain("p.min_fee_per_transaction_usd");
    expect(migrationSql).toContain("into v_plan_id, v_percentage, v_available_minutes, v_min_fee_per_tx");
    expect(migrationSql).toContain("v_fee := round((v_gross * v_percentage) / 100.0, 2)");
    expect(migrationSql).toContain("and public.is_main_visa_slug(coalesce(new.product_slug, ''))");
    expect(migrationSql).toContain("and v_fee < v_min_fee_per_tx");
    expect(migrationSql).toContain("v_fee := v_min_fee_per_tx");
    expect(migrationSql).toContain("new.subscription_min_fee_per_transaction_usd := v_min_fee_per_tx");
  });

  it("mirrors the snapshot to the office amounts ledger and preserves the RLS-safe trigger function", () => {
    expect(migrationSql).toContain("create or replace function public.sync_office_amounts_ledger()");
    expect(migrationSql).toContain("security definer");
    expect(migrationSql).toContain("min_fee_per_transaction_usd,");
    expect(migrationSql).toContain("new.subscription_min_fee_per_transaction_usd");
    expect(migrationSql).toContain("min_fee_per_transaction_usd = excluded.min_fee_per_transaction_usd");
  });

  it("exposes the minimum fee on the current subscription view used by the UI", () => {
    expect(migrationSql).toContain("create or replace view public.v_office_current_subscription");
    expect(migrationSql).toContain("p.min_fee_per_transaction_usd");
    expect(migrationSql).toContain("grant select on public.v_office_current_subscription to authenticated");
  });

  it("recalculates the order snapshot and ledger when product_slug changes", () => {
    expect(migrationSql).toContain("before insert or update of office_id, total_price_usd, product_slug");
    expect(migrationSql).toContain(
      "after insert or update of office_id, total_price_usd, product_slug, payment_status, created_at, subscription_min_fee_per_transaction_usd",
    );
  });

  it("seeds the scalable plan minimum fee without changing the existing percentage", () => {
    expect(migrationSql).toContain("set min_fee_per_transaction_usd = 30.00");
    expect(migrationSql).toContain("'crescimento (variável)'");
    expect(migrationSql).toContain("'scalable plan'");
    expect(migrationSql).not.toContain("percentage_fee =");
  });
});
