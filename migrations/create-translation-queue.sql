-- =====================================================
-- Translation Queue Management System
-- =====================================================
-- This migration adds queue management for automatic translations
-- to prevent duplicate work and track translation status

-- Create translation queue table
CREATE TABLE IF NOT EXISTS i18n_translation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type i18n_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  source_locale VARCHAR(10),
  target_locales TEXT[], -- Array of target locales
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Prevent duplicate queue entries
  UNIQUE(entity_type, entity_id)
);

-- Index for queue processing
CREATE INDEX idx_translation_queue_status ON i18n_translation_queue(status, created_at);

-- =====================================================
-- Function to queue entity for translation
-- =====================================================
CREATE OR REPLACE FUNCTION queue_entity_for_translation(
  p_entity_type i18n_entity_type,
  p_entity_id UUID,
  p_source_locale VARCHAR DEFAULT NULL,
  p_target_locales TEXT[] DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_queue_id UUID;
BEGIN
  -- Insert or update queue entry
  INSERT INTO i18n_translation_queue (
    entity_type,
    entity_id,
    source_locale,
    target_locales,
    status
  ) VALUES (
    p_entity_type,
    p_entity_id,
    p_source_locale,
    p_target_locales,
    'pending'
  )
  ON CONFLICT (entity_type, entity_id) DO UPDATE
  SET 
    source_locale = EXCLUDED.source_locale,
    target_locales = EXCLUDED.target_locales,
    status = CASE 
      WHEN i18n_translation_queue.status = 'processing' THEN i18n_translation_queue.status
      ELSE 'pending'
    END,
    created_at = CASE
      WHEN i18n_translation_queue.status IN ('completed', 'failed') THEN NOW()
      ELSE i18n_translation_queue.created_at
    END
  RETURNING id INTO v_queue_id;
  
  RETURN v_queue_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Trigger to auto-queue new content for translation
-- =====================================================
CREATE OR REPLACE FUNCTION auto_queue_for_translation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only queue if this is the first translation for an entity
  -- (i.e., when content is first created)
  IF NOT EXISTS (
    SELECT 1 FROM i18n_translations
    WHERE entity_type = NEW.entity_type
      AND entity_id = NEW.entity_id
      AND id != NEW.id
  ) THEN
    -- Queue for translation after a short delay
    -- This allows multiple fields to be inserted before triggering
    PERFORM pg_notify('new_translation_needed', json_build_object(
      'entity_type', NEW.entity_type,
      'entity_id', NEW.entity_id,
      'locale', NEW.locale
    )::text);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-queueing
CREATE TRIGGER trigger_auto_queue_translation
  AFTER INSERT ON i18n_translations
  FOR EACH ROW
  EXECUTE FUNCTION auto_queue_for_translation();

-- =====================================================
-- Function to process translation queue
-- =====================================================
CREATE OR REPLACE FUNCTION process_translation_queue()
RETURNS TABLE (
  queue_id UUID,
  entity_type i18n_entity_type,
  entity_id UUID
) AS $$
BEGIN
  -- Get pending items from queue
  RETURN QUERY
  UPDATE i18n_translation_queue q
  SET 
    status = 'processing',
    started_at = NOW()
  FROM (
    SELECT id
    FROM i18n_translation_queue
    WHERE status = 'pending'
    ORDER BY created_at
    LIMIT 10 -- Process up to 10 items at a time
  ) pending
  WHERE q.id = pending.id
  RETURNING q.id, q.entity_type, q.entity_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Function to mark translation as completed
-- =====================================================
CREATE OR REPLACE FUNCTION mark_translation_completed(
  p_entity_type i18n_entity_type,
  p_entity_id UUID,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE i18n_translation_queue
  SET 
    status = CASE WHEN p_success THEN 'completed' ELSE 'failed' END,
    completed_at = NOW(),
    error_message = p_error_message
  WHERE entity_type = p_entity_type
    AND entity_id = p_entity_id
    AND status = 'processing';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- View for translation queue status
-- =====================================================
CREATE OR REPLACE VIEW v_translation_queue_status AS
SELECT 
  status,
  COUNT(*) as count,
  MIN(created_at) as oldest,
  MAX(created_at) as newest
FROM i18n_translation_queue
GROUP BY status;

-- =====================================================
-- Function to get entities needing translation
-- =====================================================
CREATE OR REPLACE FUNCTION get_entities_needing_translation(
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  entity_type i18n_entity_type,
  entity_id UUID,
  existing_locales TEXT[],
  missing_locales TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  WITH entity_locale_status AS (
    SELECT 
      t.entity_type,
      t.entity_id,
      array_agg(DISTINCT t.locale ORDER BY t.locale) as existing_locales
    FROM i18n_translations t
    GROUP BY t.entity_type, t.entity_id
  ),
  entities_with_missing AS (
    SELECT 
      els.entity_type,
      els.entity_id,
      els.existing_locales,
      ARRAY['en', 'ru', 'es']::TEXT[] - els.existing_locales as missing_locales
    FROM entity_locale_status els
    WHERE array_length(els.existing_locales, 1) < 3
  )
  SELECT 
    ewm.entity_type,
    ewm.entity_id,
    ewm.existing_locales,
    ewm.missing_locales
  FROM entities_with_missing ewm
  LEFT JOIN i18n_translation_queue q 
    ON q.entity_type = ewm.entity_type 
    AND q.entity_id = ewm.entity_id
  WHERE q.id IS NULL OR q.status IN ('failed')
  ORDER BY array_length(ewm.existing_locales, 1) DESC -- Prioritize entities with more existing translations
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Grant permissions
-- =====================================================
GRANT SELECT ON i18n_translation_queue TO authenticated;
GRANT SELECT ON v_translation_queue_status TO authenticated;
GRANT EXECUTE ON FUNCTION queue_entity_for_translation TO authenticated;
GRANT EXECUTE ON FUNCTION get_entities_needing_translation TO authenticated;