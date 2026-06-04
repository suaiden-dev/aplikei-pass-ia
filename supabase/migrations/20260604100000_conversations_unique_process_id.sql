-- Enforce one conversation per process — deduplication moves to the DB constraint,
-- removing the need for application-level "ensure" checks before every insert.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'conversations_process_id_unique'
      and conrelid = 'public.conversations'::regclass
  ) then
    alter table public.conversations
      add constraint conversations_process_id_unique unique (process_id);
  end if;
end $$;
