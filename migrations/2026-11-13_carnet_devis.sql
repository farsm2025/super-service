-- Super-Service: carnet de devis. Exécuter une seule fois sur la base Neon neondb / main.
-- Aucune modification des tables de rendez-vous existantes.
CREATE TABLE IF NOT EXISTS quote_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  phone text NOT NULL,
  email text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  service text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'a_traiter' CHECK (status IN ('a_traiter','visite_prevue','devis_envoye','termine')),
  reminder_at timestamptz,
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS quote_notes_updated_idx ON quote_notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS quote_notes_appointment_idx ON quote_notes(appointment_id);
CREATE TABLE IF NOT EXISTS quote_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES quote_notes(id) ON DELETE CASCADE,
  photo_data bytea NOT NULL CHECK (octet_length(photo_data) <= 450000),
  mime_type text NOT NULL CHECK (mime_type IN ('image/jpeg','image/png','image/webp')),
  filename text NOT NULL DEFAULT '',
  caption text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS quote_photos_quote_idx ON quote_photos(quote_id);
