-- Jour 2 fantasy : score effectif = (total brut / nb matchs joués) × 4.
-- Jour 1 inchangé (total brut cumulé).

ALTER TABLE public.match_history
  ADD COLUMN IF NOT EXISTS tournament_day integer
  CHECK (tournament_day IS NULL OR tournament_day IN (1, 2));

COMMENT ON COLUMN public.match_history.tournament_day IS
  'Jour fantasy (1=championship, 2=groupes+knockout). Renseigné à l''import LCU.';

-- Données existantes sans tag : considérées jour 1 pour le décompte.
UPDATE public.match_history
SET tournament_day = 1
WHERE tournament_day IS NULL;

CREATE OR REPLACE FUNCTION public.fantasy_player_day2_match_count(p_player_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::integer
  FROM public.match_participants mp
  INNER JOIN public.match_history mh ON mh.id = mp.match_id
  WHERE mp.player_id = p_player_id
    AND mh.tournament_day = 2;
$$;

CREATE OR REPLACE FUNCTION public.fantasy_effective_player_score(
  p_player_id uuid,
  p_tournament_day integer,
  p_raw_score numeric
)
RETURNS numeric
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  match_count integer;
BEGIN
  IF p_tournament_day IS DISTINCT FROM 2 THEN
    RETURN COALESCE(p_raw_score, 0);
  END IF;

  match_count := public.fantasy_player_day2_match_count(p_player_id);

  IF match_count <= 0 THEN
    RETURN COALESCE(p_raw_score, 0);
  END IF;

  RETURN ROUND((COALESCE(p_raw_score, 0) / match_count) * 4, 1);
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_fantasy_team_points()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE fantasy_teams ft
    SET total_points = (
        SELECT COALESCE(SUM(
            CASE
                WHEN fp.is_captain THEN
                    public.fantasy_effective_player_score(fps.player_id, fps.tournament_day, fps.score) * 1.5
                ELSE
                    public.fantasy_effective_player_score(fps.player_id, fps.tournament_day, fps.score)
            END
        ), 0)
        FROM fantasy_picks fp
        JOIN fantasy_player_scores fps
            ON fps.player_id = fp.player_id
            AND fps.tournament_day = ft.tournament_day
        WHERE fp.fantasy_team_id = ft.id
    ) - COALESCE(ft.penalty_points, 0)
    WHERE EXISTS (
        SELECT 1 FROM fantasy_picks fp
        WHERE fp.fantasy_team_id = ft.id
        AND fp.player_id = NEW.player_id
    )
    AND ft.tournament_day = NEW.tournament_day;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recalcul des totaux équipes jour 2 avec la nouvelle formule.
UPDATE public.fantasy_teams ft
SET total_points = sub.team_total - COALESCE(ft.penalty_points, 0)
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
    FROM fantasy_picks fp
    JOIN fantasy_player_scores fps
        ON fps.player_id = fp.player_id
        AND fps.tournament_day = 2
    GROUP BY fp.fantasy_team_id
) sub
WHERE ft.id = sub.fantasy_team_id
  AND ft.tournament_day = 2;
