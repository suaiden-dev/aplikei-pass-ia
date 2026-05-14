-- Migration: Add office-based finance analytics
-- Created At: 2026-05-13 22:40:00

-- Create or replace view for transactions that respect office_id
create or replace view public.v_finance_analytics_transactions as
select
  o.id,
  o.created_at,
  o.client_name,
  o.client_email,
  o.product_slug,
  o.payment_method,
  o.payment_status,
  o.total_price_usd,
  o.office_id,
  ofc.name as office_name
from public.orders o
left join public.offices ofc on ofc.id = o.office_id;

grant select on public.v_finance_analytics_transactions to authenticated;

-- Create a robust analytics function
create or replace function public.get_finance_analytics(p_months int default 6, p_office_id uuid default null)
returns table (
  month text,
  revenue_usd numeric,
  profit_usd numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_months int := greatest(1, least(coalesce(p_months, 6), 24));
  v_commission_rate numeric := 0.07;
  v_role public.user_account_role;
  v_user_office_id uuid;
begin
  v_role := public.current_user_role();
  
  -- Get user office_id if not master
  if v_role::text <> 'master' then
    select office_id into v_user_office_id
    from public.user_accounts
    where id = auth.uid();
  end if;

  -- Validation and filter determination
  if v_role::text = 'master' then
    -- Master can see anything, optionally filtered by p_office_id
    v_user_office_id := p_office_id;
  elsif v_role::text = 'admin_lawyer' then
    -- Admin Lawyer can ONLY see their office.
    -- If p_office_id is provided, it MUST match their own office.
    if v_user_office_id is null then
      raise exception 'forbidden: office context required' using errcode = '42501';
    end if;
    if p_office_id is not null and p_office_id <> v_user_office_id then
      raise exception 'forbidden: cannot access other office analytics' using errcode = '42501';
    end if;
  else
    raise exception 'forbidden: master or admin_lawyer role required' using errcode = '42501';
  end if;

  return query
  with month_series as (
    select
      date_trunc('month', now()) - (gs.n * interval '1 month') as month_start
    from generate_series(v_months - 1, 0, -1) as gs(n)
  ),
  monthly_revenue as (
    select
      date_trunc('month', o.created_at) as month_start,
      coalesce(sum(o.total_price_usd), 0)::numeric as revenue_usd
    from public.orders o
    where o.payment_status in ('paid', 'approved', 'complete', 'completed', 'succeeded')
      and o.created_at >= date_trunc('month', now()) - ((v_months - 1) * interval '1 month')
      and o.created_at < date_trunc('month', now()) + interval '1 month'
      and (v_user_office_id is null or o.office_id = v_user_office_id)
    group by 1
  )
  select
    to_char(ms.month_start, 'YYYY-MM') as month,
    round(coalesce(mr.revenue_usd, 0), 2) as revenue_usd,
    round(coalesce(mr.revenue_usd, 0) * v_commission_rate, 2) as profit_usd
  from month_series ms
  left join monthly_revenue mr on mr.month_start = ms.month_start
  order by ms.month_start;
end;
$$;

grant execute on function public.get_finance_analytics(int, uuid) to authenticated;
