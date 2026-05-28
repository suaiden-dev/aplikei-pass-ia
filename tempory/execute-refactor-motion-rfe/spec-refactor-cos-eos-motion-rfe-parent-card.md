# Spec: Refactor COS/EOS Motion & RFE as Child Processes Grouped Under Parent

## Objective

Refactor COS/EOS recovery flows so that **Motion** and **RFE** purchases create their own rows in `public.user_services`, while the UI shows these records **grouped under the parent process card** (parent can be `troca-status` or `extensao-status`).

## Scope

- In scope:
  - Data model and metadata contract for parent-child process linkage.
  - Payment fulfillment behavior (Stripe/Parcelow/Zelle path) when buying Motion/RFE services.
  - Client process listing/detail behavior to group child processes under parent.
  - Compatibility with existing chats and admin/customer process views.
- Out of scope:
  - New visual design system.
  - Rewriting COS onboarding step engine.
  - Replacing current `step_data.purchases` behavior in one go.

## Assumptions

1. "Motion ou EOS" in request means "Motion or RFE for COS/EOS recovery context".
2. Parent process remains the main timeline process (`troca-status`/`extensao-status`).
3. Child processes are auxiliary service slugs (examples today):
   - `analysis-rfe-cos`, `analysis-rfe-eos`, `apoio-rfe-motion-inicio`
   - `proposta-rfe-motion`, `consultancy-motion-cos`, `consultancy-motion-eos`

## Current State (as implemented)

1. Payment fulfillment is centralized in `applySuccessfulPayment`:
   - [payment-slot-logic.ts](/home/vileladev/Projects/aplikei/supabase/functions/_shared/payments/payment-slot-logic.ts)
2. Behavior today:
   - If auxiliary payment has resolvable parent `proc_id`, it updates parent `step_data` (`purchases`, `workflow_status`, step auto-advance).
   - If parent cannot be resolved, it can insert standalone `user_services` row with `step_data.parent_process_id`.
3. Listing currently filters out auxiliary slugs from main cards:
   - [useMyProcesses.ts](/home/vileladev/Projects/aplikei/src/features/process/hooks/useMyProcesses.ts)
4. Parent linkage already exists in multiple places:
   - `step_data.parent_process_id`
   - `step_data.parent_service_slug`
   - order metadata mirrors (`proc_id`, `parent_process_id`, `parent_service_slug`)
5. Edge functions use shared payment logic:
   - Stripe verify: [verify-stripe-session.ts](/home/vileladev/Projects/aplikei/supabase/functions/_shared/payments/application/verify-stripe-session.ts)
   - Stripe checkout setup: [stripe-checkout/index.ts](/home/vileladev/Projects/aplikei/supabase/functions/stripe-checkout/index.ts)
   - Parcelow checkout setup: [create-parcelow-checkout/index.ts](/home/vileladev/Projects/aplikei/supabase/functions/create-parcelow-checkout/index.ts)
   - Zelle validation path also lands in shared payment apply logic: [validate-zelle-payment.ts](/home/vileladev/Projects/aplikei/supabase/functions/_shared/payments/application/validate-zelle-payment.ts)

## Target Behavior

1. On successful payment for Motion/RFE auxiliary products:
   - Create child `user_services` row for that purchased service.
   - Persist hard link to parent process (`parent_process_id`, `parent_service_slug`) in child `step_data`.
2. Parent process card remains the anchor in "My Processes".
3. Parent card displays nested child cards (history/current recovery entries), not separate top-level rows.
4. Parent process workflow continuity remains intact (step auto-advance and `purchases` mirror remain for backward compatibility).

## Required Data Contract

### Child process row (`user_services`)

- `service_slug`: purchased auxiliary slug.
- `user_id`: same as parent.
- `status`: `active` on creation.
- `current_step`: `0` (or mapped initial step per service if later needed).
- `step_data`:
  - `parent_process_id`: `<uuid parent user_services.id>`
  - `parent_service_slug`: `troca-status` or `extensao-status`
  - `origin`: `"recovery_child"`
  - `workflow_type`: `"motion"` or `"rfe"` (derived)
  - `purchase_ref`: order/payment identifiers

### Parent process row (`user_services`)

- Keep updating:
  - `step_data.purchases`
  - recovery flags (`workflow_status`, `motion_*`, `rfe_*`, cycles/history)
- This preserves current onboarding and admin behavior while migrating UI gradually.

## Implementation Plan

## 1) Shared payment fulfillment (core)

Primary file:
- [payment-slot-logic.ts](/home/vileladev/Projects/aplikei/supabase/functions/_shared/payments/payment-slot-logic.ts)

Changes:
1. Add helper `isRecoveryChildSlug(service_slug)` for Motion/RFE slugs.
2. In `applySuccessfulPayment`, when `isRecoveryChildSlug(service_slug)` and `targetProcId` exists:
   - Insert a child `user_services` row (idempotent by `purchaseRecord.id` or `order_id`).
   - Keep current parent update path (auto-advance + purchase mirror).
3. Add idempotency query:
   - Find existing child where `step_data.purchase_ref.order_id == order_id` or purchase id already present.
4. Keep `syncParentOrderMetadata` and `mirrorPurchaseToParentProcess` behavior.

Why:
- All payment channels converge here via verify/validate flow, so changing one place covers Stripe, Parcelow, Zelle.

## 2) Edge function metadata hardening

Files:
- [stripe-checkout/index.ts](/home/vileladev/Projects/aplikei/supabase/functions/stripe-checkout/index.ts)
- [create-parcelow-checkout/index.ts](/home/vileladev/Projects/aplikei/supabase/functions/create-parcelow-checkout/index.ts)
- [paymentOps.ts](/home/vileladev/Projects/aplikei/src/features/payments/lib/paymentOps.ts)

Changes:
1. Ensure `proc_id` and `parent_service_slug` are always sent for recovery product checkout.
2. Add guard logging when missing parent info for recovery slugs.
3. Keep existing fallback parent resolution in shared payment logic.

Why:
- Reduces chance of orphan child rows.

## 3) Process list grouping

Files:
- [useUserProcesses.ts](/home/vileladev/Projects/aplikei/src/features/process/hooks/useUserProcesses.ts)
- [useMyProcesses.ts](/home/vileladev/Projects/aplikei/src/features/process/hooks/useMyProcesses.ts)
- [MyProcessesPage/index.tsx](/home/vileladev/Projects/aplikei/src/features/process/pages/MyProcessesPage/index.tsx)

Changes:
1. Build normalized structure:
   - `parentProcesses[]`
   - `childrenByParentId: Record<string, UserService[]>`
2. Parent detection:
   - `service_slug` in main products OR missing `step_data.parent_process_id`.
3. Child detection:
   - `step_data.parent_process_id` exists and belongs to same user.
4. UI:
   - Keep one top-level parent row.
   - Render expandable nested rows for child recovery records under that parent.
   - Child row CTA should open relevant onboarding/detail route with `?id=<parent_id>` and context.

## 4) Process detail behavior

File:
- [ProcessDetailPage/index.tsx](/home/vileladev/Projects/aplikei/src/features/process/pages/ProcessDetailPage/index.tsx)

Changes:
1. If opening from child card, resolve parent process and child context.
2. Show child purchase/history panel while preserving parent timeline.
3. Do not break current `slug` + `id` compatibility.

## 5) COS/EOS onboarding integration

File:
- [COSOnboardingPage/index.tsx](/home/vileladev/Projects/aplikei/src/features/onboarding/cos/pages/COSOnboardingPage/index.tsx)

Changes:
1. Accept optional child context params (`childId`, `workflowType`) when entering from nested card.
2. Maintain parent process as source of truth for step engine initially.
3. Optionally surface child records in recovery steps as audit/history.

## 6) Chat/Admin compatibility checks

Relevant:
- `parent_process_id` is already used by chat assignment and backfills.
- Existing migrations already reconcile standalone rows with parent process.

No schema rewrite required now, but test:
1. Customer chat continuity after child creation.
2. Admin process detail purchases/history.

## SQL / Migration Notes

No mandatory schema migration for phase 1 if we keep links in `step_data`.

Optional migration (recommended phase 2):
1. Add `parent_process_id uuid` as first-class column in `user_services`.
2. Backfill from `step_data.parent_process_id`.
3. Add index on `(user_id, parent_process_id)`.

## Backfill Plan (existing data)

1. Find auxiliary `user_services` without `parent_process_id`.
2. Resolve parent from latest paid order metadata (`parent_process_id` / `proc_id`).
3. Patch child `step_data.parent_process_id` + `parent_service_slug`.
4. Dry run report before write.

## Test Plan

## Unit/Integration

1. `applySuccessfulPayment`:
   - Creates child row for recovery slugs when parent exists.
   - Idempotent on repeated webhook/session verification.
   - Still updates parent `step_data` and step progression.
2. `useMyProcesses`:
   - Parent card count unchanged.
   - Child records grouped, not top-level.
3. `ProcessDetailPage`:
   - Parent route works with and without child context.

## E2E

1. Buy Motion analysis for active COS:
   - Payment success.
   - Child row created in `user_services`.
   - Parent card shows nested child.
2. Repeat same verify endpoint call:
   - No duplicate child row.
3. EOS equivalent flow:
   - Same behavior under `extensao-status` parent.

## Risks

1. Duplicate child rows without strict idempotency.
2. Parent resolution failure for legacy orders without `proc_id`.
3. UI confusion if child route opens without parent context.

## Mitigations

1. Use `order_id` / payment reference as unique purchase identity.
2. Keep fallback `resolveTargetProcessId` and explicit logging.
3. Preserve parent-first navigation and only pass child context as optional.

## Rollout Strategy

1. Phase 1: backend creation + grouped frontend rendering behind feature flag.
2. Phase 2: enable for all COS/EOS recovery products.
3. Phase 3: optional schema hardening (`parent_process_id` column).

## Acceptance Criteria

1. Paying Motion/RFE for COS/EOS creates a child `user_services` row.
2. Child does not appear as separate top-level process card.
3. Parent card displays child entry/entries.
4. Existing COS/EOS progression and chat behavior remain functional.
5. Reprocessing the same payment does not create duplicates.

