-- Adiciona colunas de cupom para rastreamento em visa_orders
ALTER TABLE public.visa_orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE public.visa_orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;

-- Garante que zelle_payments também tenha as colunas (caso não tenha)
ALTER TABLE public.zelle_payments ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE public.zelle_payments ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;

-- Comentários para documentação
COMMENT ON COLUMN public.visa_orders.coupon_code IS 'Código do cupom aplicado na compra';
COMMENT ON COLUMN public.visa_orders.discount_amount IS 'Valor total do desconto em USD';
COMMENT ON COLUMN public.zelle_payments.coupon_code IS 'Código do cupom aplicado na compra';
COMMENT ON COLUMN public.zelle_payments.discount_amount IS 'Valor total do desconto em USD';
