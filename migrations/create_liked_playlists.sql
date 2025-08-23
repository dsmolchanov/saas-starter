-- Migration: Create default "Liked" playlist for all users
-- Created: 2024-12-23
-- Description: Creates a system "Liked" playlist for each user to store their favorites

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
);

-- Add any existing favorites to the Liked playlists
INSERT INTO playlist_items (playlist_id, item_type, item_id, order_index, added_at)
SELECT 
    p.id as playlist_id,
    f.favorite_type as item_type,
    f.item_id,
    ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY f.created_at DESC) as order_index,
    f.created_at as added_at
FROM favorites f
INNER JOIN playlists p ON p.user_id = f.user_id AND p.playlist_type = 'liked'
WHERE NOT EXISTS (
    SELECT 1 
    FROM playlist_items pi 
    WHERE pi.playlist_id = p.id 
    AND pi.item_type = f.favorite_type 
    AND pi.item_id = f.item_id
);

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
    );
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
BEGIN
    -- Find the user's Liked playlist
    INSERT INTO playlist_items (playlist_id, item_type, item_id, order_index, added_at)
    SELECT 
        p.id,
        NEW.favorite_type,
        NEW.item_id,
        COALESCE(MAX(pi.order_index), 0) + 1,
        NOW()
    FROM playlists p
    LEFT JOIN playlist_items pi ON pi.playlist_id = p.id
    WHERE p.user_id = NEW.user_id 
    AND p.playlist_type = 'liked'
    GROUP BY p.id
    ON CONFLICT DO NOTHING;
    
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
    AND item_type = OLD.favorite_type
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