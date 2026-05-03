-- participation_type + profils partiels (bases créées avant 20260424000000 enrichi ; idempotent)
ALTER TABLE players ADD COLUMN IF NOT EXISTS participation_type TEXT NOT NULL DEFAULT 'joueur';

DO $$
BEGIN
  ALTER TABLE players ADD CONSTRAINT players_participation_type_check
    CHECK (participation_type IN ('joueur', 'drafter'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE players ALTER COLUMN primary_role DROP NOT NULL;
ALTER TABLE players ALTER COLUMN secondary_role DROP NOT NULL;
ALTER TABLE players ALTER COLUMN champion_pool DROP NOT NULL;
ALTER TABLE players ALTER COLUMN champion_signature DROP NOT NULL;
ALTER TABLE players ALTER COLUMN rank DROP NOT NULL;
ALTER TABLE players ALTER COLUMN playstyle DROP NOT NULL;
ALTER TABLE players ALTER COLUMN mindset DROP NOT NULL;

ALTER TABLE players DROP CONSTRAINT IF EXISTS valid_roles;
ALTER TABLE players ADD CONSTRAINT valid_roles CHECK (
    (participation_type = 'drafter')
    OR (primary_role IS NULL AND secondary_role IS NULL)
    OR (
        primary_role IN ('top', 'jungle', 'mid', 'adc', 'support')
        AND secondary_role IN ('top', 'jungle', 'mid', 'adc', 'support')
        AND primary_role IS DISTINCT FROM secondary_role
    )
);

ALTER TABLE players DROP CONSTRAINT IF EXISTS valid_pool_size;
ALTER TABLE players ADD CONSTRAINT valid_pool_size CHECK (
    champion_pool IS NULL OR COALESCE(cardinality(champion_pool), 0) <= 5
);
