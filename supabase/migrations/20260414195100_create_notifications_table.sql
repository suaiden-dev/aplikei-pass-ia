-- Tabela de notificações internas
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT NOT NULL,           -- 'admin_action' | 'client_action'
  target_role TEXT NOT NULL,           -- 'admin' | 'client'
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  service_id  UUID REFERENCES public.user_services(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  message     TEXT,                    -- Renomeado de body para message para alinhar com o código do usuário
  is_read     BOOLEAN DEFAULT false,
  send_email  BOOLEAN DEFAULT false,   -- Novo campo para disparar o webhook de email
  email_sent  BOOLEAN DEFAULT false,   -- Flag de controle do webhook
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS target_role TEXT,
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.user_services(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS message TEXT,
  ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS send_email BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Índices de performance
CREATE INDEX IF NOT EXISTS notifications_target_role_is_read_created_at_idx
  ON public.notifications(target_role, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_user_id_idx
  ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_service_id_idx
  ON public.notifications(service_id);
CREATE INDEX IF NOT EXISTS notifications_send_email_email_sent_idx
  ON public.notifications(send_email, email_sent);

-- Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Admin vê todas com target_role = 'admin'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'notifications'
      AND policyname = 'admins_see_admin_notifications'
  ) THEN
    CREATE POLICY "admins_see_admin_notifications" ON public.notifications
      FOR SELECT USING (
        target_role = 'admin' AND
        EXISTS (
          SELECT 1 FROM public.user_accounts
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- Cliente vê suas próprias notificações
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'notifications'
      AND policyname = 'clients_see_own_notifications'
  ) THEN
    CREATE POLICY "clients_see_own_notifications" ON public.notifications
      FOR SELECT USING (
        target_role = 'client' AND user_id = auth.uid()
      );
  END IF;
END $$;

-- Qualquer role autenticada pode inserir (Edge Functions usam service_role)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'notifications'
      AND policyname = 'authenticated_can_insert'
  ) THEN
    CREATE POLICY "authenticated_can_insert" ON public.notifications
      FOR INSERT WITH CHECK (auth.role() IN ('authenticated', 'service_role'));
  END IF;
END $$;

-- Owner pode marcar como lida ou gerenciar seus campos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'notifications'
      AND policyname = 'owner_can_update_read'
  ) THEN
    CREATE POLICY "owner_can_update_read" ON public.notifications
      FOR UPDATE USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;
