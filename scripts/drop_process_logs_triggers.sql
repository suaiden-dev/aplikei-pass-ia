BEGIN;

-- This script will remove any leftover database triggers or functions that are trying to interact with the dropped 'process_logs' table.

DROP TRIGGER IF EXISTS log_step_change_trigger ON "public"."user_services";
DROP TRIGGER IF EXISTS trg_process_logs ON "public"."user_services";
DROP TRIGGER IF EXISTS process_logs_insert ON "public"."user_services";

DROP FUNCTION IF EXISTS log_user_service_changes() CASCADE;
DROP FUNCTION IF EXISTS handle_process_logs() CASCADE;
DROP FUNCTION IF EXISTS trg_log_process_changes() CASCADE;

COMMIT;
