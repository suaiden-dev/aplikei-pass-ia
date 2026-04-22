-- Adiciona colunas de cupom para rastreamento na tabela de pedidos ativa
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'visa_orders'
  ) THEN
    ALTER TABLE public.visa_orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
    ALTER TABLE public.visa_orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'orders'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
  END IF;
END $$;

-- Garante que zelle_payments também tenha as colunas (caso não tenha)
ALTER TABLE public.zelle_payments ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE public.zelle_payments ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;

-- Comentários para documentação
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'visa_orders' AND column_name = 'coupon_code'
  ) THEN
    COMMENT ON COLUMN public.visa_orders.coupon_code IS 'Código do cupom aplicado na compra';
    COMMENT ON COLUMN public.visa_orders.discount_amount IS 'Valor total do desconto em USD';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'coupon_code'
  ) THEN
    COMMENT ON COLUMN public.orders.coupon_code IS 'Código do cupom aplicado na compra';
    COMMENT ON COLUMN public.orders.discount_amount IS 'Valor total do desconto em USD';
  END IF;
END $$;

COMMENT ON COLUMN public.zelle_payments.coupon_code IS 'Código do cupom aplicado na compra';
COMMENT ON COLUMN public.zelle_payments.discount_amount IS 'Valor total do desconto em USD';
