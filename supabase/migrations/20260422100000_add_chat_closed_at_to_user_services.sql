alter table public.user_services
  add column if not exists chat_closed_at timestamptz default null;

-- Only admins can close/reopen chat
drop policy if exists "user_services_chat_close_admin" on public.user_services;
create policy "user_services_chat_close_admin"
on public.user_services
for update
to authenticated
using (
  exists (
    select 1 from public.user_accounts ua
    where ua.id = auth.uid() and ua.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.user_accounts ua
    where ua.id = auth.uid() and ua.role = 'admin'
  )
);
