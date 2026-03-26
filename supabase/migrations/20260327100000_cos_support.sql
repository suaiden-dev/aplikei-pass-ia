-- MUDANÇA DE STATUS (COS) - SUPPORT TABLES
-- Migration: 20260327100000_cos_support.sql

-- 1. Table for Dependents
CREATE TABLE IF NOT EXISTS public.service_dependents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_service_id UUID REFERENCES public.user_services(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    relationship TEXT NOT NULL, -- e.g., 'spouse', 'child'
    birth_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Index for performance
CREATE INDEX IF NOT EXISTS idx_service_dependents_user_service_id ON public.service_dependents(user_service_id);

-- 3. RLS Policies
ALTER TABLE public.service_dependents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own dependents"
ON public.service_dependents FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_services 
        WHERE id = public.service_dependents.user_service_id 
        AND user_id = auth.uid()
    )
);

-- 4. Audit Log integration (Optional but good practice)
-- Assuming process_logs already exists from previous migrations
COMMENT ON TABLE public.service_dependents IS 'Armazena dependentes para processos de Mudança de Status (COS) e Extensão.';
