-- Simple version of voice sessions migration without RLS
-- Run this first to test the basic structure

-- Create voice_sessions table for tracking AI voice interactions
CREATE TABLE IF NOT EXISTS voice_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_name VARCHAR(255) NOT NULL UNIQUE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    agent_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'error')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_voice_sessions_student ON voice_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_teacher ON voice_sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_class ON voice_sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_status ON voice_sessions(status);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_room ON voice_sessions(room_name);

-- Add voice-related columns to teachers table
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS voice_clone_id VARCHAR(255);
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS voice_settings JSONB DEFAULT '{}';
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN DEFAULT FALSE;

-- Add voice preferences to user_preferences table
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS voice_preferences JSONB DEFAULT '{
    "enabled": true,
    "language": "en",
    "speaking_pace": "normal",
    "guidance_level": "standard",
    "music_volume": 0.5
}';

-- Create function to calculate session duration
CREATE OR REPLACE FUNCTION calculate_session_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ended_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
        NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))::INTEGER;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for session duration
DROP TRIGGER IF EXISTS calculate_voice_session_duration ON voice_sessions;
CREATE TRIGGER calculate_voice_session_duration
    BEFORE UPDATE OF ended_at ON voice_sessions
    FOR EACH ROW
    EXECUTE FUNCTION calculate_session_duration();