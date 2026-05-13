-- Finance analytics: monthly revenue and profit series for master dashboard

create or replace function public.get_finance_analytics_master(p_months int default 6)
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
begin
  v_role := public.current_user_role();

  if coalesce(v_role::text, '') <> 'master' then
    raise exception 'forbidden: master role required'
      using errcode = '42501';
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

grant execute on function public.get_finance_analytics_master(int) to authenticated;
