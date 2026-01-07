-- Migration: Change credits to DECIMAL and add rate limiting
-- This supports partial credit costs for refinements (0.25, 0.5 credits)

-- Change credits from INTEGER to DECIMAL for partial credits
ALTER TABLE profiles
ALTER COLUMN credits TYPE DECIMAL(10,2) USING credits::DECIMAL(10,2);

-- Set default for new users
ALTER TABLE profiles
ALTER COLUMN credits SET DEFAULT 1.00;

-- Create rate limits table for tracking API usage
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    action_type TEXT NOT NULL, -- 'generation' or 'refinement'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient rate limit queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action
ON rate_limits(user_id, action_type, created_at DESC);

-- Index for cleanup of old records
CREATE INDEX IF NOT EXISTS idx_rate_limits_created_at
ON rate_limits(created_at);

-- Function to clean up old rate limit records (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM rate_limits WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up old records (run daily)
-- Note: This requires pg_cron extension enabled in Supabase
-- SELECT cron.schedule('cleanup-rate-limits', '0 0 * * *', 'SELECT cleanup_old_rate_limits()');

-- RLS policies for rate_limits
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can only see their own rate limit records
CREATE POLICY "Users can view own rate limits" ON rate_limits
    FOR SELECT USING (auth.uid() = user_id);

-- Only service role can insert rate limits (from edge functions)
CREATE POLICY "Service role can insert rate limits" ON rate_limits
    FOR INSERT WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT ON rate_limits TO authenticated;
GRANT INSERT, DELETE ON rate_limits TO service_role;
