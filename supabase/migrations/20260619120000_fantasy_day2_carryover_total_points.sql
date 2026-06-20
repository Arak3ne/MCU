-- Jour 2 : total_points = total jour 1 + points matchs jour 2 (normalisés) − pénalités mercato.

CREATE OR REPLACE FUNCTION public.fantasy_team_roster_points(
  p_fantasy_team_id uuid,
  p_tournament_day integer
)
RETURNS numeric
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(SUM(
    CASE
      WHEN fp.is_captain THEN
        public.fantasy_effective_player_score(fps.player_id, fps.tournament_day, fps.score) * 1.5
      ELSE
        public.fantasy_effective_player_score(fps.player_id, fps.tournament_day, fps.score)
    END
  ), 0)
  FROM public.fantasy_picks fp
  JOIN public.fantasy_player_scores fps
    ON fps.player_id = fp.player_id
    AND fps.tournament_day = p_tournament_day
  WHERE fp.fantasy_team_id = p_fantasy_team_id;
$$;

CREATE OR REPLACE FUNCTION public.calculate_fantasy_team_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.fantasy_teams ft
  SET total_points =
    CASE
      WHEN ft.tournament_day = 2 THEN
        COALESCE((
          SELECT d1.total_points
          FROM public.fantasy_teams d1
          WHERE d1.user_id = ft.user_id
            AND d1.tournament_day = 1
          ORDER BY d1.updated_at DESC NULLS LAST, d1.created_at DESC
          LIMIT 1
        ), 0)
      ELSE 0
    END
    + public.fantasy_team_roster_points(ft.id, ft.tournament_day)
    - COALESCE(ft.penalty_points, 0)
  WHERE EXISTS (
    SELECT 1
    FROM public.fantasy_picks fp
    WHERE fp.fantasy_team_id = ft.id
      AND fp.player_id = NEW.player_id
  )
  AND ft.tournament_day = NEW.tournament_day;

  RETURN NEW;
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
    IF EXISTS (
      SELECT 1 FROM public.fantasy_teams
      WHERE user_id = day1_team.user_id AND tournament_day = 2
    ) THEN
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
      total_points,
      carried_over_budget,
      transfers_made,
      penalty_points
    ) VALUES (
      day1_team.user_id,
      day1_team.name,
      2,
      COALESCE(day1_team.total_points, 0),
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

-- Équipes J2 déjà créées : repartir du total J1 + contributions J2.
UPDATE public.fantasy_teams ft2
SET total_points =
  COALESCE(d1.total_points, 0)
  + public.fantasy_team_roster_points(ft2.id, 2)
  - COALESCE(ft2.penalty_points, 0)
FROM public.fantasy_teams d1
WHERE ft2.tournament_day = 2
  AND d1.user_id = ft2.user_id
  AND d1.tournament_day = 1;
