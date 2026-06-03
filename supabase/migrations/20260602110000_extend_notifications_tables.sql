-- Extend notifications_messages with content/routing columns
ALTER TABLE notifications_messages
  ADD COLUMN title      TEXT,
  ADD COLUMN body       TEXT,
  ADD COLUMN link       TEXT,
  ADD COLUMN metadata   JSONB        NOT NULL DEFAULT '{}',
  ADD COLUMN send_email BOOLEAN      NOT NULL DEFAULT FALSE;

-- Add created_at to notifications_groups (used for ordering in frontend queries)
ALTER TABLE notifications_groups
  ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX idx_notifications_groups_created_at
  ON notifications_groups(created_at DESC);

CREATE INDEX idx_notifications_groups_user_viewed
  ON notifications_groups(user_id, viewed);

-- ---------------------------------------------------------------------------
-- Email trigger on notifications_groups
-- Fires on INSERT; edge function checks whether the parent message requires email.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_groups_send_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM net.http_post(
    url     := 'https://nkhblkilekfpqhyuhrrj.supabase.co/functions/v1/send-notification-email',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5raGJsa2lsZWtmcHFoeXVocnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MjA4NTMsImV4cCI6MjA4NzA5Njg1M30.s2jlTWc0u4xMRiIjG4GsFMulKPGfFoX232vq_4ol0Wc'
    ),
    body    := jsonb_build_object(
      'type',   TG_OP,
      'table',  'notifications_groups',
      'record', row_to_json(NEW)
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_groups_send_notification_email
  AFTER INSERT ON public.notifications_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_groups_send_email();
