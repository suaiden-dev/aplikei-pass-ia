begin;

create or replace function public.sync_auth_user_to_users_accounts()
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
  v_name text;
  v_phone text;
begin
  v_name := coalesce(new.raw_user_meta_data->>'full_name', old.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  v_phone := coalesce(new.raw_user_meta_data->>'phone_number', old.raw_user_meta_data->>'phone_number');

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

    if has_full_name and has_phone_number then
      update public.user_accounts
         set email = new.email,
             full_name = coalesce(v_name, public.user_accounts.full_name),
             phone_number = coalesce(v_phone, public.user_accounts.phone_number),
             updated_at = now()
       where id = new.id;
    elsif has_name and has_phone then
      update public.user_accounts
         set email = new.email,
             name = coalesce(v_name, public.user_accounts.name),
             phone = coalesce(v_phone, public.user_accounts.phone),
             updated_at = now()
       where id = new.id;
    elsif has_full_name then
      update public.user_accounts
         set email = new.email,
             full_name = coalesce(v_name, public.user_accounts.full_name),
             updated_at = now()
       where id = new.id;
    elsif has_name then
      update public.user_accounts
         set email = new.email,
             name = coalesce(v_name, public.user_accounts.name),
             updated_at = now()
       where id = new.id;
    else
      update public.user_accounts
         set email = new.email,
             updated_at = now()
       where id = new.id;
    end if;
  exception
    when others then
      -- Never block Supabase Auth login because of profile sync mismatch.
      return new;
  end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_updated_users_accounts on auth.users;
create trigger on_auth_user_updated_users_accounts
after update on auth.users
for each row execute function public.sync_auth_user_to_users_accounts();

commit;
