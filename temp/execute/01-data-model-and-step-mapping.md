# Task 01: Data Model And Step Mapping

## Goal

Make COS step definitions explicit and stable.

## Scope

- [`src/shared/data/services.ts`](../../src/shared/data/services.ts)
- [`src/shared/data/workflowTemplates.ts`](../../src/shared/data/workflowTemplates.ts)

## Work Items

1. Verify the COS base flow ends at `cos_final_package`.
2. Keep `cos_analysis_form_docs` and `cos_admin_analysis` consistently treated as the initial analysis checkpoint.
3. Keep RFE and Motion templates as the only virtual recovery step definitions.
4. Confirm aliases and IDs used by the UI remain stable.

## Acceptance

- Base COS flow is unchanged and limited to customer-facing base steps.
- RFE/Motion steps exist only in the workflow templates.
- No duplicate or ambiguous COS step IDs remain.

