ALTER TABLE match_participants ADD COLUMN IF NOT EXISTS neutral_minions_killed integer DEFAULT 0;
