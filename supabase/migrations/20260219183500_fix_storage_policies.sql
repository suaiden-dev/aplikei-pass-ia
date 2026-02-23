-- Migração para corrigir políticas de segurança do Storage
-- Adiciona permissões de UPDATE e DELETE para o bucket 'documents'

-- Política para permitir que usuários atualizem seus próprios documentos (reenvio/substituição)
CREATE POLICY "Usuários podem atualizar seus próprios documentos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para permitir que usuários deletem seus próprios documentos
CREATE POLICY "Usuários podem deletar seus próprios documentos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
