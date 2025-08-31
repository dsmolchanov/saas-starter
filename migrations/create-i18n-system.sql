-- =====================================================
-- Centralized i18n Translation System
-- =====================================================
-- This migration creates a bulletproof, future-proof translation system
-- All translatable text across the app is stored in a single table
-- with RPC functions for efficient localized data fetching

-- Drop existing tables if they exist (for re-running migration)
DROP TABLE IF EXISTS i18n_translations CASCADE;
DROP TABLE IF EXISTS i18n_required_fields CASCADE;
DROP TYPE IF EXISTS i18n_entity_type CASCADE;

-- Create enum for entity types (easier to maintain than strings)
CREATE TYPE i18n_entity_type AS ENUM (
  'chakra',
  'moon_phase',
  'yoga_quote',
  'asana',
  'meditation',
  'breathing_exercise',
  'class',
  'course',
  'challenge',
  'workshop',
  'program',
  'article',
  'ui_text' -- For static UI translations
);

-- =====================================================
-- Main i18n translations table
-- =====================================================
CREATE TABLE i18n_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Entity identification
  entity_type i18n_entity_type NOT NULL,
  entity_id UUID NOT NULL, -- Reference to the actual entity
  field_name VARCHAR(50) NOT NULL, -- 'name', 'description', 'element', etc.
  
  -- Translation data
  locale VARCHAR(10) NOT NULL, -- 'en', 'ru', 'es', 'de', 'fr', etc.
  translation TEXT NOT NULL,
  
  -- Translation metadata
  is_auto_translated BOOLEAN DEFAULT false,
  auto_translation_service VARCHAR(50), -- 'google', 'deepl', 'openai'
  translation_confidence DECIMAL(3,2), -- 0.00 to 1.00
  
  -- Tracking
  translator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure uniqueness
  UNIQUE(entity_type, entity_id, field_name, locale)
);

-- Indexes for performance
CREATE INDEX idx_i18n_entity_lookup ON i18n_translations(entity_type, entity_id, locale);
CREATE INDEX idx_i18n_field_lookup ON i18n_translations(entity_type, entity_id, field_name);
CREATE INDEX idx_i18n_locale ON i18n_translations(locale);
CREATE INDEX idx_i18n_auto_translated ON i18n_translations(is_auto_translated) WHERE is_auto_translated = true;

-- =====================================================
-- Required fields tracking table
-- =====================================================
-- Defines which fields need translation for each entity type
CREATE TABLE i18n_required_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type i18n_entity_type NOT NULL,
  field_name VARCHAR(50) NOT NULL,
  is_required BOOLEAN DEFAULT true,
  max_length INTEGER, -- For validation
  description TEXT, -- For translators
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(entity_type, field_name)
);

-- Define required fields for each entity type
INSERT INTO i18n_required_fields (entity_type, field_name, description) VALUES
  -- Chakras
  ('chakra', 'name', 'The name of the chakra (e.g., Root Chakra)'),
  ('chakra', 'element', 'The element associated with the chakra (e.g., Earth)'),
  ('chakra', 'location', 'Physical location in the body'),
  ('chakra', 'description', 'Detailed description of the chakra'),
  ('chakra', 'healing_practices', 'Healing practices for this chakra'),
  
  -- Moon Phases
  ('moon_phase', 'name', 'The name of the moon phase (e.g., New Moon)'),
  ('moon_phase', 'energy_type', 'Type of energy (e.g., Growth Energy)'),
  ('moon_phase', 'description', 'Description of the moon phase'),
  ('moon_phase', 'practice_guidance', 'Yoga practice recommendations'),
  
  -- Yoga Quotes
  ('yoga_quote', 'quote', 'The actual quote text'),
  ('yoga_quote', 'author', 'Author of the quote'),
  ('yoga_quote', 'source', 'Source text or book'),
  
  -- Asanas
  ('asana', 'name', 'The English name of the pose'),
  ('asana', 'description', 'Detailed description'),
  ('asana', 'benefits', 'Benefits of the pose'),
  ('asana', 'contraindications', 'When to avoid this pose'),
  ('asana', 'alignment_cues', 'Alignment instructions'),
  
  -- Classes
  ('class', 'title', 'Class title'),
  ('class', 'description', 'Class description'),
  
  -- Courses
  ('course', 'title', 'Course title'),
  ('course', 'description', 'Course description');

-- =====================================================
-- Helper function to get translation with fallback
-- =====================================================
CREATE OR REPLACE FUNCTION get_translation(
  p_entity_type i18n_entity_type,
  p_entity_id UUID,
  p_field_name VARCHAR,
  p_locale VARCHAR,
  p_fallback_locale VARCHAR DEFAULT 'en'
) RETURNS TEXT AS $$
DECLARE
  v_translation TEXT;
BEGIN
  -- Try to get translation in requested locale
  SELECT translation INTO v_translation
  FROM i18n_translations
  WHERE entity_type = p_entity_type
    AND entity_id = p_entity_id
    AND field_name = p_field_name
    AND locale = p_locale;
  
  -- If not found, try fallback locale
  IF v_translation IS NULL AND p_fallback_locale IS NOT NULL THEN
    SELECT translation INTO v_translation
    FROM i18n_translations
    WHERE entity_type = p_entity_type
      AND entity_id = p_entity_id
      AND field_name = p_field_name
      AND locale = p_fallback_locale;
  END IF;
  
  RETURN v_translation;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- RPC: Get spiritual content for home page
-- =====================================================
CREATE OR REPLACE FUNCTION get_spiritual_content_localized(
  p_locale VARCHAR DEFAULT 'en',
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $$
DECLARE
  v_chakra JSONB;
  v_moon_phase JSONB;
  v_yoga_quote JSONB;
  v_day_of_week INT;
  v_chakra_id UUID;
  v_moon_phase_id UUID;
  v_quote_id UUID;
BEGIN
  -- Get day of week (0-6)
  v_day_of_week := EXTRACT(DOW FROM p_date);
  
  -- Get today's chakra (cycles through 7 chakras by day of week)
  SELECT c.id INTO v_chakra_id
  FROM chakras c
  WHERE c.number = (v_day_of_week % 7) + 1;
  
  IF v_chakra_id IS NOT NULL THEN
    SELECT jsonb_build_object(
      'id', c.id,
      'number', c.number,
      'sanskrit_name', c.sanskrit_name,
      'color_hex', c.color_hex,
      'name', get_translation('chakra', c.id, 'name', p_locale),
      'element', get_translation('chakra', c.id, 'element', p_locale),
      'location', get_translation('chakra', c.id, 'location', p_locale),
      'description', get_translation('chakra', c.id, 'description', p_locale),
      'healing_practices', get_translation('chakra', c.id, 'healing_practices', p_locale)
    ) INTO v_chakra
    FROM chakras c
    WHERE c.id = v_chakra_id;
  END IF;
  
  -- Get moon phase for today
  SELECT mp.id INTO v_moon_phase_id
  FROM moon_calendar mc
  JOIN moon_phases mp ON mc.phase_id = mp.id
  WHERE mc.date = p_date
  LIMIT 1;
  
  -- If no calendar entry, calculate based on lunar cycle
  IF v_moon_phase_id IS NULL THEN
    DECLARE
      v_lunar_cycle CONSTANT DECIMAL := 29.53059;
      v_known_new_moon CONSTANT DATE := '2024-01-11';
      v_days_since DECIMAL;
      v_phase_value DECIMAL;
    BEGIN
      v_days_since := p_date - v_known_new_moon;
      v_phase_value := MOD(MOD(v_days_since, v_lunar_cycle) + v_lunar_cycle, v_lunar_cycle) / v_lunar_cycle;
      
      -- Find closest moon phase
      SELECT mp.id INTO v_moon_phase_id
      FROM moon_phases mp
      ORDER BY ABS(mp.phase_value - v_phase_value)
      LIMIT 1;
    END;
  END IF;
  
  IF v_moon_phase_id IS NOT NULL THEN
    SELECT jsonb_build_object(
      'id', mp.id,
      'emoji', mp.emoji,
      'phase_value', mp.phase_value,
      'name', get_translation('moon_phase', mp.id, 'name', p_locale),
      'energy_type', get_translation('moon_phase', mp.id, 'energy_type', p_locale),
      'description', get_translation('moon_phase', mp.id, 'description', p_locale),
      'practice_guidance', get_translation('moon_phase', mp.id, 'practice_guidance', p_locale)
    ) INTO v_moon_phase
    FROM moon_phases mp
    WHERE mp.id = v_moon_phase_id;
  END IF;
  
  -- Get daily quote
  SELECT yq.id INTO v_quote_id
  FROM daily_quotes dq
  JOIN yoga_quotes yq ON dq.quote_id = yq.id
  WHERE dq.date = p_date
  LIMIT 1;
  
  -- If no daily quote, get a random one
  IF v_quote_id IS NULL THEN
    SELECT yq.id INTO v_quote_id
    FROM yoga_quotes yq
    ORDER BY RANDOM()
    LIMIT 1;
  END IF;
  
  IF v_quote_id IS NOT NULL THEN
    SELECT jsonb_build_object(
      'id', yq.id,
      'quote', get_translation('yoga_quote', yq.id, 'quote', p_locale),
      'author', COALESCE(
        get_translation('yoga_quote', yq.id, 'author', p_locale),
        yq.author
      ),
      'source', get_translation('yoga_quote', yq.id, 'source', p_locale),
      'chapter', yq.chapter,
      'verse', yq.verse
    ) INTO v_yoga_quote
    FROM yoga_quotes yq
    WHERE yq.id = v_quote_id;
  END IF;
  
  -- Return combined result
  RETURN jsonb_build_object(
    'chakra', v_chakra,
    'moonPhase', v_moon_phase,
    'yogaQuote', v_yoga_quote
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- Function to check translation completeness
-- =====================================================
CREATE OR REPLACE FUNCTION get_translation_stats(p_entity_type i18n_entity_type DEFAULT NULL)
RETURNS TABLE (
  entity_type i18n_entity_type,
  total_entities BIGINT,
  total_fields BIGINT,
  translations_en BIGINT,
  translations_ru BIGINT,
  translations_es BIGINT,
  auto_translated BIGINT,
  reviewed BIGINT,
  completeness_en DECIMAL,
  completeness_ru DECIMAL,
  completeness_es DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH entity_counts AS (
    SELECT 
      et.entity_type,
      COUNT(DISTINCT et.entity_id) as entity_count,
      COUNT(DISTINCT rf.field_name) as field_count
    FROM (
      SELECT DISTINCT entity_type, entity_id 
      FROM i18n_translations
      WHERE p_entity_type IS NULL OR entity_type = p_entity_type
    ) et
    CROSS JOIN i18n_required_fields rf
    WHERE rf.entity_type = et.entity_type
    GROUP BY et.entity_type
  ),
  translation_counts AS (
    SELECT
      t.entity_type,
      COUNT(*) FILTER (WHERE t.locale = 'en') as en_count,
      COUNT(*) FILTER (WHERE t.locale = 'ru') as ru_count,
      COUNT(*) FILTER (WHERE t.locale = 'es') as es_count,
      COUNT(*) FILTER (WHERE t.is_auto_translated = true) as auto_count,
      COUNT(*) FILTER (WHERE t.reviewed_at IS NOT NULL) as reviewed_count
    FROM i18n_translations t
    WHERE p_entity_type IS NULL OR t.entity_type = p_entity_type
    GROUP BY t.entity_type
  )
  SELECT
    ec.entity_type,
    ec.entity_count,
    ec.entity_count * ec.field_count as total_fields,
    COALESCE(tc.en_count, 0),
    COALESCE(tc.ru_count, 0),
    COALESCE(tc.es_count, 0),
    COALESCE(tc.auto_count, 0),
    COALESCE(tc.reviewed_count, 0),
    ROUND(COALESCE(tc.en_count, 0)::DECIMAL / (ec.entity_count * ec.field_count) * 100, 2),
    ROUND(COALESCE(tc.ru_count, 0)::DECIMAL / (ec.entity_count * ec.field_count) * 100, 2),
    ROUND(COALESCE(tc.es_count, 0)::DECIMAL / (ec.entity_count * ec.field_count) * 100, 2)
  FROM entity_counts ec
  LEFT JOIN translation_counts tc ON ec.entity_type = tc.entity_type;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- Trigger to update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_i18n_translations_updated_at
  BEFORE UPDATE ON i18n_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Function to find missing translations
-- =====================================================
CREATE OR REPLACE FUNCTION find_missing_translations(
  p_locale VARCHAR,
  p_entity_type i18n_entity_type DEFAULT NULL
)
RETURNS TABLE (
  entity_type i18n_entity_type,
  entity_id UUID,
  field_name VARCHAR,
  has_english BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH existing_entities AS (
    SELECT DISTINCT entity_type, entity_id
    FROM i18n_translations
    WHERE p_entity_type IS NULL OR entity_type = p_entity_type
  ),
  required_translations AS (
    SELECT 
      ee.entity_type,
      ee.entity_id,
      rf.field_name
    FROM existing_entities ee
    CROSS JOIN i18n_required_fields rf
    WHERE rf.entity_type = ee.entity_type
      AND rf.is_required = true
  )
  SELECT
    rt.entity_type,
    rt.entity_id,
    rt.field_name,
    EXISTS(
      SELECT 1 FROM i18n_translations t
      WHERE t.entity_type = rt.entity_type
        AND t.entity_id = rt.entity_id
        AND t.field_name = rt.field_name
        AND t.locale = 'en'
    ) as has_english
  FROM required_translations rt
  WHERE NOT EXISTS (
    SELECT 1 FROM i18n_translations t
    WHERE t.entity_type = rt.entity_type
      AND t.entity_id = rt.entity_id
      AND t.field_name = rt.field_name
      AND t.locale = p_locale
  )
  ORDER BY rt.entity_type, rt.entity_id, rt.field_name;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- Grant permissions
-- =====================================================
GRANT SELECT ON i18n_translations TO authenticated;
GRANT SELECT ON i18n_required_fields TO authenticated;
GRANT EXECUTE ON FUNCTION get_translation TO authenticated;
GRANT EXECUTE ON FUNCTION get_spiritual_content_localized TO authenticated;
GRANT EXECUTE ON FUNCTION get_translation_stats TO authenticated;
GRANT EXECUTE ON FUNCTION find_missing_translations TO authenticated;

-- For admin/translator users (you may want to create a specific role)
-- GRANT INSERT, UPDATE ON i18n_translations TO translator_role;