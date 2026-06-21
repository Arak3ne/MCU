-- À lancer AVANT de resynchroniser les matchs (après suppression match_history / participants).
-- Remet scores joueurs et totaux équipes à zéro ; le sync recalculera via barème léger.

UPDATE public.fantasy_player_scores SET score = 0, updated_at = NOW();

UPDATE public.fantasy_teams
SET total_points = -COALESCE(penalty_points, 0),
    updated_at = NOW()
WHERE tournament_day = 1;

UPDATE public.fantasy_teams ft2
SET total_points = COALESCE(d1.total_points, 0) - COALESCE(ft2.penalty_points, 0),
    updated_at = NOW()
FROM public.fantasy_teams d1
WHERE ft2.tournament_day = 2
  AND d1.user_id = ft2.user_id
  AND d1.tournament_day = 1;

-- Ordre recommandé après suppression des matchs :
-- 1. reset_fantasy_before_resync.sql  (scores à zéro)
-- 2. Resync LCU (edge sync-match-results, barème léger + recalc par joueur)
-- 3. Si besoin : SELECT public.recalculate_fantasy_scores_from_matches();
