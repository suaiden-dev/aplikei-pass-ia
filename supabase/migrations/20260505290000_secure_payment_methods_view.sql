-- Secure admin_lawyer_payment_methods: only expose non-sensitive fields to public
-- We use a view or just refine the RLS policy if we can't easily do column-level RLS
-- However, Supabase doesn't support column-level RLS directly.
-- The best approach is to have a public view.

drop view if exists public.view_public_office_payment_methods;
create view public.view_public_office_payment_methods as
select
  user_id,
  provider,
  is_active,
  display_name,
  case 
    when provider = 'zelle' then config
    when provider = 'aplikei' then '{}'::jsonb
    else '{}'::jsonb -- Stripe and Parcelow configs are sensitive (api keys, etc)
  end as config
from public.admin_lawyer_payment_methods;

-- Allow public read of the view
grant select on public.view_public_office_payment_methods to anon, authenticated;

-- Update RLS on the table to be more restrictive
drop policy if exists "admin_lawyer_payment_methods_public_read" on public.admin_lawyer_payment_methods;
create policy "admin_lawyer_payment_methods_public_read" on public.admin_lawyer_payment_methods
  for select using (auth.uid() = user_id or public.is_admin());
