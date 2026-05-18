-- Uniformiser public.players.fantasy_cost à 12 (données + défaut DDL).
-- set_price_from_rank (trigger_set_price) impose aussi 12 sur chaque INSERT/UPDATE.
-- À lancer à la main (SQL Editor Supabase, psql, etc.).

BEGIN;

UPDATE public.players
SET fantasy_cost = 12
WHERE fantasy_cost IS DISTINCT FROM 12;

ALTER TABLE public.players
  ALTER COLUMN fantasy_cost SET DEFAULT 12;

COMMIT;
