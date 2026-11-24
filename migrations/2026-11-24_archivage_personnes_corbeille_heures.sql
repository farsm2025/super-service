-- Super-Service : archivage des personnes et corbeille restaurable des décomptes.
-- Migration additive : aucune suppression d'historique, aucune modification des RDV.
ALTER TABLE work_people ADD COLUMN IF NOT EXISTS archived_at timestamptz;
ALTER TABLE work_statements ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
CREATE INDEX IF NOT EXISTS work_statements_deleted_idx ON work_statements(person_id,deleted_at);
