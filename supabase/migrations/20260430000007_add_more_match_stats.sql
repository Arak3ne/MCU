-- Ajouter de nouvelles statistiques pour les participants du match
ALTER TABLE match_participants
ADD COLUMN IF NOT EXISTS first_blood_kill BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS total_time_spent_dead INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_damage_dealt INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_damage_taken INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS damage_self_mitigated INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS vision_score INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS wards_placed INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS wards_killed INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS gold_earned INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_minions_killed INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS largest_killing_spree INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS team_id INT DEFAULT 0;
