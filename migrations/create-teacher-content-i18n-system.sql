-- =====================================================
-- Comprehensive i18n System for Teacher-Generated Content
-- =====================================================
-- This migration creates a multi-tier translation system that handles
-- all teacher content with smart prioritization and cost optimization

-- =====================================================
-- Translation metadata for content prioritization
-- =====================================================
CREATE TABLE IF NOT EXISTS i18n_content_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content identification
  entity_type i18n_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  
  -- Language information
  source_locale VARCHAR(10) NOT NULL, -- Teacher's original language
  available_locales TEXT[] DEFAULT '{}', -- Completed translations
  pending_locales TEXT[] DEFAULT '{}', -- Requested but not completed
  
  -- Analytics for smart prioritization
  view_count_by_locale JSONB DEFAULT '{}', -- {"en": 150, "es": 45, "ru": 12}
  request_count_by_locale JSONB DEFAULT '{}', -- {"fr": 5, "de": 2}
  revenue_by_locale JSONB DEFAULT '{}', -- {"en": 1500.00, "es": 450.00}
  
  -- Translation priority scoring
  translation_priority INTEGER DEFAULT 0, -- Calculated score for queue ordering
  priority_factors JSONB DEFAULT '{}', -- Breakdown of priority calculation
  
  -- Version tracking
  content_version INTEGER DEFAULT 1, -- Increments when source changes
  last_modified TIMESTAMPTZ DEFAULT NOW(),
  last_translated TIMESTAMPTZ,
  
  -- Teacher preferences
  auto_translate BOOLEAN DEFAULT true, -- Allow automatic translation
  preferred_target_locales TEXT[] DEFAULT ARRAY['en', 'es', 'ru'], -- Teacher's target markets
  translation_tier VARCHAR(20) DEFAULT 'standard', -- 'immediate', 'on_demand', 'manual'
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(entity_type, entity_id)
);

-- Indexes for performance
CREATE INDEX idx_i18n_meta_priority ON i18n_content_meta(translation_priority DESC);
CREATE INDEX idx_i18n_meta_entity ON i18n_content_meta(entity_type, entity_id);
CREATE INDEX idx_i18n_meta_pending ON i18n_content_meta(array_length(pending_locales, 1));

-- =====================================================
-- Enhanced translations table with quality tracking
-- =====================================================
ALTER TABLE i18n_translations ADD COLUMN IF NOT EXISTS translation_method VARCHAR(20) DEFAULT 'auto';
ALTER TABLE i18n_translations ADD COLUMN IF NOT EXISTS translator_type VARCHAR(20) DEFAULT 'ai';
ALTER TABLE i18n_translations ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT false;
ALTER TABLE i18n_translations ADD COLUMN IF NOT EXISTS content_version INTEGER DEFAULT 1;
ALTER TABLE i18n_translations ADD COLUMN IF NOT EXISTS votes_helpful INTEGER DEFAULT 0;
ALTER TABLE i18n_translations ADD COLUMN IF NOT EXISTS votes_total INTEGER DEFAULT 0;
ALTER TABLE i18n_translations ADD COLUMN IF NOT EXISTS quality_score DECIMAL(3,2) GENERATED ALWAYS AS (
  CASE 
    WHEN votes_total > 0 THEN votes_helpful::DECIMAL / votes_total
    ELSE COALESCE(translation_confidence, 0.5)
  END
) STORED;

-- Index for quality-based retrieval
CREATE INDEX IF NOT EXISTS idx_i18n_quality ON i18n_translations(entity_type, entity_id, locale, quality_score DESC);

-- =====================================================
-- Translation requests from students
-- =====================================================
CREATE TABLE IF NOT EXISTS i18n_translation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What needs translation
  entity_type i18n_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  field_names TEXT[], -- Specific fields requested, null = all
  
  -- Who requested
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_locale VARCHAR(10) NOT NULL,
  user_tier VARCHAR(20), -- 'free', 'premium', 'pro'
  
  -- Request details
  priority VARCHAR(20) DEFAULT 'normal', -- 'urgent', 'high', 'normal', 'low'
  reason TEXT, -- Optional reason for request
  willing_to_pay BOOLEAN DEFAULT false,
  
  -- Processing
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected'
  processed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(entity_type, entity_id, user_id, user_locale)
);

-- =====================================================
-- Translation glossary for consistent terms
-- =====================================================
CREATE TABLE IF NOT EXISTS i18n_glossary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Term identification
  term_key VARCHAR(100) NOT NULL, -- e.g., 'vinyasa', 'namaste'
  context VARCHAR(50), -- 'yoga', 'meditation', 'general'
  
  -- Translations
  translations JSONB NOT NULL, -- {"en": "Vinyasa", "es": "Vinyasa", "ru": "Виньяса"}
  
  -- Metadata
  is_translatable BOOLEAN DEFAULT true, -- Some terms shouldn't be translated
  notes TEXT, -- Usage notes for translators
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(term_key, context)
);

-- =====================================================
-- Teacher translation preferences
-- =====================================================
CREATE TABLE IF NOT EXISTS teacher_translation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  
  -- Language settings
  primary_language VARCHAR(10) NOT NULL DEFAULT 'en',
  target_languages TEXT[] DEFAULT ARRAY['en', 'es', 'ru'],
  
  -- Auto-translation preferences
  auto_translate_courses BOOLEAN DEFAULT true,
  auto_translate_classes BOOLEAN DEFAULT true,
  auto_translate_articles BOOLEAN DEFAULT false,
  
  -- Quality preferences
  min_confidence_to_publish DECIMAL(3,2) DEFAULT 0.80,
  require_review_before_publish BOOLEAN DEFAULT false,
  
  -- Cost controls
  monthly_translation_budget DECIMAL(10,2), -- Optional spending limit
  current_month_spent DECIMAL(10,2) DEFAULT 0,
  
  -- Notification preferences
  notify_on_translation_complete BOOLEAN DEFAULT true,
  notify_on_translation_request BOOLEAN DEFAULT true,
  notify_weekly_summary BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(teacher_id)
);

-- =====================================================
-- Function to calculate translation priority
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_translation_priority(
  p_entity_type i18n_entity_type,
  p_entity_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_priority INTEGER := 0;
  v_meta RECORD;
  v_total_views INTEGER;
  v_total_requests INTEGER;
  v_total_revenue DECIMAL;
  v_factors JSONB := '{}';
BEGIN
  -- Get metadata
  SELECT * INTO v_meta
  FROM i18n_content_meta
  WHERE entity_type = p_entity_type
    AND entity_id = p_entity_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Calculate view score (max 30 points)
  SELECT COALESCE(SUM((value::text)::INTEGER), 0) INTO v_total_views
  FROM jsonb_each(v_meta.view_count_by_locale);
  
  v_priority := v_priority + LEAST(v_total_views / 10, 30);
  v_factors := v_factors || jsonb_build_object('view_score', LEAST(v_total_views / 10, 30));
  
  -- Calculate request score (max 20 points)
  SELECT COALESCE(SUM((value::text)::INTEGER), 0) INTO v_total_requests
  FROM jsonb_each(v_meta.request_count_by_locale);
  
  v_priority := v_priority + LEAST(v_total_requests * 2, 20);
  v_factors := v_factors || jsonb_build_object('request_score', LEAST(v_total_requests * 2, 20));
  
  -- Calculate revenue score (max 30 points)
  SELECT COALESCE(SUM((value::text)::DECIMAL), 0) INTO v_total_revenue
  FROM jsonb_each(v_meta.revenue_by_locale);
  
  v_priority := v_priority + LEAST(v_total_revenue / 100, 30);
  v_factors := v_factors || jsonb_build_object('revenue_score', LEAST(v_total_revenue / 100, 30));
  
  -- Tier bonus (max 20 points)
  CASE v_meta.translation_tier
    WHEN 'immediate' THEN 
      v_priority := v_priority + 20;
      v_factors := v_factors || jsonb_build_object('tier_bonus', 20);
    WHEN 'on_demand' THEN 
      v_priority := v_priority + 10;
      v_factors := v_factors || jsonb_build_object('tier_bonus', 10);
    ELSE 
      v_factors := v_factors || jsonb_build_object('tier_bonus', 0);
  END CASE;
  
  -- Recency penalty (reduce priority for recently translated content)
  IF v_meta.last_translated IS NOT NULL AND 
     v_meta.last_translated > NOW() - INTERVAL '24 hours' THEN
    v_priority := v_priority - 10;
    v_factors := v_factors || jsonb_build_object('recency_penalty', -10);
  END IF;
  
  -- Update the metadata with calculated priority
  UPDATE i18n_content_meta
  SET 
    translation_priority = v_priority,
    priority_factors = v_factors,
    updated_at = NOW()
  WHERE entity_type = p_entity_type
    AND entity_id = p_entity_id;
  
  RETURN v_priority;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Function to request translation (student-initiated)
-- =====================================================
CREATE OR REPLACE FUNCTION request_translation(
  p_entity_type i18n_entity_type,
  p_entity_id UUID,
  p_user_id UUID,
  p_user_locale VARCHAR,
  p_priority VARCHAR DEFAULT 'normal',
  p_reason TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_request_id UUID;
  v_user_tier VARCHAR;
BEGIN
  -- Get user tier (simplified - you'd get this from subscriptions)
  SELECT 
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM subscriptions 
        WHERE user_id = p_user_id 
        AND status = 'active'
      ) THEN 'premium'
      ELSE 'free'
    END INTO v_user_tier;
  
  -- Insert or update request
  INSERT INTO i18n_translation_requests (
    entity_type,
    entity_id,
    user_id,
    user_locale,
    user_tier,
    priority,
    reason
  ) VALUES (
    p_entity_type,
    p_entity_id,
    p_user_id,
    p_user_locale,
    v_user_tier,
    p_priority,
    p_reason
  )
  ON CONFLICT (entity_type, entity_id, user_id, user_locale) DO UPDATE
  SET 
    priority = GREATEST(i18n_translation_requests.priority, EXCLUDED.priority),
    reason = COALESCE(EXCLUDED.reason, i18n_translation_requests.reason),
    created_at = NOW()
  RETURNING id INTO v_request_id;
  
  -- Update content metadata
  UPDATE i18n_content_meta
  SET 
    request_count_by_locale = 
      jsonb_set(
        COALESCE(request_count_by_locale, '{}'),
        ARRAY[p_user_locale],
        to_jsonb(COALESCE((request_count_by_locale->>p_user_locale)::INTEGER, 0) + 1)
      ),
    pending_locales = 
      CASE 
        WHEN p_user_locale = ANY(available_locales) THEN pending_locales
        WHEN p_user_locale = ANY(pending_locales) THEN pending_locales
        ELSE array_append(pending_locales, p_user_locale)
      END,
    updated_at = NOW()
  WHERE entity_type = p_entity_type
    AND entity_id = p_entity_id;
  
  -- Recalculate priority
  PERFORM calculate_translation_priority(p_entity_type, p_entity_id);
  
  -- Notify the teacher (would trigger a notification system)
  PERFORM pg_notify('translation_requested', json_build_object(
    'request_id', v_request_id,
    'entity_type', p_entity_type,
    'entity_id', p_entity_id,
    'locale', p_user_locale,
    'user_tier', v_user_tier
  )::text);
  
  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Function to track content views for prioritization
-- =====================================================
CREATE OR REPLACE FUNCTION track_content_view(
  p_entity_type i18n_entity_type,
  p_entity_id UUID,
  p_user_locale VARCHAR
) RETURNS VOID AS $$
BEGIN
  -- Initialize metadata if doesn't exist
  INSERT INTO i18n_content_meta (
    entity_type,
    entity_id,
    source_locale,
    view_count_by_locale
  ) VALUES (
    p_entity_type,
    p_entity_id,
    'en', -- Default, should be detected from content
    jsonb_build_object(p_user_locale, 1)
  )
  ON CONFLICT (entity_type, entity_id) DO UPDATE
  SET 
    view_count_by_locale = 
      jsonb_set(
        COALESCE(i18n_content_meta.view_count_by_locale, '{}'),
        ARRAY[p_user_locale],
        to_jsonb(COALESCE((i18n_content_meta.view_count_by_locale->>p_user_locale)::INTEGER, 0) + 1)
      ),
    updated_at = NOW();
  
  -- Check if we should auto-translate based on view threshold
  PERFORM check_auto_translation_threshold(p_entity_type, p_entity_id, p_user_locale);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Function to check if content should be auto-translated
-- =====================================================
CREATE OR REPLACE FUNCTION check_auto_translation_threshold(
  p_entity_type i18n_entity_type,
  p_entity_id UUID,
  p_locale VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
  v_view_count INTEGER;
  v_threshold INTEGER := 10; -- Translate after 10 views in a language
  v_exists BOOLEAN;
BEGIN
  -- Check if translation already exists
  SELECT EXISTS (
    SELECT 1 FROM i18n_translations
    WHERE entity_type = p_entity_type
      AND entity_id = p_entity_id
      AND locale = p_locale
    LIMIT 1
  ) INTO v_exists;
  
  IF v_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Get view count for this locale
  SELECT (view_count_by_locale->>p_locale)::INTEGER INTO v_view_count
  FROM i18n_content_meta
  WHERE entity_type = p_entity_type
    AND entity_id = p_entity_id;
  
  -- If threshold met, queue for translation
  IF v_view_count >= v_threshold THEN
    INSERT INTO i18n_translation_queue (
      entity_type,
      entity_id,
      target_locales,
      status
    ) VALUES (
      p_entity_type,
      p_entity_id,
      ARRAY[p_locale],
      'pending'
    )
    ON CONFLICT (entity_type, entity_id) DO UPDATE
    SET 
      target_locales = array_append(
        COALESCE(i18n_translation_queue.target_locales, '{}'),
        p_locale
      ),
      status = 'pending'
    WHERE i18n_translation_queue.status != 'processing';
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Function to vote on translation quality
-- =====================================================
CREATE OR REPLACE FUNCTION vote_translation_quality(
  p_entity_type i18n_entity_type,
  p_entity_id UUID,
  p_field_name VARCHAR,
  p_locale VARCHAR,
  p_is_helpful BOOLEAN,
  p_user_id UUID
) RETURNS VOID AS $$
BEGIN
  -- Update vote counts
  UPDATE i18n_translations
  SET 
    votes_total = votes_total + 1,
    votes_helpful = votes_helpful + CASE WHEN p_is_helpful THEN 1 ELSE 0 END
  WHERE entity_type = p_entity_type
    AND entity_id = p_entity_id
    AND field_name = p_field_name
    AND locale = p_locale;
  
  -- Track user vote (to prevent duplicates - would need a separate table)
  -- This is simplified for now
  
  -- If quality drops below threshold, flag for review
  UPDATE i18n_translations
  SET needs_review = true
  WHERE entity_type = p_entity_type
    AND entity_id = p_entity_id
    AND field_name = p_field_name
    AND locale = p_locale
    AND votes_total > 5
    AND (votes_helpful::DECIMAL / votes_total) < 0.6;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- RPC function to get best available translation
-- =====================================================
CREATE OR REPLACE FUNCTION get_best_translation(
  p_entity_type i18n_entity_type,
  p_entity_id UUID,
  p_field_name VARCHAR,
  p_locale VARCHAR,
  p_fallback_locales VARCHAR[] DEFAULT ARRAY['en']
) RETURNS TABLE (
  translation TEXT,
  locale VARCHAR,
  quality_score DECIMAL,
  is_auto_translated BOOLEAN,
  needs_review BOOLEAN
) AS $$
BEGIN
  -- Try to get translation in requested locale
  RETURN QUERY
  SELECT 
    t.translation,
    t.locale,
    t.quality_score,
    t.is_auto_translated,
    t.needs_review
  FROM i18n_translations t
  WHERE t.entity_type = p_entity_type
    AND t.entity_id = p_entity_id
    AND t.field_name = p_field_name
    AND t.locale = p_locale
    AND (NOT t.needs_review OR t.quality_score > 0.7)
  ORDER BY t.quality_score DESC
  LIMIT 1;
  
  -- If not found, try fallback locales
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      t.translation,
      t.locale,
      t.quality_score,
      t.is_auto_translated,
      t.needs_review
    FROM i18n_translations t
    WHERE t.entity_type = p_entity_type
      AND t.entity_id = p_entity_id
      AND t.field_name = p_field_name
      AND t.locale = ANY(p_fallback_locales)
      AND (NOT t.needs_review OR t.quality_score > 0.7)
    ORDER BY 
      array_position(p_fallback_locales, t.locale),
      t.quality_score DESC
    LIMIT 1;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- Populate initial glossary with common yoga terms
-- =====================================================
INSERT INTO i18n_glossary (term_key, context, translations, is_translatable) VALUES
  ('namaste', 'yoga', '{"en": "Namaste", "es": "Namaste", "ru": "Намасте"}', false),
  ('asana', 'yoga', '{"en": "Asana", "es": "Asana", "ru": "Асана"}', false),
  ('pranayama', 'yoga', '{"en": "Pranayama", "es": "Pranayama", "ru": "Пранаяма"}', false),
  ('vinyasa', 'yoga', '{"en": "Vinyasa", "es": "Vinyasa", "ru": "Виньяса"}', false),
  ('chakra', 'yoga', '{"en": "Chakra", "es": "Chakra", "ru": "Чакра"}', false),
  ('meditation', 'general', '{"en": "Meditation", "es": "Meditación", "ru": "Медитация"}', true),
  ('breathing', 'general', '{"en": "Breathing", "es": "Respiración", "ru": "Дыхание"}', true),
  ('beginner', 'level', '{"en": "Beginner", "es": "Principiante", "ru": "Начинающий"}', true),
  ('intermediate', 'level', '{"en": "Intermediate", "es": "Intermedio", "ru": "Средний"}', true),
  ('advanced', 'level', '{"en": "Advanced", "es": "Avanzado", "ru": "Продвинутый"}', true)
ON CONFLICT (term_key, context) DO NOTHING;

-- =====================================================
-- Grant permissions
-- =====================================================
GRANT SELECT ON i18n_content_meta TO authenticated;
GRANT SELECT, INSERT, UPDATE ON i18n_translation_requests TO authenticated;
GRANT SELECT ON i18n_glossary TO authenticated;
GRANT SELECT ON teacher_translation_settings TO authenticated;

GRANT EXECUTE ON FUNCTION calculate_translation_priority TO authenticated;
GRANT EXECUTE ON FUNCTION request_translation TO authenticated;
GRANT EXECUTE ON FUNCTION track_content_view TO authenticated;
GRANT EXECUTE ON FUNCTION vote_translation_quality TO authenticated;
GRANT EXECUTE ON FUNCTION get_best_translation TO authenticated;

-- Teachers can manage their own settings
CREATE POLICY "Teachers manage own translation settings"
  ON teacher_translation_settings
  FOR ALL
  USING (teacher_id IN (
    SELECT id FROM teachers WHERE user_id = auth.uid()
  ));

-- =====================================================
-- Success message
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'Teacher content i18n system created successfully';
  RAISE NOTICE 'Features enabled:';
  RAISE NOTICE '- Smart translation prioritization';
  RAISE NOTICE '- Student translation requests';
  RAISE NOTICE '- View-based auto-translation';
  RAISE NOTICE '- Quality voting system';
  RAISE NOTICE '- Translation glossary';
  RAISE NOTICE '- Teacher preferences';
END $$;