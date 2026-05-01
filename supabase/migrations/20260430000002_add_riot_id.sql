-- Add riot_id column to players table
ALTER TABLE players ADD COLUMN riot_id TEXT;

-- We don't make it NOT NULL yet because existing players don't have it.
-- But we can add a check constraint to ensure the format is somewhat correct (e.g., Name#TAG)
ALTER TABLE players ADD CONSTRAINT valid_riot_id CHECK (
    riot_id IS NULL OR riot_id ~ '^.+#.+$'
);
