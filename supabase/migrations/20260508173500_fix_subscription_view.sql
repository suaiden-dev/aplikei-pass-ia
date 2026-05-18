
-- Update v_office_current_subscription to include all necessary fields
DROP VIEW IF EXISTS v_office_current_subscription;

CREATE VIEW v_office_current_subscription AS
SELECT 
    os.id as subscription_id,
    os.office_id,
    os.status,
    os.current_period_start,
    os.current_period_end,
    p.name as plan_name,
    p.type as plan_type,
    p.fixed_fee,
    p.percentage_fee
FROM 
    office_subscriptions os
JOIN 
    subscription_plans p ON os.plan_id = p.id
WHERE 
    os.status = 'active';

-- Ensure permissions
GRANT SELECT ON v_office_current_subscription TO authenticated;
