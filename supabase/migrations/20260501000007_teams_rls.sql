-- Ensure RLS is enabled but explicitly allow public read access for these core tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_match ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid errors
DROP POLICY IF EXISTS "Public can view teams" ON teams;
DROP POLICY IF EXISTS "Public can view live_match" ON live_match;

-- Create policies that allow anyone to select (read)
CREATE POLICY "Public can view teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Public can view live_match" ON live_match FOR SELECT USING (true);

-- For admin operations, we'll temporarily allow anon to update/insert for the sake of the MVP
-- In a real production app, this would be restricted to authenticated admin users
DROP POLICY IF EXISTS "Anyone can update teams" ON teams;
DROP POLICY IF EXISTS "Anyone can insert teams" ON teams;
DROP POLICY IF EXISTS "Anyone can update live_match" ON live_match;

CREATE POLICY "Anyone can update teams" ON teams FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert teams" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update live_match" ON live_match FOR UPDATE USING (true);
