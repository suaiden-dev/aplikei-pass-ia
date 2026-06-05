ALTER TABLE legal_terms
  DROP CONSTRAINT IF EXISTS legal_terms_category_check;

ALTER TABLE legal_terms
  ADD CONSTRAINT legal_terms_category_check
    CHECK (category IN ('lawyer', 'customer', 'lawyer_terms', 'lawyer_privacy', 'customer_terms', 'customer_privacy'));
