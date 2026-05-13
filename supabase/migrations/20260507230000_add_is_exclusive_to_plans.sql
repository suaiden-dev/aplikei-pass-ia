ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS is_exclusive boolean DEFAULT false;
