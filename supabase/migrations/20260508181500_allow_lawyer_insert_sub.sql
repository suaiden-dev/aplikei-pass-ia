
-- Enable INSERT for admin_lawyer on office_subscriptions
CREATE POLICY "Admin lawyer insert own office subscription" ON public.office_subscriptions
    FOR INSERT TO authenticated
    WITH CHECK (
        office_id IN (
            SELECT office_id FROM public.user_accounts WHERE id = auth.uid()
        ) AND
        public.current_user_role() = 'admin_lawyer'
    );
