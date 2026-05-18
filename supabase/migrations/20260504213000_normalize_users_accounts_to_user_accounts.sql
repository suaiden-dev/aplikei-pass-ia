begin;

do $$
declare
  user_accounts_kind "char";
  users_accounts_kind "char";
  legacy_view_exists boolean := false;
  p record;
  v record;
  f record;
  role_list text;
  using_expr text;
  check_expr text;
  view_sql text;
  fn_sql text;
begin
  if to_regclass('public.user_accounts') is not null then
    select c.relkind
      into user_accounts_kind
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relname = 'user_accounts';
  end if;

  if to_regclass('public.users_accounts') is not null then
    select c.relkind
      into users_accounts_kind
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relname = 'users_accounts';
  end if;

  -- Simple path: only users_accounts table exists.
  if to_regclass('public.users_accounts') is not null
     and to_regclass('public.user_accounts') is null
     and users_accounts_kind = 'r' then
      execute 'alter table public.users_accounts rename to user_accounts';
  end if;

  -- If user_accounts is already a table, just merge + drop users_accounts.
  if to_regclass('public.users_accounts') is not null and user_accounts_kind = 'r' then
    if users_accounts_kind = 'r' then
      execute '
        insert into public.user_accounts
        select *
        from public.users_accounts ua
        where not exists (
          select 1 from public.user_accounts u where u.id = ua.id
        )
      ';
      execute 'drop table public.users_accounts';
    end if;
  end if;

  -- Complex path: user_accounts is a view, users_accounts is the backing table.
  if to_regclass('public.users_accounts') is not null
     and user_accounts_kind = 'v'
     and users_accounts_kind = 'r' then
    execute 'alter view public.user_accounts rename to user_accounts_legacy';
    legacy_view_exists := true;

    execute 'alter table public.users_accounts rename to user_accounts';

    -- Rebind policies that referenced the legacy view in USING / WITH CHECK.
    for p in
      select
        p.polname,
        n.nspname as table_schema,
        c.relname as table_name,
        p.polcmd,
        p.polroles,
        pg_get_expr(p.polqual, p.polrelid) as using_expr,
        pg_get_expr(p.polwithcheck, p.polrelid) as check_expr
      from pg_policy p
      join pg_class c on c.oid = p.polrelid
      join pg_namespace n on n.oid = c.relnamespace
      where coalesce(pg_get_expr(p.polqual, p.polrelid), '') like '%user_accounts_legacy%'
         or coalesce(pg_get_expr(p.polwithcheck, p.polrelid), '') like '%user_accounts_legacy%'
    loop
      select string_agg(quote_ident(r.rolname), ', ')
        into role_list
      from pg_roles r
      where r.oid = any(p.polroles);

      role_list := coalesce(nullif(role_list, ''), 'PUBLIC');

      using_expr := p.using_expr;
      check_expr := p.check_expr;

      if using_expr is not null then
        using_expr := replace(using_expr, 'public.user_accounts_legacy', 'public.user_accounts');
        using_expr := replace(using_expr, 'user_accounts_legacy', 'user_accounts');
      end if;

      if check_expr is not null then
        check_expr := replace(check_expr, 'public.user_accounts_legacy', 'public.user_accounts');
        check_expr := replace(check_expr, 'user_accounts_legacy', 'user_accounts');
      end if;

      execute format('alter policy %I on %I.%I to %s', p.polname, p.table_schema, p.table_name, role_list);
      if using_expr is not null then
        execute format('alter policy %I on %I.%I using (%s)', p.polname, p.table_schema, p.table_name, using_expr);
      end if;
      if check_expr is not null then
        execute format('alter policy %I on %I.%I with check (%s)', p.polname, p.table_schema, p.table_name, check_expr);
      end if;
    end loop;

    -- Rebind dependent views/materialized views.
    for v in
      select n.nspname as view_schema, c.relname as view_name
      from pg_depend d
      join pg_rewrite r on r.oid = d.objid
      join pg_class c on c.oid = r.ev_class
      join pg_namespace n on n.oid = c.relnamespace
      where d.refobjid = to_regclass('public.user_accounts_legacy')
        and c.relkind = 'v'
    loop
      select pg_get_viewdef(format('%I.%I', v.view_schema, v.view_name)::regclass, true) into view_sql;
      view_sql := replace(view_sql, 'public.user_accounts_legacy', 'public.user_accounts');
      view_sql := replace(view_sql, 'user_accounts_legacy', 'user_accounts');
      execute format('create or replace view %I.%I as %s', v.view_schema, v.view_name, view_sql);
    end loop;

    -- Rebind SQL/PLPGSQL functions that directly depend on the legacy view.
    for f in
      select p.oid as proc_oid
      from pg_depend d
      join pg_proc p on p.oid = d.objid
      where d.refobjid = to_regclass('public.user_accounts_legacy')
        and d.classid = 'pg_proc'::regclass
    loop
      select pg_get_functiondef(f.proc_oid) into fn_sql;
      fn_sql := replace(fn_sql, 'public.user_accounts_legacy', 'public.user_accounts');
      fn_sql := replace(fn_sql, 'user_accounts_legacy', 'user_accounts');
      execute fn_sql;
    end loop;

    -- If no remaining hard dependency, remove legacy view.
    begin
      execute 'drop view public.user_accounts_legacy';
      legacy_view_exists := false;
    exception
      when dependent_objects_still_exist then
        raise exception 'Could not drop public.user_accounts_legacy due to remaining dependencies. Review pg_depend and rebind manually.';
    end;
  end if;

  -- Ensure RLS on the canonical table.
  if user_accounts_kind = 'r' then
    execute 'alter table public.user_accounts enable row level security';
  elsif to_regclass('public.user_accounts') is not null then
    select c.relkind
      into user_accounts_kind
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relname = 'user_accounts';
    if user_accounts_kind = 'r' then
      execute 'alter table public.user_accounts enable row level security';
    end if;
  end if;

  if legacy_view_exists then
    raise notice 'public.user_accounts_legacy still exists; manual cleanup may be required';
  end if;
end $$;

commit;
