DROP TABLE IF EXISTS playoff_matches CASCADE;

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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure Realtime is enabled for the new table
ALTER PUBLICATION supabase_realtime ADD TABLE playoff_matches;
