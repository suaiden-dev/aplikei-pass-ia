-- Consolidated fix: New status whitelist for user_services_status_check
-- Purpose: Include all possible COS/EOS flow statuses from both Admin UI and Hooks

ALTER TABLE IF EXISTS public.user_services DROP CONSTRAINT IF EXISTS user_services_status_check;
ALTER TABLE IF EXISTS public.user_services DROP CONSTRAINT IF EXISTS user_service_status_check;

ALTER TABLE public.user_services ADD CONSTRAINT user_services_status_check CHECK (
  status IN (
    -- 1. Legacy & Core System Statuses
    'active', 'approved', 'ds160InProgress', 'casvSchedulingPending', 
    'ds160upload_documents', 'awaitingInterview', 'rejected', 'completed', 
    'canceled', 'accepted', 'CONCLUIDO', 'PACKAGE_READY', 'processing', 'review_pending',
    'uploadsUnderReview', 'review_assign', 'ds160Processing', 'ds160AwaitingReviewAndSignature',
    'casvFeeProcessing', 'casvPaymentPending', 'awaitingConsularInterview',
    'review_returned', 'ds160CorrectionRequired',

    -- 2. COS/EOS Client-Facing "Waiting" States
    'COS_INITIAL_PHOTO', 'EOS_INITIAL_PHOTO',
    'COS_VISA_INFO', 'EOS_VISA_INFO',
    'COS_DEPENDENTS', 'EOS_DEPENDENTS',
    'COS_I94_COLLECTION', 'EOS_I94_COLLECTION',
    'COS_OFFICIAL_FORMS', 'EOS_OFFICIAL_FORMS',
    'COS_COVER_LETTER_FORM', 'EOS_COVER_LETTER_FORM',
    'COS_COVER_LETTER_WEBHOOK', 'EOS_COVER_LETTER_WEBHOOK',
    'COS_F1_I20', 'EOS_F1_I20',
    'COS_F1_SEVIS', 'EOS_F1_SEVIS',
    'COS_FINAL_FORMS', 'EOS_FINAL_FORMS',
    'COS_PACK_READY', 'EOS_PACK_READY',
    'COS_PACKAGE_READY', 'EOS_PACKAGE_READY',
    'COS_TRACKING', 'EOS_TRACKING',
    'COS_COMPLETED', 'EOS_COMPLETED',

    -- 3. COS/EOS Internal Admin Review States
    'COS_ADMIN_SCREENING', 'EOS_ADMIN_SCREENING',
    'COS_OFFICIAL_FORMS_REVIEW', 'EOS_OFFICIAL_FORMS_REVIEW',
    'COS_COVER_LETTER_ADMIN_REVIEW', 'EOS_COVER_LETTER_ADMIN_REVIEW',
    'COS_F1_I20_REVIEW', 'EOS_F1_I20_REVIEW',
    'COS_SEVIS_FEE_REVIEW', 'EOS_SEVIS_FEE_REVIEW',
    'COS_FINAL_FORMS_REVIEW', 'EOS_FINAL_FORMS_REVIEW',

    -- 4. Recovery / RFE / Motion Flows
    'COS_RFE', 'EOS_RFE', 'RFE',
    'COS_APPROVED', 'EOS_APPROVED', 'MOTION_APPROVED',
    'COS_REJECTED', 'EOS_REJECTED', 'MOTION_REJECTED', 'COS_REJECTED_FINAL', 'EOS_REJECTED_FINAL',
    'COS_CASE_FORM', 'EOS_CASE_FORM',
    'COS_ANALISE_PENDENTE', 'EOS_ANALISE_PENDENTE', 'ANALISE_PENDENTE',
    'COS_ANALISE_CONCLUIDA', 'EOS_ANALISE_CONCLUIDA', 'ANALISE_CONCLUIDA',
    'COS_MOTION_IN_PROGRESS', 'EOS_MOTION_IN_PROGRESS', 'MOTION_IN_PROGRESS',
    'COS_MOTION_COMPLETED', 'EOS_MOTION_COMPLETED', 'MOTION_COMPLETED',
    'COS_RECOVERY_PAYMENT_PENDING', 'EOS_RECOVERY_PAYMENT_PENDING', 'RECOVERY_PAYMENT_PENDING',
    'COS_MOTION_PREPARATION', 'EOS_MOTION_PREPARATION', 'MOTION_PREPARATION',
    'COS_MOTION_SENT', 'EOS_MOTION_SENT', 'MOTION_SENT',
    'RFE_IN_PROGRESS', 'COS_RFE_IN_PROGRESS', 'EOS_RFE_IN_PROGRESS',
    'RFE_COMPLETED', 'COS_RFE_COMPLETED', 'EOS_RFE_COMPLETED',
    'RFE_MOTION_IN_PROGRESS'
  )
) NOT VALID;
