-- Spectateur draft global : accès à toutes les draft rooms (sans être dans l'une des deux équipes).
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS can_spectate_drafts boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.players.can_spectate_drafts IS
  'Si true, le joueur peut ouvrir /draft/:sessionId pour n''importe quel match (mode spectateur).';
