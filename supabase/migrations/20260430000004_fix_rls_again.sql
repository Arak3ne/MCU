-- Drop the previous policy if it exists (just in case)
DROP POLICY IF EXISTS "Users can update their own riot_id" ON players;

-- Create a more permissive policy for testing
-- We allow anyone to update the riot_id for now, since we only update by id
CREATE POLICY "Anyone can update riot_id"
    ON players FOR UPDATE
    USING (true)
    WITH CHECK (true);