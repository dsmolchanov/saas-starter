-- Teacher Applications Migration
-- Add teacher applications table for onboarding process

CREATE TABLE public.teacher_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Application data
  experience_level varchar(50) NOT NULL, -- beginner, intermediate, experienced, expert
  training_background text NOT NULL,
  offline_practice text,
  regular_students_count varchar(50), -- 0-10, 10-25, 25-50, 50+
  revenue_model varchar(50) NOT NULL, -- percentage, per_class, per_course
  
  -- Additional info
  motivation text,
  additional_info text,
  
  -- Application status
  status varchar(20) NOT NULL DEFAULT 'pending', -- pending, approved, rejected, under_review
  submitted_at timestamp NOT NULL DEFAULT now(),
  reviewed_at timestamp,
  reviewed_by uuid REFERENCES public.users(id),
  review_notes text,
  
  -- Timestamps
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  
  -- Constraints
  UNIQUE(user_id) -- One application per user
);

-- Add index for efficient queries
CREATE INDEX idx_teacher_applications_status ON public.teacher_applications(status);
CREATE INDEX idx_teacher_applications_user_id ON public.teacher_applications(user_id);
CREATE INDEX idx_teacher_applications_submitted_at ON public.teacher_applications(submitted_at);

-- Add teacher application status to users table
ALTER TABLE public.users ADD COLUMN teacher_application_status varchar(20) DEFAULT NULL;

-- Update existing teacher users to have approved status
UPDATE public.users 
SET teacher_application_status = 'approved' 
WHERE role = 'teacher' OR id IN (SELECT id FROM public.teachers); 