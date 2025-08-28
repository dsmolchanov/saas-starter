-- This migration should be run on the VOICE PLATFORM's Supabase instance
-- to support integration with the Dzen Yoga platform

-- Create platform_sessions table to track sessions from external platforms
CREATE TABLE IF NOT EXISTS platform_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL, -- Voice platform session ID
    room_name VARCHAR(255) NOT NULL,
    agent_id VARCHAR(255) NOT NULL,
    platform VARCHAR(100) NOT NULL, -- e.g., 'dzen-yoga', 'fitness-app', etc.
    platform_session_id UUID, -- Session ID in the source platform
    platform_metadata JSONB DEFAULT '{}', -- Platform-specific metadata
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    UNIQUE(session_id, platform)
);

-- Create indexes
CREATE INDEX idx_platform_sessions_platform ON platform_sessions(platform);
CREATE INDEX idx_platform_sessions_agent ON platform_sessions(agent_id);
CREATE INDEX idx_platform_sessions_room ON platform_sessions(room_name);
CREATE INDEX idx_platform_sessions_status ON platform_sessions(status);

-- Update agent_configs table to support platform-specific agents
ALTER TABLE agent_configs ADD COLUMN IF NOT EXISTS platform VARCHAR(100);
ALTER TABLE agent_configs ADD COLUMN IF NOT EXISTS platform_metadata JSONB DEFAULT '{}';

-- Create index for platform-specific agent lookups
CREATE INDEX IF NOT EXISTS idx_agent_configs_platform ON agent_configs(platform);

-- Create yoga-specific tools table entries
INSERT INTO tools (name, description, params_json_schema, type) VALUES
    ('pose_guidance', 'Provides detailed yoga pose instructions', '{
        "type": "object",
        "properties": {
            "pose_name": {"type": "string"},
            "level": {"type": "string"},
            "modifications": {"type": "array", "items": {"type": "string"}}
        },
        "required": ["pose_name"]
    }', 'custom'),
    
    ('breathing_cue', 'Guides breathing patterns during yoga practice', '{
        "type": "object",
        "properties": {
            "pattern": {"type": "string"},
            "duration": {"type": "number"}
        },
        "required": ["pattern"]
    }', 'custom'),
    
    ('modification_suggestion', 'Suggests pose modifications based on student needs', '{
        "type": "object",
        "properties": {
            "current_pose": {"type": "string"},
            "difficulty": {"type": "string"},
            "reason": {"type": "string"}
        },
        "required": ["current_pose"]
    }', 'custom'),
    
    ('safety_check', 'Validates pose safety based on student conditions', '{
        "type": "object",
        "properties": {
            "pose": {"type": "string"},
            "conditions": {"type": "array", "items": {"type": "string"}}
        },
        "required": ["pose"]
    }', 'custom'),
    
    ('encouragement', 'Provides motivational support during practice', '{
        "type": "object",
        "properties": {
            "context": {"type": "string"},
            "intensity": {"type": "string", "enum": ["gentle", "moderate", "strong"]}
        }
    }', 'custom'),
    
    ('transition_guide', 'Guides smooth transitions between yoga poses', '{
        "type": "object",
        "properties": {
            "from_pose": {"type": "string"},
            "to_pose": {"type": "string"},
            "pace": {"type": "string", "enum": ["slow", "moderate", "dynamic"]}
        },
        "required": ["from_pose", "to_pose"]
    }', 'custom')
ON CONFLICT (name) DO NOTHING;

-- Create view for platform-specific analytics
CREATE OR REPLACE VIEW platform_analytics AS
SELECT 
    ps.platform,
    ps.agent_id,
    COUNT(DISTINCT ps.session_id) as total_sessions,
    COUNT(DISTINCT ps.room_name) as unique_rooms,
    AVG(EXTRACT(EPOCH FROM (ps.ended_at - ps.created_at))) as avg_duration_seconds,
    COUNT(CASE WHEN ps.status = 'active' THEN 1 END) as active_sessions,
    COUNT(CASE WHEN ps.status = 'completed' THEN 1 END) as completed_sessions,
    DATE_TRUNC('day', ps.created_at) as date
FROM platform_sessions ps
GROUP BY ps.platform, ps.agent_id, DATE_TRUNC('day', ps.created_at);

-- Note: Permissions should be configured based on your security requirements
-- The LiveKit platform may handle permissions differently than standard Supabase RLS