-- Add dedicated logo_url column to offices table
alter table public.offices
add column if not exists logo_url text;

-- Backfill: migrate existing logos stored in landing_page_config JSON into the new column
update public.offices
set logo_url = landing_page_config->>'logoUrl'
where landing_page_config->>'logoUrl' is not null
  and logo_url is null;
