-- ─── Fix Auth Trigger ────────────────────────────────────────────────────────
-- 1. Ensure enum values exist
do $$
begin
  if not exists (select 1 from pg_type t join pg_enum e on t.oid = e.enumtypid where t.typname = 'user_account_role' and e.enumlabel = 'manager') then
    alter type public.user_account_role add value 'manager';
  end if;
  if not exists (select 1 from pg_type t join pg_enum e on t.oid = e.enumtypid where t.typname = 'user_account_role' and e.enumlabel = 'admin_lawyer') then
    alter type public.user_account_role add value 'admin_lawyer';
  end if;
end $$;

-- 2. Update trigger function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_office_id uuid;
  v_is_active boolean;
begin
  -- Extract metadata from Auth
  v_role := coalesce(new.raw_user_meta_data->>'role', 'admin_lawyer');
  v_office_id := (new.raw_user_meta_data->>'office_id')::uuid;
  
  -- Determine initial active state
  -- Staff members (seller, manager, admin, admin_lawyer) must be approved.
  if v_role in ('seller', 'manager', 'admin', 'admin_lawyer') then
    v_is_active := false;
  else
    v_is_active := true;
  end if;

  insert into public.user_accounts (
    id, 
    email,
    full_name, 
    phone_number,
    role,
    office_id,
    is_active
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone_number', ''),
    v_role::public.user_account_role,
    v_office_id,
    v_is_active
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    phone_number = excluded.phone_number,
    role = excluded.role,
    office_id = excluded.office_id,
    is_active = excluded.is_active;

  return new;
end;
$$;
