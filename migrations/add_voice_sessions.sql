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
CREATE INDEX idx_voice_sessions_student ON voice_sessions(student_id);
CREATE INDEX idx_voice_sessions_teacher ON voice_sessions(teacher_id);
CREATE INDEX idx_voice_sessions_class ON voice_sessions(class_id);
CREATE INDEX idx_voice_sessions_status ON voice_sessions(status);
CREATE INDEX idx_voice_sessions_room ON voice_sessions(room_name);

-- Create voice_interactions table for tracking conversation
CREATE TABLE IF NOT EXISTS voice_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES voice_sessions(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    speaker VARCHAR(50) NOT NULL CHECK (speaker IN ('student', 'instructor', 'system')),
    transcript TEXT,
    intent VARCHAR(100),
    response_type VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_voice_interactions_session ON voice_interactions(session_id);
CREATE INDEX idx_voice_interactions_timestamp ON voice_interactions(timestamp);

-- Create voice_corrections table for tracking pose corrections
CREATE TABLE IF NOT EXISTS voice_corrections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES voice_sessions(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    pose_name VARCHAR(255) NOT NULL,
    correction_type VARCHAR(100) NOT NULL,
    correction_text TEXT NOT NULL,
    severity VARCHAR(50) DEFAULT 'suggestion' CHECK (severity IN ('suggestion', 'important', 'critical')),
    was_resolved BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_voice_corrections_session ON voice_corrections(session_id);
CREATE INDEX idx_voice_corrections_pose ON voice_corrections(pose_name);

-- Create voice_session_metrics table for analytics
CREATE TABLE IF NOT EXISTS voice_session_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES voice_sessions(id) ON DELETE CASCADE,
    total_interactions INTEGER DEFAULT 0,
    total_corrections INTEGER DEFAULT 0,
    poses_completed INTEGER DEFAULT 0,
    average_pose_duration_seconds FLOAT,
    student_questions INTEGER DEFAULT 0,
    modifications_suggested INTEGER DEFAULT 0,
    form_accuracy_score FLOAT,
    engagement_score FLOAT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_voice_metrics_session ON voice_session_metrics(session_id);

-- Add voice-related columns to teachers table
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS voice_clone_id VARCHAR(255);
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS voice_settings JSONB DEFAULT '{}';
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN DEFAULT FALSE;

-- Add voice preferences to user_preferences table instead
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
CREATE TRIGGER calculate_voice_session_duration
    BEFORE UPDATE OF ended_at ON voice_sessions
    FOR EACH ROW
    EXECUTE FUNCTION calculate_session_duration();

-- Create function to update metrics
CREATE OR REPLACE FUNCTION update_voice_session_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update metrics when interactions are added
    IF TG_TABLE_NAME = 'voice_interactions' THEN
        UPDATE voice_session_metrics
        SET 
            total_interactions = total_interactions + 1,
            student_questions = student_questions + 
                CASE WHEN NEW.speaker = 'student' THEN 1 ELSE 0 END,
            updated_at = NOW()
        WHERE session_id = NEW.session_id;
        
        -- Create metrics row if doesn't exist
        INSERT INTO voice_session_metrics (session_id)
        VALUES (NEW.session_id)
        ON CONFLICT (session_id) DO NOTHING;
    END IF;
    
    -- Update metrics when corrections are added
    IF TG_TABLE_NAME = 'voice_corrections' THEN
        UPDATE voice_session_metrics
        SET 
            total_corrections = total_corrections + 1,
            modifications_suggested = modifications_suggested + 
                CASE WHEN NEW.correction_type = 'modification' THEN 1 ELSE 0 END,
            updated_at = NOW()
        WHERE session_id = NEW.session_id;
        
        -- Create metrics row if doesn't exist
        INSERT INTO voice_session_metrics (session_id)
        VALUES (NEW.session_id)
        ON CONFLICT (session_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for metrics updates
CREATE TRIGGER update_metrics_on_interaction
    AFTER INSERT ON voice_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_voice_session_metrics();

CREATE TRIGGER update_metrics_on_correction
    AFTER INSERT ON voice_corrections
    FOR EACH ROW
    EXECUTE FUNCTION update_voice_session_metrics();

-- Add RLS policies
ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_session_metrics ENABLE ROW LEVEL SECURITY;

-- Students can view their own sessions
CREATE POLICY "Students can view own voice sessions" ON voice_sessions
    FOR SELECT USING (student_id IN (SELECT id FROM users WHERE id = student_id));

CREATE POLICY "Students can create own voice sessions" ON voice_sessions
    FOR INSERT WITH CHECK (student_id IN (SELECT id FROM users WHERE id = student_id));

CREATE POLICY "Students can update own voice sessions" ON voice_sessions
    FOR UPDATE USING (student_id IN (SELECT id FROM users WHERE id = student_id));

-- Teachers can view sessions for their classes
CREATE POLICY "Teachers can view their class voice sessions" ON voice_sessions
    FOR SELECT USING (
        teacher_id IN (SELECT id FROM teachers)
    );

-- Similar policies for related tables
CREATE POLICY "Users can view own session interactions" ON voice_interactions
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM voice_sessions WHERE student_id IN (SELECT id FROM users)
        )
    );

CREATE POLICY "Users can view own session corrections" ON voice_corrections
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM voice_sessions WHERE student_id IN (SELECT id FROM users)
        )
    );

CREATE POLICY "Users can view own session metrics" ON voice_session_metrics
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM voice_sessions WHERE student_id IN (SELECT id FROM users)
        )
    );