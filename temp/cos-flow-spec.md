# COS Flow Stabilization Spec

## Problem Statement

The COS flow is inconsistent because the project currently uses multiple sources of truth for step progression:

- `src/shared/data/services.ts` defines only the base COS steps.
- `src/shared/data/workflowTemplates.ts` defines virtual RFE/Motion steps.
- `step_data.history`, `workflow_status`, and `current_step` are all used to infer progress.
- The onboarding UI and the customer process detail UI map steps differently.
- Payment confirmations can advance the process, but the UI does not always render the expected next step.

This causes:

- steps being marked as completed too early,
- recovery steps being hidden or misordered,
- admin-only steps being shown as customer steps,
- payment-driven transitions landing on the wrong onboarding step,
- incorrect `processNotFound` / "service does not exist" behavior when slug mapping diverges.

## Goal

Make the COS flow deterministic and consistent across:

- onboarding UI,
- customer process detail UI,
- payment / checkout confirmation,
- Supabase edge functions,
- process normalization logic.

The customer should see the correct current step, the correct future steps should remain locked, and recovery flows (RFE/Motion) should appear only when triggered.

## Recommended Approach

Use a single rule set:

- Base COS flow comes from `service.steps` in `src/shared/data/services.ts`.
- RFE and Motion flows come only from `src/shared/data/workflowTemplates.ts`.
- `current_step` remains the database source for the current position.
- `step_data.history` stores recovery cycles and their step lists.
- `workflow_status` and outcome fields decide which virtual flow is active.
- The customer UI maps `current_step` into a visual index instead of using it directly.

## Files To Change

### 1. `src/shared/data/services.ts`

Purpose:

- confirm the COS base flow contains only the customer-facing base steps,
- keep step IDs stable,
- avoid mixing admin review semantics into the base catalog.

Needed work:

- verify the COS base list ends at `cos_final_package`,
- keep `cos_analysis_form_docs` and `cos_admin_analysis` mapped consistently,
- document which steps are customer-facing and which are internal checkpoints.

### 2. `src/shared/data/workflowTemplates.ts`

Purpose:

- define the virtual recovery sequences:
  - RFE: `cos_rfe_explanation` through `cos_rfe_end`
  - Motion: `cos_motion_acquisition` through `cos_motion_end`

Needed work:

- keep these templates as the only source for recovery step labels,
- ensure the step order is explicit and stable,
- avoid duplicate or ambiguous IDs.

### 3. `src/features/process/services/processOps.ts`

Purpose:

- normalize COS progression when loading services,
- advance to the correct step based on outcome flags and payment state,
- maintain `step_data.history` and `negativa`.

Needed work:

- keep `getNormalizedCOSRecoveryStep()` as the only normalization rule,
- ensure Motion payment advances to `cos_motion_instruction` when the initial fee is paid,
- ensure proposal payment advances to `cos_motion_end` only after the proposal step,
- keep `step_data.history` and `negativa` in sync,
- avoid overwriting unrelated `step_data` fields.

### 4. `src/features/onboarding/cos/pages/COSOnboardingPage/index.tsx`

Purpose:

- route the onboarding to the right step,
- compute `currentStepId`,
- infer whether the user is in base, RFE, or Motion context,
- handle result submission and jump-to-step actions.

Needed work:

- keep the context detection based on outcome fields and step range,
- map `current_step` to the correct `stepIdx` for RFE/Motion,
- after payment or result reporting, redirect to the correct onboarding step,
- avoid letting future steps render as if they were already completed.

### 5. `src/features/onboarding/cos/pages/COSOnboardingPage/components/COSStepContent.tsx`

Purpose:

- render the correct UI for each COS step.

Needed work:

- keep `cos_application_form` and `cos_documents` separate,
- render `cos_analysis_form_docs` and `cos_admin_analysis` as the initial customer-accessible analysis step,
- render RFE/Motion branches only when the active context matches,
- keep fallback UI for unsupported or locked steps.

### 6. `src/features/onboarding/cos/pages/COSOnboardingPage/RFEWorkflow.tsx`

Purpose:

- handle the RFE branch UI and payment actions.

Needed work:

- ensure payment success moves the user to the next real RFE step,
- keep proposal/result state transitions consistent with `processOps`,
- avoid using legacy slug names without fallback handling.

### 7. `src/features/onboarding/cos/pages/COSOnboardingPage/MotionWorkflow.tsx`

Purpose:

- handle the Motion branch UI and payment actions.

Needed work:

- initial Motion payment should move to `cos_motion_instruction`,
- proposal payment should move to `cos_motion_end` only when appropriate,
- keep `pending_payment_advance` / redirect logic aligned with backend,
- keep legacy and new slugs compatible:
  - `apoio-rfe-motion-inicio`
  - `analysis-rfe-cos`
  - `analysis-rfe-eos`
  - `proposta-rfe-motion`
  - `consultancy-motion-cos`
  - `consultancy-motion-eos`

### 8. `src/features/process/pages/ProcessDetailPage/index.tsx`

Purpose:

- render the customer process timeline,
- show only the steps that should be visible,
- mark current/completed steps correctly.

Needed work:

- map COS `current_step` to the visual step list,
- prevent future steps from showing as completed,
- only show `Visualizar Step` for current/completed steps,
- keep customer-accessible initial analysis visible,
- ensure the onboarding deep-link uses the correct target step.

### 9. `src/features/payments/pages/CheckoutSuccessPage/index.tsx`

Purpose:

- redirect after successful payment confirmation.

Needed work:

- after Motion initial payment, redirect to onboarding step 20 (`cos_motion_instruction`),
- after RFE initial payment, redirect to onboarding step 14 (`cos_rfe_instruction`),
- preserve localStorage cleanup,
- use the paid process ID from `pending_payment_advance`.

### 10. `supabase/functions/_shared/payments/payment-slot-logic.ts`

Purpose:

- detect paid services,
- update `user_services.current_step`,
- update `step_data`,
- update `negativa`.

Needed work:

- support both legacy and new service slugs,
- when Motion initial payment is detected, set `current_step = 20`,
- when Motion proposal payment is detected, set `current_step = 23` or keep the appropriate progression based on current context,
- keep `negativa.negative.payment.initial/proposal/proposal_amount` in sync,
- keep `step_data.motion_*` flags synchronized.

### 11. `supabase/functions/_shared/payments/application/resolve-catalog-pricing.ts`

Purpose:

- resolve price for checkout.

Needed work:

- use `services_prices` first,
- fallback to `services` when the service is not in `services_prices`,
- support the new COS/Motion/RFE slugs.

### 12. `supabase/functions/_shared/payments/domain/catalog.ts`

Purpose:

- define slug aliases and fallback prices.

Needed work:

- keep aliases for old and new slugs,
- include Motion and RFE fallbacks,
- ensure dependent service IDs match actual catalog slugs.

## Expected Behavior After Fix

- COS base flow works from step 0 to `cos_final_package`.
- When the user is denied, Motion starts at `cos_motion_acquisition`.
- After the first Motion payment, the customer lands on `cos_motion_instruction`.
- After the proposal payment, the customer moves to the final Motion step.
- RFE behaves analogously with its own branch.
- Customer timeline shows only the steps that are actually available or already completed.
- No future COS step appears as completed before it is done.

## Validation Checklist

- Confirm a fresh COS process renders steps 0 to 11 correctly.
- Confirm `final_package` opens the result selector.
- Confirm denial creates the Motion recovery object in `negativa`.
- Confirm Motion initial payment updates both backend state and UI to step 20.
- Confirm the customer detail page only shows `Visualizar Step` for current/completed steps.
- Confirm RFE and Motion branches do not leak into the base flow before they are triggered.

## Notes

- The current tests are not reliable for this issue because the flow is split across UI, process normalization, and payment confirmation.
- The safest implementation path is to first align the data model and step mapping, then reintroduce tests only for pure mapping functions.

