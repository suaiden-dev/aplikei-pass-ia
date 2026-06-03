ALTER TABLE public.notifications_messages
  DROP COLUMN IF EXISTS title,
  DROP COLUMN IF EXISTS body;
