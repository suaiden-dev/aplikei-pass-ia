-- Drop the restrictive check constraint on payment_method column
ALTER TABLE "public"."visa_orders" DROP CONSTRAINT IF EXISTS "visa_orders_payment_method_check";
