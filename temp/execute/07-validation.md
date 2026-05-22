cl# Task 07: Validation

## Goal

Validate the COS flow manually until tests can be reintroduced.

## Scope

- Manual app checks
- Database checks

## Work Items

1. Verify a fresh COS process from step 0 to `cos_final_package`.
2. Verify denial creates `negativa` and starts Motion.
3. Verify Motion initial payment moves the customer to instruction.
4. Verify RFE behaves with the same pattern.
5. Verify the customer timeline does not mark future steps as done.

## Acceptance

- The flow is stable in the browser.
- The customer and onboarding views agree on the active step.
- Tests can later be added only for pure mapping/normalization functions.

