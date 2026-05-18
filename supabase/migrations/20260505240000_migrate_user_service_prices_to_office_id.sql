-- Migrate user_service_prices: user_id -> office_id
-- Prices now belong to an office, not a user.

begin;

-- 1. Add office_id column
alter table public.user_service_prices
  add column if not exists office_id uuid references public.offices(id) on delete cascade;

-- 2. Populate office_id from existing user_id via offices.owner_id
update public.user_service_prices usp
set office_id = o.id
from public.offices o
where o.owner_id = usp.user_id
  and usp.office_id is null;

-- 3. Drop rows that have no matching office (users without an office)
delete from public.user_service_prices where office_id is null;

-- 4. Drop existing RLS policies that depend on user_id before dropping the column
alter table public.user_service_prices disable row level security;
drop policy if exists "usp_select_policy" on public.user_service_prices;
drop policy if exists "usp_update_policy" on public.user_service_prices;
drop policy if exists "usp_lawyer_policy" on public.user_service_prices;

-- 5. Make office_id required, drop user_id
alter table public.user_service_prices
  alter column office_id set not null,
  drop column user_id;

-- 6. Replace unique constraint
alter table public.user_service_prices
  drop constraint if exists user_service_prices_user_id_service_id_key,
  drop constraint if exists usp_office_service_unique,
  add constraint usp_office_service_unique unique (office_id, service_id);

-- 7. Recreate RLS policies using office_id

-- SELECT: office owner sees their prices; admins see all
create policy "usp_select_policy" on public.user_service_prices
  for select to authenticated
  using (
    exists (
      select 1 from public.offices
      where offices.id = office_id
        and offices.owner_id = auth.uid()
    )
    or public.is_admin()
  );

-- UPDATE: only the office owner can change prices
create policy "usp_update_policy" on public.user_service_prices
  for update to authenticated
  using (
    exists (
      select 1 from public.offices
      where offices.id = office_id
        and offices.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.offices
      where offices.id = office_id
        and offices.owner_id = auth.uid()
    )
  );

alter table public.user_service_prices enable row level security;

-- 8. Replace trigger: populate by office_id on office INSERT
create or replace function public.handle_office_created_populate_prices()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.user_service_prices (office_id, service_id, price, currency)
  select new.id, s.id, s.default_price, s.default_currency
  from public.services s
  where s.is_active = true
  on conflict (office_id, service_id) do nothing;

  return new;
end;
$$;

-- 9. Replace trigger: on role change to admin_lawyer, find office and populate
create or replace function public.handle_admin_lawyer_service_prices()
returns trigger
language plpgsql
security definer
as $$
begin
  if (new.role = 'admin_lawyer' and (old.role is distinct from 'admin_lawyer')) then
    insert into public.user_service_prices (office_id, service_id, price, currency)
    select o.id, s.id, s.default_price, s.default_currency
    from public.offices o
    cross join public.services s
    where o.owner_id = new.id
      and s.is_active = true
    on conflict (office_id, service_id) do nothing;
  end if;
  return new;
end;
$$;

commit;
