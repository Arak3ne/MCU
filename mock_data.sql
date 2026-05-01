-- Bypass RLS
UPDATE fantasy_teams SET is_locked = true WHERE tournament_day = 1;

-- Give random scores (10 to 30 points) to players who are in teams
INSERT INTO fantasy_player_scores (player_id, tournament_day, score, validated)
SELECT DISTINCT fp.player_id, 1, FLOOR(RANDOM() * 20 + 10), true
FROM fantasy_picks fp
JOIN fantasy_teams ft ON ft.id = fp.fantasy_team_id
WHERE ft.tournament_day = 1
ON CONFLICT (player_id, tournament_day)
DO UPDATE SET score = fantasy_player_scores.score + EXCLUDED.score, validated = true;
