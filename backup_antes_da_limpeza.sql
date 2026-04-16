


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."process_service_status" AS ENUM (
    'pending',
    'paid',
    'in_progress',
    'delivered',
    'approved',
    'denied'
);


ALTER TYPE "public"."process_service_status" OWNER TO "postgres";


CREATE TYPE "public"."process_service_type" AS ENUM (
    'MAIN',
    'RFE',
    'MOTION'
);


ALTER TYPE "public"."process_service_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.user_accounts (id, full_name, phone_number)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone_number', '')
  );
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_process_service_payment"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE parent_slug TEXT; prefix TEXT;
BEGIN
  IF NEW.status <> 'paid' OR OLD.status = 'paid' THEN RETURN NEW; END IF;
  SELECT service_slug INTO parent_slug FROM user_services WHERE id = NEW.process_id;
  prefix := CASE WHEN parent_slug = 'extensao-status' THEN 'EOS' ELSE 'COS' END;
  IF NEW.service_type = 'RFE' THEN
    UPDATE user_services SET status = prefix || '_RFE_IN_PROGRESS' WHERE id = NEW.process_id;
  ELSIF NEW.service_type = 'MOTION' THEN
    UPDATE user_services SET status = prefix || '_MOTION_IN_PROGRESS' WHERE id = NEW.process_id;
  END IF;
  RETURN NEW;
END; $$;


ALTER FUNCTION "public"."handle_process_service_payment"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_status_notification"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Verifica se o user_id existe antes de tentar inserir a notificação
    IF NEW.user_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, title, message, type, read)
        VALUES (
            NEW.user_id, 
            'Atualização de Status', 
            'Seu processo mudou para: ' || NEW.status, 
            'status_update', 
            false
        );
    END IF;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Silencia o erro para não travar a atualização principal do serviço
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_status_notification"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  select exists (
    select 1 from public.user_accounts
    where id = auth.uid() and role = 'admin'
  );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_user_service_notification"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Só tenta inserir se o user_id for um UUID válido e não nulo
  IF (NEW.user_id IS NOT NULL) THEN
    BEGIN
      -- Tenta inserir a notificação na tabela notifications
      -- Se a tabela de notificações tiver uma coluna de user_id que referencia auth.users,
      -- este bloco vai garantir que o erro de chave estrangeira não trave o sistema.
      INSERT INTO public.notifications (
        user_id, 
        title, 
        message, 
        type, 
        read
      )
      VALUES (
        NEW.user_id, 
        'Atualização do Processo', 
        'O status do seu visto foi alterado para: ' || NEW.status, 
        'status_update', 
        false
      );
    EXCEPTION 
      WHEN foreign_key_violation THEN
        -- Se o user_id não existir na tabela de usuários de destino, ignoramos silenciosamente
        -- para que o status do visto seja atualizado mesmo assim.
        RAISE WARNING 'Aviso: Notificação ignorada pois o user_id % não foi encontrado.', NEW.user_id;
        RETURN NEW;
      WHEN OTHERS THEN
        -- Captura qualquer outro erro inesperado e permite o progresso do sistema
        RETURN NEW;
    END;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."log_user_service_notification"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_user_service_status_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_actor_name text;
BEGIN
  -- Only log if status actually changed
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    
    -- Try to get the name of the user making the change
    IF auth.uid() IS NOT NULL THEN
      SELECT full_name INTO v_actor_name FROM profiles WHERE id = auth.uid();
    END IF;
    
    IF v_actor_name IS NULL THEN
      v_actor_name := 'Sistema';
    END IF;

    -- Insert log entry
    INSERT INTO process_logs (
      user_service_id,
      actor_id,
      actor_name,
      action_type,
      previous_status,
      new_status
    ) VALUES (
      NEW.id,
      auth.uid(),
      v_actor_name,
      'status_change',
      OLD.status,
      NEW.status
    );
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."log_user_service_status_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_send_email"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  IF NEW.send_email = true THEN
    PERFORM net.http_post(
      url:='https://nkhblkilekfpqhyuhrrj.supabase.co/functions/v1/send-notification-email',
      body:=jsonb_build_object('type', TG_OP, 'table', TG_TABLE_NAME, 'record', row_to_json(NEW))
    );
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_send_email"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_process_services_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;


ALTER FUNCTION "public"."update_process_services_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_coupon"("p_code" "text", "p_slug" "text" DEFAULT NULL::"text") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  coupon RECORD;
BEGIN
  SELECT * INTO coupon FROM public.discount_coupons
  WHERE code = UPPER(TRIM(p_code))
    AND is_active = true
    AND expires_at > now()
    AND (max_uses IS NULL OR uses_count < max_uses);

  IF NOT FOUND THEN
    RETURN json_build_object('valid', false, 'error', 'INVALID_OR_EXPIRED');
  END IF;

  IF coupon.applicable_slugs IS NOT NULL AND p_slug IS NOT NULL
     AND NOT (p_slug = ANY(coupon.applicable_slugs)) THEN
    RETURN json_build_object('valid', false, 'error', 'NOT_APPLICABLE');
  END IF;

  RETURN json_build_object(
    'valid', true,
    'coupon_id', coupon.id,
    'discount_type', coupon.discount_type,
    'discount_value', coupon.discount_value,
    'min_purchase_usd', coupon.min_purchase_usd
  );
END;
$$;


ALTER FUNCTION "public"."validate_coupon"("p_code" "text", "p_slug" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."chat_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "chat_messages_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'assistant'::"text"])))
);


ALTER TABLE "public"."chat_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cos_recovery_cases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_service_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "explanation" "text",
    "document_urls" "text"[] DEFAULT '{}'::"text"[],
    "submitted_at" timestamp with time zone DEFAULT "now"(),
    "admin_analysis" "text",
    "proposal_value_usd" numeric(10,2),
    "proposal_sent_at" timestamp with time zone,
    "admin_notes" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "admin_final_message" "text",
    "final_document_urls" "text"[] DEFAULT '{}'::"text"[],
    "recovery_type" "text" DEFAULT 'rfe'::"text",
    "last_payment_id" "text"
);


ALTER TABLE "public"."cos_recovery_cases" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."discount_coupons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "discount_type" "text" NOT NULL,
    "discount_value" numeric NOT NULL,
    "max_uses" integer,
    "uses_count" integer DEFAULT 0 NOT NULL,
    "applicable_slugs" "text"[],
    "min_purchase_usd" numeric DEFAULT 0,
    "expires_at" timestamp with time zone NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    CONSTRAINT "discount_coupons_discount_type_check" CHECK (("discount_type" = ANY (ARRAY['percentage'::"text", 'fixed'::"text"]))),
    CONSTRAINT "discount_coupons_discount_value_check" CHECK (("discount_value" > (0)::numeric))
);


ALTER TABLE "public"."discount_coupons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "user_service_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "storage_path" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "feedback" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "bucket_id" "text" DEFAULT 'documents'::"text",
    CONSTRAINT "documents_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'received'::"text", 'approved'::"text", 'resubmit'::"text"])))
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."individual_fee_payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "fee_type" "text" NOT NULL,
    "payment_method" "text" NOT NULL,
    "payment_id" "uuid",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "individual_fee_payments_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'paid'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."individual_fee_payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "target_role" "text" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "link" "text",
    "is_read" boolean DEFAULT false NOT NULL,
    "send_email" boolean DEFAULT false NOT NULL,
    "email_sent" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "notifications_target_type_check" CHECK (("target_role" = ANY (ARRAY['user'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."onboarding_responses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_service_id" "uuid" NOT NULL,
    "step_slug" "text" NOT NULL,
    "data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."onboarding_responses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."process_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_service_id" "uuid" NOT NULL,
    "action_type" "text" NOT NULL,
    "previous_status" "text",
    "new_status" "text",
    "actor_name" "text" DEFAULT 'Sistema'::"text" NOT NULL,
    "actor_id" "uuid",
    "note" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."process_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."process_services" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "process_id" "uuid" NOT NULL,
    "service_type" "public"."process_service_type" DEFAULT 'MAIN'::"public"."process_service_type" NOT NULL,
    "status" "public"."process_service_status" DEFAULT 'pending'::"public"."process_service_status" NOT NULL,
    "payment_ref" "text",
    "amount_usd" numeric(10,2),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."process_services" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "email" "text",
    "whatsapp" "text",
    "avatar_url" "text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "phone" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."services_prices" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "service_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "currency" "text" DEFAULT 'USD'::"text",
    "is_active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."services_prices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_accounts" (
    "id" "uuid" NOT NULL,
    "full_name" "text" NOT NULL,
    "phone_number" "text",
    "avatar_url" "text",
    "role" "text" DEFAULT 'customer'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "email" "text",
    "passport_photo_url" "text",
    CONSTRAINT "user_accounts_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'customer'::"text"])))
);


ALTER TABLE "public"."user_accounts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_services" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "service_slug" "text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "current_step" integer DEFAULT 0,
    "application_id" "text",
    "date_of_birth" "text",
    "grandmother_name" "text",
    "consular_login" "text",
    "consular_password" "text",
    "interview_date" "date",
    "interview_time" time without time zone,
    "interview_location_casv" "text",
    "interview_location_consulate" "text",
    "specialist_training_data" "jsonb",
    "consulate_interview_date" "text",
    "consulate_interview_time" "text",
    "same_location" boolean DEFAULT true,
    "specialist_review_data" "jsonb",
    "is_second_attempt" boolean DEFAULT false,
    "admin_notes" "text",
    "admin_review_data" "jsonb" DEFAULT '{}'::"jsonb",
    "service_metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "data" "jsonb" DEFAULT '{}'::"jsonb",
    "step_data" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "user_services_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'active'::"text", 'awaiting_review'::"text", 'completed'::"text", 'cancelled'::"text", 'casvPaymentPending'::"text", 'awaitingInterview'::"text", 'casvFeeProcessing'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."user_services" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_services" IS 'Tabela que armazena os serviços contratados pelos usuários e seus status.';



COMMENT ON COLUMN "public"."user_services"."consular_login" IS 'Login do portal consular fornecido pelo admin';



COMMENT ON COLUMN "public"."user_services"."consular_password" IS 'Senha do portal consular fornecida pelo admin';



COMMENT ON COLUMN "public"."user_services"."interview_date" IS 'Data da entrevista marcada pelo admin';



COMMENT ON COLUMN "public"."user_services"."interview_time" IS 'Horário da entrevista marcada pelo admin';



COMMENT ON COLUMN "public"."user_services"."interview_location_casv" IS 'Localização do CASV';



COMMENT ON COLUMN "public"."user_services"."interview_location_consulate" IS 'Localização do Consulado';



CREATE SEQUENCE IF NOT EXISTS "public"."visa_order_number_seq"
    START WITH 1000
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."visa_order_number_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."visa_orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_number" "text" DEFAULT ('APL-'::"text" || ("nextval"('"public"."visa_order_number_seq"'::"regclass"))::"text"),
    "user_id" "uuid",
    "client_name" "text" NOT NULL,
    "client_email" "text" NOT NULL,
    "product_slug" "text" NOT NULL,
    "total_price_usd" numeric(10,2) NOT NULL,
    "total_price_brl" numeric(10,2),
    "exchange_rate" numeric(10,3),
    "payment_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "payment_method" "text" NOT NULL,
    "stripe_session_id" "text",
    "payment_metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "is_test" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "parcelow_order_id" "text",
    "contract_selfie_url" "text",
    "terms_accepted_at" timestamp with time zone,
    "client_ip" "text",
    "contract_pdf_url" "text",
    "coupon_code" "text",
    "discount_amount" numeric DEFAULT 0,
    CONSTRAINT "visa_orders_payment_status_check" CHECK (("payment_status" = ANY (ARRAY['pending'::"text", 'paid'::"text", 'failed'::"text", 'refunded'::"text"])))
);


ALTER TABLE "public"."visa_orders" OWNER TO "postgres";


COMMENT ON COLUMN "public"."visa_orders"."parcelow_order_id" IS 'Store the Order ID returned by the Parcelow API for webhook tracking';



COMMENT ON COLUMN "public"."visa_orders"."contract_selfie_url" IS 'URL pública da selfie com passaporte enviada no checkout';



COMMENT ON COLUMN "public"."visa_orders"."terms_accepted_at" IS 'Timestamp do aceite dos termos pelo cliente';



COMMENT ON COLUMN "public"."visa_orders"."client_ip" IS 'IP do cliente no momento do checkout';



COMMENT ON COLUMN "public"."visa_orders"."contract_pdf_url" IS 'URL do PDF do contrato gerado após confirmação do pagamento';



COMMENT ON COLUMN "public"."visa_orders"."coupon_code" IS 'Código do cupom aplicado na compra';



COMMENT ON COLUMN "public"."visa_orders"."discount_amount" IS 'Valor total do desconto em USD';



CREATE TABLE IF NOT EXISTS "public"."zelle_payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "amount" numeric(10,2) NOT NULL,
    "confirmation_code" "text",
    "payment_date" "date" DEFAULT CURRENT_DATE,
    "recipient_name" "text",
    "recipient_email" "text",
    "status" "text" DEFAULT 'pending_verification'::"text" NOT NULL,
    "proof_path" "text",
    "admin_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "service_slug" "text",
    "admin_approved_at" timestamp with time zone,
    "fee_type_global" "text",
    "image_url" "text",
    "processed_by_user_id" "uuid",
    "n8n_confidence" double precision,
    "n8n_response" "text",
    "guest_name" "text",
    "guest_email" "text",
    "payment_method" "text" DEFAULT 'zelle'::"text",
    "visa_order_id" "uuid",
    "coupon_code" "text",
    "discount_amount" numeric(10,2),
    CONSTRAINT "zelle_payments_status_check" CHECK (("status" = ANY (ARRAY['pending_verification'::"text", 'approved'::"text", 'rejected'::"text"])))
);

ALTER TABLE ONLY "public"."zelle_payments" REPLICA IDENTITY FULL;


ALTER TABLE "public"."zelle_payments" OWNER TO "postgres";


COMMENT ON COLUMN "public"."zelle_payments"."visa_order_id" IS 'Referência direta à visa_order gerada no checkout';



COMMENT ON COLUMN "public"."zelle_payments"."coupon_code" IS 'Código do cupom aplicado na compra';



COMMENT ON COLUMN "public"."zelle_payments"."discount_amount" IS 'Valor total do desconto em USD';



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cos_recovery_cases"
    ADD CONSTRAINT "cos_recovery_cases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."discount_coupons"
    ADD CONSTRAINT "discount_coupons_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."discount_coupons"
    ADD CONSTRAINT "discount_coupons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."individual_fee_payments"
    ADD CONSTRAINT "individual_fee_payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."onboarding_responses"
    ADD CONSTRAINT "onboarding_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."process_logs"
    ADD CONSTRAINT "process_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."process_services"
    ADD CONSTRAINT "process_services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."process_services"
    ADD CONSTRAINT "process_services_process_id_service_type_key" UNIQUE ("process_id", "service_type");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."services_prices"
    ADD CONSTRAINT "services_prices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."services_prices"
    ADD CONSTRAINT "services_prices_service_id_key" UNIQUE ("service_id");



ALTER TABLE ONLY "public"."onboarding_responses"
    ADD CONSTRAINT "unique_service_step" UNIQUE ("user_service_id", "step_slug");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "unique_user_doc_name" UNIQUE ("user_id", "name");



ALTER TABLE ONLY "public"."user_accounts"
    ADD CONSTRAINT "user_accounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_services"
    ADD CONSTRAINT "user_services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."visa_orders"
    ADD CONSTRAINT "visa_orders_order_number_key" UNIQUE ("order_number");



ALTER TABLE ONLY "public"."visa_orders"
    ADD CONSTRAINT "visa_orders_parcelow_order_id_key" UNIQUE ("parcelow_order_id");



ALTER TABLE ONLY "public"."visa_orders"
    ADD CONSTRAINT "visa_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."visa_orders"
    ADD CONSTRAINT "visa_orders_stripe_session_id_key" UNIQUE ("stripe_session_id");



ALTER TABLE ONLY "public"."zelle_payments"
    ADD CONSTRAINT "zelle_payments_confirmation_code_key" UNIQUE ("confirmation_code");



ALTER TABLE ONLY "public"."zelle_payments"
    ADD CONSTRAINT "zelle_payments_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "documents_user_id_name_idx" ON "public"."documents" USING "btree" ("user_id", "name");



CREATE INDEX "idx_cos_recovery_user_id" ON "public"."cos_recovery_cases" USING "btree" ("user_id");



CREATE INDEX "idx_cos_recovery_user_service" ON "public"."cos_recovery_cases" USING "btree" ("user_service_id");



CREATE INDEX "idx_process_logs_service" ON "public"."process_logs" USING "btree" ("user_service_id", "created_at" DESC);



CREATE OR REPLACE TRIGGER "on_process_service_paid" AFTER UPDATE ON "public"."process_services" FOR EACH ROW EXECUTE FUNCTION "public"."handle_process_service_payment"();



CREATE OR REPLACE TRIGGER "set_process_services_updated_at" BEFORE UPDATE ON "public"."process_services" FOR EACH ROW EXECUTE FUNCTION "public"."update_process_services_updated_at"();



CREATE OR REPLACE TRIGGER "tr_log_user_service_notification" AFTER UPDATE OF "status" ON "public"."user_services" FOR EACH ROW EXECUTE FUNCTION "public"."log_user_service_notification"();



CREATE OR REPLACE TRIGGER "tr_log_user_service_status_change" AFTER UPDATE ON "public"."user_services" FOR EACH ROW EXECUTE FUNCTION "public"."log_user_service_status_change"();



CREATE OR REPLACE TRIGGER "tr_send_notification_email" AFTER INSERT ON "public"."notifications" FOR EACH ROW EXECUTE FUNCTION "public"."notify_send_email"();



CREATE OR REPLACE TRIGGER "update_visa_orders_updated_at" BEFORE UPDATE ON "public"."visa_orders" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "user_accounts_set_updated_at" BEFORE UPDATE ON "public"."user_accounts" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."discount_coupons"
    ADD CONSTRAINT "discount_coupons_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_user_service_id_fkey" FOREIGN KEY ("user_service_id") REFERENCES "public"."user_services"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."individual_fee_payments"
    ADD CONSTRAINT "individual_fee_payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."onboarding_responses"
    ADD CONSTRAINT "onboarding_responses_user_service_id_fkey" FOREIGN KEY ("user_service_id") REFERENCES "public"."user_services"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."process_logs"
    ADD CONSTRAINT "process_logs_user_service_id_fkey" FOREIGN KEY ("user_service_id") REFERENCES "public"."user_services"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."process_services"
    ADD CONSTRAINT "process_services_process_id_fkey" FOREIGN KEY ("process_id") REFERENCES "public"."user_services"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_accounts"
    ADD CONSTRAINT "user_accounts_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_services"
    ADD CONSTRAINT "user_services_account_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_accounts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."visa_orders"
    ADD CONSTRAINT "visa_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_accounts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."zelle_payments"
    ADD CONSTRAINT "zelle_payments_processed_by_user_id_fkey" FOREIGN KEY ("processed_by_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."zelle_payments"
    ADD CONSTRAINT "zelle_payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_accounts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."zelle_payments"
    ADD CONSTRAINT "zelle_payments_visa_order_id_fkey" FOREIGN KEY ("visa_order_id") REFERENCES "public"."visa_orders"("id");



CREATE POLICY "Admin can select visa_orders" ON "public"."visa_orders" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_accounts"
  WHERE (("user_accounts"."id" = "auth"."uid"()) AND ("user_accounts"."role" = 'admin'::"text")))));



CREATE POLICY "Admin can update services_prices" ON "public"."services_prices" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_accounts"
  WHERE (("user_accounts"."id" = "auth"."uid"()) AND ("user_accounts"."role" = 'admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_accounts"
  WHERE (("user_accounts"."id" = "auth"."uid"()) AND ("user_accounts"."role" = 'admin'::"text")))));



CREATE POLICY "Admin can update visa_orders" ON "public"."visa_orders" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_accounts"
  WHERE (("user_accounts"."id" = "auth"."uid"()) AND ("user_accounts"."role" = 'admin'::"text")))));



CREATE POLICY "Admin e donos podem ver pedidos" ON "public"."visa_orders" FOR SELECT USING (true);



CREATE POLICY "Admin full access" ON "public"."discount_coupons" USING ((EXISTS ( SELECT 1
   FROM "public"."user_accounts"
  WHERE (("user_accounts"."id" = "auth"."uid"()) AND ("user_accounts"."role" = 'admin'::"text")))));



CREATE POLICY "Admins and owners can update recovery cases" ON "public"."cos_recovery_cases" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "user_id") OR "public"."is_admin"())) WITH CHECK ((("auth"."uid"() = "user_id") OR "public"."is_admin"()));



CREATE POLICY "Admins and owners can view recovery cases" ON "public"."cos_recovery_cases" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "user_id") OR "public"."is_admin"()));



CREATE POLICY "Admins and service role full access" ON "public"."zelle_payments" TO "authenticated", "service_role" USING ((((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "Admins can do everything" ON "public"."user_services" USING ((EXISTS ( SELECT 1
   FROM "public"."user_accounts"
  WHERE (("user_accounts"."id" = "auth"."uid"()) AND ("user_accounts"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can manage all documents" ON "public"."documents" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can see all services" ON "public"."user_services" FOR SELECT TO "authenticated" USING ((( SELECT "user_accounts"."role"
   FROM "public"."user_accounts"
  WHERE ("user_accounts"."id" = "auth"."uid"())) = 'admin'::"text"));



CREATE POLICY "Admins can update all profiles" ON "public"."user_accounts" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can update all user services" ON "public"."user_services" FOR UPDATE TO "authenticated" USING ((("auth"."jwt"() ->> 'email'::"text") = ANY (ARRAY['info@thefutureofenglish.com'::"text", 'admin@suaiden.com'::"text", 'suaiden@suaiden.com'::"text", 'fernanda@suaiden.com'::"text", 'victuribdev@gmail.com'::"text", 'newvicturibdev@gmail.com'::"text", 'dev01@suaiden.com'::"text"]))) WITH CHECK ((("auth"."jwt"() ->> 'email'::"text") = ANY (ARRAY['info@thefutureofenglish.com'::"text", 'admin@suaiden.com'::"text", 'suaiden@suaiden.com'::"text", 'fernanda@suaiden.com'::"text", 'victuribdev@gmail.com'::"text", 'newvicturibdev@gmail.com'::"text", 'dev01@suaiden.com'::"text"])));



CREATE POLICY "Admins can view all logs" ON "public"."process_logs" FOR SELECT USING ((("auth"."jwt"() ->> 'email'::"text") = ANY (ARRAY['info@thefutureofenglish.com'::"text", 'admin@suaiden.com'::"text", 'suaiden@suaiden.com'::"text", 'fernanda@suaiden.com'::"text", 'victuribdev@gmail.com'::"text", 'newvicturibdev@gmail.com'::"text", 'dev01@suaiden.com'::"text"])));



CREATE POLICY "Admins can view all onboarding responses" ON "public"."onboarding_responses" FOR SELECT TO "authenticated" USING ((("auth"."jwt"() ->> 'email'::"text") = ANY (ARRAY['info@thefutureofenglish.com'::"text", 'admin@suaiden.com'::"text", 'fernanda@suaiden.com'::"text", 'victuribdev@gmail.com'::"text", 'dev01@suaiden.com'::"text"])));



CREATE POLICY "Admins can view all profiles" ON "public"."user_accounts" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admins can view all user services" ON "public"."user_services" FOR SELECT TO "authenticated" USING ((("auth"."jwt"() ->> 'email'::"text") = ANY (ARRAY['info@thefutureofenglish.com'::"text", 'admin@suaiden.com'::"text", 'suaiden@suaiden.com'::"text", 'fernanda@suaiden.com'::"text", 'victuribdev@gmail.com'::"text", 'newvicturibdev@gmail.com'::"text", 'dev01@suaiden.com'::"text"])));



CREATE POLICY "Admins podem ver todos os documentos" ON "public"."documents" TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Authenticated users can insert logs" ON "public"."process_logs" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Customer can insert own visa_orders" ON "public"."visa_orders" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Customer can select own visa_orders" ON "public"."visa_orders" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."user_accounts"
  WHERE (("user_accounts"."id" = "auth"."uid"()) AND ("user_accounts"."role" = 'admin'::"text"))))));



CREATE POLICY "Customer can update own visa_orders" ON "public"."visa_orders" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Enable insert for everyone" ON "public"."zelle_payments" FOR INSERT WITH CHECK (true);



CREATE POLICY "Leitura de preços por usuários autenticados" ON "public"."services_prices" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Permitir leitura pública por ID (para página de sucesso)" ON "public"."visa_orders" FOR SELECT USING (true);



CREATE POLICY "Service role bypasses RLS on zelle payments" ON "public"."zelle_payments" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role has full access to process_services" ON "public"."process_services" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Users can insert admin notifications" ON "public"."notifications" FOR INSERT WITH CHECK ((("target_role" = 'admin'::"text") OR "public"."is_admin"()));



CREATE POLICY "Users can insert their own documents" ON "public"."documents" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own process services" ON "public"."process_services" FOR INSERT WITH CHECK (("process_id" IN ( SELECT "user_services"."id"
   FROM "public"."user_services"
  WHERE ("user_services"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can insert their own profile" ON "public"."user_accounts" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert their own recovery cases" ON "public"."cos_recovery_cases" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own notifications or admins can update a" ON "public"."notifications" FOR UPDATE USING ((("auth"."uid"() = "user_id") OR (("target_role" = 'admin'::"text") AND "public"."is_admin"()))) WITH CHECK ((("auth"."uid"() = "user_id") OR (("target_role" = 'admin'::"text") AND "public"."is_admin"())));



CREATE POLICY "Users can update their own process services" ON "public"."process_services" FOR UPDATE USING (("process_id" IN ( SELECT "user_services"."id"
   FROM "public"."user_services"
  WHERE ("user_services"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can update their own profile" ON "public"."user_accounts" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own recovery cases" ON "public"."cos_recovery_cases" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own documents" ON "public"."documents" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own notifications or admins can view admin" ON "public"."notifications" FOR SELECT USING ((("auth"."uid"() = "user_id") OR (("target_role" = 'admin'::"text") AND "public"."is_admin"())));



CREATE POLICY "Users can view their own payments" ON "public"."zelle_payments" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own process services" ON "public"."process_services" FOR SELECT USING (("process_id" IN ( SELECT "user_services"."id"
   FROM "public"."user_services"
  WHERE ("user_services"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their own profile" ON "public"."user_accounts" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own service logs" ON "public"."process_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_services" "us"
  WHERE (("us"."id" = "process_logs"."user_service_id") AND ("us"."user_id" = "auth"."uid"())))));



CREATE POLICY "Usuários podem atualizar o próprio perfil" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Usuários podem atualizar seus próprios pedidos" ON "public"."visa_orders" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "user_id") OR ("client_email" = ( SELECT "profiles"."email"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))))) WITH CHECK ((("auth"."uid"() = "user_id") OR ("client_email" = ( SELECT "profiles"."email"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())))));



CREATE POLICY "Usuários podem atualizar seus próprios serviços" ON "public"."user_services" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuários podem criar seus próprios pedidos" ON "public"."visa_orders" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "user_id") OR ("client_email" = ( SELECT "profiles"."email"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())))));



CREATE POLICY "Usuários podem criar seus próprios serviços" ON "public"."user_services" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuários podem deletar suas próprias mensagens" ON "public"."chat_messages" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuários podem gerenciar seus próprios documentos" ON "public"."documents" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuários podem gerenciar suas respostas de onboarding" ON "public"."onboarding_responses" USING ((EXISTS ( SELECT 1
   FROM "public"."user_services"
  WHERE (("user_services"."id" = "onboarding_responses"."user_service_id") AND ("user_services"."user_id" = "auth"."uid"())))));



CREATE POLICY "Usuários podem inserir mensagens no chat" ON "public"."chat_messages" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuários podem inserir seus próprios serviços" ON "public"."user_services" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuários podem ver o próprio perfil" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Usuários podem ver seu histórico de chat" ON "public"."chat_messages" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuários podem ver seus próprios pagamentos Zelle" ON "public"."zelle_payments" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuários podem ver seus próprios serviços" ON "public"."user_services" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuários podem ver suas próprias taxas" ON "public"."individual_fee_payments" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "admin can read all accounts" ON "public"."user_accounts" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "admins can read visa_orders" ON "public"."visa_orders" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



ALTER TABLE "public"."chat_messages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "clients_insert_own" ON "public"."cos_recovery_cases" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "clients_update_own" ON "public"."cos_recovery_cases" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "clients_view_own" ON "public"."cos_recovery_cases" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."cos_recovery_cases" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."discount_coupons" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."individual_fee_payments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "n8n_node_read_access" ON "public"."onboarding_responses" FOR SELECT TO "anon" USING (true);



CREATE POLICY "n8n_node_read_access_services" ON "public"."user_services" FOR SELECT TO "anon" USING (true);



ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."onboarding_responses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."process_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."process_services" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "service_role_all" ON "public"."cos_recovery_cases" USING (true);



ALTER TABLE "public"."services_prices" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user can read own account" ON "public"."user_accounts" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "user can update own account" ON "public"."user_accounts" FOR UPDATE USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."user_accounts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_services" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users can insert own services" ON "public"."user_services" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "users can read own services" ON "public"."user_services" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."visa_orders" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."notifications";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."process_logs";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_process_service_payment"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_process_service_payment"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_process_service_payment"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_status_notification"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_status_notification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_status_notification"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_user_service_notification"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_user_service_notification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_user_service_notification"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_user_service_status_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_user_service_status_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_user_service_status_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_send_email"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_send_email"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_send_email"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_process_services_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_process_services_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_process_services_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_coupon"("p_code" "text", "p_slug" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_coupon"("p_code" "text", "p_slug" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_coupon"("p_code" "text", "p_slug" "text") TO "service_role";


















GRANT ALL ON TABLE "public"."chat_messages" TO "anon";
GRANT ALL ON TABLE "public"."chat_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_messages" TO "service_role";



GRANT ALL ON TABLE "public"."cos_recovery_cases" TO "anon";
GRANT ALL ON TABLE "public"."cos_recovery_cases" TO "authenticated";
GRANT ALL ON TABLE "public"."cos_recovery_cases" TO "service_role";



GRANT ALL ON TABLE "public"."discount_coupons" TO "anon";
GRANT ALL ON TABLE "public"."discount_coupons" TO "authenticated";
GRANT ALL ON TABLE "public"."discount_coupons" TO "service_role";



GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";



GRANT ALL ON TABLE "public"."individual_fee_payments" TO "anon";
GRANT ALL ON TABLE "public"."individual_fee_payments" TO "authenticated";
GRANT ALL ON TABLE "public"."individual_fee_payments" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."onboarding_responses" TO "anon";
GRANT ALL ON TABLE "public"."onboarding_responses" TO "authenticated";
GRANT ALL ON TABLE "public"."onboarding_responses" TO "service_role";



GRANT ALL ON TABLE "public"."process_logs" TO "anon";
GRANT ALL ON TABLE "public"."process_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."process_logs" TO "service_role";



GRANT ALL ON TABLE "public"."process_services" TO "anon";
GRANT ALL ON TABLE "public"."process_services" TO "authenticated";
GRANT ALL ON TABLE "public"."process_services" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."services_prices" TO "anon";
GRANT ALL ON TABLE "public"."services_prices" TO "authenticated";
GRANT ALL ON TABLE "public"."services_prices" TO "service_role";



GRANT ALL ON TABLE "public"."user_accounts" TO "anon";
GRANT ALL ON TABLE "public"."user_accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."user_accounts" TO "service_role";



GRANT ALL ON TABLE "public"."user_services" TO "anon";
GRANT ALL ON TABLE "public"."user_services" TO "authenticated";
GRANT ALL ON TABLE "public"."user_services" TO "service_role";



GRANT ALL ON SEQUENCE "public"."visa_order_number_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."visa_order_number_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."visa_order_number_seq" TO "service_role";



GRANT ALL ON TABLE "public"."visa_orders" TO "anon";
GRANT ALL ON TABLE "public"."visa_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."visa_orders" TO "service_role";



GRANT ALL ON TABLE "public"."zelle_payments" TO "anon";
GRANT ALL ON TABLE "public"."zelle_payments" TO "authenticated";
GRANT ALL ON TABLE "public"."zelle_payments" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































