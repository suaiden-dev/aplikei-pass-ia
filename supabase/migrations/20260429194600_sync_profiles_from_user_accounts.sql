begin;

insert into public.profiles (
  id,
  full_name,
  email,
  phone,
  avatar_url,
  passport_photo_url,
  updated_at
)
select
  ua.id,
  ua.name,
  ua.email,
  ua.phone,
  ua.profile_url,
  ua.passport_photo_url,
  coalesce(ua.updated_at, now())
from aplikei.users_accounts ua
on conflict (id) do update
set
  full_name = coalesce(excluded.full_name, public.profiles.full_name),
  email = coalesce(excluded.email, public.profiles.email),
  phone = coalesce(excluded.phone, public.profiles.phone),
  avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
  passport_photo_url = coalesce(excluded.passport_photo_url, public.profiles.passport_photo_url),
  updated_at = now();

create or replace function public.sync_profile_from_users_account()
returns trigger
language plpgsql
security definer
set search_path = public, aplikei
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    phone,
    avatar_url,
    passport_photo_url,
    updated_at
  )
  values (
    new.id,
    new.name,
    new.email,
    new.phone,
    new.profile_url,
    new.passport_photo_url,
    coalesce(new.updated_at, now())
  )
  on conflict (id) do update
  set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    email = coalesce(excluded.email, public.profiles.email),
    phone = coalesce(excluded.phone, public.profiles.phone),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    passport_photo_url = coalesce(excluded.passport_photo_url, public.profiles.passport_photo_url),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists tr_sync_profile_from_users_account on aplikei.users_accounts;
create trigger tr_sync_profile_from_users_account
after insert or update of name, email, phone, profile_url, passport_photo_url, updated_at
on aplikei.users_accounts
for each row
execute function public.sync_profile_from_users_account();

commit;
