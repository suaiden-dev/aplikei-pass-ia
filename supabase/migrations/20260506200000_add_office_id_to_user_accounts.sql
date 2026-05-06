-- Link staff users (managers, sellers, admin_lawyers) to an office
alter table public.user_accounts
  add column if not exists office_id uuid references public.offices(id) on delete set null;

-- Backfill admin_lawyers who already own an office
update public.user_accounts ua
set office_id = o.id
from public.offices o
where o.owner_id = ua.id
  and ua.office_id is null;

-- Index for fast lookups
create index if not exists idx_user_accounts_office_id on public.user_accounts(office_id);
