-- Garantir les colonnes mercato sur fantasy_teams (si une vieille DB a sauté 20260430000011 par ex.).
-- Nom technique : carried_over_budget = « budget restant » après la draft jour 1 (100 − Σ coûts picks).

ALTER TABLE public.fantasy_teams
  ADD COLUMN IF NOT EXISTS transfers_made integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS penalty_points integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS carried_over_budget integer DEFAULT 0;

COMMENT ON COLUMN public.fantasy_teams.carried_over_budget IS
  'Budget restant jour 1 après achat équipe (100 − Σ fantasy_cost des picks). Reliquat pour le mercato jour 2 ; mis à jour par snapshot_day1_carryover_budget.';
COMMENT ON COLUMN public.fantasy_teams.transfers_made IS 'Nombre de transferts effectués jour 2.';
COMMENT ON COLUMN public.fantasy_teams.penalty_points IS 'Pénalité fantasy (pts) appliquée au total jour 2.';

ALTER TABLE public.fantasy_teams
  ALTER COLUMN carried_over_budget SET DEFAULT 0;
