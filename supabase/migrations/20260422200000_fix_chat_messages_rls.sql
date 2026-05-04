-- Helper functions with SECURITY DEFINER to bypass RLS on referenced tables
-- This ensures chat_messages policies can read user_accounts and user_services
-- even when those tables have restrictive RLS policies.

create or replace function public.chat_is_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'current_user_role'
  ) then
    return coalesce(public.current_user_role()::text in ('master', 'admin', 'manager', 'admin_lawyer'), false);
  end if;
  return false;
end;
$$;

create or replace function public.chat_owns_process(p_process_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  owns_process boolean := false;
begin
  if to_regclass('public.user_services') is null then
    return false;
  end if;

  execute $q$
    select exists (
      select 1
      from public.user_services
      where id = $1 and user_id = auth.uid()
    )
  $q$
  into owns_process
  using p_process_id;

  return coalesce(owns_process, false);
end;
$$;

-- Rebuild SELECT policy using security definer helpers
drop policy if exists "chat_messages_select_participants" on public.chat_messages;
create policy "chat_messages_select_participants"
on public.chat_messages
for select
to authenticated
using (
  public.chat_is_admin()
  or public.chat_owns_process(process_id)
  or sender_id = auth.uid()
);

-- Rebuild INSERT policy using security definer helpers
drop policy if exists "chat_messages_insert_participants" on public.chat_messages;
create policy "chat_messages_insert_participants"
on public.chat_messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and (
    public.chat_is_admin()
    or public.chat_owns_process(process_id)
  )
);
