-- Migration: Add credits system to profiles table
-- This migration adds credit tracking for the pay-per-use model

-- Add credits column with default of 1 free credit for new users
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 1;

-- Add total credits purchased tracking
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS total_credits_purchased INTEGER DEFAULT 0;

-- Give existing users 1 free credit if they don't have any
UPDATE profiles
SET credits = 1
WHERE credits IS NULL;

-- Ensure total_credits_purchased has a default
UPDATE profiles
SET total_credits_purchased = 0
WHERE total_credits_purchased IS NULL;

-- Add index for credit queries
CREATE INDEX IF NOT EXISTS idx_profiles_credits ON profiles(credits);
