-- MEGA FIX: Add metadata column, update status check constraint, and fix ADMIN RLS
-- Version 4: Final version with Specialist/Admin visibility fix and more legacy statuses

-- 1. Add service_metadata column if missing
ALTER TABLE IF EXISTS public.user_services 
ADD COLUMN IF NOT EXISTS service_metadata jsonb DEFAULT '{}'::jsonb;

-- 2. DROP THE OLD CONSTRAINT(S) FIRST
ALTER TABLE IF EXISTS public.user_services DROP CONSTRAINT IF EXISTS user_services_status_check;
ALTER TABLE IF EXISTS public.user_services DROP CONSTRAINT IF EXISTS user_service_status_check;

-- 3. RE-CREATE with an all-inclusive list (Legacy + RFE/Motion + DB Rows)
ALTER TABLE public.user_services ADD CONSTRAINT user_services_status_check CHECK (
  status IN (
    -- Legacy/System Statuses
    'active', 'approved', 'ds160InProgress', 'casvSchedulingPending', 
    'ds160upload_documents', 'awaitingInterview', 'rejected', 'completed', 
    'canceled', 'accepted', 'CONCLUIDO', 'PACKAGE_READY', 'processing', 'review_pending',
    -- DS-160 / CASV Flow Variants
    'ds160personal1', 'ds160personal2', 'ds160travel', 'ds160companions', 'ds160previous-travel', 
    'ds160address-phone', 'ds160social-media', 'ds160passport', 'ds160us-contact', 'ds160family', 
    'ds160work-education', 'ds160additional', 'ds160review_pending', 'ds160CorrectionRequired', 
    'casvFeeProcessing', 'casvPaymentPending', 'awaitingConsularInterview',
    -- COS / EOS Official Workflow
    'COS_ADMIN_SCREENING', 'COS_FORMS_SUBMITTED', 'COS_OFFICIAL_FORMS', 'COS_TRACKING', 'COS_RFE', 'EOS_RFE', 'RFE',
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

-- 4. Set up ADMIN-AWARE RLS for cos_recovery_cases
ALTER TABLE IF EXISTS public.cos_recovery_cases ENABLE ROW LEVEL SECURITY;

-- Clear old restrictive policies
DROP POLICY IF EXISTS "Users can insert their own recovery cases" ON public.cos_recovery_cases;
DROP POLICY IF EXISTS "Users can view their own recovery cases" ON public.cos_recovery_cases;
DROP POLICY IF EXISTS "Users can update their own recovery cases" ON public.cos_recovery_cases;
DROP POLICY IF EXISTS "Admins and owners can view recovery cases" ON public.cos_recovery_cases;
DROP POLICY IF EXISTS "Admins and owners can update recovery cases" ON public.cos_recovery_cases;

-- 5. Final Policies: Allow owners AND admins/specialists
CREATE POLICY "Users can insert their own recovery cases"
ON public.cos_recovery_cases FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins and owners can view recovery cases"
ON public.cos_recovery_cases FOR SELECT TO authenticated
USING (
  auth.uid() = user_id OR 
  public.is_admin()
);

CREATE POLICY "Admins and owners can update recovery cases"
ON public.cos_recovery_cases FOR UPDATE TO authenticated
USING (
  auth.uid() = user_id OR 
  public.is_admin()
)
WITH CHECK (
  auth.uid() = user_id OR 
  public.is_admin()
);
