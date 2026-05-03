-- Migration: Rebalance player prices
-- Adjusts default prices for tiers to be more flexible with the 100 budget

-- S'assurer que les colonnes existent
ALTER TABLE public.players
    ADD COLUMN IF NOT EXISTS fantasy_tier text DEFAULT 'C';

ALTER TABLE public.players
    ADD COLUMN IF NOT EXISTS fantasy_price integer DEFAULT 15;

-- Mettre C par défaut pour les joueurs existants sans tier
UPDATE public.players
SET fantasy_tier = 'C'
WHERE fantasy_tier IS NULL;

-- Recalcul des prix basé sur le tier
UPDATE public.players
SET fantasy_price = CASE
    WHEN UPPER(fantasy_tier) = 'S' THEN 28
    WHEN UPPER(fantasy_tier) = 'A' THEN 22
    WHEN UPPER(fantasy_tier) = 'B' THEN 18
    WHEN UPPER(fantasy_tier) = 'C' THEN 12
    WHEN UPPER(fantasy_tier) = 'D' THEN 8
    ELSE 12
END;

-- Update default values for future players
ALTER TABLE public.players
    ALTER COLUMN fantasy_tier SET DEFAULT 'C';

ALTER TABLE public.players
    ALTER COLUMN fantasy_price SET DEFAULT 12;