-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  user_id uuid,
  action text NOT NULL,
  timestamp timestamp without time zone NOT NULL DEFAULT now(),
  ip_address character varying,
  CONSTRAINT activity_logs_pkey PRIMARY KEY (id),
  CONSTRAINT activity_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT activity_logs_team_id_teams_id_fk FOREIGN KEY (team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.articles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  title character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  subtitle character varying,
  content text NOT NULL,
  excerpt text,
  featured_image_url text,
  category character varying,
  tags ARRAY,
  reading_time_min integer,
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT false,
  published_at timestamp without time zone,
  view_count integer DEFAULT 0,
  meta_description text,
  meta_keywords text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT articles_pkey PRIMARY KEY (id),
  CONSTRAINT articles_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id)
);
CREATE TABLE public.asanas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  content_item_id uuid,
  sanskrit_name character varying NOT NULL,
  english_name character varying NOT NULL,
  category character varying,
  pose_type character varying,
  benefits ARRAY,
  contraindications ARRAY,
  alignment_cues ARRAY,
  common_mistakes ARRAY,
  preparatory_poses ARRAY,
  follow_up_poses ARRAY,
  variations jsonb,
  hold_duration_seconds integer,
  breath_pattern character varying,
  drishti character varying,
  image_urls ARRAY,
  video_url text,
  anatomy_image_url text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT asanas_pkey PRIMARY KEY (id),
  CONSTRAINT asanas_content_item_id_fkey FOREIGN KEY (content_item_id) REFERENCES public.content_items(id)
);
CREATE TABLE public.breathing_exercises (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  sanskrit_name character varying,
  duration_pattern character varying,
  description text,
  difficulty character varying CHECK (difficulty::text = ANY (ARRAY['beginner'::character varying, 'intermediate'::character varying, 'advanced'::character varying]::text[])),
  benefits text,
  instructions text,
  contraindications text,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT breathing_exercises_pkey PRIMARY KEY (id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug character varying NOT NULL UNIQUE,
  title character varying NOT NULL,
  icon character varying,
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.chakras (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  sanskrit_name character varying NOT NULL,
  number integer NOT NULL CHECK (number >= 1 AND number <= 7),
  color character varying NOT NULL,
  element character varying,
  location text,
  description text,
  healing_practices text,
  associated_poses ARRAY,
  mantra character varying,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT chakras_pkey PRIMARY KEY (id)
);
CREATE TABLE public.challenge_days (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL,
  day_number integer NOT NULL,
  title character varying,
  description text,
  class_id uuid,
  meditation_id uuid,
  breathing_exercise_id uuid,
  video_url text,
  duration_min integer,
  focus_area character varying,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT challenge_days_pkey PRIMARY KEY (id),
  CONSTRAINT challenge_days_meditation_id_fkey FOREIGN KEY (meditation_id) REFERENCES public.meditation_sessions(id),
  CONSTRAINT challenge_days_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(id),
  CONSTRAINT challenge_days_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id)
);
CREATE TABLE public.challenge_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL,
  user_id uuid NOT NULL,
  joined_at timestamp without time zone DEFAULT now(),
  completed_at timestamp without time zone,
  current_day integer DEFAULT 1,
  total_days_completed integer DEFAULT 0,
  is_active boolean DEFAULT true,
  CONSTRAINT challenge_participants_pkey PRIMARY KEY (id),
  CONSTRAINT challenge_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT challenge_participants_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(id)
);
CREATE TABLE public.challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  title character varying NOT NULL,
  description text,
  duration_days integer NOT NULL DEFAULT 30,
  difficulty_level character varying CHECK (difficulty_level::text = ANY (ARRAY['beginner'::character varying, 'intermediate'::character varying, 'advanced'::character varying, 'all'::character varying]::text[])),
  cover_image_url text,
  thumbnail_url text,
  challenge_type character varying DEFAULT 'general'::character varying,
  daily_commitment_min integer DEFAULT 20,
  total_participants integer DEFAULT 0,
  is_published boolean DEFAULT false,
  start_date date,
  end_date date,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT challenges_pkey PRIMARY KEY (id),
  CONSTRAINT challenges_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id)
);
CREATE TABLE public.class_equipment (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL,
  equipment_name character varying NOT NULL,
  is_required boolean DEFAULT false,
  quantity integer DEFAULT 1,
  alternatives text,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT class_equipment_pkey PRIMARY KEY (id),
  CONSTRAINT class_equipment_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id)
);
CREATE TABLE public.class_tags (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL,
  tag_name character varying NOT NULL,
  tag_category character varying,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT class_tags_pkey PRIMARY KEY (id),
  CONSTRAINT class_tags_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id)
);
CREATE TABLE public.classes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid,
  title character varying NOT NULL,
  description text,
  duration_min integer NOT NULL DEFAULT 0,
  video_path text,
  thumbnail_url text,
  image_url text,
  difficulty character varying,
  intensity character varying,
  style character varying,
  equipment text,
  order_index integer,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  teacher_id uuid NOT NULL,
  video_url text,
  video_type character varying DEFAULT 'upload'::character varying,
  mux_asset_id text,
  mux_playback_id text,
  mux_upload_id text,
  mux_status character varying,
  CONSTRAINT classes_pkey PRIMARY KEY (id),
  CONSTRAINT classes_teacher_id_users_id_fk FOREIGN KEY (teacher_id) REFERENCES public.users(id),
  CONSTRAINT classes_course_id_courses_id_fk FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.content_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  content_item_id uuid,
  total_views integer DEFAULT 0,
  unique_viewers integer DEFAULT 0,
  total_completions integer DEFAULT 0,
  avg_completion_rate numeric,
  avg_rating numeric,
  total_favorites integer DEFAULT 0,
  total_shares integer DEFAULT 0,
  total_comments integer DEFAULT 0,
  peak_hour integer,
  peak_day_of_week integer,
  last_calculated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT content_analytics_pkey PRIMARY KEY (id),
  CONSTRAINT content_analytics_content_item_id_fkey FOREIGN KEY (content_item_id) REFERENCES public.content_items(id)
);
CREATE TABLE public.content_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  content_type USER-DEFINED NOT NULL,
  title character varying NOT NULL,
  description text,
  slug character varying UNIQUE,
  thumbnail_url text,
  cover_url text,
  preview_url text,
  status USER-DEFINED DEFAULT 'draft'::content_status,
  visibility USER-DEFINED DEFAULT 'public'::content_visibility,
  published_at timestamp without time zone,
  scheduled_for timestamp without time zone,
  tags ARRAY,
  categories ARRAY,
  difficulty character varying,
  duration_min integer,
  metadata jsonb DEFAULT '{}'::jsonb,
  seo_title character varying,
  seo_description text,
  seo_keywords ARRAY,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT content_items_pkey PRIMARY KEY (id),
  CONSTRAINT content_items_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id)
);
CREATE TABLE public.content_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  content_item_id uuid,
  started_at timestamp without time zone DEFAULT now(),
  last_accessed_at timestamp without time zone DEFAULT now(),
  completed_at timestamp without time zone,
  progress_percentage numeric DEFAULT 0,
  last_position integer,
  user_notes text,
  user_rating integer CHECK (user_rating >= 1 AND user_rating <= 5),
  favorited boolean DEFAULT false,
  CONSTRAINT content_progress_pkey PRIMARY KEY (id),
  CONSTRAINT content_progress_content_item_id_fkey FOREIGN KEY (content_item_id) REFERENCES public.content_items(id),
  CONSTRAINT content_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL,
  teacher_id uuid NOT NULL,
  title character varying NOT NULL,
  description text,
  level character varying,
  cover_url text,
  image_url text,
  is_published integer NOT NULL DEFAULT 0,
  CONSTRAINT courses_pkey PRIMARY KEY (id),
  CONSTRAINT courses_teacher_id_users_id_fk FOREIGN KEY (teacher_id) REFERENCES public.users(id),
  CONSTRAINT courses_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.daily_teacher_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  date date NOT NULL,
  unique_users integer NOT NULL DEFAULT 0,
  minutes_watched integer NOT NULL DEFAULT 0,
  lessons_completed integer NOT NULL DEFAULT 0,
  CONSTRAINT daily_teacher_metrics_pkey PRIMARY KEY (id),
  CONSTRAINT daily_teacher_metrics_teacher_id_users_id_fk FOREIGN KEY (teacher_id) REFERENCES public.users(id)
);
CREATE TABLE public.daily_user_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL,
  minutes_spent integer NOT NULL DEFAULT 0,
  lessons_completed integer NOT NULL DEFAULT 0,
  streak_days integer NOT NULL DEFAULT 0,
  CONSTRAINT daily_user_metrics_pkey PRIMARY KEY (id),
  CONSTRAINT daily_user_metrics_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.favorites (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_type character varying NOT NULL,
  item_id uuid NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT favorites_pkey PRIMARY KEY (id),
  CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.focus_areas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  icon character varying,
  CONSTRAINT focus_areas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.group_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role character varying DEFAULT 'member'::character varying,
  joined_at timestamp without time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  CONSTRAINT group_members_pkey PRIMARY KEY (id),
  CONSTRAINT group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.student_groups(id),
  CONSTRAINT group_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  email character varying NOT NULL,
  role character varying NOT NULL,
  invited_by uuid NOT NULL,
  invited_at timestamp without time zone NOT NULL DEFAULT now(),
  status character varying NOT NULL DEFAULT 'pending'::character varying,
  CONSTRAINT invitations_pkey PRIMARY KEY (id),
  CONSTRAINT invitations_invited_by_users_id_fk FOREIGN KEY (invited_by) REFERENCES public.users(id),
  CONSTRAINT invitations_team_id_teams_id_fk FOREIGN KEY (team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.lesson_focus_areas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL,
  focus_area_id uuid NOT NULL,
  CONSTRAINT lesson_focus_areas_pkey PRIMARY KEY (id),
  CONSTRAINT lesson_focus_areas_focus_area_id_focus_areas_id_fk FOREIGN KEY (focus_area_id) REFERENCES public.focus_areas(id),
  CONSTRAINT lesson_focus_areas_class_id_classes_id_fk FOREIGN KEY (class_id) REFERENCES public.classes(id)
);
CREATE TABLE public.live_class_registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  live_class_id uuid NOT NULL,
  user_id uuid NOT NULL,
  registered_at timestamp without time zone DEFAULT now(),
  attended boolean DEFAULT false,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  feedback text,
  CONSTRAINT live_class_registrations_pkey PRIMARY KEY (id),
  CONSTRAINT live_class_registrations_live_class_id_fkey FOREIGN KEY (live_class_id) REFERENCES public.live_classes(id),
  CONSTRAINT live_class_registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.live_classes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  title character varying NOT NULL,
  description text,
  scheduled_for timestamp without time zone NOT NULL,
  duration_min integer NOT NULL DEFAULT 60,
  max_participants integer,
  current_participants integer DEFAULT 0,
  meeting_url text,
  recording_url text,
  style character varying,
  level character varying CHECK (level::text = ANY (ARRAY['beginner'::character varying, 'intermediate'::character varying, 'advanced'::character varying, 'all'::character varying]::text[])),
  thumbnail_url text,
  price numeric DEFAULT 0,
  is_free boolean DEFAULT true,
  status character varying DEFAULT 'scheduled'::character varying,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT live_classes_pkey PRIMARY KEY (id),
  CONSTRAINT live_classes_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id)
);
CREATE TABLE public.meditation_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  description text,
  duration_min integer NOT NULL,
  type character varying,
  teacher_id uuid,
  audio_url text,
  thumbnail_url text,
  focus character varying,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT meditation_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT meditation_sessions_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id)
);
CREATE TABLE public.meditations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  content_item_id uuid,
  teacher_id uuid,
  meditation_type character varying,
  focus character varying,
  audio_url text NOT NULL,
  background_music_url text,
  transcript text,
  voice_gender character varying,
  language character varying DEFAULT 'en'::character varying,
  duration_min integer NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT meditations_pkey PRIMARY KEY (id),
  CONSTRAINT meditations_content_item_id_fkey FOREIGN KEY (content_item_id) REFERENCES public.content_items(id),
  CONSTRAINT meditations_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id)
);
CREATE TABLE public.philosophy_content (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  teacher_id uuid,
  content_type character varying,
  source character varying,
  chapter character varying,
  verse character varying,
  sanskrit_text text,
  transliteration text,
  translation text,
  commentary text,
  modern_application text,
  audio_url text,
  is_published boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT philosophy_content_pkey PRIMARY KEY (id),
  CONSTRAINT philosophy_content_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id)
);
CREATE TABLE public.playlist_activity (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  playlist_id uuid NOT NULL,
  user_id uuid,
  activity_type character varying NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT playlist_activity_pkey PRIMARY KEY (id),
  CONSTRAINT playlist_activity_playlist_id_fkey FOREIGN KEY (playlist_id) REFERENCES public.playlists(id),
  CONSTRAINT playlist_activity_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.playlist_collaborators (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  playlist_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role character varying DEFAULT 'viewer'::character varying CHECK (role::text = ANY (ARRAY['viewer'::character varying, 'contributor'::character varying, 'admin'::character varying]::text[])),
  invited_by uuid,
  invited_at timestamp without time zone DEFAULT now(),
  accepted_at timestamp without time zone,
  CONSTRAINT playlist_collaborators_pkey PRIMARY KEY (id),
  CONSTRAINT playlist_collaborators_playlist_id_fkey FOREIGN KEY (playlist_id) REFERENCES public.playlists(id),
  CONSTRAINT playlist_collaborators_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES public.users(id),
  CONSTRAINT playlist_collaborators_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.playlist_followers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  playlist_id uuid NOT NULL,
  user_id uuid NOT NULL,
  followed_at timestamp without time zone DEFAULT now(),
  CONSTRAINT playlist_followers_pkey PRIMARY KEY (id),
  CONSTRAINT playlist_followers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT playlist_followers_playlist_id_fkey FOREIGN KEY (playlist_id) REFERENCES public.playlists(id)
);
CREATE TABLE public.playlist_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  playlist_id uuid NOT NULL,
  item_type character varying NOT NULL,
  item_id uuid NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  added_at timestamp without time zone NOT NULL DEFAULT now(),
  added_by uuid,
  CONSTRAINT playlist_items_pkey PRIMARY KEY (id),
  CONSTRAINT playlist_items_added_by_users_id_fk FOREIGN KEY (added_by) REFERENCES public.users(id),
  CONSTRAINT playlist_items_playlist_id_playlists_id_fk FOREIGN KEY (playlist_id) REFERENCES public.playlists(id)
);
CREATE TABLE public.playlists (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name character varying NOT NULL,
  description text,
  is_public integer NOT NULL DEFAULT 0,
  is_system integer NOT NULL DEFAULT 0,
  playlist_type character varying NOT NULL DEFAULT 'custom'::character varying,
  cover_url text,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  teacher_id uuid,
  visibility character varying DEFAULT 'private'::character varying CHECK (visibility::text = ANY (ARRAY['private'::character varying, 'public'::character varying, 'unlisted'::character varying]::text[])),
  total_items integer DEFAULT 0,
  total_duration_min integer DEFAULT 0,
  tags ARRAY,
  featured boolean DEFAULT false,
  view_count integer DEFAULT 0,
  CONSTRAINT playlists_pkey PRIMARY KEY (id),
  CONSTRAINT playlists_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT playlists_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id)
);
CREATE TABLE public.pose_library (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  teacher_id uuid,
  english_name character varying NOT NULL,
  sanskrit_name character varying,
  translation character varying,
  description text,
  benefits text,
  contraindications text,
  instructions text,
  modifications text,
  variations text,
  pose_category character varying,
  difficulty_level character varying CHECK (difficulty_level::text = ANY (ARRAY['beginner'::character varying, 'intermediate'::character varying, 'advanced'::character varying]::text[])),
  primary_muscle_groups ARRAY,
  secondary_muscle_groups ARRAY,
  chakras ARRAY,
  doshas ARRAY,
  image_url text,
  video_url text,
  thumbnail_url text,
  prep_poses ARRAY,
  follow_up_poses ARRAY,
  hold_time_seconds integer,
  is_published boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT pose_library_pkey PRIMARY KEY (id),
  CONSTRAINT pose_library_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id)
);
CREATE TABLE public.practice_reminders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reminder_time time without time zone NOT NULL,
  days_of_week ARRAY,
  enabled boolean DEFAULT true,
  notification_type character varying DEFAULT 'push'::character varying,
  message text,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT practice_reminders_pkey PRIMARY KEY (id),
  CONSTRAINT practice_reminders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.practice_streaks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  start_date date NOT NULL,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_practice_date date,
  total_practice_days integer NOT NULL DEFAULT 0,
  streak_frozen_until date,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT practice_streaks_pkey PRIMARY KEY (id),
  CONSTRAINT practice_streaks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.program_modules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  program_id uuid,
  week_number integer NOT NULL,
  module_title character varying,
  module_description text,
  content_items ARRAY,
  has_assessment boolean DEFAULT false,
  assessment_data jsonb,
  sort_order integer,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT program_modules_pkey PRIMARY KEY (id),
  CONSTRAINT program_modules_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id)
);
CREATE TABLE public.program_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL,
  session_number integer NOT NULL,
  week_number integer,
  title character varying,
  description text,
  class_id uuid,
  meditation_id uuid,
  breathing_exercise_id uuid,
  article_id uuid,
  duration_min integer,
  session_type character varying,
  homework text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT program_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT program_sessions_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id),
  CONSTRAINT program_sessions_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id),
  CONSTRAINT program_sessions_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id),
  CONSTRAINT program_sessions_meditation_id_fkey FOREIGN KEY (meditation_id) REFERENCES public.meditation_sessions(id),
  CONSTRAINT program_sessions_breathing_exercise_id_fkey FOREIGN KEY (breathing_exercise_id) REFERENCES public.breathing_exercises(id)
);
CREATE TABLE public.programs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  title character varying NOT NULL,
  description text,
  program_type character varying,
  focus_area character varying,
  total_sessions integer NOT NULL,
  weeks_duration integer,
  difficulty_level character varying CHECK (difficulty_level::text = ANY (ARRAY['beginner'::character varying, 'intermediate'::character varying, 'advanced'::character varying, 'progressive'::character varying]::text[])),
  cover_image_url text,
  thumbnail_url text,
  price numeric DEFAULT 0,
  is_free boolean DEFAULT true,
  prerequisites text,
  outcomes text,
  is_published boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT programs_pkey PRIMARY KEY (id),
  CONSTRAINT programs_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id)
);
CREATE TABLE public.progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  class_id uuid NOT NULL,
  completed_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT progress_pkey PRIMARY KEY (id),
  CONSTRAINT progress_class_id_classes_id_fk FOREIGN KEY (class_id) REFERENCES public.classes(id),
  CONSTRAINT progress_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.quick_flows (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  title character varying NOT NULL,
  description text,
  duration_min integer NOT NULL CHECK (duration_min >= 5 AND duration_min <= 15),
  flow_type character varying,
  target_area character varying,
  difficulty_level character varying CHECK (difficulty_level::text = ANY (ARRAY['beginner'::character varying, 'intermediate'::character varying, 'advanced'::character varying]::text[])),
  video_url text,
  thumbnail_url text,
  equipment_needed ARRAY,
  is_published boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT quick_flows_pkey PRIMARY KEY (id),
  CONSTRAINT quick_flows_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id)
);
CREATE TABLE public.student_groups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  name character varying NOT NULL,
  description text,
  group_type character varying,
  max_members integer,
  current_members integer DEFAULT 0,
  cover_image_url text,
  is_private boolean DEFAULT true,
  enrollment_key character varying,
  start_date date,
  end_date date,
  is_active boolean DEFAULT true,
  welcome_message text,
  guidelines text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT student_groups_pkey PRIMARY KEY (id),
  CONSTRAINT student_groups_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id)
);
CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  stripe_customer_id text UNIQUE,
  status character varying NOT NULL,
  current_period_end timestamp without time zone,
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.teacher_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  experience_level character varying NOT NULL,
  training_background text NOT NULL,
  offline_practice text,
  regular_students_count character varying,
  revenue_model character varying NOT NULL,
  motivation text,
  additional_info text,
  status character varying NOT NULL DEFAULT 'pending'::character varying,
  submitted_at timestamp without time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp without time zone,
  reviewed_by uuid,
  review_notes text,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT teacher_applications_pkey PRIMARY KEY (id),
  CONSTRAINT teacher_applications_reviewed_by_users_id_fk FOREIGN KEY (reviewed_by) REFERENCES public.users(id),
  CONSTRAINT teacher_applications_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.teacher_specializations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  specialization character varying NOT NULL,
  certification text,
  years_experience integer,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT teacher_specializations_pkey PRIMARY KEY (id),
  CONSTRAINT teacher_specializations_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id)
);
CREATE TABLE public.teachers (
  id uuid NOT NULL,
  bio text,
  instagram_url character varying,
  revenue_share integer NOT NULL DEFAULT 0,
  CONSTRAINT teachers_pkey PRIMARY KEY (id),
  CONSTRAINT teachers_id_users_id_fk FOREIGN KEY (id) REFERENCES public.users(id)
);
CREATE TABLE public.team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  team_id uuid NOT NULL,
  role character varying NOT NULL,
  joined_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT team_members_pkey PRIMARY KEY (id),
  CONSTRAINT team_members_team_id_teams_id_fk FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT team_members_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.teams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  stripe_product_id text,
  plan_name character varying,
  subscription_status character varying,
  CONSTRAINT teams_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_goals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  goal_type character varying NOT NULL,
  description text,
  target_date date,
  target_value integer,
  current_value integer DEFAULT 0,
  status character varying DEFAULT 'active'::character varying,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  completed_at timestamp without time zone,
  CONSTRAINT user_goals_pkey PRIMARY KEY (id),
  CONSTRAINT user_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  preferred_time character varying,
  preferred_duration integer,
  preferred_style character varying,
  preferred_intensity character varying,
  experience_level character varying,
  goals ARRAY,
  injuries_limitations text,
  notification_enabled boolean DEFAULT true,
  notification_time time without time zone,
  theme character varying DEFAULT 'light'::character varying,
  language character varying DEFAULT 'en'::character varying,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying,
  email character varying UNIQUE,
  avatar_url text,
  password_hash text,
  role character varying NOT NULL DEFAULT 'student'::character varying,
  teacher_application_status character varying,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.workshops (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  title character varying NOT NULL,
  description text,
  detailed_outline text,
  duration_hours numeric NOT NULL DEFAULT 2.0,
  scheduled_date date,
  scheduled_time time without time zone,
  max_participants integer,
  current_participants integer DEFAULT 0,
  workshop_type character varying,
  level character varying CHECK (level::text = ANY (ARRAY['beginner'::character varying, 'intermediate'::character varying, 'advanced'::character varying, 'all'::character varying]::text[])),
  price numeric DEFAULT 0,
  is_online boolean DEFAULT true,
  location text,
  meeting_url text,
  recording_url text,
  materials_url text,
  cover_image_url text,
  prerequisites text,
  what_to_bring text,
  is_published boolean DEFAULT false,
  status character varying DEFAULT 'draft'::character varying,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT workshops_pkey PRIMARY KEY (id),
  CONSTRAINT workshops_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id)
);
CREATE TABLE public.yoga_quotes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  text text NOT NULL,
  author character varying,
  category character varying,
  language character varying DEFAULT 'en'::character varying,
  source character varying,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT yoga_quotes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.yoga_styles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  description text,
  intensity_level character varying,
  benefits text,
  typical_duration integer,
  suitable_for ARRAY,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT yoga_styles_pkey PRIMARY KEY (id)
);