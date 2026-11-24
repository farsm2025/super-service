-- Super-Service : relevés d'heures. Extension indépendante du calendrier existant.
CREATE TABLE IF NOT EXISTS work_people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL CHECK (length(trim(first_name)) BETWEEN 1 AND 100),
  last_name text NOT NULL CHECK (length(trim(last_name)) BETWEEN 1 AND 100),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS work_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL REFERENCES work_people(id) ON DELETE RESTRICT,
  cutoff_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS work_statements_person_idx ON work_statements(person_id,created_at DESC);
CREATE TABLE IF NOT EXISTS work_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL REFERENCES work_people(id) ON DELETE RESTRICT,
  work_date date NOT NULL,
  description text NOT NULL CHECK (length(trim(description)) BETWEEN 1 AND 1000),
  hours numeric(8,2) NOT NULL CHECK (hours > 0 AND hours <= 24),
  amount_cents integer NOT NULL CHECK (amount_cents >= 0 AND amount_cents <= 100000000),
  statement_id uuid REFERENCES work_statements(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS work_entries_pending_idx ON work_entries(person_id,work_date) WHERE statement_id IS NULL;
CREATE TABLE IF NOT EXISTS work_statement_versions (
  statement_id uuid NOT NULL REFERENCES work_statements(id) ON DELETE RESTRICT,
  version integer NOT NULL CHECK (version >= 1),
  lines jsonb NOT NULL CHECK (jsonb_typeof(lines) = 'array'),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(statement_id,version)
);
