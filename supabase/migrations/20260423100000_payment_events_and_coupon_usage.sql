CREATE TABLE IF NOT EXISTS public.payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  provider_event_id TEXT NOT NULL,
  order_id UUID NULL REFERENCES public.orders(id) ON DELETE SET NULL,
  payment_id TEXT NULL,
  payload JSONB NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'payment_events_provider_provider_event_id_key'
  ) THEN
    ALTER TABLE public.payment_events
      ADD CONSTRAINT payment_events_provider_provider_event_id_key UNIQUE (provider, provider_event_id);
  END IF;
END $$;

ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'payment_events' AND policyname = 'Service role only'
  ) THEN
    CREATE POLICY "Service role only" ON public.payment_events
    FOR ALL
    USING (auth.role() = 'service_role');
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.register_payment_event(
  p_provider TEXT,
  p_event_id TEXT,
  p_order_id UUID DEFAULT NULL,
  p_payment_id TEXT DEFAULT NULL,
  p_payload JSONB DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rowcount INTEGER := 0;
BEGIN
  INSERT INTO public.payment_events (provider, provider_event_id, order_id, payment_id, payload)
  VALUES (p_provider, p_event_id, p_order_id, p_payment_id, p_payload)
  ON CONFLICT (provider, provider_event_id) DO NOTHING;

  GET DIAGNOSTICS v_rowcount = ROW_COUNT;
  RETURN v_rowcount > 0;
END;
$$;
