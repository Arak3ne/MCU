-- Aligne playoff_matches sur playoff_matches_rows.sql (bases créées avant les colonnes draft).

ALTER TABLE public.playoff_matches
  ADD COLUMN IF NOT EXISTS draft_url text,
  ADD COLUMN IF NOT EXISTS draft_id text,
  ADD COLUMN IF NOT EXISTS draft_picks text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS draft_blue_team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL;

ALTER TABLE public.playoff_matches DROP CONSTRAINT IF EXISTS playoff_matches_draft_blue_team_check;

ALTER TABLE public.playoff_matches
  ADD CONSTRAINT playoff_matches_draft_blue_team_check
  CHECK (
    draft_blue_team_id IS NULL
    OR draft_blue_team_id = team1_id
    OR draft_blue_team_id = team2_id
  );
