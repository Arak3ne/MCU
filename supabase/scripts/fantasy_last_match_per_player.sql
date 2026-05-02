-- Reproduit le comportement du client :
-- - dernière ligne par joueur selon match_history.game_creation DESC
-- - points fantasy comme src/utils/fantasyMatchPoints.ts + sync-match-results
--
-- 1. Remplace le tableau UUID dans `player_id = ANY (...)` par tes 5 picks (ou plusieurs UUID).
-- 2. Variante « tout le monde » : remplace `WHERE mp.player_id = ANY (...)` par `WHERE true`
--    (ou supprime le filtre) pour voir le dernier match connu par joueur MCU.

WITH base AS (
  SELECT
    mp.id AS participant_id,
    mp.player_id,
    mp.match_id,
    mh.game_id,
    mh.game_creation,
    mh.game_duration,
    COALESCE(mp.kills, 0) AS kills,
    COALESCE(mp.deaths, 0) AS deaths,
    COALESCE(mp.assists, 0) AS assists,
    COALESCE(mp.total_minions_killed, 0) AS total_minions_killed,
    COALESCE(mp.win, false) AS win,
    COALESCE(mp.first_blood_kill, false) AS first_blood_kill,
    COALESCE(mp.vision_score, 0) AS vision_score,
    COALESCE(mp.total_damage_dealt_to_champions, 0)::numeric AS dmg,
    COALESCE(mp.gold_earned, 0)::numeric AS gold
  FROM match_participants mp
  INNER JOIN match_history mh ON mh.id = mp.match_id
  WHERE mp.player_id = ANY (
    ARRAY[
      '00000000-0000-0000-0000-000000000001'::uuid
      -- ,'00000000-0000-0000-0000-000000000002'::uuid
    ]::uuid[]
  )
),
latest AS (
  SELECT DISTINCT ON (player_id)
    *
  FROM base
  ORDER BY
    player_id,
    game_creation DESC NULLS LAST,
    participant_id DESC
),
scored AS (
  SELECT
    l.*,
    (
      (l.kills * 2)::numeric +
      (l.assists * 1)::numeric -
      (l.deaths * 2)::numeric +
      (l.total_minions_killed::numeric * 0.02) +
      CASE WHEN l.win THEN 5::numeric ELSE -3::numeric END +
      CASE WHEN l.first_blood_kill THEN 2::numeric ELSE 0 END +
      (l.vision_score::numeric * 0.05) +
      (l.dmg * 0.0001) +
      (l.gold * 0.0001) +
      CASE WHEN l.deaths >= 10 THEN -18::numeric ELSE 0 END +
      CASE
        WHEN l.kills = 0 AND l.assists = 0 AND l.deaths > 0 THEN -8::numeric
        WHEN (l.kills + l.assists) < l.deaths THEN -8::numeric
        ELSE 0::numeric
      END +
      CASE WHEN l.kills >= 10 THEN 3::numeric ELSE 0 END
    ) AS fantasy_points_raw
  FROM latest l
)
SELECT
  s.player_id,
  p.pseudo,
  s.participant_id,
  s.match_id,
  s.game_id,
  s.game_creation,
  s.game_duration,
  s.kills,
  s.deaths,
  s.assists,
  s.total_minions_killed AS cs,
  s.win,
  s.first_blood_kill,
  s.vision_score,
  s.dmg AS total_damage_dealt_to_champions,
  s.gold AS gold_earned,
  s.fantasy_points_raw AS fantasy_points
FROM scored s
LEFT JOIN players p ON p.id = s.player_id
ORDER BY p.pseudo NULLS LAST, s.player_id;
