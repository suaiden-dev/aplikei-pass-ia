-- Allow staff reviewers (master/manager/admin_lawyer) to see and review all office withdrawals

-- Remove old policies if present
DROP POLICY IF EXISTS "Offices can view their own withdrawals" ON public.office_withdrawals;
DROP POLICY IF EXISTS "Offices can create their own withdrawals" ON public.office_withdrawals;
DROP POLICY IF EXISTS "office_withdrawals_select_own" ON public.office_withdrawals;
DROP POLICY IF EXISTS "office_withdrawals_insert_own" ON public.office_withdrawals;
DROP POLICY IF EXISTS "office_withdrawals_staff_select_all" ON public.office_withdrawals;
DROP POLICY IF EXISTS "office_withdrawals_staff_update_review" ON public.office_withdrawals;

-- Office owners/staff: can see only own office withdrawals
CREATE POLICY "office_withdrawals_select_own"
ON public.office_withdrawals
FOR SELECT
TO authenticated
USING (
  office_id IN (
    SELECT ua.office_id
    FROM public.user_accounts ua
    WHERE ua.id = auth.uid()
  )
);

-- Office owners/staff: can create withdrawals for own office only
CREATE POLICY "office_withdrawals_insert_own"
ON public.office_withdrawals
FOR INSERT
TO authenticated
WITH CHECK (
  office_id IN (
    SELECT ua.office_id
    FROM public.user_accounts ua
    WHERE ua.id = auth.uid()
  )
);

-- Staff reviewers: can view all withdrawals
CREATE POLICY "office_withdrawals_staff_select_all"
ON public.office_withdrawals
FOR SELECT
TO authenticated
USING (
  COALESCE(public.current_user_role()::text, '') IN ('master', 'manager', 'admin_lawyer')
);

-- Staff reviewers: can review withdrawals (approve/reject)
CREATE POLICY "office_withdrawals_staff_update_review"
ON public.office_withdrawals
FOR UPDATE
TO authenticated
USING (
  COALESCE(public.current_user_role()::text, '') IN ('master', 'manager', 'admin_lawyer')
)
WITH CHECK (
  COALESCE(public.current_user_role()::text, '') IN ('master', 'manager', 'admin_lawyer')
);
