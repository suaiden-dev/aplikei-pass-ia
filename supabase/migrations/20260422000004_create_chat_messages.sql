create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  process_id uuid not null references public.user_services(id) on delete cascade,
  sender_id uuid not null,
  sender_role text not null check (sender_role in ('admin', 'customer')),
  content text not null,
  file_url text,
  file_name text,
  file_type text,
  created_at timestamptz not null default now()
);

alter table public.chat_messages enable row level security;

create index if not exists chat_messages_process_created_idx
  on public.chat_messages (process_id, created_at asc);

drop policy if exists "chat_messages_select_participants" on public.chat_messages;
create policy "chat_messages_select_participants"
on public.chat_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.user_accounts ua
    where ua.id = auth.uid()
      and ua.role = 'admin'
  )
  or exists (
    select 1
    from public.user_services us
    where us.id = chat_messages.process_id
      and us.user_id = auth.uid()
  )
  or sender_id = auth.uid()
);

drop policy if exists "chat_messages_insert_participants" on public.chat_messages;
create policy "chat_messages_insert_participants"
on public.chat_messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and (
    exists (
      select 1
      from public.user_accounts ua
      where ua.id = auth.uid()
        and ua.role = 'admin'
    )
    or exists (
      select 1
      from public.user_services us
      where us.id = chat_messages.process_id
        and us.user_id = auth.uid()
    )
  )
);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'chat_messages'
  ) then
    alter publication supabase_realtime add table public.chat_messages;
  end if;
end $$;
