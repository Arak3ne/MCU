-- Barème allégé (KDA / win / malus) : recalc scores depuis match_participants + totaux équipes.

CREATE OR REPLACE FUNCTION public.fantasy_match_points(
  p_kills integer,
  p_deaths integer,
  p_assists integer,
  p_cs integer,
  p_win boolean,
  p_first_blood boolean,
  p_vision numeric,
  p_damage numeric,
  p_gold numeric
)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT
    (COALESCE(p_kills, 0) * 2)::numeric
    + (COALESCE(p_assists, 0) * 1)::numeric
    - (COALESCE(p_deaths, 0) * 2)::numeric
    + (COALESCE(p_cs, 0)::numeric * 0.02)
    + CASE WHEN COALESCE(p_win, false) THEN 5::numeric ELSE -3::numeric END
    + CASE WHEN COALESCE(p_first_blood, false) THEN 2::numeric ELSE 0::numeric END
    + (COALESCE(p_vision, 0) * 0.05)
    + (COALESCE(p_damage, 0) * 0.0001)
    + (COALESCE(p_gold, 0) * 0.0001)
    + CASE WHEN COALESCE(p_deaths, 0) >= 10 THEN -18::numeric ELSE 0::numeric END
    + CASE
        WHEN COALESCE(p_kills, 0) = 0
          AND COALESCE(p_assists, 0) = 0
          AND COALESCE(p_deaths, 0) > 0 THEN -8::numeric
        WHEN (COALESCE(p_kills, 0) + COALESCE(p_assists, 0)) < COALESCE(p_deaths, 0) THEN -8::numeric
        ELSE 0::numeric
      END
    + CASE WHEN COALESCE(p_kills, 0) >= 10 THEN 3::numeric ELSE 0::numeric END;
$$;

-- Recalc fantasy_player_scores = somme des matchs (par jour)
WITH per_match AS (
  SELECT
    mp.player_id,
    mh.tournament_day,
    public.fantasy_match_points(
      mp.kills,
      mp.deaths,
      mp.assists,
      mp.total_minions_killed,
      mp.win,
      mp.first_blood_kill,
      mp.vision_score::numeric,
      mp.total_damage_dealt_to_champions::numeric,
      mp.gold_earned::numeric
    ) AS match_pts
  FROM public.match_participants mp
  INNER JOIN public.match_history mh ON mh.id = mp.match_id
  WHERE mp.player_id IS NOT NULL
    AND mh.tournament_day IN (1, 2)
),
totals AS (
  SELECT player_id, tournament_day, SUM(match_pts) AS total
  FROM per_match
  GROUP BY player_id, tournament_day
)
UPDATE public.fantasy_player_scores fps
SET score = t.total,
    updated_at = NOW()
FROM totals t
WHERE fps.player_id = t.player_id
  AND fps.tournament_day = t.tournament_day;

INSERT INTO public.fantasy_player_scores (player_id, tournament_day, score, validated, updated_at)
SELECT t.player_id, t.tournament_day, t.total, true, NOW()
FROM (
  SELECT player_id, tournament_day, SUM(match_pts) AS total
  FROM (
    SELECT
      mp.player_id,
      mh.tournament_day,
      public.fantasy_match_points(
        mp.kills, mp.deaths, mp.assists, mp.total_minions_killed,
        mp.win, mp.first_blood_kill,
        mp.vision_score::numeric,
        mp.total_damage_dealt_to_champions::numeric,
        mp.gold_earned::numeric
      ) AS match_pts
    FROM public.match_participants mp
    INNER JOIN public.match_history mh ON mh.id = mp.match_id
    WHERE mp.player_id IS NOT NULL AND mh.tournament_day IN (1, 2)
  ) x
  GROUP BY player_id, tournament_day
) t
WHERE NOT EXISTS (
  SELECT 1 FROM public.fantasy_player_scores fps
  WHERE fps.player_id = t.player_id AND fps.tournament_day = t.tournament_day
);

-- Jour 1 : totaux équipes
UPDATE public.fantasy_teams ft
SET total_points = sub.team_total - COALESCE(ft.penalty_points, 0)
FROM (
  SELECT
    fp.fantasy_team_id,
    COALESCE(SUM(
      CASE
        WHEN fp.is_captain THEN public.fantasy_effective_player_score(fps.player_id, fps.tournament_day, fps.score) * 1.5
        ELSE public.fantasy_effective_player_score(fps.player_id, fps.tournament_day, fps.score)
      END
    ), 0) AS team_total
  FROM public.fantasy_picks fp
  JOIN public.fantasy_player_scores fps
    ON fps.player_id = fp.player_id
    AND fps.tournament_day = 1
  GROUP BY fp.fantasy_team_id
) sub
WHERE ft.id = sub.fantasy_team_id
  AND ft.tournament_day = 1;

-- Jour 2 : cumul J1 + roster J2 normalisé
UPDATE public.fantasy_teams ft2
SET total_points =
  COALESCE(d1.total_points, 0)
  + public.fantasy_team_roster_points(ft2.id, 2)
  - COALESCE(ft2.penalty_points, 0)
FROM public.fantasy_teams d1
WHERE ft2.tournament_day = 2
  AND d1.user_id = ft2.user_id
  AND d1.tournament_day = 1;
