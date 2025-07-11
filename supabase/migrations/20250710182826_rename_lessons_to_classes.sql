-- Rename lessons table to classes and add teacher_id column

-- Rename the table
ALTER TABLE public.lessons RENAME TO classes;

-- Add teacher_id column
ALTER TABLE public.classes ADD COLUMN teacher_id uuid REFERENCES public.users(id);

-- Update existing records to have a teacher_id (using the provided user ID)
UPDATE public.classes 
SET teacher_id = 'a25fc6f8-6bf8-4922-bcdf-f69327de0a21'
WHERE teacher_id IS NULL;

-- Make teacher_id NOT NULL after populating it
ALTER TABLE public.classes ALTER COLUMN teacher_id SET NOT NULL;

-- Update foreign key references in other tables
ALTER TABLE public.lesson_focus_areas RENAME COLUMN lesson_id TO class_id;
ALTER TABLE public.progress RENAME COLUMN lesson_id TO class_id;

-- Update foreign key constraints
ALTER TABLE public.lesson_focus_areas DROP CONSTRAINT lesson_focus_areas_lesson_id_fkey;
ALTER TABLE public.lesson_focus_areas ADD CONSTRAINT lesson_focus_areas_class_id_fkey 
  FOREIGN KEY (class_id) REFERENCES public.classes(id);

ALTER TABLE public.progress DROP CONSTRAINT progress_lesson_id_fkey;
ALTER TABLE public.progress ADD CONSTRAINT progress_class_id_fkey 
  FOREIGN KEY (class_id) REFERENCES public.classes(id); 