ALTER TABLE champions
  ADD COLUMN IF NOT EXISTS ddragon_key TEXT,
  ADD COLUMN IF NOT EXISTS splash_url TEXT;

-- Riot/Data Dragon numeric champion id (string) is stable and unique
CREATE UNIQUE INDEX IF NOT EXISTS champions_ddragon_key_unique ON champions (ddragon_key);

