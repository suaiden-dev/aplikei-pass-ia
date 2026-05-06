begin;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  has_full_name boolean;
  has_name boolean;
  has_phone_number boolean;
  has_phone boolean;
  has_avatar_url boolean;
  has_profile_url boolean;
  v_name text;
  v_phone text;
begin
  v_name := coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'User');
  v_phone := coalesce(new.raw_user_meta_data->>'phone_number', new.raw_user_meta_data->>'phone');

  begin
    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'user_accounts' and column_name = 'full_name'
    ) into has_full_name;

    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'user_accounts' and column_name = 'name'
    ) into has_name;

    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'user_accounts' and column_name = 'phone_number'
    ) into has_phone_number;

    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'user_accounts' and column_name = 'phone'
    ) into has_phone;

    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'user_accounts' and column_name = 'avatar_url'
    ) into has_avatar_url;

    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'user_accounts' and column_name = 'profile_url'
    ) into has_profile_url;

    if has_full_name and has_phone_number and has_avatar_url then
      insert into public.user_accounts (id, email, full_name, phone_number, avatar_url)
      values (new.id, new.email, v_name, v_phone, null)
      on conflict (id) do update
        set email = excluded.email,
            full_name = coalesce(excluded.full_name, public.user_accounts.full_name),
            phone_number = coalesce(excluded.phone_number, public.user_accounts.phone_number),
            updated_at = now();
    elsif has_name and has_phone and has_profile_url then
      insert into public.user_accounts (id, email, name, phone, profile_url)
      values (new.id, new.email, v_name, v_phone, null)
      on conflict (id) do update
        set email = excluded.email,
            name = coalesce(excluded.name, public.user_accounts.name),
            phone = coalesce(excluded.phone, public.user_accounts.phone),
            updated_at = now();
    elsif has_full_name then
      insert into public.user_accounts (id, email, full_name)
      values (new.id, new.email, v_name)
      on conflict (id) do update
        set email = excluded.email,
            full_name = coalesce(excluded.full_name, public.user_accounts.full_name),
            updated_at = now();
    elsif has_name then
      insert into public.user_accounts (id, email, name)
      values (new.id, new.email, v_name)
      on conflict (id) do update
        set email = excluded.email,
            name = coalesce(excluded.name, public.user_accounts.name),
            updated_at = now();
    else
      insert into public.user_accounts (id, email)
      values (new.id, new.email)
      on conflict (id) do update
        set email = excluded.email,
            updated_at = now();
    end if;
  exception
    when others then
      -- Never block auth signup due to profile schema mismatch.
      return new;
  end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_users_accounts on auth.users;
create trigger on_auth_user_created_users_accounts
after insert on auth.users
for each row execute function public.handle_new_auth_user();

commit;
