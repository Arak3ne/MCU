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
