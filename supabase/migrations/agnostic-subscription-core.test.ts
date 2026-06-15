import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migrationSql = readFileSync(
  path.resolve(process.cwd(), "supabase/migrations/20260615120000_agnostic_subscription_core.sql"),
  "utf8",
).toLowerCase();

describe("agnostic subscription core migration", () => {
  it("adds versioning and snapshot columns to plans, subscriptions, and orders", () => {
    expect(migrationSql).toContain("alter table public.subscription_plans");
    expect(migrationSql).toContain("add column if not exists version integer not null default 1");
    expect(migrationSql).toContain("add column if not exists billing_model text not null default 'prepaid'");
    expect(migrationSql).toContain("add column if not exists rules jsonb not null default '{}'::jsonb");

    expect(migrationSql).toContain("alter table public.office_subscriptions");
    expect(migrationSql).toContain("add column if not exists plan_version integer not null default 1");
    expect(migrationSql).toContain("add column if not exists rules_snapshot jsonb not null default '{}'::jsonb");
    expect(migrationSql).toContain("add column if not exists effective_from timestamptz not null default now()");

    expect(migrationSql).toContain("alter table public.orders");
    expect(migrationSql).toContain("add column if not exists subscription_id uuid references public.office_subscriptions(id)");
    expect(migrationSql).toContain("add column if not exists subscription_rules_snapshot jsonb not null default '{}'::jsonb");
    expect(migrationSql).toContain("add column if not exists subscription_snapshot_created_at timestamptz");
  });

  it("creates the immutable history table and history view", () => {
    expect(migrationSql).toContain("create table if not exists public.office_subscription_versions");
    expect(migrationSql).toContain("create index if not exists idx_office_subscription_versions_office_id_created_at");
    expect(migrationSql).toContain("create or replace view public.v_office_subscription_history");
    expect(migrationSql).toContain("grant select on public.v_office_subscription_history to authenticated");
  });

  it("exposes the current subscription with version and rules data", () => {
    expect(migrationSql).toContain("drop view if exists public.v_office_current_subscription");
    expect(migrationSql).toContain("create view public.v_office_current_subscription");
    expect(migrationSql).toContain("coalesce(os.plan_version, p.version, 1) as plan_version");
    expect(migrationSql).toContain("coalesce(os.billing_model, p.billing_model, 'prepaid') as billing_model");
    expect(migrationSql).toContain("coalesce(os.rules_snapshot, p.rules, '{}'::jsonb) as rules_snapshot");
  });

  it("resolves a subscription by timestamp so old sales keep the old plan snapshot", () => {
    expect(migrationSql).toContain("create or replace function public.get_office_subscription_at(");
    expect(migrationSql).toContain("and coalesce(os.effective_from, os.current_period_start, now()) <= p_at");
    expect(migrationSql).toContain("and (os.effective_to is null or os.effective_to > p_at)");
    expect(migrationSql).toContain("order by coalesce(os.effective_from, os.current_period_start, now()) desc, os.created_at desc");
    expect(migrationSql).toContain("limit 1");
    expect(migrationSql).toContain("select *");
    expect(migrationSql).toContain("into v_subscription");
    expect(migrationSql).toContain("from public.get_office_subscription_at(new.office_id, v_snapshot_at)");
  });

  it("captures subscription history whenever a current subscription changes", () => {
    expect(migrationSql).toContain("create or replace function public.capture_office_subscription_version()");
    expect(migrationSql).toContain("insert into public.office_subscription_versions");
    expect(migrationSql).toContain("after insert or update of plan_id, status, current_period_start, current_period_end, cancel_at_period_end, effective_from, effective_to, plan_version, billing_model, rules_snapshot");
  });

  it("snapshots the active subscription on orders and preserves the legacy fee calculation", () => {
    expect(migrationSql).toContain("create or replace function public.set_order_subscription_snapshot()");
    expect(migrationSql).toContain("new.subscription_id := v_subscription.subscription_id");
    expect(migrationSql).toContain("new.subscription_plan_id := v_subscription.plan_id");
    expect(migrationSql).toContain("new.subscription_plan_version := coalesce(v_subscription.plan_version, 1)");
    expect(migrationSql).toContain("new.subscription_pricing_model := coalesce(v_subscription.plan_type::text, 'fixed')");
    expect(migrationSql).toContain("new.subscription_rules_snapshot := coalesce(v_subscription.rules_snapshot, '{}'::jsonb)");
    expect(migrationSql).toContain("new.subscription_effective_from := v_subscription.effective_from");
    expect(migrationSql).toContain("new.subscription_effective_to := v_subscription.effective_to");
    expect(migrationSql).toContain("new.subscription_fee_mode := coalesce(v_subscription.billing_model, 'prepaid')");
    expect(migrationSql).toContain("new.office_fee_amount_usd := greatest(0, v_fee)");
    expect(migrationSql).toContain("new.office_net_amount_usd := greatest(0, round(v_gross - v_fee, 2))");
  });

  it("supports prepaid, postpaid, and hybrid pricing modes from the plan snapshot", () => {
    expect(migrationSql).toContain("when v_subscription.plan_type = 'fixed'");
    expect(migrationSql).toContain("when v_subscription.plan_type = 'percentage'");
    expect(migrationSql).toContain("when v_subscription.plan_type = 'hybrid'");
  });
});
