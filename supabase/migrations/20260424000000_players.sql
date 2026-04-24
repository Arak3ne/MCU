-- Create players table
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pseudo TEXT NOT NULL,
    discord TEXT NOT NULL UNIQUE,
    primary_role TEXT NOT NULL,
    secondary_role TEXT NOT NULL,
    champion_pool TEXT[] NOT NULL,
    champion_signature TEXT NOT NULL,
    rank TEXT NOT NULL,
    playstyle TEXT NOT NULL,
    mindset TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add simple check constraints
ALTER TABLE players
    ADD CONSTRAINT valid_roles CHECK (
        primary_role IN ('top', 'jungle', 'mid', 'adc', 'support') AND
        secondary_role IN ('top', 'jungle', 'mid', 'adc', 'support') AND
        primary_role != secondary_role
    ),
    ADD CONSTRAINT valid_pool_size CHECK (array_length(champion_pool, 1) <= 5);

-- RLS policies
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (register)
CREATE POLICY "Anyone can insert players"
    ON players FOR INSERT
    WITH CHECK (true);

-- Allow public to view registered players (optional, for overlay/admin)
CREATE POLICY "Public can view players"
    ON players FOR SELECT
    USING (true);
