begin;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_phone text;
begin
  v_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'User');
  v_phone := coalesce(new.raw_user_meta_data->>'phone_number', null);

  begin
    insert into public.user_accounts (id, email, full_name, phone_number)
    values (new.id, new.email, v_name, v_phone)
    on conflict (id) do update
      set email = excluded.email,
          full_name = coalesce(excluded.full_name, public.user_accounts.full_name),
          phone_number = coalesce(excluded.phone_number, public.user_accounts.phone_number),
          updated_at = now();
  exception
    when undefined_column then
      insert into public.user_accounts (id, email, name, phone)
      values (new.id, new.email, v_name, v_phone)
      on conflict (id) do update
        set email = excluded.email,
            name = coalesce(excluded.name, public.user_accounts.name),
            phone = coalesce(excluded.phone, public.user_accounts.phone),
            updated_at = now();
  end;

  return new;
end;
$$;

create or replace function public.sync_auth_user_to_users_accounts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_phone text;
begin
  v_name := coalesce(new.raw_user_meta_data->>'full_name', old.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  v_phone := coalesce(new.raw_user_meta_data->>'phone_number', old.raw_user_meta_data->>'phone_number');

  begin
    update public.user_accounts
       set email = new.email,
           full_name = coalesce(v_name, public.user_accounts.full_name),
           phone_number = coalesce(v_phone, public.user_accounts.phone_number),
           updated_at = now()
     where id = new.id;
  exception
    when undefined_column then
      update public.user_accounts
         set email = new.email,
             name = coalesce(v_name, public.user_accounts.name),
             phone = coalesce(v_phone, public.user_accounts.phone),
             updated_at = now()
       where id = new.id;
  end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_users_accounts on auth.users;
create trigger on_auth_user_created_users_accounts
after insert on auth.users
for each row execute function public.handle_new_auth_user();

drop trigger if exists on_auth_user_updated_users_accounts on auth.users;
create trigger on_auth_user_updated_users_accounts
after update on auth.users
for each row execute function public.sync_auth_user_to_users_accounts();

commit;
