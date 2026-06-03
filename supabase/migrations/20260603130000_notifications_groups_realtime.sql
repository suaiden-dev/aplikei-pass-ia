-- Enable realtime delivery for notifications_groups.
-- REPLICA IDENTITY FULL ensures the complete row is available in the WAL
-- so the realtime server can evaluate row-level filters.
ALTER TABLE public.notifications_groups REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
    AND NOT EXISTS (
      SELECT 1
      FROM pg_publication_rel pr
      JOIN pg_class c ON c.oid = pr.prrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      JOIN pg_publication p ON p.oid = pr.prpubid
      WHERE p.pubname = 'supabase_realtime'
        AND n.nspname = 'public'
        AND c.relname = 'notifications_groups'
    ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications_groups;
  END IF;
END $$;
