# Execute Refactor Motion/RFE (COS/EOS)

## Goal

Execute the spec at [spec-refactor-cos-eos-motion-rfe-parent-card.md](/home/vileladev/Projects/aplikei/tempory/spec-refactor-cos-eos-motion-rfe-parent-card.md) safely, with phased delivery, conflict handling, and regression protection.

## Execution Order (mandatory)

1. `01-baseline-and-safety-checks.md`
2. `02-backend-payment-slot-logic.md`
3. `03-edge-metadata-hardening.md`
4. `04-process-grouping-hooks-and-list.md`
5. `05-process-detail-and-onboarding-context.md`
6. `06-chat-admin-compat-and-backfill.md`
7. `07-test-plan-and-release-gates.md`

Do not reorder. Each task has explicit stop gates.

## Global Constraints

1. Keep parent process (`troca-status` / `extensao-status`) as timeline source of truth.
2. Child process creation must be idempotent.
3. Do not break current `step_data.purchases` semantics.
4. Do not expose auxiliary slugs as top-level cards.
5. All payment providers must converge to the same behavior through shared fulfillment logic.

## Risk Controls (must be enforced in code review)

1. Duplicate child rows: blocked by purchase reference idempotency query.
2. Parent resolution failures: fallback resolution + structured logs + safe no-crash behavior.
3. UI regressions on process listing: parent-first grouping only after child map validation.
4. Recovery step regressions: preserve current auto-advance logic on parent row.

## Definition of Done (program-level)

1. Paid Motion/RFE creates child `user_services` linked to parent via metadata.
2. Parent card shows child entries; child does not become top-level row.
3. Parent recovery flow still progresses as before.
4. Repeated verify/webhook calls do not duplicate children.
5. Customer/admin chat and process pages continue functional.

## Suggested PR Split

1. PR-A: backend shared payment logic + tests.
2. PR-B: edge metadata hardening + guard logs.
3. PR-C: hooks/list grouping + UI nested child cards.
4. PR-D: detail/onboarding child context + compatibility checks.
5. PR-E: backfill script + rollout docs.

## Task Files

- [01-baseline-and-safety-checks.md](/home/vileladev/Projects/aplikei/tempory/execute-refactor-motion-rfe/01-baseline-and-safety-checks.md)
- [02-backend-payment-slot-logic.md](/home/vileladev/Projects/aplikei/tempory/execute-refactor-motion-rfe/02-backend-payment-slot-logic.md)
- [03-edge-metadata-hardening.md](/home/vileladev/Projects/aplikei/tempory/execute-refactor-motion-rfe/03-edge-metadata-hardening.md)
- [04-process-grouping-hooks-and-list.md](/home/vileladev/Projects/aplikei/tempory/execute-refactor-motion-rfe/04-process-grouping-hooks-and-list.md)
- [05-process-detail-and-onboarding-context.md](/home/vileladev/Projects/aplikei/tempory/execute-refactor-motion-rfe/05-process-detail-and-onboarding-context.md)
- [06-chat-admin-compat-and-backfill.md](/home/vileladev/Projects/aplikei/tempory/execute-refactor-motion-rfe/06-chat-admin-compat-and-backfill.md)
- [07-test-plan-and-release-gates.md](/home/vileladev/Projects/aplikei/tempory/execute-refactor-motion-rfe/07-test-plan-and-release-gates.md)
- [backfill-recovery-children-parent-link.sql](/home/vileladev/Projects/aplikei/tempory/execute-refactor-motion-rfe/backfill-recovery-children-parent-link.sql)
