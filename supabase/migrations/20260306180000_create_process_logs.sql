CREATE TABLE IF NOT EXISTS public.process_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_service_id UUID NOT NULL REFERENCES public.user_services(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    previous_status TEXT,
    new_status TEXT,
    action_type TEXT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.process_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all process logs"
    ON public.process_logs FOR SELECT
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Users can view their own process logs"
    ON public.process_logs FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_services
            WHERE user_services.id = process_logs.user_service_id
            AND user_services.user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can insert process logs"
    ON public.process_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);
