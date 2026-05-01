-- Fix champion_id type in match_participants to link to champions table

-- 1. Add a temporary column
ALTER TABLE match_participants ADD COLUMN champion_uuid UUID REFERENCES champions(id) ON DELETE SET NULL;

-- 2. Update existing records mapping the INT champion_id to the UUID from champions table
UPDATE match_participants mp
SET champion_uuid = c.id
FROM champions c
WHERE mp.champion_id::text = c.ddragon_key;

-- 3. Drop the old column
ALTER TABLE match_participants DROP COLUMN champion_id;

-- 4. Rename the new column to champion_id
ALTER TABLE match_participants RENAME COLUMN champion_uuid TO champion_id;
