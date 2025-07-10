-- Supabase Schema Migration
-- Creates all tables with UUID primary keys for Supabase compatibility

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS "categories" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "slug" varchar(50) NOT NULL UNIQUE,
  "title" varchar(100) NOT NULL,
  "icon" varchar(100)
);

-- Courses table
CREATE TABLE IF NOT EXISTS "courses" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "category_id" uuid NOT NULL REFERENCES "categories"("id"),
  "teacher_id" uuid NOT NULL REFERENCES "auth"."users"("id"),
  "title" varchar(150) NOT NULL,
  "description" text,
  "level" varchar(50),
  "cover_url" text,
  "image_url" text,
  "is_published" integer DEFAULT 0 NOT NULL
);

-- Focus areas table
CREATE TABLE IF NOT EXISTS "focus_areas" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" varchar(50) NOT NULL UNIQUE,
  "icon" varchar(50)
);

-- Lessons table
CREATE TABLE IF NOT EXISTS "lessons" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "course_id" uuid REFERENCES "courses"("id"),
  "title" varchar(150) NOT NULL,
  "description" text,
  "duration_min" integer DEFAULT 0 NOT NULL,
  "video_path" text,
  "thumbnail_url" text,
  "image_url" text,
  "difficulty" varchar(20),
  "intensity" varchar(20),
  "style" varchar(50),
  "equipment" text,
  "order_index" integer,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Junction table for lessons and focus areas
CREATE TABLE IF NOT EXISTS "lesson_focus_areas" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "lesson_id" uuid NOT NULL REFERENCES "lessons"("id"),
  "focus_area_id" uuid NOT NULL REFERENCES "focus_areas"("id")
);

-- Progress table
CREATE TABLE IF NOT EXISTS "progress" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" uuid NOT NULL REFERENCES "auth"."users"("id"),
  "lesson_id" uuid NOT NULL REFERENCES "lessons"("id"),
  "completed_at" timestamp DEFAULT now() NOT NULL
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" uuid NOT NULL REFERENCES "auth"."users"("id"),
  "stripe_customer_id" text UNIQUE,
  "status" varchar(20) NOT NULL,
  "current_period_end" timestamp
);

-- Teachers table
CREATE TABLE IF NOT EXISTS "teachers" (
  "id" uuid PRIMARY KEY REFERENCES "auth"."users"("id"),
  "bio" text,
  "instagram_url" varchar(255),
  "revenue_share" integer DEFAULT 0 NOT NULL
);

-- Playlists table
CREATE TABLE IF NOT EXISTS "playlists" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" uuid NOT NULL REFERENCES "auth"."users"("id"),
  "name" varchar(100) NOT NULL,
  "description" text,
  "is_public" integer DEFAULT 0 NOT NULL,
  "is_system" integer DEFAULT 0 NOT NULL,
  "playlist_type" varchar(20) DEFAULT 'custom' NOT NULL,
  "cover_url" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Playlist items table
CREATE TABLE IF NOT EXISTS "playlist_items" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "playlist_id" uuid NOT NULL REFERENCES "playlists"("id") ON DELETE CASCADE,
  "item_type" varchar(20) NOT NULL,
  "item_id" uuid NOT NULL,
  "order_index" integer DEFAULT 0 NOT NULL,
  "added_at" timestamp DEFAULT now() NOT NULL,
  "added_by" uuid REFERENCES "auth"."users"("id")
);

-- Add unique constraint for playlist items
ALTER TABLE "playlist_items" 
ADD CONSTRAINT "unique_playlist_item_supabase" 
UNIQUE("playlist_id", "item_type", "item_id");

-- Enable RLS on all tables
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "courses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "focus_areas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lessons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lesson_focus_areas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "progress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "teachers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "playlists" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "playlist_items" ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies

-- Categories and focus_areas are public readable
CREATE POLICY "Categories are viewable by everyone" ON "categories"
  FOR SELECT USING (true);

CREATE POLICY "Focus areas are viewable by everyone" ON "focus_areas"
  FOR SELECT USING (true);

-- Courses and lessons are viewable by everyone, manageable by teachers/admins
CREATE POLICY "Courses are viewable by everyone" ON "courses"
  FOR SELECT USING (is_published = 1 OR auth.uid() = teacher_id);

CREATE POLICY "Teachers can manage their courses" ON "courses"
  FOR ALL USING (auth.uid() = teacher_id);

CREATE POLICY "Lessons are viewable by everyone" ON "lessons"
  FOR SELECT USING (
    course_id IS NULL OR 
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = lessons.course_id 
      AND (courses.is_published = 1 OR courses.teacher_id = auth.uid())
    )
  );

-- Users can manage their own data
CREATE POLICY "Users can view their own progress" ON "progress"
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own subscriptions" ON "subscriptions"
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own playlists" ON "playlists"
  FOR ALL USING (auth.uid() = user_id OR is_public = 1);

CREATE POLICY "Users can manage their playlist items" ON "playlist_items"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM playlists 
      WHERE playlists.id = playlist_items.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

-- Teachers can view their profile
CREATE POLICY "Teachers can manage their profile" ON "teachers"
  FOR ALL USING (auth.uid() = id); 