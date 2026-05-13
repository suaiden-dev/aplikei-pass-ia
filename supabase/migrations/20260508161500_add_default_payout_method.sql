
-- Add default payout method column
ALTER TABLE office_payment_settings 
ADD COLUMN IF NOT EXISTS default_payout_method TEXT DEFAULT 'stripe';
