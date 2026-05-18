-- Add service_id to zelle_payments for consistency
alter table public.zelle_payments
  add column if not exists service_id uuid references public.services(id);

-- Backfill service_id from service_slug if possible
update public.zelle_payments zp
set service_id = s.id
from public.services s
where s.slug = zp.service_slug
  and zp.service_id is null;
