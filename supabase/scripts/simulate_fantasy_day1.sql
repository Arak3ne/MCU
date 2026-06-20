-- Simulation jour 1 fantasy : 1 seul match, score brut (pas de normalisation)
--
-- Joueurs (par pseudo) : Dindon#Canna, Neviir, PepZedz, MCU Candy
-- Tous dans le même match J1 → 15 pts brut chacun → 15 effectif
--
-- Usage : coller dans Supabase SQL Editor, exécuter en entier.
-- game_id 990618000001 réservé à cette simu (nettoyé au début).

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Nettoyage des runs précédents J1
-- ---------------------------------------------------------------------------
DELETE FROM public.match_history
WHERE game_id BETWEEN 990618000001 AND 990618000099;

DELETE FROM public.fantasy_player_scores fps
USING public.players p
WHERE fps.player_id = p.id
  AND fps.tournament_day = 1
  AND p.pseudo ILIKE ANY (ARRAY['Dindon#Canna', 'Neviir', 'PepZedz', 'MCU Candy']);

-- ---------------------------------------------------------------------------
-- 2. Un match J1, 4 participants, scores bruts
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  rec RECORD;
  mid uuid;
  gid bigint := 990618000001;
  pts_per_match numeric := 15;
  found_count integer;
BEGIN
  SELECT COUNT(*)::integer INTO found_count
  FROM public.players p
  WHERE p.pseudo ILIKE ANY (ARRAY['Dindon#Canna', 'Neviir', 'PepZedz', 'MCU Candy']);

  IF found_count <> 4 THEN
    RAISE EXCEPTION
      'Attendu 4 joueurs, trouvé %. Vérifie les pseudos en base : Dindon#Canna, Neviir, PepZedz, MCU Candy',
      found_count;
  END IF;

  INSERT INTO public.match_history (
    game_id,
    game_creation,
    game_duration,
    game_mode,
    game_type,
    tournament_day
  )
  VALUES (
    gid,
    NOW(),
    1800,
    'CLASSIC',
    'CUSTOM_GAME',
    1
  )
  RETURNING id INTO mid;

  FOR rec IN
    SELECT p.id, p.pseudo
    FROM public.players p
    WHERE p.pseudo ILIKE ANY (ARRAY['Dindon#Canna', 'Neviir', 'PepZedz', 'MCU Candy'])
    ORDER BY p.pseudo
  LOOP
    INSERT INTO public.match_participants (
      match_id,
      player_id,
      kills,
      deaths,
      assists,
      total_damage_dealt_to_champions,
      win,
      first_blood_kill,
      vision_score,
      gold_earned,
      total_minions_killed,
      team_id
    )
    VALUES (
      mid,
      rec.id,
      2, 0, 2,
      0,
      true,
      false,
      0,
      0,
      0,
      100
    );

    INSERT INTO public.fantasy_player_scores (
      player_id,
      tournament_day,
      score,
      validated,
      updated_at
    )
    VALUES (
      rec.id,
      1,
      pts_per_match,
      true,
      NOW()
    )
    ON CONFLICT (player_id, tournament_day)
    DO UPDATE SET
      score = EXCLUDED.score,
      validated = true,
      updated_at = NOW();
  END LOOP;

  RAISE NOTICE 'Simulation J1 OK : 1 match (game_id %), 4 joueurs × % pts', gid, pts_per_match;
END $$;

-- ---------------------------------------------------------------------------
-- 3. Recalcul totaux équipes jour 1 (J1 = score brut, pas de normalisation)
-- ---------------------------------------------------------------------------
UPDATE public.fantasy_teams ft
SET total_points = sub.team_total - COALESCE(ft.penalty_points, 0)
FROM (
  SELECT
    fp.fantasy_team_id,
    COALESCE(SUM(
      CASE
        WHEN fp.is_captain THEN COALESCE(fps.score, 0) * 1.5
        ELSE COALESCE(fps.score, 0)
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

-- ---------------------------------------------------------------------------
-- 4. Verrouiller les équipes J1 (sinon l'app reste sur l'écran Draft)
--    En prod c'est sync-match-results qui fait ce UPDATE au 1er match.
-- ---------------------------------------------------------------------------
UPDATE public.fantasy_teams
SET is_locked = true, updated_at = NOW()
WHERE tournament_day = 1;

COMMIT;

-- ---------------------------------------------------------------------------
-- 5. Vérification (attendu : score_effectif = score_brut = 15)
-- ---------------------------------------------------------------------------
SELECT
  p.pseudo,
  fps.score AS score_brut_j1,
  fps.score AS score_effectif_j1,
  CASE
    WHEN fps.score = 15 THEN 'OK'
    ELSE 'KO'
  END AS check_j1
FROM public.players p
JOIN public.fantasy_player_scores fps
  ON fps.player_id = p.id
  AND fps.tournament_day = 1
WHERE p.pseudo ILIKE ANY (ARRAY['Dindon#Canna', 'Neviir', 'PepZedz', 'MCU Candy'])
ORDER BY p.pseudo;
