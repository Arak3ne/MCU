-- Table picks absente du setup initial (référencée plus tard par triggers / mercato).
CREATE TABLE IF NOT EXISTS public.fantasy_picks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    fantasy_team_id uuid NOT NULL REFERENCES public.fantasy_teams(id) ON DELETE CASCADE,
    player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    is_captain boolean NOT NULL DEFAULT false,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT fantasy_picks_team_player_unique UNIQUE (fantasy_team_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_fantasy_picks_fantasy_team_id ON public.fantasy_picks(fantasy_team_id);
CREATE INDEX IF NOT EXISTS idx_fantasy_picks_player_id ON public.fantasy_picks(player_id);

-- 1. Drop existing policies that rely on auth.uid()
DROP POLICY IF EXISTS "Users read own teams" ON fantasy_teams;
DROP POLICY IF EXISTS "Users insert own teams" ON fantasy_teams;
DROP POLICY IF EXISTS "Users update own unlocked teams" ON fantasy_teams;
DROP POLICY IF EXISTS "Users delete own unlocked teams" ON fantasy_teams;
DROP POLICY IF EXISTS "Admin read all teams" ON fantasy_teams;
DROP POLICY IF EXISTS "Admin update teams" ON fantasy_teams;

DROP POLICY IF EXISTS "Public read validated scores" ON fantasy_player_scores;

-- 2. Enable RLS but allow everything for MVP (since we use players.id instead of true Supabase Auth)
ALTER TABLE fantasy_teams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for MVP on teams" ON fantasy_teams;
CREATE POLICY "Enable all for MVP on teams" ON fantasy_teams FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE fantasy_player_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for MVP on scores" ON fantasy_player_scores;
CREATE POLICY "Enable all for MVP on scores" ON fantasy_player_scores FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE fantasy_picks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for MVP on picks" ON fantasy_picks;
CREATE POLICY "Enable all for MVP on picks" ON fantasy_picks FOR ALL USING (true) WITH CHECK (true);

-- 3. Change foreign key of user_id from auth.users to players (since user_id is actually a player id in this app)
ALTER TABLE fantasy_teams DROP CONSTRAINT IF EXISTS fantasy_teams_user_id_fkey;
ALTER TABLE fantasy_teams ADD CONSTRAINT fantasy_teams_user_id_fkey FOREIGN KEY (user_id) REFERENCES players(id) ON DELETE CASCADE;
