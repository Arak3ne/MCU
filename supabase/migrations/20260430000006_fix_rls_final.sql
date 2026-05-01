-- Drop everything and start fresh for players table
DROP POLICY IF EXISTS "Anyone can insert players" ON players;
DROP POLICY IF EXISTS "Public can view players" ON players;
DROP POLICY IF EXISTS "Anyone can update riot_id" ON players;
DROP POLICY IF EXISTS "Anyone can update players" ON players;
DROP POLICY IF EXISTS "Anyone can select players" ON players;
DROP POLICY IF EXISTS "Users can update their own riot_id" ON players;

-- Allow everything for MVP (we're not using auth.uid() yet)
CREATE POLICY "Enable all for MVP"
    ON players FOR ALL
    USING (true)
    WITH CHECK (true);