do $$
begin
  if to_regclass('public.user_services') is not null then
    alter table public.user_services
      add column if not exists chat_closed_at timestamptz default null;
  end if;
end $$;

-- Only admins can close/reopen chat
do $$
begin
  if to_regclass('public.user_services') is not null then
    drop policy if exists "user_services_chat_close_admin" on public.user_services;
    if exists (
      select 1
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname = 'current_user_role'
    ) then
      create policy "user_services_chat_close_admin"
      on public.user_services
      for update
      to authenticated
      using (coalesce(public.current_user_role()::text in ('master', 'admin', 'manager', 'admin_lawyer'), false))
      with check (coalesce(public.current_user_role()::text in ('master', 'admin', 'manager', 'admin_lawyer'), false));
    end if;
  end if;
end $$;
