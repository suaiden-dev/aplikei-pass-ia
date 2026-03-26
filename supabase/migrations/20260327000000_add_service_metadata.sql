-- Fix for PGRST204: Could not find the 'service_metadata' column of 'user_services' in the schema cache
-- This column is required by some repository methods or edge functions that might be active.
-- Even if the current frontend code doesn't use it, PostgREST queries are failing.

ALTER TABLE public.user_services 
ADD COLUMN IF NOT EXISTS service_metadata JSONB DEFAULT '{}'::jsonb;

-- Comment for future maintainers
COMMENT ON COLUMN public.user_services.service_metadata IS 'Stores per-service metadata written by the StatusEngine or other system components.';
