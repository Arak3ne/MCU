-- Recalcule tous les scores fantasy (barème léger) depuis match_participants.
-- À appeler après suppression de matchs + resync, ou pour corriger les anciens totaux gonflés.

CREATE OR REPLACE FUNCTION public.recalculate_fantasy_scores_from_matches()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Joueurs sans match : score 0
  UPDATE public.fantasy_player_scores fps
  SET score = 0,
      updated_at = NOW()
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.match_participants mp
    INNER JOIN public.match_history mh ON mh.id = mp.match_id
    WHERE mp.player_id = fps.player_id
      AND mh.tournament_day = fps.tournament_day
  );

  -- Somme barème léger par joueur / jour
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
      validated = true,
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

  -- Totaux équipes J1
  UPDATE public.fantasy_teams ft
  SET total_points = sub.team_total - COALESCE(ft.penalty_points, 0),
      updated_at = NOW()
  FROM (
    SELECT
      fp.fantasy_team_id,
      COALESCE(SUM(
        CASE
          WHEN fp.is_captain THEN
            public.fantasy_effective_player_score(fps.player_id, fps.tournament_day, fps.score) * 1.5
          ELSE
            public.fantasy_effective_player_score(fps.player_id, fps.tournament_day, fps.score)
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

  -- Totaux équipes J2 (cumul J1 + roster J2 normalisé)
  UPDATE public.fantasy_teams ft2
  SET total_points =
    COALESCE(d1.total_points, 0)
    + public.fantasy_team_roster_points(ft2.id, 2)
    - COALESCE(ft2.penalty_points, 0),
    updated_at = NOW()
  FROM public.fantasy_teams d1
  WHERE ft2.tournament_day = 2
    AND d1.user_id = ft2.user_id
    AND d1.tournament_day = 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.recalculate_fantasy_scores_from_matches() TO service_role;
