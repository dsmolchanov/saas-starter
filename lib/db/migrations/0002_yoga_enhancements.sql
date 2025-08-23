-- Migration: Add yoga-specific enhancement tables
-- Created: 2025-08-23

-- 1. Breathing Exercises (Pranayama)
CREATE TABLE IF NOT EXISTS breathing_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    sanskrit_name VARCHAR(100),
    duration_pattern VARCHAR(50), -- e.g., "4-4-4-4" for box breathing
    description TEXT,
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    benefits TEXT,
    instructions TEXT,
    contraindications TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Chakras
CREATE TABLE IF NOT EXISTS chakras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    sanskrit_name VARCHAR(50) NOT NULL,
    number INTEGER NOT NULL CHECK (number >= 1 AND number <= 7),
    color VARCHAR(20) NOT NULL,
    element VARCHAR(30),
    location TEXT,
    description TEXT,
    healing_practices TEXT,
    associated_poses TEXT[], -- Array of pose names
    mantra VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. Yoga Quotes
CREATE TABLE IF NOT EXISTS yoga_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text TEXT NOT NULL,
    author VARCHAR(100),
    category VARCHAR(50), -- 'inspiration', 'philosophy', 'practice', 'mindfulness'
    language VARCHAR(10) DEFAULT 'en',
    source VARCHAR(200), -- Book or text source
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preferred_time VARCHAR(20), -- 'morning', 'afternoon', 'evening'
    preferred_duration INTEGER, -- in minutes
    preferred_style VARCHAR(50), -- 'vinyasa', 'hatha', 'yin', etc.
    preferred_intensity VARCHAR(20), -- 'gentle', 'moderate', 'vigorous'
    experience_level VARCHAR(20), -- 'beginner', 'intermediate', 'advanced'
    goals TEXT[], -- Array of goals
    injuries_limitations TEXT,
    notification_enabled BOOLEAN DEFAULT true,
    notification_time TIME,
    theme VARCHAR(20) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 5. Practice Streaks
CREATE TABLE IF NOT EXISTS practice_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_practice_date DATE,
    total_practice_days INTEGER NOT NULL DEFAULT 0,
    streak_frozen_until DATE, -- For vacation mode
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 6. Class Tags
CREATE TABLE IF NOT EXISTS class_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    tag_name VARCHAR(50) NOT NULL,
    tag_category VARCHAR(50), -- 'time_of_day', 'energy', 'body_focus', 'special'
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 7. Yoga Styles (for better categorization)
CREATE TABLE IF NOT EXISTS yoga_styles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    intensity_level VARCHAR(20),
    benefits TEXT,
    typical_duration INTEGER, -- in minutes
    suitable_for TEXT[], -- ['beginners', 'pregnancy', 'seniors', etc.]
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 8. Class Equipment
CREATE TABLE IF NOT EXISTS class_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    equipment_name VARCHAR(50) NOT NULL,
    is_required BOOLEAN DEFAULT false,
    quantity INTEGER DEFAULT 1,
    alternatives TEXT, -- Alternative equipment that can be used
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 9. User Goals
CREATE TABLE IF NOT EXISTS user_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_type VARCHAR(50) NOT NULL, -- 'flexibility', 'strength', 'stress_relief', 'weight_loss', etc.
    description TEXT,
    target_date DATE,
    target_value INTEGER, -- e.g., practice X times per week
    current_value INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'paused', 'abandoned'
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- 10. Practice Reminders
CREATE TABLE IF NOT EXISTS practice_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reminder_time TIME NOT NULL,
    days_of_week INTEGER[], -- 0=Sunday, 1=Monday, etc.
    enabled BOOLEAN DEFAULT true,
    notification_type VARCHAR(20) DEFAULT 'push', -- 'push', 'email', 'sms'
    message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 11. Teacher Specializations
CREATE TABLE IF NOT EXISTS teacher_specializations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(50) NOT NULL, -- 'prenatal', 'senior', 'kids', 'therapy', 'meditation'
    certification TEXT, -- Certification details
    years_experience INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 12. Meditation Sessions (separate from yoga classes)
CREATE TABLE IF NOT EXISTS meditation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    description TEXT,
    duration_min INTEGER NOT NULL,
    type VARCHAR(50), -- 'guided', 'unguided', 'music', 'nature_sounds'
    teacher_id UUID REFERENCES users(id),
    audio_url TEXT,
    thumbnail_url TEXT,
    focus VARCHAR(50), -- 'mindfulness', 'sleep', 'anxiety', 'focus'
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_class_tags_class_id ON class_tags(class_id);
CREATE INDEX idx_class_tags_tag_name ON class_tags(tag_name);
CREATE INDEX idx_class_tags_category ON class_tags(tag_category);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_practice_streaks_user_id ON practice_streaks(user_id);
CREATE INDEX idx_practice_streaks_last_practice ON practice_streaks(last_practice_date);
CREATE INDEX idx_class_equipment_class_id ON class_equipment(class_id);
CREATE INDEX idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX idx_user_goals_status ON user_goals(status);
CREATE INDEX idx_practice_reminders_user_id ON practice_reminders(user_id);
CREATE INDEX idx_teacher_specializations_teacher_id ON teacher_specializations(teacher_id);
CREATE INDEX idx_meditation_sessions_teacher_id ON meditation_sessions(teacher_id);
CREATE INDEX idx_meditation_sessions_focus ON meditation_sessions(focus);

-- Insert default breathing exercises
INSERT INTO breathing_exercises (name, sanskrit_name, duration_pattern, description, difficulty, benefits, instructions) VALUES
('Box Breathing', 'Sama Vritti', '4-4-4-4', 'Equal ratio breathing for calming and centering', 'beginner', 'Reduces stress, improves focus, calms the nervous system', 'Inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat.'),
('Ocean Breath', 'Ujjayi', 'Deep & Slow', 'Victorious breath with gentle throat constriction', 'beginner', 'Builds heat, improves concentration, releases tension', 'Breathe through nose with slight constriction in throat, creating ocean-like sound.'),
('Alternate Nostril', 'Nadi Shodhana', '5-5-5-5', 'Balancing breath for harmony', 'intermediate', 'Balances left and right brain, calms mind, improves respiratory function', 'Close right nostril, inhale left. Close left, exhale right. Continue alternating.'),
('Breath of Fire', 'Kapalabhati', '1-1-1-1', 'Energizing rapid breathing', 'advanced', 'Increases energy, detoxifies, strengthens core', 'Rapid belly pumping with passive inhale and active exhale through nose.'),
('Cooling Breath', 'Sitali', 'Slow inhale, normal exhale', 'Cooling breath through curled tongue', 'beginner', 'Cools body, reduces anger, aids digestion', 'Curl tongue, inhale through it, close mouth, exhale through nose.'),
('Bellows Breath', 'Bhastrika', '1-1-1-1', 'Powerful energizing breath', 'advanced', 'Increases vitality, clears mind, strengthens lungs', 'Forceful inhale and exhale through nose using diaphragm.'),
('Three-Part Breath', 'Dirga Pranayama', 'Slow & Deep', 'Complete yogic breath', 'beginner', 'Increases oxygen, reduces anxiety, improves lung capacity', 'Breathe into belly, ribs, then chest. Exhale in reverse order.'),
('4-7-8 Breath', NULL, '4-7-8', 'Relaxation breath for sleep', 'beginner', 'Promotes sleep, reduces anxiety, lowers blood pressure', 'Inhale for 4, hold for 7, exhale for 8 counts.');

-- Insert 7 chakras
INSERT INTO chakras (name, sanskrit_name, number, color, element, location, description, mantra) VALUES
('Root', 'Muladhara', 1, 'Red', 'Earth', 'Base of spine', 'Foundation, grounding, survival, security', 'LAM'),
('Sacral', 'Svadhisthana', 2, 'Orange', 'Water', 'Lower abdomen', 'Creativity, sexuality, emotions, pleasure', 'VAM'),
('Solar Plexus', 'Manipura', 3, 'Yellow', 'Fire', 'Upper abdomen', 'Personal power, confidence, self-esteem', 'RAM'),
('Heart', 'Anahata', 4, 'Green', 'Air', 'Center of chest', 'Love, compassion, relationships, forgiveness', 'YAM'),
('Throat', 'Vishuddha', 5, 'Blue', 'Ether', 'Throat', 'Communication, self-expression, truth', 'HAM'),
('Third Eye', 'Ajna', 6, 'Indigo', 'Light', 'Between eyebrows', 'Intuition, wisdom, imagination, clarity', 'OM'),
('Crown', 'Sahasrara', 7, 'Violet', 'Consciousness', 'Top of head', 'Spiritual connection, enlightenment, unity', 'AH');

-- Insert yoga quotes
INSERT INTO yoga_quotes (text, author, category, language) VALUES
('The body benefits from movement, and the mind benefits from stillness.', 'Sakyong Mipham', 'practice', 'en'),
('Yoga is the journey of the self, through the self, to the self.', 'Bhagavad Gita', 'philosophy', 'en'),
('Inhale the future, exhale the past.', 'Unknown', 'mindfulness', 'en'),
('The pose begins when you want to leave it.', 'B.K.S. Iyengar', 'practice', 'en'),
('Yoga is not about touching your toes, it''s about what you learn on the way down.', 'Jigar Gor', 'inspiration', 'en'),
('When you listen to yourself, everything comes naturally.', 'Petri Räisänen', 'mindfulness', 'en'),
('The quieter you become, the more you are able to hear.', 'Rumi', 'mindfulness', 'en'),
('Yoga is the perfect opportunity to be curious about who you are.', 'Jason Crandell', 'philosophy', 'en'),
('Your body exists in the past and your mind exists in the future. In yoga, they come together in the present.', 'B.K.S. Iyengar', 'philosophy', 'en'),
('The nature of yoga is to shine the light of awareness into the darkest corners of the body.', 'Jason Crandell', 'practice', 'en'),
('Yoga begins right where I am - not where I was yesterday or where I long to be.', 'Linda Sparrowe', 'inspiration', 'en'),
('The attitude of gratitude is the highest yoga.', 'Yogi Bhajan', 'philosophy', 'en'),
('Yoga is not a work-out, it is a work-in.', 'Rolf Gates', 'philosophy', 'en'),
('True yoga is not about the shape of your body, but the shape of your life.', 'Aadil Palkhivala', 'inspiration', 'en'),
('Yoga teaches us to cure what need not be endured and endure what cannot be cured.', 'B.K.S. Iyengar', 'philosophy', 'en');

-- Insert yoga styles
INSERT INTO yoga_styles (name, description, intensity_level, typical_duration, suitable_for) VALUES
('Hatha', 'Gentle, slower-paced practice focusing on basic postures and breathing', 'gentle', 60, ARRAY['beginners', 'seniors', 'all levels']),
('Vinyasa', 'Dynamic flow linking movement with breath', 'moderate', 60, ARRAY['intermediate', 'advanced']),
('Power', 'Athletic, fitness-based approach to vinyasa', 'vigorous', 75, ARRAY['advanced', 'athletes']),
('Yin', 'Passive practice holding poses for 3-5 minutes', 'gentle', 75, ARRAY['all levels', 'stress relief']),
('Restorative', 'Deeply relaxing practice using props for support', 'gentle', 60, ARRAY['all levels', 'recovery', 'stress relief']),
('Ashtanga', 'Rigorous, structured sequence of poses', 'vigorous', 90, ARRAY['advanced', 'athletes']),
('Iyengar', 'Precise alignment-focused practice using props', 'moderate', 75, ARRAY['all levels', 'injury recovery']),
('Kundalini', 'Combines movement, breathing, meditation, and chanting', 'moderate', 60, ARRAY['intermediate', 'spiritual seekers']),
('Prenatal', 'Safe practice designed for pregnancy', 'gentle', 45, ARRAY['pregnancy']),
('Chair', 'Modified practice using a chair for support', 'gentle', 30, ARRAY['seniors', 'limited mobility', 'office workers']);