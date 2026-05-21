# Task 03: Onboarding Routing

## Goal

Make the COS onboarding render the correct step for base, RFE, and Motion flows.

## Scope

- [`src/features/onboarding/cos/pages/COSOnboardingPage/index.tsx`](../../src/features/onboarding/cos/pages/COSOnboardingPage/index.tsx)
- [`src/features/onboarding/cos/pages/COSOnboardingPage/components/COSStepContent.tsx`](../../src/features/onboarding/cos/pages/COSOnboardingPage/components/COSStepContent.tsx)

## Work Items

1. Keep context detection based on `uscis_official_result`, `uscis_rfe_result`, and `current_step`.
2. Map `current_step` to the correct virtual step index for RFE/Motion.
3. Ensure the customer-accessible initial analysis step renders as an open form.
4. Keep fallback UI for locked or unsupported steps.

## Acceptance

- The user sees the correct onboarding step after navigation or payment.
- Base steps do not leak into recovery flows.
- Recovery flows only render when the active context matches.

