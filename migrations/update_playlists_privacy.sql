-- Migration: Update playlists for privacy and teacher management
-- Created: 2024-12-23
-- Description: Enhance playlists with better privacy controls and teacher ownership

-- Add new columns to playlists table
ALTER TABLE playlists 
ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('private', 'public', 'unlisted')),
ADD COLUMN IF NOT EXISTS total_items INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_duration_min INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Update existing isPublic to new visibility system
UPDATE playlists 
SET visibility = CASE 
    WHEN is_public = 1 THEN 'public'
    ELSE 'private'
END
WHERE visibility IS NULL;

-- Add playlist followers/subscribers table
CREATE TABLE IF NOT EXISTS playlist_followers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followed_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(playlist_id, user_id)
);

-- Add playlist collaborators for shared playlists
CREATE TABLE IF NOT EXISTS playlist_collaborators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('viewer', 'contributor', 'admin')),
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMP DEFAULT NOW(),
    accepted_at TIMESTAMP,
    UNIQUE(playlist_id, user_id)
);

-- Add playlist activity tracking
CREATE TABLE IF NOT EXISTS playlist_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    activity_type VARCHAR(30) NOT NULL, -- 'viewed', 'played', 'shared', 'liked'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_playlists_user ON playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlists_teacher ON playlists(teacher_id);
CREATE INDEX IF NOT EXISTS idx_playlists_visibility ON playlists(visibility);
CREATE INDEX IF NOT EXISTS idx_playlists_featured ON playlists(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_playlist_followers_user ON playlist_followers(user_id);
CREATE INDEX IF NOT EXISTS idx_playlist_followers_playlist ON playlist_followers(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_activity_playlist ON playlist_activity(playlist_id);

-- Add comment
COMMENT ON COLUMN playlists.visibility IS 'Playlist visibility: private (only owner), public (discoverable), unlisted (shareable via link)';
COMMENT ON COLUMN playlists.teacher_id IS 'If set, this playlist is managed by a teacher and appears in their admin';