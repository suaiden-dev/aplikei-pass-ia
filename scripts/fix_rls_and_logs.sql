BEGIN;

-- =====================================================================
-- 1. FIX NOTIFICATIONS RLS
-- O problema: auth.role() foi deprecated no Supabase. A policy de INSERT
-- precisar ser recriada usando a sintaxe correta.
-- =====================================================================

-- Remove as policies antigas que podem estar bloqueando inserts
DROP POLICY IF EXISTS "authenticated_can_insert" ON public.notifications;
DROP POLICY IF EXISTS "owner_can_update_read" ON public.notifications;
DROP POLICY IF EXISTS "admins_can_insert" ON public.notifications;
DROP POLICY IF EXISTS "service_role_full_access" ON public.notifications;

-- Cria policies novas e corretas
-- Qualquer usuário autenticado pode inserir notificações (frontend e funções)
CREATE POLICY "authenticated_can_insert" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Admin pode ver todas as notificações target_role = admin
CREATE POLICY "admins_see_admin_notifications" ON public.notifications
  FOR SELECT USING (
    target_role = 'admin' AND
    EXISTS (
      SELECT 1 FROM public.user_accounts
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Cliente vê suas próprias notificações
CREATE POLICY "clients_see_own_notifications" ON public.notifications
  FOR SELECT USING (
    target_role = 'client' AND user_id = auth.uid()
  );

-- Qualquer autenticado pode marcar como lida
CREATE POLICY "owner_can_update_read" ON public.notifications
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- =====================================================================
-- 2. FIX PROCESS_LOGS RLS
-- A tabela process_logs precisa ser legível pelo admin e escrita
-- pelo sistema (trigger via SECURITY DEFINER não precisa de policy para INSERT)
-- mas SELECT precisa de policy para o admin ver os logs.
-- =====================================================================

DROP POLICY IF EXISTS "admins_can_read_logs" ON public.process_logs;
DROP POLICY IF EXISTS "service_role_can_read_logs" ON public.process_logs;
DROP POLICY IF EXISTS "all_auth_can_read" ON public.process_logs;

-- Admin pode ver todos os logs
CREATE POLICY "admins_can_read_logs" ON public.process_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_accounts
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================================
-- 3. GARANTE QUE A FUNÇÃO QUE POPULA OS LOGS É SECURITY DEFINER
-- (necessário para que o trigger possa inserir mesmo que o usuário
-- logado não tenha permissão direta de INSERT na tabela)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.log_user_service_changes()
RETURNS trigger AS $$
BEGIN
  IF (OLD.current_step IS DISTINCT FROM NEW.current_step) OR (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.process_logs (
      user_service_id,
      previous_step,
      new_step,
      previous_status,
      new_status,
      created_at
    ) VALUES (
      NEW.id,
      OLD.current_step,
      NEW.current_step,
      OLD.status,
      NEW.status,
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recria o gatilho limpo
DROP TRIGGER IF EXISTS log_step_change_trigger ON public.user_services;

CREATE TRIGGER log_step_change_trigger
AFTER UPDATE ON public.user_services
FOR EACH ROW
EXECUTE FUNCTION public.log_user_service_changes();

COMMIT;
