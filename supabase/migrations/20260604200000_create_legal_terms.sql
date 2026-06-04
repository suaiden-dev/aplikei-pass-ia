CREATE TABLE IF NOT EXISTS legal_terms (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT        NOT NULL,
  content     TEXT        NOT NULL,
  category    TEXT        NOT NULL CHECK (category IN ('lawyer', 'customer')),
  version     TEXT        NOT NULL DEFAULT '1.0',
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_by  UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS legal_terms_category_idx  ON legal_terms(category);
CREATE INDEX IF NOT EXISTS legal_terms_is_active_idx ON legal_terms(is_active);

ALTER TABLE legal_terms ENABLE ROW LEVEL SECURITY;

-- Masters can do everything
CREATE POLICY "legal_terms_master_all" ON legal_terms
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_accounts WHERE id = auth.uid() AND role = 'master')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_accounts WHERE id = auth.uid() AND role = 'master')
  );

-- Any authenticated user can read active terms
CREATE POLICY "legal_terms_read_active" ON legal_terms
  FOR SELECT TO authenticated
  USING (is_active = true);

-- Auto-update updated_at on changes
CREATE OR REPLACE FUNCTION set_legal_terms_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER legal_terms_updated_at
  BEFORE UPDATE ON legal_terms
  FOR EACH ROW EXECUTE FUNCTION set_legal_terms_updated_at();
