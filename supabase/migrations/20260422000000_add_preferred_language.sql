ALTER TABLE public.user_accounts
  ADD COLUMN IF NOT EXISTS preferred_language TEXT
  NOT NULL DEFAULT 'en'
  CHECK (preferred_language IN ('en', 'pt', 'es'));
