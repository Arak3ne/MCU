-- Migration: Add power ranking fields to players table

ALTER TABLE players 
ADD COLUMN IF NOT EXISTS tier_skill text,
ADD COLUMN IF NOT EXISTS tier_champion_pool text,
ADD COLUMN IF NOT EXISTS tier_game_knowledge text,
ADD COLUMN IF NOT EXISTS tier_teamplay text,
ADD COLUMN IF NOT EXISTS tier_mental text,
ADD COLUMN IF NOT EXISTS power_ranking_tags text[] DEFAULT '{}';
