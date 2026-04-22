CREATE OR REPLACE FUNCTION public.create_notification(p_notification jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO public.notifications (
    type,
    target_role,
    user_id,
    service_id,
    title,
    message,
    link,
    is_read,
    send_email,
    email_sent,
    metadata
  )
  VALUES (
    COALESCE(p_notification->>'type', 'system'),
    COALESCE(p_notification->>'target_role', p_notification->>'target_type', 'client'),
    NULLIF(p_notification->>'user_id', '')::uuid,
    NULLIF(p_notification->>'service_id', '')::uuid,
    COALESCE(p_notification->>'title', ''),
    COALESCE(p_notification->>'message', p_notification->>'body'),
    NULLIF(p_notification->>'link', ''),
    COALESCE((p_notification->>'is_read')::boolean, false),
    COALESCE((p_notification->>'send_email')::boolean, false),
    COALESCE((p_notification->>'email_sent')::boolean, false),
    COALESCE(p_notification->'metadata', '{}'::jsonb)
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_notification(jsonb) TO authenticated;
