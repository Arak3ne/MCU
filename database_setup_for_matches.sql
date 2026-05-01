-- 1. Table pour stocker les informations globales de chaque match
CREATE TABLE IF NOT EXISTS match_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id BIGINT UNIQUE NOT NULL,
    game_creation TIMESTAMP WITH TIME ZONE,
    game_duration INT,
    game_mode TEXT,
    game_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table pour stocker les statistiques de chaque joueur dans un match
CREATE TABLE IF NOT EXISTS match_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES match_history(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    champion_id INT,
    kills INT,
    deaths INT,
    assists INT,
    total_damage_dealt_to_champions INT,
    win BOOLEAN,
    first_blood_kill BOOLEAN,
    total_time_spent_dead INT,
    total_damage_dealt INT,
    total_damage_taken INT,
    damage_self_mitigated INT,
    vision_score INT,
    wards_placed INT,
    wards_killed INT,
    gold_earned INT,
    total_minions_killed INT,
    largest_killing_spree INT,
    team_id INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(match_id, player_id)
);

-- 3. Autoriser l'insertion et la lecture publiques pour nos tests 
-- (A modifier en production pour plus de sécurité)
ALTER TABLE match_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can insert matches" ON match_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view matches" ON match_history FOR SELECT USING (true);

ALTER TABLE match_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can insert match participants" ON match_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view match participants" ON match_participants FOR SELECT USING (true);
