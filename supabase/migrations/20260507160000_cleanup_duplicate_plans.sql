-- 1. Remove duplicate plans keeping only the oldest one per name
DELETE FROM public.subscription_plans
WHERE id IN (
    SELECT id
    FROM (
        SELECT id, row_number() OVER (PARTITION BY name ORDER BY created_at ASC) as row_num
        FROM public.subscription_plans
    ) t
    WHERE t.row_num > 1
);

-- 2. Add unique constraint to prevent future duplicates
ALTER TABLE public.subscription_plans ADD CONSTRAINT unique_plan_name UNIQUE (name);
