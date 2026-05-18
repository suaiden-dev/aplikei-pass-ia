-- ─── View for Master to monitor Office Stats ───────────────────────────────────

create or replace view public.v_master_office_stats as
with office_counts as (
    select 
        office_id, 
        count(*) as process_count
    from public.user_services
    group by office_id
),
office_revenue as (
    select 
        office_id, 
        sum(total_price_usd) as total_revenue,
        count(*) filter (where payment_status = 'pending') as pending_requests,
        sum(total_price_usd) filter (where payment_status = 'pending') as pending_amount
    from public.orders
    where payment_status in ('paid', 'approved', 'complete', 'completed', 'succeeded', 'pending')
    group by office_id
)
select 
    o.id as office_id,
    o.name as office_name,
    o.owner_id,
    u.full_name as responsible_name,
    coalesce(oc.process_count, 0) as process_count,
    coalesce(orv.total_revenue, 0) as total_revenue,
    coalesce(orv.pending_requests, 0) as pending_requests,
    coalesce(orv.pending_amount, 0) as pending_amount,
    -- For now, "Available Balance" is mocked as 0 or could be calculated if we had a payouts table
    0 as available_balance,
    p.name as active_plan_name,
    s.status as subscription_status,
    s.id as subscription_id,
    p.id as plan_id
from public.offices o
left join public.profiles u on u.id = o.owner_id
left join office_counts oc on oc.office_id = o.id
left join office_revenue orv on orv.office_id = o.id
left join public.office_subscriptions s on s.office_id = o.id
left join public.subscription_plans p on p.id = s.plan_id;

grant select on public.v_master_office_stats to authenticated;
