-- Allow users to update their own riot_id
CREATE POLICY "Users can update their own riot_id"
    ON players FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);