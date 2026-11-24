-- Super-Service : suppression définitive ciblée des personnes et décomptes d'heures.
-- Création de fonctions atomiques seulement : aucune donnée n'est supprimée par cette migration.
-- Les fonctions s'exécutent comme l'utilisateur SQL appelant (SECURITY INVOKER).
CREATE OR REPLACE FUNCTION work_delete_person_permanently(target_person uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  PERFORM id FROM work_people WHERE id=target_person FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;
  DELETE FROM work_statement_versions
    WHERE statement_id IN (SELECT id FROM work_statements WHERE person_id=target_person);
  DELETE FROM work_entries WHERE person_id=target_person;
  DELETE FROM work_statements WHERE person_id=target_person;
  DELETE FROM work_people WHERE id=target_person;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION work_delete_statement_permanently(target_statement uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  PERFORM id FROM work_statements WHERE id=target_statement FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;
  DELETE FROM work_statement_versions WHERE statement_id=target_statement;
  DELETE FROM work_entries WHERE statement_id=target_statement;
  DELETE FROM work_statements WHERE id=target_statement;
  RETURN FOUND;
END;
$$;
