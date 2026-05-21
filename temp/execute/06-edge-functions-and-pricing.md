# Task 06: Edge Functions And Pricing

## Goal

Make checkout and payment detection work with the current COS service catalog.

## Scope

- [`supabase/functions/_shared/payments/application/resolve-catalog-pricing.ts`](../../supabase/functions/_shared/payments/application/resolve-catalog-pricing.ts)
- [`supabase/functions/_shared/payments/domain/catalog.ts`](../../supabase/functions/_shared/payments/domain/catalog.ts)
- [`supabase/functions/_shared/payments/payment-slot-logic.ts`](../../supabase/functions/_shared/payments/payment-slot-logic.ts)
- [`supabase/functions/stripe-checkout/index.ts`](../../supabase/functions/stripe-checkout/index.ts)

## Work Items

1. Use `services_prices` first and `services` as fallback.
2. Keep aliases for old and new Motion/RFE slugs.
3. Make payment detection update `current_step` and `negativa` consistently.
4. Keep Motion initial payment mapped to instruction step `20`.

## Acceptance

- Checkout no longer fails because the service only exists in `services`.
- Payment detection updates the correct process state.
- New and legacy slugs both work.

