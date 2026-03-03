-- Add security fields to user_services table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_services' AND column_name = 'date_of_birth') THEN
        ALTER TABLE user_services ADD COLUMN date_of_birth TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_services' AND column_name = 'grandmother_name') THEN
        ALTER TABLE user_services ADD COLUMN grandmother_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_services' AND column_name = 'application_id') THEN
        ALTER TABLE user_services ADD COLUMN application_id TEXT;
    END IF;
END $$;
