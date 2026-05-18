alter table public.office_withdrawals
  drop constraint if exists office_withdrawals_status_check;

-- Normalize old statuses to the new workflow
update public.office_withdrawals
set status = case
  when lower(status) = 'completed' then 'approved'
  when lower(status) = 'cancelled' then 'rejected'
  else lower(status)
end;

-- Replace old check constraint
alter table public.office_withdrawals
  add constraint office_withdrawals_status_check
  check (status in ('pending', 'approved', 'rejected'));
