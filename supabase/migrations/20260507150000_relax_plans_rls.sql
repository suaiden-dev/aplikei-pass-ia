-- Allow all authenticated users to see plan names and types
CREATE POLICY "Public view for subscription plans" ON public.subscription_plans 
FOR SELECT TO authenticated USING (true);
