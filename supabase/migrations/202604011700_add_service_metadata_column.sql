-- Add service_metadata column to user_services if it doesn't exist
ALTER TABLE IF EXISTS public.user_services 
ADD COLUMN IF NOT EXISTS service_metadata jsonb DEFAULT '{}'::jsonb;

-- Ensure RLS is enabled for cos_recovery_cases
ALTER TABLE IF EXISTS public.cos_recovery_cases ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can insert their own cases
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own recovery cases') THEN
        CREATE POLICY "Users can insert their own recovery cases"
        ON public.cos_recovery_cases
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Policy: Users can view their own cases
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own recovery cases') THEN
        CREATE POLICY "Users can view their own recovery cases"
        ON public.cos_recovery_cases
        FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- Policy: Users can update their own cases
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own recovery cases') THEN
        CREATE POLICY "Users can update their own recovery cases"
        ON public.cos_recovery_cases
        FOR UPDATE
        TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Policy: Service Role can do everything
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service Role full access') THEN
        CREATE POLICY "Service Role full access"
        ON public.cos_recovery_cases
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;
