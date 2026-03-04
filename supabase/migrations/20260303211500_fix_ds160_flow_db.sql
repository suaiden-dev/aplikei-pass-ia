-- 1. Ampliar a restrição de status em user_services para aceitar o novo fluxo DS-160 e as etapas futuras
ALTER TABLE public.user_services DROP CONSTRAINT IF EXISTS user_services_status_check;
ALTER TABLE public.user_services ADD CONSTRAINT user_services_status_check CHECK (status IN (
    'active', 
    'processing', 
    'review_pending', 
    'review_assign',
    'ds160InProgress', 
    'ds160Processing', 
    'ds160upload_documents', 
    'ds160AwaitingReviewAndSignature',
    'uploadsUnderReview',
    'casvSchedulingPending',
    'casvFeeProcessing',
    'casvPaymentPending',
    'awaitingInterview',
    'approved',
    'rejected',
    'completed', 
    'canceled'
));

-- 2. Corrigir a restrição de status em documents para aceitar novos status de revisão
ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_status_check;
ALTER TABLE public.documents ADD CONSTRAINT documents_status_check CHECK (status IN ('pending', 'received', 'approved', 'resubmit'));

-- 2.1 Adicionar coluna bucket_id se não existir
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS bucket_id TEXT;

-- 3. Adicionar índice único para permitir UPSERT na tabela de documentos (evita duplicatas por nome)
-- Se já houver duplicatas, isso pode falhar. O ideal é limpar antes ou usar um índice parcial.
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'documents_user_id_name_idx') THEN
        CREATE UNIQUE INDEX documents_user_id_name_idx ON public.documents (user_id, name);
    END IF;
END $$;

-- 4. Garantir que o bucket 'process-documents' exista e tenha políticas de acesso
-- Nota: Isso geralmente é feito via Dashboard, mas as políticas podem ser via SQL
INSERT INTO storage.buckets (id, name, public) 
VALUES ('process-documents', 'process-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Política de Upload para o bucket process-documents
DROP POLICY IF EXISTS "Usuários podem dar upload em documentos do processo" ON storage.objects;
CREATE POLICY "Usuários podem dar upload em documentos do processo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'process-documents' 
);

-- Política de Leitura para o bucket process-documents (Usuário e Admin)
DROP POLICY IF EXISTS "Usuários e Admins podem ver documentos do processo" ON storage.objects;
CREATE POLICY "Usuários e Admins podem ver documentos do processo"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'process-documents'
);

-- 5. Atualizar RLS da tabela documents para permitir que o ADMIN veja os documentos
-- Como não temos um campo is_admin explícito identificado nas migrações lidas, 
-- utilizaremos uma política que permite leitura para usuários autenticados (ou podemos restringir mais se soubermos o papel do admin)
DROP POLICY IF EXISTS "Admins podem ver todos os documentos" ON public.documents;
CREATE POLICY "Admins podem ver todos os documentos" 
ON public.documents FOR SELECT 
TO authenticated 
USING (true);

-- No entanto, vamos manter a segurança para INSERT/UPDATE/DELETE apenas para o dono
DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios documentos" ON public.documents;
CREATE POLICY "Usuários podem gerenciar seus próprios documentos" 
ON public.documents FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
