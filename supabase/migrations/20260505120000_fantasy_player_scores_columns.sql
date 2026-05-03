-- Aligne fantasy_player_scores sur fantasy_player_scores_rows.sql (bases créées avant l’extension du schéma).
ALTER TABLE public.fantasy_player_scores
  ADD COLUMN IF NOT EXISTS base_points integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bonus_points integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS penalty_points integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_points numeric,
  ADD COLUMN IF NOT EXISTS reason text;
