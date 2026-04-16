-- Atualiza a função do trigger para capturar o ator autenticado e seu nome/role
-- O Supabase injeta auth.uid() no contexto da sessão, mesmo dentro de triggers SECURITY DEFINER

CREATE OR REPLACE FUNCTION public.log_user_service_changes()
RETURNS trigger AS $$
DECLARE
  v_actor_id   UUID;
  v_actor_name TEXT;
  v_actor_role TEXT;
BEGIN
  IF (OLD.current_step IS DISTINCT FROM NEW.current_step) OR (OLD.status IS DISTINCT FROM NEW.status) THEN

    -- Captura o usuário autenticado no momento da alteração
    v_actor_id := auth.uid();

    -- Busca nome completo e role desse usuário
    SELECT full_name, role
      INTO v_actor_name, v_actor_role
      FROM public.user_accounts
     WHERE id = v_actor_id;

    -- Se não encontrou (ex: chamada via service_role), tenta fallback pelo owner do serviço
    IF v_actor_name IS NULL THEN
      SELECT ua.full_name, ua.role
        INTO v_actor_name, v_actor_role
        FROM public.user_accounts ua
       WHERE ua.id = NEW.user_id;
      v_actor_role := 'client'; -- fallback seguro
    END IF;

    INSERT INTO public.process_logs (
      user_service_id,
      actor_id,
      actor_name,
      actor_role,
      previous_step,
      new_step,
      previous_status,
      new_status,
      created_at
    ) VALUES (
      NEW.id,
      v_actor_id,
      COALESCE(v_actor_name, 'Sistema'),
      COALESCE(v_actor_role, 'client'),
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

-- Recria o gatilho para garantir que está ativo
DROP TRIGGER IF EXISTS log_step_change_trigger ON public.user_services;

CREATE TRIGGER log_step_change_trigger
AFTER UPDATE ON public.user_services
FOR EACH ROW
EXECUTE FUNCTION public.log_user_service_changes();
