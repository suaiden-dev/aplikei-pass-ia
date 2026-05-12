-- ─── Subscription Seeds and Automation ───────────────────────────────────────

-- 1. Insert Initial Plans
insert into public.subscription_plans (name, description, type, fixed_fee, percentage_fee, min_monthly_fee, max_monthly_fee)
values 
('Essencial (Fixo)', 'Ideal para quem busca previsibilidade de custos.', 'FIXED', 497.00, 0, null, null),
('Crescimento (Variável)', 'Pague apenas uma porcentagem do que faturar.', 'PERCENTAGE', 0, 5.00, 197.00, 2997.00),
('Escritório Pro (Híbrido)', 'O melhor custo-benefício para escritórios em escala.', 'HYBRID', 297.00, 2.00, null, null)
on conflict do nothing;

-- 2. Automation: Create Billing Cycle on New Subscription
create or replace function public.on_subscription_created()
returns trigger as $$
begin
    insert into public.billing_cycles (
        office_id, 
        subscription_id, 
        start_date, 
        end_date, 
        status
    )
    values (
        new.office_id,
        new.id,
        new.current_period_start,
        new.current_period_end,
        'open'
    );
    return new;
end;
$$ language plpgsql security definer;

create trigger trg_on_subscription_created
after insert on public.office_subscriptions
for each row execute function public.on_subscription_created();

-- 3. Automation: Update office_id on subscription update
create or replace function public.update_subscription_period()
returns trigger as $$
begin
    -- If period ended, we could trigger the calculation here
    if new.current_period_end > old.current_period_end then
        -- Close old cycle
        update public.billing_cycles
        set status = 'calculating'
        where subscription_id = new.id and status = 'open';
        
        -- Create new cycle
        insert into public.billing_cycles (
            office_id, 
            subscription_id, 
            start_date, 
            end_date, 
            status
        )
        values (
            new.office_id,
            new.id,
            new.current_period_start,
            new.current_period_end,
            'open'
        );
    end if;
    return new;
end;
$$ language plpgsql security definer;

create trigger trg_update_subscription_period
after update on public.office_subscriptions
for each row execute function public.update_subscription_period();

-- 4. View for Lawyer to see current plan details easily
create or replace view public.v_office_current_subscription as
select 
    s.id as subscription_id,
    s.office_id,
    s.status,
    s.current_period_start,
    s.current_period_end,
    p.name as plan_name,
    p.type as plan_type,
    p.fixed_fee,
    p.percentage_fee,
    p.min_monthly_fee,
    p.max_monthly_fee
from public.office_subscriptions s
join public.subscription_plans p on p.id = s.plan_id;

grant select on public.v_office_current_subscription to authenticated;
