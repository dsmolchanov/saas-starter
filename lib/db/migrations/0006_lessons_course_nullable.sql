-- Make course_id nullable for lessons
ALTER TABLE public.lessons ALTER COLUMN course_id DROP NOT NULL; 