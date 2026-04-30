begin;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'notification_target_role'
      and typnamespace = 'aplikei'::regnamespace
  ) then
    create type aplikei.notification_target_role as enum ('admin', 'customer');
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'notification_presentation_type'
      and typnamespace = 'aplikei'::regnamespace
  ) then
    create type aplikei.notification_presentation_type as enum ('admin_action', 'client_action', 'system');
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'notification_category'
      and typnamespace = 'aplikei'::regnamespace
  ) then
    create type aplikei.notification_category as enum ('process', 'payment', 'chat', 'system');
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'notification_kind'
      and typnamespace = 'aplikei'::regnamespace
  ) then
    create type aplikei.notification_kind as enum (
      'customer_admin_message',
      'customer_step_approved',
      'customer_step_rejected_feedback',
      'customer_process_completed',
      'customer_payment_received',
      'customer_payment_failed',
      'customer_chat_message',
      'admin_customer_step_submitted',
      'admin_customer_checkout_started',
      'admin_customer_payment_proof',
      'admin_customer_message',
      'system_notice'
    );
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'notification_actor_role'
      and typnamespace = 'aplikei'::regnamespace
  ) then
    create type aplikei.notification_actor_role as enum ('system', 'customer', 'admin', 'seller', 'master');
  end if;
end
$$;

create table if not exists aplikei.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references aplikei.users_accounts (id) on delete cascade,
  actor_user_id uuid references aplikei.users_accounts (id) on delete set null,
  actor_role aplikei.notification_actor_role,
  target_role aplikei.notification_target_role not null,
  type aplikei.notification_presentation_type not null default 'system',
  kind aplikei.notification_kind not null default 'system_notice',
  category aplikei.notification_category not null default 'system',
  service_id text,
  title text not null,
  message text,
  link text,
  metadata jsonb not null default '{}'::jsonb,
  is_read boolean not null default false,
  read_at timestamptz,
  send_email boolean not null default false,
  email_sent boolean not null default false,
  email_sent_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  constraint notifications_title_check check (char_length(trim(title)) >= 2),
  constraint notifications_customer_target_user_check check (
    target_role != 'customer' or user_id is not null
  )
);

create index if not exists notifications_target_role_idx
  on aplikei.notifications (target_role);

create index if not exists notifications_user_id_idx
  on aplikei.notifications (user_id)
  where user_id is not null;

create index if not exists notifications_service_id_idx
  on aplikei.notifications (service_id)
  where service_id is not null;

create index if not exists notifications_is_read_idx
  on aplikei.notifications (is_read);

create index if not exists notifications_created_at_idx
  on aplikei.notifications (created_at desc);

drop trigger if exists set_notifications_updated_at on aplikei.notifications;
create trigger set_notifications_updated_at
before update on aplikei.notifications
for each row
execute function aplikei.set_updated_at();

alter table aplikei.notifications enable row level security;

drop policy if exists "notifications_select_own_or_admin" on aplikei.notifications;
create policy "notifications_select_own_or_admin"
on aplikei.notifications
for select
to authenticated
using (
  aplikei.is_admin()
  or (
    target_role = 'customer'
    and user_id = auth.uid()
  )
);

drop policy if exists "notifications_insert_customer_or_admin" on aplikei.notifications;
create policy "notifications_insert_customer_or_admin"
on aplikei.notifications
for insert
to authenticated
with check (
  aplikei.is_admin()
  or (
    target_role = 'admin'
    and user_id = auth.uid()
  )
);

drop policy if exists "notifications_update_own_or_admin" on aplikei.notifications;
create policy "notifications_update_own_or_admin"
on aplikei.notifications
for update
to authenticated
using (
  aplikei.is_admin()
  or (
    target_role = 'customer'
    and user_id = auth.uid()
  )
)
with check (
  aplikei.is_admin()
  or (
    target_role = 'customer'
    and user_id = auth.uid()
  )
);

drop policy if exists "notifications_delete_admin_only" on aplikei.notifications;
create policy "notifications_delete_admin_only"
on aplikei.notifications
for delete
to authenticated
using (aplikei.is_admin());

commit;
