create unique index if not exists offices_name_normalized_key
on public.offices (lower(btrim(name)));
