-- Fix notifications RLS to allow admins to mark any admin-targeted notification as read
-- Even if the user_id belongs to the client

-- Drop the old overly restrictive policy
DROP POLICY IF EXISTS "owner_can_update_read" ON public.notifications;

-- New policy for Owners (Clients)
CREATE POLICY "clients_can_update_own_notifications" ON public.notifications
  FOR UPDATE USING (
    target_role = 'client' AND user_id = auth.uid()
  )
  WITH CHECK (
    target_role = 'client' AND user_id = auth.uid()
  );

-- New policy for Admins
CREATE POLICY "admins_can_update_admin_notifications" ON public.notifications
  FOR UPDATE USING (
    target_role = 'admin' AND
    EXISTS (
      SELECT 1 FROM public.user_accounts
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    target_role = 'admin' AND
    EXISTS (
      SELECT 1 FROM public.user_accounts
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Ensure Realtime is enabled for notifications (this is the SQL version of the dashboard toggle)
-- Note: This is usually done via Dashboard, but adding here as a best practice for migrations
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
-- Adding to publication if exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;
