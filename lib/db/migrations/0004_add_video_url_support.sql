-- Add video URL support to classes table
ALTER TABLE classes ADD COLUMN video_url text;
ALTER TABLE classes ADD COLUMN video_type varchar(20) DEFAULT 'upload';

-- Update existing records to have video_type 'upload' where videoPath exists
UPDATE classes SET video_type = 'upload' WHERE video_path IS NOT NULL;

-- Add comment for clarity
COMMENT ON COLUMN classes.video_path IS 'Path to uploaded video file (legacy support)';
COMMENT ON COLUMN classes.video_url IS 'External video URL (YouTube, Vimeo, etc.)';
COMMENT ON COLUMN classes.video_type IS 'Type of video: upload, youtube, vimeo, external'; 