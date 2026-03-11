-- Fix Admin Notifications for Customers
-- Set user_id to NULL for admin notifications to prevent them from appearing in customer dashboards

CREATE OR REPLACE FUNCTION public.log_user_service_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_target_type text;
  v_title text;
  v_message text;
  v_send_email boolean := false;
  v_link text;
  v_client_name text;
  v_user_id uuid;
BEGIN
  -- Only trigger if status actually changed
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    
    -- Fetch client name for admin notifications
    SELECT COALESCE(full_name, 'Cliente') INTO v_client_name 
    FROM profiles 
    WHERE id = NEW.user_id;

    -- Default link
    v_link := '/dashboard/onboarding';

    CASE NEW.status
      -- ADMIN NOTIFICATIONS (Include client name in Title and Message for clarity)
      WHEN 'ds160AwaitingReviewAndSignature', 'review_assign' THEN
        v_target_type := 'admin';
        v_title := 'Revisão: ' || v_client_name;
        v_message := 'O cliente finalizou o formulário DS-160 e aguarda revisão.';
        v_link := '/admin/contratos/' || NEW.id;

      WHEN 'uploadsUnderReview' THEN
        v_target_type := 'admin';
        v_title := 'Docs: ' || v_client_name;
        v_message := 'O cliente anexou novos documentos para análise.';
        v_link := '/admin/contratos/' || NEW.id;

      WHEN 'casvFeeProcessing' THEN
        v_target_type := 'admin';
        v_title := 'Agenda: ' || v_client_name;
        v_message := 'O cliente informou as preferências de agendamento (datas/locais).';
        v_link := '/admin/contratos/' || NEW.id;

      -- CLIENT NOTIFICATIONS (Action-oriented only)
      WHEN 'ds160upload_documents' THEN
        v_target_type := 'user';
        v_title := 'Ação Necessária: Documentos';
        v_message := 'Identificamos que faltam documentos. Faça o upload agora para analisarmos seu processo.';
        v_send_email := true;

      WHEN 'casvSchedulingPending' THEN
        v_target_type := 'user';
        v_title := 'Ação Necessária: Agendamento';
        v_message := 'Por favor, informe suas preferências de data e local para prosseguirmos com o agendamento consular.';
        v_send_email := true;

      WHEN 'casvPaymentPending' THEN
        v_target_type := 'user';
        v_title := 'Ação Necessária: Taxa Consular';
        v_message := 'Pague sua taxa consular e acesse suas credenciais para agendarmos sua entrevista.';
        v_send_email := true;

      WHEN 'awaitingInterview' THEN
        v_target_type := 'user';
        v_title := 'Ação Necessária: Entrevista';
        v_message := 'Prepare-se para a entrevista: revise as orientações e leve os documentos físicos necessários.';
        v_send_email := true;

      WHEN 'rejected' THEN
        v_target_type := 'user';
        v_title := 'Ação Necessária: Pendências';
        v_message := 'Houve um problema com sua solicitação. Corrija as pendências indicadas para continuarmos o processo.';
        v_send_email := true;

      ELSE
        v_target_type := NULL;
    END CASE;

    IF v_target_type IS NOT NULL THEN
      -- If target is admin, we don't associate with NEW.user_id 
      -- to prevent RLS from showing it to the customer
      IF v_target_type = 'admin' THEN
        v_user_id := NULL;
      ELSE
        v_user_id := NEW.user_id;
      END IF;

      INSERT INTO notifications (
        user_id,
        target_type,
        title,
        message,
        link,
        send_email
      ) VALUES (
        v_user_id,
        v_target_type,
        v_title,
        v_message,
        v_link,
        v_send_email
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- Cleanup existing admin notifications that have a user_id
Update public.notifications 
SET user_id = NULL 
WHERE target_type = 'admin' AND user_id IS NOT NULL;
