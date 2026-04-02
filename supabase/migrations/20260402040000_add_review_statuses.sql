-- Fix: Add missing EOS and COS review statuses to the check constraint

ALTER TABLE IF EXISTS public.user_services DROP CONSTRAINT IF EXISTS user_services_status_check;
ALTER TABLE IF EXISTS public.user_services DROP CONSTRAINT IF EXISTS user_service_status_check;

ALTER TABLE public.user_services ADD CONSTRAINT user_services_status_check CHECK (
  status IN (
    -- Legacy/System Statuses
    'active', 'approved', 'ds160InProgress', 'casvSchedulingPending', 
    'ds160upload_documents', 'awaitingInterview', 'rejected', 'completed', 
    'canceled', 'accepted', 'CONCLUIDO', 'PACKAGE_READY', 'processing', 'review_pending',
    'uploadsUnderReview', 'review_assign', 'ds160Processing', 'ds160AwaitingReviewAndSignature',
    
    -- DS-160 / CASV Flow Variants
    'ds160personal1', 'ds160personal2', 'ds160travel', 'ds160companions', 'ds160previous-travel', 
    'ds160address-phone', 'ds160social-media', 'ds160passport', 'ds160us-contact', 'ds160family', 
    'ds160work-education', 'ds160additional', 'ds160review_pending', 'ds160CorrectionRequired', 
    'casvFeeProcessing', 'casvPaymentPending', 'awaitingConsularInterview',
    
    -- COS / EOS Official Workflow Core
    'COS_ADMIN_SCREENING', 'EOS_ADMIN_SCREENING', 
    'COS_FORMS_SUBMITTED', 'COS_OFFICIAL_FORMS', 
    'COS_TRACKING', 'EOS_TRACKING', 
    'COS_RFE', 'EOS_RFE', 'RFE',
    
    -- COS / EOS Review Statuses added
    'COS_OFFICIAL_FORMS_REVIEW', 'EOS_OFFICIAL_FORMS_REVIEW',
    'COS_COVER_LETTER_ADMIN_REVIEW', 'EOS_COVER_LETTER_ADMIN_REVIEW',
    'COS_F1_I20_REVIEW', 'EOS_F1_I20_REVIEW',
    'COS_SEVIS_FEE_REVIEW', 'EOS_SEVIS_FEE_REVIEW',
    'COS_FINAL_FORMS_REVIEW', 'EOS_FINAL_FORMS_REVIEW',
    
    -- Post Actions and Responses
    'COS_APPROVED', 'EOS_APPROVED', 'MOTION_APPROVED', 'COS_REJECTED', 'EOS_REJECTED', 'MOTION_REJECTED',
    'COS_REJECTED_FINAL', 'EOS_REJECTED_FINAL', 'COS_PACKAGE_READY', 'EOS_PACKAGE_READY',
    
    -- Recovery / RFE / Motion Flows
    'COS_CASE_FORM', 'EOS_CASE_FORM',
    'COS_ANALISE_PENDENTE', 'EOS_ANALISE_PENDENTE', 'ANALISE_PENDENTE',
    'COS_ANALISE_CONCLUIDA', 'EOS_ANALISE_CONCLUIDA', 'ANALISE_CONCLUIDA',
    'COS_MOTION_IN_PROGRESS', 'EOS_MOTION_IN_PROGRESS',
    'COS_MOTION_COMPLETED', 'EOS_MOTION_COMPLETED',
    'COS_RECOVERY_PAYMENT_PENDING', 'EOS_RECOVERY_PAYMENT_PENDING', 'RECOVERY_PAYMENT_PENDING',
    'COS_MOTION_PREPARATION', 'EOS_MOTION_PREPARATION', 'MOTION_PREPARATION',
    'COS_MOTION_SENT', 'EOS_MOTION_SENT', 'MOTION_SENT'
  )
);
