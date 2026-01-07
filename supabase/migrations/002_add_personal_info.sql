-- Add personal_info column to base_profiles table
-- Run this in your Supabase SQL Editor

ALTER TABLE base_profiles
ADD COLUMN IF NOT EXISTS personal_info JSONB DEFAULT '{}'::jsonb;

-- Add a comment for documentation
COMMENT ON COLUMN base_profiles.personal_info IS 'Stores user personal information: name, email, phone, address, linkedin, portfolio, date_of_birth, photo_url';
