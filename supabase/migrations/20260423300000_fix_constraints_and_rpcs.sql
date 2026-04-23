-- Fix 1: notifications.target_role CHECK — add 'client' (RLS policies already reference it)
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_target_type_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_target_type_check
  CHECK (target_role = ANY (ARRAY['user', 'admin', 'client']));

-- Fix 2: user_services.status CHECK — add all COS/EOS workflow statuses
ALTER TABLE public.user_services
  DROP CONSTRAINT IF EXISTS user_services_status_check;

ALTER TABLE public.user_services
  ADD CONSTRAINT user_services_status_check
  CHECK (status = ANY (ARRAY[
    'pending', 'active', 'awaiting_review', 'completed', 'cancelled',
    'casvPaymentPending', 'awaitingInterview', 'casvFeeProcessing',
    'approved', 'rejected', 'paid', 'awaiting_payment',
    -- COS/EOS workflow statuses used in edge functions
    'COS_CASE_FORM', 'EOS_CASE_FORM',
    'COS_MOTION_IN_PROGRESS', 'EOS_MOTION_IN_PROGRESS',
    'COS_RFE_IN_PROGRESS', 'EOS_RFE_IN_PROGRESS',
    'COS_MOTION_SUBMITTED', 'EOS_MOTION_SUBMITTED',
    'COS_ANALISE_PENDENTE', 'EOS_ANALISE_PENDENTE',
    'RFE_CASE_FORM', 'MOTION_CASE_FORM',
    'RFE_MOTION_IN_PROGRESS', 'MOTION_MOTION_IN_PROGRESS'
  ]));

-- Fix 3: increment_coupon_usage — was pointing to non-existent table 'coupons' with wrong column 'used_count'
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(p_coupon_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.discount_coupons
  SET uses_count = COALESCE(uses_count, 0) + 1
  WHERE id = p_coupon_id;
END;
$$;

-- Fix 4: add increment_coupon_uses alias (frontend paymentRepository uses this name)
CREATE OR REPLACE FUNCTION public.increment_coupon_uses(coupon_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.discount_coupons
  SET uses_count = COALESCE(uses_count, 0) + 1
  WHERE id = coupon_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_coupon_uses(uuid) TO anon, authenticated, service_role;

-- Fix 5: add index for webhook fallback lookup (user_id + product_slug + payment_status + created_at)
CREATE INDEX IF NOT EXISTS idx_orders_user_slug_status_created
  ON public.orders (user_id, product_slug, payment_status, created_at DESC);

-- Fix 6: add index for payment_id lookup in orders (stripe_session_id, parcelow_order_id)
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session
  ON public.orders (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_parcelow_id
  ON public.orders (parcelow_order_id)
  WHERE parcelow_order_id IS NOT NULL;
