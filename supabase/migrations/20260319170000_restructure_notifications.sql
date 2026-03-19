-- Restructure Notification System
-- Client <-> Admin Flows and Realtime Alarms

-- 1. Helper function to check if the actor is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    auth.jwt() ->> 'email' IN (
      'info@thefutureofenglish.com',
      'admin@suaiden.com',
      'suaiden@suaiden.com',
      'fernanda@suaiden.com',
      'victuribdev@gmail.com',
      'newvicturibdev@gmail.com',
      'dev01@suaiden.com'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. New Notification Function for user_services
CREATE OR REPLACE FUNCTION public.on_user_service_update_notify()
RETURNS trigger AS $$
DECLARE
  v_client_name text;
  v_service_name text;
  v_is_admin boolean;
  v_old_status text;
  v_new_status text;
BEGIN
  -- Detect if actor is admin
  v_is_admin := public.is_admin();
  
  -- Get client name
  SELECT COALESCE(full_name, 'Cliente') INTO v_client_name 
  FROM public.profiles WHERE id = NEW.user_id;

  -- Format service name for display
  v_service_name := CASE 
    WHEN NEW.service_slug ILIKE '%b1%b2%' THEN 'B1/B2'
    WHEN NEW.service_slug ILIKE '%f1%' THEN 'F-1'
    ELSE UPPER(REPLACE(NEW.service_slug, '-', ' '))
  END;

  v_old_status := COALESCE(OLD.status, 'Novo');
  v_new_status := COALESCE(NEW.status, 'Novo');

  -- CASE 1: Client -> Admin (Non-admin actor updates their own service)
  -- Trigger on status change OR significant data updates
  IF NOT v_is_admin AND (OLD.status IS DISTINCT FROM NEW.status OR OLD.updated_at IS DISTINCT FROM NEW.updated_at) THEN
    INSERT INTO public.notifications (
      user_id,
      target_type,
      title,
      message,
      link
    ) VALUES (
      NULL, -- Admin notification (user_id=NULL so customers don't see it via RLS)
      'admin',
      'Revisão: ' || v_client_name,
      v_client_name || ' atualizou o processo ' || v_service_name || ' (Status: ' || v_new_status || ')',
      '/admin/contratos/' || NEW.id
    );
  END IF;

  -- CASE 2: Admin -> Client (Admin actor updates a client's service)
  IF v_is_admin AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.notifications (
      user_id,
      target_type,
      title,
      message,
      link,
      send_email
    ) VALUES (
      NEW.user_id,
      'user',
      'Atualização: ' || v_service_name,
      'Seu processo teve uma atualização de status: ' || v_new_status,
      '/dashboard/onboarding',
      true
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Apply Trigger
DROP TRIGGER IF EXISTS tr_on_user_service_update ON public.user_services;
CREATE TRIGGER tr_on_user_service_update
AFTER UPDATE ON public.user_services
FOR EACH ROW EXECUTE FUNCTION public.on_user_service_update_notify();

-- 4. Drop old conflicting triggers if they exist
DROP TRIGGER IF EXISTS trigger_log_user_service_notification ON public.user_services;
DROP TRIGGER IF EXISTS on_user_service_status_change ON public.user_services;

-- 5. RLS Policies for Notifications Table
-- Ensure notifications are properly filtered at the database level
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins podem ver todas as notificações de admin" ON public.notifications;
CREATE POLICY "Admins podem ver todas as notificações de admin"
ON public.notifications FOR SELECT
TO authenticated
USING (target_type = 'admin' AND public.is_admin());

DROP POLICY IF EXISTS "Usuários podem ver as próprias notificações" ON public.notifications;
CREATE POLICY "Usuários podem ver as próprias notificações"
ON public.notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND target_type = 'user');

DROP POLICY IF EXISTS "Sistema pode inserir notificações" ON public.notifications;
CREATE POLICY "Sistema pode inserir notificações"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true); -- Triggers use SECURITY DEFINER so they can always insert
