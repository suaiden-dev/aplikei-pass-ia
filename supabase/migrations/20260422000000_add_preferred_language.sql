DO $$
BEGIN
  IF to_regclass('public.user_accounts') IS NOT NULL THEN
    ALTER TABLE public.user_accounts
      ADD COLUMN IF NOT EXISTS preferred_language TEXT
      NOT NULL DEFAULT 'en'
      CHECK (preferred_language IN ('en', 'pt', 'es'));
  ELSIF to_regclass('public.users_accounts') IS NOT NULL THEN
    ALTER TABLE public.users_accounts
      ADD COLUMN IF NOT EXISTS preferred_language TEXT
      NOT NULL DEFAULT 'en'
      CHECK (preferred_language IN ('en', 'pt', 'es'));
  END IF;
END $$;
