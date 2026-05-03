-- Alignement schéma legacy → players_rows.sql (colonnes / noms fantasy).

ALTER TABLE public.players ADD COLUMN IF NOT EXISTS fantasy_notes text;

-- Ancien nom de colonne jour 2
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'players' AND column_name = 'fantasy_price_day2'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'players' AND column_name = 'fantasy_cost_day2'
  ) THEN
    ALTER TABLE public.players RENAME COLUMN fantasy_price_day2 TO fantasy_cost_day2;
  END IF;
END $$;

-- Ancien fantasy_price (jour 1) : fusion dans fantasy_cost puis suppression
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'players' AND column_name = 'fantasy_price'
  ) THEN
    UPDATE public.players
    SET fantasy_cost = COALESCE(fantasy_cost, fantasy_price, 15);
    ALTER TABLE public.players DROP COLUMN fantasy_price;
  END IF;
END $$;
