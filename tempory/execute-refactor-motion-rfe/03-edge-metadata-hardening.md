# Task 03 — Edge Metadata Hardening

## Objective

Guarantee parent context reaches shared fulfillment for all payment providers.

## Files

- [stripe-checkout/index.ts](/home/vileladev/Projects/aplikei/supabase/functions/stripe-checkout/index.ts)
- [create-parcelow-checkout/index.ts](/home/vileladev/Projects/aplikei/supabase/functions/create-parcelow-checkout/index.ts)
- [paymentOps.ts](/home/vileladev/Projects/aplikei/src/features/payments/lib/paymentOps.ts)

## Mini Tasks

1. Ensure `proc_id` and `parent_service_slug` are always populated for recovery checkouts.
2. Add guard logs for recovery slugs when either value is missing.
3. Keep fallback parent resolution in `payment-slot-logic.ts` (do not remove).
4. Verify metadata passthrough for:
   - Stripe session metadata.
   - Parcelow order metadata.
   - Zelle order metadata update path.

## Conflicts to Resolve

1. Existing code mixes `proc_id`, `processId`, `parent_process_id`.
   - Normalize read order and write all aliases during transition.
2. Different providers may omit a field.
   - Harden with fallback and warnings, not hard failure.

## Exit Gate

1. For recovery slugs, logs show deterministic parent metadata.
2. No provider path bypasses parent metadata propagation.

