-- Script para limpar dados de teste mantendo o admin e tabelas de configuração

BEGIN;

-- 1. Identificar o ID do Admin para proteção
DO $$
DECLARE
    admin_id UUID;
BEGIN
    SELECT id INTO admin_id FROM user_accounts WHERE email = 'luffyadmin@uorak.com';

    -- 2. Limpar tabelas de transação/uso (estas podem ser limpas por completo ou filtradas)
    TRUNCATE cos_recovery_cases CASCADE;
    TRUNCATE zelle_payments CASCADE;
    TRUNCATE visa_orders CASCADE;
    TRUNCATE notifications CASCADE;
    
    -- 3. Limpar serviços e entidades principais, exceto as do admin (se houver)
    IF admin_id IS NOT NULL THEN
        DELETE FROM user_services WHERE user_id != admin_id;
        DELETE FROM profiles WHERE id != admin_id;
        DELETE FROM user_accounts WHERE id != admin_id;
        
        -- Limpa a tabela de autenticação interna do Supabase, removendo os logins
        DELETE FROM auth.users WHERE email != 'luffyadmin@uorak.com';
    ELSE
        -- Se o admin não existir por algum motivo, limpa tudo (CUIDADO)
        TRUNCATE user_services CASCADE;
        TRUNCATE user_accounts CASCADE;
        DELETE FROM auth.users;
    END IF;

    -- NOTA: As tabelas 'services_prices' e 'discount_coupons' (definições) 
    -- NÃO são tocadas para preservar a configuração do sistema.

    RAISE NOTICE 'Limpeza concluída com sucesso. Admin preservado.';
END $$;

COMMIT;
