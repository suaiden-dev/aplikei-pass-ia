-- MIGRATION: Add product_type to user_services and populate it
-- Goal: Isolate COS and EOS workflows and decouple payments

-- 1. Add product_type column if missing
ALTER TABLE IF EXISTS public.user_services 
ADD COLUMN IF NOT EXISTS product_type varchar(20);

-- 2. Populate product_type based on service_slug (COS, EOS)
UPDATE public.user_services 
SET product_type = 'COS' 
WHERE service_slug = 'troca-status' AND (product_type IS NULL OR product_type = '');

UPDATE public.user_services 
SET product_type = 'EOS' 
WHERE service_slug = 'extensao-status' AND (product_type IS NULL OR product_type = '');

UPDATE public.user_services 
SET product_type = 'B1B2' 
WHERE service_slug = 'visto-b1-b2' AND (product_type IS NULL OR product_type = '');

UPDATE public.user_services 
SET product_type = 'F1' 
WHERE (service_slug = 'visto-f1' OR service_slug = 'visa-f1f2') AND (product_type IS NULL OR product_type = '');

-- 3. Add index for faster product-based queries
CREATE INDEX IF NOT EXISTS idx_user_services_product_type ON public.user_services(product_type);

-- 4. Update the visa_orders table to also track product_type (for cleaner webhooks)
ALTER TABLE IF EXISTS public.visa_orders 
ADD COLUMN IF NOT EXISTS product_type varchar(20);

-- Populate existing orders product_type from slug mapping
UPDATE public.visa_orders 
SET product_type = 'COS' 
WHERE product_slug = 'troca-status' AND (product_type IS NULL OR product_type = '');

UPDATE public.visa_orders 
SET product_type = 'EOS' 
WHERE product_slug = 'extensao-status' AND (product_type IS NULL OR product_type = '');
