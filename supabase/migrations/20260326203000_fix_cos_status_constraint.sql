-- MIGRATION: 20260326203000_fix_cos_status_constraint.sql
-- ADICIONAR STATUS DE MUDANÇA DE STATUS (COS) FALTANTES À RESTRIÇÃO DE CHECK

-- 1. Remover a restrição antiga
ALTER TABLE public.user_services DROP CONSTRAINT IF EXISTS user_services_status_check;

-- 2. Recriar com TODOS os status incluídos (Antigos + Novos COS)
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
    'canceled',
    'unknown',
    -- Statuses COS Existentes
    'COS_INITIAL_PHOTO',
    'COS_VISA_INFO',
    'COS_DEPENDENTS',
    'COS_I94_COLLECTION',
    'COS_ADMIN_SCREENING',
    'COS_OFFICIAL_FORMS',
    'COS_OFFICIAL_FORMS_REVIEW',
    'COS_COVER_LETTER_FORM',
    'COS_COVER_LETTER_WEBHOOK',
    'COS_COVER_LETTER_ADMIN_REVIEW',
    'COS_F1_I20',
    'COS_F1_SEVIS',
    'COS_PACKAGE_READY',
    'COS_COMPLETED',
    'COS_REJECTED',
    -- NOVOS STATUS ADICIONADOS (Phases 5 e 6)
    'COS_SEVIS_FEE',
    'COS_SEVIS_FEE_REVIEW',
    'COS_FINAL_FORMS',
    'COS_FINAL_FORMS_REVIEW',
    'COS_FINAL_REVIEW'
));
