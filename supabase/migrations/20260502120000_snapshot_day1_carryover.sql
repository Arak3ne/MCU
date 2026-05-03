-- Colonne coût officielle : fantasy_cost (fantasy_price legacy → backfill si présent).
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS fantasy_cost integer DEFAULT 15;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'players' AND column_name = 'fantasy_price'
  ) THEN
    EXECUTE $q$
      UPDATE public.players
      SET fantasy_cost = COALESCE(fantasy_cost, fantasy_price, 15)
    $q$;
  END IF;
END $$;

-- Figé le budget non dépensé jour 1 (100 - Σ fantasy_cost des picks).
CREATE OR REPLACE FUNCTION public.snapshot_day1_carryover_budget()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.fantasy_teams ft
  SET carried_over_budget = GREATEST(
    0,
    100 - COALESCE((
      SELECT SUM(COALESCE(p.fantasy_cost, 15))::integer
      FROM public.fantasy_picks fp
      JOIN public.players p ON p.id = fp.player_id
      WHERE fp.fantasy_team_id = ft.id
    ), 0)
  )
  WHERE ft.tournament_day = 1;
END;
$$;

SELECT public.snapshot_day1_carryover_budget();
