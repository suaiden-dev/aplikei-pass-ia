-- RLS hardening for office_amounts_ledger and process_logs.
-- Goals:
-- 1) Office financial ledger is readable only by office staff/owner and admins.
-- 2) Process logs are readable only by the process owner, office staff/owner and admins.
-- 3) Ledger sync trigger keeps working for authenticated/anon checkout flows.

alter table public.office_amounts_ledger enable row level security;
alter table public.process_logs enable row level security;

-- Ensure the trigger that mirrors orders into office_amounts_ledger bypasses RLS.
create or replace function public.sync_office_amounts_ledger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_available_at timestamptz;
begin
  if new.office_id is null then
    delete from public.office_amounts_ledger where order_id = new.id;
    return new;
  end if;

  v_available_at := coalesce(new.created_at, now()) + make_interval(mins => greatest(1, coalesce(new.subscription_available_after_minutes, 20160)));

  insert into public.office_amounts_ledger (
    order_id,
    office_id,
    subscription_plan_id,
    gross_amount_usd,
    fee_percentage,
    fee_amount_usd,
    net_amount_usd,
    available_after_minutes,
    available_at,
    payment_status
  )
  values (
    new.id,
    new.office_id,
    new.subscription_plan_id,
    coalesce(new.total_price_usd, 0),
    coalesce(new.subscription_percentage_fee, 0),
    coalesce(new.office_fee_amount_usd, 0),
    coalesce(new.office_net_amount_usd, 0),
    greatest(1, coalesce(new.subscription_available_after_minutes, 20160)),
    v_available_at,
    coalesce(new.payment_status, 'pending')
  )
  on conflict (order_id) do update
  set
    office_id = excluded.office_id,
    subscription_plan_id = excluded.subscription_plan_id,
    gross_amount_usd = excluded.gross_amount_usd,
    fee_percentage = excluded.fee_percentage,
    fee_amount_usd = excluded.fee_amount_usd,
    net_amount_usd = excluded.net_amount_usd,
    available_after_minutes = excluded.available_after_minutes,
    available_at = excluded.available_at,
    payment_status = excluded.payment_status,
    updated_at = now();

  return new;
end;
$$;

drop policy if exists "office_amounts_ledger_select_office_or_admin" on public.office_amounts_ledger;
create policy "office_amounts_ledger_select_office_or_admin"
  on public.office_amounts_ledger
  for select
  to authenticated
  using (
    public.is_admin()
    or office_id = public.current_user_office_id()
    or exists (
      select 1
      from public.offices
      where offices.id = office_amounts_ledger.office_id
        and offices.owner_id = auth.uid()
    )
  );

drop policy if exists "office_amounts_ledger_admin_write" on public.office_amounts_ledger;
create policy "office_amounts_ledger_admin_write"
  on public.office_amounts_ledger
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "process_logs_select_related_or_admin" on public.process_logs;
create policy "process_logs_select_related_or_admin"
  on public.process_logs
  for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.user_services us
      where us.id = process_logs.user_service_id
        and (
          us.user_id = auth.uid()
          or us.office_id = public.current_user_office_id()
          or exists (
            select 1
            from public.offices
            where offices.id = us.office_id
              and offices.owner_id = auth.uid()
          )
        )
    )
  );

drop policy if exists "process_logs_admin_write" on public.process_logs;
create policy "process_logs_admin_write"
  on public.process_logs
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
