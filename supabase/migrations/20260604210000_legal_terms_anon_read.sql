-- Allow anonymous (unauthenticated) users to read active legal terms.
-- The Privacy and Terms pages are public routes; visitors are not logged in.
CREATE POLICY "legal_terms_anon_read_active" ON legal_terms
  FOR SELECT TO anon
  USING (is_active = true);
