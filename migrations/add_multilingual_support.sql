-- Add language support to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(5) DEFAULT 'ru' 
CHECK (preferred_language IN ('ru', 'es', 'en'));

-- Create translations table for static content
CREATE TABLE IF NOT EXISTS translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL, -- 'content_item', 'asana', 'breathing_exercise', etc.
    entity_id UUID NOT NULL,
    language VARCHAR(5) NOT NULL,
    field_name VARCHAR(50) NOT NULL, -- 'title', 'description', 'instructions', etc.
    translated_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(entity_type, entity_id, language, field_name)
);

-- Add indexes for performance
CREATE INDEX idx_translations_entity ON translations(entity_type, entity_id);
CREATE INDEX idx_translations_language ON translations(language);

-- Add source language to content items (what language was it created in)
ALTER TABLE content_items 
ADD COLUMN IF NOT EXISTS source_language VARCHAR(5) DEFAULT 'ru' 
CHECK (source_language IN ('ru', 'es', 'en'));

-- Add language columns to classes
ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS source_language VARCHAR(5) DEFAULT 'ru' 
CHECK (source_language IN ('ru', 'es', 'en'));

-- Add language columns to courses  
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS source_language VARCHAR(5) DEFAULT 'ru' 
CHECK (source_language IN ('ru', 'es', 'en'));

-- Add language columns to meditation_sessions
ALTER TABLE meditation_sessions 
ADD COLUMN IF NOT EXISTS source_language VARCHAR(5) DEFAULT 'ru' 
CHECK (source_language IN ('ru', 'es', 'en'));

-- Helper function to get translated content
CREATE OR REPLACE FUNCTION get_translated_text(
    p_entity_type VARCHAR,
    p_entity_id UUID,
    p_field_name VARCHAR,
    p_language VARCHAR,
    p_default_text TEXT
) RETURNS TEXT AS $$
DECLARE
    v_translated_text TEXT;
BEGIN
    -- Try to get translation in requested language
    SELECT translated_text INTO v_translated_text
    FROM translations
    WHERE entity_type = p_entity_type
      AND entity_id = p_entity_id
      AND field_name = p_field_name
      AND language = p_language;
    
    -- Return translation if found, otherwise return default
    RETURN COALESCE(v_translated_text, p_default_text);
END;
$$ LANGUAGE plpgsql;

-- Create view for multilingual content items
CREATE OR REPLACE VIEW content_items_i18n AS
SELECT 
    ci.*,
    get_translated_text('content_item', ci.id, 'title', current_setting('app.language', true), ci.title) as title_i18n,
    get_translated_text('content_item', ci.id, 'description', current_setting('app.language', true), ci.description) as description_i18n
FROM content_items ci;

-- Add helper function to bulk translate
CREATE OR REPLACE FUNCTION add_translation(
    p_entity_type VARCHAR,
    p_entity_id UUID,
    p_language VARCHAR,
    p_field_name VARCHAR,
    p_text TEXT
) RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO translations (entity_type, entity_id, language, field_name, translated_text)
    VALUES (p_entity_type, p_entity_id, p_language, p_field_name, p_text)
    ON CONFLICT (entity_type, entity_id, language, field_name)
    DO UPDATE SET 
        translated_text = EXCLUDED.translated_text,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update translations timestamp
CREATE OR REPLACE FUNCTION update_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER translations_updated_at
    BEFORE UPDATE ON translations
    FOR EACH ROW
    EXECUTE FUNCTION update_translations_updated_at();

-- Add sample translations for testing
-- This can be removed after testing
/*
INSERT INTO translations (entity_type, entity_id, language, field_name, translated_text)
VALUES 
    ('ui', '00000000-0000-0000-0000-000000000000'::uuid, 'ru', 'welcome', 'Добро пожаловать'),
    ('ui', '00000000-0000-0000-0000-000000000000'::uuid, 'es', 'welcome', 'Bienvenido'),
    ('ui', '00000000-0000-0000-0000-000000000000'::uuid, 'en', 'welcome', 'Welcome');
*/