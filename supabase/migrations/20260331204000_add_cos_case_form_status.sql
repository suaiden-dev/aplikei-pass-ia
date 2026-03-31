-- Migration: Add COS_CASE_FORM + all post-decision statuses to the CHECK constraint
-- The status column uses a CHECK constraint, NOT a PostgreSQL enum type.
-- Apply this in Supabase SQL Editor.

-- 1. Drop both known constraint names (safe)
ALTER TABLE public.user_services DROP CONSTRAINT IF EXISTS user_services_status_check;
ALTER TABLE public.user_services DROP CONSTRAINT IF EXISTS user_service_status_check;

-- 2. Recreate with ALL statuses (historical + new)
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
    'awaitingConsularInterview',
    'approved',
    'rejected',
    'completed',
    'canceled',
    'unknown',
    -- COS workflow statuses
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
    'COS_F1_I20_REVIEW',
    'COS_F1_SEVIS',
    'COS_SEVIS_FEE',
    'COS_SEVIS_FEE_REVIEW',
    'COS_FINAL_FORMS',
    'COS_FINAL_FORMS_REVIEW',
    'COS_FINAL_REVIEW',
    'COS_PACKAGE_READY',
    'COS_COMPLETED',
    'COS_TRACKING',
    'COS_RFE',
    -- Post-decision statuses
    'COS_APPROVED',
    'COS_REJECTED',
    'COS_REJECTED_ANALYSIS_PENDING',
    'COS_REJECTED_PROPOSAL_READY',
    'COS_MOTION_IN_PROGRESS',
    'COS_MOTION_COMPLETED',
    -- New: specialist analysis flow
    'COS_CASE_FORM',
    'ANALISE_PENDENTE',
    'ANALISE_CONCLUIDA',
    'MOTION_IN_PROGRESS',
    'MOTION_COMPLETED'
));

-- 3. Add the specialist analysis product price ($50) to the services catalog
--    Required so the stripe-checkout Edge Function can find the price.
INSERT INTO services_prices (service_id, name, price)
VALUES ('analise-especialista-cos', 'Análise de Especialista (COS)', 50.00)
ON CONFLICT (service_id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;
