-- ============================================
-- SPIRITUAL CONTENT MANAGEMENT SYSTEM
-- Multilingual support for EN, RU, ES
-- ============================================

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS daily_quotes CASCADE;
DROP TABLE IF EXISTS quote_interactions CASCADE;
DROP TABLE IF EXISTS yoga_quotes CASCADE;
DROP TABLE IF EXISTS yoga_texts CASCADE;
DROP TABLE IF EXISTS moon_practice_guidelines CASCADE;
DROP TABLE IF EXISTS moon_calendar CASCADE;
DROP TABLE IF EXISTS moon_phases CASCADE;
DROP TABLE IF EXISTS chakra_daily_focus CASCADE;
DROP TABLE IF EXISTS chakra_rotation_patterns CASCADE;
DROP TABLE IF EXISTS chakras CASCADE;

-- ============================================
-- CHAKRA SYSTEM
-- ============================================

-- Core chakra information with multilingual support
CREATE TABLE chakras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INTEGER NOT NULL CHECK (number >= 1 AND number <= 7),
  sanskrit_name VARCHAR(50) NOT NULL,
  
  -- Multilingual fields
  name_en VARCHAR(50) NOT NULL,
  name_ru VARCHAR(50) NOT NULL,
  name_es VARCHAR(50) NOT NULL,
  
  element_en VARCHAR(20),
  element_ru VARCHAR(20),
  element_es VARCHAR(20),
  
  location_en TEXT,
  location_ru TEXT,
  location_es TEXT,
  
  description_en TEXT,
  description_ru TEXT,
  description_es TEXT,
  
  healing_focus_en TEXT,
  healing_focus_ru TEXT,
  healing_focus_es TEXT,
  
  affirmation_en TEXT,
  affirmation_ru TEXT,
  affirmation_es TEXT,
  
  -- Universal fields
  color_hex VARCHAR(7) NOT NULL,
  mantra VARCHAR(10),
  frequency_hz INTEGER,
  symbol_url TEXT,
  
  -- JSON fields for arrays (multilingual)
  blocked_symptoms_en JSONB DEFAULT '[]',
  blocked_symptoms_ru JSONB DEFAULT '[]',
  blocked_symptoms_es JSONB DEFAULT '[]',
  
  balanced_qualities_en JSONB DEFAULT '[]',
  balanced_qualities_ru JSONB DEFAULT '[]',
  balanced_qualities_es JSONB DEFAULT '[]',
  
  yoga_poses JSONB DEFAULT '[]', -- Pose names are generally universal
  crystals_en JSONB DEFAULT '[]',
  crystals_ru JSONB DEFAULT '[]',
  crystals_es JSONB DEFAULT '[]',
  
  essential_oils_en JSONB DEFAULT '[]',
  essential_oils_ru JSONB DEFAULT '[]',
  essential_oils_es JSONB DEFAULT '[]',
  
  foods_en JSONB DEFAULT '[]',
  foods_ru JSONB DEFAULT '[]',
  foods_es JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(number),
  UNIQUE(sanskrit_name)
);

-- Daily chakra schedule
CREATE TABLE chakra_daily_focus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  chakra_id UUID REFERENCES chakras(id) ON DELETE CASCADE,
  
  -- Custom messages in multiple languages
  custom_message_en TEXT,
  custom_message_ru TEXT,
  custom_message_es TEXT,
  
  meditation_minutes INTEGER DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chakra rotation patterns
CREATE TYPE rotation_pattern_type AS ENUM ('sequential', 'day_based', 'moon_based', 'seasonal', 'custom');

CREATE TABLE chakra_rotation_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name_en VARCHAR(50) NOT NULL,
  name_ru VARCHAR(50) NOT NULL,
  name_es VARCHAR(50) NOT NULL,
  
  pattern_type rotation_pattern_type NOT NULL,
  rules JSONB NOT NULL, -- Configuration for the pattern
  is_active BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MOON PHASE SYSTEM
-- ============================================

-- Moon phase definitions with multilingual support
CREATE TABLE moon_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_value DECIMAL(3,2) NOT NULL CHECK (phase_value >= 0 AND phase_value <= 1),
  emoji VARCHAR(4) NOT NULL,
  
  -- Multilingual fields
  name_en VARCHAR(30) NOT NULL,
  name_ru VARCHAR(30) NOT NULL,
  name_es VARCHAR(30) NOT NULL,
  
  energy_type_en VARCHAR(30),
  energy_type_ru VARCHAR(30),
  energy_type_es VARCHAR(30),
  
  description_en TEXT,
  description_ru TEXT,
  description_es TEXT,
  
  yoga_focus_en TEXT,
  yoga_focus_ru TEXT,
  yoga_focus_es TEXT,
  
  meditation_guidance_en TEXT,
  meditation_guidance_ru TEXT,
  meditation_guidance_es TEXT,
  
  -- JSON arrays (multilingual)
  ritual_suggestions_en JSONB DEFAULT '[]',
  ritual_suggestions_ru JSONB DEFAULT '[]',
  ritual_suggestions_es JSONB DEFAULT '[]',
  
  affirmations_en JSONB DEFAULT '[]',
  affirmations_ru JSONB DEFAULT '[]',
  affirmations_es JSONB DEFAULT '[]',
  
  crystals_en JSONB DEFAULT '[]',
  crystals_ru JSONB DEFAULT '[]',
  crystals_es JSONB DEFAULT '[]',
  
  avoid_activities_en JSONB DEFAULT '[]',
  avoid_activities_ru JSONB DEFAULT '[]',
  avoid_activities_es JSONB DEFAULT '[]',
  
  journal_prompts_en JSONB DEFAULT '[]',
  journal_prompts_ru JSONB DEFAULT '[]',
  journal_prompts_es JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(phase_value)
);

-- Astronomical moon data
CREATE TABLE moon_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  phase_id UUID REFERENCES moon_phases(id) ON DELETE SET NULL,
  exact_phase DECIMAL(5,4) NOT NULL,
  illumination_percent DECIMAL(5,2) NOT NULL,
  
  zodiac_sign_en VARCHAR(20),
  zodiac_sign_ru VARCHAR(20),
  zodiac_sign_es VARCHAR(20),
  
  moonrise TIME,
  moonset TIME,
  is_supermoon BOOLEAN DEFAULT false,
  is_eclipse BOOLEAN DEFAULT false,
  
  special_name_en VARCHAR(50),
  special_name_ru VARCHAR(50),
  special_name_es VARCHAR(50),
  
  astrological_significance_en TEXT,
  astrological_significance_ru TEXT,
  astrological_significance_es TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Moon phase impacts on practice
CREATE TABLE moon_practice_guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID REFERENCES moon_phases(id) ON DELETE CASCADE,
  practice_type VARCHAR(30) NOT NULL, -- 'vinyasa', 'yin', 'meditation'
  intensity_level INTEGER CHECK (intensity_level >= 1 AND intensity_level <= 5),
  recommended BOOLEAN DEFAULT true,
  
  guidance_en TEXT,
  guidance_ru TEXT,
  guidance_es TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(phase_id, practice_type)
);

-- ============================================
-- DAILY YOGA WISDOM SYSTEM
-- ============================================

-- Source books/texts
CREATE TABLE yoga_texts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  title_en VARCHAR(200) NOT NULL,
  title_ru VARCHAR(200),
  title_es VARCHAR(200),
  
  author VARCHAR(100) NOT NULL,
  tradition VARCHAR(50),
  original_language VARCHAR(20),
  publication_year INTEGER,
  is_ancient BOOLEAN DEFAULT false,
  
  description_en TEXT,
  description_ru TEXT,
  description_es TEXT,
  
  cover_image_url TEXT,
  purchase_link TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual quotes with translations
CREATE TABLE yoga_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text_id UUID REFERENCES yoga_texts(id) ON DELETE CASCADE,
  
  -- Quote in multiple languages
  quote_en TEXT NOT NULL,
  quote_ru TEXT,
  quote_es TEXT,
  
  sanskrit_original TEXT,
  transliteration TEXT,
  
  chapter VARCHAR(50),
  verse VARCHAR(50),
  
  -- Context/explanation in multiple languages
  context_en TEXT,
  context_ru TEXT,
  context_es TEXT,
  
  theme VARCHAR(50),
  tags JSONB DEFAULT '[]',
  difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 3),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quote scheduling
CREATE TABLE daily_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  quote_id UUID REFERENCES yoga_quotes(id) ON DELETE CASCADE,
  is_special_occasion BOOLEAN DEFAULT false,
  
  occasion_name_en VARCHAR(100),
  occasion_name_ru VARCHAR(100),
  occasion_name_es VARCHAR(100),
  
  engagement_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User interactions with quotes
CREATE TABLE quote_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES yoga_quotes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  interaction_type VARCHAR(10) CHECK (interaction_type IN ('view', 'like', 'share', 'save')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(quote_id, user_id, interaction_type)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_chakra_daily_focus_date ON chakra_daily_focus(date);
CREATE INDEX idx_moon_calendar_date ON moon_calendar(date);
CREATE INDEX idx_daily_quotes_date ON daily_quotes(date);
CREATE INDEX idx_quote_interactions_user ON quote_interactions(user_id);
CREATE INDEX idx_quote_interactions_quote ON quote_interactions(quote_id);
CREATE INDEX idx_chakras_number ON chakras(number);
CREATE INDEX idx_moon_phases_value ON moon_phases(phase_value);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE chakras ENABLE ROW LEVEL SECURITY;
ALTER TABLE chakra_daily_focus ENABLE ROW LEVEL SECURITY;
ALTER TABLE chakra_rotation_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE moon_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE moon_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE moon_practice_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE yoga_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE yoga_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_interactions ENABLE ROW LEVEL SECURITY;

-- Public read access for spiritual content
CREATE POLICY "Public can read chakras" ON chakras FOR SELECT USING (true);
CREATE POLICY "Public can read chakra daily focus" ON chakra_daily_focus FOR SELECT USING (true);
CREATE POLICY "Public can read moon phases" ON moon_phases FOR SELECT USING (true);
CREATE POLICY "Public can read moon calendar" ON moon_calendar FOR SELECT USING (true);
CREATE POLICY "Public can read moon guidelines" ON moon_practice_guidelines FOR SELECT USING (true);
CREATE POLICY "Public can read yoga texts" ON yoga_texts FOR SELECT USING (true);
CREATE POLICY "Public can read yoga quotes" ON yoga_quotes FOR SELECT USING (true);
CREATE POLICY "Public can read daily quotes" ON daily_quotes FOR SELECT USING (true);

-- Admin write access (requires admin role)
CREATE POLICY "Admins can manage chakras" ON chakras FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage chakra focus" ON chakra_daily_focus FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage rotation patterns" ON chakra_rotation_patterns FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage moon phases" ON moon_phases FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage moon calendar" ON moon_calendar FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage moon guidelines" ON moon_practice_guidelines FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage yoga texts" ON yoga_texts FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage yoga quotes" ON yoga_quotes FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage daily quotes" ON daily_quotes FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin');

-- User interactions policies
CREATE POLICY "Users can view their interactions" ON quote_interactions 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create interactions" ON quote_interactions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their interactions" ON quote_interactions 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their interactions" ON quote_interactions 
  FOR DELETE USING (auth.uid() = user_id);