alter table public.subscription_plans
  drop constraint if exists subscription_plans_available_after_days_check;

alter table public.subscription_plans
  rename column available_after_days to available_after_minutes;

alter table public.subscription_plans
  alter column available_after_minutes set default 20160; -- 14 days in minutes

update public.subscription_plans
set available_after_minutes = case
  when available_after_minutes is null then 20160
  else available_after_minutes * 1440
end;

alter table public.subscription_plans
  alter column available_after_minutes set not null;

alter table public.subscription_plans
  add constraint subscription_plans_available_after_minutes_check
  check (available_after_minutes between 1 and 20160);

comment on column public.subscription_plans.available_after_minutes
  is 'Minutos para o valor ficar disponível para saque (1 a 20160).';
