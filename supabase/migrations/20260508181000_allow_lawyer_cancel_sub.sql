
-- Allow admin_lawyer and manager to view their own office subscription
-- Allow admin_lawyer to update (cancel) their own office subscription

-- 1. Enable SELECT for staff members
CREATE POLICY "Staff view own office subscription" ON public.office_subscriptions
    FOR SELECT TO authenticated
    USING (
        office_id IN (
            SELECT office_id FROM public.user_accounts WHERE id = auth.uid()
        )
    );

-- 2. Enable UPDATE for admin_lawyer
-- This allows them to change the status to 'canceled'
CREATE POLICY "Admin lawyer update own office subscription" ON public.office_subscriptions
    FOR UPDATE TO authenticated
    USING (
        office_id IN (
            SELECT office_id FROM public.user_accounts WHERE id = auth.uid()
        ) AND 
        public.current_user_role() = 'admin_lawyer'
    )
    WITH CHECK (
        office_id IN (
            SELECT office_id FROM public.user_accounts WHERE id = auth.uid()
        ) AND
        public.current_user_role() = 'admin_lawyer'
    );

-- 3. Enable INSERT for admin_lawyer
CREATE POLICY "Admin lawyer insert own office subscription" ON public.office_subscriptions
    FOR INSERT TO authenticated
    WITH CHECK (
        office_id IN (
            SELECT office_id FROM public.user_accounts WHERE id = auth.uid()
        ) AND
        public.current_user_role() = 'admin_lawyer'
    );

-- Also fix the view permissions just in case
GRANT SELECT ON public.v_office_current_subscription TO authenticated;
