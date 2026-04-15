-- 1. Tabela de cupons
CREATE TABLE IF NOT EXISTS public.discount_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  max_uses INTEGER DEFAULT NULL,
  uses_count INTEGER NOT NULL DEFAULT 0,
  applicable_slugs TEXT[] DEFAULT NULL,
  min_purchase_usd NUMERIC DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 2. RLS
ALTER TABLE public.discount_coupons ENABLE ROW LEVEL SECURITY;

-- Remover policy se já existir para evitar erro
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'discount_coupons' AND policyname = 'Admin full access'
    ) THEN
        CREATE POLICY "Admin full access" ON public.discount_coupons
        FOR ALL USING (
            EXISTS (SELECT 1 FROM public.user_accounts WHERE id = auth.uid() AND role = 'admin')
        );
    END IF;
END
$$;

-- 3. RPC para validação segura
CREATE OR REPLACE FUNCTION public.validate_coupon(p_code TEXT, p_slug TEXT DEFAULT NULL)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  coupon RECORD;
BEGIN
  SELECT * INTO coupon FROM public.discount_coupons
  WHERE code = UPPER(TRIM(p_code))
    AND is_active = true
    AND expires_at > now()
    AND (max_uses IS NULL OR uses_count < max_uses);

  IF NOT FOUND THEN
    RETURN json_build_object('valid', false, 'error', 'INVALID_OR_EXPIRED');
  END IF;

  IF coupon.applicable_slugs IS NOT NULL AND p_slug IS NOT NULL
     AND NOT (p_slug = ANY(coupon.applicable_slugs)) THEN
    RETURN json_build_object('valid', false, 'error', 'NOT_APPLICABLE');
  END IF;

  RETURN json_build_object(
    'valid', true,
    'coupon_id', coupon.id,
    'discount_type', coupon.discount_type,
    'discount_value', coupon.discount_value,
    'min_purchase_usd', coupon.min_purchase_usd
  );
END;
$$;
