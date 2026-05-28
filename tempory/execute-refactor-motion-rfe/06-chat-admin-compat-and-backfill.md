# Task 06 — Chat/Admin Compatibility and Backfill

## Objective

Protect chat/admin behavior and repair legacy orphan child rows.

## References

- [add_office_id_to_chat_messages.sql](/home/vileladev/Projects/aplikei/supabase/migrations/20260519000004_add_office_id_to_chat_messages.sql)
- [backfill_parent_process_for_standalone_chats.sql](/home/vileladev/Projects/aplikei/supabase/migrations/20260515163000_backfill_parent_process_for_standalone_chats.sql)
- [useCustomerChats.ts](/home/vileladev/Projects/aplikei/src/features/chat/hooks/useCustomerChats.ts)
- [useAdminChats.ts](/home/vileladev/Projects/aplikei/src/features/chat/hooks/useAdminChats.ts)

## Mini Tasks

1. Compatibility verification:
   - Parent-linked children still resolve office/chat context.
2. Admin process checks:
   - Purchases/history panels still render parent-based recovery info.
3. Backfill script (dry-run first):
   - Find auxiliary `user_services` rows missing `step_data.parent_process_id`.
   - Resolve parent from latest paid order metadata.
   - Patch `parent_process_id` and `parent_service_slug`.
4. Add report output:
   - total scanned
   - total patched
   - unresolved rows

## Conflicts to Resolve

1. Some legacy rows may have inconsistent metadata aliases.
   - Try `proc_id`, `processId`, `parent_process_id` in precedence order.
2. Rows with no resolvable parent:
   - Keep untouched and report for manual triage.

## Exit Gate

1. Dry run approved.
2. Backfill execution produces deterministic report.
3. No chat routing regressions detected.

