-- 1. Garante que o bucket 'templates' exista para os modelos PDF
INSERT INTO storage.buckets (id, name, public) 
VALUES ('templates', 'templates', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Permite que o Admin (Edge Function) baixe os templates
CREATE POLICY "Admin download templates" 
ON storage.objects FOR SELECT 
TO service_role 
USING (bucket_id = 'templates');

-- 3. Permite que o Admin (Edge Function) faça upload no bucket documents (se necessário)
CREATE POLICY "Admin upload to documents" 
ON storage.objects FOR INSERT 
TO service_role 
WITH CHECK (bucket_id = 'documents' OR bucket_id = 'process-documents');

-- 4. Permite que o Admin (Edge Function) atualize documentos no bucket process-documents
CREATE POLICY "Admin update process documents" 
ON storage.objects FOR UPDATE 
TO service_role 
USING (bucket_id = 'process-documents');
