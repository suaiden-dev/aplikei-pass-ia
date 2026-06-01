-- Master users need payout details when reviewing office withdrawal requests.
DROP POLICY IF EXISTS "office_payment_settings_master_select_all" ON public.office_payment_settings;

CREATE POLICY "office_payment_settings_master_select_all"
ON public.office_payment_settings
FOR SELECT
TO authenticated
USING (
  COALESCE(public.current_user_role()::text, '') = 'master'
);
