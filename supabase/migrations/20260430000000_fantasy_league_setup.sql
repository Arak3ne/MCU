-- Add Fantasy League columns to the existing players table if not present
ALTER TABLE players
    ADD COLUMN IF NOT EXISTS fantasy_price integer DEFAULT 15,
    ADD COLUMN IF NOT EXISTS fantasy_enabled boolean DEFAULT true;

-- Create fantasy_teams table
CREATE TABLE IF NOT EXISTS fantasy_teams (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tournament_day integer NOT NULL CHECK (tournament_day IN (1, 2)),
    name text NOT NULL,
    players uuid[] NOT NULL DEFAULT '{}',
    captain_id uuid REFERENCES players(id) ON DELETE SET NULL,
    total_points integer DEFAULT 0,
    locked boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT unique_user_tournament_day UNIQUE (user_id, tournament_day)
);

CREATE INDEX IF NOT EXISTS idx_fantasy_teams_user_id ON fantasy_teams(user_id);
CREATE INDEX IF NOT EXISTS idx_fantasy_teams_tournament_day ON fantasy_teams(tournament_day);

-- Create fantasy_player_scores table
CREATE TABLE IF NOT EXISTS fantasy_player_scores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    tournament_day integer NOT NULL CHECK (tournament_day IN (1, 2)),
    score numeric DEFAULT 0,
    validated boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT unique_player_tournament_day UNIQUE (player_id, tournament_day)
);

CREATE INDEX IF NOT EXISTS idx_fantasy_player_scores_player_id ON fantasy_player_scores(player_id);
CREATE INDEX IF NOT EXISTS idx_fantasy_player_scores_tournament_day ON fantasy_player_scores(tournament_day);

-- RLS for fantasy_teams
ALTER TABLE fantasy_teams ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users read own teams" ON fantasy_teams FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users insert own teams" ON fantasy_teams FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users update own unlocked teams" ON fantasy_teams FOR UPDATE USING (auth.uid() = user_id AND locked = false);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users delete own unlocked teams" ON fantasy_teams FOR DELETE USING (auth.uid() = user_id AND locked = false);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Admin read all teams" ON fantasy_teams FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- RLS for fantasy_player_scores
ALTER TABLE fantasy_player_scores ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Public read validated scores" ON fantasy_player_scores FOR SELECT USING (validated = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
