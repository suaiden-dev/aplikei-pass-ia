ALTER TABLE public.office_withdrawals
  ADD COLUMN IF NOT EXISTS requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_office_withdrawals_requested_by
  ON public.office_withdrawals(requested_by);
