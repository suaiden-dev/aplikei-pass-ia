
-- Migration to add Stripe and Zelle specific fields
ALTER TABLE office_payment_settings 
ADD COLUMN IF NOT EXISTS stripe_payment_link TEXT,
ADD COLUMN IF NOT EXISTS zelle_payment_link TEXT,
ADD COLUMN IF NOT EXISTS zelle_name TEXT,
ADD COLUMN IF NOT EXISTS zelle_identifier TEXT; -- can be email or phone
