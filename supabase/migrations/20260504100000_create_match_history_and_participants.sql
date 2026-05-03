-- Tables absentes sur certains projets (définies avant seulement dans database_setup_for_matches.sql).
-- Idempotent : safe si les tables existent déjà (ex. après import manuel).

CREATE TABLE IF NOT EXISTS public.match_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id BIGINT UNIQUE NOT NULL,
  game_creation TIMESTAMPTZ,
  game_duration INT,
  game_mode TEXT,
  game_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Colonnes et ordre logique alignés sur match_participants_rows.sql
CREATE TABLE IF NOT EXISTS public.match_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.match_history(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  kills INT,
  deaths INT,
  assists INT,
  total_damage_dealt_to_champions INT,
  win BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  first_blood_kill BOOLEAN DEFAULT false,
  total_time_spent_dead INT DEFAULT 0,
  total_damage_dealt INT DEFAULT 0,
  total_damage_taken INT DEFAULT 0,
  damage_self_mitigated INT DEFAULT 0,
  vision_score INT DEFAULT 0,
  wards_placed INT DEFAULT 0,
  wards_killed INT DEFAULT 0,
  gold_earned INT DEFAULT 0,
  total_minions_killed INT DEFAULT 0,
  largest_killing_spree INT DEFAULT 0,
  team_id INT DEFAULT 0,
  champion_id UUID REFERENCES public.champions(id) ON DELETE SET NULL,
  UNIQUE(match_id, player_id)
);

ALTER TABLE public.match_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert matches" ON public.match_history;
DROP POLICY IF EXISTS "Public can view matches" ON public.match_history;
CREATE POLICY "Public can insert matches" ON public.match_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view matches" ON public.match_history FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert match participants" ON public.match_participants;
DROP POLICY IF EXISTS "Public can view match participants" ON public.match_participants;
CREATE POLICY "Public can insert match participants" ON public.match_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view match participants" ON public.match_participants FOR SELECT USING (true);

NOTIFY pgrst, 'reload schema';
