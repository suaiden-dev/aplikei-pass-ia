-- 1. Fix public.documents RLS policy
-- Remove the permissive policy
DROP POLICY IF EXISTS "Admins podem ver todos os documentos" ON public.documents;

-- Recreate it safely using the is_admin() function
CREATE POLICY "Admins podem ver todos os documentos" 
ON public.documents FOR ALL 
TO authenticated 
USING (public.is_admin());

-- Ensure the user policy for documents is intact (from initial schema)
-- Usuários podem gerenciar seus próprios documentos
-- This should cover SELECT, INSERT, UPDATE, DELETE for the user's own rows
DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios documentos" ON public.documents;
CREATE POLICY "Usuários podem gerenciar seus próprios documentos" 
ON public.documents FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Fix storage.objects RLS policy for the process-documents bucket
-- Remove the permissive policy
DROP POLICY IF EXISTS "Usuários e Admins podem ver documentos do processo" ON storage.objects;

-- Policy for Admins to view any document in process-documents
CREATE POLICY "Admins podem ver documentos do processo"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'process-documents' AND public.is_admin()
);

-- Policy for Users to view their own documents in process-documents
-- Since files in process-documents are stored as "service_id/filename", 
-- we need to check if the user owns the service corresponding to that folder.
CREATE POLICY "Usuários podem ver seus documentos do processo"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'process-documents' 
    AND EXISTS (
        SELECT 1 FROM public.user_services 
        WHERE user_services.id::text = (storage.foldername(name))[1]
        AND user_services.user_id = auth.uid()
    )
);
