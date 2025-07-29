-- Migration: Add MUX support to classes table
-- This adds fields to support MUX video hosting and streaming

ALTER TABLE classes 
ADD COLUMN mux_asset_id TEXT,
ADD COLUMN mux_playback_id TEXT,
ADD COLUMN mux_upload_id TEXT,
ADD COLUMN mux_status VARCHAR(20);

-- Update the video_type field to include 'mux' as an option
-- (Note: This doesn't enforce the constraint in PostgreSQL, but documents the intent)
COMMENT ON COLUMN classes.video_type IS 'Video type: upload, youtube, vimeo, external, mux';
COMMENT ON COLUMN classes.mux_asset_id IS 'MUX Asset ID for video hosting';
COMMENT ON COLUMN classes.mux_playback_id IS 'MUX Playback ID for streaming';
COMMENT ON COLUMN classes.mux_upload_id IS 'MUX Upload ID for direct uploads';
COMMENT ON COLUMN classes.mux_status IS 'MUX processing status: preparing, ready, errored';