-- Super-Service personnel : email facultatif et suivi d'envoi de chaque décompte.
ALTER TABLE work_people ADD COLUMN IF NOT EXISTS email text NOT NULL DEFAULT '';
ALTER TABLE work_statements ADD COLUMN IF NOT EXISTS email_status text NOT NULL DEFAULT 'pending'
  CHECK (email_status IN ('pending','sending','sent','failed','skipped'));
ALTER TABLE work_statements ADD COLUMN IF NOT EXISTS email_to text NOT NULL DEFAULT '';
ALTER TABLE work_statements ADD COLUMN IF NOT EXISTS emailed_at timestamptz;
ALTER TABLE work_statements ADD COLUMN IF NOT EXISTS email_error text;
ALTER TABLE work_statements ADD COLUMN IF NOT EXISTS email_claimed_at timestamptz;
CREATE INDEX IF NOT EXISTS work_statements_email_status_idx ON work_statements(email_status);
