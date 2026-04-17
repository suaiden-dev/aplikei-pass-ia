-- Limpeza de Triggers Antigos
DROP TRIGGER IF EXISTS log_step_change_trigger ON public.user_services;
DROP TRIGGER IF EXISTS tr_log_user_service_changes ON public.user_services;

-- Função de Log Aprimorada
CREATE OR REPLACE FUNCTION public.log_user_service_changes()
RETURNS trigger AS $$
DECLARE
  v_actor_id   UUID;
  v_actor_name TEXT;
  v_actor_role TEXT;
  v_message    TEXT;
  v_action     TEXT;
BEGIN
  -- SÓ LOGA SE HOUVER MUDANÇA REAL NO PASSO OU NO STATUS
  IF (OLD.current_step IS DISTINCT FROM NEW.current_step) OR (OLD.status IS DISTINCT FROM NEW.status) THEN

    -- 1. Captura o Ator (Quem fez a mudança)
    v_actor_id := auth.uid();
    
    SELECT full_name, role 
      INTO v_actor_name, v_actor_role 
      FROM public.user_accounts 
     WHERE id = v_actor_id;

    -- Fallback para Sistema ou Cliente
    IF v_actor_name IS NULL THEN
      IF v_actor_id IS NULL THEN
         v_actor_name := 'Sistema';
         v_actor_role := 'system';
      ELSE
         SELECT full_name INTO v_actor_name FROM public.user_accounts WHERE id = NEW.user_id;
         v_actor_name := COALESCE(v_actor_name, 'Cliente');
         v_actor_role := 'client';
      END IF;
    END IF;

    -- 2. Constrói a Mensagem Baseada na Ação
    v_action := 'Alteração de Estado';
    
    -- Lógica de Mensagens Humanas
    IF OLD.status != NEW.status THEN
      CASE NEW.status
        WHEN 'awaiting_review' THEN 
          v_message := 'Cliente concluiu o preenchimento e solicitou revisão da equipe.';
          v_action := 'Solicitação de Revisão';
        WHEN 'active' THEN
          IF OLD.status = 'awaiting_review' THEN
            v_message := 'Administrador aprovou a etapa anterior. O processo agora está ativo para a próxima fase.';
            v_action := 'Etapa Aprovada';
          ELSE
            v_message := 'O status do processo foi definido como Ativo.';
          END IF;
        WHEN 'completed' THEN
          v_message := 'Processo finalizado com sucesso! Todas as etapas foram concluídas.';
          v_action := 'Conclusão';
        WHEN 'rejected' THEN
          v_message := 'O processo foi marcado como rejeitado ou ajustes críticos são necessários.';
          v_action := 'Rejeição';
        ELSE
          v_message := 'O status do processo mudou de ' || OLD.status || ' para ' || NEW.status || '.';
      END CASE;
    ELSIF OLD.current_step != NEW.current_step THEN
        v_message := 'Avanço de etapa: de ' || OLD.current_step || ' para ' || NEW.current_step || '.';
        v_action := 'Avanço de Etapa';
    ELSE
        v_message := 'Atualização geral nos dados do processo.';
    END IF;

    -- 3. Inserção do Log Rico
    INSERT INTO public.process_logs (
      user_service_id,
      actor_id,
      actor_name,
      actor_role,
      action,
      message,
      previous_step,
      new_step,
      previous_status,
      new_status,
      details,
      created_at
    ) VALUES (
      NEW.id,
      v_actor_id,
      v_actor_name,
      v_actor_role,
      v_action,
      v_message,
      OLD.current_step,
      NEW.current_step,
      OLD.status,
      NEW.status,
      jsonb_build_object(
        'service_slug', NEW.service_slug,
        'timestamp', NOW()
      ),
      NOW()
    );

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriação do Gatilho
CREATE TRIGGER tr_log_user_service_changes
AFTER UPDATE ON public.user_services
FOR EACH ROW
EXECUTE FUNCTION public.log_user_service_changes();
