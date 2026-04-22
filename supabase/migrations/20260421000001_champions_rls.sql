ALTER TABLE champions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON champions
    FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for all users" ON champions
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON champions
    FOR UPDATE
    USING (true)
    WITH CHECK (true);
