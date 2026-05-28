# Task 02 — Backend Shared Payment Fulfillment

## Objective

Implement child-process creation for Motion/RFE purchases in shared payment logic with strict idempotency.

## Primary File

- [payment-slot-logic.ts](/home/vileladev/Projects/aplikei/supabase/functions/_shared/payments/payment-slot-logic.ts)

## Mini Tasks

1. Add helper `isRecoveryChildSlug(serviceSlug)`:
   - Match all COS/EOS Motion/RFE auxiliary slugs.
2. In `applySuccessfulPayment`, after resolving `targetProcId`:
   - If recovery child slug + parent exists, insert child `user_services` row.
3. Child row `step_data` contract:
   - `parent_process_id`
   - `parent_service_slug`
   - `origin: "recovery_child"`
   - `workflow_type: "motion" | "rfe"`
   - `purchase_ref` with `order_id` and payment identifier.
4. Idempotency:
   - Query existing child rows by `purchase_ref.order_id` or payment reference.
   - Return without insert if already present.
5. Preserve current parent update:
   - Keep step auto-advance and `step_data.purchases` updates.

## Conflicts to Resolve

1. Standalone insert branch already exists when no parent found.
   - Keep it for compatibility but include same `purchase_ref` idempotency metadata.
2. Current dedupe checks rely on `purchases` arrays.
   - Add explicit `purchase_ref` based dedupe for child creation.

## Edge Cases

1. Parent slug missing, parent id present:
   - Resolve parent slug from `user_services`.
2. Replayed Stripe verify/webhook:
   - Must not duplicate child rows.
3. Orderless legacy success:
   - Use payment reference id fallback.

## Exit Gate

1. Unit/integration tests prove idempotent child creation.
2. Parent process updates still happen exactly once.

