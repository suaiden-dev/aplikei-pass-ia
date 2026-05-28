# Task 07 — Test Plan and Release Gates

## Objective

Ship refactor with hard quality gates and rollback readiness.

## Test Matrix

1. Backend fulfillment:
   - Recovery payment creates child row when parent exists.
   - Repeated event processing does not duplicate child rows.
   - Parent step/purchases still update.
2. Provider coverage:
   - Stripe verify path.
   - Stripe webhook path.
   - Zelle validation path.
   - Parcelow path.
3. Frontend:
   - Parent cards unchanged in count.
   - Child rows nested under parent.
   - Child deep-link preserves parent context.
4. Compatibility:
   - Customer/admin chat still binds to parent context.
   - Admin process detail remains correct.

## Mini Tasks

1. Add/adjust tests where possible:
   - Shared payment logic unit tests.
   - Hook-level grouping tests.
2. Manual smoke checklist:
   - COS Motion paid flow.
   - EOS RFE paid flow.
   - duplicate verify replay.
3. Release gates:
   - All required tests green.
   - Dry-run and (if approved) backfill report attached.
   - Observability logs validated in staging.

## Rollback Plan

1. Disable nested child rendering behind flag (frontend fallback).
2. Keep parent-based recovery behavior fully functional.
3. Child rows created remain harmless due to parent link metadata.

## Final Acceptance

1. Motion/RFE paid creates child process linked to parent.
2. Child is not a top-level process card.
3. Parent card renders child entries.
4. No duplicate child rows after event replay.
5. Existing COS/EOS recovery UX remains operational.

