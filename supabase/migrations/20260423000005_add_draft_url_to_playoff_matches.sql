-- Add draft_url and draft_id to playoff_matches
ALTER TABLE playoff_matches ADD COLUMN IF NOT EXISTS draft_url TEXT;
ALTER TABLE playoff_matches ADD COLUMN IF NOT EXISTS draft_id TEXT;
