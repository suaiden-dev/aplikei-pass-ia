-- Migration: Fix notify_send_email trigger to include Authorization header
-- This resolves the 401 Unauthorized gateway error when pg_net calls the send-notification-email edge function.

CREATE OR REPLACE FUNCTION public.notify_send_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.send_email = true THEN
    PERFORM net.http_post(
      url:='https://nkhblkilekfpqhyuhrrj.supabase.co/functions/v1/send-notification-email',
      headers:=jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5raGJsa2lsZWtmcHFoeXVocnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MjA4NTMsImV4cCI6MjA4NzA5Njg1M30.s2jlTWc0u4xMRiIjG4GsFMulKPGfFoX232vq_4ol0Wc'
      ),
      body:=jsonb_build_object('type', TG_OP, 'table', TG_TABLE_NAME, 'record', row_to_json(NEW))
    );
  END IF;
  RETURN NEW;
END;
$function$
;
