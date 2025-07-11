-- Migration to align all tables with Drizzle schema (UUID PKs)
-- This drops and recreates all tables to ensure clean UUID structure

-- Drop all existing tables in dependency order
DROP TABLE IF EXISTS public.daily_teacher_metrics CASCADE;
DROP TABLE IF EXISTS public.daily_user_metrics CASCADE;
DROP TABLE IF EXISTS public.playlist_items CASCADE;
DROP TABLE IF EXISTS public.playlists CASCADE;
DROP TABLE IF EXISTS public.teachers CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.progress CASCADE;
DROP TABLE IF EXISTS public.lesson_focus_areas CASCADE;
DROP TABLE IF EXISTS public.focus_areas CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.invitations CASCADE;
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Recreate all tables with UUID PKs to match Drizzle schema

-- Users table (corresponds to auth.users)
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100),
  email varchar(255) UNIQUE,
  avatar_url text,
  password_hash text,
  role varchar(20) NOT NULL DEFAULT 'student'
);

-- Teams table
CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  stripe_product_id text,
  plan_name varchar(50),
  subscription_status varchar(20)
);

-- Team members table
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  team_id uuid NOT NULL REFERENCES public.teams(id),
  role varchar(50) NOT NULL,
  joined_at timestamp NOT NULL DEFAULT now()
);

-- Activity logs table
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id),
  user_id uuid REFERENCES public.users(id),
  action text NOT NULL,
  timestamp timestamp NOT NULL DEFAULT now(),
  ip_address varchar(45)
);

-- Invitations table
CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id),
  email varchar(255) NOT NULL,
  role varchar(50) NOT NULL,
  invited_by uuid NOT NULL REFERENCES public.users(id),
  invited_at timestamp NOT NULL DEFAULT now(),
  status varchar(20) NOT NULL DEFAULT 'pending'
);

-- Categories table
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug varchar(50) NOT NULL UNIQUE,
  title varchar(100) NOT NULL,
  icon varchar(100)
);

-- Courses table
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.categories(id) NOT NULL,
  teacher_id uuid REFERENCES public.users(id) NOT NULL,
  title varchar(150) NOT NULL,
  description text,
  level varchar(50),
  cover_url text,
  image_url text,
  is_published integer NOT NULL DEFAULT 0
);

-- Lessons table
CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id),
  title varchar(150) NOT NULL,
  description text,
  duration_min integer NOT NULL DEFAULT 0,
  video_path text,
  thumbnail_url text,
  image_url text,
  difficulty varchar(20),
  intensity varchar(20),
  style varchar(50),
  equipment text,
  order_index integer,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

-- Focus areas table
CREATE TABLE public.focus_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(50) NOT NULL UNIQUE,
  icon varchar(50)
);

-- Lesson focus areas junction table
CREATE TABLE public.lesson_focus_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES public.lessons(id) NOT NULL,
  focus_area_id uuid REFERENCES public.focus_areas(id) NOT NULL
);

-- Progress table
CREATE TABLE public.progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) NOT NULL,
  lesson_id uuid REFERENCES public.lessons(id) NOT NULL,
  completed_at timestamp NOT NULL DEFAULT now()
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) NOT NULL,
  stripe_customer_id text UNIQUE,
  status varchar(20) NOT NULL,
  current_period_end timestamp
);

-- Teachers table (id = users.id)
CREATE TABLE public.teachers (
  id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  bio text,
  instagram_url varchar(255),
  revenue_share integer NOT NULL DEFAULT 0
);

-- Playlists table
CREATE TABLE public.playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) NOT NULL,
  name varchar(100) NOT NULL,
  description text,
  is_public integer NOT NULL DEFAULT 0,
  is_system integer NOT NULL DEFAULT 0,
  playlist_type varchar(20) NOT NULL DEFAULT 'custom',
  cover_url text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

-- Playlist items table
CREATE TABLE public.playlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  item_type varchar(20) NOT NULL,
  item_id uuid NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  added_at timestamp NOT NULL DEFAULT now(),
  added_by uuid REFERENCES public.users(id),
  CONSTRAINT unique_playlist_item_supabase UNIQUE (playlist_id, item_type, item_id)
);

-- Daily user metrics table
CREATE TABLE public.daily_user_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) NOT NULL,
  date date NOT NULL,
  minutes_spent integer NOT NULL DEFAULT 0,
  lessons_completed integer NOT NULL DEFAULT 0,
  streak_days integer NOT NULL DEFAULT 0
);

-- Daily teacher metrics table
CREATE TABLE public.daily_teacher_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES public.users(id) NOT NULL,
  date date NOT NULL,
  unique_users integer NOT NULL DEFAULT 0,
  minutes_watched integer NOT NULL DEFAULT 0,
  lessons_completed integer NOT NULL DEFAULT 0
); 