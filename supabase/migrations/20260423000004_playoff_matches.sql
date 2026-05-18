DROP TABLE IF EXISTS playoff_matches CASCADE;

-- Schéma aligné sur playoff_matches_rows.sql (colonnes draft incluses).
CREATE TABLE playoff_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage TEXT NOT NULL CHECK (stage IN ('championship', 'group_a', 'group_b', 'knockout')),
  round INT NOT NULL,
  match_order INT NOT NULL,
  team1_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  team2_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  team1_score INT DEFAULT 0,
  team2_score INT DEFAULT 0,
  winner_to_match_id UUID REFERENCES playoff_matches(id) ON DELETE SET NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  draft_url TEXT,
  draft_id TEXT,
  draft_picks TEXT[] DEFAULT '{}',
  draft_blue_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  CONSTRAINT playoff_matches_draft_blue_team_check CHECK (
    draft_blue_team_id IS NULL
    OR draft_blue_team_id = team1_id
    OR draft_blue_team_id = team2_id
  )
);

-- Ensure Realtime is enabled for the new table
ALTER PUBLICATION supabase_realtime ADD TABLE playoff_matches;
