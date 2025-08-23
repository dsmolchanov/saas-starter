-- Migration: Create favorites table and default "Liked" playlist for all users
-- Created: 2024-12-23
-- Description: Creates favorites functionality and system "Liked" playlist for each user

-- Create favorites table if it doesn't exist
CREATE TABLE IF NOT EXISTS favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_type VARCHAR(20) NOT NULL, -- 'class', 'meditation', 'course'
    item_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, item_type, item_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_item ON favorites(item_type, item_id);

-- Create Liked playlists for all existing users who don't have one
INSERT INTO playlists (user_id, name, description, is_public, is_system, playlist_type, visibility, created_at, updated_at)
SELECT 
    u.id as user_id,
    'Liked' as name,
    'Your favorite classes and meditations' as description,
    0 as is_public,
    1 as is_system,  -- Mark as system playlist
    'liked' as playlist_type,  -- Special type for liked playlist
    'private' as visibility,
    NOW() as created_at,
    NOW() as updated_at
FROM users u
WHERE NOT EXISTS (
    SELECT 1 
    FROM playlists p 
    WHERE p.user_id = u.id 
    AND p.playlist_type = 'liked'
)
ON CONFLICT DO NOTHING;

-- Create a function to automatically create Liked playlist for new users
CREATE OR REPLACE FUNCTION create_liked_playlist_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO playlists (user_id, name, description, is_public, is_system, playlist_type, visibility, created_at, updated_at)
    VALUES (
        NEW.id,
        'Liked',
        'Your favorite classes and meditations',
        0,
        1,
        'liked',
        'private',
        NOW(),
        NOW()
    )
    ON CONFLICT DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create Liked playlist when a new user is created
DROP TRIGGER IF EXISTS create_liked_playlist_on_user_insert ON users;
CREATE TRIGGER create_liked_playlist_on_user_insert
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_liked_playlist_for_user();

-- Create a function to automatically add favorites to Liked playlist
CREATE OR REPLACE FUNCTION add_favorite_to_liked_playlist()
RETURNS TRIGGER AS $$
DECLARE
    v_playlist_id UUID;
    v_max_order INTEGER;
BEGIN
    -- Find the user's Liked playlist
    SELECT id INTO v_playlist_id
    FROM playlists 
    WHERE user_id = NEW.user_id 
    AND playlist_type = 'liked'
    LIMIT 1;
    
    IF v_playlist_id IS NOT NULL THEN
        -- Get the max order index
        SELECT COALESCE(MAX(order_index), -1) + 1 INTO v_max_order
        FROM playlist_items
        WHERE playlist_id = v_playlist_id;
        
        -- Add to playlist
        INSERT INTO playlist_items (playlist_id, item_type, item_id, order_index, added_at)
        VALUES (v_playlist_id, NEW.item_type, NEW.item_id, v_max_order, NOW())
        ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-add favorites to Liked playlist
DROP TRIGGER IF EXISTS add_to_liked_playlist_on_favorite_insert ON favorites;
CREATE TRIGGER add_to_liked_playlist_on_favorite_insert
    AFTER INSERT ON favorites
    FOR EACH ROW
    EXECUTE FUNCTION add_favorite_to_liked_playlist();

-- Create a function to remove from Liked playlist when unfavorited
CREATE OR REPLACE FUNCTION remove_favorite_from_liked_playlist()
RETURNS TRIGGER AS $$
BEGIN
    -- Remove from the user's Liked playlist
    DELETE FROM playlist_items
    WHERE playlist_id IN (
        SELECT id FROM playlists 
        WHERE user_id = OLD.user_id 
        AND playlist_type = 'liked'
    )
    AND item_type = OLD.item_type
    AND item_id = OLD.item_id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to remove from Liked playlist when unfavorited
DROP TRIGGER IF EXISTS remove_from_liked_playlist_on_favorite_delete ON favorites;
CREATE TRIGGER remove_from_liked_playlist_on_favorite_delete
    AFTER DELETE ON favorites
    FOR EACH ROW
    EXECUTE FUNCTION remove_favorite_from_liked_playlist();