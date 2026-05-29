alter table public.office_withdrawals
  add column if not exists reviewed_by_id uuid,
  add column if not exists reviewed_by_name text,
  add column if not exists reviewed_at timestamptz;
