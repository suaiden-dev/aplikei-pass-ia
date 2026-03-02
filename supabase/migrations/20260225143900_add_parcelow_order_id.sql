-- Migration: Add Parcelow Order ID to visa_orders
-- Description: This migration adds the parcelow_order_id column to the visa_orders table to support Parcelow payment integration.

ALTER TABLE visa_orders
ADD COLUMN IF NOT EXISTS parcelow_order_id TEXT UNIQUE;

COMMENT ON COLUMN visa_orders.parcelow_order_id IS 'Store the Order ID returned by the Parcelow API for webhook tracking';
