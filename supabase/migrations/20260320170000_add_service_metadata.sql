-- Stores per-service metadata written by the StatusEngine on every transition.
-- Keyed by ServiceID (e.g. { "B1B2_TOURIST": { "i94ExpirationDate": "...", ... } }).
ALTER TABLE public.user_services
  ADD COLUMN IF NOT EXISTS service_metadata JSONB DEFAULT '{}'::jsonb;
