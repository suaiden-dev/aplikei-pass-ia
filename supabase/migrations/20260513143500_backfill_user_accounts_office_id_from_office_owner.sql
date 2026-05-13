-- Backfill office_id directly on public.user_accounts (table)
-- This ensures useAuth receives officeId without relying on any view.

DO $$
BEGIN
  UPDATE public.user_accounts ua
  SET office_id = o.id,
      updated_at = now()
  FROM public.offices o
  WHERE o.owner_id = ua.id
    AND ua.office_id IS NULL
    AND ua.role IN ('master', 'admin_lawyer', 'manager', 'seller');
END $$;
