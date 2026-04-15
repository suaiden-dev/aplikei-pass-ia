-- Rename incorrect column target_type to target_role if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'target_type'
  ) THEN
    ALTER TABLE public.notifications RENAME COLUMN target_type TO target_role;
  END IF;
END $$;
