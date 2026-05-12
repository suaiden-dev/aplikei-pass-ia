-- ─── Subscription System Schema ──────────────────────────────────────────────

-- 1. Enum for Plan Types
create type public.subscription_plan_type as enum ('FIXED', 'PERCENTAGE', 'HYBRID');

-- 2. Enum for Subscription Status
create type public.subscription_status as enum ('active', 'past_due', 'canceled', 'trialing');

-- 3. Enum for Billing Cycle Status
create type public.billing_cycle_status as enum ('open', 'calculating', 'billed', 'paid');

-- 4. Subscription Plans Table
create table if not exists public.subscription_plans (
    id                uuid            primary key default gen_random_uuid(),
    name              text            not null,
    description       text,
    type              public.subscription_plan_type not null,
    
    -- Pricing components
    fixed_fee         numeric(12,2)   not null default 0,
    percentage_fee    numeric(5,2)    not null default 0, -- e.g. 5.00 for 5%
    
    -- Specifics for PERCENTAGE type
    min_monthly_fee   numeric(12,2)   default null,
    max_monthly_fee   numeric(12,2)   default null, -- CAP
    
    is_active         boolean         not null default true,
    created_at        timestamptz     not null default now(),
    updated_at        timestamptz     not null default now()
);

-- 5. Office Subscriptions (Active Plan for each Office)
create table if not exists public.office_subscriptions (
    id                uuid            primary key default gen_random_uuid(),
    office_id         uuid            not null references public.offices(id) on delete cascade,
    plan_id           uuid            not null references public.subscription_plans(id),
    
    status            public.subscription_status not null default 'active',
    current_period_start timestamptz  not null default now(),
    current_period_end   timestamptz  not null,
    
    cancel_at_period_end boolean      not null default false,
    
    metadata          jsonb           default '{}'::jsonb,
    created_at        timestamptz     not null default now(),
    updated_at        timestamptz     not null default now(),
    
    unique(office_id) -- One active subscription per office
);

-- 6. Billing Cycles (Tracks revenue per month for calculation)
create table if not exists public.billing_cycles (
    id                uuid            primary key default gen_random_uuid(),
    office_id         uuid            not null references public.offices(id) on delete cascade,
    subscription_id   uuid            not null references public.office_subscriptions(id),
    
    start_date        timestamptz     not null,
    end_date          timestamptz     not null,
    
    status            public.billing_cycle_status not null default 'open',
    
    -- Snapshot of revenue at the end of cycle
    total_revenue     numeric(12,2)   not null default 0,
    
    -- Calculated amount to bill
    calculated_amount numeric(12,2)   not null default 0,
    
    created_at        timestamptz     not null default now(),
    updated_at        timestamptz     not null default now()
);

-- 7. Billing Invoices
create table if not exists public.billing_invoices (
    id                uuid            primary key default gen_random_uuid(),
    cycle_id          uuid            not null references public.billing_cycles(id),
    office_id         uuid            not null references public.offices(id),
    
    amount            numeric(12,2)   not null,
    currency          text            not null default 'BRL',
    status            text            not null default 'pending', -- pending, paid, void
    
    due_date          timestamptz     not null,
    paid_at           timestamptz,
    
    stripe_invoice_id text,
    payment_url       text,
    
    created_at        timestamptz     not null default now()
);

-- ─── Functions ──────────────────────────────────────────────────────────────

-- Function to calculate billing for a cycle based on plan type
create or replace function public.calculate_cycle_billing(p_cycle_id uuid)
returns numeric as $$
declare
    v_office_id uuid;
    v_plan_id uuid;
    v_start_date timestamptz;
    v_end_date timestamptz;
    v_revenue numeric;
    v_plan_type public.subscription_plan_type;
    v_fixed numeric;
    v_percent numeric;
    v_min numeric;
    v_max numeric;
    v_total numeric := 0;
begin
    -- 1. Get cycle details
    select office_id, start_date, end_date 
    into v_office_id, v_start_date, v_end_date
    from public.billing_cycles where id = p_cycle_id;

    -- 2. Get active plan at that time
    select p.type, p.fixed_fee, p.percentage_fee, p.min_monthly_fee, p.max_monthly_fee
    into v_plan_type, v_fixed, v_percent, v_min, v_max
    from public.office_subscriptions s
    join public.subscription_plans p on p.id = s.plan_id
    where s.office_id = v_office_id;

    -- 3. Calculate total revenue for the period (Approved/Paid orders only)
    select coalesce(sum(total_price_brl), 0)
    into v_revenue
    from public.orders
    where office_id = v_office_id
      and payment_status = 'paid'
      and created_at >= v_start_date
      and created_at < v_end_date;

    -- 4. Apply logic based on type
    if v_plan_type = 'FIXED' then
        v_total := v_fixed;
    
    elsif v_plan_type = 'PERCENTAGE' then
        v_total := (v_revenue * v_percent / 100);
        
        -- Apply min fee
        if v_min is not null and v_total < v_min then
            v_total := v_min;
        end if;
        
        -- Apply max fee (CAP)
        if v_max is not null and v_total > v_max then
            v_total := v_max;
        end if;
        
    elsif v_plan_type = 'HYBRID' then
        v_total := v_fixed + (v_revenue * v_percent / 100);
    end if;

    -- 5. Update cycle
    update public.billing_cycles
    set total_revenue = v_revenue,
        calculated_amount = v_total,
        status = 'calculating',
        updated_at = now()
    where id = p_cycle_id;

    return v_total;
end;
$$ language plpgsql security definer;

-- ─── RLS Policies ──────────────────────────────────────────────────────────

alter table public.subscription_plans enable row level security;
alter table public.office_subscriptions enable row level security;
alter table public.billing_cycles enable row level security;
alter table public.billing_invoices enable row level security;

-- Master can do everything
create policy "Master full access subscription_plans" on public.subscription_plans for all to authenticated using (auth.jwt()->>'role' = 'master');
create policy "Master full access office_subscriptions" on public.office_subscriptions for all to authenticated using (auth.jwt()->>'role' = 'master');
create policy "Master full access billing_cycles" on public.billing_cycles for all to authenticated using (auth.jwt()->>'role' = 'master');
create policy "Master full access billing_invoices" on public.billing_invoices for all to authenticated using (auth.jwt()->>'role' = 'master');

-- Admin Lawyer can view their own subscription/billing
create policy "Lawyer view own subscription" on public.office_subscriptions for select to authenticated 
using (office_id in (select office_id from public.user_accounts where id = auth.uid()));

create policy "Lawyer view own cycles" on public.billing_cycles for select to authenticated 
using (office_id in (select office_id from public.user_accounts where id = auth.uid()));

create policy "Lawyer view own invoices" on public.billing_invoices for select to authenticated 
using (office_id in (select office_id from public.user_accounts where id = auth.uid()));
