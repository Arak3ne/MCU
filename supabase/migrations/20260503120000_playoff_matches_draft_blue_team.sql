-- Which team appears on Drafter blue side (red is the other). First opener sets it; locked once draft_url exists.
ALTER TABLE playoff_matches
  ADD COLUMN IF NOT EXISTS draft_blue_team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

ALTER TABLE playoff_matches DROP CONSTRAINT IF EXISTS playoff_matches_draft_blue_team_check;

ALTER TABLE playoff_matches
  ADD CONSTRAINT playoff_matches_draft_blue_team_check
  CHECK (
    draft_blue_team_id IS NULL
    OR draft_blue_team_id = team1_id
    OR draft_blue_team_id = team2_id
  );
