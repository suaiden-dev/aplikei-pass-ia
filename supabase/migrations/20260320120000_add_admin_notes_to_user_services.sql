-- Adicionar coluna admin_notes à tabela user_services para feedback de revisão
ALTER TABLE public.user_services ADD COLUMN IF NOT EXISTS admin_notes TEXT;
-- Adicionar coluna admin_review_data para persistir o checklist se necessário
ALTER TABLE public.user_services ADD COLUMN IF NOT EXISTS admin_review_data JSONB DEFAULT '{}'::jsonb;
