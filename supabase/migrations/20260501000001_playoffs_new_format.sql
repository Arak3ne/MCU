-- Effacer les anciens matchs pour éviter les conflits de contrainte
TRUNCATE TABLE playoff_matches CASCADE;

-- Supprimer loser_to_match_id si elle existe
ALTER TABLE playoff_matches DROP COLUMN IF EXISTS loser_to_match_id;

-- Mettre à jour la contrainte sur le type de stage (au cas où ce n'est pas déjà le cas)
ALTER TABLE playoff_matches DROP CONSTRAINT IF EXISTS playoff_matches_stage_check;
ALTER TABLE playoff_matches ADD CONSTRAINT playoff_matches_stage_check CHECK (stage IN ('championship', 'group_a', 'group_b', 'knockout'));
