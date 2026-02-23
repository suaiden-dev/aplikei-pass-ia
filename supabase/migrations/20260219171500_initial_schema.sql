-- TABELA DE PERFIS (Extensão do Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    whatsapp TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS em profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver o próprio perfil" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar o próprio perfil" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- TRIGGER PARA CRIAR PERFIL AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- TABELA DE SERVIÇOS CONTRATADOS
CREATE TABLE IF NOT EXISTS public.user_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    service_slug TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'canceled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios serviços" 
ON public.user_services FOR SELECT USING (auth.uid() = user_id);


-- TABELA DE RESPOSTAS DO ONBOARDING
CREATE TABLE IF NOT EXISTS public.onboarding_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_service_id UUID REFERENCES public.user_services(id) ON DELETE CASCADE NOT NULL,
    step_slug TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.onboarding_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar suas respostas de onboarding" 
ON public.onboarding_responses FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.user_services 
        WHERE id = public.onboarding_responses.user_service_id 
        AND user_id = auth.uid()
    )
);


-- TABELA DE DOCUMENTOS
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    user_service_id UUID REFERENCES public.user_services(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'approved', 'resubmit')),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar seus próprios documentos" 
ON public.documents FOR ALL USING (auth.uid() = user_id);


-- TABELA DE HISTÓRICO DE CHAT
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seu histórico de chat" 
ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir mensagens no chat" 
ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
