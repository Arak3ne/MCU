-- Autorise _arak_ à spectater toutes les drafts (à exécuter sur le projet Supabase prod).
-- Vérifie d'abord la ligne ciblée :
--   SELECT id, pseudo, discord, can_spectate_drafts FROM public.players WHERE discord ILIKE '%arak%';

UPDATE public.players
SET can_spectate_drafts = true
WHERE discord ILIKE '_arak_'
   OR pseudo ILIKE '_arak_';

-- Pour retirer l'accès :
-- UPDATE public.players SET can_spectate_drafts = false WHERE discord ILIKE '_arak_';
