-- Fix trigger functions violating notifications RLS policy
-- By making them SECURITY DEFINER, they run as the trigger creator (superuser)
-- and can insert into notifications where target_type='user'.

ALTER FUNCTION public.log_user_service_notification() SECURITY DEFINER;
ALTER FUNCTION public.log_user_service_status_change() SECURITY DEFINER;
