-- Migração para compatibilidade com o fluxo n8n da Migma
-- Garante que a tabela zelle_payments tenha os mesmos campos esperados pelos nodes do n8n

CREATE TABLE IF NOT EXISTS public.zelle_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    amount NUMERIC,
    confirmation_code TEXT,
    fee_type_global TEXT, -- Campo equivalente ao fee_type da Migma
    service_slug TEXT,    -- Slug interno da Aplikei
    status TEXT DEFAULT 'pending_verification',
    image_url TEXT,       -- URL pública ou assinada do comprovante
    proof_path TEXT,      -- Caminho interno no Storage (recomendado para Aplikei)
    admin_notes TEXT,
    processed_by_user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    admin_approved_at TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS
ALTER TABLE public.zelle_payments ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'zelle_payments' AND policyname = 'Users can view their own payments'
    ) THEN
        CREATE POLICY "Users can view their own payments" ON public.zelle_payments
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'zelle_payments' AND policyname = 'Users can insert their own payments'
    ) THEN
        CREATE POLICY "Users can insert their own payments" ON public.zelle_payments
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'zelle_payments' AND policyname = 'Admins can do everything'
    ) THEN
        CREATE POLICY "Admins can do everything" ON public.zelle_payments
            USING (
                EXISTS (
                    SELECT 1 FROM auth.users
                    WHERE auth.users.id = auth.uid()
                    AND (auth.users.raw_app_meta_data->>'role')::text = 'admin'
                )
            );
    END IF;
END $$;
