-- Run this SQL in the Supabase SQL Editor to fix Storage RLS for client uploads

-- 1. Allow authenticated users to upload to process-documents bucket
-- (under their own user ID prefix)
INSERT INTO storage.policies (name, bucket_id, command, definition)
SELECT 
  'Allow authenticated uploads to process-documents',
  id,
  'INSERT',
  'auth.role() = ''authenticated'''
FROM storage.buckets 
WHERE name = 'process-documents'
ON CONFLICT DO NOTHING;

-- 2. Allow authenticated users to read their own files
INSERT INTO storage.policies (name, bucket_id, command, definition)
SELECT 
  'Allow authenticated reads from process-documents',
  id,
  'SELECT',
  'auth.role() = ''authenticated'''
FROM storage.buckets 
WHERE name = 'process-documents'
ON CONFLICT DO NOTHING;

-- Alternative: If you use the Supabase Dashboard UI, go to:
-- Storage → process-documents → Policies
-- And add:
--   INSERT policy: (auth.role() = 'authenticated')
--   SELECT policy: (auth.role() = 'authenticated')
