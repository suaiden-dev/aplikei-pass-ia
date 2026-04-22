-- Helper functions with SECURITY DEFINER to bypass RLS on referenced tables
-- This ensures chat_messages policies can read user_accounts and user_services
-- even when those tables have restrictive RLS policies.

create or replace function public.chat_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_accounts
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.chat_owns_process(p_process_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_services
    where id = p_process_id and user_id = auth.uid()
  );
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
