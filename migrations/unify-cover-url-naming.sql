-- Migration: Unify cover_url naming across all tables
-- This migration standardizes the naming convention to use 'cover_url' for all cover images

-- 1. For courses table: Check if image_url exists and migrate to cover_url
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'courses' AND column_name = 'image_url'
  ) THEN
    UPDATE courses 
    SET cover_url = COALESCE(cover_url, image_url)
    WHERE image_url IS NOT NULL;
    
    ALTER TABLE courses DROP COLUMN image_url;
  END IF;
END $$;

-- 2. For classes table: Check and migrate image_url to cover_url
DO $$ 
BEGIN
  -- Check if cover_url column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'classes' AND column_name = 'cover_url'
  ) THEN
    ALTER TABLE classes ADD COLUMN cover_url TEXT;
  END IF;
  
  -- If image_url exists, migrate data
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'classes' AND column_name = 'image_url'
  ) THEN
    UPDATE classes 
    SET cover_url = COALESCE(cover_url, image_url)
    WHERE image_url IS NOT NULL;
    
    ALTER TABLE classes DROP COLUMN image_url;
  END IF;
END $$;

-- 3. Update teacher content tables - rename cover_image_url to cover_url
-- Challenges table
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'challenges' 
    AND column_name = 'cover_image_url'
  ) THEN
    ALTER TABLE challenges RENAME COLUMN cover_image_url TO cover_url;
  END IF;
END $$;

-- Workshops table
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workshops' 
    AND column_name = 'cover_image_url'
  ) THEN
    ALTER TABLE workshops RENAME COLUMN cover_image_url TO cover_url;
  END IF;
END $$;

-- Programs table
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'programs' 
    AND column_name = 'cover_image_url'
  ) THEN
    ALTER TABLE programs RENAME COLUMN cover_image_url TO cover_url;
  END IF;
END $$;

-- Student Groups table
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'student_groups' 
    AND column_name = 'cover_image_url'
  ) THEN
    ALTER TABLE student_groups RENAME COLUMN cover_image_url TO cover_url;
  END IF;
END $$;

-- Articles table - rename featured_image_url to cover_url
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'articles' 
    AND column_name = 'featured_image_url'
  ) THEN
    ALTER TABLE articles RENAME COLUMN featured_image_url TO cover_url;
  END IF;
END $$;

-- 4. Update content tables with image-related fields
-- Asanas table - rename image_urls array to cover_urls
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'asanas' 
    AND column_name = 'image_urls'
  ) THEN
    ALTER TABLE asanas RENAME COLUMN image_urls TO cover_urls;
  END IF;
  
  -- Also rename anatomy_image_url to anatomy_url for consistency
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'asanas' 
    AND column_name = 'anatomy_image_url'
  ) THEN
    ALTER TABLE asanas RENAME COLUMN anatomy_image_url TO anatomy_url;
  END IF;
END $$;

-- Add comments to document the standardization
COMMENT ON COLUMN courses.cover_url IS 'Standardized cover image URL for the course';
COMMENT ON COLUMN classes.cover_url IS 'Standardized cover image URL for the class';