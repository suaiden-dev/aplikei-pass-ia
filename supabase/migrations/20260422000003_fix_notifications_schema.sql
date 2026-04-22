-- Add missing `type` column (was in migration but never applied to this DB)
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'system';

-- Make message nullable (code inserts null when no body is provided)
ALTER TABLE public.notifications
  ALTER COLUMN message DROP NOT NULL;
