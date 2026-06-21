-- Crée les lignes fantasy_teams J2 manquantes à partir du roster J1 (mercato non visité).
-- Appelée avant verrouillage J2 (admin / sync) et à la connexion fantasy d'un joueur.

CREATE OR REPLACE FUNCTION public._ensure_day2_team_for_user_internal(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  day1_team public.fantasy_teams%ROWTYPE;
  new_team_id uuid;
  existing_day2_id uuid;
  total_day1_cost integer;
  carry integer;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT id INTO existing_day2_id
  FROM public.fantasy_teams
  WHERE user_id = p_user_id AND tournament_day = 2
  ORDER BY created_at DESC
  LIMIT 1;

  IF existing_day2_id IS NOT NULL THEN
    RETURN existing_day2_id;
  END IF;

  SELECT * INTO day1_team
  FROM public.fantasy_teams
  WHERE user_id = p_user_id AND tournament_day = 1
  ORDER BY created_at DESC
  LIMIT 1;

  IF day1_team.id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(SUM(COALESCE(p.fantasy_cost, 15)), 0)::integer INTO total_day1_cost
  FROM public.fantasy_picks fp
  JOIN public.players p ON p.id = fp.player_id
  WHERE fp.fantasy_team_id = day1_team.id;

  carry := COALESCE(
    day1_team.carried_over_budget,
    GREATEST(0, 100 - total_day1_cost)
  );

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
    carry,
    0,
    0
  ) RETURNING id INTO new_team_id;

  INSERT INTO public.fantasy_picks (fantasy_team_id, player_id, is_captain)
  SELECT new_team_id, player_id, is_captain
  FROM public.fantasy_picks
  WHERE fantasy_team_id = day1_team.id;

  RETURN new_team_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_day2_team_for_user(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'ensure_day2_team_for_user: accès refusé';
  END IF;

  RETURN public._ensure_day2_team_for_user_internal(p_user_id);
END;
$$;

DROP FUNCTION IF EXISTS public.initialize_day2_teams();

CREATE OR REPLACE FUNCTION public.initialize_day2_teams()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  day1_user RECORD;
  created_count integer := 0;
  had_day2 boolean;
BEGIN
  FOR day1_user IN
    SELECT DISTINCT user_id
    FROM public.fantasy_teams
    WHERE tournament_day = 1
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM public.fantasy_teams
      WHERE user_id = day1_user.user_id AND tournament_day = 2
    ) INTO had_day2;

    IF NOT had_day2 THEN
      PERFORM public._ensure_day2_team_for_user_internal(day1_user.user_id);
      created_count := created_count + 1;
    END IF;
  END LOOP;

  RETURN created_count;
END;
$$;

COMMENT ON FUNCTION public.ensure_day2_team_for_user(uuid) IS
  'Crée la ligne fantasy_teams J2 + picks copiés depuis J1 si absente pour cet utilisateur.';

COMMENT ON FUNCTION public.initialize_day2_teams() IS
  'Crée les lignes J2 manquantes pour toutes les équipes J1. Retourne le nombre de lignes créées.';

GRANT EXECUTE ON FUNCTION public.ensure_day2_team_for_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.initialize_day2_teams() TO authenticated;
