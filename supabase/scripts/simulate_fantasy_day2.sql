-- Simulation jour 2 fantasy : normalisation (brut / nb matchs) × 4
--
-- Joueurs (par pseudo, pas Riot ID) :
--   Dindon#Canna, Neviir  → 2 matchs J2 (éliminés tôt)
--   PepZedz, MCU Candy    → 4 matchs J2 (finaliste)
--
-- Chaque match rapporte 15 pts brut → attendu après normalisation :
--   2 matchs : 30 brut → 60 effectif
--   4 matchs : 60 brut → 60 effectif
--
-- Prérequis optionnel (prod) : migration 20260619000000_fantasy_day2_score_normalization.sql
-- Ce script calcule la normalisation en SQL inline (pas besoin des fonctions PG).
--
-- Usage : coller dans Supabase SQL Editor, exécuter en entier.
-- Les game_id 990619000xxx sont réservés à cette simu (nettoyés au début).

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Nettoyage des runs précédents
-- ---------------------------------------------------------------------------
DELETE FROM public.match_history
WHERE game_id BETWEEN 990619000001 AND 990619000099;

DELETE FROM public.fantasy_player_scores fps
USING public.players p
WHERE fps.player_id = p.id
  AND fps.tournament_day = 2
  AND p.pseudo ILIKE ANY (ARRAY['Dindon#Canna', 'Neviir', 'PepZedz', 'MCU Candy']);

-- ---------------------------------------------------------------------------
-- 2. Insertion matchs J2 + participants + scores bruts
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  rec RECORD;
  i integer;
  gid bigint;
  mid uuid;
  pts_per_match numeric := 15;
  game_id_seq integer := 0;
  raw_total numeric;
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

  FOR rec IN
    SELECT
      p.id,
      p.pseudo,
      CASE
        WHEN p.pseudo ILIKE 'Dindon#Canna' THEN 2
        WHEN p.pseudo ILIKE 'Neviir' THEN 2
        WHEN p.pseudo ILIKE 'PepZedz' THEN 4
        WHEN p.pseudo ILIKE 'MCU Candy' THEN 4
        ELSE 0
      END AS n_matches
    FROM public.players p
    WHERE p.pseudo ILIKE ANY (ARRAY['Dindon#Canna', 'Neviir', 'PepZedz', 'MCU Candy'])
    ORDER BY p.pseudo
  LOOP
    IF rec.n_matches <= 0 THEN
      RAISE EXCEPTION 'Nb matchs inconnu pour %', rec.pseudo;
    END IF;

    raw_total := 0;

    FOR i IN 1..rec.n_matches LOOP
      game_id_seq := game_id_seq + 1;
      gid := 990619000000 + game_id_seq;

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
        NOW() - (game_id_seq || ' minutes')::interval,
        1800,
        'CLASSIC',
        'CUSTOM_GAME',
        2
      )
      RETURNING id INTO mid;

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

      raw_total := raw_total + pts_per_match;
    END LOOP;

    INSERT INTO public.fantasy_player_scores (
      player_id,
      tournament_day,
      score,
      validated,
      updated_at
    )
    VALUES (
      rec.id,
      2,
      raw_total,
      true,
      NOW()
    )
    ON CONFLICT (player_id, tournament_day)
    DO UPDATE SET
      score = EXCLUDED.score,
      validated = true,
      updated_at = NOW();
  END LOOP;

  RAISE NOTICE 'Simulation OK : % matchs J2 insérés (game_id 990619000001–990619000%)',
    game_id_seq,
    LPAD(game_id_seq::text, 3, '0');
END $$;

-- ---------------------------------------------------------------------------
-- 3. Recalcul totaux équipes jour 2 (total J1 + contributions J2 normalisées)
-- ---------------------------------------------------------------------------
UPDATE public.fantasy_teams ft2
SET total_points =
  COALESCE(d1.total_points, 0)
  + sub.j2_roster_sum
  - COALESCE(ft2.penalty_points, 0)
FROM public.fantasy_teams d1
JOIN (
  SELECT
    fp.fantasy_team_id,
    COALESCE(SUM(
      CASE
        WHEN fp.is_captain THEN
          public.fantasy_effective_player_score(fps.player_id, fps.tournament_day, fps.score) * 1.5
        ELSE
          public.fantasy_effective_player_score(fps.player_id, fps.tournament_day, fps.score)
      END
    ), 0) AS j2_roster_sum
  FROM public.fantasy_picks fp
  JOIN public.fantasy_player_scores fps
    ON fps.player_id = fp.player_id
    AND fps.tournament_day = 2
  GROUP BY fp.fantasy_team_id
) sub ON sub.fantasy_team_id = ft2.id
WHERE ft2.tournament_day = 2
  AND d1.user_id = ft2.user_id
  AND d1.tournament_day = 1;

-- ---------------------------------------------------------------------------
-- 4. Verrouiller les équipes J2 (sinon l'app reste sur le mercato / draft)
-- ---------------------------------------------------------------------------
UPDATE public.fantasy_teams
SET is_locked = true, updated_at = NOW()
WHERE tournament_day = 2;

COMMIT;

-- ---------------------------------------------------------------------------
-- 5. Vérification (résultat attendu : score_effectif = 60 pour les 4)
-- ---------------------------------------------------------------------------
SELECT
  p.pseudo,
  fps.score AS score_brut_j2,
  public.fantasy_player_day2_match_count(p.id) AS nb_matchs_j2,
  public.fantasy_effective_player_score(p.id, 2, fps.score) AS score_effectif_j2,
  CASE
    WHEN public.fantasy_effective_player_score(p.id, 2, fps.score) = 60 THEN 'OK'
    ELSE 'KO'
  END AS check_normalisation
FROM public.players p
JOIN public.fantasy_player_scores fps
  ON fps.player_id = p.id
  AND fps.tournament_day = 2
WHERE p.pseudo ILIKE ANY (ARRAY['Dindon#Canna', 'Neviir', 'PepZedz', 'MCU Candy'])
ORDER BY p.pseudo;
