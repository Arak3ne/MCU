-- 0. Ensure score column exists before trigger
ALTER TABLE fantasy_player_scores ADD COLUMN IF NOT EXISTS score numeric DEFAULT 0;

-- 1. Modify total_points in fantasy_teams to be numeric
ALTER TABLE fantasy_teams ALTER COLUMN total_points TYPE numeric USING total_points::numeric;
ALTER TABLE fantasy_teams ALTER COLUMN total_points SET DEFAULT 0;

-- 2. Create function to recalculate team points (fantasy_picks ; pas de colonne players[])
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
    )
    WHERE EXISTS (
        SELECT 1 FROM fantasy_picks fp
        WHERE fp.fantasy_team_id = ft.id
        AND fp.player_id = NEW.player_id
    )
    AND ft.tournament_day = NEW.tournament_day;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create trigger
DROP TRIGGER IF EXISTS trigger_fantasy_player_score_update ON fantasy_player_scores;

CREATE TRIGGER trigger_fantasy_player_score_update
AFTER INSERT OR UPDATE OF score ON fantasy_player_scores
FOR EACH ROW
EXECUTE FUNCTION calculate_fantasy_team_points();
