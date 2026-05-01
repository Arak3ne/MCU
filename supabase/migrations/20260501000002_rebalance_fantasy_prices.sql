-- Migration: Rebalance player prices
-- Adjusts default prices for tiers to be more flexible with the 100 budget

-- S'assurer que la colonne existe d'abord
ALTER TABLE players
    ADD COLUMN IF NOT EXISTS fantasy_price integer DEFAULT 15;

UPDATE public.players
SET fantasy_price = CASE
    WHEN UPPER(rank) = 'S' THEN 28
    WHEN UPPER(rank) = 'A' THEN 22
    WHEN UPPER(rank) = 'B' THEN 18
    WHEN UPPER(rank) = 'C' THEN 12
    WHEN UPPER(rank) = 'D' THEN 8
    ELSE 12
END
WHERE fantasy_price IS NOT NULL;

-- Update default value for future players
ALTER TABLE public.players ALTER COLUMN fantasy_price SET DEFAULT 12;
