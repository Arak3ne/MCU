-- Add draft_picks to playoff_matches
ALTER TABLE playoff_matches ADD COLUMN draft_picks TEXT[] DEFAULT '{}';
