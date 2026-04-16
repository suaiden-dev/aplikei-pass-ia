-- Script para remover tabelas antigas e inativas do banco de dados

BEGIN;

-- Remove as tabelas se elas existirem e propaga a exclusão para quaisquer dependências (como chaves estrangeiras pendentes)
DROP TABLE IF EXISTS "public"."chat_messages" CASCADE;
DROP TABLE IF EXISTS "public"."individual_fee_payments" CASCADE;
DROP TABLE IF EXISTS "public"."onboarding_responses" CASCADE;
DROP TABLE IF EXISTS "public"."process_logs" CASCADE;
DROP TABLE IF EXISTS "public"."process_services" CASCADE;
DROP TABLE IF EXISTS "public"."documents" CASCADE;

-- Mensagem de confirmação ao executar
DO $$
BEGIN
    RAISE NOTICE 'Tabelas antigas deletadas. Banco de dados otimizado!';
END $$;

COMMIT;
