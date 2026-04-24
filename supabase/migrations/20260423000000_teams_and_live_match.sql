DROP TABLE IF EXISTS teams CASCADE;
-- Create teams for the ranking
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  points INT DEFAULT 0
);

-- Insert initial dummy teams for demo
INSERT INTO teams (name, wins, losses, points) VALUES
  ('Team Alpha', 0, 0, 0),
  ('Team Beta', 0, 0, 0),
  ('Team Gamma', 0, 0, 0),
  ('Team Delta', 0, 0, 0),
  ('Team Omega', 0, 0, 0);

DROP TABLE IF EXISTS live_match CASCADE;
-- Create a singleton table for the overlay state
CREATE TABLE live_match (
  id INT PRIMARY KEY DEFAULT 1,
  team1_name TEXT DEFAULT 'Team Alpha',
  team2_name TEXT DEFAULT 'Team Omega',
  team1_score INT DEFAULT 0,
  team2_score INT DEFAULT 0,
  title TEXT DEFAULT 'Grand Final',
  subtitle TEXT DEFAULT 'BEST OF 5 SERIES'
);

-- Insert the single row
INSERT INTO live_match (id) VALUES (1);

-- Ensure Realtime is enabled for the new tables
ALTER PUBLICATION supabase_realtime ADD TABLE teams, live_match;
