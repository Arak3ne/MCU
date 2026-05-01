-- Add team_id to players
ALTER TABLE players ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

-- Update live_match to use team IDs
ALTER TABLE live_match ADD COLUMN IF NOT EXISTS team1_id UUID REFERENCES teams(id) ON DELETE SET NULL;
ALTER TABLE live_match ADD COLUMN IF NOT EXISTS team2_id UUID REFERENCES teams(id) ON DELETE SET NULL;

-- Set a default match just so it's not null (Team Alpha and Team Omega)
UPDATE live_match SET 
    team1_id = (SELECT id FROM teams WHERE name = 'Team Alpha' LIMIT 1),
    team2_id = (SELECT id FROM teams WHERE name = 'Team Omega' LIMIT 1)
WHERE id = 1;

-- Drop old columns
ALTER TABLE live_match DROP COLUMN IF EXISTS team1_name;
ALTER TABLE live_match DROP COLUMN IF EXISTS team2_name;
