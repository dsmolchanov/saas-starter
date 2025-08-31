-- RPC function to get localized courses
CREATE OR REPLACE FUNCTION get_courses_localized(
  p_locale VARCHAR DEFAULT 'en',
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  category_id UUID,
  teacher_id UUID,
  title TEXT,
  description TEXT,
  level VARCHAR,
  cover_url TEXT,
  is_published INTEGER,
  teacher_name TEXT,
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
      (SELECT translation FROM i18n_translations 
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
    u.name AS teacher_name,
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
  title TEXT,
  description TEXT,
  duration_min INTEGER,
  video_url TEXT,
  thumbnail_url TEXT,
  cover_url TEXT,
  difficulty VARCHAR,
  intensity VARCHAR,
  style VARCHAR,
  equipment TEXT,
  teacher_name TEXT
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
      (SELECT translation FROM i18n_translations 
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
    u.name AS teacher_name
  FROM classes cl
  LEFT JOIN users u ON cl.teacher_id = u.id
  LIMIT p_limit;
END;
$$;

-- RPC function to get single course with localized content
CREATE OR REPLACE FUNCTION get_course_by_id_localized(
  p_course_id UUID,
  p_locale VARCHAR DEFAULT 'en'
)
RETURNS TABLE (
  id UUID,
  category_id UUID,
  teacher_id UUID,
  title TEXT,
  description TEXT,
  level VARCHAR,
  cover_url TEXT,
  is_published INTEGER,
  teacher_name TEXT,
  teacher_bio TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.category_id,
    c.teacher_id,
    COALESCE(
      (SELECT translation FROM i18n_translations 
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
    u.name AS teacher_name,
    t.bio AS teacher_bio
  FROM courses c
  LEFT JOIN users u ON c.teacher_id = u.id
  LEFT JOIN teachers t ON t.id = u.id
  WHERE c.id = p_course_id
  LIMIT 1;
END;
$$;

-- RPC function to get single class with localized content
CREATE OR REPLACE FUNCTION get_class_by_id_localized(
  p_class_id UUID,
  p_locale VARCHAR DEFAULT 'en'
)
RETURNS TABLE (
  id UUID,
  course_id UUID,
  teacher_id UUID,
  title TEXT,
  description TEXT,
  duration_min INTEGER,
  video_url TEXT,
  thumbnail_url TEXT,
  cover_url TEXT,
  difficulty VARCHAR,
  intensity VARCHAR,
  style VARCHAR,
  equipment TEXT,
  teacher_name TEXT,
  course_title TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cl.id,
    cl.course_id,
    cl.teacher_id,
    COALESCE(
      (SELECT translation FROM i18n_translations 
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
    u.name AS teacher_name,
    COALESCE(
      (SELECT translation FROM i18n_translations 
       WHERE entity_type = 'course' 
       AND entity_id = cl.course_id 
       AND field_name = 'title' 
       AND locale = p_locale
       LIMIT 1),
      c.title
    ) AS course_title
  FROM classes cl
  LEFT JOIN users u ON cl.teacher_id = u.id
  LEFT JOIN courses c ON cl.course_id = c.id
  WHERE cl.id = p_class_id
  LIMIT 1;
END;
$$;

-- RPC to get teacher profile with localized bio
CREATE OR REPLACE FUNCTION get_teacher_profile_localized(
  p_teacher_id UUID,
  p_locale VARCHAR DEFAULT 'en'
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  avatar_url TEXT,
  bio TEXT,
  instagram_url VARCHAR,
  course_count BIGINT,
  class_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.name,
    u.avatar_url,
    COALESCE(
      (SELECT translation FROM i18n_translations 
       WHERE entity_type = 'teacher' 
       AND entity_id = t.id 
       AND field_name = 'bio' 
       AND locale = p_locale
       LIMIT 1),
      t.bio
    ) AS bio,
    t.instagram_url,
    (SELECT COUNT(*) FROM courses WHERE teacher_id = u.id) AS course_count,
    (SELECT COUNT(*) FROM classes WHERE teacher_id = u.id) AS class_count
  FROM users u
  LEFT JOIN teachers t ON t.id = u.id
  WHERE u.id = p_teacher_id
  LIMIT 1;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_courses_localized TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_classes_localized TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_course_by_id_localized TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_class_by_id_localized TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_teacher_profile_localized TO authenticated, anon;