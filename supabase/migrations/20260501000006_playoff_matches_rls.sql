-- Playoff matches policies
ALTER TABLE playoff_matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view playoff_matches" ON playoff_matches;
DROP POLICY IF EXISTS "Anyone can modify playoff_matches" ON playoff_matches;

CREATE POLICY "Public can view playoff_matches" ON playoff_matches FOR SELECT USING (true);
CREATE POLICY "Anyone can modify playoff_matches" ON playoff_matches FOR ALL USING (true) WITH CHECK (true);
