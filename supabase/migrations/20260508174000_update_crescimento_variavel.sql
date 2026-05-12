
-- Ensure Crescimento (Variável) has the correct values
UPDATE public.subscription_plans
SET 
    type = 'PERCENTAGE',
    fixed_fee = 0,
    percentage_fee = 5.00,
    min_monthly_fee = 197.00,
    max_monthly_fee = 2997.00
WHERE name = 'Crescimento (Variável)';

-- If the user's office was on a hybrid plan but wants to be on Crescimento (Variável)
-- we'll just make sure all active subscriptions are pointing to the correct plan if needed
-- But we'll stick to updating the plan definition first.
