# Task 01 — Baseline and Safety Checks

## Objective

Create a safe baseline before refactor and define non-negotiable invariants.

## References

- [spec-refactor-cos-eos-motion-rfe-parent-card.md](/home/vileladev/Projects/aplikei/tempory/spec-refactor-cos-eos-motion-rfe-parent-card.md)
- [payment-slot-logic.ts](/home/vileladev/Projects/aplikei/supabase/functions/_shared/payments/payment-slot-logic.ts)
- [useMyProcesses.ts](/home/vileladev/Projects/aplikei/src/features/process/hooks/useMyProcesses.ts)

## Mini Tasks

1. Snapshot current behavior:
   - Payment success paths (Stripe verify, Zelle validate, webhook fallback).
   - My Processes top-level filtering.
2. Define invariants in PR description and tests:
   - No duplicate child `user_services`.
   - Parent process still advances.
   - Auxiliary slugs remain hidden as top-level cards.
3. Add temporary structured logs (backend):
   - Parent resolution input/output.
   - Idempotency match hit/miss.

## Conflicts to Resolve

1. Existing logic already inserts standalone rows for unresolved parent.
   - Keep behavior, but tag these rows with clear metadata for backfill.
2. Existing parent purchase mirror and workflow flags are relied upon by UI.
   - Do not remove in phase 1.

## Exit Gate

1. Invariants documented and approved.
2. Baseline logs/tests available before changing behavior.

