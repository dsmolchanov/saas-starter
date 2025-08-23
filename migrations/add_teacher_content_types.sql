-- Migration: Add comprehensive teacher content types
-- Created: 2024-12-23
-- Description: Adds support for asanas, breathing, meditations, challenges, live classes, and more

-- ============================================
-- BASE CONTENT STRUCTURE
-- ============================================

-- Content type enum
CREATE TYPE content_type AS ENUM (
    'class',
    'course',
    'asana',
    'breathing',
    'meditation',
    'quick_flow',
    'challenge',
    'live_class',
    'workshop',
    'article',
    'program'
);

-- Content status enum
CREATE TYPE content_status AS ENUM (
    'draft',
    'published',
    'scheduled',
    'archived'
);

-- Content visibility enum
CREATE TYPE content_visibility AS ENUM (
    'public',
    'members',
    'premium',
    'private'
);

-- Base content items table (polymorphic)
CREATE TABLE IF NOT EXISTS content_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_type content_type NOT NULL,
    
    -- Common fields
    title VARCHAR(200) NOT NULL,
    description TEXT,
    slug VARCHAR(200) UNIQUE,
    
    -- Media
    thumbnail_url TEXT,
    cover_url TEXT,
    preview_url TEXT,
    
    -- Status and visibility
    status content_status DEFAULT 'draft',
    visibility content_visibility DEFAULT 'public',
    published_at TIMESTAMP,
    scheduled_for TIMESTAMP,
    
    -- Categorization
    tags TEXT[],
    categories TEXT[],
    difficulty VARCHAR(20),
    duration_min INTEGER,
    
    -- Metadata (flexible storage for type-specific data)
    metadata JSONB DEFAULT '{}',
    
    -- SEO
    seo_title VARCHAR(200),
    seo_description TEXT,
    seo_keywords TEXT[],
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_content_teacher ON content_items(teacher_id);
CREATE INDEX idx_content_type ON content_items(content_type);
CREATE INDEX idx_content_status ON content_items(status);
CREATE INDEX idx_content_published ON content_items(published_at);

-- ============================================
-- ASANA LIBRARY (Pose Database)
-- ============================================

CREATE TABLE IF NOT EXISTS asanas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
    
    -- Names
    sanskrit_name VARCHAR(100) NOT NULL,
    english_name VARCHAR(100) NOT NULL,
    
    -- Classification
    category VARCHAR(50), -- standing, seated, inversion, backbend, forward_fold, twist, balance
    pose_type VARCHAR(50), -- foundation, intermediate, advanced
    
    -- Details
    benefits TEXT[],
    contraindications TEXT[],
    alignment_cues TEXT[],
    common_mistakes TEXT[],
    
    -- Related poses
    preparatory_poses UUID[],
    follow_up_poses UUID[],
    variations JSONB, -- {easier: [], harder: [], props: []}
    
    -- Practice details
    hold_duration_seconds INTEGER,
    breath_pattern VARCHAR(100),
    drishti VARCHAR(50), -- gaze point
    
    -- Media
    image_urls TEXT[],
    video_url TEXT,
    anatomy_image_url TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- BREATHING EXERCISES
-- ============================================

CREATE TABLE IF NOT EXISTS breathing_exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
    
    -- Pattern
    pattern_type VARCHAR(50), -- box, 4-7-8, alternate_nostril, kapalabhati, bhastrika
    inhale_count INTEGER,
    hold_in_count INTEGER,
    exhale_count INTEGER,
    hold_out_count INTEGER,
    
    -- Practice details
    rounds INTEGER,
    round_duration_seconds INTEGER,
    total_duration_min INTEGER,
    
    -- Guidance
    audio_guidance_url TEXT,
    visual_pattern_data JSONB, -- for animation
    instructions TEXT,
    
    -- Health
    benefits TEXT[],
    contraindications TEXT[],
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- MEDITATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS meditations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(id),
    
    -- Type and focus
    meditation_type VARCHAR(50), -- guided, music_only, mantra, silence
    focus VARCHAR(50), -- sleep, anxiety, focus, gratitude, body_scan, loving_kindness
    
    -- Audio
    audio_url TEXT NOT NULL,
    background_music_url TEXT,
    transcript TEXT,
    
    -- Details
    voice_gender VARCHAR(20),
    language VARCHAR(10) DEFAULT 'en',
    duration_min INTEGER NOT NULL,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- QUICK FLOWS (5-15 minute sessions)
-- ============================================

CREATE TABLE IF NOT EXISTS quick_flows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id), -- Can reference existing class or be standalone
    
    -- Type
    flow_type VARCHAR(50), -- morning_energy, evening_wind_down, desk_break, pre_workout
    target_area VARCHAR(50), -- full_body, hips, shoulders, back, core
    
    -- Sequence (if not using existing class)
    pose_sequence JSONB, -- [{asana_id, duration, transition}, ...]
    
    -- Time of day recommendation
    recommended_time VARCHAR(20), -- morning, afternoon, evening, anytime
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CHALLENGES (Variable Length Programs)
-- ============================================

CREATE TABLE IF NOT EXISTS challenges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(id),
    
    -- Duration
    duration_days INTEGER NOT NULL, -- 7, 14, 21, 30, or custom
    challenge_type VARCHAR(50), -- progressive, varied, intensive
    
    -- Details
    difficulty_progression VARCHAR(50), -- steady, gradual_increase, wave
    rest_days INTEGER[],
    
    -- Engagement
    daily_notification_time TIME,
    completion_badge_url TEXT,
    certificate_template TEXT,
    
    -- Stats
    total_participants INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Challenge daily content
CREATE TABLE IF NOT EXISTS challenge_days (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    
    day_number INTEGER NOT NULL,
    title VARCHAR(200),
    description TEXT,
    
    -- Content (polymorphic reference)
    content_type content_type,
    content_id UUID, -- References the specific content item
    
    -- Day specifics
    is_rest_day BOOLEAN DEFAULT FALSE,
    is_optional BOOLEAN DEFAULT FALSE,
    unlock_after_days INTEGER, -- null means available immediately
    
    -- Motivation
    daily_tip TEXT,
    motivation_quote TEXT,
    
    -- Order
    sort_order INTEGER,
    
    UNIQUE(challenge_id, day_number),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- LIVE CLASSES (with LiveKit integration)
-- ============================================

CREATE TABLE IF NOT EXISTS live_classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(id),
    
    -- Scheduling
    scheduled_start TIMESTAMP NOT NULL,
    scheduled_end TIMESTAMP NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- LiveKit integration
    livekit_room_id VARCHAR(100),
    livekit_room_token TEXT,
    
    -- Settings
    max_participants INTEGER,
    registration_required BOOLEAN DEFAULT FALSE,
    recording_enabled BOOLEAN DEFAULT TRUE,
    chat_enabled BOOLEAN DEFAULT TRUE,
    
    -- Recurring
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern JSONB, -- {type: 'weekly', days: [1,3,5], until: date}
    parent_series_id UUID REFERENCES live_classes(id),
    
    -- Post-class
    recording_url TEXT,
    recording_available_until TIMESTAMP,
    
    -- Stats
    registered_count INTEGER DEFAULT 0,
    attended_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Live class registrations
CREATE TABLE IF NOT EXISTS live_class_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    live_class_id UUID REFERENCES live_classes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    registered_at TIMESTAMP DEFAULT NOW(),
    attended BOOLEAN DEFAULT FALSE,
    attended_duration_min INTEGER,
    
    UNIQUE(live_class_id, user_id)
);

-- ============================================
-- WORKSHOPS (Extended 2-4 hour sessions)
-- ============================================

CREATE TABLE IF NOT EXISTS workshops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(id),
    
    -- Format
    format VARCHAR(50), -- in_person, online, hybrid
    location TEXT,
    venue_details JSONB,
    
    -- Scheduling
    start_datetime TIMESTAMP,
    end_datetime TIMESTAMP,
    
    -- Content
    segments JSONB, -- [{title, duration, type, content_id}, ...]
    materials_url TEXT,
    
    -- Capacity
    min_participants INTEGER,
    max_participants INTEGER,
    
    -- Pricing
    price DECIMAL(10,2),
    early_bird_price DECIMAL(10,2),
    early_bird_until DATE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PROGRAMS (Multi-week curriculums)
-- ============================================

CREATE TABLE IF NOT EXISTS programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(id),
    
    -- Structure
    total_weeks INTEGER NOT NULL,
    sessions_per_week INTEGER,
    
    -- Prerequisites
    prerequisites TEXT[],
    required_props TEXT[],
    
    -- Completion
    completion_requirements JSONB,
    certificate_template TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Program modules
CREATE TABLE IF NOT EXISTS program_modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    
    week_number INTEGER NOT NULL,
    module_title VARCHAR(200),
    module_description TEXT,
    
    -- Content references
    content_items UUID[], -- Array of content_item IDs
    
    -- Assessment
    has_assessment BOOLEAN DEFAULT FALSE,
    assessment_data JSONB,
    
    sort_order INTEGER,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- UNIVERSAL PROGRESS TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS content_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
    
    -- Progress
    started_at TIMESTAMP DEFAULT NOW(),
    last_accessed_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    
    -- Tracking
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    last_position INTEGER, -- seconds for video/audio, step for multi-part
    
    -- User data
    user_notes TEXT,
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    favorited BOOLEAN DEFAULT FALSE,
    
    UNIQUE(user_id, content_item_id)
);

CREATE INDEX idx_progress_user ON content_progress(user_id);
CREATE INDEX idx_progress_content ON content_progress(content_item_id);

-- ============================================
-- ANALYTICS & METRICS
-- ============================================

CREATE TABLE IF NOT EXISTS content_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
    
    -- Metrics (updated daily)
    total_views INTEGER DEFAULT 0,
    unique_viewers INTEGER DEFAULT 0,
    total_completions INTEGER DEFAULT 0,
    avg_completion_rate DECIMAL(5,2),
    avg_rating DECIMAL(3,2),
    
    -- Engagement
    total_favorites INTEGER DEFAULT 0,
    total_shares INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    
    -- Time-based
    peak_hour INTEGER, -- 0-23
    peak_day_of_week INTEGER, -- 0-6
    
    last_calculated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_content ON content_analytics(content_item_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Auto-generate slug from title
CREATE OR REPLACE FUNCTION generate_content_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL THEN
        NEW.slug = LOWER(REPLACE(REPLACE(NEW.title, ' ', '-'), '''', ''));
        -- Add random suffix if not unique
        WHILE EXISTS (SELECT 1 FROM content_items WHERE slug = NEW.slug AND id != NEW.id) LOOP
            NEW.slug = NEW.slug || '-' || substr(md5(random()::text), 1, 4);
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_slug_trigger
    BEFORE INSERT OR UPDATE ON content_items
    FOR EACH ROW
    EXECUTE FUNCTION generate_content_slug();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_items_updated_at
    BEFORE UPDATE ON content_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_asanas_category ON asanas(category);
CREATE INDEX idx_breathing_pattern ON breathing_exercises(pattern_type);
CREATE INDEX idx_meditations_focus ON meditations(focus);
CREATE INDEX idx_challenges_duration ON challenges(duration_days);
CREATE INDEX idx_live_classes_scheduled ON live_classes(scheduled_start);
CREATE INDEX idx_content_progress_completed ON content_progress(completed_at);