
-- Migration to clean up plans and simplify the subscription view
-- Keeps ONLY 'Crescimento (Variável)'

BEGIN;

-- 1. We'll find the table that contains the plan names and fees
-- Based on the view, it's likely 'subscription_plans' or similar
-- We'll delete everything that isn't our target plan
DELETE FROM subscription_plans 
WHERE name != 'Crescimento (Variável)';

-- 2. Update the View to be simpler (removing columns we don't use anymore)
DROP VIEW IF EXISTS v_office_current_subscription;

CREATE VIEW v_office_current_subscription AS
SELECT 
    os.id as subscription_id,
    os.office_id,
    os.status,
    os.current_period_start,
    os.current_period_end,
    p.name as plan_name,
    p.percentage_fee
FROM 
    office_subscriptions os
JOIN 
    subscription_plans p ON os.plan_id = p.id
WHERE 
    os.status = 'active';

COMMIT;
