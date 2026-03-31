-- Final consolidation of statuses for user_services
DO $$ 
BEGIN
    ALTER TABLE IF EXISTS user_services DROP CONSTRAINT IF EXISTS user_service_status_check;
    ALTER TABLE IF EXISTS user_services DROP CONSTRAINT IF EXISTS user_services_status_check;
END $$;

ALTER TABLE user_services ADD CONSTRAINT user_services_status_check CHECK (
  status IN (
    'ds160personal1', 'ds160personal2', 'ds160travel', 'ds160companions', 
    'ds160previous-travel', 'ds160address-phone', 'ds160social-media', 
    'ds160passport', 'ds160us-contact', 'ds160family', 'ds160work-education', 
    'ds160additional', 'ds160upload_documents', 'ds160review_pending', 
    'ds160CorrectionRequired', 'casvSchedulingPending', 'casvFeeProcessing', 
    'casvPaymentPending', 'awaitingConsularInterview', 'approved', 'rejected', 
    'completed', 'COS_ADMIN_SCREENING', 'COS_FORMS_SUBMITTED', 'COS_OFFICIAL_FORMS', 
    'COS_TRACKING', 'COS_RFE',
    'COS_APPROVED',
    'COS_REJECTED',
    'COS_REJECTED_ANALYSIS_PENDING',
    'COS_REJECTED_PROPOSAL_READY',
    'COS_MOTION_IN_PROGRESS',
    'COS_MOTION_COMPLETED',
    'MOTION_APPROVED',
    'MOTION_REJECTED',
    'ANALISE_CONCLUIDA',
    'ANALISE_PENDENTE',
    'accepted',
    'CONCLUIDO',
    'COS_CASE_FORM'
  )
);
