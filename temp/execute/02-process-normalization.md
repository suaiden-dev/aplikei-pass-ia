# Task 02: Process Normalization

## Goal

Normalize COS progression from backend state instead of UI guesses.

## Scope

- [`src/features/process/services/processOps.ts`](../../src/features/process/services/processOps.ts)

## Work Items

1. Keep `getNormalizedCOSRecoveryStep()` as the single normalization rule.
2. Make Motion initial payment land on `cos_motion_instruction`.
3. Make Motion proposal payment land on the correct recovery step only after the proposal stage.
4. Keep `step_data.history` and `negativa` synchronized.
5. Avoid overwriting unrelated `step_data` fields.

## Acceptance

- Loading a COS process does not skip or duplicate recovery steps.
- `current_step` is only advanced when the backend state justifies it.
- `negativa` contains the payment state expected by the UI.

