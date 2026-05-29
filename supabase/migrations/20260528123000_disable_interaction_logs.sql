-- Disable interaction logging writes to process_logs.
-- Keep historical data intact, only stop new inserts.

drop trigger if exists tr_log_user_service_changes on public.user_services;
drop trigger if exists tr_log_user_service_status_change on public.user_services;
