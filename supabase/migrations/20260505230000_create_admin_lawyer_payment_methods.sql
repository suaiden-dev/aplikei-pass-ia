begin;

create table if not exists public.admin_lawyer_payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_accounts (id) on delete cascade,
  provider text not null,
  is_active boolean not null default false,
  display_name text,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, provider)
);

-- Enable RLS
alter table public.admin_lawyer_payment_methods enable row level security;

-- Policies
create policy "admin_lawyer_payment_methods_select_own"
  on public.admin_lawyer_payment_methods
  for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

create policy "admin_lawyer_payment_methods_insert_own"
  on public.admin_lawyer_payment_methods
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "admin_lawyer_payment_methods_update_own"
  on public.admin_lawyer_payment_methods
  for update
  to authenticated
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- Trigger for updated_at
drop trigger if exists set_admin_lawyer_payment_methods_updated_at on public.admin_lawyer_payment_methods;
create trigger set_admin_lawyer_payment_methods_updated_at
  before update on public.admin_lawyer_payment_methods
  for each row
  execute function public.set_updated_at();

commit;
