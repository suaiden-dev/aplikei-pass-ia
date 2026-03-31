-- Migration: Create cos_recovery_cases table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.cos_recovery_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_service_id UUID NOT NULL,
  user_id UUID NOT NULL,
  -- Client submission
  explanation TEXT,
  document_urls TEXT[] DEFAULT '{}',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  -- Admin response
  admin_analysis TEXT,
  proposal_value_usd NUMERIC(10, 2),
  proposal_sent_at TIMESTAMPTZ,
  admin_notes TEXT,
  -- Status
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.cos_recovery_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_view_own" ON public.cos_recovery_cases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "clients_insert_own" ON public.cos_recovery_cases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "clients_update_own" ON public.cos_recovery_cases
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow admins (authenticated with service role) full access
CREATE POLICY "service_role_all" ON public.cos_recovery_cases
  FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_cos_recovery_user_service ON public.cos_recovery_cases(user_service_id);
