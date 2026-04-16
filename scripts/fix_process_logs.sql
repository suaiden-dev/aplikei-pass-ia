BEGIN;

-- 1. Forçamos a queda de qualquer versão defasada da tabela
DROP TABLE IF EXISTS public.process_logs CASCADE;

-- 2. Recriamos a tabela de forma "gorda", com todos os nomes de colunas que a função fantasma pode estar tentando buscar
CREATE TABLE public.process_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_service_id UUID REFERENCES public.user_services(id) ON DELETE CASCADE,
    service_id UUID,
    action TEXT,
    previous_step INTEGER,
    new_step INTEGER,
    previous_status TEXT,
    new_status TEXT,
    details JSONB,
    metadata JSONB,
    changed_by UUID,
    created_by UUID,
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitando RLS para evitar warnings no banco
ALTER TABLE public.process_logs ENABLE ROW LEVEL SECURITY;

COMMIT;
