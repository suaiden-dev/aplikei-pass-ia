# Task 04 — Process Grouping in Hooks and List UI

## Objective

Display child Motion/RFE processes under parent COS/EOS card, never as top-level cards.

## Files

- [useUserProcesses.ts](/home/vileladev/Projects/aplikei/src/features/process/hooks/useUserProcesses.ts)
- [useMyProcesses.ts](/home/vileladev/Projects/aplikei/src/features/process/hooks/useMyProcesses.ts)
- [MyProcessesPage/index.tsx](/home/vileladev/Projects/aplikei/src/features/process/pages/MyProcessesPage/index.tsx)

## Mini Tasks

1. Build grouping shape:
   - `childrenByParentId: Record<string, UserService[]>`
   - `parentProcesses: UserService[]`
2. Parent classification:
   - Main services or no `step_data.parent_process_id`.
3. Child classification:
   - `step_data.parent_process_id` points to an existing parent of same user.
4. Preserve current top-level filtering for auxiliary slugs, but now surface them as children.
5. UI update:
   - Expandable nested child list under parent card.
   - Child CTA opens parent context and passes child context.

## Conflicts to Resolve

1. Current `isAnalysisSlug` hides all auxiliary rows.
   - Keep hide-at-top-level behavior, re-inject as grouped child.
2. Existing sorting by `created_at` can split parent-child visually.
   - Child ordering should be local under parent.

## Exit Gate

1. Parent card count remains stable.
2. Child rows appear only nested.
3. No duplicate rendering between top-level and nested.

