
-- Create office withdrawals table
CREATE TABLE IF NOT EXISTS office_withdrawals (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    office_id UUID NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    method TEXT NOT NULL DEFAULT 'stripe' CHECK (method IN ('stripe', 'zelle')),
    payment_link TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE office_withdrawals ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Offices can view their own withdrawals'
    ) THEN
        CREATE POLICY "Offices can view their own withdrawals"
        ON office_withdrawals FOR SELECT
        TO authenticated
        USING (office_id IN (
            SELECT office_id FROM user_accounts WHERE id = auth.uid()
        ));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Offices can create their own withdrawals'
    ) THEN
        CREATE POLICY "Offices can create their own withdrawals"
        ON office_withdrawals FOR INSERT
        TO authenticated
        WITH CHECK (office_id IN (
            SELECT office_id FROM user_accounts WHERE id = auth.uid()
        ));
    END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_office_withdrawals_office_id ON office_withdrawals(office_id);
CREATE INDEX IF NOT EXISTS idx_office_withdrawals_status ON office_withdrawals(status);
