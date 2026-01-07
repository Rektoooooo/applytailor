-- Migration: Add new application status values
-- This migration adds workflow statuses for tracking job applications

-- Add new values to the application_status enum
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'ready_to_send';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'waiting';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'interview';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'offer';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'accepted';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'rejected';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'withdrawn';

-- Note: PostgreSQL enum values are added at the end by default.
-- The order is: draft, tailored, exported, applied, ready_to_send, waiting, interview, offer, accepted, rejected, withdrawn
