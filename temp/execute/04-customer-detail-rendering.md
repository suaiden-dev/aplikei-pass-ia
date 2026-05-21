# Task 04: Customer Detail Rendering

## Goal

Make `/dashboard/processes/cos` show the correct timeline and only expose actions that are valid for the current state.

## Scope

- [`src/features/process/pages/ProcessDetailPage/index.tsx`](../../src/features/process/pages/ProcessDetailPage/index.tsx)

## Work Items

1. Map COS `current_step` to the visual list instead of using it directly.
2. Stop future steps from appearing as completed.
3. Show `Visualizar Step` only for current or already completed steps.
4. Keep the initial analysis step accessible to the customer.
5. Keep onboarding deep-links aligned with the correct step index.

## Acceptance

- The customer timeline matches the actual process state.
- No step is marked completed before it is really passed.
- Hidden future steps do not expose a visual action.

