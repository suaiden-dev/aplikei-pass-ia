-- Fix notifications RLS to allow admins to mark any admin-targeted notification as read
-- Even if the user_id belongs to the client

-- Drop the old overly restrictive policy
DROP POLICY IF EXISTS "owner_can_update_read" ON public.notifications;

-- New policy for Owners (Clients)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'notifications'
      AND policyname = 'clients_can_update_own_notifications'
  ) THEN
    CREATE POLICY "clients_can_update_own_notifications" ON public.notifications
      FOR UPDATE USING (
        target_role = 'client' AND user_id = auth.uid()
      )
      WITH CHECK (
        target_role = 'client' AND user_id = auth.uid()
      );
  END IF;
END $$;

-- New policy for Admins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'notifications'
      AND policyname = 'admins_can_update_admin_notifications'
  ) THEN
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
  END IF;
END $$;

-- Ensure Realtime is enabled for notifications (this is the SQL version of the dashboard toggle)
-- Note: This is usually done via Dashboard, but adding here as a best practice for migrations
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
-- Adding to publication if exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
    AND NOT EXISTS (
      SELECT 1
      FROM pg_publication p
      JOIN pg_publication_rel pr ON pr.prpubid = p.oid
      JOIN pg_class c ON c.oid = pr.prrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE p.pubname = 'supabase_realtime'
        AND n.nspname = 'public'
        AND c.relname = 'notifications'
    ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;
