-- Migration to create office payment settings table
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS office_payment_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    office_id UUID NOT NULL REFERENCES offices(id) ON DELETE CASCADE UNIQUE,
    bank_name TEXT,
    account_number TEXT,
    routing_number TEXT,
    account_type TEXT,
    pix_key TEXT,
    zelle_email TEXT,
    withdrawal_method TEXT DEFAULT 'automatic',
    payout_frequency TEXT DEFAULT 'weekly',
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE office_payment_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Offices can view their own payment settings" ON office_payment_settings;
CREATE POLICY "Offices can view their own payment settings" 
    ON office_payment_settings FOR SELECT 
    USING (office_id = (SELECT office_id FROM user_accounts WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Offices can update their own payment settings" ON office_payment_settings;
CREATE POLICY "Offices can update their own payment settings" 
    ON office_payment_settings FOR UPDATE
    USING (office_id = (SELECT office_id FROM user_accounts WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Offices can insert their own payment settings" ON office_payment_settings;
CREATE POLICY "Offices can insert their own payment settings" 
    ON office_payment_settings FOR INSERT
    WITH CHECK (office_id = (SELECT office_id FROM user_accounts WHERE id = auth.uid()));
