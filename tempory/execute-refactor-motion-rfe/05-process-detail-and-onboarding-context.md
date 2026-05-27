# Task 05 — Process Detail and Onboarding Child Context

## Objective

Allow opening recovery child entries while preserving parent process timeline as primary flow.

## Files

- [ProcessDetailPage/index.tsx](/home/vileladev/Projects/aplikei/src/features/process/pages/ProcessDetailPage/index.tsx)
- [COSOnboardingPage/index.tsx](/home/vileladev/Projects/aplikei/src/features/onboarding/cos/pages/COSOnboardingPage/index.tsx)

## Mini Tasks

1. Add optional query context:
   - `childId`
   - `workflowType`
2. Detail page behavior:
   - Resolve parent by existing `id` as before.
   - If `childId` is present, load child record for side panel/history context.
3. Onboarding behavior:
   - Keep parent `proc` as source of truth for steps.
   - Surface child entry metadata in recovery sections for traceability.
4. Keep backward compatibility:
   - Existing links without child context must continue working.

## Conflicts to Resolve

1. Current routes are slug + id oriented to parent.
   - Child context must be additive, not replacing parent routing.
2. Recovery state flags exist on parent `step_data`.
   - Do not move state engine to child in phase 1.

## Exit Gate

1. Opening parent-only link works unchanged.
2. Opening nested child link works and shows child context without breaking flow.

