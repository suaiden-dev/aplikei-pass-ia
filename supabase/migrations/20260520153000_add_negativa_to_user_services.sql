alter table public.user_services
  add column if not exists negativa jsonb;

-- Down migration
-- alter table public.user_services
--   drop column if exists negativa;
