-- Migration: Add comprehensive teacher content tables
-- Created: 2024-12-23
-- Description: Support for challenges, live classes, breathing exercises, workshops, articles, groups, poses, and programs

-- 1. Challenges (30-day programs, weekly challenges)
CREATE TABLE IF NOT EXISTS challenges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    duration_days INTEGER NOT NULL DEFAULT 30,
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'all')),
    cover_image_url TEXT,
    thumbnail_url TEXT,
    challenge_type VARCHAR(50) DEFAULT 'general', -- 'morning_flow', 'flexibility', 'strength', 'meditation', etc.
    daily_commitment_min INTEGER DEFAULT 20, -- Expected daily practice time
    total_participants INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Challenge daily content
CREATE TABLE IF NOT EXISTS challenge_days (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    title VARCHAR(150),
    description TEXT,
    class_id UUID REFERENCES classes(id), -- Link to existing class
    meditation_id UUID REFERENCES meditation_sessions(id), -- Or meditation
    breathing_exercise_id UUID, -- Will reference breathing_exercises table
    video_url TEXT, -- Direct video if not using existing class
    duration_min INTEGER,
    focus_area VARCHAR(100), -- 'hips', 'core', 'balance', etc.
    created_at TIMESTAMP DEFAULT NOW()
);

-- User challenge participation
CREATE TABLE IF NOT EXISTS challenge_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    current_day INTEGER DEFAULT 1,
    total_days_completed INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(challenge_id, user_id)
);

-- 2. Live Classes (Streaming sessions)
CREATE TABLE IF NOT EXISTS live_classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    scheduled_for TIMESTAMP NOT NULL,
    duration_min INTEGER NOT NULL DEFAULT 60,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    meeting_url TEXT, -- Zoom/streaming platform URL
    recording_url TEXT, -- After the class
    style VARCHAR(50), -- 'vinyasa', 'hatha', 'yin', etc.
    level VARCHAR(20) CHECK (level IN ('beginner', 'intermediate', 'advanced', 'all')),
    thumbnail_url TEXT,
    price DECIMAL(10,2) DEFAULT 0, -- For paid classes
    is_free BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'live', 'completed', 'cancelled'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Live class registrations
CREATE TABLE IF NOT EXISTS live_class_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    live_class_id UUID NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    registered_at TIMESTAMP DEFAULT NOW(),
    attended BOOLEAN DEFAULT FALSE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    UNIQUE(live_class_id, user_id)
);

-- 3. Breathing Exercises (Pranayama)
CREATE TABLE IF NOT EXISTS breathing_exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    sanskrit_name VARCHAR(100),
    description TEXT,
    instructions TEXT, -- Step-by-step guide
    benefits TEXT,
    contraindications TEXT, -- When not to practice
    duration_min INTEGER NOT NULL DEFAULT 5,
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    exercise_type VARCHAR(50), -- 'calming', 'energizing', 'balancing'
    video_url TEXT,
    audio_url TEXT,
    animation_url TEXT, -- For breathing pattern animation
    inhale_count INTEGER, -- Breathing pattern
    hold_count INTEGER,
    exhale_count INTEGER,
    rounds_recommended INTEGER,
    thumbnail_url TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Workshops (Extended learning sessions)
CREATE TABLE IF NOT EXISTS workshops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    detailed_outline TEXT,
    duration_hours DECIMAL(3,1) NOT NULL DEFAULT 2.0,
    scheduled_date DATE,
    scheduled_time TIME,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    workshop_type VARCHAR(50), -- 'technique', 'philosophy', 'anatomy', 'meditation'
    level VARCHAR(20) CHECK (level IN ('beginner', 'intermediate', 'advanced', 'all')),
    price DECIMAL(10,2) DEFAULT 0,
    is_online BOOLEAN DEFAULT TRUE,
    location TEXT, -- For in-person workshops
    meeting_url TEXT,
    recording_url TEXT,
    materials_url TEXT, -- PDF handouts, etc.
    cover_image_url TEXT,
    prerequisites TEXT,
    what_to_bring TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'published', 'full', 'completed'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Articles/Blog
CREATE TABLE IF NOT EXISTS articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    subtitle VARCHAR(300),
    content TEXT NOT NULL, -- Markdown or HTML
    excerpt TEXT,
    featured_image_url TEXT,
    category VARCHAR(50), -- 'philosophy', 'anatomy', 'lifestyle', 'nutrition', 'poses'
    tags TEXT[], -- Array of tags
    reading_time_min INTEGER,
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    meta_description TEXT, -- For SEO
    meta_keywords TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Student Groups (Private communities)
CREATE TABLE IF NOT EXISTS student_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    group_type VARCHAR(50), -- 'cohort', 'level_based', 'goal_based', 'private'
    max_members INTEGER,
    current_members INTEGER DEFAULT 0,
    cover_image_url TEXT,
    is_private BOOLEAN DEFAULT TRUE,
    enrollment_key VARCHAR(50), -- For private groups
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    welcome_message TEXT,
    guidelines TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Group members
CREATE TABLE IF NOT EXISTS group_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES student_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- 'member', 'moderator'
    joined_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(group_id, user_id)
);

-- 7. Pose Library (Asana database)
CREATE TABLE IF NOT EXISTS pose_library (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL for system poses
    english_name VARCHAR(100) NOT NULL,
    sanskrit_name VARCHAR(100),
    translation VARCHAR(200), -- Sanskrit meaning
    description TEXT,
    benefits TEXT,
    contraindications TEXT,
    instructions TEXT, -- Step-by-step
    modifications TEXT, -- Easier variations
    variations TEXT, -- Different versions
    pose_category VARCHAR(50), -- 'standing', 'seated', 'balance', 'inversion', etc.
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    primary_muscle_groups TEXT[], -- Array of muscle groups
    secondary_muscle_groups TEXT[],
    chakras TEXT[], -- Associated chakras
    doshas TEXT[], -- Ayurvedic doshas affected
    image_url TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    prep_poses TEXT[], -- Poses to do before
    follow_up_poses TEXT[], -- Poses to do after
    hold_time_seconds INTEGER,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. Programs (Themed multi-session content)
CREATE TABLE IF NOT EXISTS programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    program_type VARCHAR(50), -- 'body_focus', 'chakra', 'moon_phase', 'seasonal', 'therapeutic'
    focus_area VARCHAR(100), -- 'hips', 'back_care', 'stress_relief', 'flexibility'
    total_sessions INTEGER NOT NULL,
    weeks_duration INTEGER,
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'progressive')),
    cover_image_url TEXT,
    thumbnail_url TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    is_free BOOLEAN DEFAULT TRUE,
    prerequisites TEXT,
    outcomes TEXT, -- What students will achieve
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Program sessions
CREATE TABLE IF NOT EXISTS program_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    session_number INTEGER NOT NULL,
    week_number INTEGER,
    title VARCHAR(150),
    description TEXT,
    class_id UUID REFERENCES classes(id),
    meditation_id UUID REFERENCES meditation_sessions(id),
    breathing_exercise_id UUID REFERENCES breathing_exercises(id),
    article_id UUID REFERENCES articles(id),
    duration_min INTEGER,
    session_type VARCHAR(50), -- 'practice', 'theory', 'meditation', 'rest'
    homework TEXT, -- Practice to do between sessions
    created_at TIMESTAMP DEFAULT NOW()
);

-- 9. Quick Flows (5-15 minute sessions)
CREATE TABLE IF NOT EXISTS quick_flows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    duration_min INTEGER NOT NULL CHECK (duration_min >= 5 AND duration_min <= 15),
    flow_type VARCHAR(50), -- 'morning', 'lunch_break', 'evening', 'energizing', 'relaxing'
    target_area VARCHAR(50), -- 'full_body', 'core', 'hips', 'shoulders', 'back'
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    video_url TEXT,
    thumbnail_url TEXT,
    equipment_needed TEXT[],
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 10. Philosophy Content
CREATE TABLE IF NOT EXISTS philosophy_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(50), -- 'sutra', 'quote', 'teaching', 'story'
    source VARCHAR(100), -- 'Yoga Sutras', 'Bhagavad Gita', etc.
    chapter VARCHAR(50),
    verse VARCHAR(50),
    sanskrit_text TEXT,
    transliteration TEXT,
    translation TEXT,
    commentary TEXT,
    modern_application TEXT,
    audio_url TEXT, -- Sanskrit pronunciation
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_challenges_teacher ON challenges(teacher_id);
CREATE INDEX idx_challenge_days_challenge ON challenge_days(challenge_id);
CREATE INDEX idx_live_classes_scheduled ON live_classes(scheduled_for);
CREATE INDEX idx_live_classes_teacher ON live_classes(teacher_id);
CREATE INDEX idx_breathing_exercises_teacher ON breathing_exercises(teacher_id);
CREATE INDEX idx_workshops_teacher ON workshops(teacher_id);
CREATE INDEX idx_workshops_scheduled ON workshops(scheduled_date);
CREATE INDEX idx_articles_teacher ON articles(teacher_id);
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_published ON articles(is_published, published_at);
CREATE INDEX idx_student_groups_teacher ON student_groups(teacher_id);
CREATE INDEX idx_pose_library_category ON pose_library(pose_category);
CREATE INDEX idx_programs_teacher ON programs(teacher_id);
CREATE INDEX idx_quick_flows_teacher ON quick_flows(teacher_id);
CREATE INDEX idx_philosophy_content_type ON philosophy_content(content_type);