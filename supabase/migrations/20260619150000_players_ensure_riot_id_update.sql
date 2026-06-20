-- Garantir que le profil peut mettre à jour riot_id (auth MVP via id joueur côté client).
DROP POLICY IF EXISTS "Enable all for MVP" ON public.players;
DROP POLICY IF EXISTS "Anyone can update players" ON public.players;
DROP POLICY IF EXISTS "Anyone can update riot_id" ON public.players;
DROP POLICY IF EXISTS "Users can update their own riot_id" ON public.players;

CREATE POLICY "Enable all for MVP"
  ON public.players
  FOR ALL
  USING (true)
  WITH CHECK (true);
