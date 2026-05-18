-- Migration: Dynamic Mercato Functions
-- Adds functions to calculate Day 2 prices and initialize Day 2 teams

-- 1. Function to calculate and update Day 2 prices
CREATE OR REPLACE FUNCTION public.calculate_day2_prices()
RETURNS void AS $$
DECLARE
    total_players INT;
    top_20_threshold INT;
    bottom_20_threshold INT;
BEGIN
    -- Get total number of players with validated scores for Day 1
    SELECT COUNT(*) INTO total_players
    FROM public.fantasy_player_scores
    WHERE tournament_day = 1 AND validated = true;

    IF total_players = 0 THEN
        RAISE NOTICE 'No validated scores found for Day 1.';
        RETURN;
    END IF;

    top_20_threshold := CEIL(total_players * 0.2);
    bottom_20_threshold := CEIL(total_players * 0.2);

    -- Update prices using a CTE with window functions
    WITH ranked_players AS (
        SELECT 
            fps.player_id,
            COALESCE(p.fantasy_cost, 15) AS base_cost,
            fps.score,
            ROW_NUMBER() OVER (ORDER BY fps.score DESC) as rank_desc,
            ROW_NUMBER() OVER (ORDER BY fps.score ASC) as rank_asc
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

    -- For players without Day 1 scores, just copy their Day 1 price
    UPDATE public.players
    SET fantasy_cost_day2 = COALESCE(fantasy_cost, 15)
    WHERE fantasy_cost_day2 IS NULL;

END;
$$ LANGUAGE plpgsql;

-- 2. Function to initialize Day 2 teams from Day 1 rosters
CREATE OR REPLACE FUNCTION public.initialize_day2_teams()
RETURNS void AS $$
DECLARE
    day1_team RECORD;
    new_team_id UUID;
    total_day1_cost INT;
BEGIN
    -- Loop through all Day 1 teams
    FOR day1_team IN 
        SELECT * FROM public.fantasy_teams WHERE tournament_day = 1
    LOOP
        -- Check if Day 2 team already exists for this user
        IF EXISTS (SELECT 1 FROM public.fantasy_teams WHERE user_id = day1_team.user_id AND tournament_day = 2) THEN
            CONTINUE; -- Skip if already exists
        END IF;

        -- Calculate total cost of Day 1 roster
        SELECT COALESCE(SUM(COALESCE(p.fantasy_cost, 15)), 0) INTO total_day1_cost
        FROM public.fantasy_picks fp
        JOIN public.players p ON p.id = fp.player_id
        WHERE fp.fantasy_team_id = day1_team.id;

        -- Insert Day 2 team
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
            GREATEST(0, 100 - total_day1_cost), -- Carried over budget
            0,
            0
        ) RETURNING id INTO new_team_id;

        -- Copy picks
        INSERT INTO public.fantasy_picks (fantasy_team_id, player_id, is_captain)
        SELECT new_team_id, player_id, is_captain
        FROM public.fantasy_picks
        WHERE fantasy_team_id = day1_team.id;

    END LOOP;
END;
$$ LANGUAGE plpgsql;
