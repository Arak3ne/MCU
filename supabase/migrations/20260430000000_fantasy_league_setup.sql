-- Colonnes fantasy sur players (fantasy_cost défini dans 20260424000000 ; ici uniquement ce qui peut manquer sur d’anciennes DB)
ALTER TABLE players
    ADD COLUMN IF NOT EXISTS fantasy_enabled boolean DEFAULT true;

-- Create fantasy_teams table (colonnes alignées sur fantasy_teams_rows.sql ; roster via fantasy_picks)
CREATE TABLE IF NOT EXISTS fantasy_teams (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tournament_day integer NOT NULL CHECK (tournament_day IN (1, 2)),
    name text NOT NULL,
    total_points numeric DEFAULT 0,
    is_locked boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    transfers_made integer NOT NULL DEFAULT 0,
    penalty_points integer NOT NULL DEFAULT 0,
    carried_over_budget integer NOT NULL DEFAULT 0,
    CONSTRAINT unique_user_tournament_day UNIQUE (user_id, tournament_day)
);

CREATE INDEX IF NOT EXISTS idx_fantasy_teams_user_id ON fantasy_teams(user_id);
CREATE INDEX IF NOT EXISTS idx_fantasy_teams_tournament_day ON fantasy_teams(tournament_day);

-- Create fantasy_player_scores table (colonnes alignées sur fantasy_player_scores_rows.sql)
CREATE TABLE IF NOT EXISTS fantasy_player_scores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    tournament_day integer NOT NULL CHECK (tournament_day IN (1, 2)),
    base_points integer NOT NULL DEFAULT 0,
    bonus_points integer NOT NULL DEFAULT 0,
    penalty_points integer NOT NULL DEFAULT 0,
    total_points numeric,
    reason text,
    validated boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    score numeric DEFAULT 0,
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
    CREATE POLICY "Users update own unlocked teams" ON fantasy_teams FOR UPDATE USING (auth.uid() = user_id AND is_locked = false);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users delete own unlocked teams" ON fantasy_teams FOR DELETE USING (auth.uid() = user_id AND is_locked = false);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Admin read all teams" ON fantasy_teams FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- RLS for fantasy_player_scores
ALTER TABLE fantasy_player_scores ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Public read validated scores" ON fantasy_player_scores FOR SELECT USING (validated = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
