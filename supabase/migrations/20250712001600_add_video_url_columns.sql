-- Add video URL support to existing classes table
-- Only adds the missing columns without recreating tables

-- Add video URL and type columns if they don't already exist
ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS video_type varchar(20) DEFAULT 'upload';

-- Update existing records to have proper video_type
UPDATE public.classes 
SET video_type = 'upload' 
WHERE video_path IS NOT NULL AND (video_type IS NULL OR video_type = '');

-- Add helpful comments
COMMENT ON COLUMN public.classes.video_path IS 'Path to uploaded video file (legacy support)';
COMMENT ON COLUMN public.classes.video_url IS 'External video URL (YouTube, Vimeo, etc.)';
COMMENT ON COLUMN public.classes.video_type IS 'Type of video: upload, youtube, vimeo, external'; 