# Task 05: Payments And Redirects

## Goal

Make successful payments send the customer to the correct next step.

## Scope

- [`src/features/payments/pages/CheckoutSuccessPage/index.tsx`](../../src/features/payments/pages/CheckoutSuccessPage/index.tsx)
- [`src/features/onboarding/cos/pages/COSOnboardingPage/MotionWorkflow.tsx`](../../src/features/onboarding/cos/pages/COSOnboardingPage/MotionWorkflow.tsx)
- [`src/features/onboarding/cos/pages/COSOnboardingPage/RFEWorkflow.tsx`](../../src/features/onboarding/cos/pages/COSOnboardingPage/RFEWorkflow.tsx)

## Work Items

1. After Motion initial payment, redirect to `cos_motion_instruction`.
2. After RFE initial payment, redirect to `cos_rfe_instruction`.
3. Keep `pending_payment_advance` aligned with the paid process.
4. Ensure Motion and RFE payment overlays use the correct slug.

## Acceptance

- Payment success lands on the expected onboarding step.
- No extra step skipping happens after checkout.
- Legacy and new slugs continue to resolve.

