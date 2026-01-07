-- Migration: Update default credits for new users to 2
-- Part of Value Leader pricing update

-- Update default credits for new users from 1 to 2
ALTER TABLE profiles
ALTER COLUMN credits SET DEFAULT 2.00;

-- Note: This only affects NEW users. Existing users keep their current credits.
