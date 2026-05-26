-- Auction: store MCU coin price on players
-- team_id FK already exists (see 20260501000004_live_match_teams.sql)

ALTER TABLE players
  ADD COLUMN IF NOT EXISTS auction_price INT NOT NULL DEFAULT 0;

ALTER TABLE players
  ADD CONSTRAINT players_auction_price_nonnegative CHECK (auction_price >= 0);

