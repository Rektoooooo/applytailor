-- Add application_id to rate_limits for tracking refinements per application
-- Add purchased_edit_packs to applications for tracking bought edit packs

-- Add application_id to rate_limits
ALTER TABLE rate_limits
ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES applications(id) ON DELETE CASCADE;

-- Create index for efficient per-application queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_application
ON rate_limits(user_id, application_id, action_type);

-- Add purchased_edit_packs to applications (each pack = 5 edits for 0.25 credits)
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS purchased_edit_packs INTEGER DEFAULT 0;
