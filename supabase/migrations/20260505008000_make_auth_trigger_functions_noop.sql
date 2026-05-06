begin;

-- Public functions used by auth.users triggers
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  return new;
end;
$$;

create or replace function public.sync_auth_user_to_users_accounts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  return new;
end;
$$;

-- Legacy aplikei schema functions (if any trigger still points there)
do $$
begin
  if exists (select 1 from pg_namespace where nspname = 'aplikei') then
    execute $f$
      create or replace function aplikei.handle_new_auth_user()
      returns trigger
      language plpgsql
      security definer
      set search_path = aplikei, public
      as $body$
      begin
        return new;
      end;
      $body$
    $f$;

    execute $f$
      create or replace function aplikei.sync_auth_user_to_users_accounts()
      returns trigger
      language plpgsql
      security definer
      set search_path = aplikei, public
      as $body$
      begin
        return new;
      end;
      $body$
    $f$;
  end if;
end $$;

commit;
