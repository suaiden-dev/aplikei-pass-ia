alter table public.chat_messages
  add column if not exists office_id uuid references public.offices(id) on delete set null;

create index if not exists chat_messages_office_id_idx
  on public.chat_messages (office_id);

create or replace function public.chat_messages_fill_office_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_office_id uuid;
begin
  if new.office_id is not null then
    return new;
  end if;

  select us.office_id
    into v_office_id
  from public.user_services us
  where us.id = new.process_id
    and us.office_id is not null
  limit 1;

  if v_office_id is null then
    select us.office_id
      into v_office_id
    from public.user_services us
    where coalesce(us.step_data->>'parent_process_id', '') = new.process_id::text
      and us.office_id is not null
    order by us.created_at desc
    limit 1;
  end if;

  if v_office_id is null then
    select ua.office_id
      into v_office_id
    from public.user_accounts ua
    where ua.id = new.sender_id
      and ua.office_id is not null
    limit 1;
  end if;

  new.office_id := v_office_id;
  return new;
end;
$$;

drop trigger if exists trg_chat_messages_fill_office_id on public.chat_messages;
create trigger trg_chat_messages_fill_office_id
before insert on public.chat_messages
for each row
execute function public.chat_messages_fill_office_id();

update public.chat_messages cm
set office_id = us.office_id
from public.user_services us
where cm.office_id is null
  and us.id = cm.process_id
  and us.office_id is not null;

with parent_matches as (
  select
    cm.id as chat_id,
    us.office_id,
    row_number() over (
      partition by cm.id
      order by us.created_at desc
    ) as rn
  from public.chat_messages cm
  join public.user_services us
    on coalesce(us.step_data->>'parent_process_id', '') = cm.process_id::text
  where cm.office_id is null
    and us.office_id is not null
)
update public.chat_messages cm
set office_id = pm.office_id
from parent_matches pm
where cm.id = pm.chat_id
  and pm.rn = 1
  and cm.office_id is null;

update public.chat_messages cm
set office_id = ua.office_id
from public.user_accounts ua
where cm.office_id is null
  and ua.id = cm.sender_id
  and ua.office_id is not null;
