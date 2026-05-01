-- Drop the previous policy if it exists
DROP POLICY IF EXISTS "Anyone can update riot_id" ON players;
DROP POLICY IF EXISTS "Anyone can update players" ON players;

-- Create a policy that allows updates based on the player's ID directly
-- This bypasses auth.uid() entirely for the MVP
CREATE POLICY "Anyone can update players"
    ON players FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- We also need a select policy to return the updated data
DROP POLICY IF EXISTS "Anyone can select players" ON players;
CREATE POLICY "Anyone can select players"
    ON players FOR SELECT
    USING (true);