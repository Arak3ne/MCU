-- Effacer les anciens matchs pour éviter les conflits de contrainte
TRUNCATE TABLE playoff_matches CASCADE;

-- Supprimer loser_to_match_id si elle existe
ALTER TABLE playoff_matches DROP COLUMN IF EXISTS loser_to_match_id;

-- Schéma prod (main) : colonne `bracket` + contrainte legacy. Branche déjà alignée : `stage`.
ALTER TABLE playoff_matches DROP CONSTRAINT IF EXISTS playoff_matches_bracket_check;
ALTER TABLE playoff_matches DROP CONSTRAINT IF EXISTS playoff_matches_stage_check;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'playoff_matches'
      AND column_name = 'bracket'
  ) THEN
    ALTER TABLE public.playoff_matches RENAME COLUMN bracket TO stage;
  END IF;
END $$;

ALTER TABLE playoff_matches
  ADD CONSTRAINT playoff_matches_stage_check CHECK (stage IN ('championship', 'group_a', 'group_b', 'knockout'));
