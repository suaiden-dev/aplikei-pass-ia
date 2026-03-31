-- Fix: Merge ALL historical and new statuses into a single comprehensive constraint
-- Migration: 20260331182500_merge_all_statuses.sql

-- 1. Drop existing constraints (trying all known names)
ALTER TABLE public.user_services DROP CONSTRAINT IF EXISTS user_services_status_check;
ALTER TABLE public.user_services DROP CONSTRAINT IF EXISTS user_service_status_check;

-- 2. Create the unified constraint with EVERY status ever used in migrations
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
    -- Custom COS Statuses (Original & Phases 1-4)
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
    -- Missing statuses from middle migrations (Phases 5-6)
    'COS_SEVIS_FEE',
    'COS_SEVIS_FEE_REVIEW',
    'COS_FINAL_FORMS',
    'COS_FINAL_FORMS_REVIEW',
    'COS_FINAL_REVIEW',
    'COS_PACKAGE_READY',
    'COS_COMPLETED',
    'COS_REJECTED',
    -- New Statuses for Tracking & Outcomes (Phases 7+)
    'COS_TRACKING',
    'COS_RFE'
));
