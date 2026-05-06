-- Link each main service to its dependent service
alter table public.services
  add column if not exists dependent_service_id uuid references public.services(id) on delete set null;

-- Populate the links
update public.services s
set dependent_service_id = dep.id
from public.services dep
where (s.slug, dep.slug) in (
  ('visa-b1b2', 'dependent-b1b2'),
  ('visa-f1',   'dependent-f1'),
  ('visa-cos',  'dependent-cos'),
  ('visa-eos',  'dependent-eos')
);
