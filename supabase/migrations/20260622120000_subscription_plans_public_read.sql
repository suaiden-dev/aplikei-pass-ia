-- Allow the public pricing pages to read active subscription plans.
-- Keep writes restricted to the master role.

drop policy if exists "Public read active subscription_plans" on public.subscription_plans;

create policy "Public read active subscription_plans"
on public.subscription_plans
for select
to public
using (is_active = true);
