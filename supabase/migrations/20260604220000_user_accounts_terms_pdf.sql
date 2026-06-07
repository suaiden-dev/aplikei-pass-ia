ALTER TABLE user_accounts
  ADD COLUMN IF NOT EXISTS terms_pdf_url    text,
  ADD COLUMN IF NOT EXISTS terms_accepted_ip text,
  ADD COLUMN IF NOT EXISTS terms_accepted_ua text;
