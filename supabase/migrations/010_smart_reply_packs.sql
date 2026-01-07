-- Add purchased_reply_packs column for Smart Reply bundle purchases
-- Each pack gives 5 additional replies

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS purchased_reply_packs INTEGER DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN profiles.purchased_reply_packs IS 'Number of reply packs purchased (5 replies each)';
