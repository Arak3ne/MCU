-- Alignement barème : prix jour 1 = fantasy_cost, jour 2 = fantasy_cost_day2.
-- Rétrocompat : copie depuis fantasy_price / fantasy_price_day2 si ces colonnes existent encore.

ALTER TABLE public.players ADD COLUMN IF NOT EXISTS fantasy_cost integer DEFAULT 15;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS fantasy_cost_day2 integer;

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
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'players' AND column_name = 'fantasy_price_day2'
  ) THEN
    EXECUTE $q$
      UPDATE public.players
      SET fantasy_cost_day2 = COALESCE(fantasy_cost_day2, fantasy_price_day2)
    $q$;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.calculate_day2_prices()
RETURNS void AS $$
DECLARE
    total_players INT;
    top_20_threshold INT;
    bottom_20_threshold INT;
BEGIN
    SELECT COUNT(*) INTO total_players
    FROM public.fantasy_player_scores
    WHERE tournament_day = 1 AND validated = true;

    IF total_players = 0 THEN
        RAISE NOTICE 'No validated scores found for Day 1.';
        RETURN;
    END IF;

    top_20_threshold := CEIL(total_players * 0.2);
    bottom_20_threshold := CEIL(total_players * 0.2);

    WITH ranked_players AS (
        SELECT
            fps.player_id,
            COALESCE(p.fantasy_cost, 15) AS base_cost,
            fps.score,
            ROW_NUMBER() OVER (ORDER BY fps.score DESC) AS rank_desc,
            ROW_NUMBER() OVER (ORDER BY fps.score ASC) AS rank_asc
        FROM public.fantasy_player_scores fps
        JOIN public.players p ON p.id = fps.player_id
        WHERE fps.tournament_day = 1 AND fps.validated = true
    )
    UPDATE public.players p
    SET fantasy_cost_day2 =
        CASE
            WHEN rp.rank_desc <= top_20_threshold THEN rp.base_cost + 5
            WHEN rp.rank_asc <= bottom_20_threshold THEN GREATEST(5, rp.base_cost - 5)
            ELSE rp.base_cost
        END
    FROM ranked_players rp
    WHERE p.id = rp.player_id;

    UPDATE public.players
    SET fantasy_cost_day2 = COALESCE(fantasy_cost, 15)
    WHERE fantasy_cost_day2 IS NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.initialize_day2_teams()
RETURNS void AS $$
DECLARE
    day1_team RECORD;
    new_team_id UUID;
    total_day1_cost INT;
BEGIN
    FOR day1_team IN
        SELECT * FROM public.fantasy_teams WHERE tournament_day = 1
    LOOP
        IF EXISTS (SELECT 1 FROM public.fantasy_teams WHERE user_id = day1_team.user_id AND tournament_day = 2) THEN
            CONTINUE;
        END IF;

        SELECT COALESCE(SUM(COALESCE(p.fantasy_cost, 15)), 0) INTO total_day1_cost
        FROM public.fantasy_picks fp
        JOIN public.players p ON p.id = fp.player_id
        WHERE fp.fantasy_team_id = day1_team.id;

        INSERT INTO public.fantasy_teams (
            user_id,
            name,
            tournament_day,
            carried_over_budget,
            transfers_made,
            penalty_points
        ) VALUES (
            day1_team.user_id,
            day1_team.name,
            2,
            GREATEST(0, 100 - total_day1_cost),
            0,
            0
        ) RETURNING id INTO new_team_id;

        INSERT INTO public.fantasy_picks (fantasy_team_id, player_id, is_captain)
        SELECT new_team_id, player_id, is_captain
        FROM public.fantasy_picks
        WHERE fantasy_team_id = day1_team.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

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
