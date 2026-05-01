-- Add participation_type to distinguish tournament players from fantasy drafters
ALTER TABLE players ADD COLUMN participation_type TEXT NOT NULL DEFAULT 'joueur' CHECK (participation_type IN ('joueur', 'drafter'));

-- Make player-specific fields nullable
ALTER TABLE players ALTER COLUMN primary_role DROP NOT NULL;
ALTER TABLE players ALTER COLUMN secondary_role DROP NOT NULL;
ALTER TABLE players ALTER COLUMN champion_pool DROP NOT NULL;
ALTER TABLE players ALTER COLUMN champion_signature DROP NOT NULL;
ALTER TABLE players ALTER COLUMN rank DROP NOT NULL;
ALTER TABLE players ALTER COLUMN playstyle DROP NOT NULL;
ALTER TABLE players ALTER COLUMN mindset DROP NOT NULL;

-- Update the valid_roles constraint to only apply to 'joueur' participation type
ALTER TABLE players DROP CONSTRAINT IF EXISTS valid_roles;
ALTER TABLE players ADD CONSTRAINT valid_roles CHECK (
    (participation_type = 'drafter') OR 
    (
        primary_role IN ('top', 'jungle', 'mid', 'adc', 'support') AND
        secondary_role IN ('top', 'jungle', 'mid', 'adc', 'support') AND
        primary_role != secondary_role
    )
);

-- Update the valid_pool_size constraint to only apply if champion_pool is not null
ALTER TABLE players DROP CONSTRAINT IF EXISTS valid_pool_size;
ALTER TABLE players ADD CONSTRAINT valid_pool_size CHECK (
    champion_pool IS NULL OR array_length(champion_pool, 1) <= 5
);
