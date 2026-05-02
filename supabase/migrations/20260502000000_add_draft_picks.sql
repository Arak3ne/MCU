-- Add draft_picks to playoff_matches
ALTER TABLE playoff_matches ADD COLUMN IF NOT EXISTS draft_picks TEXT[] DEFAULT '{}';
