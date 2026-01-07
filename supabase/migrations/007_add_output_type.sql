-- Add output_type column to applications table
-- Tracks whether the application was generated as 'full', 'cv', or 'cover' only

ALTER TABLE applications
ADD COLUMN IF NOT EXISTS output_type TEXT DEFAULT 'full';

-- Add comment explaining the column
COMMENT ON COLUMN applications.output_type IS 'Type of content generated: full (CV + cover letter), cv (CV only), or cover (cover letter only)';
