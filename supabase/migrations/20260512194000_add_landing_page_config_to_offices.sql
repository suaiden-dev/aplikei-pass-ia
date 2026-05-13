alter table public.offices
add column if not exists landing_page_config jsonb not null default '{}'::jsonb;

