-- Add CNPJ to offices table
ALTER TABLE public.offices ADD COLUMN IF NOT EXISTS cnpj text;
