-- Fix type mismatches in RPC functions

-- Drop existing functions
DROP FUNCTION IF EXISTS get_courses_localized;
DROP FUNCTION IF EXISTS get_classes_localized;
DROP FUNCTION IF EXISTS get_course_by_id_localized;
DROP FUNCTION IF EXISTS get_class_by_id_localized;
DROP FUNCTION IF EXISTS get_teacher_profile_localized;

-- Recreate with correct types
CREATE OR REPLACE FUNCTION get_courses_localized(
  p_locale VARCHAR DEFAULT 'en',
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  category_id UUID,
  teacher_id UUID,
  title VARCHAR(150),
  description TEXT,
  level VARCHAR(50),
  cover_url TEXT,
  is_published INTEGER,
  teacher_name VARCHAR(100),
  lesson_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    c.id,
    c.category_id,
    c.teacher_id,
    COALESCE(
      (SELECT translation::VARCHAR(150) FROM i18n_translations 
       WHERE entity_type = 'course' 
       AND entity_id = c.id 
       AND field_name = 'title' 
       AND locale = p_locale
       LIMIT 1),
      c.title
    ) AS title,
    COALESCE(
      (SELECT translation FROM i18n_translations 
       WHERE entity_type = 'course' 
       AND entity_id = c.id 
       AND field_name = 'description' 
       AND locale = p_locale
       LIMIT 1),
      c.description
    ) AS description,
    c.level,
    c.cover_url,
    c.is_published,
    u.name,
    (SELECT COUNT(*) FROM classes WHERE course_id = c.id) AS lesson_count
  FROM courses c
  LEFT JOIN users u ON c.teacher_id = u.id
  WHERE c.is_published = 1
  LIMIT p_limit;
END;
$$;

-- RPC function to get localized classes
CREATE OR REPLACE FUNCTION get_classes_localized(
  p_locale VARCHAR DEFAULT 'en',
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  course_id UUID,
  teacher_id UUID,
  title VARCHAR(150),
  description TEXT,
  duration_min INTEGER,
  video_url TEXT,
  thumbnail_url TEXT,
  cover_url TEXT,
  difficulty VARCHAR(20),
  intensity VARCHAR(20),
  style VARCHAR(50),
  equipment TEXT,
  teacher_name VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    cl.id,
    cl.course_id,
    cl.teacher_id,
    COALESCE(
      (SELECT translation::VARCHAR(150) FROM i18n_translations 
       WHERE entity_type = 'class' 
       AND entity_id = cl.id 
       AND field_name = 'title' 
       AND locale = p_locale
       LIMIT 1),
      cl.title
    ) AS title,
    COALESCE(
      (SELECT translation FROM i18n_translations 
       WHERE entity_type = 'class' 
       AND entity_id = cl.id 
       AND field_name = 'description' 
       AND locale = p_locale
       LIMIT 1),
      cl.description
    ) AS description,
    cl.duration_min,
    cl.video_url,
    cl.thumbnail_url,
    cl.cover_url,
    cl.difficulty,
    cl.intensity,
    cl.style,
    cl.equipment,
    u.name
  FROM classes cl
  LEFT JOIN users u ON cl.teacher_id = u.id
  LIMIT p_limit;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_courses_localized TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_classes_localized TO authenticated, anon;