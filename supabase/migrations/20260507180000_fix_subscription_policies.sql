-- Fix RLS policies for subscription system
-- The previous policies used auth.jwt()->>'role' which might not be correctly populated 
-- or follows a different path than expected (app_metadata).
-- Using the existing public.current_user_role() function is more robust.

-- Drop old policies
drop policy if exists "Master full access subscription_plans" on public.subscription_plans;
drop policy if exists "Master full access office_subscriptions" on public.office_subscriptions;
drop policy if exists "Master full access billing_cycles" on public.billing_cycles;
drop policy if exists "Master full access billing_invoices" on public.billing_invoices;

-- Re-create with robust role check
create policy "Master full access subscription_plans" on public.subscription_plans 
    for all to authenticated 
    using (public.current_user_role() = 'master')
    with check (public.current_user_role() = 'master');

create policy "Master full access office_subscriptions" on public.office_subscriptions 
    for all to authenticated 
    using (public.current_user_role() = 'master')
    with check (public.current_user_role() = 'master');

create policy "Master full access billing_cycles" on public.billing_cycles 
    for all to authenticated 
    using (public.current_user_role() = 'master')
    with check (public.current_user_role() = 'master');

create policy "Master full access billing_invoices" on public.billing_invoices 
    for all to authenticated 
    using (public.current_user_role() = 'master')
    with check (public.current_user_role() = 'master');
