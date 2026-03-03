-- 1. Atualizar a restrição de status para aceitar os novos tipos
ALTER TABLE public.user_services DROP CONSTRAINT IF EXISTS user_services_status_check;
ALTER TABLE public.user_services ADD CONSTRAINT user_services_status_check CHECK (status IN ('active', 'processing', 'review_pending', 'completed', 'canceled'));

-- 2. Garantir que a coluna current_step existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'user_services' AND COLUMN_NAME = 'current_step') THEN
        ALTER TABLE public.user_services ADD COLUMN current_step INTEGER DEFAULT 0;
    END IF;
END $$;

-- 3. Configurar as políticas de RLS para permitir que o usuário gerencie seus serviços
ALTER TABLE public.user_services ENABLE ROW LEVEL SECURITY;

-- Permissão para o usuário criar seu próprio registro de serviço
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios serviços" ON public.user_services;
CREATE POLICY "Usuários podem inserir seus próprios serviços" 
ON public.user_services FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Permissão para o usuário atualizar seu próprio registro de serviço
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios serviços" ON public.user_services;
CREATE POLICY "Usuários podem atualizar seus próprios serviços" 
ON public.user_services FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
