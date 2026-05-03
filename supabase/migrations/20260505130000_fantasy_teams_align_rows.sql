-- Aligne fantasy_teams sur fantasy_teams_rows.sql (bases créées avec locked / players[] / captain_id).

-- locked → is_locked
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'fantasy_teams' AND column_name = 'locked'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'fantasy_teams' AND column_name = 'is_locked'
  ) THEN
    ALTER TABLE public.fantasy_teams RENAME COLUMN locked TO is_locked;
  END IF;
END $$;

ALTER TABLE public.fantasy_teams
  ADD COLUMN IF NOT EXISTS is_locked boolean DEFAULT false;

-- Ancien schéma : roster en colonnes ; l’app utilise fantasy_picks.
ALTER TABLE public.fantasy_teams DROP COLUMN IF EXISTS players;
ALTER TABLE public.fantasy_teams DROP COLUMN IF EXISTS captain_id;

ALTER TABLE public.fantasy_teams
  ADD COLUMN IF NOT EXISTS transfers_made integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS penalty_points integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS carried_over_budget integer NOT NULL DEFAULT 0;

-- total_points : numeric comme dans les exports / trigger
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'fantasy_teams'
      AND column_name = 'total_points' AND data_type = 'integer'
  ) THEN
    ALTER TABLE public.fantasy_teams
      ALTER COLUMN total_points TYPE numeric USING total_points::numeric;
    ALTER TABLE public.fantasy_teams ALTER COLUMN total_points SET DEFAULT 0;
  END IF;
END $$;
