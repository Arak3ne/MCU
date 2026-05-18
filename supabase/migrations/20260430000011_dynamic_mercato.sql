-- Migration: Dynamic Mercato Schema Updates
-- Adds columns to support Day 2 dynamic pricing and transfer limits

-- 1. Add Day 2 price to players table (nom aligné sur players_rows.sql)
ALTER TABLE public.players
ADD COLUMN IF NOT EXISTS fantasy_cost_day2 INT;

-- 2. Add transfer and budget tracking to fantasy_teams table
ALTER TABLE public.fantasy_teams
ADD COLUMN IF NOT EXISTS transfers_made INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS penalty_points INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS carried_over_budget INT DEFAULT 0;

-- 3. Update the calculate_fantasy_team_points trigger to subtract penalty_points
CREATE OR REPLACE FUNCTION calculate_fantasy_team_points()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE fantasy_teams ft
    SET total_points = (
        SELECT COALESCE(SUM(
            CASE 
                WHEN fp.is_captain THEN fps.score * 1.5 
                ELSE fps.score 
            END
        ), 0)
        FROM fantasy_picks fp
        JOIN fantasy_player_scores fps 
            ON fps.player_id = fp.player_id 
            AND fps.tournament_day = ft.tournament_day
        WHERE fp.fantasy_team_id = ft.id
    ) - COALESCE(ft.penalty_points, 0)
    WHERE EXISTS (
        SELECT 1 FROM fantasy_picks fp
        WHERE fp.fantasy_team_id = ft.id
        AND fp.player_id = NEW.player_id
    )
    AND ft.tournament_day = NEW.tournament_day;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
