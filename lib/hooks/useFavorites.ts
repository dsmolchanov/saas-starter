'use client';

import { useState, useCallback } from 'react';

interface FavoriteItem {
  itemType: 'lesson' | 'course' | 'teacher';
  itemId: number;
}

export function useFavorites() {
  const [isLoading, setIsLoading] = useState(false);

  const toggleFavorite = useCallback(async (item: FavoriteItem, currentIsFavorite: boolean) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemType: item.itemType,
          itemId: item.itemId,
          action: currentIsFavorite ? 'remove' : 'add',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update favorites');
      }

      return await response.json();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToFavorites = useCallback(async (item: FavoriteItem) => {
    return toggleFavorite(item, false);
  }, [toggleFavorite]);

  const removeFromFavorites = useCallback(async (item: FavoriteItem) => {
    return toggleFavorite(item, true);
  }, [toggleFavorite]);

  const getFavorites = useCallback(async () => {
    try {
      const response = await fetch('/api/favorites');
      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  }, []);

  return {
    isLoading,
    toggleFavorite,
    addToFavorites,
    removeFromFavorites,
    getFavorites,
  };
} 